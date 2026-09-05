import { ArrowUpRight, Check, Eye, FileSpreadsheet, FileText, Printer, SlidersHorizontal, X } from 'lucide-react';
import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { LabReport } from '../../types';
import { Sidebar } from '../common/Sidebar';
import { DashboardCharts } from '../dashboard/DashboardCharts';
import { DashboardDoctorStats } from '../dashboard/DashboardDoctorStats';
import { DashboardHeader } from '../dashboard/DashboardHeader';
import { DashboardKpis } from '../dashboard/DashboardKpis';
import { DashboardViewMode, DashboardWidgetConfig, TimeRange } from '../dashboard/dashboardTypes';

export const DashboardScreen: React.FC = () => {
  const { reports, patients, setActiveScreen, viewReportForPrint, setPrintModalOpen } = useApp();

  // Controls State
  const [searchQuery, setSearchQuery] = useState('');
  const [privacyMode, setPrivacyMode] = useState(false);
  const [viewMode, setViewMode] = useState<DashboardViewMode>('all');
  const [timeRange, setTimeRange] = useState<TimeRange>('30days');
  const [showCustomizer, setShowCustomizer] = useState(false);

  // Widget visibility customization state
  const [widgetConfig, setWidgetConfig] = useState<DashboardWidgetConfig>({
    kpis: true,
    charts: true,
    categoryPie: true,
    activityHeatmap: true,
    doctorStats: true,
    recentReports: true,
    printPreview: true,
  });

  // Filter reports by search query and time range
  const filteredReports = reports.filter(r => {
    // Search query match
    const matchesSearch = searchQuery.trim() === '' ||
      r.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.labNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (r.doctorName && r.doctorName.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return false;

    // Time range match
    if (timeRange === 'all') return true;
    const reportDate = new Date(r.reportDate).getTime();
    const now = new Date().getTime();
    const daysDiff = (now - reportDate) / (1000 * 3600 * 24);

    if (timeRange === '7days') return daysDiff <= 7;
    if (timeRange === '30days') return daysDiff <= 30;
    return true;
  });

  const latestReport: LabReport = filteredReports[0] || reports[0];

  // Export CSV Helper
  const handleExportExcel = () => {
    const headers = ['رقم الفحص', 'اسم المريض', 'الجنس', 'العمر', 'الطبيب المعالج', 'التاريخ', 'الحالة'];
    const rows = filteredReports.map(r => [
      r.labNumber,
      r.patientName,
      r.patientSex === 'M' ? 'ذكر' : 'أنثى',
      `${r.patientAge} سنة`,
      r.doctorName || 'غير محدد',
      r.reportDate,
      r.status === 'completed' ? 'معتمد' : 'بانتظار المراجعة'
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' +
      [headers.join(','), ...rows.map(e => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `AlManar_Lab_Reports_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export PDF Summary Helper
  const handleExportPdf = () => {
    window.print();
  };

  const toggleWidget = (key: keyof DashboardWidgetConfig) => {
    setWidgetConfig(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="h-screen bg-slate-100 flex overflow-hidden dir-rtl select-none font-sans" dir="rtl">
      {/* SIDEBAR NAVIGATION */}
      <Sidebar />

      {/* MAIN DASHBOARD CANVAS */}
      <main className="flex-1 flex flex-col overflow-hidden bg-slate-100/80">
        {/* ADVANCED CONTROLS HEADER */}
        <DashboardHeader
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          privacyMode={privacyMode}
          setPrivacyMode={setPrivacyMode}
          viewMode={viewMode}
          setViewMode={setViewMode}
          timeRange={timeRange}
          setTimeRange={setTimeRange}
          onOpenCustomizer={() => setShowCustomizer(true)}
          onExportPdf={handleExportPdf}
          onExportExcel={handleExportExcel}
        />

        {/* SCROLLABLE DASHBOARD CONTENT */}
        <div className="p-4 md:p-6 lg:p-8 flex-1 overflow-y-auto custom-scrollbar pb-28 md:pb-8">
          <div className="max-w-7xl mx-auto space-y-6">
            
            {/* 1. KEY PERFORMANCE INDICATORS (KPIs) */}
            {widgetConfig.kpis && (
              <DashboardKpis
                reports={filteredReports}
                privacyMode={privacyMode}
                viewMode={viewMode}
              />
            )}

            {/* 2. CHARTS, PIE & HEATMAP SECTION */}
            {widgetConfig.charts && (
              <DashboardCharts
                reports={filteredReports}
                timeRange={timeRange}
              />
            )}

            {/* 3. DOCTORS & LAB STAFF EFFICIENCY STATS */}
            {widgetConfig.doctorStats && viewMode !== 'executive' && (
              <DashboardDoctorStats reports={filteredReports} />
            )}

            {/* 4. LOWER BENTO SECTION: RECENT TABLES & PDF REPLICA PREVIEW */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              
              {/* TABLE: RECENT REPORTS */}
              {widgetConfig.recentReports && (
                <div className={`${widgetConfig.printPreview ? 'md:col-span-5' : 'md:col-span-12'} bg-white rounded-2xl shadow-xs border border-slate-200/80 flex flex-col min-h-[440px]`}>
                  <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 rounded-t-2xl">
                    <div>
                      <h3 className="font-bold text-slate-800 text-sm md:text-base">آخر التقارير المسجلة</h3>
                      <p className="text-xs text-slate-400 mt-0.5">سجل أحدث نتائج الفحوصات المخبرية</p>
                    </div>
                    <button
                      onClick={() => setActiveScreen('reports_list')}
                      className="text-xs text-[#0b3b8c] font-bold hover:underline px-2.5 py-1 bg-blue-50 rounded-lg transition-colors"
                    >
                      عرض الكل ({reports.length})
                    </button>
                  </div>

                  <div className="flex-1 overflow-x-auto">
                    <table className="w-full text-xs text-right">
                      <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-100">
                        <tr>
                          <th className="p-3.5 pl-2">المريض ورقم الفحص</th>
                          <th className="p-3.5 text-center">التاريخ والطبيب</th>
                          <th className="p-3.5 text-center">الإجراء</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {filteredReports.slice(0, 6).map((report) => (
                          <tr key={report.id} className="hover:bg-blue-50/40 transition-colors">
                            <td className="p-3.5 pl-2">
                              <p className="font-bold text-slate-800 text-xs md:text-sm">{report.patientName}</p>
                              <p className="text-[10px] text-[#0b3b8c] font-mono mt-0.5 font-bold">{report.labNumber}</p>
                            </td>
                            <td className="p-3.5 text-center text-slate-500">
                              <p className="text-xs font-medium text-slate-700">{report.reportDate}</p>
                              <p className="text-[10px] text-slate-400 mt-0.5 truncate max-w-[120px] mx-auto">{report.doctorName}</p>
                            </td>
                            <td className="p-3.5 text-center">
                              <button
                                onClick={() => viewReportForPrint(report)}
                                className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-[#0b3b8c] rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 mx-auto active:scale-95"
                              >
                                <Eye className="w-3.5 h-3.5" />
                                <span>التقرير</span>
                              </button>
                            </td>
                          </tr>
                        ))}
                        {filteredReports.length === 0 && (
                          <tr>
                            <td colSpan={3} className="py-12 text-center text-slate-400 text-xs font-medium">
                              لا توجد نتائج مطابقة لشرط البحث
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* PDF REPLICA PREVIEW (PRINT READY) */}
              {widgetConfig.printPreview && (
                <div className={`${widgetConfig.recentReports ? 'md:col-span-7' : 'md:col-span-12'} bg-slate-200/80 rounded-2xl shadow-inner border border-slate-300 p-4 md:p-6 flex flex-col min-h-[440px]`}>
                  <div className="flex flex-wrap justify-between items-center gap-2 mb-4">
                    <div>
                      <h3 className="text-xs md:text-sm font-extrabold text-slate-800 uppercase tracking-wide flex items-center gap-1.5">
                        <FileText className="w-4 h-4 text-[#0b3b8c]" />
                        <span>معاينة التقرير النهائي (Print Ready PDF)</span>
                      </h3>
                      <p className="text-[10px] text-slate-500 mt-0.5">النموذج المعتمد لعيادة ومختبرات المنار الطبية</p>
                    </div>

                    {latestReport && (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => viewReportForPrint(latestReport)}
                          className="bg-white px-3 py-1.5 rounded-xl border border-slate-300 shadow-xs text-xs font-bold text-[#0b3b8c] flex items-center gap-1 hover:bg-blue-50 transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>تكبير</span>
                        </button>
                        <button
                          onClick={() => {
                            viewReportForPrint(latestReport);
                            setTimeout(() => setPrintModalOpen(true), 150);
                          }}
                          className="bg-[#0b3b8c] text-white px-4 py-1.5 rounded-xl shadow-xs text-xs font-extrabold flex items-center gap-1.5 hover:bg-[#002e5b] transition-all active:scale-95"
                        >
                          <Printer className="w-3.5 h-3.5 text-blue-200" />
                          <span>طباعة فورية</span>
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Replica Box */}
                  {latestReport ? (
                    <div
                      onClick={() => viewReportForPrint(latestReport)}
                      className="flex-1 bg-white shadow-xl mx-auto w-full max-w-[540px] rounded-2xl p-5 md:p-6 flex flex-col text-[10px] text-black border-t-[6px] border-[#0b3b8c] cursor-pointer hover:ring-4 ring-blue-400/30 transition-all select-none relative group overflow-hidden"
                    >
                      <div className="absolute top-3 left-3 bg-blue-50 text-[#0b3b8c] px-2 py-0.5 rounded text-[9px] font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                        انقر للطباعة / التصدير
                      </div>

                      {/* Header */}
                      <div className="flex justify-between items-start border-b border-slate-200 pb-3 mb-3">
                        <div className="text-left font-sans">
                          <h2 className="text-xs md:text-sm font-black text-[#0b3b8c] tracking-tight">AL-Manar Medical Laboratories</h2>
                          <p className="text-xs font-bold text-slate-800 mt-0.5">عيادة ومختبرات المنار الطبية الحديثة</p>
                          <p className="text-[8px] text-red-600 font-bold mt-1">إشراف د. محمد السعيد | وراف - سوق الفجرة | هاتف: 715640121</p>
                        </div>
                        <div className="w-10 h-10 flex items-center justify-center shrink-0 bg-blue-50 rounded-2xl border border-blue-100 shadow-inner font-black text-red-600 text-lg">
                          M
                        </div>
                      </div>

                      {/* Patient Info */}
                      <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 mb-3 bg-slate-50 p-2.5 rounded-xl border border-slate-200/80 text-[10px]">
                        <div className="flex justify-between"><span>Patient Name:</span> <span className="font-bold text-[#0b3b8c]">{latestReport.patientName}</span></div>
                        <div className="flex justify-between"><span>Date:</span> <span className="font-medium">{latestReport.reportDate}</span></div>
                        <div className="flex justify-between"><span>Gender/Age:</span> <span>{latestReport.patientSex === 'M' ? 'ذكر' : 'أنثى'} / {latestReport.patientAge}Y</span></div>
                        <div className="flex justify-between"><span>Lab Ref:</span> <span className="font-mono font-bold text-red-600">{latestReport.labNumber}</span></div>
                      </div>

                      {/* Table Snippet */}
                      <div className="border border-slate-200 rounded-xl overflow-hidden mb-3">
                        <div className="bg-[#0b3b8c] text-white text-[9px] font-extrabold text-center py-1 tracking-wider uppercase">
                          COMPREHENSIVE ANALYSIS
                        </div>
                        <table className="w-full text-left text-[9px]">
                          <thead className="bg-slate-100 text-slate-600 border-b border-slate-200 font-bold">
                            <tr>
                              <th className="p-1.5 pl-2">Test Name</th>
                              <th className="p-1.5 text-center">Result</th>
                              <th className="p-1.5 text-center">Unit</th>
                              <th className="p-1.5 text-right pr-2">Reference</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 font-mono">
                            {latestReport.hematologyLeft.slice(0, 4).map((row, idx) => (
                              <tr key={idx} className={row.isAbnormal ? 'bg-rose-50/70 text-rose-900 font-bold' : ''}>
                                <td className="p-1.5 pl-2 font-sans font-semibold">{row.testName}</td>
                                <td className={`p-1.5 text-center font-bold ${row.isAbnormal ? 'text-rose-600' : 'text-slate-800'}`}>
                                  {row.result} {row.isAbnormal && '★'}
                                </td>
                                <td className="p-1.5 text-center text-slate-500 font-sans">{row.unit}</td>
                                <td className="p-1.5 text-right pr-2 text-slate-500 text-[8px] font-sans truncate max-w-[100px]">{row.normalRange.replace(/\n/g, ' ')}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      {/* Footer */}
                      <div className="mt-auto pt-3 text-[8px] flex justify-between items-end border-t border-slate-200 text-slate-500">
                        <div>
                          <p className="font-bold text-slate-700">ملاحظة: النتيجة تخص العينة المختبرة فقط</p>
                          <p className="text-[7px]">Verified by Automated LIMS Engine</p>
                        </div>
                        <div className="text-center shrink-0">
                          <p className="font-bold text-slate-800 mb-2">اعتماد الطبيب المختص</p>
                          <div className="w-16 border-b border-slate-400 mx-auto" />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex-1 bg-white rounded-2xl flex items-center justify-center text-slate-400 text-xs font-semibold shadow-sm">
                      لا توجد تقارير متاحة للمعاينة
                    </div>
                  )}
                </div>
              )}

            </div>

          </div>
        </div>
      </main>

      {/* DASHBOARD CUSTOMIZER MODAL */}
      {showCustomizer && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-100 overflow-hidden">
            <div className="bg-[#0b3b8c] text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <SlidersHorizontal className="w-5 h-5 text-blue-200" />
                <h3 className="font-black text-base">تخصيص عناصر لوحة التحكم</h3>
              </div>
              <button
                onClick={() => setShowCustomizer(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <p className="text-xs text-slate-500 leading-relaxed font-medium">
                اختر البطاقات والوحدات الرسومية التي ترغب بظهورها في شاشتك الرئيسية لتسريع سير العمل المخبري:
              </p>

              <div className="space-y-2.5 pt-2">
                {[
                  { key: 'kpis' as const, title: 'مؤشرات الأداء السريعة (KPIs)', desc: 'الإيرادات، عدد التقارير، المرضى، وقت الإنجاز' },
                  { key: 'charts' as const, title: 'الرسوم البيانية والخريطة الحرارية', desc: 'معدل النشاط اليومي، توزيع الفحوصات، أوقات الذروة' },
                  { key: 'doctorStats' as const, title: 'إحصائيات وكفاءة الأطباء والكوادر', desc: 'معدلات الإنجاز وسرعة المراجعة لكل طبيب وفني' },
                  { key: 'recentReports' as const, title: 'جدول أحدث الفحوصات المضافة', desc: 'قائمة سريعة بآخر المرضى والتقارير في المختبر' },
                  { key: 'printPreview' as const, title: 'المعاينة المباشرة للتقرير النهائي PDF', desc: 'نافذة تفاعلية تحاكي نموذج الطباعة المعتمد' },
                ].map(item => (
                  <label
                    key={item.key}
                    className={`flex items-start gap-3.5 p-3.5 rounded-2xl border cursor-pointer transition-all ${
                      widgetConfig[item.key]
                        ? 'bg-blue-50/60 border-blue-200 shadow-2xs'
                        : 'bg-slate-50 border-slate-200 opacity-60 hover:opacity-80'
                    }`}
                  >
                    <div className={`w-5 h-5 rounded-lg border flex items-center justify-center mt-0.5 shrink-0 transition-colors ${
                      widgetConfig[item.key] ? 'bg-[#0b3b8c] border-[#0b3b8c] text-white' : 'bg-white border-slate-300'
                    }`}>
                      {widgetConfig[item.key] && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </div>
                    <div className="flex-1 select-none">
                      <p className="text-xs font-extrabold text-slate-800">{item.title}</p>
                      <p className="text-[10px] text-slate-500 mt-0.5">{item.desc}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div className="p-5 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-3">
              <button
                onClick={() => {
                  setWidgetConfig({ kpis: true, charts: true, categoryPie: true, activityHeatmap: true, doctorStats: true, recentReports: true, printPreview: true });
                }}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors"
              >
                إعادة ضبط الافتراضي
              </button>
              <button
                onClick={() => setShowCustomizer(false)}
                className="px-6 py-2.5 bg-[#0b3b8c] hover:bg-[#002e5b] text-white rounded-xl text-xs font-extrabold shadow-md transition-all active:scale-95"
              >
                حفظ التخصيص
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

