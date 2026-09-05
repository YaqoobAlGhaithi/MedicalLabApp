/**
 * ShareMenu.tsx - قائمة مشاركة التقرير الطبي على خطوتين
 * الخطوة 1: اختيار صيغة المشاركة (PDF, PNG, JPG)
 * الخطوة 2: اختيار التطبيق (واتساب، تليجرام، إيميل، بلوتوث، مشاركة قريبة، أندرويد Intent)
 */

import {
  ArrowRight,
  Bluetooth,
  CheckCircle2,
  FileCode,
  FileDown,
  FileImage,
  FileText,
  Mail,
  Radio,
  Send,
  Share2,
} from 'lucide-react';
import React, { useState } from 'react';
import { ExportFormat, ShareChannel } from '../../types/printTypes';

interface ShareMenuProps {
  onShare: (format: ExportFormat, channel: ShareChannel) => void;
  isSharing?: boolean;
}

export const ShareMenu: React.FC<ShareMenuProps> = ({ onShare, isSharing = false }) => {
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>('pdf');
  const [selectedChannel, setSelectedChannel] = useState<ShareChannel>('whatsapp');

  const formatOptions: { id: ExportFormat; title: string; desc: string; icon: React.ComponentType<{ className?: string }> }[] = [
    {
      id: 'pdf',
      title: 'مستند PDF طبي',
      desc: 'الصيغة الرسمية المعتمدة للطباعة وحفظ السجلات الطبية بدقة عالية.',
      icon: FileText,
    },
    {
      id: 'png',
      title: 'صورة PNG نقية',
      desc: 'صورة فائقة الوضوح مناسبة للمراسلات السريعة والمشاركة على الهواتف.',
      icon: FileImage,
    },
    {
      id: 'jpg',
      title: 'صورة JPG مضغوطة',
      desc: 'حجم ملف صغير جداً مثالي للشبكات الضعيفة ومحادثات الدردشة.',
      icon: FileCode,
    },
  ];

  const shareApps: {
    id: ShareChannel;
    name: string;
    desc: string;
    iconBg: string;
    iconColor: string;
    icon: React.ComponentType<{ className?: string }>;
  }[] = [
    {
      id: 'whatsapp',
      name: 'واتساب (WhatsApp)',
      desc: 'إرسال مباشر إلى المريض أو الطبيب المعالج عبر محادثة واتساب',
      iconBg: 'bg-emerald-500',
      iconColor: 'text-white',
      icon: Send,
    },
    {
      id: 'telegram',
      name: 'تليجرام (Telegram)',
      desc: 'إرسال التقرير كملف غير مضغوط عبر قنوات أو رسائل تليجرام',
      iconBg: 'bg-sky-500',
      iconColor: 'text-white',
      icon: Send,
    },
    {
      id: 'email',
      name: 'البريد الإلكتروني (Email)',
      desc: 'إرفاق التقرير في رسالة رسمية للمريض أو شركة التأمين',
      iconBg: 'bg-rose-500',
      iconColor: 'text-white',
      icon: Mail,
    },
    {
      id: 'bluetooth',
      name: 'بلوتوث (Bluetooth)',
      desc: 'نقل التقرير المباشر لهاتف المراجع أو طابعة خارجية بدون إنترنت',
      iconBg: 'bg-blue-600',
      iconColor: 'text-white',
      icon: Bluetooth,
    },
    {
      id: 'nearby',
      name: 'المشاركة القريبة (Quick Share)',
      desc: 'إرسال سريع للأجهزة القريبة عبر تقنية أندرويد Nearby Share',
      iconBg: 'bg-indigo-600',
      iconColor: 'text-white',
      icon: Radio,
    },
    {
      id: 'native_intent',
      name: 'مشاركة النظام الشاملة (Android Intent)',
      desc: 'فتح نافذة المشاركة العامة في أندرويد لاختيار أي تطبيق مثبت',
      iconBg: 'bg-slate-800',
      iconColor: 'text-white',
      icon: Share2,
    },
  ];

  const handleExecuteShare = () => {
    onShare(selectedFormat, selectedChannel);
  };

  return (
    <div className="space-y-6 dir-rtl text-xs sm:text-sm" dir="rtl">
      
      {/* الخطوة 1: اختيار صيغة المشاركة */}
      <div>
        <div className="flex items-center justify-between mb-2.5">
          <label className="font-extrabold text-slate-800 flex items-center gap-1.5">
            <span className="w-5 h-5 rounded-full bg-[#0b3b8c] text-white flex items-center justify-center text-[10px] font-black">
              1
            </span>
            <span>الخطوة الأولى: اختيار صيغة الملف</span>
          </label>
          <span className="text-[11px] text-slate-500">
            الصيغة المحددة: <strong className="text-[#0b3b8c] uppercase font-mono">{selectedFormat}</strong>
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {formatOptions.map((fmt) => {
            const Icon = fmt.icon;
            const isSelected = selectedFormat === fmt.id;
            return (
              <div
                key={fmt.id}
                onClick={() => setSelectedFormat(fmt.id)}
                className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between ${
                  isSelected
                    ? 'border-[#0b3b8c] bg-blue-50/80 ring-2 ring-[#0b3b8c]/20 shadow-xs'
                    : 'border-slate-200 bg-white hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className={`p-2 rounded-xl ${isSelected ? 'bg-[#0b3b8c] text-white' : 'bg-slate-100 text-slate-600'}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  {isSelected && <CheckCircle2 className="w-4 h-4 text-[#0b3b8c]" />}
                </div>
                <div>
                  <h4 className="font-extrabold text-slate-900">{fmt.title}</h4>
                  <p className="text-[11px] text-slate-500 mt-1 leading-snug">{fmt.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* الخطوة 2: اختيار تطبيق أو قناة المشاركة */}
      <div>
        <div className="flex items-center justify-between mb-2.5">
          <label className="font-extrabold text-slate-800 flex items-center gap-1.5">
            <span className="w-5 h-5 rounded-full bg-[#0b3b8c] text-white flex items-center justify-center text-[10px] font-black">
              2
            </span>
            <span>الخطوة الثانية: اختيار تطبيق أو وسيلة المشاركة</span>
          </label>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {shareApps.map((app) => {
            const Icon = app.icon;
            const isSelected = selectedChannel === app.id;
            return (
              <div
                key={app.id}
                onClick={() => setSelectedChannel(app.id)}
                className={`p-3 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                  isSelected
                    ? 'border-[#0b3b8c] bg-blue-50/80 shadow-xs ring-1 ring-[#0b3b8c]/30'
                    : 'border-slate-200 bg-white hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-xl ${app.iconBg} ${app.iconColor} flex items-center justify-center shrink-0 shadow-xs`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="font-bold text-slate-900">{app.name}</h5>
                    <p className="text-[10px] text-slate-500 leading-tight">{app.desc}</p>
                  </div>
                </div>
                <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                  isSelected ? 'border-[#0b3b8c] bg-[#0b3b8c]' : 'border-slate-300'
                }`}>
                  {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* زر تنفيذ المشاركة المباشرة */}
      <div className="pt-2">
        <button
          type="button"
          disabled={isSharing}
          onClick={handleExecuteShare}
          className="w-full py-3.5 px-5 bg-gradient-to-r from-[#0b3b8c] to-[#002e5b] hover:opacity-95 text-white font-extrabold rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 text-sm disabled:opacity-50"
        >
          <Share2 className="w-4 h-4" />
          <span>{isSharing ? 'جاري تجهيز ومشاركة الملف...' : `مشاركة التقرير كـ ${selectedFormat.toUpperCase()} الآن`}</span>
        </button>
      </div>

    </div>
  );
};
