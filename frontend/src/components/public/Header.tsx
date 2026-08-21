'use client';

import React from 'react';
import { UserPlus, LogIn, Wifi, LogOut, User, History, Wallet, Eye, EyeOff } from 'lucide-react';
import ThemeToggle from '@/components/public/ThemeToggle';
import CardBoxLogo from '@/components/common/CardBoxLogo';
import Button from '@/components/common/Button';
import { UserAccount, PublicNetworkInfo } from '@/types';

interface HeaderProps {
  user: UserAccount | null;
  onOpenAuth: (mode: 'login' | 'register') => void;
  onLogout: () => void;
  network?: PublicNetworkInfo;
  activeTab?: string;
  onNavigate?: (tab: string) => void;
  onOpenPurchases?: () => void;
  onOpenProfile?: () => void;
  onOpenWallet?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  user,
  onOpenAuth,
  onLogout,
  network,
  onNavigate,
  onOpenPurchases,
  onOpenProfile,
  onOpenWallet,
}) => {
  const isLoggedIn = Boolean(user?.isLoggedIn);
  const [showBalance, setShowBalance] = React.useState(false);

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-950/95 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80 transition-colors">
      <div className="max-w-6xl mx-auto px-4 py-2.5 sm:py-3 dir-rtl">
        {isLoggedIn ? (
          /* ================= LOGGED IN STATE ================= */
          <div className="flex flex-col gap-2.5">
            {/* Top Row: Network Breadcrumb on Right, Theme Toggle on Left */}
            <div className="flex items-center justify-between gap-2 shrink-0">
              {/* Network Breadcrumb (Right side in RTL) */}
              <div className="flex items-center gap-2 text-sm sm:text-base">
                <span className="text-slate-800 dark:text-slate-100 font-black text-sm sm:text-base md:text-lg truncate">
                  {network?.nameAr || 'الشبكات'}
                </span>
                <span className="text-slate-300 dark:text-slate-700">/</span>
                <button
                  onClick={() => onNavigate && onNavigate('home')}
                  className="text-purple-600 dark:text-purple-400 font-bold hover:underline flex items-center gap-1 shrink-0 text-xs sm:text-sm cursor-pointer"
                >
                  <Wifi className="w-3.5 h-3.5 animate-pulse" />
                  <span>الشبكات</span>
                </button>
              </div>

              {/* Theme Toggle (Left side in RTL) */}
              <div className="shrink-0">
                <ThemeToggle />
              </div>
            </div>

            {/* Bottom Row: 3 Pill Buttons (Username on Right, My Purchases in Middle, Logout on Left) */}
            <div className="flex items-center justify-start gap-1.5 sm:gap-2 pt-2 border-t border-slate-100 dark:border-slate-800/60 overflow-x-auto no-scrollbar">
              {/* 1. Username Pill Button (Right side in RTL) */}
              <button
                onClick={onOpenProfile}
                className="flex items-center justify-center gap-1.5 bg-slate-100 text-slate-800 dark:bg-slate-900/90 dark:text-slate-100 hover:bg-slate-200 dark:hover:bg-slate-800 px-3 py-1.5 rounded-full border border-slate-200 dark:border-slate-800 text-[10px] sm:text-xs font-bold transition-all shrink-0 cursor-pointer shadow-sm active:scale-95 whitespace-nowrap"
              >
                <User className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400 shrink-0" />
                <span className="whitespace-nowrap">{user?.fullName || 'مستخدم'}</span>
              </button>

              {/* 2. My Purchases Pill Button (Middle in RTL) */}
              <button
                onClick={onOpenPurchases}
                className="flex items-center justify-center gap-1.5 bg-slate-100 text-slate-800 dark:bg-slate-900/90 dark:text-slate-100 hover:bg-slate-200 dark:hover:bg-slate-800 px-3 py-1.5 rounded-full border border-slate-200 dark:border-slate-800 text-[10px] sm:text-xs font-bold transition-all shrink-0 cursor-pointer shadow-sm active:scale-95 whitespace-nowrap"
              >
                <History className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400 shrink-0" />
                <span className="whitespace-nowrap">مشترياتي</span>
              </button>

              {/* 3. Wallet Pill Button */}
              <button
                onClick={onOpenWallet}
                className="flex items-center justify-center gap-1.5 bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-100 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 px-3 py-1.5 rounded-full border border-emerald-200 dark:border-emerald-800/50 text-[10px] sm:text-xs font-bold transition-all shrink-0 cursor-pointer shadow-sm active:scale-95 whitespace-nowrap"
              >
                <Wallet className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span className="whitespace-nowrap">محفظتي</span>
              </button>

              {/* 4. Logout Pill Button (Left side in RTL) */}
              <button
                onClick={onLogout}
                className="flex items-center justify-center gap-1.5 bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-300 hover:bg-red-100 dark:hover:bg-red-900/50 px-3 py-1.5 rounded-full border border-red-200 dark:border-red-900/30 text-[10px] sm:text-xs font-bold transition-all shrink-0 cursor-pointer shadow-sm active:scale-95 whitespace-nowrap"
              >
                <LogOut className="w-3.5 h-3.5 text-red-500 shrink-0" />
                <span className="whitespace-nowrap">تسجيل خروج</span>
              </button>
            </div>

            {/* Secondary Header: Wallet Balance */}
            <div className="flex items-center justify-between bg-purple-50 dark:bg-purple-900/20 p-2 sm:p-2.5 rounded-xl border border-purple-100 dark:border-purple-800/50 mt-1">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-purple-100 dark:bg-purple-800/80 flex items-center justify-center">
                  <Wallet className="w-3.5 h-3.5 text-purple-600 dark:text-purple-300" />
                </div>
                <span className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200">
                  رصيد المحفظة:
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm sm:text-base font-black text-purple-700 dark:text-purple-400 tracking-wider">
                  {showBalance ? `${(user?.wallet_balance || 0).toFixed(2)} ر.ي` : '••••••••'}
                </span>
                <button
                  onClick={() => setShowBalance(!showBalance)}
                  className="p-1 text-slate-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors cursor-pointer"
                  title={showBalance ? 'إخفاء الرصيد' : 'إظهار الرصيد'}
                >
                  {showBalance ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* ================= LOGGED OUT STATE ================= */
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5 sm:gap-4">
            {/* Auth buttons & Theme Switcher (Right side in RTL) */}
            <div className="flex items-center justify-between sm:justify-start gap-2 shrink-0">
              <ThemeToggle />

              <div className="flex items-center gap-1.5 sm:gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onOpenAuth('login')}
                  icon={<LogIn className="w-3.5 h-3.5" />}
                  className="rounded-xl font-bold text-xs"
                >
                  تسجيل الدخول
                </Button>

                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => onOpenAuth('register')}
                  icon={<UserPlus className="w-3.5 h-3.5" />}
                  className="rounded-xl font-bold text-xs bg-purple-600 hover:bg-purple-700 text-white shadow-sm"
                >
                  حساب جديد
                </Button>
              </div>
            </div>

            {/* Brand Logo & Network Breadcrumb (Left side in RTL) */}
            <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 border-t sm:border-t-0 border-slate-100 dark:border-slate-800/60 sm:pt-0">
              <div className="flex items-center gap-2 text-xs sm:text-sm border-l border-slate-200 dark:border-slate-800 pl-3 ml-1">
                <button
                  onClick={() => onNavigate && onNavigate('home')}
                  className="text-purple-600 dark:text-purple-400 font-semibold hover:underline flex items-center gap-1 shrink-0 text-xs cursor-pointer"
                >
                  <Wifi className="w-3.5 h-3.5 animate-pulse" />
                  <span>الشبكات</span>
                </button>
                <span className="text-slate-300 dark:text-slate-700">/</span>
                <span className="text-slate-800 dark:text-slate-100 font-black text-sm sm:text-base md:text-lg truncate">
                  {network?.nameAr || 'البحث عن شبكة'}
                </span>
              </div>

              <button
                onClick={() => onNavigate && onNavigate('home')}
                className="text-right cursor-pointer hover:opacity-90 transition-opacity"
              >
                <CardBoxLogo size="md" showText={true} />
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
