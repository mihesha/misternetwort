"use client";
import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Globe, Plus, Wifi, Wallet, TrendingUp, Layers, ArrowUpRight, 
  CheckCircle2, Clock, Copy, Check, ExternalLink, ShieldCheck, 
  MapPin, Phone, CreditCard, ChevronLeft, Sparkles, AlertCircle
} from 'lucide-react';
import { useOwnerContext, OwnerNetworkCard } from '../../../context/OwnerContext';
import { useAppContext } from '../../../context/AppContext';
import { useOwnerActions } from '../../../hooks/useOwnerActions';
import { AddNetworkModal } from '../../../components/owner/AddNetworkModal';

export default function OwnerNetworksPage() {
  const router = useRouter();
  const { isDarkMode } = useAppContext();
  const { 
    ownerName, 
    networks, 
    setActiveNetworkId, 
    activeNetworkId, 
    isDataLoaded,
    showAddNetworkModal,
    setShowAddNetworkModal,
    globalUpdateTick
  } = useOwnerContext();
  const { fetchOwnerNetworks } = useOwnerActions();

  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [pendingApplications, setPendingApplications] = useState<any[]>([]);

  const fetchPendingApps = async () => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('owner_auth_token') : null;
      if (!token) return;
      const res = await fetch('/api/owner/pending-applications', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setPendingApplications(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error('Failed to fetch pending applications', err);
    }
  };

  useEffect(() => {
    fetchOwnerNetworks();
    fetchPendingApps();
  }, [globalUpdateTick]);

  const handleCopyCode = (code: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(code);
      setCopiedCode(code);
      setTimeout(() => setCopiedCode(null), 2000);
    }
  };

  const handleSelectNetwork = (network: OwnerNetworkCard, targetPath: string = '/owner') => {
    setActiveNetworkId(network.id);
    router.push(targetPath);
  };

  // Overall totals across all networks
  const totals = useMemo(() => {
    let totalBal = 0;
    let totalSales = 0;
    let totalCards = 0;

    networks.forEach((n) => {
      totalBal += Number(n.balance || 0);
      totalSales += Number(n.total_sales || 0);
      if (Array.isArray(n.categories)) {
        n.categories.forEach((c) => {
          totalCards += Number(c.remaining || 0);
        });
      }
    });

    return {
      networksCount: networks.length,
      totalBalance: totalBal,
      totalSales: totalSales,
      totalCards: totalCards,
    };
  }, [networks]);

  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-16">
      
      {/* 1. Header Banner */}
      <div className={`relative overflow-hidden rounded-3xl p-6 md:p-8 ${
        isDarkMode 
          ? 'bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-blue-900/40 border border-white/5' 
          : 'bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-800 text-white'
      } shadow-2xl shadow-blue-900/20`}>
        <div className="absolute top-0 right-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute -top-20 -right-20 w-80 h-80 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-blue-400/20 rounded-full blur-3xl"></div>
        </div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-white/15 backdrop-blur-md border border-white/20">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>إدارة الشبكات المتعددة</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              شبكاتي ({totals.networksCount})
            </h1>
            <p className="text-xs sm:text-sm text-blue-100 max-w-xl leading-relaxed">
              مرحباً <span className="font-bold underline decoration-blue-300">{ownerName}</span>، اختر الشبكة التي ترغب بإدارتها للدخول إلى لوحتها المالية والتشغيلية المنفصلة بالكامل.
            </p>
          </div>

          <button
            onClick={() => setShowAddNetworkModal(true)}
            className="self-start md:self-center px-5 py-3.5 rounded-2xl bg-white hover:bg-blue-50 text-blue-900 font-black text-xs sm:text-sm shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95 transition-all flex items-center gap-2 cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4 sm:w-5 sm:h-5 text-blue-700" />
            <span>إضافة شبكة جديدة</span>
          </button>
        </div>
      </div>

      {/* 2. Cumulative Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-5">
        <div className={`p-4 sm:p-5 rounded-2xl border transition-all ${
          isDarkMode ? 'bg-[#121926] border-white/5 shadow-black/40' : 'bg-white border-slate-200/80 shadow-slate-200/50'
        } shadow-lg`}>
          <div className="flex items-center justify-between mb-3">
            <span className={`text-xs font-bold ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>الشبكات المسجلة</span>
            <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
              <Globe className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black">{totals.networksCount}</div>
          <div className="text-[10px] sm:text-xs text-slate-400 mt-1">شبكة مفعلة في حسابك</div>
        </div>

        <div className={`p-4 sm:p-5 rounded-2xl border transition-all ${
          isDarkMode ? 'bg-[#121926] border-white/5 shadow-black/40' : 'bg-white border-slate-200/80 shadow-slate-200/50'
        } shadow-lg`}>
          <div className="flex items-center justify-between mb-3">
            <span className={`text-xs font-bold ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>إجمالي الأرصدة المتاحة</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-emerald-500">
            {totals.totalBalance.toLocaleString()} <span className="text-xs font-bold">ر.ي</span>
          </div>
          <div className="text-[10px] sm:text-xs text-slate-400 mt-1">مجموع كل أرصدة شبكاتك</div>
        </div>

        <div className={`p-4 sm:p-5 rounded-2xl border transition-all ${
          isDarkMode ? 'bg-[#121926] border-white/5 shadow-black/40' : 'bg-white border-slate-200/80 shadow-slate-200/50'
        } shadow-lg`}>
          <div className="flex items-center justify-between mb-3">
            <span className={`text-xs font-bold ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>إجمالي المبيعات</span>
            <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-purple-500">
            {totals.totalSales.toLocaleString()} <span className="text-xs font-bold">ر.ي</span>
          </div>
          <div className="text-[10px] sm:text-xs text-slate-400 mt-1">إجمالي مبيعات كل الشبكات</div>
        </div>

        <div className={`p-4 sm:p-5 rounded-2xl border transition-all ${
          isDarkMode ? 'bg-[#121926] border-white/5 shadow-black/40' : 'bg-white border-slate-200/80 shadow-slate-200/50'
        } shadow-lg`}>
          <div className="flex items-center justify-between mb-3">
            <span className={`text-xs font-bold ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>المخزون المتوفر</span>
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-amber-500">
            {totals.totalCards.toLocaleString()} <span className="text-xs font-bold">كرت</span>
          </div>
          <div className="text-[10px] sm:text-xs text-slate-400 mt-1">إجمالي كروت الشبكات المتوفرة</div>
        </div>
      </div>

      {/* Pending Applications Section */}
      {pendingApplications.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black flex items-center gap-2 text-amber-500">
              <Clock className="w-4 h-4" />
              <span>طلبات إضافة شبكات قيد المراجعة لدى الإدارة ({pendingApplications.length})</span>
            </h3>
            <span className="text-xs text-slate-400">سيتم تفعيلها وإضافتها تلقائياً فور موافقة الإدارة</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {pendingApplications.map((app: any) => (
              <div
                key={app.id}
                className={`p-4 rounded-3xl border flex items-center justify-between gap-4 transition-all ${
                  isDarkMode 
                    ? 'bg-amber-500/5 border-amber-500/20 text-slate-200 shadow-lg shadow-black/20' 
                    : 'bg-amber-50/70 border-amber-200 text-slate-800 shadow-sm'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-11 h-11 rounded-2xl bg-amber-500/20 text-amber-500 flex items-center justify-center shrink-0">
                    <Wifi className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="font-black text-sm truncate">{app.network_name}</div>
                    <div className="text-[11px] text-slate-400 font-mono flex items-center gap-2 mt-0.5">
                      <span>مرجع: #{app.reference_number}</span>
                      <span>•</span>
                      <span>{app.governorate} {app.city ? `- ${app.city}` : ''}</span>
                    </div>
                  </div>
                </div>

                <div className="shrink-0 flex flex-col items-end gap-1">
                  <span className="px-2.5 py-1 rounded-xl text-[11px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>
                    <span>بانتظار موافقة الإدارة</span>
                  </span>
                  <span className="text-[10px] text-slate-400">{new Date(app.created_at).toLocaleDateString('ar-YE')}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. Networks List / Cards */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base sm:text-lg font-black flex items-center gap-2">
            <span>قائمة الشبكات</span>
            <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${
              isDarkMode ? 'bg-white/10 text-slate-300' : 'bg-slate-200 text-slate-700'
            }`}>
              {networks.length}
            </span>
          </h2>
          <span className="text-xs text-slate-400">انقر على أي شبكة للتحكم بها فوراً</span>
        </div>

        {networks.length === 0 ? (
          <div className={`p-12 sm:p-16 rounded-3xl border text-center transition-all flex flex-col items-center justify-center ${
            isDarkMode ? 'bg-[#121926] border-white/5 text-slate-300' : 'bg-white border-slate-200 text-slate-700'
          } shadow-xl`}>
            <div className="w-16 h-16 rounded-3xl bg-blue-500/10 text-blue-500 flex items-center justify-center mb-4 ring-4 ring-blue-500/5">
              <Wifi className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-black mb-2">لا توجد شبكات مضافة بعد</h3>
            <p className="text-xs sm:text-sm text-slate-400 max-w-md mb-6">
              يمكنك الآن إضافة أول شبكة في حسابك لبدء إدارة الكروت ونقاط البيع واستلام الأرباح.
            </p>
            <button
              onClick={() => setShowAddNetworkModal(true)}
              className="px-6 py-3 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-black text-xs sm:text-sm shadow-xl shadow-blue-600/30 transition-all flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>إضافة شبكتك الأولى</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {networks.map((net) => {
              const isCurrent = activeNetworkId === net.id.toString();
              const totalCardsInNet = net.categories ? net.categories.reduce((acc, c) => acc + (c.remaining || 0), 0) : 0;
              const hasLowStock = net.categories ? net.categories.some(c => (c.remaining || 0) < (c.min_threshold ?? 5)) : false;

              return (
                <div
                  key={net.id}
                  onClick={() => handleSelectNetwork(net)}
                  className={`group relative rounded-3xl p-5 sm:p-6 border transition-all duration-300 cursor-pointer flex flex-col justify-between hover:scale-[1.015] active:scale-[0.99] ${
                    isCurrent
                      ? isDarkMode
                        ? 'bg-gradient-to-br from-[#131f37] to-[#0f172a] border-blue-500/60 shadow-xl shadow-blue-500/10 ring-2 ring-blue-500/30'
                        : 'bg-gradient-to-br from-blue-50/50 to-white border-blue-400 shadow-xl shadow-blue-900/10 ring-2 ring-blue-500/20'
                      : isDarkMode
                      ? 'bg-[#121926] border-white/5 hover:border-white/20 shadow-lg shadow-black/40'
                      : 'bg-white border-slate-200/80 hover:border-blue-300 shadow-md shadow-slate-200/50'
                  }`}
                >
                  <div>
                    {/* Top Row: Network Name + Status + Code */}
                    <div className="flex items-start justify-between gap-3 mb-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 ${
                          isCurrent
                            ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                            : isDarkMode
                            ? 'bg-white/10 text-blue-400'
                            : 'bg-blue-50 text-blue-600'
                        }`}>
                          <Wifi className="w-6 h-6" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-base sm:text-lg font-black tracking-tight group-hover:text-blue-500 transition-colors">
                              {net.name}
                            </h3>
                            {isCurrent && (
                              <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-blue-500 text-white shadow-xs">
                                الحالية
                              </span>
                            )}
                          </div>
                          {net.english_name && (
                            <div className="text-xs font-mono text-slate-400 truncate max-w-[180px]" dir="ltr">
                              {net.english_name}
                            </div>
                          )}
                        </div>
                      </div>

                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-bold ${
                        net.status === 'active'
                          ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                          : 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${net.status === 'active' ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
                        {net.status === 'active' ? 'نشطة' : 'معلقة'}
                      </span>
                    </div>

                    {/* Network Code Pill */}
                    <div className="mb-4 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-400">كود الشبكة:</span>
                        <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl font-mono text-xs font-bold border ${
                          isDarkMode ? 'bg-white/5 border-white/10 text-slate-200' : 'bg-slate-100 border-slate-200 text-slate-800'
                        }`}>
                          <span>{net.code}</span>
                          <button
                            type="button"
                            onClick={(e) => handleCopyCode(net.code, e)}
                            className="p-0.5 hover:text-blue-500 transition-colors cursor-pointer"
                            title="نسخ كود الشبكة"
                          >
                            {copiedCode === net.code ? (
                              <Check className="w-3.5 h-3.5 text-emerald-500" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </div>

                      {net.governorate && (
                        <div className="flex items-center gap-1 text-[11px] text-slate-400">
                          <MapPin className="w-3 h-3 text-slate-400" />
                          <span>{net.governorate} {net.city ? ` - ${net.city}` : ''}</span>
                        </div>
                      )}
                    </div>

                    {/* Isolated Financials Grid */}
                    <div className={`grid grid-cols-2 gap-3 p-3.5 rounded-2xl mb-4 border ${
                      isDarkMode ? 'bg-white/5 border-white/5' : 'bg-slate-50 border-slate-100'
                    }`}>
                      <div>
                        <div className="text-[11px] font-bold text-slate-400 mb-1 flex items-center gap-1">
                          <Wallet className="w-3 h-3 text-emerald-500" />
                          <span>الرصيد المتاح:</span>
                        </div>
                        <div className="text-base sm:text-lg font-black text-emerald-500">
                          {(net.balance || 0).toLocaleString()} <span className="text-[10px] font-bold">ر.ي</span>
                        </div>
                      </div>

                      <div>
                        <div className="text-[11px] font-bold text-slate-400 mb-1 flex items-center gap-1">
                          <TrendingUp className="w-3 h-3 text-blue-500" />
                          <span>إجمالي المبيعات:</span>
                        </div>
                        <div className="text-base sm:text-lg font-black text-blue-500">
                          {(net.total_sales || 0).toLocaleString()} <span className="text-[10px] font-bold">ر.ي</span>
                        </div>
                      </div>
                    </div>

                    {/* Inventory & Categories */}
                    <div className="flex items-center justify-between text-xs mb-5 px-1">
                      <div className="flex items-center gap-1.5 text-slate-400">
                        <Layers className="w-3.5 h-3.5" />
                        <span>الفئات: <strong className={isDarkMode ? 'text-slate-200' : 'text-slate-700'}>{net.categories?.length || 0}</strong></span>
                      </div>

                      <div className="flex items-center gap-1.5 text-slate-400">
                        <span>المخزون: <strong className={isDarkMode ? 'text-slate-200' : 'text-slate-700'}>{totalCardsInNet.toLocaleString()}</strong> كرت</span>
                        {hasLowStock && (
                          <span className="w-2 h-2 rounded-full bg-amber-500" title="يوجد فئات منخفضة المخزون"></span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-white/5">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelectNetwork(net, '/owner');
                      }}
                      className="w-full py-3 px-4 rounded-xl font-black text-xs bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-600/20 flex items-center justify-center gap-2 transition-all cursor-pointer group/btn"
                    >
                      <span>الدخول للوحة التحكم</span>
                      <ChevronLeft className="w-4 h-4 transition-transform group-hover/btn:-translate-x-1" />
                    </button>

                    <div className="grid grid-cols-3 gap-1.5 pt-1">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelectNetwork(net, '/owner/statement');
                        }}
                        className={`py-1.5 px-2 rounded-lg text-[11px] font-bold border transition-colors cursor-pointer text-center truncate ${
                          isDarkMode ? 'border-white/5 hover:bg-white/5 text-slate-300' : 'border-slate-200 hover:bg-slate-100 text-slate-700'
                        }`}
                      >
                        كشف الحساب
                      </button>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelectNetwork(net, '/owner/cards');
                        }}
                        className={`py-1.5 px-2 rounded-lg text-[11px] font-bold border transition-colors cursor-pointer text-center truncate ${
                          isDarkMode ? 'border-white/5 hover:bg-white/5 text-slate-300' : 'border-slate-200 hover:bg-slate-100 text-slate-700'
                        }`}
                      >
                        الكروت
                      </button>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelectNetwork(net, '/owner/pos');
                        }}
                        className={`py-1.5 px-2 rounded-lg text-[11px] font-bold border transition-colors cursor-pointer text-center truncate ${
                          isDarkMode ? 'border-white/5 hover:bg-white/5 text-slate-300' : 'border-slate-200 hover:bg-slate-100 text-slate-700'
                        }`}
                      >
                        نقاط البيع
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add Network Modal */}
      <AddNetworkModal
        isOpen={showAddNetworkModal}
        onClose={() => setShowAddNetworkModal(false)}
        isDarkMode={isDarkMode}
      />
    </div>
  );
}
