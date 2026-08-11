import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { KarootLogo, JaibLogo } from './Logos';

interface HeaderProps {
  isDarkMode: boolean;
  onToggleTheme: () => void;
  onNavigateLogin?: () => void;
  onNavigateAdmin?: () => void;
  onNavigateRegister?: () => void;
  currentView?: string;
}

export const Header: React.FC<HeaderProps> = ({
  isDarkMode,
  onToggleTheme,
  onNavigateLogin,
  onNavigateAdmin,
  onNavigateRegister,
  currentView,
}) => {
  return (
    <header className="w-full max-w-2xl mx-auto px-4 pt-3 pb-2">
      {/* Top Header Controls: Theme Toggle & Role Navigation */}
      <div className="flex justify-between items-center mb-2 flex-wrap gap-2">
        <button
          onClick={onToggleTheme}
          aria-label="تغيير المظهر"
          className={`p-2 rounded-full transition-colors cursor-pointer ${
            isDarkMode
              ? 'text-slate-400 hover:text-white hover:bg-slate-800/80'
              : 'text-slate-600 hover:bg-slate-200'
          }`}
          title={isDarkMode ? 'التحويل للوضع الفاتح' : 'التحويل للوضع الداكن'}
        >
          {isDarkMode ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5 text-amber-500" />}
        </button>

        <div className="flex items-center gap-2">
          {onNavigateAdmin && (
            <button
              onClick={onNavigateAdmin}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                currentView === 'admin_dashboard'
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'bg-indigo-900/40 text-indigo-300 hover:bg-indigo-900/60 border border-indigo-500/30'
              }`}
            >
              <span>🛡️</span>
              <span>لوحة الإدارة العامة</span>
            </button>
          )}

          {onNavigateLogin && (
            <button
              onClick={onNavigateLogin}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                currentView === 'login'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-blue-600/20 text-blue-300 hover:bg-blue-600/30 border border-blue-500/30'
              }`}
            >
              <span>🔑</span>
              <span>دخول المالك</span>
            </button>
          )}

          {currentView !== 'register' && onNavigateRegister && (
            <button
              onClick={onNavigateRegister}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 cursor-pointer"
            >
              <span>📝</span>
              <span>طلب انضمام</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Logo Header Row */}
      <div className="flex items-center justify-between gap-4 py-2 px-1">
        {/* Karoot Logo */}
        <div>
          <KarootLogo isDarkMode={isDarkMode} />
        </div>

        {/* Jaib Logo */}
        <div>
          <JaibLogo />
        </div>
      </div>


      {/* Agent Customer Service Sub-header Text */}
      <div className="text-center my-3">
        <p className={`text-xs md:text-sm font-medium ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
          الوكيل خدمة العملاء للتواصل: <span className="font-bold font-mono" dir="ltr">784999804</span>
        </p>
      </div>

      {/* Full width Purple Banner: طلب انضمام جديد */}
      <div className="w-full mt-4 mb-6">
        <div className="w-full bg-[#5b3bf0] text-white font-extrabold text-lg md:text-xl py-3.5 px-6 rounded-2xl shadow-lg shadow-purple-900/30 text-center tracking-wide">
          طلب انضمام جديد
        </div>
      </div>
    </header>
  );
};

