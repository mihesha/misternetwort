'use client';

import React, { useState, useEffect } from 'react';
import Header from '@/components/public/Header';
import CardBoxLogo from '@/components/common/CardBoxLogo';
import AuthModal from '@/components/public/AuthModal';
import ProfileModal from '@/components/public/ProfileModal';
import { UserAccount } from '@/types';
import { useRouter, usePathname } from 'next/navigation';

export default function NetworksLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();

  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('register');

  const [user, setUser] = useState<UserAccount | null>(null);

  useEffect(() => {
    const loadData = () => {
      try {
        const savedUser = localStorage.getItem('cardbox_user');
        if (savedUser) setUser(JSON.parse(savedUser));
      } catch {}
    };

    loadData();

    const handleAuthEvent = (e: any) => {
      setAuthMode(e.detail || 'login');
      setIsAuthOpen(true);
    };
    
    window.addEventListener('cardbox_user_updated', loadData);
    window.addEventListener('open_auth', handleAuthEvent);
    return () => {
      window.removeEventListener('cardbox_user_updated', loadData);
      window.removeEventListener('open_auth', handleAuthEvent);
    };
  }, []);

  const handleSetUser = (newUser: UserAccount | null) => {
    setUser(newUser);
    if (newUser) localStorage.setItem('cardbox_user', JSON.stringify(newUser));
    else localStorage.removeItem('cardbox_user');
    window.dispatchEvent(new Event('cardbox_user_updated'));
  };

  const handleOpenAuth = (mode: 'login' | 'register') => {
    setAuthMode(mode);
    setIsAuthOpen(true);
  };

  const handleLogout = () => {
    handleSetUser(null);
    router.push(`/networks`);
  };

  return (
    <div dir="rtl" className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors selection:bg-purple-500 selection:text-white">
      <Header
        user={user}
        onOpenAuth={handleOpenAuth}
        onLogout={handleLogout}
        activeTab={pathname.split('/').pop() || 'home'}
        onNavigate={(path) => router.push(path === 'home' ? '/networks' : `/networks/${path}`)}
        onOpenPurchases={() => router.push('/networks/purchases')}
        onOpenProfile={() => setIsProfileOpen(true)}
        onOpenWallet={() => router.push('/networks/wallet')}
      />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 pt-2 sm:pt-3 pb-6">
        {children}
      </main>

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        initialMode={authMode}
        onSuccess={(newUser) => handleSetUser(newUser)}
      />

      <ProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        user={user}
        onLogout={handleLogout}
        onOpenPurchases={() => {
          setIsProfileOpen(false);
          router.push('/networks/purchases');
        }}
      />

      <footer className="relative border-t border-slate-200/50 dark:border-slate-800/50 bg-white/30 dark:bg-slate-950/30 backdrop-blur-xl py-12 mt-16 text-center text-xs text-slate-500 dark:text-slate-400 dir-rtl overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-purple-500/5 to-transparent pointer-events-none" />
        <div className="max-w-6xl mx-auto px-4 flex flex-col items-center justify-center space-y-5 relative z-10">
          <div className="p-3 bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 inline-flex">
            <CardBoxLogo size="sm" showText={true} />
          </div>
          <p className="font-bold tracking-wide">© {new Date().getFullYear()} كارد بوكس (CardBox) - جميع الحقوق محفوظة</p>
          <div className="flex items-center gap-5 text-sm font-black text-slate-600 dark:text-slate-400 bg-slate-100/50 dark:bg-slate-900/50 px-6 py-2.5 rounded-full border border-slate-200/50 dark:border-slate-800/50 backdrop-blur-sm">
            <button onClick={() => router.push(`/`)} className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors">الرئيسية</button>
            <span className="text-purple-300 dark:text-purple-700">•</span>
            <button onClick={() => router.push(`/networks`)} className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors">الشبكات</button>
            <span className="text-purple-300 dark:text-purple-700">•</span>
            <button onClick={() => router.push(`/networks/guide`)} className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors">دليل الشراء</button>
            <span className="text-purple-300 dark:text-purple-700">•</span>
            <button onClick={() => router.push(`/networks/about`)} className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors">عن الخدمة</button>
          </div>
        </div>
      </footer>
    </div>
  );
}
