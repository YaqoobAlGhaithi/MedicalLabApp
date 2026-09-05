/**
 * ReportExportService.ts - الخدمة الرئيسية لمعالجة وتصدير وطباعة ومشاركة التقارير الطبية
 * متوافقة 100% مع بيئات أندرويد (WebView / Capacitor) ومتصفحات الويب الحديثة
 * تتغلب كلياً على خطأ "Attempting to parse an unsupported color function" عبر محرك تصيير SVG الأصلي
 */

import { Capacitor } from '@capacitor/core';
import { Share } from '@capacitor/share';
import * as htmlToImage from 'html-to-image';
import jsPDF from 'jspdf';
import { LabReport } from '../types';
import { ExportFormat, PrintSettingsData, ShareChannel, StoredReportFile } from '../types/printTypes';
import { generatePatientFileName } from '../utils/fileNaming';
import { FileStorageService } from './FileStorageService';

export interface RenderResult {
  blob: Blob;
  dataUrl: string;
  canvas: HTMLCanvasElement;
}

export class ReportExportService {
  /**
   * تصيير عنصر التقرير (DOM Element) إلى Canvas بدقة عالية
   * باستخدام محرك html-to-image لتفادي أخطاء الألوان غير المدعومة (oklch, color-mix)
   */
  static async renderElementToCanvas(
    element: HTMLElement,
    scale = 2.2
  ): Promise<HTMLCanvasElement> {
    try {
      const canvas = await htmlToImage.toCanvas(element, {
        pixelRatio: scale,
        backgroundColor: '#ffffff',
        cacheBust: true,
        filter: (node) => {
          if (node instanceof HTMLElement) {
            if (node.dataset.printIgnore === 'true' || node.classList.contains('no-print')) {
              return false;
            }
          }
          return true;
        },
      });
      return canvas;
    } catch (primaryErr) {
      console.warn('تعذر التصيير عبر html-to-image، محاولة استخدام محرك الاحتياط:', primaryErr);
      
      // محرك بديل خفيف الوزن لتوليد صورة عبر toPng
      const dataUrl = await htmlToImage.toPng(element, {
        pixelRatio: scale,
        backgroundColor: '#ffffff',
      });

      const img = new Image();
      img.src = dataUrl;
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
      });

      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
      }
      return canvas;
    }
  }

  /**
   * تصدير التقرير كصورة بصيغة PNG أو JPG بدقة فائقة
   */
  static async generateImage(
    element: HTMLElement,
    format: 'png' | 'jpg' = 'png',
    quality = 0.98
  ): Promise<RenderResult> {
    const canvas = await this.renderElementToCanvas(element, 2.5);
    const mimeType = format === 'jpg' ? 'image/jpeg' : 'image/png';
    const dataUrl = canvas.toDataURL(mimeType, quality);

    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (b) => {
          if (b) resolve(b);
          else reject(new Error('فشل إنشاء ملف الصورة'));
        },
        mimeType,
        quality
      );
    });

    return { blob, dataUrl, canvas };
  }

  /**
   * تصدير التقرير كملف PDF عالي الجودة متوافق مع مقاسات A4 أو A5
   * يحافظ على أبعاد الصفحة والمطابقة للطباعة الطبية الرسمية
   */
  static async generatePdf(
    element: HTMLElement,
    settings?: Partial<PrintSettingsData>
  ): Promise<{ blob: Blob; dataUrl: string }> {
    const paperSize = settings?.paperSize || 'A4';
    const orientation = settings?.orientation || 'portrait';

    // تصيير التقرير إلى Canvas بدقة عالية
    const canvas = await this.renderElementToCanvas(element, 2.4);
    const imgData = canvas.toDataURL('image/jpeg', 0.98);

    const pdf = new jsPDF({
      orientation: orientation === 'landscape' ? 'l' : 'p',
      unit: 'mm',
      format: paperSize.toLowerCase() as 'a4' | 'a5',
      compress: true,
    });

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    // هوامش احترافية للتقرير الطبي (4 مم من كل جانب)
    const margin = 4;
    const printableWidth = pageWidth - margin * 2;
    const imgHeight = (canvas.height * printableWidth) / canvas.width;

    if (imgHeight <= pageHeight - margin * 2) {
      // يتسع في صفحة واحدة بدقة تامة
      pdf.addImage(imgData, 'JPEG', margin, margin, printableWidth, imgHeight, undefined, 'FAST');
    } else {
      // التقرير متعدد الصفحات
      let remainingHeight = imgHeight;
      let positionY = margin;

      pdf.addImage(imgData, 'JPEG', margin, positionY, printableWidth, imgHeight, undefined, 'FAST');
      remainingHeight -= (pageHeight - margin * 2);

      while (remainingHeight > 0) {
        pdf.addPage(paperSize.toLowerCase(), orientation);
        positionY -= (pageHeight - margin * 2);
        pdf.addImage(imgData, 'JPEG', margin, positionY, printableWidth, imgHeight, undefined, 'FAST');
        remainingHeight -= (pageHeight - margin * 2);
      }
    }

    const blob = pdf.output('blob');
    const dataUrl = pdf.output('dataurlstring');

    return { blob, dataUrl };
  }

  /**
   * حفظ التقرير محلياً في مجلد العيادة المنظم ومزامنته مع السيرفر
   */
  static async saveReport(
    element: HTMLElement,
    report: LabReport,
    format: ExportFormat,
    settings?: Partial<PrintSettingsData>
  ): Promise<StoredReportFile> {
    let fileBlob: Blob;

    if (format === 'pdf') {
      const result = await this.generatePdf(element, settings);
      fileBlob = result.blob;
    } else {
      const result = await this.generateImage(element, format);
      fileBlob = result.blob;
    }

    const storedFile = await FileStorageService.saveReportFile(
      fileBlob,
      report.patientName,
      report.reportDate,
      format,
      report.labNumber
    );

    return storedFile;
  }

  /**
   * مشاركة التقرير الطبي عبر Android Share Intent أو Web Share API
   */
  static async shareReport(
    element: HTMLElement,
    report: LabReport,
    format: ExportFormat,
    channel?: ShareChannel,
    settings?: Partial<PrintSettingsData>
  ): Promise<boolean> {
    // 1. توليد الملف وحفظه أولاً لضمان وجود مسار صالح للمشاركة
    const storedFile = await this.saveReport(element, report, format, settings);
    const shareTitle = `تقرير مخبري: ${report.patientName}`;
    const shareText = `السلام عليكم ورحمة الله،\nمرفق تقرير الفحص المخبري للمريض: ${report.patientName}\nالرقم المخبري: ${report.labNumber}\nتاريخ الفحص: ${report.reportDate}\nعيادة ومختبرات المنار الطبية.`;

    // 2. إذا كان على منصة أندرويد الأصلية
    if (Capacitor.isNativePlatform()) {
      try {
        await Share.share({
          title: shareTitle,
          text: shareText,
          url: storedFile.fileUri || storedFile.filePath,
          dialogTitle: `مشاركة تقرير المريض: ${report.patientName}`,
        });
        return true;
      } catch (nativeErr) {
        console.warn('تعذر فتح نافذة المشاركة الأصلية، الانتقال للخيارات البديلة:', nativeErr);
      }
    }

    // 3. مشاركة عبر المتصفح (Web Share API مع دعم الملفات)
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        // فحص إمكانية مشاركة ملفات حقيقية
        if (storedFile.fileBlob && navigator.canShare && navigator.canShare({ files: [new File([storedFile.fileBlob], storedFile.fileName, { type: storedFile.fileBlob.type })] })) {
          const fileToShare = new File([storedFile.fileBlob], storedFile.fileName, { type: storedFile.fileBlob.type });
          await navigator.share({
            title: shareTitle,
            text: shareText,
            files: [fileToShare],
          });
          return true;
        }

        await navigator.share({
          title: shareTitle,
          text: shareText,
        });
        return true;
      } catch {
        // المستخدم أغلق نافذة المشاركة
      }
    }

    // 4. قنوات المشاركة المباشرة (واتساب، تيليجرام، بريد)
    const encodedText = encodeURIComponent(shareText);

    switch (channel) {
      case 'whatsapp': {
        const phone = report.patientPhone || '';
        const cleanPhone = phone.replace(/[^0-9]/g, '');
        const url = cleanPhone
          ? `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodedText}`
          : `https://api.whatsapp.com/send?text=${encodedText}`;
        window.open(url, '_blank');
        return true;
      }

      case 'telegram': {
        const url = `https://t.me/share/url?url=${encodeURIComponent(window.location.origin)}&text=${encodedText}`;
        window.open(url, '_blank');
        return true;
      }

      case 'email': {
        const subject = encodeURIComponent(`التقرير المخبري - ${report.patientName} (${report.labNumber})`);
        const mailtoUrl = `mailto:?subject=${subject}&body=${encodedText}`;
        window.location.href = mailtoUrl;
        return true;
      }

      default: {
        await FileStorageService.showToast(`تم تجهيز التقرير: ${storedFile.fileName}`);
        return true;
      }
    }
  }

  /**
   * إرسال التقرير للطباعة عبر نافذة طباعة معزولة أو Android Print Spooler
   */
  static async printReport(
    element: HTMLElement,
    settings?: Partial<PrintSettingsData>,
    reportInfo?: { reportId?: string; patientName?: string; labNumber?: string }
  ): Promise<void> {
    const paperSize = settings?.paperSize || 'A4';
    const orientation = settings?.orientation || 'portrait';
    const copies = settings?.copies || 1;

    // تسجيل مهمة الطباعة في الخادم الخلفي لأغراض المراجعة والتوثيق
    try {
      fetch('/api/print/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reportId: reportInfo?.reportId,
          patientName: reportInfo?.patientName,
          labNumber: reportInfo?.labNumber,
          printerName: settings?.printerName || 'Android PrintManager / System Spooler',
          copies,
          paperSize,
          status: 'printed',
        }),
      }).catch(() => {
        // تجاهل أخطاء الخادم الخلفي دون تعطيل الطباعة
      });
    } catch {
      // صامت
    }

    // إنشاء iframe طباعة منعزل لطباعة ورقة التقرير فقط بدون أي عناصر تحكم بالواجهة
    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    iframe.style.zIndex = '-9999';
    document.body.appendChild(iframe);

    const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
    if (iframeDoc) {
      // جلب أنماط الصفحة الحالية
      const styleSheets = Array.from(document.querySelectorAll('style, link[rel="stylesheet"]'))
        .map((s) => s.outerHTML)
        .join('\n');

      iframeDoc.open();
      iframeDoc.write(`
        <!DOCTYPE html>
        <html dir="rtl" lang="ar">
          <head>
            <meta charset="utf-8">
            <title>طباعة تقرير طبي - عيادة ومختبرات المنار</title>
            ${styleSheets}
            <style>
              @page {
                size: ${paperSize} ${orientation};
                margin: 6mm;
              }
              body {
                background: #ffffff !important;
                margin: 0 !important;
                padding: 0 !important;
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
              }
              .official-report-sheet {
                width: 100% !important;
                margin: 0 auto !important;
                box-shadow: none !important;
                border: none !important;
              }
            </style>
          </head>
          <body>
            <div class="official-report-sheet">
              ${element.innerHTML}
            </div>
          </body>
        </html>
      `);
      iframeDoc.close();

      // إتاحة وقت كافٍ للخطوط والصور لتكتمل ثم إطلاق أمر الطباعة
      await new Promise((r) => setTimeout(r, 450));

      for (let i = 0; i < copies; i++) {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
        if (copies > 1 && i < copies - 1) {
          await new Promise((r) => setTimeout(r, 800));
        }
      }

      // إزالة الـ iframe بعد إتمام عملية الطباعة
      setTimeout(() => {
        if (iframe.parentNode) {
          iframe.parentNode.removeChild(iframe);
        }
      }, 3000);
    } else {
      // استدعاء الطباعة العام في حال تعذر إنشاء الـ iframe
      window.print();
    }
  }
}
