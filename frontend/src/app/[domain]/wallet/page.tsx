'use client';

import React, { useState, useEffect } from 'react';
import { 
  Wallet, 
  ArrowRight,
  CheckCircle2,
  Copy,
  Check,
  RefreshCw,
  Info,
  Hash
} from 'lucide-react';
import Button from '@/components/common/Button';
import Input from '@/components/common/Input';
import { YEMENI_WALLETS } from '@/data/public-content';
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
  
  const [recentTransactions, setRecentTransactions] = useState<any[]>([]);

  useEffect(() => {
    const savedUser = localStorage.getItem('cardbox_user');
    if (savedUser) {
      const parsedUser = JSON.parse(savedUser);
      setUser(parsedUser);
      fetchWalletData(parsedUser.token);
    } else {
      window.dispatchEvent(new CustomEvent('open_auth', { detail: 'login' }));
    }
  }, []);

  const fetchWalletData = async (token: string) => {
    try {
      const res = await fetch('/api/pos/wallet/balance', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setRecentTransactions(data.recent_transactions || []);
        
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
      const res = await fetch('/api/pos/wallet/recharge', {
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
        <div className="bg-gradient-to-br from-purple-900 to-indigo-950 p-6 sm:p-8 rounded-2xl shadow-xl relative overflow-hidden border border-purple-500/30">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-purple-500/10 rounded-full blur-xl -ml-5 -mb-5 pointer-events-none"></div>
          
          <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <p className="text-purple-200 text-sm font-bold mb-1">الرصيد الحالي المتوفر</p>
              <div className="flex items-baseline gap-2">
                <h2 className="text-4xl sm:text-5xl font-black text-white tracking-tight">
                  {(user.wallet_balance || 0).toFixed(2)}
                </h2>
                <span className="text-purple-300 font-bold">ر.ي</span>
              </div>
            </div>
            <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-sm border border-white/10 shadow-inner">
              <Wallet className="w-8 h-8 text-white/90" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Main Recharge Form */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-sm">
            <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base mb-4 flex items-center gap-2">
              <span className="w-2 h-6 bg-purple-600 rounded-full"></span>
              تغذية رصيد المحفظة
            </h3>

            {!selectedWallet ? (
              <div className="space-y-4">
                <p className="text-sm text-slate-500 dark:text-slate-400 font-semibold mb-2">
                  اختر المحفظة التي قمت بالإيداع إليها:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {YEMENI_WALLETS.map((wallet) => (
                    <button
                      key={wallet.id}
                      type="button"
                      onClick={() => setSelectedWallet(wallet)}
                      className={`w-full p-4 rounded-2xl border text-center transition-all duration-200 flex flex-col items-center justify-center gap-2 cursor-pointer active:scale-95 shadow-sm border-slate-200 dark:border-slate-800 hover:border-purple-400 dark:hover:border-purple-700 bg-slate-50 dark:bg-slate-900/50`}
                    >
                      <span className="block font-bold text-slate-900 dark:text-slate-100 text-sm">
                        {wallet.nameAr}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-6 animate-slide-up">
                
                {/* Selected Wallet Info */}
                <div className="p-5 bg-gradient-to-b from-purple-950/40 via-purple-950/30 to-slate-900/90 dark:from-purple-950/60 dark:to-slate-950/90 border-2 border-purple-500/50 dark:border-purple-500/60 rounded-3xl space-y-4 shadow-xl">
                  <div className="flex items-center justify-between border-b border-purple-500/30 dark:border-purple-800/80 pb-3">
                    <div className="flex items-center gap-2.5">
                      <span className="w-8 h-8 rounded-full bg-purple-600 text-white flex items-center justify-center font-black text-sm shrink-0 shadow-md">
                        ✓
                      </span>
                      <div>
                        <h4 className="font-extrabold text-slate-900 dark:text-slate-100 text-sm sm:text-base">
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
                      className="px-3.5 py-1.5 bg-slate-900/90 dark:bg-slate-900 hover:bg-slate-800 text-purple-400 dark:text-purple-300 border border-purple-500/40 text-xs font-bold rounded-xl transition-all cursor-pointer shadow-2xs active:scale-95"
                    >
                      تغيير المحفظة
                    </button>
                  </div>

                  <div className="flex items-center justify-between bg-slate-950/80 dark:bg-slate-950 p-3.5 rounded-2xl border border-purple-500/40 dark:border-purple-800/80 shadow-inner">
                    <span className="font-bold text-slate-200 dark:text-slate-300 text-xs sm:text-sm">
                      رقم حساب {selectedWallet.nameAr}:
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-black text-purple-300 text-lg sm:text-xl dir-ltr">
                        {selectedWallet.accountNumber}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleCopy(selectedWallet.accountNumber)}
                        className="p-1.5 text-purple-400 hover:bg-purple-900/50 rounded-lg transition-all cursor-pointer"
                        title="نسخ رقم الحساب"
                      >
                        {copiedPin === selectedWallet.accountNumber ? (
                          <Check className="w-4 h-4 text-emerald-400" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="pt-2 text-xs text-slate-400 dark:text-slate-400 space-y-1">
                    <p className="font-bold text-slate-100 dark:text-slate-200 flex items-center gap-1">
                      <Info className="w-3.5 h-3.5 text-purple-400" /> خطوات الإيداع:
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
                      label="رقم مرجع العملية"
                      placeholder="أدخل رقم العملية المولد من المحفظة (مثال: 9812401)"
                      value={transactionRef}
                      onChange={(e) => setTransactionRef(e.target.value)}
                      leadingIcon={<Hash className="w-4 h-4" />}
                      helperText="ستجد رقم مرجع العملية في الرسالة النصية أو إشعار التحويل المباشر"
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

        {/* Transaction History Sidebar */}
        <div className="lg:col-span-5">
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-5 shadow-sm h-full">
            <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2 h-6 bg-slate-300 dark:bg-slate-700 rounded-full"></span>
                سجل العمليات الأخير
              </div>
              <button 
                onClick={() => user?.token && fetchWalletData(user.token)}
                className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </h3>

            {recentTransactions.length === 0 ? (
              <div className="py-12 flex flex-col items-center justify-center text-slate-400 space-y-3">
                <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800/50 rounded-full flex items-center justify-center">
                  <Wallet className="w-8 h-8 opacity-20" />
                </div>
                <p className="text-sm font-semibold">لا يوجد عمليات سابقة</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentTransactions.map((tx, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/80">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white shadow-sm ${
                        tx.status === 'approved' ? 'bg-emerald-500' : 
                        tx.status === 'rejected' ? 'bg-red-500' : 'bg-amber-500'
                      }`}>
                        {tx.status === 'approved' ? '+' : tx.status === 'rejected' ? '×' : '⋯'}
                      </div>
                      <div>
                        <p className="font-bold text-slate-800 dark:text-slate-200 text-sm">
                          {tx.bank_name.startsWith('إيداع') ? tx.bank_name : `إيداع عبر ${tx.bank_name}`}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{tx.date}</p>
                      </div>
                    </div>
                    <div className="text-left">
                      <span className={`font-black block text-sm sm:text-base ${
                        tx.status === 'approved' ? 'text-emerald-600 dark:text-emerald-400' : 
                        tx.status === 'rejected' ? 'text-red-600 dark:text-red-400' : 'text-amber-600 dark:text-amber-400'
                      }`}>
                        {tx.amount} ر.ي
                      </span>
                      <span className="text-[10px] font-bold text-slate-400">
                        {tx.status === 'approved' ? 'ناجح' : tx.status === 'rejected' ? 'مرفوض' : 'قيد المراجعة'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
