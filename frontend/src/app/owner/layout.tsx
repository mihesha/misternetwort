"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { OwnerProvider, useOwnerContext } from '../../context/OwnerContext';
import { useAppContext } from '../../context/AppContext';
import { useIdleTimeout } from '../../hooks/useIdleTimeout';
import { Moon, Sun, Globe, Settings, ChevronDown, Key, Shield, LogOut } from 'lucide-react';
import { GlobalOwnerModals } from '../../components/owner/GlobalOwnerModals';

const OwnerLayoutContent = ({ children }: { children: React.ReactNode }) => {
  const { isDarkMode, setIsDarkMode } = useAppContext();
  const { ownerName } = useOwnerContext();
  const pathname = usePathname() || '';
  const router = useRouter();
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const isAuthPage = pathname.includes('/login') || pathname.includes('/change-password') || pathname.includes('/privacy-policy');
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  // Auto Logout on Inactivity (15 minutes)
  useIdleTimeout(() => {
    if (!isAuthPage && isAuthenticated) {
      const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
      if (token) {
        fetch('/api/logout', { method: 'POST', headers: { 'Authorization': `Bearer ${token}` } }).catch(() => {});
      }
      localStorage.removeItem('auth_token');
      localStorage.removeItem('owner_user');
      router.replace('/owner/login');
      alert('تم تسجيل خروجك تلقائياً بسبب عدم وجود أي نشاط لفترة طويلة.');
    }
  }, 15 * 60 * 1000);

  useEffect(() => {
    if (isAuthPage) {
      setIsAuthenticated(true);
      return;
    }

    setIsAuthenticated(null);

    const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
    const userStr = typeof window !== 'undefined' ? localStorage.getItem('owner_user') : null;

    if (!token || !userStr) {
      router.replace('/owner/login');
      return;
    }

    try {
      const user = JSON.parse(userStr);
      if (user.role !== 'network_owner') {
        router.replace('/owner/login');
      } else {
        setIsAuthenticated(true);
      }
    } catch (e) {
      router.replace('/owner/login');
    }
  }, [pathname, isAuthPage, router]);

  if (isAuthenticated === null) {
    return (
      <div className={`min-h-screen flex flex-col items-center justify-center font-['Cairo',sans-serif] ${isDarkMode ? 'bg-[#0a0f18]' : 'bg-slate-100'}`}>
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p className={`font-bold ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>جاري التحقق من الصلاحيات...</p>
      </div>
    );
  }

  return (
    <div dir="rtl" className={`min-h-screen transition-colors font-['Cairo',sans-serif] ${isDarkMode ? 'bg-[#0a0f18] text-slate-100' : 'bg-slate-100 text-slate-800'}`}>
      {!isAuthPage && (
        <header className={`w-full px-4 md:px-8 py-3 flex items-center justify-between transition-colors ${isDarkMode ? 'bg-[#111823] border-b border-slate-800/80' : 'bg-white border-b border-slate-200 shadow-sm'}`}>
          <div className="flex items-center gap-6">
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
            <nav className="hidden md:flex items-center gap-2 text-xs font-bold mr-2">
              <Link href="/owner/overview" className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all ${pathname.includes('/overview') ? (isDarkMode ? 'bg-[#1e293b] text-blue-400 border border-blue-500/30 shadow-sm' : 'bg-blue-50 text-blue-600 border border-blue-200') : (isDarkMode ? 'text-slate-300 hover:text-white' : 'text-slate-600 hover:text-slate-900')}`}>
                <Globe className="w-4 h-4 text-blue-500" />
                <span>لوحة التحكم</span>
              </Link>
              <Link href="/owner/settings" className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all ${pathname.includes('/settings') ? (isDarkMode ? 'bg-[#1e293b] text-blue-400 border border-blue-500/30 shadow-sm' : 'bg-blue-50 text-blue-600 border border-blue-200') : (isDarkMode ? 'text-slate-300 hover:text-white' : 'text-slate-600 hover:text-slate-900')}`}>
                <Settings className={`w-4 h-4 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`} />
                <span>إعدادات الشبكة</span>
              </Link>
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <div onClick={() => setShowProfileMenu(!showProfileMenu)} className={`flex items-center gap-2.5 px-3 py-1.5 rounded-xl transition-all cursor-pointer ${isDarkMode ? 'bg-[#1b2535] hover:bg-[#222f43] border border-slate-700/50' : 'bg-slate-100 hover:bg-slate-200 border border-slate-200'}`}>
                <ChevronDown className={`w-4 h-4 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`} />
                <div className="text-right">
                  <span className={`text-xs font-bold block ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>{ownerName}</span>
                  <span className={`text-[10px] block -mt-0.5 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>مالك شبكة</span>
                </div>
                <div className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs">{ownerName.charAt(0)}</div>
              </div>
              {showProfileMenu && (
                <div className={`absolute left-0 mt-2 w-52 rounded-xl p-2 shadow-2xl z-50 border ${isDarkMode ? 'bg-[#141d2b] border-slate-700 text-slate-200' : 'bg-white border-slate-200 text-slate-800'}`}>
                  <Link href="/owner/change-password" onClick={() => setShowProfileMenu(false)} className={`w-full text-right px-3 py-2 text-xs rounded-lg font-medium transition-colors flex items-center justify-start gap-2 ${isDarkMode ? 'hover:bg-slate-800 text-slate-300' : 'hover:bg-slate-100 text-slate-700'}`}>
                    <Key className="w-4 h-4 text-amber-500 shrink-0" /> <span>تغيير كلمة المرور</span>
                  </Link>
                  <Link href="/owner/privacy-policy" onClick={() => setShowProfileMenu(false)} className={`w-full text-right px-3 py-2 text-xs rounded-lg font-medium transition-colors flex items-center justify-start gap-2 ${isDarkMode ? 'hover:bg-slate-800 text-slate-300' : 'hover:bg-slate-100 text-slate-700'}`}>
                    <Shield className="w-4 h-4 text-indigo-400 shrink-0" /> <span>شروط الخصوصية والسياسة</span>
                  </Link>
                  <hr className={`my-1 ${isDarkMode ? 'border-slate-800' : 'border-slate-200'}`} />
                  <button 
                    onClick={async () => {
                      setShowProfileMenu(false);
                      const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
                      if (token) {
                        try {
                          await fetch('/api/logout', {
                            method: 'POST',
                            headers: { 'Authorization': `Bearer ${token}` }
                          });
                        } catch (e) {}
                      }
                      localStorage.removeItem('auth_token');
                      localStorage.removeItem('owner_user');
                      router.replace('/owner/login');
                    }}
                    className="w-full text-right px-3 py-2 text-xs rounded-lg font-bold text-red-500 hover:bg-red-500/10 transition-colors flex items-center justify-start gap-2"
                  >
                    <LogOut className="w-4 h-4 text-red-500 shrink-0" /> <span>تسجيل الخروج</span>
                  </button>
                </div>
              )}
            </div>
            <button onClick={() => setIsDarkMode(!isDarkMode)} className={`p-2 rounded-xl transition-colors cursor-pointer ${isDarkMode ? 'bg-[#1b2535] hover:bg-[#222f43] border border-slate-700/50 text-slate-300' : 'bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-600'}`}>
              {isDarkMode ? <Moon className="w-4 h-4 text-slate-300" /> : <Sun className="w-4 h-4 text-amber-500" />}
            </button>
          </div>
        </header>
      )}
      
      {isAuthPage ? (
        <>{children}</>
      ) : (
        <main className="max-w-7xl mx-auto px-4 md:px-8 py-6">
          {children}
        </main>
      )}

      {/* Global Modals overlay for the owner views */}
      <GlobalOwnerModals />
    </div>
  );
};

export default function OwnerLayout({ children }: { children: React.ReactNode }) {
  return (
    <OwnerProvider>
      <OwnerLayoutContent>{children}</OwnerLayoutContent>
    </OwnerProvider>
  );
}
