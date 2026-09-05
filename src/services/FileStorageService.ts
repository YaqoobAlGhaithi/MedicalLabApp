/**
 * FileStorageService.ts - خدمة التخزين المحلي المنظم لتقارير عيادة ومختبرات المنار
 * مسار التخزين: /AlManarReports/السنة/الشهر/اليوم/اسم_المريض.pdf
 */

import { Browser } from '@capacitor/browser';
import { Capacitor } from '@capacitor/core';
import { Directory, Filesystem } from '@capacitor/filesystem';
import { Toast } from '@capacitor/toast';
import { saveAs } from 'file-saver';
import { ExportFormat, StoredReportFile } from '../types/printTypes';
import { generatePatientFileName, getOrganizedStoragePath } from '../utils/fileNaming';

const METADATA_KEY = 'almanar_stored_reports_metadata_v1';
const IDB_NAME = 'AlManarReportDB';
const IDB_STORE = 'reportFiles';

// فتح أو إنشاء قاعدة بيانات IndexedDB لحفظ الملفات الثنائية في بيئة الويب دون إنترنت
function getIndexedDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      return reject(new Error('IndexedDB غير مدعوم في هذا المتصفح'));
    }
    const request = indexedDB.open(IDB_NAME, 1);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(IDB_STORE)) {
        db.createObjectStore(IDB_STORE, { keyPath: 'id' });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/**
 * تحويل Blob إلى صيغة Base64 لحفظها في أنظمة ملفات Capacitor
 */
function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = () => {
      const dataUrl = reader.result as string;
      // استخراج جزء الـ base64 فقط دون ترويسة data:...;base64,
      const base64 = dataUrl.split(',')[1] || '';
      resolve(base64);
    };
    reader.readAsDataURL(blob);
  });
}

export class FileStorageService {
  /**
   * إشعار المستخدم بنجاح أو فشل العملية (عبر Capacitor Toast أو Console)
   */
  static async showToast(message: string): Promise<void> {
    try {
      if (Capacitor.isNativePlatform()) {
        await Toast.show({
          text: message,
          duration: 'short',
          position: 'bottom',
        });
      }
    } catch {
      // التجاهل الصامت في حال عدم توافر Toast على الويب
    }
  }

  /**
   * طلب أذونات التخزين في بيئة أندرويد
   */
  static async checkAndRequestPermissions(): Promise<boolean> {
    if (!Capacitor.isNativePlatform()) return true;
    try {
      const status = await Filesystem.checkPermissions();
      if (status.publicStorage !== 'granted') {
        const req = await Filesystem.requestPermissions();
        return req.publicStorage === 'granted';
      }
      return true;
    } catch (e) {
      console.warn('تعذر طلب أذونات التخزين:', e);
      return true;
    }
  }

