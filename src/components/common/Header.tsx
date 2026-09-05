import { ArrowRight, Bell, LogOut, Menu, Printer, ShieldCheck } from 'lucide-react';
import React from 'react';
import { useApp } from '../../context/AppContext';
import { ActiveScreen } from '../../types';

interface HeaderProps {
  title?: string;
  showBack?: boolean;
  onBack?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ title, showBack = false, onBack }) => {
  const { activeScreen, setActiveScreen, user, logout, setPrintModalOpen, toggleMobileSidebar } = useApp();

  const getTitle = () => {
    if (title) return title;
    switch (activeScreen) {
      case 'dashboard': return 'الصفحة الرئيسية';
      case 'add_invoice': return 'فاتورة جديدة';
      case 'report_view': return 'عرض التقرير';
      case 'reports_list': return 'سجل التقارير';
      case 'patient_profile': return 'ملف المريض';
      case 'backup_settings': return 'النسخ الاحتياطي والإعدادات';
      default: return 'مختبرات المنار';
    }
  };

  const handleBack = () => {
    if (onBack) {
      onBack();
      return;
    }
    setActiveScreen('dashboard');
  };

  return (
    <header className="bg-[#0b2b4d] text-white shadow-md sticky top-0 z-30 px-3 md:px-5 py-2.5 md:py-3 flex items-center justify-between select-none">
      {/* Left side (in RTL, this is right side) */}
      <div className="flex items-center gap-2 md:gap-3">
        {showBack || activeScreen !== 'dashboard' ? (
          <button
            onClick={handleBack}
            className="p-2 hover:bg-white/10 active:bg-white/20 rounded-xl transition-colors flex items-center justify-center text-white cursor-pointer"
            title="رجوع"
            aria-label="رجوع"
          >
            <ArrowRight className="w-5 h-5 md:w-6 md:h-6" />
          </button>
        ) : null}

        {/* Mobile drawer toggle */}
        <button
          onClick={toggleMobileSidebar}
          className="md:hidden p-2 hover:bg-white/10 active:bg-white/20 rounded-xl transition-colors flex items-center justify-center text-white cursor-pointer"
          title="فتح القائمة الجانبية"
          aria-label="فتح القائمة الجانبية"
        >
          <Menu className="w-5 h-5" />
        </button>

        <h1 className="font-bold text-base md:text-lg tracking-wide truncate max-w-[200px] sm:max-w-none">
          {getTitle()}
        </h1>
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setPrintModalOpen(true)}
          className="p-2 hover:bg-white/15 bg-white/10 rounded-full transition-colors relative flex items-center justify-center"
          title="خيارات الطباعة السريعة"
        >
          <Printer className="w-5 h-5 text-blue-200" />
        </button>

        <button
          onClick={() => setActiveScreen('reports_list')}
          className="p-2 hover:bg-white/15 bg-white/10 rounded-full transition-colors relative flex items-center justify-center"
          title="التنبيهات والتقارير"
        >
          <Bell className="w-5 h-5 text-yellow-300" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
        </button>

        {user && (
          <div className="flex items-center gap-2 pl-1 border-r border-white/20 mr-1">
            <div
              onClick={() => setActiveScreen('backup_settings')}
              className="w-8 h-8 rounded-full bg-blue-500/30 border border-blue-300 flex items-center justify-center cursor-pointer font-bold text-xs"
            >
              <ShieldCheck className="w-4 h-4 text-green-300" />
            </div>
            <button
              onClick={logout}
              className="p-1.5 hover:bg-red-500/20 text-red-300 rounded-lg transition-colors"
              title="تسجيل الخروج"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
