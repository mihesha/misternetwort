"use client";
import React, { useEffect, useMemo, useState } from 'react';
import { useOwnerContext } from '../../context/OwnerContext';
import { useAppContext } from '../../context/AppContext';
import { useOwnerActions } from '../../hooks/useOwnerActions';
import { 
  Wallet, AlertTriangle, FileText, CreditCard, Activity, 
  Wifi, TrendingUp, Download, Settings, BarChart3, Clock, 
  ShoppingCart, ArrowUpRight, ArrowDownRight, CheckCircle2, 
  XCircle, Loader2
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend
} from 'recharts';


const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];

export default function OwnerDashboardPage() {
  const { isDarkMode } = useAppContext();
  const { ownerName, networks, globalUpdateTick } = useOwnerContext();
  const { fetchOwnerNetworks } = useOwnerActions();
  const router = useRouter();

  const [mounted, setMounted] = useState(false);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loadingTx, setLoadingTx] = useState(true);


  const network = networks[0];

  useEffect(() => {
    setMounted(true);
    fetchOwnerNetworks();
  }, []);

  const fetchTransactions = async () => {
    if (!network?.id) return;
    setLoadingTx(true);
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
      const res = await fetch(`/api/networks/${network.id}/transactions`, {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      if (res.ok) {
        const data = await res.json();
        setTransactions(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingTx(false);
    }
  };

  // Fetch transactions when network changes or global update occurs
  useEffect(() => {
    fetchTransactions();
  }, [network?.id, globalUpdateTick]);

  // Compute metrics from network context
  const stats = useMemo(() => {
    if (!network) return null;
    
    let totalCards = 0;
    let lowStock = 0;
    
    network.categories.forEach(c => {
      totalCards += c.remaining;
      if (c.remaining < 5) lowStock++;
    });

    const maxCards = Math.max(...network.categories.map(c => c.remaining), 10);

    return { 
      balance: Number(network.balance) || 0, 
      totalSales: Number(network.total_sales) || 0, // Real total sales from backend
      totalCards, 
      lowStock,
      totalCategories: network.categories.length,
      maxCards
    };
  }, [network]);

  // Dynamic Chart Data (Last 7 Days Sales)
  const salesChartData = useMemo(() => {
    const data = [];
    const today = new Date();
    // Using Arabic locale for days (e.g. الأحد, الإثنين)
    const formatter = new Intl.DateTimeFormat('ar-EG', { weekday: 'long' });
    
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      
      // The API returns date as Y-m-d (e.g. 2026-08-13)
      const dateString = d.toISOString().split('T')[0]; 
      const dayName = formatter.format(d);
      
      let dailySales = 0;
      transactions.forEach(tx => {
        if (tx.type === 'sale' && tx.date === dateString) {
          dailySales += Number(tx.amount || 0);
        }
      });
      
      data.push({ name: dayName, sales: dailySales });
    }
    return data;
  }, [transactions]);

  // Dynamic Pie Chart Data (Categories in Stock)
  const categoriesChartData = useMemo(() => {
    if (!network) return [];
    const data = network.categories
      .map(cat => ({ name: `فئة ${cat.value}`, value: cat.remaining }))
      .filter(c => c.value > 0); // Only show available ones
      
    // If all are 0, return a dummy to prevent chart crash, or handle empty state visually
    return data.length > 0 ? data : [{ name: 'لا يوجد مخزون', value: 1 }];
  }, [network]);

  // Pending withdrawals count
  const pendingRequestsCount = useMemo(() => {
    return transactions.filter(tx => tx.type === 'withdrawal' && tx.status === 'pending').length;
  }, [transactions]);

  if (!mounted || !network || !stats) {
    return (
      <div className={`flex flex-col items-center justify-center min-h-[60vh] animate-in fade-in ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="font-bold">جاري تحميل لوحة القيادة...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-10">
      
      {/* 1. Welcome Banner */}
      <div className={`relative overflow-hidden rounded-[2.5rem] p-6 md:p-10 ${isDarkMode ? 'bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-blue-900/40 border border-white/5' : 'bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-800'} shadow-2xl shadow-blue-900/20`}>
        <div className="absolute top-0 right-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-blue-400/20 rounded-full blur-3xl"></div>
        </div>
        
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <span className={`px-3 py-1 rounded-full text-xs font-black tracking-wider ${network.status === 'active' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30' : 'bg-slate-500 text-white'}`}>
                {network.status === 'active' ? 'شبكة نشطة' : 'شبكة متوقفة'}
              </span>
              <span className="text-white/70 text-sm font-bold flex items-center gap-1.5 bg-black/20 px-3 py-1 rounded-full border border-white/5">
                <Wifi className="w-4 h-4" /> كود: <span className="font-mono">{network.code}</span>
              </span>
            </div>
            <h1 className="text-3xl md:text-4xl font-black mb-3 text-white tracking-tight">
              مرحباً، {ownerName} 👋
            </h1>
            <p className="text-blue-100 text-sm md:text-base max-w-2xl leading-relaxed opacity-90">
              مرحباً بك في مركز قيادة شبكة <strong className="text-white bg-white/10 px-2 py-0.5 rounded-md">"{network.name}"</strong>. البيانات أدناه تعكس حالة مبيعاتك وأرصدتك الحقيقية في النظام لحظة بلحظة.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => {
                localStorage.setItem('ownerActiveNetworkId', network.id.toString());
                router.push('/owner/import-cards');
              }}
              className="flex items-center gap-2 px-6 py-3.5 rounded-2xl font-bold text-sm bg-white text-blue-700 hover:bg-slate-50 transition-all shadow-xl shadow-black/10 active:scale-95"
            >
              <Download className="w-5 h-5" />
              <span>إضافة كروت</span>
            </button>
            <button
              onClick={() => router.push('/owner/new-withdrawal')}
              className="flex items-center gap-2 px-6 py-3.5 rounded-2xl font-bold text-sm bg-white/10 hover:bg-white/20 text-white backdrop-blur-md border border-white/20 transition-all shadow-xl active:scale-95"
            >
              <TrendingUp className="w-5 h-5" />
              <span>طلب سحب</span>
            </button>

          </div>
        </div>
      </div>


      {/* Alerts Banners */}
      {(() => {
        if (network.notif_out_of_stock === false) return null;
        const outOfStockCats = network.categories.filter(c => c.remaining === 0 || c.remaining === undefined || c.remaining === null);
        if (outOfStockCats.length === 0) return null;
        return (
          <div className={`rounded-2xl p-5 border transition-colors ${isDarkMode ? 'bg-rose-950/90 border-rose-600/60 text-rose-200' : 'bg-rose-50 border-rose-300 text-rose-900'}`}>
            <div className="flex items-start gap-3 text-right">
              <AlertTriangle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
              <div className="space-y-2 flex-1">
                <h3 className="font-bold text-sm md:text-base text-rose-600 dark:text-rose-400">تنبيه: نفاذ المخزون</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2 text-xs font-semibold">
                  {outOfStockCats.map((cat, idx) => (
                    <div key={idx} className="p-2 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-between gap-4">
                      <span className="truncate">فئة "{cat.value} ر.ي" - نفذت بالكامل!</span>
                      <Link href={`/owner/import-cards?category=${cat.id}`} className="text-rose-600 dark:text-rose-400 underline font-bold cursor-pointer shrink-0">أضف كروت</Link>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {(() => {
        if (network.notif_low_stock === false) return null;
        const lowStockCats = network.categories.filter(c => c.remaining > 0 && c.remaining <= (c.min_threshold ?? 10));
        if (lowStockCats.length === 0) return null;
        return (
          <div className={`rounded-2xl p-5 border transition-colors ${isDarkMode ? 'bg-[#2a1700]/90 border-amber-600/60 text-amber-200' : 'bg-amber-50 border-amber-300 text-amber-900'}`}>
            <div className="flex items-start gap-3 text-right">
              <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
              <div className="space-y-2 flex-1">
                <h3 className="font-bold text-sm md:text-base text-amber-600 dark:text-amber-500">تنبيه: مخزون منخفض</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2 text-xs font-semibold">
                  {lowStockCats.map((cat, idx) => (
                    <div key={idx} className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-between gap-4">
                      <span className="truncate">فئة "{cat.value} ر.ي" - باقي {cat.remaining} كرت فقط</span>
                      <Link href={`/owner/import-cards?category=${cat.id}`} className="text-amber-600 dark:text-amber-500 underline font-bold cursor-pointer shrink-0">أضف كروت</Link>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* 2. KPIs (Real Data) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        
        {/* KPI: Current Balance */}
        <div className={`p-6 rounded-3xl transition-all duration-300 hover:-translate-y-1.5 ${isDarkMode ? 'bg-[#121a28] border border-white/5 shadow-xl shadow-black/40' : 'bg-white border border-slate-100 shadow-xl shadow-slate-200/40'}`}>
          <div className="flex justify-between items-start mb-4">
            <div className={`p-3.5 rounded-2xl ${isDarkMode ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-50 text-blue-600'}`}>
              <Wallet className="w-6 h-6" />
            </div>
            <span className={`flex items-center gap-1 text-xs font-bold ${isDarkMode ? 'text-blue-400' : 'text-blue-600'} bg-blue-500/10 px-2 py-1 rounded-lg`}>
              جاهز للسحب
            </span>
          </div>
          <div>
            <h3 className={`text-sm font-bold mb-2 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>الرصيد المتاح</h3>
            <div className={`text-3xl font-black tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
              {stats.balance.toLocaleString('en-US')} <span className="text-base font-bold text-slate-500">ر.ي</span>
            </div>
          </div>
        </div>

        {/* KPI: Total Sales */}
        <div className={`p-6 rounded-3xl transition-all duration-300 hover:-translate-y-1.5 ${isDarkMode ? 'bg-[#121a28] border border-white/5 shadow-xl shadow-black/40' : 'bg-white border border-slate-100 shadow-xl shadow-slate-200/40'}`}>
          <div className="flex justify-between items-start mb-4">
            <div className={`p-3.5 rounded-2xl ${isDarkMode ? 'bg-emerald-500/20 text-emerald-400' : 'bg-emerald-50 text-emerald-600'}`}>
              <TrendingUp className="w-6 h-6" />
            </div>
          </div>
          <div>
            <h3 className={`text-sm font-bold mb-2 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>إجمالي المبيعات (تراكمي)</h3>
            <div className={`text-3xl font-black tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
              {stats.totalSales.toLocaleString('en-US')} <span className="text-base font-bold text-slate-500">ر.ي</span>
            </div>
          </div>
        </div>

        {/* KPI: Total Inventory */}
        <div className={`p-6 rounded-3xl transition-all duration-300 hover:-translate-y-1.5 ${isDarkMode ? 'bg-[#121a28] border border-white/5 shadow-xl shadow-black/40' : 'bg-white border border-slate-100 shadow-xl shadow-slate-200/40'}`}>
          <div className="flex justify-between items-start mb-4">
            <div className={`p-3.5 rounded-2xl ${isDarkMode ? 'bg-purple-500/20 text-purple-400' : 'bg-purple-50 text-purple-600'}`}>
              <ShoppingCart className="w-6 h-6" />
            </div>
            <span className={`text-xs font-bold ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
              عبر {stats.totalCategories} فئات
            </span>
          </div>
          <div>
            <h3 className={`text-sm font-bold mb-2 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>مخزون الكروت المتوفر</h3>
            <div className={`text-3xl font-black tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
              {stats.totalCards.toLocaleString('en-US')} <span className="text-base font-bold text-slate-500">كرت</span>
            </div>
          </div>
        </div>

        {/* KPI: Pending Requests */}
        <div className={`p-6 rounded-3xl transition-all duration-300 hover:-translate-y-1.5 ${isDarkMode ? 'bg-[#121a28] border border-white/5 shadow-xl shadow-black/40' : 'bg-white border border-slate-100 shadow-xl shadow-slate-200/40'}`}>
          <div className="flex justify-between items-start mb-4">
            <div className={`p-3.5 rounded-2xl ${pendingRequestsCount > 0 ? (isDarkMode ? 'bg-amber-500/20 text-amber-400' : 'bg-amber-50 text-amber-600') : (isDarkMode ? 'bg-slate-800 text-slate-400' : 'bg-slate-100 text-slate-500')}`}>
              <Clock className="w-6 h-6" />
            </div>
            {pendingRequestsCount > 0 && (
              <span className={`flex items-center gap-1 text-xs font-bold text-amber-500 bg-amber-500/10 px-2 py-1 rounded-lg animate-pulse`}>
                قيد المعالجة
              </span>
            )}
          </div>
          <div>
            <h3 className={`text-sm font-bold mb-2 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>طلبات السحب المعلقة</h3>
            <div className={`text-3xl font-black tracking-tight ${pendingRequestsCount > 0 ? 'text-amber-500' : (isDarkMode ? 'text-white' : 'text-slate-900')}`}>
              {pendingRequestsCount.toLocaleString('en-US')} <span className="text-base font-bold text-slate-500">طلبات سحب</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Charts Section */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 md:gap-8">
        
        {/* Line Chart: Actual Sales History (7 Days) */}
        <div className={`xl:col-span-2 rounded-3xl p-6 md:p-8 flex flex-col ${isDarkMode ? 'bg-[#121a28] border border-white/5 shadow-xl shadow-black/40' : 'bg-white border border-slate-100 shadow-xl shadow-slate-200/40'}`}>
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className={`text-xl font-black flex items-center gap-2 mb-1 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                <Activity className="w-6 h-6 text-blue-500" /> حركة المبيعات
              </h2>
              <p className={`text-sm font-bold ${isDarkMode ? 'text-slate-500' : 'text-slate-500'}`}>
                إحصائيات المبيعات الحقيقية خلال آخر 7 أيام
              </p>
            </div>
          </div>
          
          {loadingTx ? (
            <div className="w-full h-[300px] flex items-center justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            </div>
          ) : (
            <div className="w-full h-[300px]" dir="ltr">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={salesChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDarkMode ? '#334155' : '#e2e8f0'} />
                  <XAxis dataKey="name" stroke={isDarkMode ? '#94a3b8' : '#64748b'} tick={{ fill: isDarkMode ? '#94a3b8' : '#64748b', fontSize: 12, fontWeight: 'bold' }} tickLine={false} axisLine={false} />
                  <YAxis stroke={isDarkMode ? '#94a3b8' : '#64748b'} tick={{ fill: isDarkMode ? '#94a3b8' : '#64748b', fontSize: 12, fontWeight: 'bold' }} tickLine={false} axisLine={false} tickFormatter={(value) => `${value / 1000}k`} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: isDarkMode ? '#1e293b' : '#ffffff', borderColor: isDarkMode ? '#334155' : '#e2e8f0', borderRadius: '12px', fontWeight: 'bold', color: isDarkMode ? '#fff' : '#000', direction: 'rtl' }}
                    itemStyle={{ fontWeight: 'bold' }}
                  />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', fontWeight: 'bold', paddingTop: '20px' }} />
                  <Line type="monotone" name="المبيعات اليومية (ر.ي)" dataKey="sales" stroke="#3b82f6" strokeWidth={4} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 8, strokeWidth: 0 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Pie Chart: Inventory Distribution */}
        <div className={`rounded-3xl p-6 md:p-8 flex flex-col ${isDarkMode ? 'bg-[#121a28] border border-white/5 shadow-xl shadow-black/40' : 'bg-white border border-slate-100 shadow-xl shadow-slate-200/40'}`}>
          <div className="mb-4">
            <h2 className={`text-xl font-black flex items-center gap-2 mb-1 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
              <BarChart3 className="w-6 h-6 text-indigo-500" /> توزيع المخزون
            </h2>
            <p className={`text-sm font-bold ${isDarkMode ? 'text-slate-500' : 'text-slate-500'}`}>
              نسبة الكروت المتوفرة لكل فئة
            </p>
          </div>
          <div className="w-full h-[250px] min-h-[250px] relative" dir="ltr">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoriesChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                  cornerRadius={10}
                >
                  {categoriesChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.name === 'لا يوجد مخزون' ? '#94a3b8' : COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: isDarkMode ? '#1e293b' : '#ffffff', borderColor: isDarkMode ? '#334155' : '#e2e8f0', borderRadius: '12px', fontWeight: 'bold', color: isDarkMode ? '#fff' : '#000', direction: 'rtl' }}
                  itemStyle={{ fontWeight: 'bold' }}
                />
              </PieChart>
            </ResponsiveContainer>
            {/* Center Text */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className={`text-2xl font-black ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{network.categories.length}</span>
              <span className={`text-xs font-bold ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>إجمالي الفئات</span>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-3 mt-4" dir="rtl">
            {categoriesChartData.slice(0, 4).map((cat, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: cat.name === 'لا يوجد مخزون' ? '#94a3b8' : COLORS[idx % COLORS.length] }}></div>
                <span className={`text-[11px] font-bold truncate ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`} title={cat.name}>{cat.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 4. Bottom Section: Actual Transactions Table & Inventory Status */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 md:gap-8">
        
        {/* Real Transactions Table */}
        <div className={`xl:col-span-2 rounded-3xl p-6 md:p-8 flex flex-col ${isDarkMode ? 'bg-[#121a28] border border-white/5 shadow-xl shadow-black/40' : 'bg-white border border-slate-100 shadow-xl shadow-slate-200/40'}`}>
          <div className="flex items-center justify-between mb-6">
            <h2 className={`text-xl font-black flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
              <FileText className="w-6 h-6 text-blue-500" /> أحدث العمليات (مباشر)
            </h2>
            <Link href="/owner/withdrawals" className={`text-sm font-bold text-blue-500 hover:text-blue-600 transition-colors hover:underline`}>
              إدارة طلبات السحب
            </Link>
          </div>
          
          <div className="flex-1 overflow-x-auto custom-scrollbar">
            {loadingTx ? (
              <div className="flex flex-col items-center justify-center h-full min-h-[200px]">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500 mb-2" />
                <span className={`text-sm font-bold ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>جاري تحميل العمليات...</span>
              </div>
            ) : transactions.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full min-h-[200px] opacity-60">
                <FileText className="w-12 h-12 mb-3 text-slate-400" />
                <span className="font-bold">لا توجد عمليات مسجلة حتى الآن</span>
              </div>
            ) : (
              <table className="w-full text-right border-collapse min-w-[600px]">
                <thead>
                  <tr className={`border-b ${isDarkMode ? 'border-white/5 text-slate-400' : 'border-slate-100 text-slate-500'}`}>
                    <th className="pb-4 font-bold text-sm px-4">رقم العملية</th>
                    <th className="pb-4 font-bold text-sm px-4">النوع</th>
                    <th className="pb-4 font-bold text-sm px-4">التفاصيل</th>
                    <th className="pb-4 font-bold text-sm px-4">المبلغ</th>
                    <th className="pb-4 font-bold text-sm px-4">الوقت</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.slice(0, 6).map((trx, idx) => (
                    <tr key={trx.id || idx} className={`border-b last:border-0 transition-colors ${isDarkMode ? 'border-white/5 hover:bg-white/5' : 'border-slate-50 hover:bg-slate-50'}`}>
                      <td className="py-4 px-4 font-mono text-xs font-bold text-slate-500">{trx.reference || trx.id}</td>
                      <td className={`py-4 px-4 font-bold text-sm ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>{trx.typeLabel || trx.type}</td>
                      <td className={`py-4 px-4 text-xs font-bold ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>{trx.description || '-'}</td>
                      <td className={`py-4 px-4 font-black text-sm ${trx.type === 'withdrawal' || trx.type === 'commission' ? 'text-amber-500' : 'text-emerald-500'}`}>
                        <div>
                          {trx.type === 'withdrawal' || trx.type === 'commission' ? '-' : '+'}
                          {Number(trx.amount).toLocaleString()} <span className="text-[10px]">ر.ي</span>
                        </div>
                        {(trx.creditAmount ?? 0) > 0 && (
                          <div className="text-[10px] text-amber-500 mt-0.5 font-bold">
                            آجل: {Number(trx.creditAmount).toLocaleString()}
                          </div>
                        )}
                        {(trx.cashAmount ?? 0) > 0 && (trx.creditAmount ?? 0) > 0 && (
                          <div className="text-[10px] text-emerald-500 font-bold">
                            نقدي: {Number(trx.cashAmount).toLocaleString()}
                          </div>
                        )}
                      </td>
                      <td className={`py-4 px-4 text-xs font-bold ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`} dir="ltr">
                        {trx.date} {trx.time}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Real Inventory Status Bars */}
        <div className={`rounded-3xl p-6 md:p-8 flex flex-col ${isDarkMode ? 'bg-[#121a28] border border-white/5 shadow-xl shadow-black/40' : 'bg-white border border-slate-100 shadow-xl shadow-slate-200/40'}`}>
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className={`text-xl font-black flex items-center gap-2 mb-1 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                <AlertTriangle className="w-6 h-6 text-amber-500" /> تنبيهات المخزون
              </h2>
              <p className={`text-sm font-bold ${isDarkMode ? 'text-slate-500' : 'text-slate-500'}`}>
                مستوى الكروت المتوفرة حالياً
              </p>
            </div>
          </div>

          <div className="flex-1 space-y-6 flex flex-col justify-center">
            {network.categories.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 opacity-50">
                <BarChart3 className="w-16 h-16 mb-4 text-slate-400" />
                <p className="font-bold">لا توجد فئات مسجلة</p>
              </div>
            ) : (
              network.categories.map((cat, idx) => {
                const percentage = Math.min(100, Math.max(0, (cat.remaining / stats.maxCards) * 100));
                const isLow = cat.remaining < 5;
                
                return (
                  <div key={idx} className="group relative">
                    <div className="flex items-end justify-between mb-2.5">
                      <div className="flex items-center gap-3">
                        <span className={`px-2.5 py-1 rounded-lg text-xs font-black font-mono shadow-sm ${isDarkMode ? 'bg-slate-800/80 text-slate-300 border border-white/5' : 'bg-slate-50 text-slate-700 border border-slate-200'}`}>
                          {cat.value}
                        </span>
                        {isLow && (
                          <span className="text-[10px] font-bold text-amber-500 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-md">منخفض</span>
                        )}
                      </div>
                      <span className={`text-sm font-black ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                        {cat.remaining} كرت
                      </span>
                    </div>
                    <div className={`w-full h-3 rounded-full overflow-hidden ${isDarkMode ? 'bg-slate-800/50' : 'bg-slate-100'}`}>
                      <div 
                        className={`h-full rounded-full transition-all duration-1000 ease-out relative ${
                          isLow 
                            ? 'bg-gradient-to-r from-amber-500 to-red-500' 
                            : 'bg-gradient-to-r from-blue-500 to-indigo-500'
                        }`}
                        style={{ width: `${percentage}%` }}
                      >
                        <div className="absolute inset-0 bg-white/20 w-full h-full animate-[shimmer_2s_infinite] rounded-full" />
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
          
          <div className="mt-8 grid grid-cols-2 gap-3 pt-6 border-t border-dashed border-slate-200 dark:border-white/10">
            <button
              onClick={() => {
                localStorage.setItem('ownerActiveNetworkId', network.id.toString());
                router.push('/owner/details');
              }}
              className={`flex items-center justify-center gap-1.5 py-3 rounded-xl font-bold text-[11px] transition-all ${isDarkMode ? 'bg-white/5 hover:bg-white/10 text-slate-300' : 'bg-slate-50 hover:bg-slate-100 text-slate-700'}`}
            >
              <Settings className="w-3.5 h-3.5" />
              <span>إدارة الفئات</span>
            </button>
            <button
              onClick={() => {
                localStorage.setItem('ownerActiveNetworkId', network.id.toString());
                router.push('/owner/import-cards');
              }}
              className={`flex items-center justify-center gap-1.5 py-3 rounded-xl font-bold text-[11px] transition-all ${isDarkMode ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-900/20' : 'bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-200'}`}
            >
              <Download className="w-3.5 h-3.5" />
              <span>شحن كروت</span>
            </button>
          </div>
        </div>

      </div>


    </div>
  );
}
