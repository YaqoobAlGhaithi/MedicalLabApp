import { Globe, WifiOff } from 'lucide-react';
import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Logo } from '../common/Logo';

export const LoginScreen: React.FC = () => {
  const { loginWithGoogle, continueOffline, hasValidLocalSession } = useApp();
  const [error, setError] = useState('');
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const canContinueOffline = hasValidLocalSession();

  const handleGoogleLogin = async () => {
    try {
      setIsGoogleLoading(true);
      setError('');
      await loginWithGoogle();
    } catch (err) {
      setError('تعذر تسجيل الدخول عبر Google. يرجى المحاولة لاحقاً');
    } finally {
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4 select-none dir-rtl" dir="rtl">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
        {/* Top Header Banner */}
        <div className="bg-[#0b2b4d] text-white p-8 flex flex-col items-center relative">
          <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-lg p-2 mb-4">
            <Logo size="lg" showText={false} />
          </div>
          <h2 className="text-xl font-bold text-center">تسجيل الدخول للنظام</h2>
          <p className="text-xs text-blue-200 mt-1">مرحباً بك في مختبرات المنار الطبية</p>
        </div>

        {/* Login Actions */}
        <div className="p-8 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 text-red-700 rounded-xl text-xs font-semibold text-center border border-red-200">
              {error}
            </div>
          )}

          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={isGoogleLoading}
            className="w-full py-3 bg-white hover:bg-slate-50 active:scale-[0.99] text-slate-700 font-bold rounded-xl border border-slate-300 shadow-xs transition-all text-sm flex items-center justify-center gap-2"
          >
            <Globe className="w-4 h-4 text-blue-600" />
            <span>{isGoogleLoading ? 'جاري الاتصال بـ Firebase...' : 'تسجيل الدخول بحساب Google (Firebase)'}</span>
          </button>

          {canContinueOffline && (
            <button
              type="button"
              onClick={continueOffline}
              className="w-full py-3 bg-[#004a99] hover:bg-[#003366] active:scale-[0.99] text-white font-bold rounded-xl shadow-md shadow-blue-900/20 transition-all text-sm flex items-center justify-center gap-2"
            >
              <WifiOff className="w-4 h-4" />
              <span>متابعة دون اتصال (جلسة محفوظة)</span>
            </button>
          )}

          <div className="pt-4 text-center border-t border-slate-100">
            <p className="text-[11px] text-slate-400 font-medium">نظام إدارة تقارير المختبرات Pro - متصل بـ Firebase</p>
          </div>
        </div>
      </div>
    </div>
  );
};
