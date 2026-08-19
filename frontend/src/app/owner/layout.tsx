"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { OwnerProvider, useOwnerContext } from '../../context/OwnerContext';
import { useAppContext } from '../../context/AppContext';
import { useIdleTimeout } from '../../hooks/useIdleTimeout';
import { useOwnerActions } from '../../hooks/useOwnerActions';
import { 
  Moon, Sun, Globe, Settings, ChevronDown, Key, Shield, LogOut, 
  Menu, X, LayoutDashboard, Home, Info, Edit, Wifi, CreditCard, 
  PlusCircle, Receipt, Download, Layers, Wallet, Bell, AlertTriangle, CheckCircle
} from 'lucide-react';
import { GlobalOwnerModals } from '../../components/owner/GlobalOwnerModals';

const OwnerLayoutContent = ({ children }: { children: React.ReactNode }) => {
  const { isDarkMode, setIsDarkMode } = useAppContext();
  const { ownerName, networks, setGlobalUpdateTick, globalUpdateTick } = useOwnerContext();
  const { fetchOwnerNetworks } = useOwnerActions();
  const network = networks?.[0];
  const pathname = usePathname() || '';
  const router = useRouter();
  
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [dynamicNotifs, setDynamicNotifs] = useState<{ id: string, title: string, message: string, type: 'error' | 'warning' | 'info' | 'success', date: string }[]>([]);

  useEffect(() => {
    const fetchDynamicData = async () => {
      try {
        const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
        if (!token) return;
        
        const notifs: { id: string, title: string, message: string, type: 'error' | 'warning' | 'info' | 'success', date: string }[] = [];

        // 1. Fetch Withdrawals
        try {
          const resW = await fetch('/api/withdrawals', { headers: { 'Authorization': `Bearer ${token}` } });
          if (resW.ok) {
            const data = await resW.json();
            const myWithdrawals = data.filter((w: any) => w.networkName === network?.name);
            myWithdrawals.forEach((w: any) => {
               if (w.status === 'pending') {
                   notifs.push({
                      id: `wd-${w.id}`,
                      title: 'طلب سحب قيد الانتظار',
                      message: `طلب سحب بمبلغ ${w.amount.toLocaleString()} ر.ي إلى ${w.payoutMethod} قيد المراجعة.`,
                      type: 'info',
                      date: new Date(w.requestedAt).toLocaleDateString('ar-EG')
                   });
               } else if (w.status === 'completed') {
                   const diffDays = (new Date().getTime() - new Date(w.requestedAt).getTime()) / (1000 * 3600 * 24);
                   if (diffDays <= 3) {
                       notifs.push({
                          id: `wd-${w.id}`,
                          title: 'تم تحويل مبلغ السحب بنجاح!',
                          message: `تم الموافقة على طلبك وتحويل مبلغ ${w.amount.toLocaleString()} ر.ي إلى حسابك في ${w.payoutMethod}.`,
                          type: 'success',
                          date: new Date(w.requestedAt).toLocaleDateString('ar-EG')
                       });
                   }
               }
            });
          }
        } catch(e) {}

        // 2. Fetch Edit Requests (includes modifying info or adding new categories)
        try {
          const resE = await fetch('/api/edit-requests', { headers: { 'Authorization': `Bearer ${token}` } });
          if (resE.ok) {
            const data = await resE.json();
            const myEdits = data.filter((r: any) => r.network_code === network?.code);
            myEdits.forEach((r: any) => {
               if (r.status === 'pending') {
                   notifs.push({
                      id: `edit-${r.id}`,
                      title: 'طلب تعديل بيانات قيد الانتظار',
                      message: `طلب تعديل بيانات الشبكة أو إضافة فئات جديدة قيد المراجعة. مرجع: ${r.reference_number}.`,
                      type: 'info',
                      date: new Date(r.created_at).toLocaleDateString('ar-EG')
                   });
               } else if (r.status === 'approved') {
                   const diffDays = (new Date().getTime() - new Date(r.created_at).getTime()) / (1000 * 3600 * 24);
                   if (diffDays <= 3) {
                       notifs.push({
                          id: `edit-${r.id}`,
                          title: 'تم الموافقة على طلب التعديل!',
                          message: `تم الموافقة على طلب تعديل بيانات الشبكة وتطبيق التحديثات بنجاح.`,
                          type: 'success',
                          date: new Date(r.created_at).toLocaleDateString('ar-EG')
                       });
                   }
               } else if (r.status === 'rejected') {
                   const diffDays = (new Date().getTime() - new Date(r.created_at).getTime()) / (1000 * 3600 * 24);
                   if (diffDays <= 3) {
                       notifs.push({
                          id: `edit-${r.id}`,
                          title: 'تم رفض طلب التعديل',
                          message: `عذراً، تم رفض طلب تعديل بيانات الشبكة. يرجى التواصل مع الإدارة.`,
                          type: 'error',
                          date: new Date(r.created_at).toLocaleDateString('ar-EG')
                       });
                   }
               }
            });
          }
        } catch(e) {}

        setDynamicNotifs(notifs);
      } catch(e) {}
    };
    if (network?.name && network?.code) {
       fetchDynamicData();
    }
  }, [network?.name, network?.code, globalUpdateTick]);

  const notifications = React.useMemo(() => {
    if (!network || !network.categories) return [];
    const notifs: { id: string, title: string, message: string, type: 'error' | 'warning' | 'info' | 'success', date: string }[] = [];
    
    network.categories.forEach((cat: any) => {
      const stock = cat.remaining !== undefined ? cat.remaining : 0;
      const minThreshold = cat.min_threshold ?? 10;
      
      if (stock === 0 && (network.notif_out_of_stock ?? true)) {
        notifs.push({
          id: `out-${cat.value}`,
          title: 'نفاذ المخزون',
          message: `نفذ مخزون الكروت فئة ${cat.value} ريال`,
          type: 'error',
          date: 'الآن'
        });
      } else if (stock > 0 && stock <= minThreshold && (network.notif_low_stock ?? true)) {
        notifs.push({
          id: `low-${cat.value}`,
          title: 'نقص المخزون',
          message: `مخزون الكروت فئة ${cat.value} ريال وصل للحد الأدنى (${stock} كرت)`,
          type: 'warning',
          date: 'الآن'
        });
      }
    });

    return notifs;
  }, [network]);
  
  const combinedNotifications = React.useMemo(() => {
    return [...notifications, ...dynamicNotifs];
  }, [notifications, dynamicNotifs]);
  
  const unreadCount = combinedNotifications.length;

  const isAuthPage = pathname.includes('/login') || pathname.includes('/change-password') || pathname.includes('/privacy-policy');
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  // Handle sidebar initial state and resize
  useEffect(() => {
    setIsMounted(true);
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsSidebarOpen(true);
      } else {
        setIsSidebarOpen(false);
      }
    };
    
    // Set initial state
    handleResize();

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Close sidebar on route change for mobile
  useEffect(() => {
    if (window.innerWidth < 1024) {
      setIsSidebarOpen(false);
    }
  }, [pathname]);

  // Auto Logout on Inactivity (15 minutes)
  useIdleTimeout(() => {
    if (!isAuthPage && isAuthenticated) {
      const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
      if (token) {
        fetch('/api/logout', { method: 'POST', headers: { 'Authorization': `Bearer ${token}` } }).catch(() => {});
      }
      localStorage.removeItem('auth_token');
      localStorage.removeItem('owner_user');
      localStorage.removeItem('ownerActiveNetworkId');
      router.replace('/owner/login');
      alert('تم تسجيل خروجك تلقائياً بسبب عدم وجود أي نشاط لفترة طويلة.');
    }
  }, 15 * 60 * 1000);

  useEffect(() => {
    if (isAuthPage) {
      setIsAuthenticated(true);
      return;
    }

    const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
    const userStr = typeof window !== 'undefined' ? localStorage.getItem('owner_user') : null;

    if (!token || !userStr) {
      setIsAuthenticated(null);
      router.replace(`/owner/login?redirect=${encodeURIComponent(pathname)}`);
      return;
    }

    try {
      const user = JSON.parse(userStr);
      if (user.role !== 'network_owner') {
        setIsAuthenticated(null);
        router.replace(`/owner/login?redirect=${encodeURIComponent(pathname)}`);
      } else {
        setIsAuthenticated(prev => prev !== true ? true : prev);
      }
    } catch (e) {
      setIsAuthenticated(null);
      router.replace(`/owner/login?redirect=${encodeURIComponent(pathname)}`);
    }
  }, [pathname, isAuthPage, router]);

  // Global Real-time Sync
  useEffect(() => {
    let channel: any = null;
    if (isAuthenticated) {
      import('../../lib/echo').then(({ default: echo }) => {
        if (echo) {
          channel = echo.channel('global-updates')
            .listen('DataUpdated', () => {
              setGlobalUpdateTick(prev => prev + 1);
              fetchOwnerNetworks();
            });
        }
      });
    }

    return () => {
      if (channel && typeof channel.stopListening === 'function') {
        channel.stopListening('DataUpdated');
      }
    };
  }, [isAuthenticated, setGlobalUpdateTick, fetchOwnerNetworks]);

  if (isAuthenticated === null || !isMounted) {
    return (
      <div className={`min-h-screen flex flex-col items-center justify-center font-['Cairo',sans-serif] ${isDarkMode ? 'bg-[#0a0f18]' : 'bg-[#f4f7fb]'}`}>
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p className={`font-bold ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>جاري التحقق من الصلاحيات...</p>
      </div>
    );
  }

  const sidebarLinks = [
    { href: '/owner', label: 'الرئيسية', icon: Home },
    { href: '/owner/pos', label: 'إدارة نقاط البيع (POS)', icon: Wallet },
    { href: '/owner/details', label: 'تفاصيل الشبكة', icon: Info },
    { href: '/owner/statement', label: 'كشف الحساب', icon: Receipt },
    { href: '/owner/cards', label: 'إدارة الكروت', icon: Layers },
    { href: '/owner/import-cards', label: 'استيراد الكروت', icon: Download },
    { href: '/owner/withdrawals', label: 'طلبات السحب', icon: CreditCard },
    { href: '/owner/new-withdrawal', label: 'طلب سحب جديد', icon: PlusCircle },
    { href: '/owner/mikrotik', label: 'إعداد المايكروتك', icon: Wifi },
    { href: '/owner/settings', label: 'إعدادات الشبكة', icon: Settings },
    { href: '/owner/edit-data', label: 'تعديل بيانات الشبكة', icon: Edit },
  ];

  return (
    <div dir="rtl" className={`min-h-screen flex flex-col font-['Cairo',sans-serif] overflow-x-hidden ${isDarkMode ? 'bg-[#0a0f18] text-slate-100' : 'bg-[#f4f7fb] text-slate-800'}`}>
      {!isAuthPage && (
        <>
          {/* Header */}
          <header className={`fixed top-0 right-0 left-0 z-50 h-[72px] flex items-center justify-between px-4 md:px-8 transition-all duration-300 ${isDarkMode ? 'bg-[#0f172a]/80 backdrop-blur-xl border-b border-white/10 shadow-lg shadow-black/20' : 'bg-white/80 backdrop-blur-xl border-b border-slate-200/80 shadow-sm'}`}>
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className={`p-2.5 rounded-xl transition-all active:scale-95 ${isDarkMode ? 'hover:bg-white/10 text-slate-300 hover:text-white' : 'hover:bg-slate-100 text-slate-600 hover:text-slate-900'}`}
                aria-label="Toggle Menu"
              >
                <Menu className="w-5 h-5" />
              </button>
              
              <Link href="/owner" className="flex items-center gap-2.5 ml-2 cursor-pointer transition-opacity hover:opacity-80">
                <div className={`shrink-0 flex items-center justify-center p-1 rounded-xl ${isDarkMode ? 'bg-white/5' : 'bg-slate-50'}`}>
                  <img 
                    src={isDarkMode ? '/logos/logo-dark.png' : '/logos/logo-light.png'} 
                    alt="Card Box Logo" 
                    className="w-9 h-9 object-cover rounded-lg"
                  />
                </div>
                <span className={`text-base md:text-lg font-extrabold tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                  Card Box
                </span>
              </Link>
            </div>
            
            <div className="flex items-center gap-3 md:gap-4">
              {/* Notifications Dropdown */}
              <div className="relative">
                <button 
                  onClick={() => {
                    setShowNotifications(!showNotifications);
                    if (showProfileMenu) setShowProfileMenu(false);
                  }} 
                  className={`relative p-2.5 rounded-xl transition-all border ${isDarkMode ? 'bg-white/5 hover:bg-white/10 border-white/10 text-slate-300' : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-600 shadow-sm'}`}
                  aria-label="Notifications"
                >
                  <Bell className="w-4 h-4" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] flex items-center justify-center bg-red-500 text-white text-[10px] font-bold rounded-full border-2 border-white dark:border-[#0f172a] px-1">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {/* Dropdown Overlay for Mobile */}
                {showNotifications && (
                  <div className="fixed inset-0 z-40 sm:hidden" onClick={() => setShowNotifications(false)} />
                )}

                <div className={`fixed sm:absolute top-[80px] sm:top-full left-4 right-4 sm:left-0 sm:right-auto sm:mt-3 sm:w-80 rounded-2xl p-2 shadow-2xl z-50 border transition-all duration-200 origin-top ${showNotifications ? 'scale-100 opacity-100' : 'scale-95 opacity-0 pointer-events-none'} ${isDarkMode ? 'bg-[#141d2b] border-white/10' : 'bg-white border-slate-200'}`}>
                  <div className={`flex items-center justify-between px-3 py-2 border-b mb-2 ${isDarkMode ? 'border-white/10' : 'border-slate-100'}`}>
                    <span className={`text-sm font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>الإشعارات</span>
                    {unreadCount > 0 && (
                      <span className="text-[10px] px-2 py-0.5 bg-blue-500/10 text-blue-500 rounded-full font-bold">{unreadCount} جديد</span>
                    )}
                  </div>
                  
                  <div className="max-h-64 overflow-y-auto custom-scrollbar flex flex-col gap-1">
                    {combinedNotifications.length === 0 ? (
                      <div className={`text-center py-6 text-xs font-bold ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                        لا توجد إشعارات جديدة
                      </div>
                    ) : (
                      combinedNotifications.map(notif => (
                        <div key={notif.id} className={`p-2.5 rounded-xl flex items-start gap-3 transition-colors ${isDarkMode ? 'hover:bg-white/5' : 'hover:bg-slate-50'}`}>
                          <div className={`mt-0.5 p-1.5 rounded-lg shrink-0 ${notif.type === 'error' ? 'bg-red-500/10 text-red-500' : notif.type === 'warning' ? 'bg-amber-500/10 text-amber-500' : notif.type === 'success' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-blue-500/10 text-blue-500'}`}>
                            {notif.type === 'error' ? <AlertTriangle className="w-4 h-4" /> : notif.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <Bell className="w-4 h-4" />}
                          </div>
                          <div>
                            <div className={`text-xs font-bold ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>{notif.title}</div>
                            <div className={`text-[10px] mt-0.5 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>{notif.message}</div>
                            <div className={`text-[9px] mt-1 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>{notif.date}</div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                  <Link href="/owner/settings" onClick={() => setShowNotifications(false)} className={`block text-center mt-2 pt-2 border-t text-[11px] font-bold transition-colors ${isDarkMode ? 'border-white/10 text-blue-400 hover:text-blue-300' : 'border-slate-100 text-blue-600 hover:text-blue-700'}`}>
                    إعدادات الإشعارات
                  </Link>
                </div>
              </div>

              <div className="relative">
                <div onClick={() => {
                  setShowProfileMenu(!showProfileMenu);
                  if (showNotifications) setShowNotifications(false);
                }} className={`flex items-center gap-2.5 px-3 py-1.5 rounded-xl transition-all cursor-pointer border ${isDarkMode ? 'bg-white/5 hover:bg-white/10 border-white/10 shadow-inner shadow-white/5' : 'bg-white hover:bg-slate-50 border-slate-200 shadow-sm'}`}>
                  <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${showProfileMenu ? 'rotate-180' : ''} ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`} />
                  <div className="text-right hidden sm:block">
                    <span className={`text-xs font-bold block ${isDarkMode ? 'text-slate-100' : 'text-slate-800'}`}>{ownerName}</span>
                    <span className={`text-[10px] block -mt-0.5 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>{network ? network.name : 'مالك شبكة'}</span>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-500 text-white flex items-center justify-center font-bold text-sm shadow-md">{ownerName.charAt(0)}</div>
                </div>
                
                {/* Profile Menu Dropdown */}
                <div className={`absolute left-0 mt-3 w-56 rounded-2xl p-2 shadow-2xl z-50 border transition-all duration-200 origin-top-left ${showProfileMenu ? 'scale-100 opacity-100' : 'scale-95 opacity-0 pointer-events-none'} ${isDarkMode ? 'bg-[#141d2b] border-white/10 text-slate-200' : 'bg-white border-slate-200 text-slate-800'}`}>
                  <Link href="/owner/change-password" onClick={() => setShowProfileMenu(false)} className={`w-full text-right px-4 py-2.5 text-xs rounded-xl font-medium transition-colors flex items-center justify-start gap-3 ${isDarkMode ? 'hover:bg-white/5 text-slate-300' : 'hover:bg-slate-50 text-slate-700'}`}>
                    <Key className="w-4 h-4 text-amber-500 shrink-0" /> <span>تغيير كلمة المرور</span>
                  </Link>
                  <Link href="/owner/privacy-policy" onClick={() => setShowProfileMenu(false)} className={`w-full text-right px-4 py-2.5 text-xs rounded-xl font-medium transition-colors flex items-center justify-start gap-3 ${isDarkMode ? 'hover:bg-white/5 text-slate-300' : 'hover:bg-slate-50 text-slate-700'}`}>
                    <Shield className="w-4 h-4 text-indigo-400 shrink-0" /> <span>شروط الخصوصية والسياسة</span>
                  </Link>
                  <hr className={`my-2 ${isDarkMode ? 'border-white/10' : 'border-slate-100'}`} />
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
                      localStorage.removeItem('ownerActiveNetworkId');
                      router.replace('/owner/login');
                    }}
                    className={`w-full text-right px-4 py-2.5 text-xs rounded-xl font-bold transition-colors flex items-center justify-start gap-3 ${isDarkMode ? 'text-red-400 hover:bg-red-500/10' : 'text-red-600 hover:bg-red-50'}`}
                  >
                    <LogOut className="w-4 h-4 shrink-0" /> <span>تسجيل الخروج</span>
                  </button>
                </div>
              </div>
              
              <button 
                onClick={() => setIsDarkMode(!isDarkMode)} 
                className={`p-2.5 rounded-xl transition-all border ${isDarkMode ? 'bg-white/5 hover:bg-white/10 border-white/10 text-yellow-400' : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-600 shadow-sm'}`}
                aria-label="Toggle Dark Mode"
              >
                {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>
            </div>
          </header>

          {/* Sidebar Overlay */}
          <div 
            className={`fixed inset-0 bg-black/60 z-40 backdrop-blur-sm lg:hidden transition-opacity duration-300 ${isSidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
            onClick={() => setIsSidebarOpen(false)}
          />

          {/* Sidebar Menu */}
          <aside 
            className={`fixed top-[72px] right-0 bottom-0 z-40 flex flex-col transition-all duration-300 ease-in-out
              ${isSidebarOpen ? 'w-[280px] translate-x-0' : 'w-[280px] lg:w-[80px] translate-x-full lg:translate-x-0'} 
              ${isDarkMode ? 'bg-[#0f172a] border-l border-white/10 shadow-[0_0_40px_rgba(0,0,0,0.3)]' : 'bg-white border-l border-slate-200 shadow-[0_0_40px_rgba(0,0,0,0.05)]'}`}
          >
            <div className={`flex-1 overflow-y-auto custom-scrollbar overflow-x-hidden ${isSidebarOpen ? 'p-4' : 'py-4 px-2'}`}>
              <div className={`mb-4 mt-2 px-3 transition-opacity duration-200 ${isSidebarOpen ? 'opacity-100' : 'opacity-0 hidden'}`}>
                <h3 className={`text-[11px] font-black uppercase tracking-widest ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>القائمة الرئيسية</h3>
              </div>
              
              <div className="flex flex-col gap-1.5">
                {sidebarLinks.map((link, idx) => {
                  const Icon = link.icon;
                  const isActive = link.href === '/owner' 
                    ? pathname === '/owner' || pathname === '/owner/'
                    : pathname.includes(link.href);
                  
                  return (
                    <Link 
                      key={idx} 
                      href={link.href}
                      title={!isSidebarOpen ? link.label : undefined}
                      onClick={() => {
                        if (window.innerWidth < 1024) setIsSidebarOpen(false);
                      }}
                      className={`relative flex items-center ${isSidebarOpen ? 'gap-3.5 px-4 py-3.5 mx-0' : 'justify-center p-3 mx-1'} rounded-2xl transition-all duration-200 font-bold text-[13px] group overflow-hidden ${
                        isActive 
                          ? (isDarkMode 
                              ? 'bg-gradient-to-l from-blue-600/20 to-transparent text-blue-400 border border-blue-500/20 shadow-inner' 
                              : 'bg-gradient-to-l from-blue-50 to-transparent text-blue-700 border border-blue-100') 
                          : (isDarkMode 
                              ? 'text-slate-400 hover:bg-white/5 hover:text-slate-200' 
                              : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900')
                      }`}
                    >
                      {/* Active Indicator Line */}
                      {isActive && (
                        <div className={`absolute right-0 top-0 bottom-0 w-1 bg-blue-500 ${isSidebarOpen ? 'rounded-l-full' : 'rounded-full'}`} />
                      )}
                      
                      <div className={`p-2 rounded-xl transition-colors shrink-0 ${isActive ? (isDarkMode ? 'bg-blue-500/20' : 'bg-blue-100') : (isDarkMode ? 'bg-white/5 group-hover:bg-white/10' : 'bg-slate-100 group-hover:bg-slate-200')}`}>
                        <Icon className={`w-5 h-5 transition-transform duration-200 ${!isSidebarOpen && 'group-hover:scale-110'} ${isActive ? 'text-blue-500' : (isDarkMode ? 'text-slate-400 group-hover:text-slate-300' : 'text-slate-500 group-hover:text-slate-700')}`} />
                      </div>
                      <span className={`whitespace-nowrap transition-all duration-300 ${isSidebarOpen ? 'opacity-100 w-auto' : 'opacity-0 w-0 overflow-hidden'}`}>
                        {link.label}
                      </span>
                    </Link>
                  );
                })}
              </div>
            </div>
            
            {/* Sidebar Footer (Optional) */}
            <div className={`mt-auto border-t transition-all duration-300 ${isSidebarOpen ? 'p-4' : 'p-2'} ${isDarkMode ? 'border-white/10' : 'border-slate-100'}`}>
              <div className={`flex items-center justify-center rounded-2xl transition-all duration-300 ${isSidebarOpen ? 'p-4' : 'py-4 px-2'} ${isDarkMode ? 'bg-white/5' : 'bg-slate-50'} text-center overflow-hidden`}>
                <div className={`whitespace-nowrap transition-all duration-300 ${isSidebarOpen ? 'opacity-100' : 'opacity-0 w-0 hidden'}`}>
                  <div className={`text-xs font-bold ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>تحتاج إلى مساعدة؟</div>
                  <div className={`text-[10px] mt-1 ${isDarkMode ? 'text-slate-500' : 'text-slate-500'}`}>تواصل مع الدعم الفني</div>
                </div>
                {!isSidebarOpen && (
                  <div title="الدعم الفني" className={`text-blue-500 cursor-pointer`}>
                    <Info className="w-5 h-5" />
                  </div>
                )}
              </div>
            </div>
          </aside>
        </>
      )}
      
      {/* Main Content Area */}
      <div className={`flex-1 transition-all duration-300 ${!isAuthPage ? 'pt-[72px]' : ''} ${!isAuthPage ? (isSidebarOpen ? 'lg:pr-[280px]' : 'lg:pr-[80px]') : ''}`}>
        {isAuthPage ? (
          <>{children}</>
        ) : (
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-500">
            {children}
          </main>
        )}
      </div>

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
