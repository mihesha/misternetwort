import { useRouter } from 'next/navigation';
import React, { useState } from 'react';
import {
  Moon,
  Sun,
  Globe,
  Settings,
  ChevronDown,
  ArrowRight,
  ChevronLeft,
  Info,
  Send,
  Key,
  Shield,
  LogOut,
  Wallet,
  Building,
  Coins,
  Banknote,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

interface NewWithdrawalRequestViewProps {
  isDarkMode: boolean;
  ownerName?: string;
  networkName?: string;
  availableBalance?: number;
  onNavigateView?: (view: string) => void;
}

export const NewWithdrawalRequestView: React.FC<NewWithdrawalRequestViewProps> = ({
  isDarkMode,
  ownerName = 'هشام محمد الجايفي',
  networkName = 'برق نت',
  availableBalance = 0,
  onNavigateView,
}) => {
  const router = useRouter();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [provider, setProvider] = useState('');
  const [amount, setAmount] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!provider) {
      setError('يرجى اختيار المزود المالي للطلب');
      return;
    }
    const numAmount = parseFloat(amount);
    if (!numAmount || numAmount < 1000) {
      setError('الحد الأدنى لمبلغ السحب هو 1,000 ر.ي');
      return;
    }
    if (numAmount > availableBalance) {
      setError(`المبلغ يقتضي أن لا يتجاوز الرصيد المتاح (${availableBalance.toLocaleString()} ر.ي)`);
      return;
    }
    setError('');
    
    try {
      const token = typeof localStorage !== 'undefined' ? localStorage.getItem('auth_token') : null;
      const res = await fetch('/api/withdrawals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          networkName,
          amount: numAmount,
          provider,
          notes
        })
      });

      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || 'فشل تقديم طلب السحب');
      }
      router.push('/owner/withdrawals');
    } catch (err: any) {
      setError(err.message || 'فشل الاتصال بالخادم');
    }
  };

  return (
    <div
      dir="rtl"
      className={`min-h-screen transition-colors font-['Cairo',sans-serif] ${
        isDarkMode ? 'bg-[#0a0f18] text-slate-100' : 'bg-slate-100 text-slate-800'
      }`}
    >
      {/* Top Navbar */}
      

      {/* Main Content Area */}
      <main className="max-w-6xl mx-auto px-4 md:px-8 py-8 space-y-6">
        {/* Page Header */}
        <div>
          <button
            onClick={() => router.push('/owner/withdrawals')}
            className={`flex items-center gap-1.5 text-xs font-extrabold mb-2 transition-colors cursor-pointer ${
              isDarkMode ? 'text-slate-400 hover:text-slate-200' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <span>العودة لقائمة طلبات السحب</span>
            <ChevronLeft className="w-4 h-4" />
          </button>

          
          <h2 className={`text-lg font-bold mt-1 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
            طلب سحب جديد
          </h2>
        </div>

        {/* Network & Available Balance Card */}
        <div
          className={`rounded-2xl p-6 border transition-all flex flex-col md:flex-row items-center justify-between gap-4 ${
            isDarkMode
              ? 'bg-[#121926] border-slate-800'
              : 'bg-white border-slate-200 shadow-sm'
          }`}
        >
          {/* Right side: Network Name */}
          <div className="text-right w-full md:w-auto">
            <h3 className={`text-xl font-black ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>
              {networkName}
            </h3>
            <span className={`text-xs font-bold block mt-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              الشبكة
            </span>
          </div>

          {/* Left side: Balance */}
          <div className="text-left w-full md:w-auto flex flex-col md:items-end">
            <div className="text-2xl md:text-3xl font-black text-emerald-500 tracking-tight">
              {availableBalance.toLocaleString()} ر.ي
            </div>
            <span className={`text-xs font-bold mt-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              الرصيد المتاح للسحب
            </span>
          </div>
        </div>

        {/* Info Notice Banner */}
        <div
          className={`rounded-xl p-4 border flex items-center gap-3 text-xs md:text-sm font-medium ${
            isDarkMode
              ? 'bg-blue-950/40 border-blue-800/60 text-blue-200'
              : 'bg-blue-50 border-blue-200 text-blue-900'
          }`}
        >
          <Info className="w-5 h-5 text-blue-400 shrink-0" />
          <p>
            يُسمح بسحب يدوي <strong className="font-bold underline underline-offset-2">واحد فقط</strong> لكل شبكة يومياً. سيتم تنفيذ طلبك تلقائياً عبر مزود الخدمة بعد التقديم.
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-3.5 rounded-xl bg-red-500/20 border border-red-500/40 text-red-300 text-xs md:text-sm font-bold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form Container */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Field 1: Provider */}
          <div className="space-y-1.5">
            <label className={`block text-xs font-bold text-right ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
              المزود المالي <span className="text-red-500">*</span>
            </label>
            <select
              value={provider}
              onChange={(e) => setProvider(e.target.value)}
              className={`w-full rounded-xl py-3 px-4 text-xs font-bold text-right cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                isDarkMode
                  ? 'bg-[#182232] text-slate-200 border border-slate-700'
                  : 'bg-white text-slate-900 border border-slate-300 shadow-sm'
              }`}
            >
              <option value="">-- اختر المزود --</option>
              <option value="jaib">محفظة جيب</option>
              <option value="saba_cash">محفظة سبأ كاش</option>
              <option value="pace">محفظة بيس</option>
              <option value="one_cash">محفظة ون كاش</option>
              <option value="floosak">محفظة فلوسك</option>
              <option value="ezy">محفظة ايزي</option>
              <option value="cash">محفظة كاش</option>
              <option value="jawali">محفظة جوالي</option>
            </select>
          </div>

          {/* Field 2: Amount */}
          <div className="space-y-1.5">
            <label className={`block text-xs font-bold text-right ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
              مبلغ السحب <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="number"
                placeholder="أدخل مبلغ السحب"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className={`w-full rounded-xl py-3 px-4 text-xs font-bold text-right focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                  isDarkMode
                    ? 'bg-[#182232] text-slate-200 border border-slate-700 placeholder-slate-500'
                    : 'bg-white text-slate-900 border border-slate-300 shadow-sm placeholder-slate-400'
                }`}
              />
              <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                <span className="text-xs font-bold">ر.ي</span>
              </div>
            </div>
            <div className={`text-[11px] font-bold flex items-center justify-start gap-2 pt-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              <Coins className="w-3.5 h-3.5 text-amber-500" />
              <span>الحد الأدنى: 1,000 ر.ي</span>
              <span>|</span>
              <span>الحد الأقصى المتاح: {availableBalance.toLocaleString()} ر.ي</span>
            </div>
          </div>

          {/* Field 3: Notes (Optional) */}
          <div className="space-y-1.5">
            <label className={`block text-xs font-bold text-right ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
              ملاحظات (اختياري)
            </label>
            <textarea
              rows={4}
              placeholder="أضف ملاحظات إن وجدت..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className={`w-full rounded-xl py-3 px-4 text-xs font-bold text-right focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                isDarkMode
                  ? 'bg-[#182232] text-slate-200 border border-slate-700 placeholder-slate-500'
                  : 'bg-white text-slate-900 border border-slate-300 shadow-sm placeholder-slate-400'
              }`}
            />
          </div>

          {/* Buttons Row */}
          <div className="flex items-center gap-3 pt-3">
            <button
              type="submit"
              className="flex-1 py-3 px-6 rounded-xl bg-blue-500 hover:bg-blue-600 text-white font-black text-xs transition-all shadow-lg shadow-blue-500/30 cursor-pointer flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4 rotate-180" />
              <span>تقديم طلب السحب</span>
            </button>

            <button
              type="button"
              onClick={() => router.push('/owner/withdrawals')}
              className={`px-6 py-3 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                isDarkMode
                  ? 'bg-[#1b2535] hover:bg-[#233147] text-slate-300 border border-slate-700'
                  : 'bg-slate-200 hover:bg-slate-300 text-slate-700'
              }`}
            >
              إلغاء
            </button>
          </div>
        </form>
      </main>
    </div>
  );
};
