/**
 * PrintSettings.tsx - مكون ضبط إعدادات الطباعة (الطابعة، المقاس، النسخ، الاتجاه)
 */

import { Check, CheckCircle2, Copy, FileText, Layout, Printer, Save } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { PrintOrientation, PrintPaperSize, PrintSettingsData } from '../../types/printTypes';

interface PrintSettingsProps {
  settings: PrintSettingsData;
  onChange: (settings: PrintSettingsData) => void;
  onSaveDefaults?: () => void;
}

export const PrintSettings: React.FC<PrintSettingsProps> = ({
  settings,
  onChange,
  onSaveDefaults,
}) => {
  const [savedFeedback, setSavedFeedback] = useState(false);

  // قائمة الطابعات المتصلة والمتاحة في بيئة العمل المخبرية
  const availablePrinters = [
    { id: 'p1', name: 'HP LaserJet Pro MFP M428fdw', desc: 'طابعة الاستقبال الرئيسية (شبكة سريعة)' },
    { id: 'p2', name: 'EPSON EcoTank L3150 Wi-Fi', desc: 'طابعة ملونة للتقارير الشاملة' },
    { id: 'p3', name: 'Canon imageCLASS LBP6030w', desc: 'طابعة المختبر المباشرة' },
    { id: 'p4', name: 'طباعة النظام الافتراضية / تصدير PDF', desc: 'حوار الطباعة المباشر من النظام' },
  ];

  const handleUpdate = <K extends keyof PrintSettingsData>(
    field: K,
    value: PrintSettingsData[K]
  ) => {
    onChange({
      ...settings,
      [field]: value,
    });
  };

  const handleSaveDefaults = () => {
    localStorage.setItem('almanar_default_print_settings', JSON.stringify(settings));
    setSavedFeedback(true);
    if (onSaveDefaults) onSaveDefaults();
    setTimeout(() => setSavedFeedback(false), 2500);
  };

  return (
    <div className="space-y-5 text-slate-800 dir-rtl text-xs sm:text-sm" dir="rtl">
      {/* 1. قائمة الطابعات المتصلة */}
      <div>
        <label className="font-extrabold text-slate-700 flex items-center gap-1.5 mb-2">
          <Printer className="w-4 h-4 text-[#0b3b8c]" />
          <span>اختر الطابعة المتصلة بالمختبر</span>
        </label>
        <div className="space-y-2">
          {availablePrinters.map((printer) => {
            const isSelected = settings.printerName === printer.name;
            return (
              <div
                key={printer.id}
                onClick={() => handleUpdate('printerName', printer.name)}
                className={`p-3 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                  isSelected
                    ? 'border-[#0b3b8c] bg-blue-50/80 text-[#0b3b8c] font-bold shadow-xs'
                    : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-xl ${isSelected ? 'bg-[#0b3b8c] text-white' : 'bg-slate-100 text-slate-500'}`}>
                    <Printer className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-bold dir-ltr text-right">{printer.name}</p>
                    <p className="text-[11px] text-slate-500 font-normal">{printer.desc}</p>
                  </div>
                </div>
                {isSelected && <Check className="w-5 h-5 text-[#0b3b8c] shrink-0" />}
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. عدد النسخ وحجم الورق */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* عدد النسخ */}
        <div className="bg-white p-3.5 rounded-2xl border border-slate-200">
          <label className="font-extrabold text-slate-700 flex items-center gap-1.5 mb-2">
            <Copy className="w-4 h-4 text-[#0b3b8c]" />
            <span>عدد النسخ المطلوبة</span>
          </label>
          <div className="flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => handleUpdate('copies', Math.max(1, settings.copies - 1))}
              className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 font-black text-base text-slate-800 transition-colors flex items-center justify-center select-none"
            >
              -
            </button>
            <span className="text-base font-black font-mono text-[#0b3b8c]">
              {settings.copies} {settings.copies === 1 ? 'نسخة' : 'نسخ'}
            </span>
            <button
              type="button"
              onClick={() => handleUpdate('copies', Math.min(20, settings.copies + 1))}
              className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 font-black text-base text-slate-800 transition-colors flex items-center justify-center select-none"
            >
              +
            </button>
          </div>
        </div>

        {/* حجم الورق */}
        <div className="bg-white p-3.5 rounded-2xl border border-slate-200">
          <label className="font-extrabold text-slate-700 flex items-center gap-1.5 mb-2">
            <FileText className="w-4 h-4 text-[#0b3b8c]" />
            <span>حجم الورق</span>
          </label>
          <div className="grid grid-cols-2 gap-2">
            {(['A4', 'A5'] as PrintPaperSize[]).map((size) => (
              <button
                key={size}
                type="button"
                onClick={() => handleUpdate('paperSize', size)}
                className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all ${
                  settings.paperSize === size
                    ? 'bg-[#0b3b8c] text-white border-[#0b3b8c] shadow-xs'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {size} {size === 'A4' ? '(المعياري)' : '(نصف صفحة)'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 3. اتجاه الصفحة */}
      <div className="bg-white p-3.5 rounded-2xl border border-slate-200">
        <label className="font-extrabold text-slate-700 flex items-center gap-1.5 mb-2">
          <Layout className="w-4 h-4 text-[#0b3b8c]" />
          <span>اتجاه الصفحة</span>
        </label>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => handleUpdate('orientation', 'portrait')}
            className={`p-3 rounded-xl border flex items-center justify-center gap-2 text-xs font-bold transition-all ${
              settings.orientation === 'portrait'
                ? 'bg-blue-50 border-[#0b3b8c] text-[#0b3b8c]'
                : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
            }`}
          >
            <div className="w-4 h-5 border-2 border-current rounded-xs" />
            <span>عمودي (Portrait - قياسي)</span>
          </button>
          <button
            type="button"
            onClick={() => handleUpdate('orientation', 'landscape')}
            className={`p-3 rounded-xl border flex items-center justify-center gap-2 text-xs font-bold transition-all ${
              settings.orientation === 'landscape'
                ? 'bg-blue-50 border-[#0b3b8c] text-[#0b3b8c]'
                : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
            }`}
          >
            <div className="w-5 h-4 border-2 border-current rounded-xs" />
            <span>أفقي (Landscape)</span>
          </button>
        </div>
      </div>

      {/* زر حفظ الإعدادات الافتراضية */}
      <div className="flex items-center justify-between pt-2">
        <p className="text-xs text-slate-500 font-medium">
          يمكنك حفظ هذه الإعدادات ليتم تطبيقها تلقائياً عند طباعة أي تقرير قادم.
        </p>
        <button
          type="button"
          onClick={handleSaveDefaults}
          className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shrink-0"
        >
          {savedFeedback ? (
            <>
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span className="text-emerald-700">تم الحفظ كافتراضي</span>
            </>
          ) : (
            <>
              <Save className="w-4 h-4 text-slate-600" />
              <span>حفظ كإعدادات افتراضية</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
