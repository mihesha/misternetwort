import { useRouter } from 'next/navigation';
import React, { useState, useMemo, useRef } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import {
  Moon,
  Sun,
  Globe,
  Settings,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  FileText,
  Key,
  Shield,
  LogOut,
  Search,
  Calendar,
  CalendarDays,
  CalendarRange,
  Filter,
  Download,
  BarChart3,
  List,
  TrendingUp,
  ArrowUpRight,
  Wallet,
  Building2,
  Receipt,
  CheckCircle2,
  Clock,
  XCircle,
  Sparkles,
  ArrowRightLeft,
  Coins,
  RefreshCw,
  Printer,
  SlidersHorizontal,
  Banknote,
  Inbox,
  ArrowDownLeft,
  Loader2,
  Check,
  Eye,
  ShieldCheck,
  CreditCard,
} from 'lucide-react';

interface NetworkAccountStatementViewProps {
  isDarkMode: boolean;
  ownerName?: string;
  networkName?: string;
  networkCode?: string;
  onNavigateView?: (view: string) => void;
}

interface StatementTransaction {
  id: string;
  date: string;
  time: string;
  type: 'sale' | 'withdrawal' | 'commission';
  typeLabel: string;
  provider: string;
  category?: string;
  reference: string;
  amount: number;
  balanceAfter: number;
  status: 'completed' | 'pending' | 'rejected';
  statusLabel: string;
}

