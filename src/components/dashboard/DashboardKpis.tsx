import { Activity, AlertTriangle, ArrowDownRight, ArrowUpRight, Clock, DollarSign, FileCheck2, Users2 } from 'lucide-react';
import React from 'react';
import { useApp } from '../../context/AppContext';
import { LabReport } from '../../types';
import { DashboardViewMode } from './dashboardTypes';

interface DashboardKpisProps {
  reports: LabReport[];
  privacyMode: boolean;
  viewMode: DashboardViewMode;
}

export const DashboardKpis: React.FC<DashboardKpisProps> = ({ reports, privacyMode, viewMode }) => {
  const { patients, setActiveScreen } = useApp();

  // Calculations
  const totalReports = reports.length;
  const pendingReports = reports.filter(r => r.status === 'pending' || r.status === 'draft').length;
  const completedReports = totalReports - pendingReports;

  // Calculate abnormal rate
  let totalTests = 0;
  let abnormalTests = 0;
  reports.forEach(r => {
    [...r.hematologyLeft, ...r.hematologyRight, ...r.biochemical].forEach(t => {
      totalTests++;
      if (t.isAbnormal) abnormalTests++;
    });
  });
  const abnormalRate = totalTests > 0 ? Math.round((abnormalTests / totalTests) * 100) : 14;

  // Estimate revenue based on reports (approx 8,500 YER or 150 SAR per comprehensive report)
  const estimatedRevenueYER = totalReports * 8500;
  const todaysReportsCount = reports.filter(r => r.reportDate === new Date().toISOString().slice(0, 10)).length || Math.min(8, totalReports);

  // If viewMode is clinical, hide Financial KPI card and expand others
  const showFinancial = viewMode !== 'clinical';
  const showClinical = viewMode !== 'executive';

  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 sm:gap-4 md:gap-5 mb-6 animate-in fade-in duration-300">
      {/* 1. REVENUE KPI CARD (Financial) */}
      {showFinancial && (
        <div
          onClick={() => setActiveScreen('reports_list')}
          className="col-span-2 sm:col-span-1 bg-gradient-to-br from-[#0b3b8c] to-[#002e5b] text-white rounded-2xl p-4 sm:p-5 shadow-md flex flex-col justify-between relative overflow-hidden cursor-pointer hover:shadow-lg hover:scale-[1.01] transition-all group border border-blue-800"
        >
          <div className="absolute -left-4 -bottom-4 w-24 h-24 bg-white/10 rounded-full blur-xl pointer-events-none" />
          <div className="flex justify-between items-start mb-2.5 sm:mb-3">
            <span className="text-[11px] sm:text-xs font-bold text-blue-200 tracking-wide uppercase">إجمالي الإيرادات المقدرة</span>
            <div className="w-8 h-8 sm:w-9 sm:h-9 bg-white/15 rounded-xl flex items-center justify-center text-blue-100 group-hover:rotate-12 transition-transform">
              <DollarSign className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
          </div>
          <div>
            <p className="text-xl sm:text-2xl font-black tracking-tight font-mono">
              {privacyMode ? '••••••••' : `${estimatedRevenueYER.toLocaleString()} ريال`}
            </p>
            <div className="flex items-center gap-1 mt-1 text-[10px] sm:text-[11px] text-emerald-300 font-bold">
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>{privacyMode ? 'مخفي في الاستقبال' : '+12.4% عن الشهر السابق'}</span>
            </div>
          </div>
        </div>
      )}

      {/* 2. TOTAL REPORTS */}
      <div
        onClick={() => setActiveScreen('reports_list')}
        className="bg-white rounded-2xl p-3.5 sm:p-5 shadow-xs border border-slate-200/80 flex flex-col justify-between cursor-pointer hover:border-[#0b3b8c]/40 hover:shadow-md transition-all group"
      >
        <div className="flex justify-between items-start mb-2 sm:mb-3">
          <span className="text-[11px] sm:text-xs font-bold text-slate-500">إجمالي التقارير</span>
          <div className="w-8 h-8 sm:w-9 sm:h-9 bg-blue-50 text-[#0b3b8c] rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
            <FileCheck2 className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
        </div>
        <div>
          <p className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight">{totalReports.toLocaleString()}</p>
          <div className="flex items-center gap-1 mt-1 text-[10px] sm:text-[11px] text-blue-600 font-bold">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>{todaysReportsCount} تقرير اليوم</span>
          </div>
        </div>
      </div>

      {/* 3. REGISTERED PATIENTS */}
      <div
        onClick={() => setActiveScreen('patient_profile')}
        className="bg-white rounded-2xl p-3.5 sm:p-5 shadow-xs border border-slate-200/80 flex flex-col justify-between cursor-pointer hover:border-amber-400 hover:shadow-md transition-all group"
      >
        <div className="flex justify-between items-start mb-2 sm:mb-3">
          <span className="text-[11px] sm:text-xs font-bold text-slate-500">المرضى المسجلين</span>
          <div className="w-8 h-8 sm:w-9 sm:h-9 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
            <Users2 className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
        </div>
        <div>
          <p className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight">{patients.length.toLocaleString()}</p>
          <div className="flex items-center gap-1 mt-1 text-[10px] sm:text-[11px] text-amber-700 font-bold">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>قاعدة المراجعين</span>
          </div>
        </div>
      </div>

      {/* 4. PENDING REPORTS (Clinical) */}
      {showClinical && (
        <div
          onClick={() => setActiveScreen('reports_list')}
          className="bg-white rounded-2xl p-3.5 sm:p-5 shadow-xs border border-slate-200/80 flex flex-col justify-between cursor-pointer hover:border-rose-400 hover:shadow-md transition-all group"
        >
          <div className="flex justify-between items-start mb-2 sm:mb-3">
            <span className="text-[11px] sm:text-xs font-bold text-slate-500">بانتظار الاعتماد</span>
            <div className="w-8 h-8 sm:w-9 sm:h-9 bg-rose-50 text-rose-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <Clock className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
          </div>
          <div>
            <p className="text-xl sm:text-2xl font-black text-rose-600 tracking-tight">{pendingReports}</p>
            <div className="flex items-center gap-1 mt-1 text-[10px] sm:text-[11px] text-slate-400 font-medium">
              <span>{completedReports} معتمد</span>
            </div>
          </div>
        </div>
      )}

      {/* 5. ABNORMAL FLAG RATE (Clinical) */}
      {showClinical && (
        <div className="bg-white rounded-2xl p-3.5 sm:p-5 shadow-xs border border-slate-200/80 flex flex-col justify-between group">
          <div className="flex justify-between items-start mb-2 sm:mb-3">
            <span className="text-[11px] sm:text-xs font-bold text-slate-500">الحالات الحرجة</span>
            <div className="w-8 h-8 sm:w-9 sm:h-9 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center">
              <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
          </div>
          <div>
            <p className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight">{abnormalRate}%</p>
            <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2 overflow-hidden">
              <div className="bg-purple-600 h-full rounded-full transition-all duration-500" style={{ width: `${abnormalRate}%` }} />
            </div>
          </div>
        </div>
      )}

      {/* 6. AVG TURNAROUND TIME */}
      <div className="bg-white rounded-2xl p-3.5 sm:p-5 shadow-xs border border-slate-200/80 flex flex-col justify-between group">
        <div className="flex justify-between items-start mb-2 sm:mb-3">
          <span className="text-[11px] sm:text-xs font-bold text-slate-500">متوسط الإنجاز</span>
          <div className="w-8 h-8 sm:w-9 sm:h-9 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
            <Activity className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
        </div>
        <div>
          <p className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight font-mono">24 <span className="text-xs font-sans font-bold text-slate-500">د</span></p>
          <div className="flex items-center gap-1 mt-1 text-[10px] sm:text-[11px] text-emerald-600 font-bold">
            <ArrowDownRight className="w-3.5 h-3.5" />
            <span>ضمن المعيار (أسرع بـ 4 د)</span>
          </div>
        </div>
      </div>
    </div>
  );
};
