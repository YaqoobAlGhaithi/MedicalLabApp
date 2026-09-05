import {
  FilePlus,
  FileText,
  HelpCircle,
  LayoutDashboard,
  LogOut,
  Phone,
  Settings,
  ShieldCheck,
  Smartphone,
  Users,
  Wifi,
  X
} from 'lucide-react';
import React from 'react';
import { useApp } from '../../context/AppContext';
import { ActiveScreen } from '../../types';
import { Logo } from './Logo';

export const MobileSidebarDrawer: React.FC = () => {
  const {
    activeScreen,
    setActiveScreen,
    reports,
    patients,
    user,
    logout,
    isMobileSidebarOpen,
    setIsMobileSidebarOpen
  } = useApp();

  if (!isMobileSidebarOpen) return null;

  const navItems = [
    {
      id: 'dashboard',
      label: 'لوحة التحكم المركزية',
      description: 'نظرة عامة وإحصائيات العمل',
      icon: LayoutDashboard,
      badge: null
    },
    {
      id: 'add_invoice',
      label: 'إضافة تقرير / فاتورة',
      description: 'تسجيل مريض وإدخال تحاليل',
      icon: FilePlus,
      badge: 'جديد'
    },
    {
      id: 'reports_list',
      label: 'سجل التقارير الطبية',
      description: 'معاينة واعتماد وتصدير PDF',
      icon: FileText,
      badge: reports.length > 0 ? reports.length : null
    },
    {
      id: 'patient_profile',
      label: 'قاعدة بيانات المرضى',
      description: 'السجلات الطبية وتاريخ الزيارات',
      icon: Users,
      badge: patients.length > 0 ? patients.length : null
    },
    {
      id: 'backup_settings',
      label: 'النسخ الاحتياطي والإعدادات',
      description: 'تخصيص الهوية والترويسة والمزامنة',
      icon: Settings,
      badge: null
    },
  ];

  return (
    <div
      id="android-mobile-sidebar-backdrop"
      className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-50 md:hidden animate-in fade-in duration-200"
      onClick={() => setIsMobileSidebarOpen(false)}
      dir="rtl"
    >
      <div
        id="android-mobile-sidebar-drawer"
        className="fixed top-0 bottom-0 right-0 w-72 max-w-[85vw] h-full bg-[#002e5b] text-white flex flex-col shadow-2xl z-50 animate-in slide-in-from-right duration-300 border-l border-blue-900/50"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drawer Header */}
        <div className="p-4 border-b border-blue-900/60 flex items-center justify-between bg-[#002244]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-md shrink-0">
              <Logo size="sm" showText={false} />
            </div>
            <div>
              <h2 className="font-extrabold text-sm text-white tracking-tight">
                مختبر المنار الطبي
              </h2>
              <span className="text-[10px] text-blue-300 font-medium tracking-wider uppercase">
                Medical Lab Pro
              </span>
            </div>
          </div>

          <button
            onClick={() => setIsMobileSidebarOpen(false)}
            aria-label="إغلاق القائمة"
            className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 active:scale-95 flex items-center justify-center text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Doctor on-duty Quick Card */}
        <div className="p-3.5 mx-3 mt-3 rounded-2xl bg-blue-900/40 border border-blue-800/60 flex items-center justify-between">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-sky-400 text-white font-black text-xs flex items-center justify-center shadow-sm shrink-0">
              د
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-bold text-white truncate">
                {user?.name || 'مدير المختبر'}
              </p>
              <p className="text-[10px] text-blue-300 flex items-center gap-1 truncate">
                <ShieldCheck className="w-3 h-3 text-emerald-400" />
                استشاري تحاليل طبية
              </p>
            </div>
          </div>
          <button
            onClick={logout}
            title="تسجيل الخروج"
            aria-label="تسجيل الخروج"
            className="p-1.5 text-blue-300 hover:text-red-300 hover:bg-red-500/20 rounded-lg transition-colors shrink-0 cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>

        {/* Offline & System Health Badge */}
        <div className="px-3 pt-2">
          <div className="bg-emerald-950/40 border border-emerald-800/40 rounded-xl px-2.5 py-1.5 flex items-center justify-between text-[10px] text-emerald-300">
            <span className="flex items-center gap-1 font-medium">
              <Wifi className="w-3 h-3 text-emerald-400" />
              جاهز للعمل دون اتصال (Offline)
            </span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          </div>
        </div>

        {/* Navigation Items List */}
        <nav className="flex-1 px-3 py-3 space-y-1.5 overflow-y-auto custom-scrollbar">
          {navItems.map((item) => {
            const isActive = activeScreen === item.id;
            const IconComponent = item.icon;

            return (
              <button
                key={item.id}
                id={`drawer-nav-${item.id}`}
                onClick={() => {
                  setActiveScreen(item.id as ActiveScreen);
                  setIsMobileSidebarOpen(false);
                }}
                className={`w-full flex items-center justify-between p-2.5 rounded-xl transition-all cursor-pointer text-right group ${
                  isActive
                    ? 'bg-blue-600 text-white font-bold shadow-md shadow-blue-950/40 border-r-4 border-blue-300'
                    : 'hover:bg-blue-800/30 text-blue-100 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${
                    isActive ? 'bg-white/20 text-white' : 'bg-blue-950/60 text-blue-300 group-hover:text-white'
                  }`}>
                    <IconComponent className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold block">{item.label}</span>
                    <span className="text-[9px] text-blue-300/80 line-clamp-1">{item.description}</span>
                  </div>
                </div>

                {item.badge && (
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-black ${
                    item.badge === 'جديد'
                      ? 'bg-amber-400 text-amber-950'
                      : 'bg-blue-900 text-blue-200'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Technical Support and Mobile App Footer */}
        <div className="p-3.5 border-t border-blue-900/60 bg-[#002244] space-y-2 text-center select-text">
          <div className="flex items-center justify-center gap-1.5 text-[11px] font-bold text-blue-200">
            <Smartphone className="w-3.5 h-3.5 text-sky-400" />
            <span>نظام عيادة المنار برو • إصدار الأندرويد v2.4</span>
          </div>

          <div className="flex items-center justify-center gap-2 text-[10px] text-blue-300/80">
            <span className="flex items-center gap-1">
              <Phone className="w-3 h-3 text-blue-400" />
              الدعم: 777-123-456
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <HelpCircle className="w-3 h-3 text-blue-400" />
              مساعدة
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
