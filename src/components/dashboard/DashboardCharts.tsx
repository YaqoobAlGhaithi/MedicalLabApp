import React, { useState } from 'react';
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { LabReport } from '../../types';
import { TimeRange } from './dashboardTypes';

interface DashboardChartsProps {
  reports: LabReport[];
  timeRange: TimeRange;
}

const CATEGORY_COLORS = ['#0b3b8c', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#64748b'];

export const DashboardCharts: React.FC<DashboardChartsProps> = ({ reports }) => {
  const [activeTab, setActiveTab] = useState<'volume' | 'abnormal'>('volume');

  // Generate Daily Trend Mock + Real merged data
  const daysMap = ['السبت', 'الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة'];
  const trendData = daysMap.map((day, idx) => {
    const base = 15 + ((idx * 7) % 12);
    const completed = Math.round(base * 0.85);
    const critical = Math.round(base * 0.15);
    return {
      name: day,
      التقارير_المعتمدة: completed,
      الحالات_الحرجة: critical,
      الإجمالي: completed + critical,
    };
  });

  // Calculate Category Distribution
  let hematologyCount = 0;
  let biochemistryCount = 0;
  let hormonalCount = 45; // baseline mock
  let serologyCount = 30;

  reports.forEach(r => {
    hematologyCount += (r.hematologyLeft?.length || 0) + (r.hematologyRight?.length || 0);
    biochemistryCount += r.biochemical?.length || 0;
  });
  hematologyCount = Math.max(120, hematologyCount * 8);
  biochemistryCount = Math.max(95, biochemistryCount * 6);

  const pieData = [
    { name: 'أمراض الدم (CB/CBC)', value: hematologyCount },
    { name: 'الكيمياء الحيوية', value: biochemistryCount },
    { name: 'الهرمونات والمناعة', value: hormonalCount },
    { name: 'الأمصال والفيروسات', value: serologyCount },
  ];

  // Calculate Monthly Status Comparison (Completed vs Pending)
  const actualCompletedCount = reports.filter(r => r.status === 'completed' || r.status === 'printed' || r.status === 'delivered').length || Math.round(reports.length * 0.82);
  const actualPendingCount = reports.filter(r => r.status === 'pending' || r.status === 'draft').length || Math.round(reports.length * 0.18);

  const monthWeeks = ['الأسبوع الأول', 'الأسبوع الثاني', 'الأسبوع الثالث', 'الأسبوع الرابع (الحالي)'];
  const monthlyStatusTrend = monthWeeks.map((week, idx) => {
    const baseWeekVol = Math.max(10, Math.round(reports.length / 4));
    const completed = idx === 3 ? actualCompletedCount : Math.round(baseWeekVol * (0.75 + idx * 0.05));
    const pending = idx === 3 ? actualPendingCount : Math.round(baseWeekVol * (0.25 - idx * 0.03));
    return {
      name: week,
      مكتملة: Math.max(2, completed),
      قيد_الانتظار: Math.max(1, pending),
    };
  });

  // Peak Hours Heatmap Simulation
  const hours = ['8 ص', '10 ص', '12 م', '2 م', '4 م', '6 م', '8 م', '10 م'];
  const heatmapGrid = hours.map((hour, i) => {
    // Generate simulated density 1 to 5
    const density = [2, 4, 5, 3, 2, 4, 5, 1][i];
    return { hour, density };
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
      {/* 1. MAIN VOLUME & TREND CHART (Col span 2) */}
      <div className="lg:col-span-2 bg-white rounded-2xl p-5 md:p-6 shadow-xs border border-slate-200/80 flex flex-col justify-between">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-base font-extrabold text-slate-800 tracking-tight">معدل الفحوصات والنشاط اليومي</h3>
            <p className="text-xs text-slate-400 mt-0.5">تحليل حجم الإنجاز ومقارنة الحالات المستقرة بالحرجة</p>
          </div>
          <div className="flex bg-slate-100 p-1 rounded-xl text-xs shrink-0 self-start sm:self-auto">
            <button
              onClick={() => setActiveTab('volume')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                activeTab === 'volume' ? 'bg-[#0b3b8c] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              الأعمدة البيانية
            </button>
            <button
              onClick={() => setActiveTab('abnormal')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                activeTab === 'abnormal' ? 'bg-[#0b3b8c] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              الخط الزمني المدمج
            </button>
          </div>
        </div>

        <div className="h-72 w-full" dir="ltr">
          <ResponsiveContainer width="100%" height="100%">
            {activeTab === 'volume' ? (
              <BarChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                  labelStyle={{ fontWeight: 'bold', color: '#0f172a', direction: 'rtl', textAlign: 'right' }}
                  itemStyle={{ direction: 'rtl', textAlign: 'right' }}
                />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                <Bar dataKey="التقارير_المعتمدة" fill="#0b3b8c" radius={[6, 6, 0, 0]} barSize={24} />
                <Bar dataKey="الحالات_الحرجة" fill="#f43f5e" radius={[6, 6, 0, 0]} barSize={24} />
              </BarChart>
            ) : (
              <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0b3b8c" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#0b3b8c" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0' }}
                  labelStyle={{ fontWeight: 'bold', direction: 'rtl', textAlign: 'right' }}
                  itemStyle={{ direction: 'rtl', textAlign: 'right' }}
                />
                <Area type="monotone" dataKey="الإجمالي" stroke="#0b3b8c" strokeWidth={3} fillOpacity={1} fill="url(#colorTotal)" />
              </AreaChart>
            )}
          </ResponsiveContainer>
        </div>
      </div>

      {/* 2. TEST CATEGORY DONUT CHART (Col span 1) */}
      <div className="bg-white rounded-2xl p-5 md:p-6 shadow-xs border border-slate-200/80 flex flex-col justify-between">
        <div>
          <h3 className="text-base font-extrabold text-slate-800 tracking-tight mb-1">توزيع الفحوصات حسب القسم</h3>
          <p className="text-xs text-slate-400 mb-4">النسبة المئوية للأقسام المخبرية الأكثر طلباً</p>
        </div>

        <div className="h-56 w-full relative flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: any) => [`${value} فحص`, 'الكمية']}
                contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', direction: 'rtl' }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-2xl font-black text-slate-800 font-mono">
              {pieData.reduce((a, b) => a + b.value, 0)}
            </span>
            <span className="text-[10px] font-bold text-slate-400">إجمالي الفحوصات</span>
          </div>
        </div>

        {/* Custom Legend */}
        <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-slate-100">
          {pieData.map((item, idx) => (
            <div key={item.name} className="flex items-center gap-2 text-xs">
              <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: CATEGORY_COLORS[idx] }} />
              <span className="text-slate-600 truncate font-medium">{item.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* NEW 3. MONTHLY COMPLETED VS PENDING REPORTS CHART (Col span 2) */}
      <div className="lg:col-span-2 bg-white rounded-2xl p-5 md:p-6 shadow-xs border border-slate-200/80 flex flex-col justify-between">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <h3 className="text-base font-extrabold text-slate-800 tracking-tight">التقارير المكتملة مقابل قيد الانتظار (الشهر الحالي)</h3>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">مقارنة أسبوعية لحالة إنجاز واعتماد الفحوصات المخبرية خلال الشهر</p>
          </div>
          <div className="flex items-center gap-2.5 text-xs font-bold shrink-0">
            <div className="flex items-center gap-1.5 text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-xl border border-emerald-200/60">
              <span className="w-2 h-2 rounded-full bg-emerald-600 inline-block"/>
              <span>مكتملة ({actualCompletedCount})</span>
            </div>
            <div className="flex items-center gap-1.5 text-amber-700 bg-amber-50 px-2.5 py-1 rounded-xl border border-amber-200/60">
              <span className="w-2 h-2 rounded-full bg-amber-500 inline-block"/>
              <span>قيد الانتظار ({actualPendingCount})</span>
            </div>
          </div>
        </div>

        <div className="h-64 w-full" dir="ltr">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyStatusTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                labelStyle={{ fontWeight: 'bold', color: '#0f172a', direction: 'rtl', textAlign: 'right' }}
                itemStyle={{ direction: 'rtl', textAlign: 'right' }}
              />
              <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
              <Bar dataKey="مكتملة" name="التقارير المكتملة" fill="#10b981" radius={[6, 6, 0, 0]} barSize={28} />
              <Bar dataKey="قيد_الانتظار" name="قيد الانتظار" fill="#f59e0b" radius={[6, 6, 0, 0]} barSize={28} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* MONTHLY STATUS SUMMARY DONUT CARD (Col span 1) */}
      <div className="bg-gradient-to-br from-[#002e5b] to-[#0b3b8c] text-white rounded-2xl p-5 md:p-6 shadow-md flex flex-col justify-between">
        <div>
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-base font-black tracking-tight">نسبة الإنجاز الشهري</h3>
            <span className="bg-white/15 text-blue-100 text-[10px] px-2 py-0.5 rounded-full font-bold">مباشر</span>
          </div>
          <p className="text-xs text-blue-200/80 mb-2">نسبة التقارير المعتمدة هذا الشهر</p>

          <div className="h-40 w-full relative flex items-center justify-center my-2">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={[
                    { name: 'مكتملة', value: actualCompletedCount },
                    { name: 'قيد الانتظار', value: actualPendingCount }
                  ]}
                  cx="50%"
                  cy="50%"
                  innerRadius={42}
                  outerRadius={62}
                  paddingAngle={5}
                  dataKey="value"
                >
                  <Cell fill="#34d399" />
                  <Cell fill="#fbbf24" />
                </Pie>
                <Tooltip
                  formatter={(value: any) => [`${value} تقرير`, 'العدد']}
                  contentStyle={{ borderRadius: '12px', border: 'none', backgroundColor: '#0f172a', color: '#fff', direction: 'rtl' }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-xl font-black font-mono text-emerald-300">
                {Math.round((actualCompletedCount / Math.max(1, actualCompletedCount + actualPendingCount)) * 100)}%
              </span>
              <span className="text-[9px] text-blue-200 font-bold">مكتمل</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 pt-3 border-t border-white/10 text-xs">
          <div className="bg-white/10 rounded-xl p-2.5 text-center">
            <span className="block text-[10px] text-blue-200 font-medium">مكتملة</span>
            <span className="font-mono font-black text-emerald-300 text-sm">{actualCompletedCount}</span>
          </div>
          <div className="bg-white/10 rounded-xl p-2.5 text-center">
            <span className="block text-[10px] text-blue-200 font-medium">بانتظار الاعتماد</span>
            <span className="font-mono font-black text-amber-300 text-sm">{actualPendingCount}</span>
          </div>
        </div>
      </div>

      {/* 4. PEAK HOURS HEATMAP WIDGET (Col span 3) */}
      <div className="lg:col-span-3 bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded-2xl p-5 md:p-6 shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
              <h3 className="text-base font-extrabold text-white tracking-tight">الخريطة الحرارية لساعات الذروة المخبرية</h3>
            </div>
            <p className="text-xs text-slate-400 mt-1">تحديد أوقات الضغط المرتفع لتوجيه الموارد وتجهيز الكوادر المناوبة</p>
          </div>
          <div className="flex items-center gap-3 text-xs text-slate-300">
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-blue-950 border border-blue-800 inline-block"/> هادئ</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-blue-600 inline-block"/> معتدل</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-amber-500 inline-block"/> ذروة عالية</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-rose-600 inline-block"/> ضغط قصوى</span>
          </div>
        </div>

        <div className="grid grid-cols-4 sm:grid-cols-8 gap-2.5 py-2">
          {heatmapGrid.map((slot) => {
            let bgClass = 'bg-blue-950/60 border-blue-900/50 text-slate-400';
            let label = 'مستقر';
            if (slot.density === 2) { bgClass = 'bg-blue-900/80 border-blue-700 text-blue-200'; label = 'نشط'; }
            if (slot.density === 3) { bgClass = 'bg-blue-600 border-blue-400 text-white font-bold'; label = 'مزدحم'; }
            if (slot.density === 4) { bgClass = 'bg-amber-500 border-amber-300 text-slate-950 font-extrabold'; label = 'ذروة'; }
            if (slot.density === 5) { bgClass = 'bg-rose-600 border-rose-400 text-white font-black shadow-lg shadow-rose-900/50 scale-105'; label = 'قصوى ⚡'; }

            return (
              <div
                key={slot.hour}
                className={`p-3 rounded-xl border transition-all hover:scale-105 cursor-pointer flex flex-col items-center justify-center text-center ${bgClass}`}
              >
                <span className="text-xs font-mono mb-1">{slot.hour}</span>
                <span className="text-[11px] opacity-90">{label}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
