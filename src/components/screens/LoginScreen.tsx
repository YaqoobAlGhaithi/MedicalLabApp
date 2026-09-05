import { Globe, KeyRound, Lock, User } from 'lucide-react';
import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Logo } from '../common/Logo';

export const LoginScreen: React.FC = () => {
  const { login, loginWithGoogle } = useApp();
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('123456');
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError('يرجى إدخال اسم المستخدم وكلمة المرور');
      return;
    }
    setError('');
    login(username);
  };

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

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {error && (
            <div className="p-3 bg-red-50 text-red-700 rounded-xl text-xs font-semibold text-center border border-red-200">
              {error}
            </div>
          )}

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <User className="w-4 h-4 text-blue-800" /> اسم المستخدم
            </label>
            <div className="relative flex items-center">
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="أدخل اسم المستخدم (مثال: admin)"
                className="w-full pl-4 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-600 focus:bg-white transition-all text-slate-800 font-medium"
              />
              <span className="absolute right-3.5 text-slate-400">👤</span>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <Lock className="w-4 h-4 text-blue-800" /> كلمة المرور
            </label>
            <div className="relative flex items-center">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-4 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-600 focus:bg-white transition-all text-slate-800"
              />
              <KeyRound className="w-5 h-5 absolute right-3.5 text-slate-400" />
            </div>
          </div>

          <div className="flex items-center justify-between pt-1">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-600">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              تذكرني على هذا الجهاز
            </label>

            <button
              type="button"
              onClick={() => alert('لإعادة تعيين كلمة المرور يرجى مراجعة مسؤول النظام الرئيسي')}
              className="text-xs text-blue-700 hover:underline font-bold"
            >
              نسيت كلمة المرور؟
            </button>
          </div>

          <button
            type="submit"
            className="w-full py-3.5 bg-[#004a99] hover:bg-[#003366] active:scale-[0.99] text-white font-bold rounded-xl shadow-md shadow-blue-900/20 transition-all text-base"
          >
            دخول للنظام
          </button>

          <div className="relative flex py-1 items-center">
            <div className="flex-grow border-t border-slate-200"></div>
            <span className="flex-shrink mx-3 text-slate-400 text-xs font-semibold">أو عبر السحابة</span>
            <div className="flex-grow border-t border-slate-200"></div>
          </div>

          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={isGoogleLoading}
            className="w-full py-3 bg-white hover:bg-slate-50 active:scale-[0.99] text-slate-700 font-bold rounded-xl border border-slate-300 shadow-xs transition-all text-sm flex items-center justify-center gap-2"
          >
            <Globe className="w-4 h-4 text-blue-600" />
            <span>{isGoogleLoading ? 'جاري الاتصال بـ Firebase...' : 'تسجيل الدخول بحساب Google (Firebase)'}</span>
          </button>

          <div className="pt-4 text-center border-t border-slate-100">
            <p className="text-[11px] text-slate-400 font-medium">نظام إدارة تقارير المختبرات Pro - متصل بـ Firebase</p>
          </div>
        </form>
      </div>
    </div>
  );
};
