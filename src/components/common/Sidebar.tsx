import {
  ChevronLeft,
  ChevronRight,
  FilePlus,
  FileText,
  LayoutDashboard,
  LogOut,
  Settings,
  ShieldCheck,
  Smartphone,
  Users
} from 'lucide-react';
import React from 'react';
import { useApp } from '../../context/AppContext';
import { ActiveScreen } from '../../types';
import { Logo } from './Logo';

export const Sidebar: React.FC = () => {
  const {
    activeScreen,
    setActiveScreen,
    reports,
    patients,
    user,
    logout,
    isSidebarCollapsed,
    toggleSidebarCollapse,
    firebaseConnected
  } = useApp();

  const navItems = [
    {
      id: 'dashboard',
      label: 'لوحة التحكم',
      icon: LayoutDashboard,
      badge: null
    },
    {
      id: 'add_invoice',
      label: 'إضافة تقرير جديد',
      icon: FilePlus,
      badge: 'جديد'
    },
    {
      id: 'reports_list',
      label: 'سجل التقارير الطبية',
      icon: FileText,
      badge: reports.length > 0 ? reports.length : null
    },
    {
      id: 'patient_profile',
      label: 'قاعدة بيانات المرضى',
      icon: Users,
      badge: patients.length > 0 ? patients.length : null
    },
    {
      id: 'backup_settings',
      label: 'النسخ الاحتياطي والإعدادات',
      icon: Settings,
      badge: null
    },
  ];

  return (
    <aside
      id="app-desktop-sidebar"
      aria-label="الشريط الجانبي الرئيسي"
      className={`bg-[#002e5b] text-white hidden md:flex flex-col select-none shrink-0 border-l border-blue-900/50 transition-all duration-300 ease-in-out relative z-30 shadow-xl ${
        isSidebarCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Toggle Collapse/Expand Floating Button */}
      <button
        id="sidebar-toggle-btn"
        onClick={toggleSidebarCollapse}
        title={isSidebarCollapsed ? 'توسيع القائمة الجانبية' : 'طي القائمة الجانبية'}
        aria-label={isSidebarCollapsed ? 'توسيع القائمة الجانبية' : 'طي القائمة الجانبية'}
        className="absolute -left-3.5 top-7 w-7 h-7 bg-white text-[#002e5b] rounded-full border-2 border-[#002e5b] shadow-md flex items-center justify-center hover:bg-blue-50 hover:scale-110 active:scale-95 transition-all z-40 cursor-pointer"
      >
        {isSidebarCollapsed ? (
          <ChevronLeft className="w-4 h-4 text-blue-900" />
        ) : (
          <ChevronRight className="w-4 h-4 text-blue-900" />
        )}
      </button>

      {/* Clinic Brand Header */}
      <div className={`border-b border-blue-900/50 flex flex-col items-center transition-all ${
        isSidebarCollapsed ? 'p-3 pt-5' : 'p-5'
      }`}>
        <div
          onClick={() => setActiveScreen('dashboard')}
          className={`cursor-pointer bg-white rounded-2xl flex items-center justify-center shadow-md transition-all ${
            isSidebarCollapsed ? 'w-11 h-11 mb-1' : 'w-14 h-14 mb-2.5'
          }`}
        >
          <Logo size={isSidebarCollapsed ? 'sm' : 'md'} showText={false} />
        </div>

        {!isSidebarCollapsed && (
          <div className="text-center animate-in fade-in duration-200">
            <h1 className="text-base font-black tracking-tight leading-snug">
              مختبر المنار الطبي
            </h1>
            <p className="text-[10px] font-medium uppercase tracking-wider text-blue-300">
              Medical Lab Pro
            </p>
          </div>
        )}

        {isSidebarCollapsed && (
          <span className="text-[9px] font-bold text-blue-300 uppercase mt-1">
            المنار
          </span>
        )}
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 p-3 space-y-1.5 overflow-y-auto overflow-x-hidden custom-scrollbar">
        {navItems.map((item) => {
          const isActive = activeScreen === item.id;
          const IconComponent = item.icon;

          return (
            <div key={item.id} className="relative group">
              <button
                id={`sidebar-nav-${item.id}`}
                onClick={() => setActiveScreen(item.id as ActiveScreen)}
                className={`w-full flex items-center rounded-xl transition-all cursor-pointer text-right ${
                  isSidebarCollapsed
                    ? 'justify-center p-3'
                    : 'space-x-3 space-x-reverse px-3.5 py-3'
                } ${
                  isActive
                    ? 'bg-blue-600 font-bold text-white shadow-lg shadow-blue-900/50 border-r-4 border-blue-300'
                    : 'hover:bg-blue-800/40 text-blue-100 hover:text-white'
                }`}
              >
                <div className="relative shrink-0">
                  <IconComponent className={`w-5 h-5 transition-transform group-hover:scale-110 ${
                    isActive ? 'text-white' : 'text-blue-200'
                  }`} />
                  {isSidebarCollapsed && item.badge && (
                    <span className="absolute -top-1.5 -left-1.5 w-2.5 h-2.5 bg-red-500 rounded-full ring-2 ring-[#002e5b]" />
                  )}
                </div>

                {!isSidebarCollapsed && (
                  <div className="flex-1 flex items-center justify-between overflow-hidden">
                    <span className="text-xs font-bold truncate">
                      {item.label}
                    </span>
                    {item.badge && (
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-black ${
                        item.badge === 'جديد'
                          ? 'bg-amber-400 text-amber-950'
                          : 'bg-blue-800 text-blue-200'
                      }`}>
                        {item.badge}
                      </span>
                    )}
                  </div>
                )}
              </button>

              {/* Tooltip on Hover when Collapsed */}
              {isSidebarCollapsed && (
                <div className="fixed hidden group-hover:flex items-center z-50 pointer-events-none translate-x-2 -translate-y-10">
                  <div className="bg-slate-900 text-white text-xs font-bold px-2.5 py-1.5 rounded-lg shadow-xl border border-slate-700 whitespace-nowrap">
                    {item.label}
                    {item.badge && ` (${item.badge})`}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* User Card & Quick Logout */}
      <div className={`border-t border-blue-900/40 bg-[#002244] transition-all ${
        isSidebarCollapsed ? 'p-2.5 flex flex-col items-center' : 'p-3.5'
      }`}>
        {!isSidebarCollapsed ? (
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 overflow-hidden">
              <div className="w-8 h-8 rounded-xl bg-blue-700 flex items-center justify-center text-xs font-black text-white shrink-0">
                د
              </div>
              <div className="overflow-hidden text-right">
                <p className="text-xs font-bold text-white truncate">{user?.name || 'مدير المختبر'}</p>
                <p className="text-[10px] text-blue-300 truncate">د. محمد السعيد</p>
              </div>
            </div>
            <button
              onClick={logout}
              title="تسجيل الخروج"
              className="p-1.5 text-blue-300 hover:text-red-300 hover:bg-red-500/20 rounded-lg transition-colors shrink-0 cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <button
            onClick={logout}
            title="تسجيل الخروج"
            className="p-2 text-blue-300 hover:text-red-300 hover:bg-red-500/20 rounded-xl transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
          </button>
        )}

        {!isSidebarCollapsed && (
          <div className="mt-2 space-y-1 border-t border-blue-900/30 pt-2 text-[10px]">
            <div className="flex items-center justify-center gap-1.5 text-blue-200">
              <span className={`w-2 h-2 rounded-full ${firebaseConnected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
              <span>{firebaseConnected ? 'سحابة Firebase متصلة' : 'جاري المزامنة مع السحابة'}</span>
            </div>
            <div className="text-blue-300/70 text-center flex items-center justify-center gap-1">
              <Smartphone className="w-3 h-3 text-sky-400" />
              <span>نظام المنار برو v2.4 • أندرويد وويب</span>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};
