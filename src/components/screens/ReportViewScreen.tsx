/**
 * ReportViewScreen.tsx - شاشة عرض ومعاينة التقرير الطبي الرسمي
 * متكاملة مع نظام الطباعة والتصدير الشامل والمجلد المنظم /AlManarReports/
 */

import { Edit, FileDown, Printer, Save, Share2 } from 'lucide-react';
import React, { useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { useReportExport } from '../../hooks/useReportExport';
import { Header } from '../common/Header';
import { OfficialReportSheet } from '../print/OfficialReportSheet';

export const ReportViewScreen: React.FC = () => {
  const { currentReport, reports, setActiveScreen, setPrintModalOpen, settings } = useApp();
  const report = currentReport || reports[0];
  const reportRef = useRef<HTMLDivElement>(null);

  const { saveReport, isExporting, progressState, successMessage } = useReportExport();

  if (!report) {
    return (
      <div
        className="min-h-screen bg-slate-100 flex flex-col items-center justify-center p-6 text-slate-600 dir-rtl pb-28 md:pb-8"
        dir="rtl"
      >
        <p className="text-lg font-bold">لا يوجد تقرير طبي لعرضه حالياً.</p>
        <button
          type="button"
          onClick={() => setActiveScreen('dashboard')}
          className="mt-4 px-6 py-2 bg-[#0b3b8c] text-white rounded-xl font-bold"
        >
          العودة للرئيسية
        </button>
      </div>
    );
  }

  const handleQuickSave = async () => {
    if (!reportRef.current) return;
    await saveReport(reportRef.current, report, 'pdf');
  };

  return (
    <div className="min-h-screen bg-slate-200 flex flex-col select-none print:bg-white print:min-h-0 pb-28 md:pb-8">
      {/* شريط التحكم العلوي */}
      <div className="print:hidden">
        <Header
          title={`معاينة تقرير: ${report.patientName}`}
          showBack
          onBack={() => setActiveScreen('dashboard')}
        />
      </div>

      <div className="bg-white border-b border-slate-300 px-4 py-3 shrink-0 shadow-xs print:hidden">
        <div className="max-w-5xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs md:text-sm font-bold text-slate-700">
            <span>
              الرقم المخبري: <strong className="text-red-600 font-mono">{report.labNumber}</strong>
            </span>
            <span className="text-slate-300">|</span>
            <span>
              الحالة: <span className="text-green-600 font-bold">جاهز ومطابق للمواصفات</span>
            </span>
            {successMessage && (
              <>
                <span className="text-slate-300">|</span>
                <span className="text-emerald-600 font-medium text-xs truncate max-w-xs">{successMessage}</span>
              </>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveScreen('add_invoice')}
              className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
            >
              <Edit className="w-3.5 h-3.5" />
              <span>تعديل النتائج</span>
            </button>

            <button
              type="button"
              onClick={handleQuickSave}
              disabled={isExporting}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{isExporting ? 'جاري الحفظ...' : 'حفظ في /AlManarReports/'}</span>
            </button>

            <button
              type="button"
              onClick={() => setPrintModalOpen(true)}
              className="px-5 py-2 bg-[#0b3b8c] hover:bg-[#002e5b] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md transition-colors"
            >
              <Printer className="w-4 h-4 text-blue-200" />
              <span>خيارات الطباعة والتصدير</span>
            </button>
          </div>
        </div>
      </div>

      {/* ===================== نموذج التقرير المخبري المعتمد ===================== */}
      <div className="flex-1 p-2 md:p-8 overflow-y-auto print:p-0 flex justify-center">
        <OfficialReportSheet ref={reportRef} report={report} settings={settings} />
      </div>
    </div>
  );
};
