/**
 * PrintExportModal.tsx - النافذة الشاملة للمعاينة والطباعة والتصدير والمشاركة
 * تتضمن:
 * 1. معاينة التقرير مع التكبير/التصغير (Zoom) ووضع ملء الشاشة (Fullscreen)
 * 2. إعدادات الطباعة المباشرة وقائمة الطابعات والنسخ وحجم الورق
 * 3. مشاركة التقرير على خطوتين (صيغة الملف + اختيار التطبيق)
 * 4. الحفظ المحلي في /AlManarReports/السنة/الشهر/اليوم/اسم_المريض
 * 5. تصفح وإدارة أرشيف الملفات المخزنة محلياً
 */

import {
  CheckCircle2,
  Clock,
  Download,
  Eye,
  FileDown,
  FolderArchive,
  HardDrive,
  Maximize2,
  Minimize2,
  Printer,
  RefreshCw,
  Search,
  Share2,
  Trash2,
  X,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useReportExport } from '../../hooks/useReportExport';
import { LabReport } from '../../types';
import { ExportFormat, PrintSettingsData, ShareChannel, StoredReportFile } from '../../types/printTypes';
import { generatePatientFileName } from '../../utils/fileNaming';
import { OfficialReportSheet } from './OfficialReportSheet';
import { PrintSettings } from './PrintSettings';
import { ShareMenu } from './ShareMenu';

interface PrintExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  report?: LabReport | null;
}

type ActiveTab = 'preview' | 'print' | 'share' | 'save' | 'archive';

