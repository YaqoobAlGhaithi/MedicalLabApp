import { Award, CheckCircle2, Clock, Stethoscope, TrendingUp } from 'lucide-react';
import React from 'react';
import { LabReport } from '../../types';

interface DashboardDoctorStatsProps {
  reports: LabReport[];
}

export const DashboardDoctorStats: React.FC<DashboardDoctorStatsProps> = ({ reports }) => {
  // Aggregate doctor stats from reports + realistic baseline
  const doctorsList = [
    { name: 'د. محمد السعيد', role: 'أخصائي أمراض الدم', baseCount: 42, avgTime: '18 دقيقة', rating: 98, avatar: 'د.م' },
    { name: 'د. سارة الأحمدي', role: 'استشاري الكيمياء الحيوية', baseCount: 38, avgTime: '22 دقيقة', rating: 96, avatar: 'د.س' },
    { name: 'فني. أحمد حسن', role: 'فني أول مختبرات', baseCount: 55, avgTime: '14 دقيقة', rating: 99, avatar: 'ف.أ' },
    { name: 'د. عبدالمجيد الوافي', role: 'أخصائي أحياء دقيقة ومناعة', baseCount: 29, avgTime: '25 دقيقة', rating: 95, avatar: 'د.ع' },
  ];

  // Count actual occurrences in reports
  const actualCounts: Record<string, number> = {};
  reports.forEach(r => {
    const doc = r.doctorName || 'د. محمد السعيد';
    actualCounts[doc] = (actualCounts[doc] || 0) + 1;
  });

  const mergedDoctors = doctorsList.map(doc => ({
    ...doc,
    totalReports: doc.baseCount + (actualCounts[doc.name] || 0)
  })).sort((a, b) => b.totalReports - a.totalReports);

  const maxReports = mergedDoctors[0]?.totalReports || 100;

  return (
    <div className="bg-white rounded-2xl p-5 md:p-6 shadow-xs border border-slate-200/80 mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-5 pb-3 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <Stethoscope className="w-5 h-5 text-[#0b3b8c]" />
            <h3 className="text-base font-extrabold text-slate-800 tracking-tight">أداء الأطباء والكوادر المخبرية</h3>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">مؤشرات الإنجاز، جودة المراجعة، وسرعة اعتماد النتائج</p>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-[#0b3b8c] rounded-xl text-xs font-bold shrink-0 self-start sm:self-auto">
          <Award className="w-4 h-4 text-amber-500" />
          <span>أعلى كفاءة هذا الشهر: {mergedDoctors[0]?.name}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {mergedDoctors.map((doc, index) => (
          <div
            key={doc.name}
            className="p-4 rounded-xl border border-slate-200/90 hover:border-[#0b3b8c]/40 hover:shadow-md bg-slate-50/40 hover:bg-white transition-all group relative overflow-hidden flex flex-col justify-between"
          >
            {index === 0 && (
              <div className="absolute top-0 left-0 bg-gradient-to-r from-amber-500 to-amber-400 text-slate-950 text-[9px] font-black px-2.5 py-0.5 rounded-br-xl shadow-xs">
                الأول إنجازاً ★
              </div>
            )}

            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#0b3b8c] to-[#002e5b] text-white flex items-center justify-center font-black text-xs shadow-xs group-hover:scale-105 transition-transform">
                  {doc.avatar}
                </div>
                <div>
                  <h4 className="font-bold text-slate-800 text-xs md:text-sm group-hover:text-[#0b3b8c] transition-colors">{doc.name}</h4>
                  <p className="text-[10px] text-slate-400 font-medium">{doc.role}</p>
                </div>
              </div>

              {/* Progress volume */}
              <div className="mb-3">
                <div className="flex justify-between text-xs mb-1 font-bold">
                  <span className="text-slate-500">حجم الاعتماد</span>
                  <span className="text-[#0b3b8c] font-mono">{doc.totalReports} تقرير</span>
                </div>
                <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-[#0b3b8c] h-full rounded-full transition-all duration-500 group-hover:bg-emerald-600"
                    style={{ width: `${Math.min(100, (doc.totalReports / maxReports) * 100)}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-3 border-t border-slate-200/60 text-[11px]">
              <div className="flex items-center gap-1 text-slate-600 font-semibold" title="متوسط وقت إنجاز التقرير">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>{doc.avgTime}</span>
              </div>
              <div className="flex items-center justify-end gap-1 text-emerald-600 font-bold" title="معدل الدقة والاعتماد بدون إعادة">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{doc.rating}% دقة</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
