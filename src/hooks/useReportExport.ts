/**
 * useReportExport.ts - خطاف مخصص لإدارة عمليات الطباعة، التصدير، الحفظ والمشاركة
 */

import { useCallback, useEffect, useState } from 'react';
import { LabReport } from '../types';
import { ExportFormat, ExportProgressState, PrintSettingsData, ShareChannel, StoredReportFile } from '../types/printTypes';
import { FileStorageService } from '../services/FileStorageService';
import { ReportExportService } from '../services/ReportExportService';

export function useReportExport() {
  const [progressState, setProgressState] = useState<ExportProgressState>({ status: 'idle' });
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [storedFiles, setStoredFiles] = useState<StoredReportFile[]>([]);

  // تحميل قائمة الملفات المخزنة محلياً
  const refreshStoredFiles = useCallback(async () => {
    try {
      const files = await FileStorageService.listStoredFiles();
      setStoredFiles(files);
    } catch (e) {
      console.error('فشل جلب قائمة الملفات المخزنة:', e);
    }
  }, []);

  useEffect(() => {
    refreshStoredFiles();
  }, [refreshStoredFiles]);

  /**
   * حفظ التقرير في المجلد المنظم /AlManarReports/
   */
  const saveReport = useCallback(
    async (
      element: HTMLElement,
      report: LabReport,
      format: ExportFormat = 'pdf',
      settings?: Partial<PrintSettingsData>
    ): Promise<StoredReportFile | null> => {
      setProgressState({ status: 'saving', message: `جاري حفظ التقرير بصيغة ${format.toUpperCase()}...` });
      setErrorMessage(null);
      setSuccessMessage(null);

      try {
        const file = await ReportExportService.saveReport(element, report, format, settings);
        setProgressState({ status: 'success', message: `تم حفظ التقرير بنجاح: ${file.fileName}` });
        setSuccessMessage(`تم الحفظ في: ${file.filePath}`);
        await refreshStoredFiles();
        return file;
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'حدث خطأ أثناء حفظ التقرير';
        setProgressState({ status: 'error', message: msg });
        setErrorMessage(msg);
        return null;
      } finally {
        setTimeout(() => {
          setProgressState((prev) => (prev.status === 'success' ? { status: 'idle' } : prev));
        }, 3000);
      }
    },
    [refreshStoredFiles]
  );

  /**
   * مشاركة التقرير الطبي
   */
  const shareReport = useCallback(
    async (
      element: HTMLElement,
      report: LabReport,
      format: ExportFormat = 'pdf',
      channel?: ShareChannel,
      settings?: Partial<PrintSettingsData>
    ): Promise<boolean> => {
      setProgressState({ status: 'sharing', message: 'جاري تجهيز التقرير للمشاركة...' });
      setErrorMessage(null);
      setSuccessMessage(null);

      try {
        const result = await ReportExportService.shareReport(element, report, format, channel, settings);
        setProgressState({ status: 'success', message: 'تم فتح خيارات المشاركة بنجاح' });
        setSuccessMessage('تمت المشاركة بنجاح');
        await refreshStoredFiles();
        return result;
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'حدث خطأ أثناء مشاركة التقرير';
        setProgressState({ status: 'error', message: msg });
        setErrorMessage(msg);
        return false;
      } finally {
        setTimeout(() => {
          setProgressState((prev) => (prev.status === 'success' ? { status: 'idle' } : prev));
        }, 3000);
      }
    },
    [refreshStoredFiles]
  );

  /**
   * طباعة التقرير الطبي
   */
  const printReport = useCallback(
    async (
      element: HTMLElement,
      settings?: Partial<PrintSettingsData>,
      reportInfo?: { reportId?: string; patientName?: string; labNumber?: string }
    ): Promise<void> => {
      setProgressState({ status: 'rendering', message: 'جاري إرسال أمر الطباعة...' });
      try {
        await ReportExportService.printReport(element, settings, reportInfo);
        setProgressState({ status: 'idle' });
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'تعذر إرسال أمر الطباعة';
        setProgressState({ status: 'error', message: msg });
        setErrorMessage(msg);
      }
    },
    []
  );

  /**
   * حذف ملف مخزن
   */
  const deleteStoredFile = useCallback(
    async (id: string): Promise<boolean> => {
      const res = await FileStorageService.deleteStoredFile(id);
      if (res) {
        await refreshStoredFiles();
      }
      return res;
    },
    [refreshStoredFiles]
  );

  /**
   * فتح ملف مخزن في المتصفح أو تطبيق النظام
   */
  const openStoredFile = useCallback(async (file: StoredReportFile): Promise<void> => {
    await FileStorageService.openStoredFile(file);
  }, []);

  /**
   * تنزيل ملف مخزن
   */
  const downloadStoredFile = useCallback(async (file: StoredReportFile): Promise<void> => {
    await FileStorageService.downloadStoredFile(file);
  }, []);

  return {
    progressState,
    isExporting: progressState.status === 'rendering' || progressState.status === 'saving' || progressState.status === 'sharing',
    errorMessage,
    successMessage,
    storedFiles,
    refreshStoredFiles,
    saveReport,
    shareReport,
    printReport,
    deleteStoredFile,
    openStoredFile,
    downloadStoredFile,
  };
}
