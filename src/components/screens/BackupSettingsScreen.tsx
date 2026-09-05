import { AlertCircle, Database, Download, HardDrive, Info, Moon, RefreshCw, Save, Sun, Upload, Trash2 } from 'lucide-react';
import React, { useRef, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Header } from '../common/Header';

export const BackupSettingsScreen: React.FC = () => {
  const { settings, updateSettings, exportBackupJson, importBackupJson, reports, patients, doctors, setActiveScreen } = useApp();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);
  const [importStatus, setImportStatus] = useState<string>('');

  const [formSettings, setFormSettings] = useState(settings);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (result) {
        setFormSettings(p => ({ ...p, logoUrl: result }));
      }
    };
    reader.readAsDataURL(file);
  };

  const handleBannerUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (result) {
        setFormSettings(p => ({ ...p, headerBannerUrl: result }));
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings(formSettings);
    alert('تم حفظ الإعدادات العامة بنجاح');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const success = importBackupJson(content);
        if (success) {
          setImportStatus('تمت استعادة النسخة الاحتياطية بنجاح! تم تحديث سجل التقارير والمرضى.');
          setTimeout(() => setImportStatus(''), 6000);
        } else {
          setImportStatus('خطأ: ملف النسخة الاحتياطية غير صالح أو تالف.');
        }
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col select-none dir-rtl" dir="rtl">
      <Header title="النسخ الاحتياطي وإعدادات النظام" showBack onBack={() => setActiveScreen('dashboard')} />

      <div className="p-4 md:p-8 max-w-6xl mx-auto w-full flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 pb-28 md:pb-8">
        
        {/* BACKUP & RESTORE SECTION (Cols 6) Replica of Image 1 */}
        <div className="lg:col-span-6 space-y-6">
          <div className="bg-white rounded-3xl p-6 md:p-8 shadow-xs border border-slate-200 space-y-6">
            <div className="border-b border-slate-100 pb-4 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-extrabold text-slate-800 flex items-center gap-2">
                  <Database className="w-5 h-5 text-[#0b3b8c]" /> إدارة النسخ الاحتياطي للبيانات
                </h2>
                <p className="text-xs text-slate-400">حماية تقارير المرضى من الضياع ونقلها بسهولة</p>
              </div>
            </div>

            {importStatus && (
              <div className="p-3.5 bg-blue-50 border border-blue-200 text-blue-800 rounded-2xl text-xs font-bold flex items-center gap-2">
                <Info className="w-4 h-4 shrink-0" /> {importStatus}
              </div>
            )}

            {/* Create Backup Box */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200/80 text-center space-y-3">
              <div className="w-12 h-12 bg-[#0b3b8c] text-white rounded-full flex items-center justify-center mx-auto shadow-md">
                <Download className="w-6 h-6 animate-bounce" />
              </div>
              <h3 className="font-bold text-slate-800 text-sm">إنشاء نسخة احتياطية فورية (JSON)</h3>
              <p className="text-xs text-slate-500">سيتم حفظ جميع بيانات المختبر ({reports.length} تقرير، {patients.length} مريض، {doctors.length} أطباء) في ملف واحد آمن على جهازك</p>
              <button
                type="button"
                onClick={exportBackupJson}
                className="w-full py-3 bg-[#0b3b8c] hover:bg-blue-900 active:scale-98 text-white font-extrabold rounded-xl shadow-md text-xs transition-all"
              >
                إنشاء وتنزيل النسخة الاحتياطية الآن
              </button>
            </div>

            {/* Restore Backup Box */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-3">
              <div className="w-12 h-12 bg-green-600 text-white rounded-full flex items-center justify-center mx-auto shadow-md">
                <Upload className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-800 text-sm">استعادة نسخة احتياطية سابقة</h3>
              <p className="text-xs text-slate-500">اختر ملف النسخة الاحتياطية لاستعادة السجلات وقاعدة البيانات بالكامل</p>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept=".json"
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 active:scale-98 text-white font-extrabold rounded-xl shadow-md text-xs transition-all"
              >
                اختر ملف النسخة الاحتياطية للاستعادة الآن
              </button>
            </div>

            {/* Auto Backup Toggle */}
            <div className="pt-4 border-t flex items-center justify-between">
              <div>
                <span className="font-bold text-xs text-slate-800 block">النسخ الاحتياطي التلقائي التنبيهي</span>
                <span className="text-[10px] text-slate-400">تذكير وإنشاء نسخة تلقائياً كل 7 أيام</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={formSettings.autoBackup}
                  onChange={(e) => setFormSettings(p => ({ ...p, autoBackup: e.target.checked }))}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:right-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0b3b8c]" />
              </label>
            </div>
          </div>
        </div>

        {/* SETTINGS FORM SECTION (Cols 6) Replica of Image 1 */}
        <div className="lg:col-span-6 space-y-6">
          <form onSubmit={handleSaveSettings} className="bg-white rounded-3xl p-6 md:p-8 shadow-xs border border-slate-200 space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <h2 className="text-lg font-extrabold text-slate-800 flex items-center gap-2">
                <HardDrive className="w-5 h-5 text-[#0b3b8c]" /> الإعدادات العامة للمختبر والطباعة
              </h2>
              <p className="text-xs text-slate-400">تخصيص ترويسة التقارير والطابعة الافتراضية</p>
            </div>

            <div className="space-y-4">
              {/* Logo Upload Box */}
              <div className="space-y-2 p-4 bg-slate-50 border border-slate-200 rounded-2xl">
                <label className="text-xs font-bold text-slate-700 block">شعار المختبر (اللوجو)</label>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-xl border border-slate-300 bg-white flex items-center justify-center overflow-hidden shrink-0 shadow-xs p-1">
                    {formSettings.logoUrl ? (
                      <img src={formSettings.logoUrl} alt="Logo" className="w-full h-full object-contain rounded-lg" />
                    ) : (
                      <span className="text-[10px] text-slate-400 font-bold text-center">افتراضي</span>
                    )}
                  </div>
                  <div className="flex-1 space-y-2">
                    <input
                      type="file"
                      ref={logoInputRef}
                      onChange={handleLogoUpload}
                      accept="image/*"
                      className="hidden"
                    />
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => logoInputRef.current?.click()}
                        className="px-4 py-2 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer"
                      >
                        <Upload className="w-3.5 h-3.5 text-blue-600" /> رفع شعار جديد
                      </button>
                      {formSettings.logoUrl && (
                        <button
                          type="button"
                          onClick={() => setFormSettings(p => ({ ...p, logoUrl: undefined }))}
                          className="px-3 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl text-xs font-bold flex items-center gap-1 transition-all cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> حذف الشعار
                        </button>
                      )}
                    </div>
                    <p className="text-[10px] text-slate-400">صيغ الصور المدعومة: PNG, JPG, WEBP. سيتم تطبيق الشعار تلقائياً في التقارير وجميع واجهات التطبيق.</p>
                  </div>
                </div>
              </div>

              {/* Header Banner Upload Box */}
              <div className="space-y-2 p-4 bg-blue-50/50 border border-blue-200 rounded-2xl">
                <label className="text-xs font-bold text-slate-800 block">صورة ترويسة التقرير كاملة (صورة الهيدر في رأس التقرير)</label>
                <div className="flex flex-col gap-3">
                  <div className="w-full h-24 rounded-xl border border-blue-200 bg-white flex items-center justify-center overflow-hidden shrink-0 shadow-2xs p-1">
                    {formSettings.headerBannerUrl ? (
                      <img src={formSettings.headerBannerUrl} alt="Header Banner" className="w-full h-full object-contain" />
                    ) : (
                      <span className="text-xs text-slate-400 font-bold text-center">ترويسة نصية افتراضية (استخدم زر الرفع أدناه لاستبدالها بصورة الترويسة المخصصة)</span>
                    )}
                  </div>
                  <div className="flex-1 space-y-2">
                    <input
                      type="file"
                      ref={bannerInputRef}
                      onChange={handleBannerUpload}
                      accept="image/*"
                      className="hidden"
                    />
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => bannerInputRef.current?.click()}
                        className="px-4 py-2 bg-[#0b3b8c] hover:bg-blue-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
                      >
                        <Upload className="w-3.5 h-3.5" /> رفع ترويسة التقرير (Header)
                      </button>
                      {formSettings.headerBannerUrl && (
                        <button
                          type="button"
                          onClick={() => setFormSettings(p => ({ ...p, headerBannerUrl: undefined }))}
                          className="px-3 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl text-xs font-bold flex items-center gap-1 transition-all cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> حذف صورة الترويسة
                        </button>
                      )}
                    </div>
                    <p className="text-[10px] text-slate-500">عند رفع صورة ترويسة (بانر)، سيتم استبدال النص الافتراضي في أعلى جميع التقارير بهذه الصورة الثابتة.</p>
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">اسم المختبر بالعربية</label>
                <input
                  type="text"
                  value={formSettings.labNameAr}
                  onChange={(e) => setFormSettings(p => ({ ...p, labNameAr: e.target.value }))}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:bg-white focus:border-blue-600 outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">اسم المختبر بالإنجليزية (للهيدر التقريري)</label>
                <input
                  type="text"
                  value={formSettings.labNameEn}
                  onChange={(e) => setFormSettings(p => ({ ...p, labNameEn: e.target.value }))}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold dir-ltr text-left text-slate-800 focus:bg-white focus:border-blue-600 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 block">هاتف التواصل 1</label>
                  <input
                    type="text"
                    value={formSettings.phone1}
                    onChange={(e) => setFormSettings(p => ({ ...p, phone1: e.target.value }))}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-800 focus:bg-white focus:border-blue-600 outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 block">هاتف التواصل 2</label>
                  <input
                    type="text"
                    value={formSettings.phone2}
                    onChange={(e) => setFormSettings(p => ({ ...p, phone2: e.target.value }))}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-800 focus:bg-white focus:border-blue-600 outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">العنوان الجغرافي (يظهر أسفل الشعار)</label>
                <input
                  type="text"
                  value={formSettings.address}
                  onChange={(e) => setFormSettings(p => ({ ...p, address: e.target.value }))}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:bg-white focus:border-blue-600 outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">الطابعة المتصلة الافتراضية</label>
                <select
                  value={formSettings.defaultPrinter}
                  onChange={(e) => setFormSettings(p => ({ ...p, defaultPrinter: e.target.value }))}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 appearance-none outline-none"
                >
                  <option value="HP LaserJet MFP (192.168.1.15)">HP LaserJet MFP (192.168.1.15)</option>
                  <option value="EPSON L3150 (192.168.1.20)">EPSON L3150 (192.168.1.20)</option>
                  <option value="Bluetooth Printer (00:11:22:33:44)">Bluetooth Printer (00:11:22:33:44)</option>
                  <option value="Save as PDF">Save as PDF (تصدير كملف)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="p-3.5 bg-slate-50 border rounded-xl flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700">اللغة (Language)</span>
                  <span className="text-xs bg-blue-100 text-blue-800 px-2.5 py-0.5 rounded font-bold">العربية (AR)</span>
                </div>
                <div className="p-3.5 bg-slate-50 border rounded-xl flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700">المظهر (Theme)</span>
                  <span className="text-xs bg-slate-200 text-slate-800 px-2 py-0.5 rounded font-bold flex items-center gap-1">
                    <Sun className="w-3.5 h-3.5" /> فاتح
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t flex justify-end">
              <button
                type="submit"
                className="px-8 py-3 bg-[#0b3b8c] hover:bg-blue-900 active:scale-95 text-white font-bold rounded-xl shadow-md text-xs flex items-center gap-2 transition-all"
              >
                <Save className="w-4 h-4" /> حفظ التعديلات الإعدادية
              </button>
            </div>
          </form>

          <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-[11px] text-amber-900 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <span>نظام Al-Manar Medical Lab Report Pro مصمم ليعمل حتى دون اتصال بالإنترنت (Offline-First) مع الحفاظ على التنسيقات الدقيقة للطباعة.</span>
          </div>
        </div>

      </div>
    </div>
  );
};