  /**
   * حفظ ملف التقرير المنشأ في المجلد المنظم: /AlManarReports/السنة/الشهر/اليوم/اسم_المريض
   */
  static async saveReportFile(
    fileBlob: Blob,
    patientName: string,
    dateStr: string,
    format: ExportFormat,
    labNumber: string
  ): Promise<StoredReportFile> {
    const fileName = generatePatientFileName(patientName, format);
    const pathInfo = getOrganizedStoragePath(dateStr, fileName);
    const fileId = `file_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    let fileUri = '';

    if (Capacitor.isNativePlatform()) {
      await this.checkAndRequestPermissions();

      try {
        // إنشاء المجلدات المتداخلة إذا لم تكن موجودة
        await Filesystem.mkdir({
          path: pathInfo.directory,
          directory: Directory.Documents,
          recursive: true,
        }).catch(() => {
          // المجلد قد يكون موجوداً بالفعل
        });

        const base64Data = await blobToBase64(fileBlob);

        // حفظ الملف في المستندات
        const result = await Filesystem.writeFile({
          path: pathInfo.relativeFilePath,
          data: base64Data,
          directory: Directory.Documents,
          recursive: true,
        });

        fileUri = result.uri;
      } catch (err) {
        console.error('فشل الحفظ عبر Capacitor Filesystem، سيتم استخدام التنزيل الاحتياطي:', err);
      }
    } else {
      // بيئة الويب: تنزيل مباشر باستخدام file-saver
      saveAs(fileBlob, fileName);

      // حفظ النسخة الثنائية في IndexedDB لتصفحها والوصول إليها لاحقاً بدون إنترنت
      try {
        const db = await getIndexedDB();
        const tx = db.transaction(IDB_STORE, 'readwrite');
        const store = tx.objectStore(IDB_STORE);
        store.put({
          id: fileId,
          blob: fileBlob,
          fileName,
          mimeType: fileBlob.type,
        });
      } catch (idbErr) {
        console.warn('تعذر الحفظ في IndexedDB:', idbErr);
      }
    }

    let serverUrl: string | undefined;

    // محاولة رفع ومزامنة التقرير مع الخادم الخلفي بشكل غير متزامن
    try {
      const base64Data = await blobToBase64(fileBlob);
      fetch('/api/files/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileName,
          base64Data,
          mimeType: fileBlob.type,
          patientName,
          labNumber,
        }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.fileUrl) {
            serverUrl = data.fileUrl;
          }
        })
        .catch(() => {
          // استمرار عمل التخزين المحلي في حال عدم توفر الخادم
        });
    } catch {
      // صامت
    }

    const storedFile: StoredReportFile = {
      id: fileId,
      fileName,
      filePath: pathInfo.relativeFilePath,
      fileUri,
      serverUrl,
      fileBlob,
      fileSize: fileBlob.size,
      createdAt: new Date().toISOString(),
      patientName,
      labNumber,
      format,
      year: pathInfo.year,
      month: pathInfo.month,
      day: pathInfo.day,
    };

    // تحديث قائمة الميتاداتا في LocalStorage
    this.appendFileMetadata(storedFile);
    await this.showToast(`تم حفظ التقرير: ${fileName}`);

    return storedFile;
  }

  /**
   * استرجاع قائمة جميع التقارير المخزنة محلياً
   */
  static async listStoredFiles(): Promise<StoredReportFile[]> {
    try {
      const raw = localStorage.getItem(METADATA_KEY);
      if (!raw) return [];
      const parsed: StoredReportFile[] = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      console.error('خطأ في قراءة ملفات التقارير المخزنة:', e);
      return [];
    }
  }

  /**
   * حذف ملف محدد من التخزين وقائمة الميتاداتا
   */
  static async deleteStoredFile(id: string): Promise<boolean> {
    try {
      const files = await this.listStoredFiles();
      const target = files.find((f) => f.id === id);

      if (target) {
        if (Capacitor.isNativePlatform()) {
          try {
            await Filesystem.deleteFile({
              path: target.filePath,
              directory: Directory.Documents,
            });
          } catch (delErr) {
            console.warn('تعذر حذف الملف الفعلي من القرص:', delErr);
          }
        } else {
          // حذف من IndexedDB
          try {
            const db = await getIndexedDB();
            const tx = db.transaction(IDB_STORE, 'readwrite');
            tx.objectStore(IDB_STORE).delete(id);
          } catch {
            // صامت
          }
        }

        const filtered = files.filter((f) => f.id !== id);
        localStorage.setItem(METADATA_KEY, JSON.stringify(filtered));
        await this.showToast(`تم حذف التقرير ${target.fileName}`);
        return true;
      }
      return false;
    } catch (e) {
      console.error('فشل حذف الملف:', e);
      return false;
    }
  }

  /**
   * فتح الملف المخزن عبر مستعرض النظام أو نافذة جديدة
   */
  static async openStoredFile(file: StoredReportFile): Promise<void> {
    if (Capacitor.isNativePlatform() && file.fileUri) {
      try {
        await Browser.open({ url: file.fileUri });
        return;
      } catch (err) {
        console.warn('تعذر فتح الملف بالمتصفح، جاري محاولة قراءة الملف:', err);
      }
    }

    // بيئة الويب أو في حال تعذر الفتح المباشر
    try {
      const db = await getIndexedDB();
      const tx = db.transaction(IDB_STORE, 'readonly');
      const store = tx.objectStore(IDB_STORE);
      const req = store.get(file.id);

      req.onsuccess = () => {
        if (req.result && req.result.blob) {
          const url = URL.createObjectURL(req.result.blob);
          window.open(url, '_blank');
        } else {
          alert(`الملف مسجل بالمسار: ${file.filePath}`);
        }
      };
      req.onerror = () => {
        alert(`الملف مسجل بالمسار: ${file.filePath}`);
      };
    } catch {
      alert(`الملف مسجل بالمسار: ${file.filePath}`);
    }
  }

  /**
   * إعادة تنزيل الملف المخزن إلى جهاز المستخدم
   */
  static async downloadStoredFile(file: StoredReportFile): Promise<void> {
    try {
      const db = await getIndexedDB();
      const tx = db.transaction(IDB_STORE, 'readonly');
      const req = tx.objectStore(IDB_STORE).get(file.id);

      req.onsuccess = () => {
        if (req.result && req.result.blob) {
          saveAs(req.result.blob, file.fileName);
        } else {
          alert('تعذر استخراج المحتوى الثنائي للملف من الذاكرة المحلية.');
        }
      };
    } catch (e) {
      console.error('خطأ في إعادة تنزيل الملف:', e);
    }
  }

  private static appendFileMetadata(newFile: StoredReportFile): void {
    try {
      const raw = localStorage.getItem(METADATA_KEY);
      const current: StoredReportFile[] = raw ? JSON.parse(raw) : [];
      // وضع الملف الأحدث في بداية القائمة
      const updated = [newFile, ...current.filter((f) => f.id !== newFile.id)];
      localStorage.setItem(METADATA_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error('خطأ في حفظ ميتاداتا التقارير:', e);
    }
  }
}
