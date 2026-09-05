import React from 'react';
import { Logo } from '../common/Logo';

export const SplashScreen: React.FC = () => {
  return (
    <div className="fixed inset-0 bg-gradient-to-b from-[#0b2b4d] via-[#0d3661] to-[#06192e] text-white flex flex-col items-center justify-center p-6 select-none z-50">
      {/* Top Clinic Name */}
      <div className="absolute top-12 text-center animate-fade-in">
        <h2 className="text-xl font-bold tracking-wider text-blue-100">عيادة ومختبرات المنار الطبية</h2>
        <p className="text-xs tracking-widest uppercase text-blue-300 opacity-80 mt-1">AL-Manar Medical Lab</p>
      </div>

      {/* Center Logo with Pulse & Glow */}
      <div className="relative flex flex-col items-center justify-center my-auto">
        <div className="absolute -inset-8 bg-blue-500/20 rounded-full blur-2xl animate-pulse" />
        <div className="bg-white p-6 rounded-3xl shadow-2xl relative z-10 transform hover:scale-105 transition-transform duration-500">
          <Logo size="giant" showText={false} />
        </div>

        <h1 className="text-3xl font-black tracking-tight text-white mt-8 text-center drop-shadow-md">
          Lab Report Pro
        </h1>
        <p className="text-sm text-blue-200 mt-2 text-center font-medium opacity-90">
          نظام إدارة تقارير المختبرات الطبية الحديثة
        </p>
      </div>

      {/* Bottom Loading Indicator */}
      <div className="w-full max-w-xs mb-12 flex flex-col items-center">
        <div className="w-full h-2 bg-blue-950/80 rounded-full overflow-hidden p-0.5 border border-blue-700/50">
          <div className="h-full bg-gradient-to-r from-blue-400 via-blue-200 to-white rounded-full animate-[progress_2.2s_ease-in-out_infinite] w-3/4" />
        </div>
        <p className="text-xs text-blue-300 mt-3 animate-pulse">جاري تحميل أحدث البيانات والمعايير...</p>
      </div>
    </div>
  );
};
