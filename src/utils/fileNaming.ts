/**
 * fileNaming.ts - دوال تسمية الملفات وتنظيم المسارات للتقارير الطبية
 */

import { ExportFormat } from '../types/printTypes';

/**
 * تعقيم اسم الملف لإزالة الأحرف المحظورة في أنظمة التشغيل (Windows/Android/Linux)
 * مع الحفاظ الكامل على الحروف العربية والمسافات والأرقام.
 */
export function sanitizeFileName(name: string): string {
  if (!name || !name.trim()) {
    return 'تقرير_طبي_بدون_اسم';
  }

  return name
    .trim()
    // إزالة الأحرف المحظورة في مسارات أنظمة التشغيل: \ / : * ? " < > |
    .replace(/[\\/:*?"<>|]/g, '')
    // استبدال المسافات المكررة بمسافة واحدة
    .replace(/\s+/g, ' ');
}

/**
 * إنشاء اسم الملف النهائي استناداً إلى اسم المريض كما هو مدخل في التقرير
 * مثال: إذا كان اسم المريض "يعقوب خالد عبده الغيثي"، يكون اسم الملف:
 * "يعقوب خالد عبده الغيثي.pdf"
 */
export function generatePatientFileName(patientName: string, format: ExportFormat): string {
  const cleanName = sanitizeFileName(patientName);
  const ext = format === 'jpg' ? 'jpg' : format;
  return `${cleanName}.${ext}`;
}

/**
 * تحليل تاريخ التقرير (أو التاريخ الحالي) وتوليد بنية المجلدات المنظمة:
 * /AlManarReports/السنة/الشهر/اليوم/اسم_الملف
 */
export function getOrganizedStoragePath(
  dateStr: string | undefined,
  fileName: string
): {
  baseDir: string;
  directory: string;
  relativeFilePath: string;
  year: string;
  month: string;
  day: string;
} {
  const date = dateStr ? new Date(dateStr) : new Date();
  const validDate = isNaN(date.getTime()) ? new Date() : date;

  const year = validDate.getFullYear().toString();
  const month = (validDate.getMonth() + 1).toString().padStart(2, '0');
  const day = validDate.getDate().toString().padStart(2, '0');

  const baseDir = 'AlManarReports';
  const directory = `${baseDir}/${year}/${month}/${day}`;
  const relativeFilePath = `${directory}/${fileName}`;

  return {
    baseDir,
    directory,
    relativeFilePath,
    year,
    month,
    day,
  };
}
