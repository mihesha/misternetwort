import React, { useState } from 'react';
import { Moon, Sun, Globe, Settings, ChevronDown, Key, Check } from 'lucide-react';

interface ChangePasswordPageProps {
  isDarkMode: boolean;
  onToggleTheme: () => void;
  ownerName?: string;
  onPasswordChanged: (newPassword: string) => Promise<void> | void;
  onOpenPrivacyPolicy?: () => void;
}

export const ChangePasswordPage: React.FC<ChangePasswordPageProps> = ({
  isDarkMode,
  onToggleTheme,
  ownerName = 'هشام محمد الجايفي',
  onPasswordChanged,
  onOpenPrivacyPolicy,
}) => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!newPassword) {
      setError('يرجى إدخال كلمة المرور الجديدة');
      return;
    }
    if (newPassword.length < 6) {
      setError('كلمة المرور يجب أن تكون 6 أحرف أو أرقام على الأقل');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('كلمات المرور غير متطابقة');
      return;
    }
    if (!agreed) {
      setError('يرجى الموافقة على شروط الخصوصية والسياسة العامة');
      return;
    }

    setLoading(true);

    try {
      await onPasswordChanged(newPassword);
      setLoading(false);
      setSuccess(true);
    } catch (err: any) {
      setLoading(false);
      setError(err.message || 'حدث خطأ أثناء تغيير كلمة المرور');
    }
  };

  return (
    <div
      dir="rtl"
      className={`min-h-screen transition-colors font-['Cairo',sans-serif] ${
        isDarkMode ? 'bg-[#0a0f18] text-slate-100' : 'bg-slate-100 text-slate-800'
      }`}
    >
      {/* Top Navbar matching screenshot */}
      <header
        className={`w-full px-4 md:px-8 py-3 flex items-center justify-between transition-colors ${
          isDarkMode
            ? 'bg-[#111823] border-b border-slate-800/80'
            : 'bg-white border-b border-slate-200 shadow-sm'
        }`}
      >
        {/* Right side: Logo & Navigation items */}
        <div className="flex items-center gap-6">
          {/* Logo Graphic */}
          <div className="flex items-center gap-2">
            <div className="shrink-0 flex items-center justify-center">
              <img 
                src={isDarkMode ? '/logos/logo-dark.png' : '/logos/logo-light.png'} 
                alt="Card Box Logo" 
                className="w-10 h-10 object-cover rounded-xl"
              />
            </div>
            <span className={`text-sm md:text-base font-extrabold tracking-tight ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>
              Card Box
            </span>
          </div>

          {/* Navigation Links */}
          <nav className={`hidden md:flex items-center gap-4 text-xs font-bold mr-4 ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
            <div className={`flex items-center gap-1.5 transition-colors cursor-pointer ${isDarkMode ? 'hover:text-white' : 'hover:text-slate-900'}`}>
              <Globe className="w-4 h-4 text-indigo-500" />
              <span>لوحة التحكم</span>
            </div>
            <div className={`flex items-center gap-1.5 transition-colors cursor-pointer ${isDarkMode ? 'hover:text-white' : 'hover:text-slate-900'}`}>
              <Settings className={`w-4 h-4 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`} />
              <span>إعدادات الشبكة</span>
            </div>
          </nav>
        </div>

        {/* Left side: Profile Menu & Theme Toggle */}
        <div className="flex items-center gap-3">
          {/* User Profile Pill */}
          <div
            className={`flex items-center gap-2.5 px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
              isDarkMode
                ? 'bg-[#1b2535] hover:bg-[#222f43] border border-slate-700/50'
                : 'bg-slate-100 hover:bg-slate-200 border border-slate-200'
            }`}
          >
            <ChevronDown className={`w-4 h-4 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`} />
            <div className="text-right">
              <span className={`text-xs font-bold block ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>{ownerName}</span>
              <span className={`text-[10px] block -mt-0.5 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>مالك شبكة</span>
            </div>
            <div className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs">
              م
            </div>
          </div>

          {/* Dark Mode Toggle Button */}
          <button
            onClick={onToggleTheme}
            className={`p-2 rounded-xl transition-colors cursor-pointer ${
              isDarkMode
                ? 'bg-[#1b2535] hover:bg-[#222f43] border border-slate-700/50 text-slate-300'
                : 'bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-600'
            }`}
            title="تغيير المظهر"
          >
            {isDarkMode ? <Moon className="w-4 h-4 text-slate-300" /> : <Sun className="w-4 h-4 text-amber-500" />}
          </button>
        </div>
      </header>

      {/* Main Area */}
      <main className="max-w-6xl mx-auto px-4 md:px-8 py-6">
        {/* Page Title Header */}
        <div className="mb-8 text-right">
          
        </div>

        {/* Centered Change Password Form Card */}
        <div className="flex justify-center items-center py-6">
          <div
            className={`w-full max-w-[440px] rounded-2xl p-6 md:p-8 relative transition-colors ${
              isDarkMode
                ? 'bg-[#141d2b] border border-slate-800 shadow-2xl shadow-black/60'
                : 'bg-white border border-slate-200 shadow-xl shadow-slate-300/40 text-slate-800'
            }`}
          >
            {/* Success Overlay */}
            {success && (
              <div className={`absolute inset-0 backdrop-blur-sm rounded-2xl z-20 flex flex-col items-center justify-center p-6 text-center animate-fadeIn ${
                isDarkMode ? 'bg-[#141d2b]/95' : 'bg-white/95'
              }`}>
                <div className="w-14 h-14 bg-emerald-500 rounded-full flex items-center justify-center text-white mb-3 shadow-lg shadow-emerald-500/30">
                  <Check className="w-8 h-8 stroke-[3]" />
                </div>
                <h3 className={`text-xl font-bold mb-1 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>تم تغيير كلمة المرور بنجاح!</h3>
                <p className={`text-xs ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>جاري توجيهك لشاشة تسجيل الدخول...</p>
              </div>
            )}

            {/* Top Key Icon */}
            <div className="flex justify-center mb-4">
              <div className="w-14 h-14 rounded-full bg-[#6366f1]/20 border border-[#818cf8]/30 flex items-center justify-center text-[#6366f1]">
                <Key className="w-7 h-7" />
              </div>
            </div>

            {/* Header Text */}
            <div className="text-center mb-6 space-y-1">
              <h2 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>تغيير كلمة المرور</h2>
              <p className={`text-xs font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                يجب تغيير كلمة المرور الخاصة بك قبل المتابعة
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-4 p-2.5 rounded-lg bg-red-500/10 border border-red-500/30 text-red-500 text-xs text-center font-bold">
                {error}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Field 1: New Password */}
              <div>
                <label className={`block text-right text-xs font-bold mb-1.5 ${isDarkMode ? 'text-slate-200' : 'text-slate-700'}`}>
                  كلمة المرور الجديدة <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="أدخل كلمة المرور الجديدة"
                  className={`w-full rounded-lg py-2.5 px-3.5 text-xs md:text-sm text-right focus:outline-none focus:ring-1 transition-all ${
                    isDarkMode
                      ? 'bg-[#202b3c] text-white border border-slate-700/60 focus:border-indigo-500 focus:ring-indigo-500'
                      : 'bg-slate-50 text-slate-900 border border-slate-300 focus:bg-white focus:border-indigo-600 focus:ring-indigo-600'
                  }`}
                  required
                />
              </div>

              {/* Field 2: Confirm New Password */}
              <div>
                <label className={`block text-right text-xs font-bold mb-1.5 ${isDarkMode ? 'text-slate-200' : 'text-slate-700'}`}>
                  تأكيد كلمة المرور الجديدة <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="أعد إدخال كلمة المرور الجديدة"
                  className={`w-full rounded-lg py-2.5 px-3.5 text-xs md:text-sm text-right focus:outline-none focus:ring-1 transition-all ${
                    isDarkMode
                      ? 'bg-[#202b3c] text-white border border-slate-700/60 focus:border-indigo-500 focus:ring-indigo-500'
                      : 'bg-slate-50 text-slate-900 border border-slate-300 focus:bg-white focus:border-indigo-600 focus:ring-indigo-600'
                  }`}
                  required
                />
              </div>

              {/* Checkbox: Agree Terms */}
              <div className="flex items-center justify-start gap-2 pt-1 pb-2">
                <input
                  type="checkbox"
                  id="agreeTerms"
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                  className={`w-4 h-4 rounded text-indigo-600 focus:ring-0 accent-indigo-600 cursor-pointer ${
                    isDarkMode ? 'bg-[#202b3c] border-slate-600' : 'bg-slate-100 border-slate-300'
                  }`}
                />
                <label htmlFor="agreeTerms" className={`text-xs font-medium select-none ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                  أوافق على{' '}
                  <span
                    onClick={(e) => {
                      if (onOpenPrivacyPolicy) {
                        e.preventDefault();
                        e.stopPropagation();
                        onOpenPrivacyPolicy();
                      }
                    }}
                    className="text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer font-bold"
                  >
                    شروط الخصوصية والسياسة العامة
                  </span>
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#6366f1] hover:bg-[#4f46e5] active:bg-[#4338ca] text-white font-bold py-3 px-4 rounded-lg shadow-lg shadow-indigo-600/30 transition-all cursor-pointer text-sm disabled:opacity-50"
              >
                {loading ? 'جاري الحفظ...' : 'تغيير كلمة المرور'}
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
};