export const NetworkAccountStatementView: React.FC<NetworkAccountStatementViewProps> = ({
  isDarkMode,
  ownerName = 'هشام محمد الجايفي',
  networkName = 'برق نت',
  networkCode = '22744',
  onNavigateView,
}) => {
  const router = useRouter();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [quickPeriod, setQuickPeriod] = useState<string>('current_month');
  const [showFilters, setShowFilters] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'summary' | 'details'>('details');
  const [summarySubTab, setSummarySubTab] = useState<'day' | 'category' | 'provider' | 'type'>('day');

  const statementRef = useRef<HTMLDivElement>(null);
  const pdfTemplateRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);
  const [showDocumentPreview, setShowDocumentPreview] = useState(false);

  // Dates
  const [fromDate, setFromDate] = useState('2026-08-01');
  const [toDate, setToDate] = useState('2026-08-02');

  // General Filters (No Date From/To inside filter panel per user request)
  const [txType, setTxType] = useState('all');
  const [provider, setProvider] = useState('all');
  const [category, setCategory] = useState('all');
  const [saleStatus, setSaleStatus] = useState('all');
  const [withdrawStatus, setWithdrawStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [groupBy, setGroupBy] = useState('day');

  const [transactions, setTransactions] = useState<StatementTransaction[]>([]);
  const [currentBalance, setCurrentBalance] = useState(0);

  React.useEffect(() => {
    const fetchNetworkAndTransactions = async () => {
      try {
        const token = typeof localStorage !== 'undefined' ? localStorage.getItem('auth_token') : null;
        const res = await fetch('/api/networks', {
          headers: token ? { 'Authorization': `Bearer ${token}` } : {}
        });
        if (res.ok) {
          const networksData = await res.json();
          const found = networksData.find((n: any) =>
            (networkCode && n.network_code === networkCode) ||
            (networkName && n.name === networkName)
          ) || networksData[0];
          
          if (found) {
            setCurrentBalance(found.balance || 0);
            
            const txRes = await fetch(`/api/networks/${found.id}/transactions`, {
              headers: token ? { 'Authorization': `Bearer ${token}` } : {}
            });
            if (txRes.ok) {
              const txData = await txRes.json();
              setTransactions(txData);
            }
          }
        }
      } catch (err) {
        console.error('Failed to fetch data for statement', err);
      }
    };
    fetchNetworkAndTransactions();
  }, [networkCode, networkName]);

  // Quick period change handler
  const handleQuickPeriodChange = (periodId: string) => {
    setQuickPeriod(periodId);
    if (periodId === 'today') {
      setFromDate('2026-08-02');
      setToDate('2026-08-02');
    } else if (periodId === 'last_7_days') {
      setFromDate('2026-07-26');
      setToDate('2026-08-02');
    } else if (periodId === 'current_month') {
      setFromDate('2026-08-01');
      setToDate('2026-08-31');
    } else if (periodId === 'last_month') {
      setFromDate('2026-07-01');
      setToDate('2026-07-31');
    }
  };

  // Filtered dataset
  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      // Type filter
      if (txType !== 'all') {
        if (txType === 'sales' && tx.type !== 'sale') return false;
        if (txType === 'withdrawal' && tx.type !== 'withdrawal') return false;
        if (txType === 'commission' && tx.type !== 'commission') return false;
      }
      // Provider filter
      if (provider !== 'all' && tx.provider && !tx.provider.toLowerCase().includes(provider.toLowerCase())) {
        return false;
      }
      // Search filter
      if (
        searchQuery &&
        (!tx.reference || !tx.reference.toLowerCase().includes(searchQuery.toLowerCase())) &&
        (!tx.provider || !tx.provider.toLowerCase().includes(searchQuery.toLowerCase())) &&
        (!tx.id || !tx.id.toLowerCase().includes(searchQuery.toLowerCase()))
      ) {
        return false;
      }
      return true;
    });
  }, [transactions, txType, provider, searchQuery]);

  // Calculate totals
  const totalSales = filteredTransactions
    .filter((t) => t.type === 'sale' || t.type === 'commission')
    .reduce((acc, t) => acc + t.amount, 0);

  const totalWithdrawals = Math.abs(
    filteredTransactions
      .filter((t) => t.type === 'withdrawal')
      .reduce((acc, t) => acc + t.amount, 0)
  );

  const closingBalance = currentBalance;
  const computedOpeningBalance = closingBalance - totalSales + totalWithdrawals;

  const handleExportPDF = async () => {
    if (isExporting) return;
    setIsExporting(true);
    setExportSuccess(false);

    try {
      const element = pdfTemplateRef.current;
      if (!element) {
        throw new Error('Template element not found');
      }

      await new Promise((resolve) => setTimeout(resolve, 100));

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        windowWidth: 1000,
        onclone: (clonedDoc) => {
          const sanitizeCSS = (str: string) => {
            return str.replace(/(oklch|oklab|color-mix|color|hwb|lab|lch|light-dark)\([^)]*\)/gi, '#64748b');
          };

          const styleTags = Array.from(clonedDoc.querySelectorAll('style'));
          styleTags.forEach((styleTag) => {
            const rawCSS = styleTag.textContent || '';
            if (/(oklch|oklab|color-mix|color|hwb|lab|lch|light-dark)/i.test(rawCSS)) {
              const sanitized = sanitizeCSS(rawCSS);
              const newStyle = clonedDoc.createElement('style');
              newStyle.textContent = sanitized;
              styleTag.parentNode?.replaceChild(newStyle, styleTag);
            }
          });

          const allElements = Array.from(clonedDoc.querySelectorAll('*')) as HTMLElement[];
          allElements.forEach((el) => {
            const attrStyle = el.getAttribute('style');
            if (attrStyle && /(oklch|oklab|color-mix|color|hwb|lab|lch|light-dark)/i.test(attrStyle)) {
              el.setAttribute('style', sanitizeCSS(attrStyle));
            }
          });
        },
      });

      if (!canvas || canvas.width === 0 || canvas.height === 0) {
        throw new Error('Canvas rendering produced zero size');
      }

      const imgData = canvas.toDataURL('image/jpeg', 0.95);
      if (!imgData || !imgData.startsWith('data:image/jpeg')) {
        throw new Error('Invalid image data URL');
      }

      const pdf = new jsPDF({
        orientation: 'p',
        unit: 'mm',
        format: 'a4',
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = pdfWidth;
      const imgHeight = (canvas.height * pdfWidth) / canvas.width;

      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      const safeNetworkName = networkName.replace(/[\s\/]/g, '_');
      const fileName = `كشف_حساب_رسمي_${safeNetworkName}_${networkCode}_${fromDate}_إلى_${toDate}.pdf`;
      pdf.save(fileName);

      setExportSuccess(true);
      setTimeout(() => setExportSuccess(false), 5000);
    } catch (err) {
      console.error('PDF export error:', err);
      window.print();
    } finally {
      setIsExporting(false);
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
      <main id="account-statement-printable" ref={statementRef} className="max-w-6xl mx-auto px-4 md:px-8 py-6 space-y-6">
        {/* Export Status Banner */}
        {isExporting && (
          <div className="p-4 rounded-xl bg-blue-500/20 border border-blue-500/40 text-blue-300 text-xs font-bold flex items-center justify-between animate-pulse">
            <div className="flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-blue-400" />
              <span>جاري تجهيز وتوليد ملف PDF عالي الدقة لكشف الحساب...</span>
            </div>
          </div>
        )}

        {exportSuccess && (
          <div className="p-4 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-2 animate-in fade-in duration-300">
            <Check className="w-4 h-4 text-emerald-400" />
            <span>تم تصدير وتحميل كشف الحساب بصيغة PDF بنجاح!</span>
          </div>
        )}

        {/* Page Sub-Header */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => router.push('/owner/details')}
            className={`flex items-center gap-1.5 text-xs font-bold transition-colors cursor-pointer ${
              isDarkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-700'
            }`}
          >
            <ChevronLeft className="w-4 h-4" />
            <span>العودة للشبكة</span>
          </button>

          
        </div>

        {/* Account Statement Purple Header Banner */}
        <div className="rounded-2xl p-6 bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-600 text-white shadow-xl flex items-center justify-between relative overflow-hidden">
          <div className="absolute top-0 left-0 w-64 h-64 bg-white/5 rounded-full blur-3xl pointer-events-none" />
          <div className="space-y-1.5 text-right z-10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
                <FileText className="w-6 h-6 text-indigo-200" />
              </div>
              <h2 className="text-2xl md:text-3xl font-black tracking-wide">كشف حساب الشبكة</h2>
            </div>
            <p className="text-xs md:text-sm text-indigo-100 font-mono flex items-center gap-2">
              <span className="font-bold">{networkName}</span>
              <span className="px-2 py-0.5 rounded-md bg-white/15 text-indigo-200 text-[11px]">كود: {networkCode}</span>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 z-10 mt-3 sm:mt-0">
            <button
              onClick={() => setShowDocumentPreview(true)}
              className="px-3.5 py-2.5 rounded-xl bg-white/15 hover:bg-white/25 text-white font-bold text-xs transition-all backdrop-blur-md flex items-center gap-2 cursor-pointer border border-white/20"
            >
              <Eye className="w-4 h-4 text-indigo-200" />
              <span>معاينة الوثيقة الرسمية</span>
            </button>

            <button
              onClick={handleExportPDF}
              disabled={isExporting}
              className="px-4 py-2.5 rounded-xl bg-white text-indigo-950 hover:bg-indigo-50 font-black text-xs transition-all shadow-md flex items-center gap-2 cursor-pointer disabled:opacity-70"
            >
              {isExporting ? <Loader2 className="w-4 h-4 text-indigo-600 animate-spin" /> : <Download className="w-4 h-4 text-indigo-600" />}
              <span>{isExporting ? 'جاري التوليد...' : 'تصدير PDF رسمياً'}</span>
            </button>
          </div>
        </div>

        {/* Quick Period Buttons & Custom Expansion */}
        <div className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs font-bold">
            <div className="flex flex-wrap items-center gap-2">
              <span className={`flex items-center gap-1.5 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                <Calendar className="w-4 h-4 text-blue-500" />
                <span>الفترة السريعة:</span>
              </span>
              <div className="flex flex-wrap items-center gap-1.5">
                {[
                  { id: 'today', label: 'اليوم', icon: Calendar },
                  { id: 'last_7_days', label: 'آخر 7 أيام', icon: CalendarRange },
                  { id: 'current_month', label: 'الشهر الحالي', icon: CalendarDays },
                  { id: 'last_month', label: 'الشهر الماضي', icon: Clock },
                  { id: 'custom', label: 'تخصيص', icon: SlidersHorizontal },
                ].map((period) => {
                  const IconComp = period.icon;
                  return (
                    <button
                      key={period.id}
                      onClick={() => handleQuickPeriodChange(period.id)}
                      className={`px-3.5 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
                        quickPeriod === period.id
                          ? 'bg-blue-600 text-white shadow-md shadow-blue-900/30 font-black ring-2 ring-blue-400/30'
                          : isDarkMode
                          ? 'bg-[#141d2b] hover:bg-[#1f2b3e] text-slate-300 border border-slate-800'
                          : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 shadow-xs'
                      }`}
                    >
                      <IconComp className={`w-3.5 h-3.5 ${quickPeriod === period.id ? 'text-white' : 'text-blue-400'}`} />
                      <span>{period.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className={`text-[11px] font-mono font-bold px-3 py-1.5 rounded-lg border ${
              isDarkMode ? 'bg-[#121926] border-slate-800 text-slate-300' : 'bg-white border-slate-200 text-slate-600'
            }`}>
              النطاق الزمني: <span className="text-blue-500">{fromDate}</span> إلى <span className="text-blue-500">{toDate}</span>
            </div>
          </div>

          {/* DYNAMIC CUSTOM DATE RANGE BOX - Shows ONLY when quickPeriod === 'custom' */}
          {quickPeriod === 'custom' && (
            <div
              className={`p-4 rounded-2xl border transition-all animate-in fade-in slide-in-from-top-2 duration-300 shadow-lg ${
                isDarkMode
                  ? 'bg-[#151f2e] border-blue-500/40 text-slate-200'
                  : 'bg-blue-50/80 border-blue-200 text-slate-800'
              }`}
            >
              <div className="flex items-center gap-2 mb-3">
                <SlidersHorizontal className="w-4 h-4 text-blue-500" />
                <h4 className="text-xs font-black text-blue-500">تحديد فترة زمنية مخصصة للكشف:</h4>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs font-bold">
                <div>
                  <label className={`block mb-1.5 text-right ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                    من تاريخ (بداية الفترة)
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      value={fromDate}
                      onChange={(e) => setFromDate(e.target.value)}
                      className={`w-full rounded-xl py-2.5 px-3 text-right focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        isDarkMode
                          ? 'bg-[#1c283a] text-white border border-slate-700'
                          : 'bg-white text-slate-900 border border-slate-300 shadow-xs'
                      }`}
                    />
                  </div>
                </div>

                <div>
                  <label className={`block mb-1.5 text-right ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                    إلى تاريخ (نهاية الفترة)
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      value={toDate}
                      onChange={(e) => setToDate(e.target.value)}
                      className={`w-full rounded-xl py-2.5 px-3 text-right focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        isDarkMode
                          ? 'bg-[#1c283a] text-white border border-slate-700'
                          : 'bg-white text-slate-900 border border-slate-300 shadow-xs'
                      }`}
                    />
                  </div>
                </div>

                <div className="flex items-end gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setFromDate('2026-08-01');
                      setToDate('2026-08-02');
                    }}
                    className="flex-1 py-2.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs transition-all shadow-md cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>تطبيق الفترة</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Collapsible Filter Panel (Note: From/To Date removed per user request) */}
        <div
          className={`rounded-2xl border transition-all overflow-hidden ${
            isDarkMode ? 'bg-[#121926] border-slate-800' : 'bg-white border-slate-200 shadow-sm'
          }`}
        >
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`w-full px-5 py-3.5 flex items-center justify-between text-xs font-black transition-colors cursor-pointer ${
              isDarkMode ? 'hover:bg-slate-800/40 text-slate-200' : 'hover:bg-slate-50 text-slate-800'
            }`}
          >
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-blue-500" />
              <span>تصفية الفئات والمعاملات</span>
              {(txType !== 'all' || provider !== 'all' || searchQuery) && (
                <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
              )}
            </div>
            <div className="flex items-center gap-2 text-slate-400">
              <span className="text-[11px] font-normal">تصفية حسب المزود، الفئة، أو رقم المرجع</span>
              {showFilters ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </div>
          </button>

          {showFilters && (
            <div className={`p-5 border-t space-y-4 ${isDarkMode ? 'border-slate-800' : 'border-slate-200'}`}>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs font-bold">
                {/* Transaction Type */}
                <div>
                  <label className={`block mb-1.5 text-right ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                    نوع المعاملة
                  </label>
                  <select
                    value={txType}
                    onChange={(e) => setTxType(e.target.value)}
                    className={`w-full rounded-xl py-2.5 px-3 text-right cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      isDarkMode
                        ? 'bg-[#182232] text-white border border-slate-700'
                        : 'bg-slate-50 text-slate-900 border border-slate-300'
                    }`}
                  >
                    <option value="all">كل الأنواع</option>
                    <option value="sales">مبيعات كروت</option>
                    <option value="withdrawal">سحب مالي</option>
                    <option value="commission">عمولات</option>
                  </select>
                </div>

                {/* Provider */}
                <div>
                  <label className={`block mb-1.5 text-right ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                    المزود
                  </label>
                  <select
                    value={provider}
                    onChange={(e) => setProvider(e.target.value)}
                    className={`w-full rounded-xl py-2.5 px-3 text-right cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      isDarkMode
                        ? 'bg-[#182232] text-white border border-slate-700'
                        : 'bg-slate-50 text-slate-900 border border-slate-300'
                    }`}
                  >
                    <option value="all">كل المزودين</option>
                    <option value="jaib">جيب</option>
                    <option value="kuraimi">الكريمي</option>
                    <option value="tadawulat">تداولات</option>
                  </select>
                </div>

                {/* Search input */}
                <div>
                  <label className={`block mb-1.5 text-right ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                    البحث بكلمة مفتاحية
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="رقم المرجع، المحفظة..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className={`w-full rounded-xl py-2.5 px-3 pr-9 text-right focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        isDarkMode
                          ? 'bg-[#182232] text-white border border-slate-700 placeholder-slate-500'
                          : 'bg-slate-50 text-slate-900 border border-slate-300 placeholder-slate-400'
                      }`}
                    />
                    <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>

                {/* Sale Status */}
                <div>
                  <label className={`block mb-1.5 text-right ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                    حالة البيع
                  </label>
                  <select
                    value={saleStatus}
                    onChange={(e) => setSaleStatus(e.target.value)}
                    className={`w-full rounded-xl py-2.5 px-3 text-right cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      isDarkMode
                        ? 'bg-[#182232] text-white border border-slate-700'
                        : 'bg-slate-50 text-slate-900 border border-slate-300'
                    }`}
                  >
                    <option value="all">الكل</option>
                    <option value="success">ناجح</option>
                    <option value="pending">قيد الانتظار</option>
                  </select>
                </div>

                {/* Withdrawal Status */}
                <div>
                  <label className={`block mb-1.5 text-right ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                    حالة السحب
                  </label>
                  <select
                    value={withdrawStatus}
                    onChange={(e) => setWithdrawStatus(e.target.value)}
                    className={`w-full rounded-xl py-2.5 px-3 text-right cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      isDarkMode
                        ? 'bg-[#182232] text-white border border-slate-700'
                        : 'bg-slate-50 text-slate-900 border border-slate-300'
                    }`}
                  >
                    <option value="all">الكل</option>
                    <option value="completed">مكتمل</option>
                    <option value="pending">قيد الانتظار</option>
                  </select>
                </div>

                {/* Group By */}
                <div>
                  <label className={`block mb-1.5 text-right ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                    تجميع حسب
                  </label>
                  <select
                    value={groupBy}
                    onChange={(e) => setGroupBy(e.target.value)}
                    className={`w-full rounded-xl py-2.5 px-3 text-right cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      isDarkMode
                        ? 'bg-[#182232] text-white border border-slate-700'
                        : 'bg-slate-50 text-slate-900 border border-slate-300'
                    }`}
                  >
                    <option value="day">اليوم</option>
                    <option value="month">الشهر</option>
                    <option value="category">الفئة</option>
                  </select>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setTxType('all');
                    setProvider('all');
                    setCategory('all');
                    setSaleStatus('all');
                    setWithdrawStatus('all');
                    setSearchQuery('');
                  }}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    isDarkMode
                      ? 'bg-slate-800 text-slate-400 hover:text-slate-200'
                      : 'bg-slate-200 text-slate-600 hover:text-slate-800'
                  }`}
                >
                  إعادة تعيين
                </button>
                <button
                  type="button"
                  onClick={() => setShowFilters(false)}
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black text-xs transition-all shadow-md cursor-pointer"
                >
                  تطبيق التصفية
                </button>
              </div>
            </div>
          )}
        </div>

        {/* 4 Financial Metrics Cards with Modern Icons */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div
            className={`p-5 rounded-2xl border transition-all hover:scale-[1.01] ${
              isDarkMode ? 'bg-[#121926] border-slate-800' : 'bg-white border-slate-200 shadow-sm'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className={`text-xs font-bold ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                الرصيد الافتتاحي
              </span>
              <div className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
                <Building2 className="w-4 h-4" />
              </div>
            </div>
            <div className={`text-xl md:text-2xl font-black tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
              {computedOpeningBalance.toLocaleString()} <span className="text-xs font-normal text-slate-400">ر.ي</span>
            </div>
          </div>

          <div
            className={`p-5 rounded-2xl border transition-all hover:scale-[1.01] ${
              isDarkMode ? 'bg-[#121926] border-slate-800' : 'bg-white border-slate-200 shadow-sm'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className={`text-xs font-bold ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                صافي المبيعات
              </span>
              <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <div className="text-xl md:text-2xl font-black tracking-tight text-emerald-500">
              +{totalSales.toLocaleString()} <span className="text-xs font-normal opacity-70">ر.ي</span>
            </div>
          </div>

          <div
            className={`p-5 rounded-2xl border transition-all hover:scale-[1.01] ${
              isDarkMode ? 'bg-[#121926] border-slate-800' : 'bg-white border-slate-200 shadow-sm'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className={`text-xs font-bold ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                إجمالي السحوبات
              </span>
              <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
                <ArrowUpRight className="w-4 h-4" />
              </div>
            </div>
            <div className="text-xl md:text-2xl font-black tracking-tight text-amber-500">
              -{totalWithdrawals.toLocaleString()} <span className="text-xs font-normal opacity-70">ر.ي</span>
            </div>
          </div>

          <div
            className={`p-5 rounded-2xl border transition-all hover:scale-[1.01] ${
              isDarkMode ? 'bg-[#121926] border-slate-800' : 'bg-white border-slate-200 shadow-sm'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className={`text-xs font-bold ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                الرصيد الختامي
              </span>
              <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center">
                <Wallet className="w-4 h-4" />
              </div>
            </div>
            <div className={`text-xl md:text-2xl font-black tracking-tight ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>
              {closingBalance.toLocaleString()} <span className="text-xs font-normal text-slate-400">ر.ي</span>
            </div>
          </div>
        </div>

        {/* Green Export PDF Banner */}
        <div className="rounded-2xl p-5 bg-emerald-950/80 border border-emerald-800/80 text-emerald-100 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg">
          <div className="space-y-1 text-right w-full sm:w-auto">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-300 flex items-center justify-center">
                <Download className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-black text-emerald-300">تصدير PDF وتوثيق الكشف</h3>
            </div>
            <p className="text-xs text-emerald-200/80">
              تصدير كشف الحساب كملف PDF شامل حسب الفلاتر والنطاق الزمني الحالي.
            </p>
          </div>

          <button
            onClick={handleExportPDF}
            disabled={isExporting}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs transition-all shadow-lg shadow-emerald-900/50 cursor-pointer flex items-center justify-center gap-2 shrink-0 disabled:opacity-70"
          >
            {isExporting ? <Loader2 className="w-4 h-4 animate-spin text-slate-950" /> : <FileText className="w-4 h-4" />}
            <span>{isExporting ? 'جاري التوليد...' : 'تصدير ملف PDF'}</span>
          </button>
        </div>

        {/* Main Tabs Navigation */}
        <div className="border-b border-slate-700/50 flex items-center gap-6">
          <button
            onClick={() => setActiveTab('details')}
            className={`pb-3 text-xs md:text-sm font-black transition-all flex items-center gap-2 cursor-pointer relative ${
              activeTab === 'details'
                ? 'text-blue-500 border-b-2 border-blue-500'
                : isDarkMode
                ? 'text-slate-400 hover:text-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <List className="w-4 h-4" />
            <span>تفاصيل المعاملات ({filteredTransactions.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('summary')}
            className={`pb-3 text-xs md:text-sm font-black transition-all flex items-center gap-2 cursor-pointer relative ${
              activeTab === 'summary'
                ? 'text-blue-500 border-b-2 border-blue-500'
                : isDarkMode
                ? 'text-slate-400 hover:text-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>الملخص والإحصائيات</span>
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'details' ? (
          filteredTransactions.length > 0 ? (
            <div
              className={`rounded-2xl border overflow-hidden transition-all shadow-md ${
                isDarkMode ? 'bg-[#121926] border-slate-800' : 'bg-white border-slate-200'
              }`}
            >
              <div className="overflow-x-auto">
                <table className="w-full text-right text-xs font-medium">
                  <thead>
                    <tr
                      className={`border-b ${
                        isDarkMode
                          ? 'bg-[#182232] border-slate-800 text-slate-400'
                          : 'bg-slate-50 border-slate-200 text-slate-600'
                      }`}
                    >
                      <th className="py-3 px-4 font-bold">التاريخ والوقت</th>
                      <th className="py-3 px-4 font-bold">نوع المعاملة</th>
                      <th className="py-3 px-4 font-bold">المزود / التفاصيل</th>
                      <th className="py-3 px-4 font-bold">رقم المرجع</th>
                      <th className="py-3 px-4 font-bold">المبلغ</th>
                      <th className="py-3 px-4 font-bold">الرصيد بعد</th>
                      <th className="py-3 px-4 font-bold">الحالة</th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y ${isDarkMode ? 'divide-slate-800' : 'divide-slate-100'}`}>
                    {filteredTransactions.map((tx) => (
                      <tr
                        key={tx.id}
                        className={`transition-colors ${
                          isDarkMode ? 'hover:bg-slate-800/40' : 'hover:bg-slate-50'
                        }`}
                      >
                        <td className="py-3.5 px-4 font-mono text-[11px] whitespace-nowrap">
                          <span className="block font-bold">{tx.date}</span>
                          <span className="text-slate-400 text-[10px]">{tx.time}</span>
                        </td>
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold ${
                              tx.type === 'sale'
                                ? 'bg-emerald-500/10 text-emerald-400'
                                : tx.type === 'withdrawal'
                                ? 'bg-amber-500/10 text-amber-400'
                                : 'bg-purple-500/10 text-purple-400'
                            }`}
                          >
                            {tx.type === 'sale' && <TrendingUp className="w-3 h-3" />}
                            {tx.type === 'withdrawal' && <ArrowUpRight className="w-3 h-3" />}
                            {tx.type === 'commission' && <Coins className="w-3 h-3" />}
                            {tx.typeLabel}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-bold">
                          <div>{tx.provider}</div>
                          {tx.category && <div className="text-[10px] text-slate-400 font-normal">{tx.category}</div>}
                        </td>
                        <td className="py-3.5 px-4 font-mono text-[11px] text-slate-400">{tx.reference}</td>
                        <td className="py-3.5 px-4 font-extrabold font-mono text-xs whitespace-nowrap">
                          <span className={(tx.amount ?? 0) > 0 ? 'text-emerald-500' : 'text-amber-500'}>
                            {(tx.amount ?? 0) > 0 ? `+${(tx.amount ?? 0).toLocaleString()}` : (tx.amount ?? 0).toLocaleString()} ر.ي
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-bold font-mono text-slate-300">
                          {(tx.balanceAfter ?? 0).toLocaleString()} ر.ي
                        </td>
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md">
                            <CheckCircle2 className="w-3 h-3" />
                            {tx.statusLabel}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div
              className={`rounded-2xl p-16 border text-center transition-all flex flex-col items-center justify-center min-h-[250px] ${
                isDarkMode ? 'bg-[#121926] border-slate-800 text-slate-300' : 'bg-white border-slate-200 text-slate-700'
              }`}
            >
              <div className="w-14 h-14 rounded-2xl bg-blue-500/10 text-blue-400 flex items-center justify-center mb-3">
                <Inbox className="w-7 h-7" />
              </div>
              <p className={`text-xs font-bold mb-3 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                لا توجد معاملات تلبّي الشروط في هذه الفترة
              </p>
              <button
                onClick={() => {
                  setTxType('all');
                  setProvider('all');
                  setSearchQuery('');
                  setQuickPeriod('current_month');
                }}
                className="text-xs font-bold text-blue-500 hover:underline cursor-pointer flex items-center gap-1"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>إعادة ضبط الفلاتر</span>
              </button>
            </div>
          )
        ) : (
          <div className="space-y-6">
            {/* Sub Tabs Bar */}
            <div className="flex items-center gap-2 text-xs font-bold">
              {[
                { id: 'day', label: 'اليوم' },
                { id: 'category', label: 'الفئة' },
                { id: 'provider', label: 'المزود' },
                { id: 'type', label: 'النوع' },
              ].map((subTab) => (
                <button
                  key={subTab.id}
                  onClick={() => setSummarySubTab(subTab.id as any)}
                  className={`px-3.5 py-1.5 rounded-xl transition-all cursor-pointer ${
                    summarySubTab === subTab.id
                      ? 'bg-blue-600 text-white font-black'
                      : isDarkMode
                      ? 'bg-[#141d2b] hover:bg-[#1f2b3e] text-slate-300 border border-slate-800'
                      : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
                  }`}
                >
                  {subTab.label}
                </button>
              ))}
            </div>

            {/* Summary Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div
                className={`p-5 rounded-2xl border ${
                  isDarkMode ? 'bg-[#121926] border-slate-800' : 'bg-white border-slate-200 shadow-sm'
                }`}
              >
                <div className="flex items-center gap-2 mb-3 text-xs font-bold text-blue-400">
                  <Banknote className="w-4 h-4" />
                  <span>مبيعات جيب (Jaib)</span>
                </div>
                <div className="text-xl font-black mb-1">1,000 ر.ي</div>
                <div className="text-[11px] text-slate-400">1 عملية ناجحة</div>
              </div>

              <div
                className={`p-5 rounded-2xl border ${
                  isDarkMode ? 'bg-[#121926] border-slate-800' : 'bg-white border-slate-200 shadow-sm'
                }`}
              >
                <div className="flex items-center gap-2 mb-3 text-xs font-bold text-indigo-400">
                  <Coins className="w-4 h-4" />
                  <span>مبيعات تداولات</span>
                </div>
                <div className="text-xl font-black mb-1">500 ر.ي</div>
                <div className="text-[11px] text-slate-400">1 عملية ناجحة</div>
              </div>

              <div
                className={`p-5 rounded-2xl border ${
                  isDarkMode ? 'bg-[#121926] border-slate-800' : 'bg-white border-slate-200 shadow-sm'
                }`}
              >
                <div className="flex items-center gap-2 mb-3 text-xs font-bold text-amber-400">
                  <ArrowUpRight className="w-4 h-4" />
                  <span>السحوبات المكتملة</span>
                </div>
                <div className="text-xl font-black mb-1 text-amber-500">5,000 ر.ي</div>
                <div className="text-[11px] text-slate-400">سحب يدوي إلى محفظة جيب</div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Official Financial Statement Document Printable Template (High-Res A4) */}
      <div
        style={{
          position: 'fixed',
          left: '-9999px',
          top: '0px',
          width: '800px',
          overflow: 'hidden',
          zIndex: -9999,
          pointerEvents: 'none',
          backgroundColor: '#ffffff',
        }}
      >
        <div
          ref={pdfTemplateRef}
          id="official-pdf-statement"
          dir="rtl"
          style={{
            width: '800px',
            padding: '36px',
            backgroundColor: '#ffffff',
            color: '#0f172a',
            fontFamily: "'Cairo', sans-serif",
            boxSizing: 'border-box',
          }}
        >
          {/* Top Header Banner */}
          <div style={{ borderBottom: '2px solid #0f172a', paddingBottom: '16px', marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <img 
                  src="/logos/logo-light.png" 
                  alt="Card Box Logo" 
                  style={{ width: '48px', height: '48px', objectFit: 'contain' }}
                />
                <div>
                  <h1 style={{ fontSize: '20px', fontWeight: '900', margin: '0', color: '#0f172a' }}>Card Box - اليمن</h1>
                  <p style={{ fontSize: '12px', fontWeight: 'bold', margin: '2px 0 0 0', color: '#475569' }}>كشف حساب مالي تفصيلي ورسمي لمالك الشبكة</p>
                </div>
              </div>

              <div style={{ textAlign: 'center' }}>
                <span style={{ backgroundColor: '#0f172a', color: '#ffffff', padding: '6px 14px', borderRadius: '8px', fontSize: '13px', fontWeight: '900', display: 'inline-block' }}>
                  كشف حساب مالي
                </span>
                <p style={{ fontSize: '10px', fontWeight: 'bold', margin: '4px 0 0 0', color: '#64748b' }}>
                  الرقم المرجعي: STM-{networkCode}-2026
                </p>
              </div>

              <div style={{ textAlign: 'left', fontSize: '11px', color: '#475569', fontWeight: 'bold', lineHeight: '1.5' }}>
                <div>تاريخ الإصدار: <strong style={{ color: '#0f172a' }}>{new Date().toLocaleDateString('ar-YE')}</strong></div>
                <div>وقت الإصدار: <strong style={{ color: '#0f172a' }}>{new Date().toLocaleTimeString('ar-YE', { hour: '2-digit', minute: '2-digit' })}</strong></div>
                <div>حالة المستند: <strong style={{ color: '#15803d' }}>معتمد رسمياً ✓</strong></div>
              </div>
            </div>
          </div>

          {/* Network & Period Info */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
            <div style={{ padding: '14px', borderRadius: '12px', backgroundColor: '#f8fafc', border: '1px solid #cbd5e1', fontSize: '12px' }}>
              <div style={{ fontWeight: '900', color: '#0f172a', borderBottom: '1px solid #e2e8f0', paddingBottom: '6px', marginBottom: '8px', display: 'flex', justifyContent: 'space-between' }}>
                <span>بيانات الشبكة والمالك</span>
                <span style={{ fontSize: '10px', backgroundColor: '#dbeafe', color: '#1e40af', padding: '2px 6px', borderRadius: '4px' }}>حساب نشط</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}><span style={{ color: '#64748b' }}>اسم الشبكة:</span> <strong>{networkName}</strong></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}><span style={{ color: '#64748b' }}>كود الشبكة:</span> <strong>{networkCode}</strong></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}><span style={{ color: '#64748b' }}>مالك الشبكة:</span> <strong>{ownerName}</strong></div>
            </div>

            <div style={{ padding: '14px', borderRadius: '12px', backgroundColor: '#f8fafc', border: '1px solid #cbd5e1', fontSize: '12px' }}>
              <div style={{ fontWeight: '900', color: '#0f172a', borderBottom: '1px solid #e2e8f0', paddingBottom: '6px', marginBottom: '8px' }}>
                بيانات الفترة المحددة
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}><span style={{ color: '#64748b' }}>الفترة من:</span> <strong>{fromDate}</strong></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}><span style={{ color: '#64748b' }}>الفترة إلى:</span> <strong>{toDate}</strong></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}><span style={{ color: '#64748b' }}>إجمالي الحركات:</span> <strong>{filteredTransactions.length} حركة مالية</strong></div>
            </div>
          </div>

          {/* Financial Summary Table */}
          <div style={{ marginBottom: '20px' }}>
            <h3 style={{ fontSize: '13px', fontWeight: '900', color: '#0f172a', marginBottom: '8px' }}>ملخص الرصيد المالي للفترة</h3>
            <table style={{ width: '100%', fontSize: '12px', textAlign: 'right', borderCollapse: 'collapse', border: '1px solid #cbd5e1' }}>
              <thead>
                <tr style={{ backgroundColor: '#0f172a', color: '#ffffff', fontWeight: 'bold' }}>
                  <th style={{ padding: '8px', border: '1px solid #334155' }}>الرصيد الافتتاحي</th>
                  <th style={{ padding: '8px', border: '1px solid #334155' }}>المبيعات والعمولات (+)</th>
                  <th style={{ padding: '8px', border: '1px solid #334155' }}>إجمالي المسحوبات (-)</th>
                  <th style={{ padding: '8px', border: '1px solid #334155', backgroundColor: '#1e3a8a' }}>الرصيد الختامي الصافي</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ fontWeight: 'bold', backgroundColor: '#f8fafc' }}>
                  <td style={{ padding: '10px', border: '1px solid #cbd5e1' }}>{computedOpeningBalance.toLocaleString()} ر.ي</td>
                  <td style={{ padding: '10px', border: '1px solid #cbd5e1', color: '#15803d' }}>+{totalSales.toLocaleString()} ر.ي</td>
                  <td style={{ padding: '10px', border: '1px solid #cbd5e1', color: '#b91c1c' }}>-{totalWithdrawals.toLocaleString()} ر.ي</td>
                  <td style={{ padding: '10px', border: '1px solid #cbd5e1', backgroundColor: '#eff6ff', color: '#1e40af', fontSize: '14px' }}>{closingBalance.toLocaleString()} ر.ي</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Detailed Itemized Transactions Table */}
          <div style={{ marginBottom: '30px' }}>
            <h3 style={{ fontSize: '13px', fontWeight: '900', color: '#0f172a', marginBottom: '8px' }}>جدول حركات الحساب التفصيلية</h3>
            <table style={{ width: '100%', fontSize: '11px', textAlign: 'right', borderCollapse: 'collapse', border: '1px solid #cbd5e1' }}>
              <thead>
                <tr style={{ backgroundColor: '#1e293b', color: '#ffffff', fontWeight: 'bold' }}>
                  <th style={{ padding: '8px', border: '1px solid #475569', textAlign: 'center', width: '30px' }}>م</th>
                  <th style={{ padding: '8px', border: '1px solid #475569' }}>التاريخ والوقت</th>
                  <th style={{ padding: '8px', border: '1px solid #475569' }}>نوع الحركة</th>
                  <th style={{ padding: '8px', border: '1px solid #475569' }}>البيان والمزود</th>
                  <th style={{ padding: '8px', border: '1px solid #475569' }}>الرقم المرجعي</th>
                  <th style={{ padding: '8px', border: '1px solid #475569', textAlign: 'center' }}>المبلغ</th>
                  <th style={{ padding: '8px', border: '1px solid #475569', textAlign: 'center' }}>الرصيد المتبقي</th>
                  <th style={{ padding: '8px', border: '1px solid #475569', textAlign: 'center' }}>الحالة</th>
                </tr>
              </thead>
              <tbody>
                {filteredTransactions.map((tx, idx) => (
                  <tr key={tx.id} style={{ backgroundColor: idx % 2 === 0 ? '#ffffff' : '#f8fafc' }}>
                    <td style={{ padding: '8px', border: '1px solid #cbd5e1', textAlign: 'center', fontWeight: 'bold' }}>{idx + 1}</td>
                    <td style={{ padding: '8px', border: '1px solid #cbd5e1' }}>{tx.date} - {tx.time}</td>
                    <td style={{ padding: '8px', border: '1px solid #cbd5e1', fontWeight: 'bold' }}>
                      {tx.type === 'sale' ? 'مبيعات كروت' : tx.type === 'withdrawal' ? 'سحب رصيد' : 'عمولة فئة'}
                    </td>
                    <td style={{ padding: '8px', border: '1px solid #cbd5e1' }}>{tx.provider} ({tx.category})</td>
                    <td style={{ padding: '8px', border: '1px solid #cbd5e1', fontFamily: 'monospace' }}>{tx.reference}</td>
                    <td style={{ padding: '8px', border: '1px solid #cbd5e1', textAlign: 'center', fontWeight: 'bold', color: (tx.amount ?? 0) > 0 ? '#15803d' : '#b91c1c' }}>
                      {(tx.amount ?? 0) > 0 ? `+${(tx.amount ?? 0).toLocaleString()}` : (tx.amount ?? 0).toLocaleString()} ر.ي
                    </td>
                    <td style={{ padding: '8px', border: '1px solid #cbd5e1', textAlign: 'center', fontWeight: 'bold' }}>
                      {(tx.balanceAfter ?? 0).toLocaleString()} ر.ي
                    </td>
                    <td style={{ padding: '8px', border: '1px solid #cbd5e1', textAlign: 'center', fontWeight: 'bold', color: '#15803d' }}>
                      مكتمل
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Document Footer, Signatures & Stamp */}
          <div style={{ paddingTop: '20px', borderTop: '2px solid #cbd5e1', marginTop: '30px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', textAlign: 'center', fontSize: '11px' }}>
              <div>
                <p style={{ fontWeight: 'bold', color: '#334155', marginBottom: '36px' }}>توقيع مالك الشبكة</p>
                <div style={{ borderBottom: '1px dashed #94a3b8', width: '80%', margin: '0 auto 4px auto' }}></div>
                <p style={{ fontSize: '10px', color: '#64748b' }}>{ownerName}</p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ width: '90px', height: '90px', borderRadius: '50%', border: '2px dashed #1e40af', padding: '4px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: '#eff6ff', fontSize: '9px', fontWeight: 'bold', color: '#1e3a8a' }}>
                  <span>Card Box</span>
                  <span style={{ color: '#dc2626', fontWeight: '900', fontSize: '10px', margin: '2px 0' }}>اعتماد مالي</span>
                  <span>{networkName}</span>
                </div>
              </div>

              <div>
                <p style={{ fontWeight: 'bold', color: '#334155', marginBottom: '36px' }}>توقيع إدارة الحسابات</p>
                <div style={{ borderBottom: '1px dashed #94a3b8', width: '80%', margin: '0 auto 4px auto' }}></div>
                <p style={{ fontSize: '10px', color: '#64748b' }}>Card Box</p>
              </div>
            </div>

            <div style={{ textAlign: 'center', fontSize: '10px', color: '#64748b', marginTop: '20px', paddingTop: '8px', borderTop: '1px solid #e2e8f0' }}>
              مستند إلكتروني رسمي صادر عن Card Box. يعتبر هذا الكشف معتمداً إلكترونياً بين الطرفين.
            </div>
          </div>
        </div>
      </div>

      {/* Official Document Preview Modal */}
      {showDocumentPreview && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-4xl w-full p-6 text-slate-900 shadow-2xl my-8 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-blue-600" />
                <h3 className="font-extrabold text-base">معاينة وثيقة كشف الحساب الرسمية</h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleExportPDF}
                  disabled={isExporting}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs transition-all shadow-md flex items-center gap-2 cursor-pointer disabled:opacity-70"
                >
                  {isExporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                  <span>تصدير PDF الآن</span>
                </button>
                <button
                  onClick={() => setShowDocumentPreview(false)}
                  className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer"
                >
                  إغلاق
                </button>
              </div>
            </div>

            {/* A4 Document Content Preview Box */}
            <div className="p-4 bg-slate-100 rounded-xl border flex justify-center overflow-x-auto">
              <div className="bg-white p-8 rounded border shadow-md w-[750px] min-h-[950px] text-right space-y-6 text-slate-900 font-['Cairo',sans-serif]">
                {/* Header */}
                <div className="border-b-2 border-slate-900 pb-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img 
                      src="/logos/logo-light.png" 
                      alt="Card Box Logo" 
                      className="w-12 h-12 object-contain"
                    />
                    <div>
                      <h1 className="text-lg font-black text-slate-900">Card Box - اليمن</h1>
                      <p className="text-xs font-bold text-slate-500">كشف حساب مالي تفصيلي ورسمي</p>
                    </div>
                  </div>
                  <div className="text-center">
                    <span className="bg-slate-900 text-white px-3 py-1 rounded text-xs font-black">كشف حساب مالي</span>
                    <p className="text-[10px] text-slate-500 font-bold mt-1">كود: {networkCode}</p>
                  </div>
                  <div className="text-left text-xs font-bold text-slate-600">
                    <div>تاريخ: {new Date().toLocaleDateString('ar-YE')}</div>
                    <div className="text-emerald-700">معتمد رسمياً ✓</div>
                  </div>
                </div>

                {/* Info Boxes */}
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                    <h4 className="font-extrabold text-slate-900 border-b pb-1">بيانات الشبكة والمالك</h4>
                    <p>الشبكة: <strong>{networkName}</strong></p>
                    <p>المالك: <strong>{ownerName}</strong></p>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                    <h4 className="font-extrabold text-slate-900 border-b pb-1">فترة الكشف</h4>
                    <p>من: <strong>{fromDate}</strong> إلى: <strong>{toDate}</strong></p>
                    <p>عدد الحركات: <strong>{filteredTransactions.length} حركة</strong></p>
                  </div>
                </div>

                {/* Financial Totals */}
                <div>
                  <h4 className="text-xs font-extrabold text-slate-900 mb-2">الملخص المالي للفترة</h4>
                  <table className="w-full text-xs text-right border-collapse border border-slate-300">
                    <thead>
                      <tr className="bg-slate-900 text-white">
                        <th className="p-2 border border-slate-700">الرصيد الافتتاحي</th>
                        <th className="p-2 border border-slate-700">المبيعات (+)</th>
                        <th className="p-2 border border-slate-700">المسحوبات (-)</th>
                        <th className="p-2 border border-slate-700 bg-blue-900">الرصيد الختامي</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="font-extrabold bg-slate-50">
                        <td className="p-2 border border-slate-300">{computedOpeningBalance.toLocaleString()} ر.ي</td>
                        <td className="p-2 border border-slate-300 text-emerald-700">+{totalSales.toLocaleString()} ر.ي</td>
                        <td className="p-2 border border-slate-300 text-red-700">-{totalWithdrawals.toLocaleString()} ر.ي</td>
                        <td className="p-2 border border-slate-300 bg-blue-50 text-blue-900">{closingBalance.toLocaleString()} ر.ي</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Table */}
                <div>
                  <h4 className="text-xs font-extrabold text-slate-900 mb-2">حركات الحساب التفصيلية</h4>
                  <table className="w-full text-[11px] text-right border-collapse border border-slate-300">
                    <thead>
                      <tr className="bg-slate-800 text-white font-bold">
                        <th className="p-1.5 border border-slate-700 text-center">م</th>
                        <th className="p-1.5 border border-slate-700">التاريخ</th>
                        <th className="p-1.5 border border-slate-700">النوع</th>
                        <th className="p-1.5 border border-slate-700">البيان</th>
                        <th className="p-1.5 border border-slate-700 text-center">المبلغ</th>
                        <th className="p-1.5 border border-slate-700 text-center">الرصيد المتبقي</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredTransactions.map((tx, idx) => (
                        <tr key={tx.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                          <td className="p-1.5 border border-slate-300 text-center font-bold">{idx + 1}</td>
                          <td className="p-1.5 border border-slate-300">{tx.date}</td>
                          <td className="p-1.5 border border-slate-300 font-bold">{tx.type === 'sale' ? 'مبيعات' : tx.type === 'withdrawal' ? 'سحب' : 'عمولة'}</td>
                          <td className="p-1.5 border border-slate-300">{tx.provider}</td>
                          <td className={`p-1.5 border border-slate-300 text-center font-bold ${(tx.amount ?? 0) > 0 ? 'text-emerald-700' : 'text-red-700'}`}>
                            {(tx.amount ?? 0) > 0 ? `+${(tx.amount ?? 0).toLocaleString()}` : (tx.amount ?? 0).toLocaleString()} ر.ي
                          </td>
                          <td className="p-1.5 border border-slate-300 text-center font-bold">{(tx.balanceAfter ?? 0).toLocaleString()} ر.ي</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Footer Signatures */}
                <div className="pt-6 border-t border-slate-300 grid grid-cols-3 gap-4 text-center text-xs">
                  <div>
                    <p className="font-bold text-slate-700 mb-8">توقيع المالك</p>
                    <div className="border-b border-dashed border-slate-400 w-3/4 mx-auto"></div>
                  </div>
                  <div className="flex flex-col items-center justify-center">
                    <div className="w-16 h-16 rounded-full border border-dashed border-blue-800 text-blue-900 p-1 flex flex-col items-center justify-center text-[8px] font-black bg-blue-50">
                      <span>منصة الكروت</span>
                      <span className="text-red-600 font-bold">اعتماد مالي</span>
                    </div>
                  </div>
                  <div>
                    <p className="font-bold text-slate-700 mb-8">إدارة الحسابات</p>
                    <div className="border-b border-dashed border-slate-400 w-3/4 mx-auto"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
