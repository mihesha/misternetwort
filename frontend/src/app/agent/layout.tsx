"use client";
import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { AgentProvider, useAgentContext } from '../../context/AgentContext';
import { useAppContext } from '../../context/AppContext';
import { useIdleTimeout } from '../../hooks/useIdleTimeout';
import {
  Moon, Sun, LogOut, Menu, Home, Shield, PlusCircle, Wallet, Receipt, ChevronDown, Bell, Key, Network, ChevronRight, ChevronLeft
} from 'lucide-react';

const AgentLayoutContent = ({ children }: { children: React.ReactNode }) => {
  const { isDarkMode, setIsDarkMode, isThemeLoaded } = useAppContext();
  const { agentName, fetchStats, isDataLoaded } = useAgentContext();
  const pathname = usePathname() || '';
  const router = useRouter();

  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const isAuthPage = pathname.includes('/login') || pathname.includes('/join') || pathname.includes('/change-password');
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    setIsMounted(true);
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setIsSidebarOpen(false);
      } else {
        const savedState = localStorage.getItem('agentSidebarState');
        setIsSidebarOpen(savedState !== 'collapsed');
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useIdleTimeout(() => {
    if (!isAuthPage && isAuthenticated) {
      const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
      if (token) fetch('/api/logout', { method: 'POST', headers: { 'Authorization': `Bearer ${token}` } }).catch(() => {});
      localStorage.removeItem('auth_token');
      localStorage.removeItem('agent_user');
      router.replace('/agent/login');
    }
  }, 15 * 60 * 1000);

  useEffect(() => {
    if (isAuthPage) {
      setIsAuthenticated(true);
      return;
    }

    const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
    const userStr = typeof window !== 'undefined' ? localStorage.getItem('agent_user') : null;

    if (!token || !userStr) {
      setIsAuthenticated(null);
      router.replace(`/agent/login`);
      return;
    }

    try {
      const user = JSON.parse(userStr);
      if (user.role !== 'agent') {
        setIsAuthenticated(null);
        router.replace(`/agent/login`);
      } else if (user.must_change_password || user.mustChangePassword) {
        if (!pathname.includes('/agent/change-password')) {
          router.replace(`/agent/change-password`);
        } else {
          setIsAuthenticated(true);
        }
      } else {
        if (pathname.includes('/agent/change-password')) {
          router.replace(`/agent`);
        } else {
          setIsAuthenticated(true);
        }
      }
    } catch (e) {
      router.replace(`/agent/login`);
    }
  }, [pathname, isAuthPage, router]);

  useEffect(() => {
    if (isAuthenticated === true && !isAuthPage) {
      fetchStats();
    }
  }, [isAuthenticated, isAuthPage]);

  if (!isMounted || !isThemeLoaded) return null;

  if (isAuthenticated === null) {
    return <div className={`min-h-screen ${isDarkMode ? 'bg-[#0a0f18]' : 'bg-[#f4f7fb]'}`} />;
  }

  const toggleSidebar = () => {
    const newState = !isSidebarOpen;
    setIsSidebarOpen(newState);
    if (window.innerWidth >= 1024) {
      localStorage.setItem('agentSidebarState', newState ? 'expanded' : 'collapsed');
    }
  };

  const sidebarLinks = [
    { href: '/agent', label: 'الرئيسية', icon: Home, exact: true },
    { href: '/agent/networks', label: 'شبكاتي', icon: Network },
    { href: '/agent/add-network', label: 'إضافة شبكة', icon: PlusCircle },
    { href: '/agent/transactions', label: 'السجل المالي', icon: Receipt },
    { href: '/agent/withdrawals', label: 'طلبات السحب', icon: Wallet },
  ];

  return (
    <div dir="rtl" className={`min-h-screen flex flex-col font-['Cairo',sans-serif] overflow-x-hidden ${isDarkMode ? 'bg-[#0a0f18] text-slate-100' : 'bg-[#f4f7fb] text-slate-800'}`}>
      {!isAuthPage && (
        <>
          <header className={`fixed top-0 right-0 left-0 z-50 h-18 flex items-center justify-between px-4 md:px-8 transition-all duration-300 ${isDarkMode ? 'bg-[#0f172a]/90 backdrop-blur-xl border-b border-white/10 shadow-lg shadow-black/20' : 'bg-white/90 backdrop-blur-xl border-b border-slate-200/80 shadow-sm'}`}>
            <div className="flex items-center gap-3">
              <button
                onClick={toggleSidebar}
                className={`p-2.5 rounded-xl transition-all outline-none ${isDarkMode ? 'hover:bg-white/10 text-white' : 'hover:bg-slate-100 text-slate-600'}`}
              >
                <Menu className="w-5 h-5" />
              </button>
              <Link href="/agent" className="flex items-center gap-2.5">
                <img src={isDarkMode ? '/logos/logo-dark.png' : '/logos/logo-light.png'} alt="CardBox" className="h-8 object-contain" />
                <span className={`font-black text-lg tracking-tight hidden sm:block ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>بوابة المهندسين</span>
              </Link>
            </div>

            <div className="flex items-center gap-4">
              <div className="relative" ref={profileRef}>
                <div onClick={() => setShowProfileMenu(!showProfileMenu)} className={`flex items-center gap-2.5 px-3 py-1.5 rounded-xl cursor-pointer border transition-colors ${isDarkMode ? 'bg-white/5 border-white/10 hover:bg-white/10' : 'bg-white border-slate-200 shadow-sm hover:border-blue-400'}`}>
                  <ChevronDown className="w-4 h-4 hidden sm:block opacity-50" />
                  <div className="text-right hidden sm:block">
                    <span className="text-xs font-bold block">{agentName}</span>
                    <span className="text-[10px] block opacity-70">مهندس معتمد</span>
                  </div>
                  <div className={`w-8 h-8 rounded-full bg-linear-to-tr from-blue-600 to-indigo-500 text-white flex items-center justify-center font-bold text-sm shadow-md ring-2 ${isDarkMode ? 'ring-[#0f172a]' : 'ring-white'}`}>
                    {agentName.charAt(0)}
                  </div>
                </div>

                {showProfileMenu && (
                  <div className={`absolute top-full left-0 mt-3 w-48 rounded-2xl p-2 shadow-2xl z-50 border ${isDarkMode ? 'bg-[#141d2b] border-white/10 text-slate-200 shadow-black/40' : 'bg-white border-slate-200 text-slate-800 shadow-blue-900/5'}`}>
                    <button
                      onClick={() => {
                        localStorage.removeItem('auth_token');
                        localStorage.removeItem('agent_user');
                        router.replace('/agent/login');
                      }}
                      className="w-full text-right px-4 py-3 text-[13px] rounded-xl font-bold flex items-center gap-3 text-red-500 hover:bg-red-500/10 transition-colors"
                    >
                      <LogOut className="w-4 h-4" /> <span>تسجيل الخروج</span>
                    </button>
                  </div>
                )}
              </div>
              <div className={`hidden lg:block w-px h-6 ${isDarkMode ? 'bg-white/10' : 'bg-slate-200'}`} />
              <button
                onClick={() => setIsDarkMode(!isDarkMode)}
                className={`p-2.5 rounded-xl border transition-colors ${isDarkMode ? 'bg-white/5 border-white/10 text-yellow-400 hover:bg-white/10' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}
              >
                {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>
            </div>
          </header>

          {/* Sidebar Overlay */}
          <div className={`fixed inset-0 bg-black/60 z-40 lg:hidden ${isSidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={() => setIsSidebarOpen(false)} />

          {/* Sidebar */}
          <aside className={`fixed top-18 right-0 bottom-0 z-40 flex flex-col transition-all duration-300 ease-in-out ${isSidebarOpen ? 'w-70 translate-x-0' : 'w-70 lg:w-20 translate-x-full lg:translate-x-0'} ${isDarkMode ? 'bg-[#0f172a] border-l border-white/10 shadow-[0_0_40px_rgba(0,0,0,0.3)]' : 'bg-white border-l border-slate-200 shadow-[0_0_40px_rgba(0,0,0,0.05)]'}`}>
            <div className={`flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar ${isSidebarOpen ? 'p-4' : 'py-4 px-2'}`}>
              <div className="flex flex-col gap-1.5 mt-2">
                {sidebarLinks.map((link, idx) => {
                  const Icon = link.icon;
                  const isActive = link.exact ? pathname === link.href : pathname.includes(link.href);
                  return (
                    <Link
                      key={idx}
                      href={link.href}
                      onClick={() => window.innerWidth < 1024 && setIsSidebarOpen(false)}
                      className={`flex items-center ${isSidebarOpen ? 'gap-3.5 px-4 py-3.5 mx-0' : 'justify-center p-3 mx-1'} rounded-2xl transition-all font-bold text-[13px] group relative overflow-hidden ${
                        isActive 
                          ? (isDarkMode 
                              ? 'bg-linear-to-l from-blue-600/20 to-transparent text-blue-400 border border-blue-500/20 shadow-inner' 
                              : 'bg-linear-to-l from-blue-50 to-transparent text-blue-700 border border-blue-100') 
                          : (isDarkMode 
                              ? 'text-slate-400 hover:bg-white/5 hover:text-slate-200' 
                              : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900')
                      }`}
                    >
                      {isActive && (
                        <div className={`absolute right-0 top-0 bottom-0 w-1 bg-blue-500 ${isSidebarOpen ? 'rounded-l-full' : 'rounded-full'}`} />
                      )}
                      <div className={`p-2 rounded-xl transition-colors shrink-0 ${isActive ? (isDarkMode ? 'bg-blue-500/20' : 'bg-blue-100') : (isDarkMode ? 'bg-white/5 group-hover:bg-white/10' : 'bg-slate-100 group-hover:bg-slate-200')}`}>
                        <Icon className={`w-5 h-5 transition-transform duration-200 ${!isSidebarOpen && 'group-hover:scale-110'} ${isActive ? 'text-blue-500' : (isDarkMode ? 'text-slate-400 group-hover:text-slate-300' : 'text-slate-500 group-hover:text-slate-700')}`} />
                      </div>
                      <span className={`whitespace-nowrap transition-all duration-300 ${isSidebarOpen ? 'opacity-100 w-auto' : 'opacity-0 w-0 hidden'}`}>{link.label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Sidebar Footer */}
            <div className={`mt-auto border-t transition-all duration-300 flex flex-col gap-2 ${isSidebarOpen ? 'p-4' : 'p-2'} ${isDarkMode ? 'border-white/10' : 'border-slate-100'}`}>
              {/* Toggle Button */}
              <button
                onClick={toggleSidebar}
                className={`hidden lg:flex items-center justify-center mt-2 group outline-none ${isSidebarOpen ? 'self-end' : 'mx-auto'}`}
              >
                <div className={`p-2 rounded-xl transition-colors shrink-0 ${isDarkMode ? 'bg-white/5 group-hover:bg-white/10' : 'bg-slate-100 group-hover:bg-slate-200'}`}>
                  {isSidebarOpen ? (
                    <ChevronRight className={`w-5 h-5 transition-transform duration-200 ${isDarkMode ? 'text-slate-400 group-hover:text-slate-300' : 'text-slate-500 group-hover:text-slate-700'}`} />
                  ) : (
                    <ChevronLeft className={`w-5 h-5 transition-transform duration-200 group-hover:scale-110 ${isDarkMode ? 'text-slate-400 group-hover:text-slate-300' : 'text-slate-500 group-hover:text-slate-700'}`} />
                  )}
                </div>
              </button>
            </div>
          </aside>
        </>
      )}

      {/* Main Content */}
      <div className={`flex-1 transition-all duration-300 ${!isAuthPage ? 'pt-18' : ''} ${!isAuthPage ? (isSidebarOpen ? 'lg:pr-70' : 'lg:pr-20') : ''}`}>
        {isAuthPage ? children : <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-500">{children}</main>}
      </div>
    </div>
  );
}

export default function AgentLayout({ children }: { children: React.ReactNode }) {
  return (
    <AgentProvider>
      <AgentLayoutContent>{children}</AgentLayoutContent>
    </AgentProvider>
  );
}
