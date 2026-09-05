/**
 * OfficialReportSheet.tsx - النموذج الرسمي المعتمد لتقرير عيادة ومختبرات المنار
 * تم تصميمه ليتطابق مع مواصفات النموذج المطبوع A4
 */

import { Phone } from 'lucide-react';
import React, { forwardRef } from 'react';
import { SEROLOGY_LEFT_KEYS, SEROLOGY_RIGHT_KEYS, TEST_DEFINITIONS } from '../../data/referenceRanges';
import { LabReport, LabSettings } from '../../types';

interface OfficialReportSheetProps {
  report: LabReport;
  settings?: Partial<LabSettings>;
  className?: string;
}

export const OfficialReportSheet = forwardRef<HTMLDivElement, OfficialReportSheetProps>(
  ({ report, settings, className = '' }, ref) => {
    // دالة مساعدة لجلب الاسم الكامل للفحص المصلي
    const getSeroName = (key: string) => {
      const def = TEST_DEFINITIONS.find((t) => t.id === key);
      return def ? def.name : key;
    };

    return (
      <div
        ref={ref}
        id="printable-lab-report"
        className={`w-full max-w-[794px] bg-white text-black p-6 md:p-8 shadow-2xl print:shadow-none print:w-full print:max-w-none print:p-4 mx-auto font-sans text-xs flex flex-col justify-between min-h-[1122px] print:min-h-0 relative border-t-[8px] border-[#0b3b8c] ${className}`}
        style={{ direction: 'rtl' }}
      >
        <div>
          {/* 1. ترويسة المختبر والعيادة الرسمية */}
          {settings?.headerBannerUrl ? (
            <div className="mb-4 select-none border-b-2 border-[#0b3b8c] pb-3">
              <img
                src={settings.headerBannerUrl}
                alt="Report Header Banner"
                className="w-full h-auto object-contain max-h-40 mx-auto"
              />
            </div>
          ) : (
            <div className="flex items-center justify-between border-b-2 border-[#0b3b8c] pb-4 mb-4 select-none">
              {/* العمود الأيسر: الاسم بالإنجليزية والعنوان */}
              <div className="text-left w-1/3" style={{ direction: 'ltr' }}>
                <h1 className="text-sm sm:text-base md:text-lg font-black tracking-tight text-[#0b3b8c] leading-tight uppercase">
                  {settings?.labNameEn || 'Clinic and laboratories AL-Manar Medical'}
                </h1>
                <p className="text-[10px] sm:text-[11px] md:text-xs font-bold text-[#dc2626] mt-1 leading-snug whitespace-pre-line">
                  {settings?.address || 'وراف – سوق الفجره\nجوار صرافة منبع الخير'}
                </p>
              </div>

              {/* العمود الأوسط: الشعار الرسمي للمختبر */}
              <div className="flex flex-col items-center justify-center w-1/3 px-2">
                <div className="w-16 h-16 md:w-20 md:h-20 relative flex items-center justify-center">
                  {settings?.logoUrl ? (
                    <img
                      src={settings.logoUrl}
                      alt="Lab Logo"
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <svg viewBox="0 0 100 100" className="w-full h-full">
                      <path d="M 65,10 A 42,42 0 1 0 65,90 A 35,35 0 1 1 65,10 Z" fill="#0b3b8c" />
                      <text
                        x="48"
                        y="66"
                        fontSize="46"
                        fontWeight="900"
                        fill="#dc2626"
                        textAnchor="middle"
                        fontFamily="Arial"
                      >
                        M
                      </text>
                      <g transform="translate(56, 16) scale(0.6)" fill="#1d4ed8">
                        <path d="M12 2L6 8l4 4 6-6-4-4zm-4 8L4 14l2 2 4-4-2-2zM4 18c0 3 2 5 5 5h4v-3H9c-1.5 0-2-1-2-2v-2H4v2z" />
                        <circle cx="16" cy="4" r="2" fill="#dc2626" />
                      </g>
                    </svg>
                  )}
                </div>
                <span className="text-[10px] sm:text-[11px] font-extrabold text-[#0b3b8c] mt-1 text-center whitespace-nowrap">
                  {settings?.labNameAr || 'عيادة ومختبرات المنار الطبية'}
                </span>
              </div>

              {/* العمود الأيمن: الاسم بالعربية وأرقام الهواتف */}
              <div className="text-right w-1/3 flex flex-col items-end">
                <h2 className="text-base sm:text-lg md:text-xl font-black text-[#0b3b8c] leading-tight">
                  {settings?.labNameAr || 'عيادة ومختبرات المنار الطبية'}
                </h2>
                <div className="flex items-center gap-1.5 mt-2 text-xs md:text-sm font-black text-[#dc2626]">
                  <Phone className="w-4 h-4 text-[#dc2626] shrink-0 transform scale-x-[-1]" />
                  <span className="tracking-tight dir-ltr font-mono">
                    {settings?.phone1
                      ? `${settings.phone1}${settings.phone2 ? ` - ${settings.phone2}` : ''}`
                      : '715640121 - 772866468'}
                  </span>
                  <span className="bg-[#dc2626] text-white px-2 py-0.5 rounded text-[10px] font-bold">
                    للتواصل
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* 2. كتلة بيانات المريض المحاطة بإطار أزرق مطابق للنموذج المعتمد */}
          <div className="border-2 border-[#0b3b8c] rounded-2xl p-4 mb-5 bg-white text-xs">
            <div className="grid grid-cols-12 gap-y-2.5 items-center">
              {/* اسم المريض */}
              <div className="col-span-8 flex items-baseline">
                <span className="font-extrabold text-[#dc2626] mr-2 w-20 shrink-0 text-left dir-ltr">
                  Name Pat.:
                </span>
                <span className="border-b border-dotted border-slate-400 flex-1 px-2 font-bold text-sm text-slate-900">
                  {report.patientName}
                </span>
                <span className="font-bold text-[#dc2626] ml-2 shrink-0">:اسم المريض</span>
              </div>

              {/* التاريخ */}
              <div className="col-span-4 flex items-baseline pl-4">
                <span className="font-extrabold text-[#dc2626] mr-2 shrink-0">Date:</span>
                <span className="border-b border-dotted border-slate-400 flex-1 px-2 text-center font-bold text-slate-800 font-mono">
                  {report.reportDate}
                </span>
              </div>

              {/* الجنس */}
              <div className="col-span-8 flex items-baseline">
                <span className="font-extrabold text-[#dc2626] mr-2 w-20 shrink-0 text-left dir-ltr">
                  Sex:
                </span>
                <span className="border-b border-dotted border-slate-400 flex-1 px-2 font-bold text-slate-900">
                  {report.patientSex === 'M' ? 'ذكر (Male)' : 'أنثى (Female)'}
                </span>
                <span className="font-bold text-[#dc2626] ml-2 shrink-0">:الجنس</span>
              </div>

              {/* العمر */}
              <div className="col-span-4 flex items-baseline pl-4">
                <span className="font-extrabold text-[#dc2626] mr-2 shrink-0">Age:</span>
                <span className="border-b border-dotted border-slate-400 flex-1 px-2 text-center font-bold text-slate-900">
                  {report.patientAge} سنة
                </span>
                <span className="font-bold text-[#dc2626] ml-2 shrink-0">:العمر</span>
              </div>

              {/* الرقم المخبري */}
              <div className="col-span-12 flex items-baseline">
                <span className="font-extrabold text-[#dc2626] mr-2 w-20 shrink-0 text-left dir-ltr">
                  Lab. No.:
                </span>
                <span className="border-b border-dotted border-slate-400 flex-1 px-2 font-mono font-black text-sm text-[#0b3b8c]">
                  {report.labNumber}
                </span>
                <span className="font-bold text-[#dc2626] ml-2 shrink-0">:الرقم المخبري</span>
              </div>

              {/* الطبيب المعالج */}
              <div className="col-span-12 flex items-baseline">
                <span className="font-extrabold text-[#dc2626] mr-2 w-20 shrink-0 text-left dir-ltr">
                  Doctor:
                </span>
                <span className="border-b border-dotted border-slate-400 flex-1 px-2 font-bold text-slate-900">
                  {report.doctorName}
                </span>
                <span className="font-bold text-[#dc2626] ml-2 shrink-0">:اسم الطبيب</span>
              </div>
            </div>
          </div>

          {/* 3. قسم أمراض الدم (HEMATOLOGY) */}
          <div className="mb-6">
            <div className="bg-[#0b3b8c] text-white text-center py-1.5 rounded-lg font-black tracking-widest uppercase mb-2 text-sm">
              HEMATOLOGY
            </div>

            <div className="grid grid-cols-2 gap-3 border border-[#0b3b8c] rounded-xl overflow-hidden p-0.5">
              {/* جدول أمراض الدم الأيسر */}
              <div>
                <table className="w-full text-left border-collapse text-[11px]" style={{ direction: 'ltr' }}>
                  <thead>
                    <tr className="bg-[#0b3b8c] text-white text-center font-bold">
                      <th className="py-1 px-1.5 text-left">Test</th>
                      <th className="py-1 px-1">Result</th>
                      <th className="py-1 px-1">Unit</th>
                      <th className="py-1 px-1">N. R.</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {report.hematologyLeft.map((item, idx) => (
                      <tr
                        key={idx}
                        className={item.isAbnormal ? 'bg-red-50/80 font-bold' : idx % 2 === 0 ? 'bg-slate-50/50' : ''}
                      >
                        <td className="py-1 px-1.5 font-bold text-slate-800">{item.testName}</td>
                        <td
                          className={`py-1 px-1 text-center font-extrabold ${
                            item.isAbnormal ? 'text-[#dc2626]' : 'text-slate-900'
                          }`}
                        >
                          {item.result} {item.isAbnormal && '★'}
                        </td>
                        <td className="py-1 px-1 text-center text-slate-500 font-mono text-[10px]">{item.unit}</td>
                        <td className="py-1 px-1 text-center text-slate-500 text-[9px] whitespace-pre-line leading-tight">
                          {item.normalRange}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* جدول أمراض الدم الأيمن */}
              <div className="border-l border-slate-300 pl-1">
                <table className="w-full text-left border-collapse text-[11px]" style={{ direction: 'ltr' }}>
                  <thead>
                    <tr className="bg-[#0b3b8c] text-white text-center font-bold">
                      <th className="py-1 px-1.5 text-left">Test</th>
                      <th className="py-1 px-1">Result</th>
                      <th className="py-1 px-1">Unit</th>
                      <th className="py-1 px-1">N. R.</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {report.hematologyRight.map((item, idx) => (
                      <tr
                        key={idx}
                        className={item.isAbnormal ? 'bg-red-50/80 font-bold' : idx % 2 === 0 ? 'bg-slate-50/50' : ''}
                      >
                        <td className="py-1 px-1.5 font-bold text-slate-800">{item.testName}</td>
                        <td
                          className={`py-1 px-1 text-center font-extrabold ${
                            item.isAbnormal ? 'text-[#dc2626]' : 'text-slate-900'
                          }`}
                        >
                          {item.result} {item.isAbnormal && '★'}
                        </td>
                        <td className="py-1 px-1 text-center text-slate-500 font-mono text-[10px]">{item.unit}</td>
                        <td className="py-1 px-1 text-center text-slate-500 text-[9px] whitespace-pre-line leading-tight">
                          {item.normalRange}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* 4. قسم الكيمياء الحيوية والمصول (BIOCHEMICAL & SEROLOGICAL) */}
          <div className="grid grid-cols-12 gap-4 mb-4">
            {/* جدول الكيمياء الحيوية */}
            <div className="col-span-6 border border-[#0b3b8c] rounded-xl overflow-hidden flex flex-col">
              <div className="bg-[#0b3b8c] text-white text-center py-1.5 font-black tracking-widest uppercase text-xs">
                BIOCHEMICAL
              </div>
              <table className="w-full text-left border-collapse text-[10.5px]" style={{ direction: 'ltr' }}>
                <thead>
                  <tr className="bg-slate-100 text-slate-700 text-center font-bold border-b border-slate-300">
                    <th className="py-1 px-1 text-left pl-2">Test</th>
                    <th className="py-1 px-1">Result</th>
                    <th className="py-1 px-1">N. R. (mg/dl)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {report.biochemical.map((item, idx) => (
                    <tr
                      key={idx}
                      className={item.isAbnormal ? 'bg-red-50/80 font-bold' : idx % 2 === 0 ? 'bg-slate-50/50' : ''}
                    >
                      <td className="py-0.5 px-1 pl-2 font-bold text-slate-800">{item.testName}</td>
                      <td
                        className={`py-0.5 px-1 text-center font-extrabold ${
                          item.isAbnormal ? 'text-[#dc2626]' : 'text-slate-900'
                        }`}
                      >
                        {item.result} {item.isAbnormal && '★'}
                      </td>
                      <td className="py-0.5 px-1 text-center text-slate-500 text-[9px] whitespace-pre-line leading-tight">
                        {item.normalRange}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* جدول الفحوصات المصلية */}
            <div className="col-span-6 border border-[#0b3b8c] rounded-xl overflow-hidden flex flex-col">
              <div className="bg-[#0b3b8c] text-white text-center py-1.5 font-black tracking-widest uppercase text-xs">
                SEROLOGICAL
              </div>
              <table className="w-full text-left border-collapse text-[10.5px]" style={{ direction: 'ltr' }}>
                <thead>
                  <tr className="bg-slate-100 text-slate-700 text-center font-bold border-b border-slate-300">
                    <th className="py-1 px-1 text-left pl-1.5">Test</th>
                    <th className="py-1 px-1">Result</th>
                    <th className="py-1 px-1 border-l border-slate-300 text-left pl-1.5">Test</th>
                    <th className="py-1 px-1">Result</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {SEROLOGY_LEFT_KEYS.map((leftKey, idx) => {
                    const rightKey = SEROLOGY_RIGHT_KEYS[idx];
                    const leftRes = report.serological[leftKey] || '';
                    const rightRes = rightKey ? report.serological[rightKey] || '' : '';

                    const leftAbn =
                      leftRes.toLowerCase().includes('pos') || leftRes.toLowerCase().includes('react');
                    const rightAbn =
                      rightRes.toLowerCase().includes('pos') || rightRes.toLowerCase().includes('react');

                    return (
                      <tr key={idx} className={idx % 2 === 0 ? 'bg-slate-50/50' : ''}>
                        <td className="py-0.5 px-1 pl-1.5 font-bold text-slate-800">{getSeroName(leftKey)}</td>
                        <td
                          className={`py-0.5 px-1 text-center font-bold ${
                            leftAbn ? 'text-[#dc2626]' : 'text-slate-700'
                          }`}
                        >
                          {leftRes || '-'}
                        </td>
                        <td className="py-0.5 px-1 pl-1.5 font-bold text-slate-800 border-l border-slate-200">
                          {rightKey ? getSeroName(rightKey) : ''}
                        </td>
                        <td
                          className={`py-0.5 px-1 text-center font-bold ${
                            rightAbn ? 'text-[#dc2626]' : 'text-slate-700'
                          }`}
                        >
                          {rightRes || '-'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* ملاحظات الطبيب والمخبر إن وجدت */}
          {report.notes && (
            <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-[11px] mb-4 text-slate-700">
              <strong className="text-[#0b3b8c]">ملاحظات المخبر: </strong>
              {report.notes}
            </div>
          )}
        </div>

        {/* 5. التذييل الإلزامي المعتمد مع الختم وتوقيع مدير المختبر */}
        <div className="pt-4 mt-6 border-t-2 border-[#0b3b8c] text-center select-none">
          <h3 className="text-xs sm:text-sm md:text-base font-black text-[#0b3b8c] tracking-wide py-1">
            ملاحظة: النتيجة تخص هذه العينة فقط
          </h3>

          <div className="flex justify-between items-end mt-4 px-4 text-xs text-slate-700">
            <div className="text-left" style={{ direction: 'ltr' }}>
              <p className="text-[10px] text-slate-400 font-mono">Verified by: Al-Manar LIMS Engine</p>
              <p className="text-[10px] text-slate-400">Printed: {new Date().toLocaleString('en-GB')}</p>
            </div>

            <div className="text-center flex flex-col items-center">
              <div className="w-24 h-10 border-2 border-dashed border-blue-200 rounded-lg flex items-center justify-center text-[10px] text-blue-300 font-bold mb-1">
                الختم المخبري
              </div>
              <p className="font-extrabold text-[#0b3b8c]">مدير المختبر (Lab Director)</p>
            </div>
          </div>
        </div>
      </div>
    );
  }
);

OfficialReportSheet.displayName = 'OfficialReportSheet';
