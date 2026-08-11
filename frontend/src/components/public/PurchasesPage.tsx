'use client';

import React, { useState } from 'react';
import {
  ShoppingCart,
  Wifi,
  History,
  Heart,
  Sun,
  Moon,
  HelpCircle,
  LogOut,
  X,
  Zap,
  Hash,
  Copy,
  Check,
  Headphones,
  MapPin,
  ArrowLeft,
} from 'lucide-react';
import { UserAccount, OrderDetails, PublicNetworkInfo } from '@/types';
import CardBoxLogo from '@/components/common/CardBoxLogo';
import SupportWidget from '@/components/public/SupportWidget';


interface PurchasesPageProps {
  user: UserAccount | null;
  orders?: OrderDetails[];
  onNavigate: (tab: string) => void;
  onLogout: () => void;
  onOpenSupport?: () => void;
}

type PurchaseTab = 'pending' | 'approved' | 'cancelled';

export const PurchasesPage: React.FC<PurchasesPageProps> = ({
  user,
  orders = [],
  onNavigate,
  onLogout,
  onOpenSupport,
}) => {
  const [activeTab, setActiveTab] = useState<PurchaseTab>('approved');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isFavoritesOpen, setIsFavoritesOpen] = useState(false);
  const [isSupportOpen, setIsSupportOpen] = useState(false);
  const [copiedPin, setCopiedPin] = useState<string | null>(null);

  const [isDark, setIsDark] = useState(() => {
    if (typeof document !== 'undefined') {
      return document.documentElement.classList.contains('dark');
    }
    return true;
  });

  // Toggle Theme
  const toggleTheme = () => {
    const root = document.documentElement;
    const isCurrentlyDark = root.classList.contains('dark');
    if (isCurrentlyDark) {
      root.classList.remove('dark');
      setIsDark(false);
    } else {
      root.classList.add('dark');
      setIsDark(true);
    }
  };

  // User initials
  const getUserInitials = (name?: string) => {
    if (!name) return 'ام';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  // Filter orders/cards by activeTab
  // Assuming DEMO cards if no orders
  const getCardsForTab = () => {
    const allCards: Array<{
      id: string;
      packageName: string;
      networkName: string;
      serialNumber: string;
      pinCode: string;
      dataSize: string;
      duration: string;
      expireDate: string;
      date?: string;
      status: PurchaseTab;
    }> = [];

    orders.forEach((ord) => {
      const cardTabStatus: PurchaseTab =
        ord.status === 'completed'
          ? 'approved'
          : ord.status === 'pending'
          ? 'pending'
          : 'cancelled';

      ord.generatedCards.forEach((c) => {
        allCards.push({
          id: c.pinCode,
          packageName: c.packageName,
          networkName: 'شبكة',
          serialNumber: c.serialNumber,
          pinCode: c.pinCode,
          dataSize: c.dataSize,
          duration: c.duration,
          expireDate: c.expireDate,
          date: ord.date,
          status: cardTabStatus,
        });
      });
    });

    return allCards.filter((c) => c.status === activeTab);
  };

  const currentCards = getCardsForTab();

  const handleCopyPin = (pin: string) => {
    navigator.clipboard.writeText(pin);
    setCopiedPin(pin);
    setTimeout(() => setCopiedPin(null), 2000);
  };

  // Derive favorite networks dynamically from orders
  const getFavoriteNetworks = (): PublicNetworkInfo[] => {
    const list: PublicNetworkInfo[] = [];
    // Removed mock CURRENT_NETWORK
    return list;
  };

  const favoriteNetworks = getFavoriteNetworks();
  const totalCardsPurchased = orders.reduce((sum, ord) => sum + ord.generatedCards.length, 0);

  return (
    <div dir="rtl" className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans pb-24 relative selection:bg-purple-500 selection:text-white transition-colors duration-200">
      {/* ================= TOP HEADER (Matching User Screenshot) ================= */}
      <header className="sticky top-0 z-40 bg-white/90 dark:bg-slate-950/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800/80 px-4 py-3">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-3">
          {/* Right Side (RTL): App Logo & Dashboard Title */}
          <div className="flex items-center gap-3">
            {/* Logo Badge */}
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-900 via-indigo-900 to-purple-600 p-0.5 shadow-md flex items-center justify-center shrink-0">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                <CardBoxLogo size="sm" showText={false} />
              </div>
            </div>

            <div className="text-right">
              <h1 className="text-base font-black text-slate-900 dark:text-white leading-tight">لوحة العميل</h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                {user?.fullName || 'اكرم محمد الجائفي'}
              </p>
            </div>
          </div>

          {/* Left Side (RTL): User Avatar with Green Dot */}
          <div className="relative">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="w-11 h-11 rounded-full bg-purple-100 dark:bg-purple-600/30 hover:bg-purple-200 dark:hover:bg-purple-600/50 border border-purple-300 dark:border-purple-500/40 text-purple-700 dark:text-purple-200 font-black text-sm flex items-center justify-center relative cursor-pointer transition-all active:scale-95 shadow-lg"
            >
              <span>{getUserInitials(user?.fullName)}</span>
              {/* Online Green Indicator Dot */}
              <span className="w-3 h-3 bg-emerald-500 border-2 border-white dark:border-slate-950 rounded-full absolute bottom-0 left-0"></span>
            </button>

            {/* Dropdown Popup Menu (Matching Screenshot 1) */}
            {isMenuOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setIsMenuOpen(false)}
                ></div>
                <div className="absolute left-0 top-14 z-50 w-64 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-4 text-right space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
                  {/* User info header */}
                  <div className="pb-3 border-b border-slate-100 dark:border-slate-800 space-y-0.5">
                    <h3 className="text-sm font-black text-slate-900 dark:text-white">
                      {user?.fullName || 'اكرم محمد الجائفي'}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-mono dir-ltr text-right">
                      {user?.phone || '+967771116809'}
                    </p>
                  </div>

                  {/* Menu Links */}
                  <div className="space-y-1 text-xs font-bold text-slate-700 dark:text-slate-200">
                    <button
                      onClick={() => {
                        toggleTheme();
                        setIsMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-right cursor-pointer"
                    >
                      {isDark ? (
                        <>
                          <Sun className="w-4 h-4 text-amber-500" />
                          <span>الوضع المضيء</span>
                        </>
                      ) : (
                        <>
                          <Moon className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                          <span>الوضع الداكن</span>
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => {
                        setIsMenuOpen(false);
                        setIsSupportOpen(true);
                        if (onOpenSupport) onOpenSupport();
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-right cursor-pointer"
                    >
                      <HelpCircle className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                      <span>الدعم والمساعدة</span>
                    </button>

                    <button
                      onClick={() => {
                        setIsMenuOpen(false);
                        onLogout();
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl hover:bg-red-50 dark:hover:bg-red-950/40 text-red-600 dark:text-red-400 transition-colors text-right cursor-pointer"
                    >
                      <LogOut className="w-4 h-4 text-red-600 dark:text-red-400" />
                      <span>تسجيل الخروج</span>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      {/* ================= MAIN CONTENT AREA ================= */}
      <main className="max-w-4xl w-full mx-auto px-4 py-2 sm:py-3 space-y-3.5 flex-1">
        {/* Header Card (Title, Description & Segmented Tabs) */}
        <div className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800/90 rounded-3xl p-5 sm:p-6 space-y-5 shadow-xl relative overflow-hidden">
          {/* Header Title & Subtitle */}
          <div className="space-y-1.5 text-right">
            {activeTab === 'approved' && (
              <>
                <h2 className="text-xl sm:text-2xl font-black text-purple-700 dark:text-purple-300">
                  كروت مشترياتي
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-medium leading-relaxed">
                  استعرض كروت الإنترنت التي قمت بشرائها مع بيانات استخدامها وتفاصيل العمليات.
                </p>
              </>
            )}
            {activeTab === 'pending' && (
              <>
                <h2 className="text-xl sm:text-2xl font-black text-purple-700 dark:text-purple-300">
                  طلبات قيد المراجعة
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-medium leading-relaxed">
                  تابع الطلبات التي ما زالت بانتظار مراجعة وتأكيد عملية الدفع من قبل إدارة الشبكة.
                </p>
              </>
            )}
            {activeTab === 'cancelled' && (
              <>
                <h2 className="text-xl sm:text-2xl font-black text-purple-700 dark:text-purple-300">
                  الطلبات الملغية
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-medium leading-relaxed">
                  استعرض الطلبات التي تم رفضها من الإدارة أو انتهت مهلة سدادها وتم إلغاؤها.
                </p>
              </>
            )}
          </div>

          {/* Segmented Pill Navigation Bar (Exact order matching user screenshots: قيد الانتظار | الموافق عليها | الملغية) */}
          <div className="bg-slate-100 dark:bg-slate-950/80 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800/80 grid grid-cols-3 gap-1">
            <button
              onClick={() => setActiveTab('pending')}
              className={`py-2 px-3 text-xs sm:text-sm font-bold rounded-xl transition-all cursor-pointer text-center ${
                activeTab === 'pending'
                  ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              قيد الانتظار
            </button>

            <button
              onClick={() => setActiveTab('approved')}
              className={`py-2 px-3 text-xs sm:text-sm font-bold rounded-xl transition-all cursor-pointer text-center ${
                activeTab === 'approved'
                  ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              الموافق عليها
            </button>

            <button
              onClick={() => setActiveTab('cancelled')}
              className={`py-2 px-3 text-xs sm:text-sm font-bold rounded-xl transition-all cursor-pointer text-center ${
                activeTab === 'cancelled'
                  ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              الملغية
            </button>
          </div>
        </div>

        {/* Display Content Box / Empty State Box */}
        <div className="bg-white/80 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 rounded-3xl p-8 sm:p-12 text-center min-h-[280px] flex flex-col items-center justify-center space-y-4 shadow-inner">
          {currentCards.length > 0 ? (
            <div className="w-full space-y-4 text-right">
              {currentCards.map((card, idx) => (
                <div
                  key={idx}
                  className="bg-slate-50 dark:bg-slate-900 p-5 rounded-2xl border border-purple-200 dark:border-purple-500/30 space-y-3"
                >
                  <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
                    <span className="font-extrabold text-purple-700 dark:text-purple-300 flex items-center gap-1.5">
                      <Zap className="w-4 h-4 text-amber-500 dark:text-amber-400" />
                      {card.packageName}
                    </span>
                    <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                      {card.serialNumber}
                    </span>
                  </div>

                  <div className="bg-slate-200/60 dark:bg-black/40 p-3 rounded-xl flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 block">كود الكرت:</span>
                      <span className="text-lg font-mono font-black text-amber-600 dark:text-amber-300">
                        {card.pinCode.replace(/-/g, '')}
                      </span>
                    </div>
                    <button
                      onClick={() => handleCopyPin(card.pinCode)}
                      className="px-3 py-1.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold rounded-lg text-xs flex items-center gap-1 cursor-pointer transition-all"
                    >
                      {copiedPin === card.pinCode ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedPin === card.pinCode ? 'تم النسخ' : 'نسخ'}</span>
                    </button>
                  </div>

                  <div className="flex flex-wrap items-center justify-between text-xs text-slate-600 dark:text-slate-300 pt-1 gap-2 border-t border-slate-200 dark:border-slate-800">
                    <span>الحجم: <strong className="text-slate-900 dark:text-white">{card.dataSize}</strong></span>
                    <span>المدة: <strong className="text-slate-900 dark:text-white">{card.duration}</strong></span>
                    <span>الصلاحية: <strong className="text-slate-900 dark:text-white">{card.expireDate}</strong></span>
                    {card.date && <span className="text-[11px] text-slate-400 font-mono">{card.date}</span>}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* Empty State matching User Screenshots 3, 4, 5 */
            <div className="space-y-3 flex flex-col items-center">
              <div className="w-16 h-16 rounded-3xl bg-slate-100 dark:bg-slate-800/80 text-slate-400 dark:text-slate-500 flex items-center justify-center mb-1">
                <ShoppingCart className="w-8 h-8 stroke-[1.5]" />
              </div>

              {activeTab === 'approved' && (
                <>
                  <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-slate-100">
                    لا توجد مشتريات مكتملة حالياً.
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium">
                    سجل عملياتك فارغ.
                  </p>
                </>
              )}

              {activeTab === 'pending' && (
                <>
                  <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-slate-100">
                    لا توجد طلبات قيد التحقق حالياً.
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium">
                    سجل عملياتك فارغ.
                  </p>
                </>
              )}

              {activeTab === 'cancelled' && (
                <>
                  <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-slate-100">
                    لا توجد طلبات ملغية.
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium">
                    سجل عملياتك فارغ.
                  </p>
                </>
              )}
            </div>
          )}
        </div>
      </main>

      {/* ================= SUPPORT WIDGET INTEGRATION ================= */}
      <SupportWidget
        isOpen={isSupportOpen}
        onClose={() => setIsSupportOpen(false)}
        onToggle={() => setIsSupportOpen(!isSupportOpen)}
      />

      {/* ================= BOTTOM NAVIGATION BAR (Matching User Screenshots) ================= */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-950/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800/80 py-2.5 px-4">
        <div className="max-w-md mx-auto grid grid-cols-3 gap-2 text-center text-xs font-bold">
          {/* 1. الشبكات (Wifi) */}
          <button
            onClick={() => onNavigate('home')}
            className="flex flex-col items-center justify-center gap-1 text-slate-500 dark:text-slate-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors py-1 cursor-pointer"
          >
            <Wifi className="w-5 h-5" />
            <span>الشبكات</span>
          </button>

          {/* 2. مشترياتي (Active Purple Pill) */}
          <button
            onClick={() => onNavigate('purchases')}
            className="flex items-center justify-center gap-1.5 bg-purple-100 dark:bg-purple-900/40 border border-purple-300 dark:border-purple-500/50 text-purple-700 dark:text-purple-300 py-2 px-3 rounded-2xl cursor-pointer shadow-md"
          >
            <History className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0" />
            <span>مشترياتي</span>
          </button>

          {/* 3. المفضلة (Heart) */}
          <button
            onClick={() => setIsFavoritesOpen(true)}
            className="flex flex-col items-center justify-center gap-1 text-slate-500 dark:text-slate-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors py-1 cursor-pointer"
          >
            <Heart className="w-5 h-5" />
            <span>المفضلة</span>
          </button>
        </div>
      </nav>

      {/* ================= FAVORITES DRAWER / BOTTOM SHEET (Matching Screenshot 2) ================= */}
      {isFavoritesOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/75 backdrop-blur-xs p-0 sm:p-4 animate-in fade-in duration-200">
          <div
            className="fixed inset-0"
            onClick={() => setIsFavoritesOpen(false)}
          ></div>
          <div className="relative w-full max-w-lg bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-t-3xl sm:rounded-3xl p-6 space-y-6 text-right z-10 animate-in slide-in-from-bottom-5 duration-200 shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800/80 pb-4">
              <button
                onClick={() => setIsFavoritesOpen(false)}
                className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-900 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white flex items-center justify-center cursor-pointer transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-2.5">
                <div className="text-right">
                  <h3 className="text-base font-black text-slate-900 dark:text-white">شبكاتي المفضلة</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    اضغط على الشبكة للانتقال إليها مباشرة
                  </p>
                </div>
                <div className="w-10 h-10 rounded-2xl bg-pink-500/20 text-pink-500 flex items-center justify-center shrink-0">
                  <Heart className="w-5 h-5 fill-current" />
                </div>
              </div>
            </div>

            {/* Content / Favorite Networks list if user has bought cards, otherwise Empty State */}
            {favoriteNetworks.length > 0 ? (
              <div className="space-y-3 py-2 max-h-[60vh] overflow-y-auto no-scrollbar">
                {favoriteNetworks.map((net) => (
                  <div
                    key={net.id}
                    className="bg-slate-50 dark:bg-slate-900 border border-purple-200 dark:border-purple-800/60 p-4 rounded-2xl flex items-center justify-between gap-3 shadow-sm hover:border-purple-500 transition-all text-right"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-purple-600 to-indigo-700 text-white flex items-center justify-center shrink-0 font-bold shadow-md">
                        <Wifi className="w-5 h-5" />
                      </div>
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm sm:text-base font-black text-slate-900 dark:text-white">
                            {net.nameAr}
                          </h4>
                          <span className="bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                            <span>متصلة</span>
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-purple-500 shrink-0" />
                          <span>{net.location}</span>
                        </p>
                        {totalCardsPurchased > 0 && (
                          <div className="pt-0.5">
                            <span className="inline-block text-[11px] font-bold text-purple-700 dark:text-purple-300 bg-purple-100 dark:bg-purple-900/40 px-2.5 py-0.5 rounded-md">
                              تم شراء {totalCardsPurchased} {totalCardsPurchased === 1 ? 'كرت' : 'كروت'}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setIsFavoritesOpen(false);
                        onNavigate('home');
                      }}
                      className="px-3.5 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shrink-0 transition-colors shadow-md cursor-pointer active:scale-95"
                    >
                      <span>شراء كروت</span>
                      <ArrowLeft className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-10 text-center space-y-3 flex flex-col items-center">
                <div className="w-16 h-16 rounded-2xl bg-pink-100 dark:bg-pink-950/40 text-pink-500 border border-pink-200 dark:border-pink-500/20 flex items-center justify-center">
                  <Heart className="w-8 h-8 fill-pink-500" />
                </div>
                <h4 className="text-base font-black text-slate-900 dark:text-white">
                  لا توجد شبكات مفضلة بعد
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs leading-relaxed">
                  سيتم حفظ الشبكات هنا تلقائياً عند شرائك لكرت منها للوصول الفوري السريع
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PurchasesPage;
