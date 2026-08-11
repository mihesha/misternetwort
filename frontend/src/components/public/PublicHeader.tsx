"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Menu, X, ArrowLeft, Sun, Moon } from 'lucide-react';
import { KarootLogo } from '../common/Logos';
import { useAppContext } from '../../context/AppContext';

interface PublicHeaderProps {
  showNav?: boolean;
}

export const PublicHeader: React.FC<PublicHeaderProps> = ({ showNav = true }) => {
  const { isDarkMode, setIsDarkMode } = useAppContext();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-white/95 dark:bg-[#0a0f1c]/95 backdrop-blur-md shadow-sm border-b border-slate-200 dark:border-slate-800' : 'bg-transparent'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link href="/" className="flex-shrink-0 flex items-center hover:opacity-90 transition-opacity">
            <KarootLogo isDarkMode={isDarkMode} className="w-auto h-10" />
          </Link>

          {/* Desktop Navigation */}
          {showNav && (
            <nav className="hidden md:flex gap-8 items-center mr-8">
              <Link href="/" className="text-indigo-600 dark:text-indigo-400 font-bold transition-colors whitespace-nowrap">الرئيسية</Link>
              <a href="#features" className="text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 font-bold transition-colors whitespace-nowrap">الميزات</a>
              <a href="#solutions" className="text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 font-bold transition-colors whitespace-nowrap">الحلول</a>
              <a href="#workflow" className="text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 font-bold transition-colors whitespace-nowrap">آلية العمل</a>
            </nav>
          )}

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-4 mr-auto">
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              aria-label="تغيير المظهر"
              className="p-2 rounded-full transition-colors text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              {isDarkMode ? <Sun className="w-5 h-5 text-amber-500" /> : <Moon className="w-5 h-5" />}
            </button>
            {showNav && (
              <>
                <Link href="/join" className="text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white font-bold transition-colors whitespace-nowrap">
                  تسجيل الدخول
                </Link>
                <Link href="/join" className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-full font-bold transition-all shadow-lg shadow-indigo-600/20 flex items-center gap-2 group whitespace-nowrap">
                  <span>إنشاء حساب</span>
                  <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button & Theme Toggle */}
          <div className="md:hidden flex items-center gap-2">
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="p-2 text-slate-600 dark:text-slate-400"
            >
              {isDarkMode ? <Sun className="w-5 h-5 text-amber-500" /> : <Moon className="w-5 h-5" />}
            </button>
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="text-slate-600 dark:text-slate-300 hover:text-indigo-600">
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && showNav && (
        <div className="md:hidden bg-white dark:bg-[#0f172a] border-b border-slate-200 dark:border-slate-800">
          <div className="px-4 pt-2 pb-6 flex flex-col gap-2">
            <Link href="/" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 text-indigo-600 dark:text-indigo-400 font-bold">الرئيسية</Link>
            <a href="#features" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 text-slate-600 dark:text-slate-300 font-bold">الميزات</a>
            <a href="#solutions" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 text-slate-600 dark:text-slate-300 font-bold">الحلول</a>
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-col gap-3">
              <Link href="/join" onClick={() => setMobileMenuOpen(false)} className="block text-center text-slate-600 dark:text-slate-300 font-bold py-2">تسجيل الدخول</Link>
              <Link href="/join" onClick={() => setMobileMenuOpen(false)} className="block text-center bg-indigo-600 text-white px-4 py-3 rounded-xl font-bold">إنشاء حساب جديد</Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
