import { FilePlus2, FileText, LayoutDashboard, Menu, Users } from 'lucide-react';
import React from 'react';
import { useApp } from '../../context/AppContext';
import { ActiveScreen } from '../../types';

export const MobileBottomNav: React.FC = () => {
  const { activeScreen, setActiveScreen, reports, patients, toggleMobileSidebar, isMobileSidebarOpen } = useApp();

  // Hide bottom nav on splash, login or report_view screens
  if (activeScreen === 'splash' || activeScreen === 'login' || activeScreen === 'report_view') {
    return null;
  }

  return (
    <nav
      id="android-mobile-bottom-navigation"
      dir="rtl"
      aria-label="شريط التنقل السفلي"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/90 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-1.5 transition-all select-none"
    >
      <div className="grid grid-cols-5 items-center justify-around max-w-lg mx-auto">
        
        {/* 1. الرئيسية */}
        <button
          type="button"
          id="mobile-nav-dashboard"
          onClick={() => setActiveScreen('dashboard')}
          aria-label="الرئيسية"
          className={`flex flex-col items-center justify-center min-h-[48px] py-1 px-1 rounded-xl transition-all cursor-pointer relative ${
            activeScreen === 'dashboard'
              ? 'text-[#0b3b8c] font-black'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <div className={`p-1.5 rounded-xl transition-all ${
            activeScreen === 'dashboard' ? 'bg-blue-50 text-[#0b3b8c]' : ''
          }`}>
            <LayoutDashboard className="w-5 h-5" />
          </div>
          <span className="text-[10px] tracking-tight mt-0.5">الرئيسية</span>
          {activeScreen === 'dashboard' && (
            <span className="w-1.5 h-1.5 rounded-full bg-[#0b3b8c] absolute bottom-0.5" />
          )}
        </button>

        {/* 2. التقارير */}
        <button
          type="button"
          id="mobile-nav-reports"
          onClick={() => setActiveScreen('reports_list')}
          aria-label="التقارير"
          className={`flex flex-col items-center justify-center min-h-[48px] py-1 px-1 rounded-xl transition-all cursor-pointer relative ${
            activeScreen === 'reports_list'
              ? 'text-[#0b3b8c] font-black'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <div className="relative">
            <div className={`p-1.5 rounded-xl transition-all ${
              activeScreen === 'reports_list' ? 'bg-blue-50 text-[#0b3b8c]' : ''
            }`}>
              <FileText className="w-5 h-5" />
            </div>
            {reports.length > 0 && (
              <span className="absolute -top-0.5 -left-1 bg-[#0b3b8c] text-white text-[9px] font-black px-1.5 min-w-[16px] h-4 rounded-full flex items-center justify-center ring-2 ring-white">
                {reports.length > 99 ? '99+' : reports.length}
              </span>
            )}
          </div>
          <span className="text-[10px] tracking-tight mt-0.5">التقارير</span>
          {activeScreen === 'reports_list' && (
            <span className="w-1.5 h-1.5 rounded-full bg-[#0b3b8c] absolute bottom-0.5" />
          )}
        </button>

        {/* 3. زر مركزي بارز: + فاتورة جديدة */}
        <div className="flex items-center justify-center">
          <button
            type="button"
            id="mobile-nav-add-invoice"
            onClick={() => setActiveScreen('add_invoice')}
            aria-label="إضافة فاتورة جديدة"
            className="flex flex-col items-center justify-center -mt-5 group cursor-pointer focus:outline-none"
          >
            <div className="w-13 h-13 rounded-2xl bg-gradient-to-tr from-[#002e5b] via-[#0b3b8c] to-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-900/35 border-2 border-white group-active:scale-95 group-hover:scale-105 transition-all">
              <FilePlus2 className="w-6 h-6" />
            </div>
            <span className="text-[10px] font-black text-[#0b3b8c] mt-1 tracking-tight">
              + فاتورة
            </span>
          </button>
        </div>

        {/* 4. المرضى */}
        <button
          type="button"
          id="mobile-nav-patients"
          onClick={() => setActiveScreen('patient_profile')}
          aria-label="سجل المرضى"
          className={`flex flex-col items-center justify-center min-h-[48px] py-1 px-1 rounded-xl transition-all cursor-pointer relative ${
            activeScreen === 'patient_profile'
              ? 'text-[#0b3b8c] font-black'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <div className="relative">
            <div className={`p-1.5 rounded-xl transition-all ${
              activeScreen === 'patient_profile' ? 'bg-blue-50 text-[#0b3b8c]' : ''
            }`}>
              <Users className="w-5 h-5" />
            </div>
            {patients.length > 0 && (
              <span className="absolute -top-0.5 -left-1 bg-amber-600 text-white text-[9px] font-black px-1.5 min-w-[16px] h-4 rounded-full flex items-center justify-center ring-2 ring-white">
                {patients.length > 99 ? '99+' : patients.length}
              </span>
            )}
          </div>
          <span className="text-[10px] tracking-tight mt-0.5">المرضى</span>
          {activeScreen === 'patient_profile' && (
            <span className="w-1.5 h-1.5 rounded-full bg-[#0b3b8c] absolute bottom-0.5" />
          )}
        </button>

        {/* 5. القائمة الجانبية (Drawer Toggle) */}
        <button
          type="button"
          id="mobile-nav-more-menu"
          onClick={toggleMobileSidebar}
          aria-label="القائمة الجانبية"
          className={`flex flex-col items-center justify-center min-h-[48px] py-1 px-1 rounded-xl transition-all cursor-pointer relative ${
            isMobileSidebarOpen
              ? 'text-[#0b3b8c] font-black'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <div className={`p-1.5 rounded-xl transition-all ${
            isMobileSidebarOpen ? 'bg-blue-50 text-[#0b3b8c]' : ''
          }`}>
            <Menu className="w-5 h-5" />
          </div>
          <span className="text-[10px] tracking-tight mt-0.5">القائمة</span>
          {isMobileSidebarOpen && (
            <span className="w-1.5 h-1.5 rounded-full bg-[#0b3b8c] absolute bottom-0.5" />
          )}
        </button>

      </div>
    </nav>
  );
};
