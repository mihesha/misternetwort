import React, { useState } from 'react';
import { Moon, Sun, Key } from 'lucide-react';

interface LoginPageProps {
  isDarkMode: boolean;
  onToggleTheme: () => void;
  onLoginSuccess?: (ownerId: string, password?: string) => void;
  onBackToRegister?: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  isDarkMode,
  onToggleTheme,
  onLoginSuccess,
  onBackToRegister,
}) => {
  const [ownerId, setOwnerId] = useState(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      return params.get('phone') || params.get('ownerId') || '';
    }
    return '';
  });
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!ownerId.trim()) {
      setError('يرجى إدخال رقم المالك');
      return;
    }
    if (!password) {
      setError('يرجى إدخال كلمة المرور');
      return;
    }

    setLoading(true);

    try {
      if (onLoginSuccess) {
        await onLoginSuccess(ownerId.trim(), password);
      } else {
        alert(`تم تسجيل الدخول بنجاح! مرحباً برقم المالك: ${ownerId}`);
      }
    } catch (err: any) {
      setError(err.message || 'بيانات الدخول غير صحيحة');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={`min-h-screen flex items-center justify-center p-4 transition-colors font-['Cairo',sans-serif] ${
        isDarkMode ? 'bg-[#0a0e17] text-slate-100' : 'bg-slate-100 text-slate-800'
      }`}
    >
      {/* Login Card */}
      <div
        className={`relative w-full max-w-[420px] rounded-2xl p-6 md:p-8 transition-colors ${
          isDarkMode
            ? 'bg-[#172130] border border-slate-700/50 shadow-2xl shadow-black/80'
            : 'bg-white border border-slate-200/80 shadow-xl shadow-slate-300/40 text-slate-800'
        }`}
      >
        {/* Top-Left Theme Toggle Button */}
        <button
          onClick={onToggleTheme}
          type="button"
          className={`absolute top-5 left-5 p-2 rounded-xl transition-colors cursor-pointer ${
            isDarkMode
              ? 'bg-[#232f43] hover:bg-[#2d3c54] text-slate-300'
              : 'bg-slate-100 hover:bg-slate-200 text-slate-600 border border-slate-200'
          }`}
          title={isDarkMode ? 'التحويل للوضع الفاتح' : 'التحويل للوضع الداكن'}
        >
          {isDarkMode ? <Moon className="w-4 h-4 text-slate-300" /> : <Sun className="w-4 h-4 text-amber-500" />}
        </button>

        {/* Logo Section */}
        <div className="flex flex-col items-center justify-center pt-2 mb-2">
          {/* Custom Logo */}
          <div className="relative mb-2">
            <img 
              src={isDarkMode ? '/logos/logo-dark.png' : '/logos/logo-light.png'} 
              alt="Card Box Logo" 
              className="w-32 h-32 object-contain drop-shadow-xl rounded-3xl"
            />
          </div>

          {/* Subtitle */}
          <p className={`text-xs md:text-[13px] font-medium text-center mt-3 mb-6 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
            نظام ادارة كروت الشبكات وبيعها عبر المحافظ الالكترونية
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-500 text-xs text-center font-bold">
            {error}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4" dir="rtl">
          {/* Owner Number Field */}
          <div>
            <label className={`block text-right text-xs md:text-sm font-bold mb-1.5 ${isDarkMode ? 'text-slate-200' : 'text-slate-700'}`}>
              رقم المالك
            </label>
            <input
              type="text"
              value={ownerId}
              onChange={(e) => setOwnerId(e.target.value)}
              placeholder="أدخل رقم الهاتف"
              autoComplete="off"
              className={`w-full rounded-lg py-2.5 px-3.5 text-sm text-right focus:outline-none focus:ring-1 transition-all font-mono ${
                isDarkMode
                  ? 'bg-[#253247] text-white border border-slate-700/60 focus:border-blue-500 focus:ring-blue-500'
                  : 'bg-slate-50 text-slate-900 border border-slate-300 focus:bg-white focus:border-blue-600 focus:ring-blue-600'
              }`}
              required
            />
          </div>

          {/* Password Field */}
          <div>
            <label className={`block text-right text-xs md:text-sm font-bold mb-1.5 ${isDarkMode ? 'text-slate-200' : 'text-slate-700'}`}>
              كلمة المرور
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="أدخل كلمة المرور"
              autoComplete="new-password"
              className={`w-full rounded-lg py-2.5 px-3.5 text-sm text-right focus:outline-none focus:ring-1 transition-all ${
                isDarkMode
                  ? 'bg-[#253247] text-white border border-slate-700/60 focus:border-blue-500 focus:ring-blue-500'
                  : 'bg-slate-50 text-slate-900 border border-slate-300 focus:bg-white focus:border-blue-600 focus:ring-blue-600'
              }`}
              required
            />
          </div>

          {/* Remember Me Checkbox */}
          <div className="flex items-center justify-start gap-2 pt-1 pb-2">
            <input
              type="checkbox"
              id="rememberMe"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className={`w-4 h-4 rounded text-blue-600 focus:ring-0 accent-blue-600 cursor-pointer ${
                isDarkMode ? 'bg-[#253247] border-slate-600' : 'bg-slate-100 border-slate-300'
              }`}
            />
            <label htmlFor="rememberMe" className={`text-xs md:text-sm font-medium cursor-pointer select-none ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
              تذكرني
            </label>
          </div>

          {/* Login Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#2563eb] hover:bg-[#1d4ed8] active:bg-[#1e40af] text-white font-bold py-3 px-4 rounded-lg shadow-lg shadow-blue-600/30 transition-all cursor-pointer flex items-center justify-center gap-2 text-sm md:text-base disabled:opacity-50"
          >
            <span>🔑</span>
            <span>{loading ? 'جاري تسجيل الدخول...' : 'تسجيل الدخول'}</span>
          </button>
        </form>
      </div>
    </div>
  );
};