export const PrintExportModal: React.FC<PrintExportModalProps> = ({
  isOpen,
  onClose,
  report: propReport,
}) => {
  const { currentReport, reports, settings } = useApp();
  const report = propReport || currentReport || reports[0];

  const reportSheetRef = useRef<HTMLDivElement>(null);
  const previewContainerRef = useRef<HTMLDivElement>(null);

  // حالة التبويب النشط
  const [activeTab, setActiveTab] = useState<ActiveTab>('preview');

  // حالة المعاينة والتحكم بالعرض
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  // إعدادات الطباعة
  const [printSettings, setPrintSettings] = useState<PrintSettingsData>(() => {
    const saved = localStorage.getItem('almanar_default_print_settings');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // تجاهل
      }
    }
    return {
      printerName: settings.defaultPrinter || 'HP LaserJet Pro MFP M428fdw',
      copies: 1,
      paperSize: 'A4',
      orientation: 'portrait',
      colorMode: 'color',
      includeHeader: true,
      includeFooter: true,
      scale: 100,
    };
  });

  // حالة صيغة الحفظ السريع
  const [saveFormat, setSaveFormat] = useState<ExportFormat>('pdf');
  const [archiveSearch, setArchiveSearch] = useState('');

  // استدعاء الخطاف المخصص للخدمات
  const {
    progressState,
    isExporting,
    storedFiles,
    saveReport,
    shareReport,
    printReport,
    deleteStoredFile,
    openStoredFile,
    downloadStoredFile,
  } = useReportExport();

  // إعادة ضبط التكبير عند فتح النافذة
  useEffect(() => {
    if (isOpen) {
      setZoomLevel(100);
      setIsFullscreen(false);
    }
  }, [isOpen]);

  if (!isOpen || !report) return null;

  // اسم الملف وفق الشرط الدقيق: اسم الملف = اسم المريض كما هو مكتوب في التقرير
  const currentFileName = generatePatientFileName(report.patientName, saveFormat);

  // التحكم بالتكبير
  const handleZoomIn = () => setZoomLevel((prev) => Math.min(200, prev + 15));
  const handleZoomOut = () => setZoomLevel((prev) => Math.max(50, prev - 15));
  const handleZoomReset = () => setZoomLevel(100);

  // التبديل إلى ملء الشاشة
  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  // تنفيذ الحفظ المباشر
  const handleExecuteSave = async (format: ExportFormat = saveFormat) => {
    if (!reportSheetRef.current) return;
    await saveReport(reportSheetRef.current, report, format, printSettings);
  };

  // تنفيذ المشاركة المباشرة
  const handleExecuteShare = async (format: ExportFormat, channel: ShareChannel) => {
    if (!reportSheetRef.current) return;
    await shareReport(reportSheetRef.current, report, format, channel, printSettings);
  };

  // تنفيذ الطباعة المباشرة
  const handleExecutePrint = async () => {
    if (!reportSheetRef.current) return;
    await printReport(reportSheetRef.current, printSettings, {
      reportId: report.id,
      patientName: report.patientName,
      labNumber: report.labNumber,
    });
  };

  // تصفية ملفات الأرشيف المحلي
  const filteredArchive = storedFiles.filter(
    (f) =>
      f.patientName.toLowerCase().includes(archiveSearch.toLowerCase()) ||
      f.fileName.toLowerCase().includes(archiveSearch.toLowerCase()) ||
      f.labNumber.toLowerCase().includes(archiveSearch.toLowerCase())
  );

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 select-none dir-rtl"
      dir="rtl"
    >
      <div
        className={`bg-white rounded-3xl shadow-2xl border border-slate-200 w-full flex flex-col overflow-hidden transition-all duration-300 ${
          isFullscreen ? 'fixed inset-0 rounded-none z-50' : 'max-w-6xl max-h-[94vh] h-[92vh]'
        }`}
      >
        {/* ======================= شريط العنوان والبيانات الأساسية ======================= */}
        <div className="bg-gradient-to-r from-[#0b3b8c] via-[#0b3b8c] to-[#002e5b] text-white p-3.5 sm:p-4 flex flex-wrap items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-white/10 text-white">
              <Printer className="w-5 h-5 text-blue-200" />
            </div>
            <div>
              <h3 className="font-black text-sm sm:text-base flex items-center gap-2">
                <span>📄 معاينة وتصدير التقرير الطبي</span>
                <span className="bg-blue-500/30 text-blue-100 text-[11px] px-2 py-0.5 rounded-full font-bold">
                  بدون إنترنت
                </span>
              </h3>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-blue-100 mt-0.5 font-medium">
                <span>
                  اسم المريض: <strong className="text-white font-bold">{report.patientName}</strong>
                </span>
                <span>•</span>
                <span>
                  رقم التقرير: <strong className="text-amber-300 font-mono font-bold">{report.labNumber}</strong>
                </span>
                <span>•</span>
                <span>
                  التاريخ: <strong className="text-white font-mono">{report.reportDate}</strong>
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={toggleFullscreen}
              title={isFullscreen ? 'تصغير العرض' : 'عرض كامل'}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl bg-white/10 hover:bg-red-500 text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* ======================= شريط التبويبات العلوية ======================= */}
        <div className="bg-slate-100 border-b border-slate-200 px-3 sm:px-5 py-2 flex items-center justify-between gap-2 overflow-x-auto shrink-0">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              type="button"
              onClick={() => setActiveTab('preview')}
              className={`px-3.5 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all whitespace-nowrap ${
                activeTab === 'preview'
                  ? 'bg-[#0b3b8c] text-white shadow-xs'
                  : 'bg-white text-slate-700 hover:bg-slate-200 border border-slate-200'
              }`}
            >
              <Eye className="w-4 h-4" />
              <span>معاينة التقرير</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('print')}
              className={`px-3.5 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all whitespace-nowrap ${
                activeTab === 'print'
                  ? 'bg-[#0b3b8c] text-white shadow-xs'
                  : 'bg-white text-slate-700 hover:bg-slate-200 border border-slate-200'
              }`}
            >
              <Printer className="w-4 h-4" />
              <span>إعدادات الطباعة</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('share')}
              className={`px-3.5 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all whitespace-nowrap ${
                activeTab === 'share'
                  ? 'bg-[#0b3b8c] text-white shadow-xs'
                  : 'bg-white text-slate-700 hover:bg-slate-200 border border-slate-200'
              }`}
            >
              <Share2 className="w-4 h-4" />
              <span>المشاركة السريعة</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('save')}
              className={`px-3.5 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all whitespace-nowrap ${
                activeTab === 'save'
                  ? 'bg-[#0b3b8c] text-white shadow-xs'
                  : 'bg-white text-slate-700 hover:bg-slate-200 border border-slate-200'
              }`}
            >
              <FileDown className="w-4 h-4" />
              <span>حفظ وتصدير</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('archive')}
              className={`px-3.5 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all whitespace-nowrap ${
                activeTab === 'archive'
                  ? 'bg-[#0b3b8c] text-white shadow-xs'
                  : 'bg-white text-slate-700 hover:bg-slate-200 border border-slate-200'
              }`}
            >
              <FolderArchive className="w-4 h-4" />
              <span>الأرشيف المحلي ({storedFiles.length})</span>
            </button>
          </div>

          {/* أزرار التكبير في وضع المعاينة */}
          {activeTab === 'preview' && (
            <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-xl p-1 shrink-0">
              <button
                type="button"
                onClick={handleZoomOut}
                className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-600 transition-colors"
                title="تصغير"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={handleZoomReset}
                className="px-2 py-1 text-[11px] font-bold font-mono text-[#0b3b8c] hover:bg-slate-100 rounded-lg"
                title="إعادة التعيين"
              >
                {zoomLevel}%
              </button>
              <button
                type="button"
                onClick={handleZoomIn}
                className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-600 transition-colors"
                title="تكبير"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* ======================= جسم النافذة الرئيسي ======================= */}
        <div className="flex-1 overflow-hidden flex flex-col md:flex-row bg-slate-100">
          {/* الجانب الأيمن / الرئيسي: عرض التقرير الطبي بصورته النهائية */}
          <div
            ref={previewContainerRef}
            className={`flex-1 overflow-auto p-3 sm:p-6 flex justify-center items-start ${
              activeTab !== 'preview' ? 'hidden md:flex md:w-1/2 lg:w-3/5 border-l border-slate-200' : 'w-full'
            }`}
          >
            <div
              style={{
                transform: `scale(${zoomLevel / 100})`,
                transformOrigin: 'top center',
                transition: 'transform 0.15s ease-out',
              }}
              className="w-full max-w-[794px] transition-transform"
            >
              <OfficialReportSheet ref={reportSheetRef} report={report} settings={settings} />
            </div>
          </div>

          {/* الجانب الأيسر: لوحات التحكم (الإعدادات / المشاركة / الحفظ / الأرشيف) */}
          {activeTab !== 'preview' && (
            <div className="w-full md:w-1/2 lg:w-2/5 p-4 sm:p-6 overflow-y-auto bg-white flex flex-col justify-between">
              <div>
                {/* 1. لوحة إعدادات الطباعة */}
                {activeTab === 'print' && (
                  <div>
                    <h4 className="font-black text-slate-900 text-sm mb-4 flex items-center gap-2">
                      <Printer className="w-4 h-4 text-[#0b3b8c]" />
                      <span>إعدادات وخيارات الطباعة المباشرة</span>
                    </h4>
                    <PrintSettings settings={printSettings} onChange={setPrintSettings} />
                    <div className="mt-6 pt-4 border-t border-slate-200">
                      <button
                        type="button"
                        onClick={handleExecutePrint}
                        disabled={isExporting}
                        className="w-full py-3.5 bg-[#0b3b8c] hover:bg-[#002e5b] text-white font-extrabold rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 text-sm disabled:opacity-50"
                      >
                        <Printer className="w-4 h-4" />
                        <span>طباعة فورية عبر الطابعة ({printSettings.copies} نسخ)</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* 2. لوحة قائمة المشاركة */}
                {activeTab === 'share' && (
                  <div>
                    <h4 className="font-black text-slate-900 text-sm mb-4 flex items-center gap-2">
                      <Share2 className="w-4 h-4 text-[#0b3b8c]" />
                      <span>مشاركة التقرير مع المريض أو الطبيب</span>
                    </h4>
                    <ShareMenu onShare={handleExecuteShare} isSharing={isExporting} />
                  </div>
                )}

                {/* 3. لوحة الحفظ والتصدير المحلي */}
                {activeTab === 'save' && (
                  <div className="space-y-5">
                    <h4 className="font-black text-slate-900 text-sm mb-2 flex items-center gap-2">
                      <FileDown className="w-4 h-4 text-[#0b3b8c]" />
                      <span>تصدير وحفظ التقرير محلياً على الجهاز</span>
                    </h4>

                    {/* تنبيه مسار الحفظ المنظم */}
                    <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-2xl text-xs space-y-1">
                      <p className="font-bold text-[#0b3b8c] flex items-center gap-1.5">
                        <HardDrive className="w-4 h-4 shrink-0" />
                        <span>مسار التخزين المنظم للعيادة:</span>
                      </p>
                      <p className="font-mono text-slate-700 dir-ltr text-right bg-white p-2 rounded-xl border border-blue-100">
                        /AlManarReports/{new Date().getFullYear()}/
                        {String(new Date().getMonth() + 1).padStart(2, '0')}/
                        {String(new Date().getDate()).padStart(2, '0')}/{currentFileName}
                      </p>
                      <p className="text-[11px] text-slate-500 mt-1">
                        * اسم الملف مطابق تماماً لاسم المريض المسجل في التقرير.
                      </p>
                    </div>

                    <div>
                      <label className="font-bold text-slate-700 block mb-2">اختر صيغة التصدير المطلوبة</label>
                      <div className="grid grid-cols-3 gap-2">
                        {(['pdf', 'png', 'jpg'] as ExportFormat[]).map((fmt) => (
                          <button
                            key={fmt}
                            type="button"
                            onClick={() => setSaveFormat(fmt)}
                            className={`py-3 px-2 rounded-xl border text-xs font-black transition-all uppercase font-mono ${
                              saveFormat === fmt
                                ? 'bg-[#0b3b8c] text-white border-[#0b3b8c] shadow-xs'
                                : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                            }`}
                          >
                            {fmt}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="pt-2">
                      <button
                        type="button"
                        onClick={() => handleExecuteSave(saveFormat)}
                        disabled={isExporting}
                        className="w-full py-3.5 bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 text-sm disabled:opacity-50"
                      >
                        <Download className="w-4 h-4" />
                        <span>{isExporting ? 'جاري الحفظ...' : `حفظ وتنزيل ${saveFormat.toUpperCase()}`}</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* 4. لوحة أرشيف الملفات المخزنة محلياً */}
                {activeTab === 'archive' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-black text-slate-900 text-sm flex items-center gap-2">
                        <FolderArchive className="w-4 h-4 text-[#0b3b8c]" />
                        <span>تقارير مجلد /AlManarReports/</span>
                      </h4>
                      <span className="text-[11px] text-slate-500 font-bold font-mono">
                        {storedFiles.length} ملف مخزن
                      </span>
                    </div>

                    {/* شريط البحث في الأرشيف */}
                    <div className="relative">
                      <input
                        type="text"
                        value={archiveSearch}
                        onChange={(e) => setArchiveSearch(e.target.value)}
                        placeholder="ابحث باسم المريض أو رقم التقرير..."
                        className="w-full px-3.5 py-2 pl-9 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none focus:border-[#0b3b8c]"
                      />
                      <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    </div>

                    {/* قائمة الملفات المخزنة */}
                    <div className="space-y-2 max-h-[420px] overflow-y-auto pr-0.5">
                      {filteredArchive.length === 0 ? (
                        <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-slate-500 text-xs">
                          لا توجد تقارير محفوظة مطابقة حتى الآن.
                        </div>
                      ) : (
                        filteredArchive.map((file) => (
                          <div
                            key={file.id}
                            className="p-3 bg-slate-50 hover:bg-blue-50/50 border border-slate-200 rounded-2xl transition-all flex items-center justify-between gap-3 text-xs"
                          >
                            <div className="flex-1 min-w-0">
                              <p className="font-black text-slate-900 truncate">{file.fileName}</p>
                              <div className="flex items-center gap-2 text-[10px] text-slate-500 mt-1">
                                <span className="font-mono text-[#0b3b8c] font-bold">{file.labNumber}</span>
                                <span>•</span>
                                <span>{file.year}/{file.month}/{file.day}</span>
                                <span>•</span>
                                <span className="uppercase font-mono font-bold bg-slate-200 px-1.5 py-0.5 rounded text-slate-700">
                                  {file.format}
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center gap-1 shrink-0">
                              <button
                                type="button"
                                onClick={() => openStoredFile(file)}
                                title="فتح"
                                className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 hover:text-[#0b3b8c] transition-colors"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => downloadStoredFile(file)}
                                title="تنزيل"
                                className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 hover:text-emerald-700 transition-colors"
                              >
                                <Download className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => deleteStoredFile(file.id)}
                                title="حذف"
                                className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 hover:text-red-600 transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* ======================= الشريط السفلي الثابت (Action Bar) ======================= */}
        <div className="p-3 sm:p-4 bg-white border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 shrink-0">
          {/* اسم الملف التلقائي */}
          <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
            <span className="text-slate-500">اسم الملف:</span>
            <span className="bg-slate-100 text-[#0b3b8c] px-2.5 py-1 rounded-xl font-mono text-[11px] border border-slate-200">
              {currentFileName}
            </span>
            {progressState.message && (
              <span className="text-emerald-700 font-bold text-[11px] flex items-center gap-1 animate-pulse">
                <CheckCircle2 className="w-3.5 h-3.5" />
                {progressState.message}
              </span>
            )}
          </div>

          {/* أزرار الإجراءات السريعة */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleExecuteSave('pdf')}
              disabled={isExporting}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors disabled:opacity-50"
            >
              <Download className="w-3.5 h-3.5" />
              <span>حفظ</span>
            </button>

            <button
              type="button"
              onClick={() => handleExecuteShare('pdf', 'native_intent')}
              disabled={isExporting}
              className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors disabled:opacity-50"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>مشاركة</span>
            </button>

            <button
              type="button"
              onClick={handleExecutePrint}
              disabled={isExporting}
              className="px-5 py-2 bg-[#0b3b8c] hover:bg-[#002e5b] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors disabled:opacity-50"
            >
              <Printer className="w-3.5 h-3.5 text-blue-200" />
              <span>طباعة</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
