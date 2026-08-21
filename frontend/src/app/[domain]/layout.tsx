'use client';

import React, { useState, useEffect, use } from 'react';
import Header from '@/components/public/Header';
import CardBoxLogo from '@/components/common/CardBoxLogo';
import SupportWidget from '@/components/public/SupportWidget';
import AuthModal from '@/components/public/AuthModal';
import ProfileModal from '@/components/public/ProfileModal';
import { UserAccount, OrderDetails, PublicNetworkInfo } from '@/types';
import { useRouter, usePathname } from 'next/navigation';

export default function DomainLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ domain: string }>;
}) {
  const resolvedParams = use(params);
  const domain = resolvedParams.domain;
  const router = useRouter();
  const pathname = usePathname();

  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('register');

  const [user, setUser] = useState<UserAccount | null>(null);
  const [orders, setOrders] = useState<OrderDetails[]>([]);
  const [currentNetwork, setCurrentNetwork] = useState<PublicNetworkInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = () => {
      try {
        const savedUser = localStorage.getItem('cardbox_user');
        if (savedUser) setUser(JSON.parse(savedUser));
        const savedOrders = localStorage.getItem('cardbox_orders');
        if (savedOrders) setOrders(JSON.parse(savedOrders));
      } catch {}
    };

    loadData();

    const handleOrderUpdate = () => loadData();
    const handleAuthEvent = (e: any) => {
      setAuthMode(e.detail || 'login');
      setIsAuthOpen(true);
    };
    
    window.addEventListener('cardbox_orders_updated', handleOrderUpdate);
    window.addEventListener('cardbox_user_updated', handleOrderUpdate);
    window.addEventListener('open_auth', handleAuthEvent);
    return () => {
      window.removeEventListener('cardbox_orders_updated', handleOrderUpdate);
      window.removeEventListener('cardbox_user_updated', handleOrderUpdate);
      window.removeEventListener('open_auth', handleAuthEvent);
    };
  }, []);

  useEffect(() => {
    // Fetch network data based on domain (e.g. barraq)
    const fetchNetwork = async () => {
      try {
        const res = await fetch(`/api/networks/${domain}`);
        if (res.ok) {
          const data = await res.json();
          setCurrentNetwork({
            id: data.network_code || data.id || domain,
            name: data.name || domain,
            nameAr: data.name || domain,
            location: (data.governorate || '') + (data.city ? ` - ${data.city}` : ''),
            coverageArea: data.neighborhood || '',
            activeNodes: data.activeNodes || 10,
            status: data.status === 'active' ? 'online' : 'maintenance',
            supportPhone: data.owner_phone || '',
          });
        } else {
          // If network not found, redirect to search page
          if (pathname !== `/${domain}/networks`) {
             router.push(`/${domain}/networks`);
          }
        }
      } catch (e) {
        console.error('Failed to fetch network:', e);
      } finally {
        setLoading(false);
      }
    };
    fetchNetwork();
  }, [domain]);

  const handleSetUser = (newUser: UserAccount | null) => {
    setUser(newUser);
    if (newUser) localStorage.setItem('cardbox_user', JSON.stringify(newUser));
    else localStorage.removeItem('cardbox_user');
  };

  const handleOpenAuth = (mode: 'login' | 'register') => {
    setAuthMode(mode);
    setIsAuthOpen(true);
  };

  const handleLogout = () => {
    handleSetUser(null);
    router.push(`/${domain}`);
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">جاري التحميل...</div>;
  }

  return (
    <div dir="rtl" className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors selection:bg-purple-500 selection:text-white">
      <Header
        user={user}
        onOpenAuth={handleOpenAuth}
        onLogout={handleLogout}
        network={currentNetwork || undefined}
        activeTab={pathname.split('/').pop() || 'home'}
        onNavigate={(path) => router.push(`/${domain}${path === 'home' ? '' : '/' + path}`)}
        onOpenPurchases={() => router.push(`/${domain}/purchases`)}
        onOpenProfile={() => setIsProfileOpen(true)}
        onOpenWallet={() => router.push(`/${domain}/wallet`)}
      />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 pt-2 sm:pt-3 pb-6">
        {/* We pass user and network context to children using React Context if needed, but since it's Next.js, children will just render. We can cloneElement or use a Provider. For simplicity, we just render children here, and let children fetch their own data or use a Zustand store/Context. */}
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
          router.push(`/${domain}/purchases`);
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
            <button onClick={() => router.push(`/${domain}`)} className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors">الرئيسية</button>
            <span className="text-purple-300 dark:text-purple-700">•</span>
            <button onClick={() => router.push(`/${domain}/networks`)} className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors">الشبكات</button>
            <span className="text-purple-300 dark:text-purple-700">•</span>
            <button onClick={() => router.push(`/${domain}/guide`)} className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors">دليل الشراء</button>
            <span className="text-purple-300 dark:text-purple-700">•</span>
            <button onClick={() => router.push(`/${domain}/about`)} className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors">عن الخدمة</button>
          </div>
        </div>
      </footer>

      {currentNetwork && <SupportWidget whatsappNumber={currentNetwork.supportPhone || '967770000000'} />}
    </div>
  );
}
