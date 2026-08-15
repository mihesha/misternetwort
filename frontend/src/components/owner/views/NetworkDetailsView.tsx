import { useRouter } from 'next/navigation';
import React, { useState } from 'react';
import Link from 'next/link';
import {

  Moon,
  Sun,
  Globe,
  Settings,
  ChevronDown,
  ArrowRight,
  AlertTriangle,
  FileText,
  CreditCard,
  PlusCircle,
  Download,
  Upload,
  RefreshCw,
  Search,
  CheckCircle2,
  Sliders,
  DollarSign,
  TrendingUp,
  Package,
  Layers,
  ArrowUpRight,
  ShieldCheck,
  Key,
  Shield,
  LogOut,
  User,
  Wallet,
  X,
  Trash2,
} from 'lucide-react';

interface NetworkDetailsViewProps {
  isDarkMode: boolean;
  ownerName?: string;
  networkName?: string;
  networkCode?: string;
  networkPhone?: string;
  onNavigateView?: (view: string) => void;
  networkId?: string | number;
  globalUpdateTick?: number;
}

export const NetworkDetailsView: React.FC<NetworkDetailsViewProps> = ({
  isDarkMode,
  ownerName = 'هشام محمد الجايفي',
  networkName = 'برق نت',
  networkCode = '22744',
  networkPhone = '777310606',
  onNavigateView,
  networkId,
  globalUpdateTick = 0,
}) => {
  const router = useRouter();
  const [jaibConfirmed, setJaibConfirmed] = useState(false);
  const [salesFilter, setSalesFilter] = useState('1day');
  const [cardStatusFilter, setCardStatusFilter] = useState('all');
  const [cardSearchQuery, setCardSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showMikrotikModal, setShowMikrotikModal] = useState(false);
  const [batchToDelete, setBatchToDelete] = useState<number | null>(null);
  const [cardToDelete, setCardToDelete] = useState<number | null>(null);

  // Real Data States
  const [networkData, setNetworkData] = useState<any>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [cards, setCards] = useState<any[]>([]);
  const [cardBatches, setCardBatches] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);

  React.useEffect(() => {
    const fetchNetworkData = async () => {
      try {
        const token = typeof localStorage !== 'undefined' ? localStorage.getItem('auth_token') : null;
        const res = await fetch('/api/networks', {
          headers: token ? { 'Authorization': `Bearer ${token}` } : {}
        });
        if (res.ok) {
          const data = await res.json();
          const found = data.find((n: any) => n.network_code === networkCode || n.name === networkName);
          if (found) {
            setNetworkData(found);
            setCategories(found.card_categories || []);

            try {
              const cardsRes = await fetch(`/api/admin/networks/${found.id}/cards`, {
                headers: token ? { 'Authorization': `Bearer ${token}` } : {}
              });
              if (cardsRes.ok) {
                const cardsData = await cardsRes.json();
                setCards(cardsData);
              }
              
              const batchesRes = await fetch(`/api/admin/networks/${found.id}/card-batches`, {
                headers: token ? { 'Authorization': `Bearer ${token}` } : {}
              });
              if (batchesRes.ok) {
                const batchesData = await batchesRes.json();
                setCardBatches(batchesData);
              }
              const txRes = await fetch(`/api/networks/${found.id}/transactions`, {
                headers: token ? { 'Authorization': `Bearer ${token}` } : {}
              });
              if (txRes.ok) {
                const txData = await txRes.json();
                setTransactions(txData);
              }
            } catch (cardsErr) {
              console.error('Failed to fetch network cards or batches', cardsErr);
            }
          }
        }
      } catch (err) {
        console.error('Failed to fetch network data', err);
      }
    };
    fetchNetworkData();
  }, [networkCode, networkName, globalUpdateTick]);

  React.useEffect(() => {
    setCurrentPage(1);
  }, [cardSearchQuery, cardStatusFilter]);

  const filteredCards = cards.filter(card => {
    const matchesSearch = cardSearchQuery === '' || card.card_code?.includes(cardSearchQuery);
    const matchesStatus = cardStatusFilter === 'all' || card.status === cardStatusFilter;
    return matchesSearch && matchesStatus;
  });

  const cardsPerPage = 20;
  const totalPages = Math.ceil(filteredCards.length / cardsPerPage);
  const paginatedCards = filteredCards.slice((currentPage - 1) * cardsPerPage, currentPage * cardsPerPage);

  // Calculate Totals
  const soldCards = cards.filter(c => c.status !== 'available');
  const totalCards = cards.length;
  const availableCards = totalCards - soldCards.length;

  const totalSales = transactions.filter(t => t.type === 'sale' || t.type === 'commission').reduce((sum, t) => sum + (t.amount || 0), 0);
  const totalWithdrawals = Math.abs(transactions.filter(t => t.type === 'withdrawal').reduce((sum, t) => sum + (t.amount || 0), 0));
  
  const filterDate = new Date();
  if (salesFilter === '1day') filterDate.setDate(filterDate.getDate() - 1);
  else if (salesFilter === '7days') filterDate.setDate(filterDate.getDate() - 7);
  else if (salesFilter === '30days') filterDate.setDate(filterDate.getDate() - 30);
  
  const recentSales = transactions.filter(t => (t.type === 'sale') && new Date(t.date) >= filterDate);
  const recentSoldCards = soldCards.slice(0, 5);
  const recentWithdrawalsList = transactions.filter(t => t.type === 'withdrawal').slice(0, 5);

  return (
    <div
      dir="rtl"
      className={` transition-colors font-['Cairo',sans-serif] ${
        isDarkMode ? 'bg-[#0a0f18] text-slate-100' : 'bg-slate-100 text-slate-800'
      }`}
    >
      {/* Main Area */}
      <main className="max-w-7xl mx-auto px-4 md:px-8 py-6 space-y-6">
        {/* Page Title Row */}
        <div className="flex items-center justify-between">
          

          
        </div>

        {/* 2. Network Header Banner (Blue Card) */}
        <div
          className={`rounded-2xl p-6 border transition-all relative overflow-hidden shadow-xl ${
            isDarkMode
              ? 'bg-gradient-to-r from-[#0f244a] to-[#122c5c] border-blue-900/60 text-white shadow-black/50'
              : 'bg-gradient-to-r from-blue-700 to-indigo-800 text-white shadow-blue-900/20'
          }`}
        >
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
            <div className="space-y-1 text-right">
              <div className="flex items-center gap-3">
                <span className="px-3 py-0.5 rounded-full text-xs font-bold bg-emerald-500 text-white shadow-sm">
                  نشط
                </span>
                <h2 className="text-2xl md:text-3xl font-black">{networkName}</h2>
              </div>
              <div className="flex items-center gap-4 text-xs md:text-sm opacity-90 pt-1 font-mono">
                <span>📞 {networkPhone}</span>
                <span>🏷️ {networkCode}</span>
              </div>
            </div>
          </div>

          {/* Action Buttons Row */}
          <div className="flex flex-wrap items-center gap-2.5 pt-2 border-t border-white/10">
            <Link
              href="/owner/edit-data"
              className="px-3.5 py-2 rounded-xl bg-white/15 hover:bg-white/25 text-white font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <FileText className="w-3.5 h-3.5 text-blue-200" />
              <span>طلب تعديل البيانات</span>
            </Link>

            <Link
              href="/owner/import-cards"
              className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-all flex items-center gap-1.5 shadow-md shadow-emerald-900/40 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>استيراد كروت</span>
            </Link>

            <Link
              href="/owner/mikrotik"
              className="px-3.5 py-2 rounded-xl bg-purple-700 hover:bg-purple-600 text-white font-bold text-xs transition-all flex items-center gap-1.5 shadow-md shadow-purple-900/40 cursor-pointer"
            >
              <Sliders className="w-3.5 h-3.5 text-purple-200" />
              <span>إعداد MikroTik</span>
            </Link>

            <Link
              href="/owner/withdrawals"
              className="px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs transition-all flex items-center gap-1.5 shadow-md shadow-amber-900/40 cursor-pointer"
            >
              <Wallet className="w-3.5 h-3.5 text-amber-200" />
              <span>طلبات السحب</span>
            </Link>

            <Link
              href="/owner/new-withdrawal"
              className="px-3.5 py-2 rounded-xl bg-cyan-700 hover:bg-cyan-600 text-white font-bold text-xs transition-all flex items-center gap-1.5 shadow-md shadow-cyan-900/40 cursor-pointer"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>طلب سحب جديد</span>
            </Link>

            <Link
              href="/owner/statement"
              className="px-3.5 py-2 rounded-xl bg-white/15 hover:bg-white/25 text-white font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <CreditCard className="w-3.5 h-3.5 text-blue-200" />
              <span>كشف الحساب</span>
            </Link>
          </div>
        </div>

        {/* 3. Low Stock Inventory Alert Box */}
        {(() => {
          const lowStockCats = categories.filter(c => (c.stock || 0) <= 5 && c.status !== 'inactive');
          
          if (lowStockCats.length === 0) return null;

          return (
            <div
              className={`rounded-2xl p-5 border transition-colors ${
                isDarkMode
                  ? 'bg-[#2a1700]/90 border-amber-600/60 text-amber-200'
                  : 'bg-amber-50 border-amber-300 text-amber-900'
              }`}
            >
              <div className="flex items-start gap-3 text-right">
                <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                <div className="space-y-2 flex-1">
                  <h3 className="font-bold text-sm md:text-base">تنبيه: مخزون منخفض</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2 text-xs font-semibold">
                    {lowStockCats.map((cat, idx) => (
                      <div key={idx} className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-between gap-4">
                        <span className="truncate">فئة "{cat.name || cat.price}" - باقي {cat.stock || 0} كرت فقط</span>
                        <Link href="/owner/import-cards" className="text-amber-400 underline font-bold cursor-pointer shrink-0">أضف كروت</Link>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          );
        })()}

        {/* 4. KPI Stat Counters Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className={`p-4 rounded-2xl border text-center ${isDarkMode ? 'bg-[#141d2b] border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`}>
            <span className="text-xs font-bold text-slate-400 block mb-1">إجمالي الكروت</span>
            <span className="text-2xl font-black text-slate-200">{totalCards.toLocaleString('en-US')}</span>
          </div>

          <div className={`p-4 rounded-2xl border text-center ${isDarkMode ? 'bg-[#141d2b] border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`}>
            <span className="text-xs font-bold text-slate-400 block mb-1">الكروت المتاحة</span>
            <span className="text-2xl font-black text-emerald-500">{availableCards.toLocaleString('en-US')}</span>
          </div>

          <div className={`p-4 rounded-2xl border text-center ${isDarkMode ? 'bg-[#141d2b] border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`}>
            <span className="text-xs font-bold text-slate-400 block mb-1">الكروت المباعة</span>
            <span className="text-2xl font-black text-blue-500">{soldCards.length.toLocaleString('en-US')}</span>
          </div>

          <div className={`p-4 rounded-2xl border text-center ${isDarkMode ? 'bg-[#141d2b] border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`}>
            <span className="text-xs font-bold text-slate-400 block mb-1">الرصيد</span>
            <span className="text-2xl font-black text-slate-100">{Number(networkData?.balance || 0).toLocaleString('en-US')} ر.ي</span>
          </div>
        </div>

        {/* 5. Financial Summary Cards (3 Cards) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Total Balance */}
          <div className="p-6 rounded-2xl bg-indigo-700 text-white shadow-xl flex flex-col justify-between space-y-4">
            <span className="text-xs font-bold opacity-80 block text-right">المبيعات الكلية</span>
            <div className="text-3xl font-black text-right dir-ltr">{totalSales.toLocaleString('en-US')} ر.ي</div>
            <span className="text-[11px] font-medium opacity-80 text-right">إجمالي المبيعات المكتملة</span>
          </div>

          {/* Card 2: Withdrawn Amount */}
          <div className="p-6 rounded-2xl bg-amber-600 text-white shadow-xl flex flex-col justify-between space-y-4">
            <span className="text-xs font-bold opacity-80 block text-right">المبالغ المسحوبة</span>
            <div className="text-3xl font-black text-right dir-ltr">{totalWithdrawals.toLocaleString('en-US')} ر.ي</div>
            <span className="text-[11px] font-medium opacity-80 text-right">إجمالي السحوبات المكتملة</span>
          </div>

          {/* Card 3: Remaining Balance */}
          <div className="p-6 rounded-2xl bg-emerald-600 text-white shadow-xl flex flex-col justify-between space-y-4">
            <span className="text-xs font-bold opacity-80 block text-right">الرصيد المتبقي</span>
            <div className="text-3xl font-black text-right dir-ltr">{Number(networkData?.balance || 0).toLocaleString('en-US')} ر.ي</div>
            <span className="text-[11px] font-medium opacity-80 text-right">متاح للسحب</span>
          </div>
        </div>


        {/* 7. Two Column Layout: Daily Sales + Distribution vs Withdrawals + Sold Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Right Column */}
          <div className="space-y-6">
            {/* Daily Sales Details */}
            <div className={`p-6 rounded-2xl border transition-colors ${isDarkMode ? 'bg-[#141d2b] border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`}>
              <div className="flex items-center justify-between mb-4">
                <select
                  value={salesFilter}
                  onChange={(e) => setSalesFilter(e.target.value)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold border focus:outline-none ${
                    isDarkMode ? 'bg-[#202b3c] text-slate-200 border-slate-700' : 'bg-slate-100 text-slate-800 border-slate-300'
                  }`}
                >
                  <option value="1day">أخر يوم</option>
                  <option value="7days">أخر 7 أيام</option>
                  <option value="30days">أخر 30 يوم</option>
                </select>

                <h3 className="text-base font-extrabold flex items-center gap-2">
                  <span>📄 تفاصيل المبيعات اليومية</span>
                </h3>
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-right">
                  <thead>
                    <tr className={`border-b ${isDarkMode ? 'border-slate-800 text-slate-400' : 'border-slate-200 text-slate-500'}`}>
                      <th className="py-2.5 px-3">التاريخ</th>
                      <th className="py-2.5 px-3">الفئة</th>
                      <th className="py-2.5 px-3">العدد</th>
                      <th className="py-2.5 px-3">المبلغ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentSales.length === 0 ? (
                      <tr className={isDarkMode ? 'border-b border-slate-800/50 text-slate-300' : 'border-b border-slate-100 text-slate-700'}>
                        <td colSpan={4} className="py-8 text-center text-slate-500">لا توجد مبيعات في هذه الفترة</td>
                      </tr>
                    ) : recentSales.slice(0, 10).map((sale, i) => (
                      <tr key={i} className={isDarkMode ? 'border-b border-slate-800/50 text-slate-300' : 'border-b border-slate-100 text-slate-700'}>
                        <td className="py-2.5 px-3 font-mono">{sale.date}</td>
                        <td className="py-2.5 px-3">{sale.provider}</td>
                        <td className="py-2.5 px-3">1</td>
                        <td className="py-2.5 px-3 text-emerald-500 font-bold">{sale.amount.toLocaleString('en-US')} ر.ي</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Card Distribution by Category */}
            <div className={`p-6 rounded-2xl border transition-colors ${isDarkMode ? 'bg-[#141d2b] border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`}>
              <h3 className="text-base font-extrabold mb-4 text-right flex items-center gap-2 justify-end">
                <span>توزيع الكروت حسب الفئة</span>
                <span>📊</span>
              </h3>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-right">
                  <thead>
                    <tr className={`border-b ${isDarkMode ? 'border-slate-800 text-slate-400' : 'border-slate-200 text-slate-500'}`}>
                      <th className="py-2.5 px-3">الفئة</th>
                      <th className="py-2.5 px-3">السعر</th>
                      <th className="py-2.5 px-3">المتاح</th>
                      <th className="py-2.5 px-3">المباع</th>
                      <th className="py-2.5 px-3">الحالة</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/40">
                    {categories.length === 0 && (
                       <tr>
                         <td colSpan={5} className="py-6 text-center text-slate-500">جاري تحميل الفئات...</td>
                       </tr>
                    )}
                    {categories.map((c: any, i: number) => (
                      <tr key={i} className={isDarkMode ? 'text-slate-300' : 'text-slate-700'}>
                        <td className="py-3 px-3 font-bold font-mono">{c.name || c.price}</td>
                        <td className="py-3 px-3">{c.price} ر.ي</td>
                        <td className="py-3 px-3 font-mono text-emerald-500 font-bold">{(c.stock || 0).toLocaleString('en-US')}</td>
                        <td className="py-3 px-3 font-mono text-blue-500">{soldCards.filter(sc => sc.card_category_id === c.id).length.toLocaleString('en-US')}</td>
                        <td className="py-3 px-3">
                          {c.status === 'inactive' ? (
                            <span className="text-red-400 font-bold flex items-center gap-1">
                              <span>معطلة</span>
                            </span>
                          ) : (c.stock || 0) === 0 ? (
                            <span className="text-amber-500 font-bold flex items-center gap-1">
                              <AlertTriangle className="w-3.5 h-3.5" />
                              <span>منخفض</span>
                            </span>
                          ) : (
                            <span className="text-emerald-500 font-bold">متوفر</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Left Column */}
          <div className="space-y-6">
            {/* Latest Withdrawals */}
            <div className={`p-6 rounded-2xl border transition-colors ${isDarkMode ? 'bg-[#141d2b] border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`}>
              <div className="flex items-center justify-between mb-4">
                <Link
                  href="/owner/withdrawals"
                  className="text-xs text-blue-400 hover:underline font-bold cursor-pointer"
                >
                  عرض الكل ←
                </Link>
                <h3 className="text-base font-extrabold flex items-center gap-2">
                  <span>💰 آخر السحوبات</span>
                </h3>
              </div>

              {recentWithdrawalsList.length === 0 ? (
                <div className={`py-12 text-center text-xs md:text-sm ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                  لا توجد طلبات سحب
                </div>
              ) : (
                <div className="space-y-3">
                  {recentWithdrawalsList.map((tx, i) => (
                    <div key={i} className={`p-3 rounded-xl border flex items-center justify-between ${isDarkMode ? 'border-slate-800 bg-[#1e293b]' : 'border-slate-200 bg-slate-50'}`}>
                      <div>
                        <div className="text-sm font-bold text-amber-500">{Math.abs(tx.amount).toLocaleString('en-US')} ر.ي</div>
                        <div className="text-[10px] text-slate-400 font-mono">{tx.date}</div>
                      </div>
                      <span className="px-2 py-1 bg-emerald-500/10 text-emerald-500 text-[10px] font-bold rounded">مكتمل</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Latest Sold Cards */}
            <div className={`p-6 rounded-2xl border transition-colors ${isDarkMode ? 'bg-[#141d2b] border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`}>
              <div className="flex items-center justify-between mb-4">
                <Link
                  href="/owner/cards"
                  className="text-xs text-blue-400 hover:underline font-bold cursor-pointer"
                >
                  عرض الكل ←
                </Link>
                <h3 className="text-base font-extrabold flex items-center gap-2">
                  <span>🎴 آخر الكروت المباعة</span>
                </h3>
              </div>

              {recentSoldCards.length === 0 ? (
                <div className={`py-12 text-center text-xs md:text-sm ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                  لا توجد كروت
                </div>
              ) : (
                <div className="space-y-3">
                  {recentSoldCards.map((card, i) => (
                    <div key={i} className={`p-3 rounded-xl border flex items-center justify-between ${isDarkMode ? 'border-slate-800 bg-[#1e293b]' : 'border-slate-200 bg-slate-50'}`}>
                      <div>
                        <div className="text-sm font-bold font-mono">{card.card_code}</div>
                        <div className="text-[10px] text-slate-400">{card.cardCategory?.name || card.cardCategory?.price}</div>
                      </div>
                      <span className="px-2 py-1 bg-blue-500/10 text-blue-500 text-[10px] font-bold rounded">مباع</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 7.5 Latest Card Batches */}
        <div className={`p-6 rounded-2xl border transition-colors space-y-5 ${isDarkMode ? 'bg-[#141d2b] border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`}>
          <div className="flex items-center justify-between">
            <Link
              href="/owner/import-cards"
              className="px-3 py-1.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>استيراد كروت جديدة</span>
            </Link>
            <h3 className="text-base md:text-lg font-extrabold flex items-center gap-2">
              <RefreshCw className="w-5 h-5 text-purple-500" />
              <span>آخر دفعات الكروت</span>
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs md:text-sm text-right">
              <thead>
                <tr className={`border-b ${isDarkMode ? 'border-slate-800 text-slate-400' : 'border-slate-200 text-slate-500'}`}>
                  <th className="py-3 px-3 text-center">العدد</th>
                  <th className="py-3 px-3 text-center">الفئة</th>
                  <th className="py-3 px-3 text-center">نوع الملف</th>
                  <th className="py-3 px-3 text-center">طريقة الإضافة</th>
                  <th className="py-3 px-3 text-center">رفع بواسطة</th>
                  <th className="py-3 px-3 text-center">التاريخ والوقت</th>
                  <th className="py-3 px-3 text-center">الإجراء</th>
                </tr>
              </thead>
              <tbody>
                {cardBatches.map((batch, i) => (
                  <tr key={i} className={isDarkMode ? 'border-b border-slate-800/50 text-slate-300' : 'border-b border-slate-100 text-slate-700'}>
                    <td className="py-3 px-3">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-[11px] mx-auto ${isDarkMode ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-100 text-blue-600'}`}>
                        {batch.cards_count}
                      </div>
                    </td>
                    <td className="py-3 px-3 text-center">{batch.card_category?.name || batch.card_category?.price}</td>
                    <td className="py-3 px-3 text-center">
                      <span className={`px-2.5 py-1 rounded font-bold text-[10px] uppercase ${isDarkMode ? 'bg-slate-700 text-slate-300' : 'bg-slate-200 text-slate-700'}`}>
                        {batch.file_type}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span className={`px-2.5 py-1 rounded font-bold text-[10px] ${isDarkMode ? 'bg-slate-700 text-slate-300' : 'bg-slate-200 text-slate-700'}`}>
                        {batch.addition_method}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-bold text-center">{batch.uploaded_by}</td>
                    <td className="py-3 px-3 text-center">
                      <span dir="ltr" className={`inline-block font-mono text-[11px] font-bold px-2 py-1 rounded ${isDarkMode ? 'bg-slate-800/40 text-slate-300' : 'bg-slate-100 text-slate-600'}`}>
                        {(() => {
                          const d = new Date(batch.created_at);
                          const YYYY = d.getFullYear();
                          const MM = String(d.getMonth() + 1).padStart(2, '0');
                          const DD = String(d.getDate()).padStart(2, '0');
                          let h = d.getHours();
                          const ampm = h >= 12 ? 'PM' : 'AM';
                          h = h % 12 || 12;
                          const hh = String(h).padStart(2, '0');
                          const mm = String(d.getMinutes()).padStart(2, '0');
                          return `${YYYY}/${MM}/${DD} - ${hh}:${mm} ${ampm}`;
                        })()}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                       <div className="flex justify-center">
                         <button 
                           onClick={() => setBatchToDelete(batch.id)} 
                           className={`px-3 py-1.5 rounded-lg font-bold text-[11px] transition-all flex items-center justify-center gap-1.5 cursor-pointer ${isDarkMode ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20' : 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-200'}`}
                         >
                           <Trash2 className="w-3.5 h-3.5" />
                           <span>حذف</span>
                         </button>
                       </div>
                    </td>
                  </tr>
                ))}
                {cardBatches.length === 0 && (
                  <tr>
                    <td colSpan={7} className={`py-12 text-center text-xs md:text-sm ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                      لا توجد دفعات
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* 8. Bottom Section: Search in Cards */}
        <div className={`p-6 rounded-2xl border transition-colors space-y-5 ${isDarkMode ? 'bg-[#141d2b] border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`}>
          <div className="flex items-center justify-between">
            <h3 className="text-base md:text-lg font-extrabold text-right flex items-center gap-2 justify-start">
              <Search className="w-5 h-5 text-blue-500" />
              <span>البحث في الكروت المتقدم</span>
            </h3>
            <Link
              href="/owner/cards"
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition-all shadow-md shadow-blue-900/30 flex items-center gap-2 cursor-pointer"
            >
              <span>فتح صفحة الكروت الكاملة</span>
            </Link>
          </div>

          {/* Controls Bar */}
          <div className="flex flex-col md:flex-row items-center gap-3">
            <div className="relative w-full md:flex-1">
              <input
                type="text"
                value={cardSearchQuery}
                onChange={(e) => setCardSearchQuery(e.target.value)}
                placeholder="بحث برقم الكرت..."
                className={`w-full rounded-xl py-2.5 pr-10 pl-4 text-xs md:text-sm text-right focus:outline-none focus:ring-1 transition-all ${
                  isDarkMode ? 'bg-[#202b3c] text-white border border-slate-700/80 focus:border-blue-500' : 'bg-slate-50 text-slate-900 border border-slate-300'
                }`}
              />
              <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-3" />
            </div>

            <select
              value={cardStatusFilter}
              onChange={(e) => setCardStatusFilter(e.target.value)}
              className={`w-full md:w-44 rounded-xl py-2.5 px-3 text-xs md:text-sm text-right focus:outline-none ${
                isDarkMode ? 'bg-[#202b3c] text-slate-200 border border-slate-700' : 'bg-slate-50 text-slate-900 border border-slate-300'
              }`}
            >
              <option value="all">كل الحالات</option>
              <option value="available">متاح</option>
              <option value="sold">مباع</option>
            </select>

            <button
              onClick={() => {
                // To force re-fetch, we could mutate global update tick if we had a dispatcher, or just alert for now.
                // Since this view is reactive to globalUpdateTick anyway, the best approach is to re-render.
                setCardSearchQuery(cardSearchQuery);
              }}
              className="w-full md:w-auto px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs md:text-sm transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-blue-900/30"
            >
              <RefreshCw className="w-4 h-4" />
              <span>تحديث الفلتر</span>
            </button>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-xs md:text-sm text-right">
              <thead>
                <tr className={`border-b ${isDarkMode ? 'border-slate-800 text-slate-400' : 'border-slate-200 text-slate-500'}`}>
                  <th className="py-3 px-3 text-center">رقم الكرت</th>
                  <th className="py-3 px-3 text-center">كلمة المرور</th>
                  <th className="py-3 px-3 text-center">الفئة</th>
                  <th className="py-3 px-3 text-center">الحالة</th>
                  <th className="py-3 px-3 text-center">التاريخ</th>
                  <th className="py-3 px-3 text-center">الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {paginatedCards.map((card, i) => (
                  <tr key={i} className={isDarkMode ? 'border-b border-slate-800/50 text-slate-300' : 'border-b border-slate-100 text-slate-700'}>
                    <td className="py-3 px-3 text-center font-mono font-bold text-blue-500">{card.card_code}</td>
                    <td className="py-3 px-3 text-center font-mono">{card.password || '-'}</td>
                    <td className="py-3 px-3 text-center">{card.card_category?.name || card.card_category?.price}</td>
                    <td className="py-3 px-3 text-center">
                      {card.status === 'available' ? (
                        <span className="text-emerald-500 font-bold bg-emerald-500/10 px-2 py-1 rounded">متاح</span>
                      ) : card.status === 'sold' ? (
                        <span className="text-blue-500 font-bold bg-blue-500/10 px-2 py-1 rounded">مباع</span>
                      ) : (
                        <span className="text-slate-500 font-bold">{card.status}</span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span dir="ltr" className={`inline-block font-mono text-[11px] font-bold px-2 py-1 rounded ${isDarkMode ? 'bg-slate-800/40 text-slate-300' : 'bg-slate-100 text-slate-600'}`}>
                        {(() => {
                          const d = new Date(card.created_at);
                          const YYYY = d.getFullYear();
                          const MM = String(d.getMonth() + 1).padStart(2, '0');
                          const DD = String(d.getDate()).padStart(2, '0');
                          let h = d.getHours();
                          const ampm = h >= 12 ? 'PM' : 'AM';
                          h = h % 12 || 12;
                          const hh = String(h).padStart(2, '0');
                          const mm = String(d.getMinutes()).padStart(2, '0');
                          return `${YYYY}/${MM}/${DD} - ${hh}:${mm} ${ampm}`;
                        })()}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                       <div className="flex justify-center">
                         <button 
                           onClick={() => setCardToDelete(card.id)} 
                           className={`px-3 py-1.5 rounded-lg font-bold text-[11px] transition-all flex items-center justify-center gap-1.5 cursor-pointer ${isDarkMode ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20' : 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-200'}`}
                         >
                           <Trash2 className="w-3.5 h-3.5" />
                           <span>حذف</span>
                         </button>
                       </div>
                    </td>
                  </tr>
                ))}
                {filteredCards.length === 0 && (
                  <tr>
                    <td colSpan={6} className={`py-12 text-center text-xs md:text-sm ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                      لا توجد كروت مطابقة
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className={`flex items-center justify-between pt-4 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
              <div className="text-xs font-bold">
                إجمالي الكروت: {filteredCards.length}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    currentPage === 1 
                    ? 'opacity-50 cursor-not-allowed border ' + (isDarkMode ? 'border-slate-700 text-slate-500' : 'border-slate-300 text-slate-400')
                    : 'cursor-pointer hover:bg-blue-600 hover:text-white border border-blue-500 text-blue-500'
                  }`}
                >
                  السابق
                </button>
                <span className="text-xs font-bold px-2">
                  صفحة {currentPage} من {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    currentPage === totalPages 
                    ? 'opacity-50 cursor-not-allowed border ' + (isDarkMode ? 'border-slate-700 text-slate-500' : 'border-slate-300 text-slate-400')
                    : 'cursor-pointer hover:bg-blue-600 hover:text-white border border-blue-500 text-blue-500'
                  }`}
                >
                  التالي
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Modals */}
      {showMikrotikModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className={`w-full max-w-md rounded-2xl p-6 border shadow-2xl relative ${isDarkMode ? 'bg-[#141d2b] border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-900'}`}>
            <button onClick={() => setShowMikrotikModal(false)} className="absolute top-4 left-4 text-slate-400 hover:text-slate-200 cursor-pointer">
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-xl font-bold mb-4 text-right flex items-center gap-2">
              <Sliders className="w-5 h-5 text-purple-500" />
              <span>إعداد MikroTik</span>
            </h3>
            <div className="space-y-4 text-right">
              <div>
                <label className="block text-xs font-bold mb-1.5">رابط السيرفر / Host IP</label>
                <input type="text" defaultValue="192.168.88.1" className={`w-full rounded-xl py-2.5 px-3 text-sm font-mono ${isDarkMode ? 'bg-[#202b3c] text-white border border-slate-700' : 'bg-slate-100 text-slate-900 border border-slate-300'}`} />
              </div>
              <div>
                <label className="block text-xs font-bold mb-1.5">اسم المستخدم (User)</label>
                <input type="text" defaultValue="admin" className={`w-full rounded-xl py-2.5 px-3 text-sm font-mono ${isDarkMode ? 'bg-[#202b3c] text-white border border-slate-700' : 'bg-slate-100 text-slate-900 border border-slate-300'}`} />
              </div>
              <button onClick={() => { alert('تم الحفظ والإتصال بنجاح!'); setShowMikrotikModal(false); }} className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold py-3 rounded-xl cursor-pointer text-sm">
                حفظ الربط
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Delete Batch Confirmation Modal */}
      {batchToDelete !== null && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className={`w-full max-w-sm rounded-2xl p-6 border shadow-2xl relative ${isDarkMode ? 'bg-[#141d2b] border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-900'}`}>
            <div className="flex justify-center mb-4">
              <div className={`p-4 rounded-full ${isDarkMode ? 'bg-red-500/20 text-red-500' : 'bg-red-100 text-red-600'}`}>
                <AlertTriangle className="w-8 h-8" />
              </div>
            </div>
            <h3 className="text-lg font-bold mb-2 text-center">تأكيد حذف الدفعة</h3>
            <p className={`text-sm text-center mb-6 leading-relaxed ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
              هل أنت متأكد من حذف هذه الدفعة بالكامل؟
              سيتم حذف جميع الكروت <strong className="text-emerald-500">المتاحة</strong> المرتبطة بها ولن تتمكن من التراجع عن هذا الإجراء.
              لن يتم حذف الكروت التي تم بيعها.
            </p>
            <div className="flex gap-3">
              <button 
                onClick={async () => {
                   try {
                     const token = typeof localStorage !== 'undefined' ? localStorage.getItem('auth_token') : null;
                     const res = await fetch(`/api/admin/networks/${networkData.id}/card-batches/${batchToDelete}`, {
                       method: 'DELETE',
                       headers: token ? { 'Authorization': `Bearer ${token}` } : {}
                     });
                     if (res.ok) {
                       setBatchToDelete(null);
                       window.location.reload();
                     } else {
                       const data = await res.json();
                       alert(data.error || 'فشل الحذف');
                     }
                   } catch (e) {
                     alert('حدث خطأ في الاتصال');
                   }
                }} 
                className="flex-1 bg-red-600 hover:bg-red-500 text-white font-bold py-2.5 rounded-xl transition-colors cursor-pointer text-sm"
              >
                تأكيد الحذف
              </button>
              <button 
                onClick={() => setBatchToDelete(null)} 
                className={`flex-1 font-bold py-2.5 rounded-xl transition-colors cursor-pointer text-sm ${isDarkMode ? 'bg-slate-800 hover:bg-slate-700 text-slate-300' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'}`}
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Delete Card Confirmation Modal */}
      {cardToDelete !== null && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className={`w-full max-w-sm rounded-2xl p-6 border shadow-2xl relative ${isDarkMode ? 'bg-[#141d2b] border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-900'}`}>
            <div className="flex justify-center mb-4">
              <div className={`p-4 rounded-full ${isDarkMode ? 'bg-red-500/20 text-red-500' : 'bg-red-100 text-red-600'}`}>
                <AlertTriangle className="w-8 h-8" />
              </div>
            </div>
            <h3 className="text-lg font-bold mb-2 text-center">تأكيد حذف الكرت</h3>
            <p className={`text-sm text-center mb-6 leading-relaxed ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
              هل أنت متأكد من حذف هذا الكرت؟
              لا يمكن التراجع عن هذا الإجراء، وسيتم خصمه من المخزون.
            </p>
            <div className="flex gap-3">
              <button 
                onClick={async () => {
                   try {
                     const token = typeof localStorage !== 'undefined' ? localStorage.getItem('auth_token') : null;
                     const res = await fetch(`/api/admin/networks/${networkData.id}/cards/${cardToDelete}`, {
                       method: 'DELETE',
                       headers: token ? { 'Authorization': `Bearer ${token}` } : {}
                     });
                     if (res.ok) {
                       setCardToDelete(null);
                       window.location.reload();
                     } else {
                       const data = await res.json();
                       alert(data.error || 'فشل الحذف');
                     }
                   } catch (e) {
                     alert('حدث خطأ في الاتصال');
                   }
                }} 
                className="flex-1 bg-red-600 hover:bg-red-500 text-white font-bold py-2.5 rounded-xl transition-colors cursor-pointer text-sm"
              >
                تأكيد الحذف
              </button>
              <button 
                onClick={() => setCardToDelete(null)} 
                className={`flex-1 font-bold py-2.5 rounded-xl transition-colors cursor-pointer text-sm ${isDarkMode ? 'bg-slate-800 hover:bg-slate-700 text-slate-300' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'}`}
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
