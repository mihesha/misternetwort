'use client';

import React, { useState, useEffect, use } from 'react';
import Header from '@/components/public/Header';
import CardBoxLogo from '@/components/common/CardBoxLogo';
import SupportWidget from '@/components/public/SupportWidget';
import AuthModal from '@/components/public/AuthModal';
import PurchasesModal from '@/components/public/PurchasesModal';
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
  const [isPurchasesOpen, setIsPurchasesOpen] = useState(false);
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

    // Listen for custom event when order is placed
    const handleOrderUpdate = () => loadData();
    window.addEventListener('cardbox_orders_updated', handleOrderUpdate);
    return () => window.removeEventListener('cardbox_orders_updated', handleOrderUpdate);
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
        onOpenPurchases={() => setIsPurchasesOpen(true)}
        onOpenProfile={() => setIsProfileOpen(true)}
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

      <PurchasesModal
        isOpen={isPurchasesOpen}
        onClose={() => setIsPurchasesOpen(false)}
        orders={orders}
        onStartShopping={() => {
          setIsPurchasesOpen(false);
          router.push(`/${domain}`);
        }}
      />

      <ProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        user={user}
        onLogout={handleLogout}
        onOpenPurchases={() => {
          setIsProfileOpen(false);
          setIsPurchasesOpen(true);
        }}
      />

      <footer className="border-t border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-950/50 py-8 mt-12 text-center text-xs text-slate-500 dark:text-slate-400 dir-rtl">
        <div className="max-w-6xl mx-auto px-4 flex flex-col items-center justify-center space-y-3">
          <CardBoxLogo size="sm" showText={true} />
          <p>© {new Date().getFullYear()} كارد بوكس (CardBox) - جميع الحقوق محفوظة</p>
          <div className="flex items-center gap-4 text-xs font-medium text-slate-600 dark:text-slate-400">
            <button onClick={() => router.push(`/${domain}`)} className="hover:text-purple-600">الرئيسية</button>
            <span>•</span>
            <button onClick={() => router.push(`/${domain}/networks`)} className="hover:text-purple-600">الشبكات</button>
            <span>•</span>
            <button onClick={() => router.push(`/${domain}/guide`)} className="hover:text-purple-600">دليل الشراء</button>
            <span>•</span>
            <button onClick={() => router.push(`/${domain}/about`)} className="hover:text-purple-600">عن الخدمة</button>
          </div>
        </div>
      </footer>

      {currentNetwork && <SupportWidget whatsappNumber={currentNetwork.supportPhone || '967770000000'} />}
    </div>
  );
}
