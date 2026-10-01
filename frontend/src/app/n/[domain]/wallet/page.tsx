'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Wallet,
  ArrowRight,
  CheckCircle2,
  Copy,
  Check,
  RefreshCw,
  Info,
  Hash,
  ArrowDownRight,
  ArrowUpRight,
  ShoppingCart,
  X
} from 'lucide-react';
import Button from '@/components/common/Button';
import Input from '@/components/common/Input';
import { UserAccount, WalletOption } from '@/types';
import { useRouter } from 'next/navigation';

export default function WalletPage({ params }: { params: Promise<{ domain: string }> }) {
  const router = useRouter();

  const [user, setUser] = useState<UserAccount | null>(null);
  const [selectedWallet, setSelectedWallet] = useState<WalletOption | null>(null);
  const [transactionRef, setTransactionRef] = useState('');

  const [copiedPin, setCopiedPin] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [isRechargeMode, setIsRechargeMode] = useState(false);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [filter, setFilter] = useState<'all' | 'deposit' | 'purchase'>('all');
  const [selectedTransaction, setSelectedTransaction] = useState<any | null>(null);

  const [wallets, setWallets] = useState<WalletOption[]>([]);
  const [isWalletsLoading, setIsWalletsLoading] = useState(true);

  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [isFetchingTxs, setIsFetchingTxs] = useState(false);

  useEffect(() => {
    const fetchWallets = async () => {
      try {
        const res = await fetch('/api/bank-wallets');
        if (res.ok) {
          const data = await res.json();
          const mappedWallets: WalletOption[] = data.map((w: any) => ({
            id: w.id.toString(),
            name: w.name,
            nameAr: w.name,
            category: 'wallet',
            icon: w.logo_url || 'wallet',
            bgColor: 'bg-emerald-500/10 dark:bg-emerald-500/20',
            textColor: 'text-emerald-600 dark:text-emerald-400',
            borderColor: 'border-emerald-500/30',
            accountNumber: w.pos_number || '',
            accountName: w.pos_name || '',
            steps: w.steps || [],
            inputLabel: w.input_label || 'الرقم المرجعي',
          }));
          setWallets(mappedWallets);
        }
      } catch (err) {
        console.error('Failed to fetch bank wallets', err);
      } finally {
        setIsWalletsLoading(false);
      }
    };
    fetchWallets();
  }, []);

  const observer = useRef<IntersectionObserver | null>(null);
  const lastTransactionElementRef = useCallback((node: HTMLDivElement | null) => {
    if (isFetchingTxs) return;
    if (observer.current) observer.current.disconnect();
    
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        setCurrentPage(prevPage => prevPage + 1);
      }
    });
    
    if (node) observer.current.observe(node);
  }, [isFetchingTxs, hasMore]);

  useEffect(() => {
    if (user?.token && currentPage > 1) {
      fetchWalletData(user.token, currentPage, true);
    }
  }, [currentPage]);

  useEffect(() => {
    const savedUser = localStorage.getItem('cardbox_user');
    if (savedUser) {
      const parsedUser = JSON.parse(savedUser);
      setUser(parsedUser);
      fetchWalletData(parsedUser.token, 1, false);
    } else {
      window.dispatchEvent(new CustomEvent('open_auth', { detail: 'login' }));
    }
  }, []);

  const fetchWalletData = async (token: string, page = 1, append = false) => {
    try {
      setIsFetchingTxs(true);
      const res = await fetch(`/api/customer/wallet/transactions?page=${page}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        
        if (append) {
          setTransactions(prev => [...prev, ...(data.transactions || [])]);
        } else {
          setTransactions(data.transactions || []);
        }
        
        setCurrentPage(data.current_page || 1);
        setHasMore(data.has_more || false);

        // Update user balance globally
        const savedUser = localStorage.getItem('cardbox_user');
        if (savedUser) {
          const parsed = JSON.parse(savedUser);
          parsed.wallet_balance = data.balance;
          localStorage.setItem('cardbox_user', JSON.stringify(parsed));
          setUser(parsed);
          window.dispatchEvent(new CustomEvent('cardbox_user_updated'));
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsFetchingTxs(false);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedPin(text);
    setTimeout(() => setCopiedPin(null), 2000);
  };

  const handleRecharge = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedWallet) return;
    if (!transactionRef || transactionRef.length < 4) {
      setError('يرجى إدخال رقم مرجع العملية بشكل صحيح');
      return;
    }

    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const res = await fetch('/api/customer/wallet/recharge', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.token}`
        },
        body: JSON.stringify({
          reference_number: transactionRef,
          bank_name: selectedWallet.id
        })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'حدث خطأ أثناء معالجة الطلب');
      }

      setSuccess(data.message || 'تم شحن رصيدك بنجاح!');
      setTransactionRef('');
      setSelectedWallet(null);
      if (user?.token) fetchWalletData(user.token);

    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredTransactions = transactions.filter(tx => {
    if (filter === 'all') return true;
    return tx.type === filter;
  });

  // Group by date
  const groupedTransactions = filteredTransactions.reduce((acc, tx) => {
    const dateObj = new Date(tx.date);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    let dateKey = dateObj.toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' });
    
    if (dateObj.toDateString() === today.toDateString()) {
      dateKey = 'اليوم';
    } else if (dateObj.toDateString() === yesterday.toDateString()) {
      dateKey = 'الأمس';
    }

    if (!acc[dateKey]) acc[dateKey] = [];
    acc[dateKey].push(tx);
    return acc;
  }, {} as Record<string, any[]>);

  if (!user) {
    return (
      <div className="py-20 text-center animate-pulse">
        <p className="text-slate-500 font-bold">جاري تحميل بيانات المحفظة...</p>
      </div>
    );
  }

  return (
    <div dir="rtl" className="space-y-6 max-w-4xl mx-auto pb-12 animate-fadeIn text-right">

      {/* Page Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={() => router.back()}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-xl transition-all border border-slate-200/60 dark:border-slate-700 active:scale-95"
          >
            <ArrowRight className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
            <span>رجوع</span>
          </button>
          <span className="font-extrabold text-sm sm:text-base text-slate-800 dark:text-slate-200 flex items-center gap-2">
            <Wallet className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            <span>محفظتي الإلكترونية</span>
          </span>
        </div>

        {/* Balance Display */}
        <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 dark:from-slate-800 dark:to-slate-900 p-6 sm:p-8 rounded-2xl shadow-xl relative overflow-hidden border border-indigo-400/30 dark:border-slate-700/50">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 dark:bg-white/5 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-indigo-400/20 dark:bg-slate-700/20 rounded-full blur-xl -ml-5 -mb-5 pointer-events-none"></div>

          <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div>
              <p className="text-indigo-100 dark:text-slate-300 text-sm font-bold mb-1">الرصيد الحالي المتوفر</p>
              <div className="flex items-baseline gap-2">
                <h2 className="text-4xl sm:text-5xl font-black text-white tracking-tight">
                  {(user.wallet_balance || 0).toFixed(2)}
                </h2>
                <span className="text-indigo-200 dark:text-slate-400 font-bold">ر.ي</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
              {!isRechargeMode && (
                <button
                  type="button"
                  onClick={() => setIsRechargeMode(true)}
                  className="w-full sm:w-auto px-6 py-3 bg-white hover:bg-slate-50 text-indigo-900 dark:text-slate-900 font-black rounded-2xl shadow-lg border-none flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer"
                >
                  <span className="text-xl leading-none">+</span>
                  تغذية الرصيد
                </button>
              )}
              <div className="w-14 h-14 bg-white/20 dark:bg-white/10 rounded-2xl hidden sm:flex items-center justify-center backdrop-blur-sm border border-white/20 dark:border-white/10 shadow-inner">
                <Wallet className="w-7 h-7 text-white" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Main Recharge Form */}
        {isRechargeMode && (
          <div className="lg:col-span-12 space-y-6 animate-fadeIn">
            <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base flex items-center gap-2">
                  <span className="w-2 h-6 bg-purple-600 rounded-full"></span>
                  تغذية رصيد المحفظة
                </h3>
                <button
                  type="button"
                  onClick={() => {
                    setIsRechargeMode(false);
                    setSelectedWallet(null);
                  }}
                  className="text-xs font-bold text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors cursor-pointer"
                >
                  إلغاء ×
                </button>
              </div>

              {!selectedWallet ? (
                <div className="space-y-4">
                  <p className="text-sm text-slate-500 dark:text-slate-400 font-semibold mb-2">
                    اختر المحفظة التي تريد الإيداع من خلالها:
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
                    {isWalletsLoading ? (
                      <div className="col-span-full flex justify-center p-6">
                        <div className="animate-spin rounded-full h-8 w-8 border-4 border-purple-500 border-t-transparent"></div>
                      </div>
                    ) : (
                      wallets.map((wallet) => (
                        <button
                          key={wallet.id}
                          type="button"
                          onClick={() => setSelectedWallet(wallet)}
                          className="relative p-3 sm:p-4 rounded-3xl border-2 text-center transition-all duration-300 flex flex-col items-center justify-center gap-2 sm:gap-3 cursor-pointer active:scale-[0.98] group border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/60 hover:border-purple-300 dark:hover:border-purple-700/60 hover:bg-white dark:hover:bg-slate-800 hover:shadow-md"
                        >
                          <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center overflow-hidden text-xs sm:text-sm font-bold shadow-inner transition-transform group-hover:-translate-y-1 ${wallet.bgColor} ${wallet.textColor}`}>
                            {wallet.icon && wallet.icon.startsWith('http') ? (
                              <img src={wallet.icon} alt={wallet.nameAr} className="w-full h-full object-cover" />
                            ) : (
                              <Wallet className="w-5 h-5 sm:w-6 sm:h-6" />
                            )}
                          </div>
                          <span className="text-[13px] sm:text-base font-black text-slate-700 dark:text-slate-300">
                            {wallet.nameAr}
                          </span>
                        </button>
                      ))
                    )}
                  </div>
                </div>
              ) : (
                <div className="space-y-6 animate-slide-up grid grid-cols-1 md:grid-cols-2 gap-6">

                  {/* Selected Wallet Info */}
                  <div className="p-5 bg-purple-50 dark:bg-slate-800/40 border-2 border-purple-200 dark:border-slate-700/50 rounded-3xl space-y-4 shadow-sm h-fit">
                    <div className="flex items-center justify-between border-b border-purple-200 dark:border-slate-700 pb-3">
                      <div className="flex items-center gap-2.5">
                        <span className="w-8 h-8 rounded-full bg-purple-600 text-white flex items-center justify-center font-black text-sm shrink-0 shadow-md">
                          ✓
                        </span>
                        <div>
                          <h4 className="font-extrabold text-purple-950 dark:text-slate-100 text-sm sm:text-base">
                            {selectedWallet.nameAr}
                          </h4>
                          <span className="text-[11px] sm:text-xs text-purple-600 dark:text-purple-400 font-bold">
                            تم اختيار طريقة الدفع
                          </span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setSelectedWallet(null)}
                        className="px-3.5 py-1.5 bg-white dark:bg-slate-900 hover:bg-slate-50 text-purple-600 dark:text-purple-300 border border-purple-200 dark:border-purple-500/40 text-xs font-bold rounded-xl transition-all cursor-pointer shadow-sm active:scale-95"
                      >
                        تغيير
                      </button>
                    </div>

                    <div className="flex items-center justify-between bg-white dark:bg-slate-950 p-3.5 rounded-2xl border border-purple-100 dark:border-purple-800/80 shadow-sm">
                      <span className="font-bold text-slate-700 dark:text-slate-300 text-xs sm:text-sm">
                        رقم نقطة الدفع:
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-black text-purple-700 dark:text-purple-300 text-lg sm:text-xl dir-ltr">
                          {selectedWallet.accountNumber}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleCopy(selectedWallet.accountNumber)}
                          className="p-1.5 text-purple-500 hover:bg-purple-100 dark:hover:bg-purple-900/50 rounded-lg transition-all cursor-pointer"
                          title="نسخ رقم الحساب"
                        >
                          {copiedPin === selectedWallet.accountNumber ? (
                            <Check className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs sm:text-sm text-slate-600 dark:text-slate-400 px-2 font-medium pb-1 border-b border-purple-100 dark:border-slate-800/50">
                      <span>اسم نقطة الدفع:</span>
                      <span className="font-extrabold text-slate-800 dark:text-slate-200 text-sm sm:text-base">
                        {selectedWallet.accountName}
                      </span>
                    </div>

                    <div className="pt-2 text-xs text-slate-600 dark:text-slate-400 space-y-1">
                      <p className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                        <Info className="w-3.5 h-3.5 text-purple-500 dark:text-purple-400" /> خطوات الإيداع:
                      </p>
                      <ul className="list-disc list-inside space-y-1 pr-2">
                        {selectedWallet.steps.map((step, idx) => (
                          <li key={idx}>{step}</li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Form Input */}
                  <div className="p-5 bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-4">
                    <h4 className="font-bold text-slate-900 dark:text-slate-100 text-xs sm:text-sm border-b border-slate-200 dark:border-slate-800 pb-2">
                      بيانات عملية التحويل
                    </h4>
                    <form onSubmit={handleRecharge} className="space-y-4">
                      <Input
                        label={selectedWallet?.inputLabel || "الرقم المرجعي"}
                        placeholder={`أدخل ${selectedWallet?.inputLabel || "الرقم المرجعي"}`}
                        value={transactionRef}
                        onChange={(e) => setTransactionRef(e.target.value)}
                        leadingIcon={<Hash className="w-4 h-4" />}
                        helperText={`قم بلصق ${selectedWallet?.inputLabel || "الرقم المرجعي"} الذي نسخته بعد إتمام التحويل هنا`}
                        className="text-sm font-bold placeholder:text-sm placeholder:font-normal"
                        required
                      />

                      {error && (
                        <p className="text-xs sm:text-sm font-bold text-red-500 bg-red-50 dark:bg-red-950/50 p-4 rounded-xl border border-red-200 dark:border-red-800">
                          {error}
                        </p>
                      )}
                      {success && (
                        <p className="text-xs sm:text-sm font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/50 p-4 rounded-xl border border-emerald-200 dark:border-emerald-800 flex items-center gap-2">
                          <CheckCircle2 className="w-5 h-5" />
                          <span>{success}</span>
                        </p>
                      )}

                      <Button
                        type="submit"
                        variant="primary"
                        disabled={isLoading}
                        className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-4 rounded-2xl text-base shadow-lg shadow-purple-600/30 cursor-pointer"
                      >
                        {isLoading ? (
                          <span className="flex items-center gap-2 justify-center">
                            <RefreshCw className="w-5 h-5 animate-spin" />
                            جاري المطابقة...
                          </span>
                        ) : (
                          'تأكيد وشحن المحفظة'
                        )}
                      </Button>
                    </form>
                  </div>

                </div>
              )}
            </div>
          </div>
        )}

        {/* Transaction History Section */}
        <div className="lg:col-span-12">
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-5 shadow-sm min-h-[400px]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4 border-b border-slate-100 dark:border-slate-800/80 pb-4">
              <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base flex items-center gap-2">
                <span className="w-2 h-6 bg-indigo-500 rounded-full"></span>
                السجل المالي
              </h3>

              <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800/60 p-1 rounded-xl">
                <button
                  onClick={() => setFilter('all')}
                  className={`px-4 py-1.5 text-xs sm:text-sm font-bold rounded-lg transition-all cursor-pointer ${filter === 'all' ? 'bg-white dark:bg-slate-700 shadow-sm text-slate-900 dark:text-slate-100' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'}`}
                >
                  الكل
                </button>
                <button
                  onClick={() => setFilter('deposit')}
                  className={`px-4 py-1.5 text-xs sm:text-sm font-bold rounded-lg transition-all cursor-pointer ${filter === 'deposit' ? 'bg-white dark:bg-slate-700 shadow-sm text-emerald-600 dark:text-emerald-400' : 'text-slate-500 dark:text-slate-400 hover:text-emerald-600'}`}
                >
                  إيداعات
                </button>
                <button
                  onClick={() => setFilter('purchase')}
                  className={`px-4 py-1.5 text-xs sm:text-sm font-bold rounded-lg transition-all cursor-pointer ${filter === 'purchase' ? 'bg-white dark:bg-slate-700 shadow-sm text-slate-900 dark:text-slate-100' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'}`}
                >
                  مشتريات
                </button>
              </div>
            </div>

            {Object.keys(groupedTransactions).length === 0 ? (
              <div className="py-20 flex flex-col items-center justify-center text-slate-400 space-y-4">
                <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800/50 rounded-full flex items-center justify-center">
                  <Wallet className="w-10 h-10 opacity-20" />
                </div>
                <p className="text-base font-semibold">لا يوجد عمليات لعرضها</p>
              </div>
            ) : (
              <div className="space-y-8">
                {Object.entries(groupedTransactions).map(([dateLabel, groupTxs]: [string, any], groupIndex, groupArray) => (
                  <div key={dateLabel} className="space-y-3">
                    <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 px-2 flex items-center gap-2">
                      <span className="w-1 h-1 bg-slate-300 dark:bg-slate-600 rounded-full"></span>
                      {dateLabel}
                    </h4>
                    
                    <div className="space-y-2.5">
                      {(groupTxs as any[]).map((tx: any, txIndex) => {
                        const isLastElement = groupIndex === groupArray.length - 1 && txIndex === groupTxs.length - 1;
                        return (
                        <div 
                          key={tx.id} 
                          ref={isLastElement ? lastTransactionElementRef : null}
                          onClick={() => setSelectedTransaction(tx)}
                          className="flex items-center justify-between p-3.5 rounded-2xl bg-white dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50 hover:border-indigo-200 dark:hover:border-slate-600 hover:shadow-md transition-all cursor-pointer group"
                        >
                          <div className="flex items-center gap-4">
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-white shadow-sm shrink-0 transition-transform group-hover:scale-110 ${
                              tx.type === 'deposit' 
                                ? (tx.status === 'approved' || tx.status === 'used' ? 'bg-emerald-500 dark:bg-emerald-600' : tx.status === 'rejected' ? 'bg-red-500 dark:bg-red-600' : 'bg-amber-500 dark:bg-amber-600')
                                : 'bg-slate-800 dark:bg-slate-600'
                            }`}>
                              {tx.type === 'deposit' ? <ArrowDownRight className="w-5 h-5" /> : <ShoppingCart className="w-5 h-5" />}
                            </div>
                            <div>
                              <p className="font-black text-slate-800 dark:text-slate-200 text-sm sm:text-base">
                                {tx.title}
                              </p>
                              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-0.5">
                                {tx.subtitle}
                              </p>
                            </div>
                          </div>
                          
                          <div className="text-left flex flex-col items-end">
                            <span className={`font-black tracking-tight text-base sm:text-lg ${
                              tx.type === 'deposit' 
                                ? 'text-emerald-600 dark:text-emerald-400' 
                                : 'text-slate-800 dark:text-slate-200'
                            }`}>
                              {tx.type === 'deposit' ? '+' : '-'} {tx.amount} <span className="text-xs">ر.ي</span>
                            </span>
                            {tx.type === 'deposit' && (
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full mt-1 ${
                                tx.status === 'approved' || tx.status === 'used' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' :
                                tx.status === 'rejected' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                                'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                              }`}>
                                {tx.status === 'approved' || tx.status === 'used' ? 'مكتمل' : tx.status === 'rejected' ? 'مرفوض' : 'قيد المراجعة'}
                              </span>
                            )}
                          </div>
                        </div>
                        );
                      })}
                    </div>
                  </div>
                ))}

                {isFetchingTxs && currentPage > 1 && (
                  <div className="flex justify-center pt-4 pb-2 animate-fadeIn">
                    <div className="flex items-center gap-2 px-5 py-2.5 bg-indigo-50 dark:bg-slate-800 rounded-full border border-indigo-100 dark:border-slate-700 shadow-sm">
                      <RefreshCw className="w-4 h-4 text-indigo-500 animate-spin" />
                      <span className="text-sm font-bold text-indigo-700 dark:text-indigo-300">جاري تحميل المزيد...</span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Transaction Details Modal */}
      {selectedTransaction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-0">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setSelectedTransaction(null)}></div>
          <div className="relative w-full sm:w-[450px] bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-slide-up">
            
            {/* Modal Header */}
            <div className={`p-6 text-center relative ${
              selectedTransaction.type === 'deposit' 
                ? 'bg-emerald-50 dark:bg-slate-800/50' 
                : 'bg-slate-50 dark:bg-slate-800/50'
            }`}>
              <button 
                onClick={() => setSelectedTransaction(null)}
                className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center bg-white/50 dark:bg-slate-700/50 hover:bg-white dark:hover:bg-slate-600 rounded-full transition-colors text-slate-500 dark:text-slate-300 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
              
              <div className={`w-16 h-16 mx-auto rounded-2xl flex items-center justify-center text-white shadow-lg mb-4 ${
                selectedTransaction.type === 'deposit' ? 'bg-emerald-500 dark:bg-emerald-600' : 'bg-slate-800 dark:bg-slate-600'
              }`}>
                {selectedTransaction.type === 'deposit' ? <ArrowDownRight className="w-8 h-8" /> : <ShoppingCart className="w-8 h-8" />}
              </div>
              
              <h2 className="text-xl font-black text-slate-900 dark:text-white mb-1">
                {selectedTransaction.type === 'deposit' ? 'إيداع رصيد' : 'شراء كروت'}
              </h2>
              <div className={`text-3xl font-black tracking-tighter ${
                selectedTransaction.type === 'deposit' ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-800 dark:text-slate-200'
              }`}>
                {selectedTransaction.amount} <span className="text-lg">ر.ي</span>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4">
              <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4 space-y-3">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-500 dark:text-slate-400 font-bold">الحالة</span>
                  <span className={`font-black ${
                    selectedTransaction.type === 'deposit' 
                      ? (selectedTransaction.status === 'approved' || selectedTransaction.status === 'used' ? 'text-emerald-600' : selectedTransaction.status === 'rejected' ? 'text-red-600' : 'text-amber-600')
                      : 'text-emerald-600'
                  }`}>
                    {selectedTransaction.type === 'deposit' 
                      ? (selectedTransaction.status === 'approved' || selectedTransaction.status === 'used' ? 'مكتمل' : selectedTransaction.status === 'rejected' ? 'مرفوض' : 'قيد المراجعة')
                      : 'مكتمل'}
                  </span>
                </div>
                
                <div className="flex justify-between items-center text-sm border-t border-slate-200 dark:border-slate-700 pt-3">
                  <span className="text-slate-500 dark:text-slate-400 font-bold">التاريخ والوقت</span>
                  <span className="text-slate-800 dark:text-slate-200 font-bold dir-ltr">
                    {new Date(selectedTransaction.date).toLocaleString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit'})}
                  </span>
                </div>

                {selectedTransaction.wallet_source && (
                  <div className="flex justify-between items-center text-sm border-t border-slate-200 dark:border-slate-700 pt-3">
                    <span className="text-slate-500 dark:text-slate-400 font-bold">وسيلة الدفع</span>
                    <span className="text-slate-800 dark:text-slate-200 font-bold">
                      {selectedTransaction.wallet_source}
                    </span>
                  </div>
                )}

                <div className="flex justify-between items-center text-sm border-t border-slate-200 dark:border-slate-700 pt-3">
                  <span className="text-slate-500 dark:text-slate-400 font-bold">الرقم المرجعي</span>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-800 dark:text-slate-200 font-mono font-bold">
                      {selectedTransaction.subtitle}
                    </span>
                    {selectedTransaction.subtitle !== 'لا يوجد مرجع' && (
                      <button 
                        onClick={() => handleCopy(selectedTransaction.subtitle)}
                        className="text-indigo-500 dark:text-indigo-400 hover:text-indigo-600 dark:hover:text-indigo-300 transition-colors cursor-pointer"
                      >
                        {copiedPin === selectedTransaction.subtitle ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Purchase Details Breakdown */}
              {selectedTransaction.type === 'purchase' && selectedTransaction.details && (
                <div className="space-y-2 mt-4">
                  <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200 px-1">{selectedTransaction.details.length > 1 ? 'تفاصيل الكروت:' : 'تفاصيل الكرت:'}</h4>
                  <div className="max-h-40 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                    {selectedTransaction.details.map((item: any, idx: number) => (
                      <div key={idx} className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-200/60 dark:border-slate-700 flex items-center justify-between text-sm">
                        <span className="font-bold text-slate-800 dark:text-slate-200 whitespace-nowrap">
                          {item.network} - {item.price} ر.ي
                        </span>
                        
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="font-mono font-black text-slate-700 dark:text-slate-300 tracking-wider">
                            {item.pin}
                          </span>
                          <button 
                            onClick={() => handleCopy(item.pin)}
                            className="p-1.5 text-indigo-500 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
                            title="نسخ رقم الكرت"
                          >
                            {copiedPin === item.pin ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-center">
              <button 
                onClick={() => setSelectedTransaction(null)}
                className="w-full py-3 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold rounded-xl transition-colors cursor-pointer"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
