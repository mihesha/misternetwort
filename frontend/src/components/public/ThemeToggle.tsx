'use client';

import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';

export const ThemeToggle: React.FC = () => {
  const { isDarkMode, setIsDarkMode } = useAppContext();

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    if (!isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  return (
    <button
      onClick={toggleTheme}
      className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all active:scale-95 flex items-center justify-center border border-slate-200/80 dark:border-slate-700/80 cursor-pointer"
      title={isDarkMode ? 'التبديل إلى الوضع النهاري' : 'التبديل إلى الوضع الليلي'}
      aria-label="تبديل المظهر"
    >
      {isDarkMode ? (
        <Sun className="w-4 h-4 text-amber-400" />
      ) : (
        <Moon className="w-4 h-4 text-purple-600" />
      )}
    </button>
  );
};

export default ThemeToggle;

