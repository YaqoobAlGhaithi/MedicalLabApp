import {
  Download,
  Eye,
  EyeOff,
  FilePlus,
  FileSpreadsheet,
  FileText,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  Search,
  ShieldCheck,
  SlidersHorizontal
} from 'lucide-react';
import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { DashboardViewMode, TimeRange } from './dashboardTypes';

interface DashboardHeaderProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  privacyMode: boolean;
  setPrivacyMode: (val: boolean | ((prev: boolean) => boolean)) => void;
  viewMode: DashboardViewMode;
  setViewMode: (mode: DashboardViewMode) => void;
  timeRange: TimeRange;
  setTimeRange: (range: TimeRange) => void;
  onOpenCustomizer: () => void;
  onExportPdf: () => void;
  onExportExcel: () => void;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  searchQuery,
  setSearchQuery,
  privacyMode,
  setPrivacyMode,
  viewMode,
  setViewMode,
  timeRange,
  setTimeRange,
  onOpenCustomizer,
  onExportPdf,
  onExportExcel,
}) => {
  const {
    setActiveScreen,
    user,
    toggleMobileSidebar,
    isSidebarCollapsed,
    toggleSidebarCollapse
  } = useApp();
  const [showExportMenu, setShowExportMenu] = useState(false);

  return (
    <header className="bg-white border-b border-slate-200 px-3 md:px-6 py-2.5 md:py-3.5 shrink-0 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
      {/* Search and Mobile/Desktop Sidebar Toggles */}
      <div className="flex items-center gap-2 md:gap-3 w-full md:w-auto">
        {/* Mobile Hamburger Drawer Toggle (Android) */}
        <button
          id="mobile-drawer-hamburger-btn"
          onClick={toggleMobileSidebar}
          className="md:hidden p-2 text-slate-700 hover:bg-slate-100 active:bg-slate-200 rounded-xl shrink-0 transition-colors cursor-pointer"
          title="فتح القائمة الجانبية"
          aria-label="فتح القائمة الجانبية"
        >
          <Menu className="w-5 h-5 text-[#002e5b]" />
        </button>

        {/* Desktop Sidebar Collapse/Expand Toggle Button */}
        <button
          id="desktop-sidebar-collapse-header-btn"
          onClick={toggleSidebarCollapse}
          className="hidden md:flex p-2 text-slate-600 hover:text-blue-900 hover:bg-slate-100 rounded-xl transition-colors shrink-0 cursor-pointer"
          title={isSidebarCollapsed ? 'توسيع الشريط الجانبي' : 'طي الشريط الجانبي'}
          aria-label={isSidebarCollapsed ? 'توسيع الشريط الجانبي' : 'طي الشريط الجانبي'}
        >
          {isSidebarCollapsed ? (
            <PanelLeftOpen className="w-5 h-5 text-blue-700" />
          ) : (
            <PanelLeftClose className="w-5 h-5 text-slate-500" />
          )}
        </button>

        <div className="flex items-center bg-slate-100 rounded-xl px-3 py-1.5 md:py-2 border border-slate-200 focus-within:border-[#0b3b8c] focus-within:bg-white transition-all flex-1 md:w-80 shadow-inner">
          <Search className="w-4 h-4 text-slate-400 ml-2 shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="بحث عن مريض، رقم الفحص (LAB-)..."
            className="bg-transparent outline-none text-xs md:text-sm w-full text-slate-800 font-medium"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="text-slate-400 hover:text-slate-600 text-xs px-1">✕</button>
          )}
        </div>

        {/* Security Privacy Toggle Badge */}
        <button
          onClick={() => setPrivacyMode((prev) => !prev)}
          className={`hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border transition-all shrink-0 ${
            privacyMode
              ? 'bg-amber-50 text-amber-800 border-amber-300 ring-2 ring-amber-400/30'
              : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
          }`}
          title="وضع حماية الخصوصية في الاستقبال (إخفاء الأرقام المالية)"
        >
          {privacyMode ? <EyeOff className="w-3.5 h-3.5 text-amber-600" /> : <Eye className="w-3.5 h-3.5 text-slate-500" />}
          <span>{privacyMode ? 'وضع الاستقبال الآمن (مخفي)' : 'وضع الإدارة المالية'}</span>
        </button>
      </div>

      {/* Right Controls Bar */}
      <div className="flex flex-wrap items-center justify-end gap-2.5">
        {/* Time Range Filter */}
        <div className="bg-slate-100 p-1 rounded-xl flex items-center text-xs border border-slate-200">
          <button
            onClick={() => setTimeRange('7days')}
            className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
              timeRange === '7days' ? 'bg-white text-[#0b3b8c] shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            أسبوع
          </button>
          <button
            onClick={() => setTimeRange('30days')}
            className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
              timeRange === '30days' ? 'bg-white text-[#0b3b8c] shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            شهر
          </button>
          <button
            onClick={() => setTimeRange('all')}
            className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
              timeRange === 'all' ? 'bg-white text-[#0b3b8c] shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            الكل
          </button>
        </div>

        {/* View Mode Switcher */}
        <div className="hidden lg:flex items-center bg-slate-100 p-1 rounded-xl text-xs border border-slate-200">
          <button
            onClick={() => setViewMode('all')}
            className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
              viewMode === 'all' ? 'bg-[#0b3b8c] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            شامل
          </button>
          <button
            onClick={() => setViewMode('clinical')}
            className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
              viewMode === 'clinical' ? 'bg-[#0b3b8c] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            طبي فقط
          </button>
          <button
            onClick={() => setViewMode('executive')}
            className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
              viewMode === 'executive' ? 'bg-[#0b3b8c] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            مالي وإداري
          </button>
        </div>

        {/* Customize Button */}
        <button
          onClick={onOpenCustomizer}
          className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold border border-slate-300 transition-all active:scale-95 shrink-0"
          title="تخصيص ترتيب وعناصر اللوحة"
        >
          <SlidersHorizontal className="w-3.5 h-3.5 text-[#0b3b8c]" />
          <span className="hidden sm:inline">تخصيص</span>
        </button>

        {/* Export Reports Menu */}
        <div className="relative shrink-0">
          <button
            onClick={() => setShowExportMenu(!showExportMenu)}
            className="flex items-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition-all active:scale-95"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">تصدير التقارير</span>
          </button>

          {showExportMenu && (
            <div className="absolute left-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 mb-1">
                صيغة التصدير المتاحة
              </div>
              <button
                onClick={() => {
                  setShowExportMenu(false);
                  onExportPdf();
                }}
                className="w-full px-3.5 py-2 text-right text-xs font-bold text-slate-700 hover:bg-blue-50 hover:text-[#0b3b8c] flex items-center gap-2.5 transition-colors"
              >
                <FileText className="w-4 h-4 text-red-500" />
                <span>تقرير الإحصائيات (PDF)</span>
              </button>
              <button
                onClick={() => {
                  setShowExportMenu(false);
                  onExportExcel();
                }}
                className="w-full px-3.5 py-2 text-right text-xs font-bold text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 flex items-center gap-2.5 transition-colors"
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                <span>جدول البيانات (Excel / CSV)</span>
              </button>
            </div>
          )}
        </div>

        {/* Add Invoice CTA */}
        <button
          onClick={() => setActiveScreen('add_invoice')}
          className="flex items-center gap-1.5 px-4 py-2 bg-[#0b3b8c] text-white rounded-xl text-xs font-extrabold shadow-md hover:bg-[#002e5b] hover:shadow-lg transition-all active:scale-95 shrink-0"
        >
          <FilePlus className="w-4 h-4 text-blue-200" />
          <span>فاتورة جديدة</span>
        </button>

        {/* User Badge */}
        <div
          onClick={() => setActiveScreen('backup_settings')}
          className="hidden md:flex items-center gap-2 pl-2 border-r border-slate-200 cursor-pointer group shrink-0"
        >
          <div className="w-9 h-9 bg-blue-100 text-[#002e5b] rounded-full border-2 border-white shadow-sm flex items-center justify-center font-black text-xs group-hover:ring-2 ring-blue-400 transition-all">
            د.م
          </div>
          <div className="text-left hidden xl:block">
            <p className="text-[10px] text-slate-400 leading-tight">المناوب الحالي</p>
            <p className="text-xs font-bold text-slate-800 group-hover:text-[#0b3b8c]">{user?.name || 'د. محمد السعيد'}</p>
          </div>
        </div>
      </div>
    </header>
  );
};
