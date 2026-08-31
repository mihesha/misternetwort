import React, { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Search,
  Filter,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Trash2,
  Copy,
  Download,
  Loader2,
  CreditCard,
  RefreshCw,
  X,
  ChevronDown,
  Activity,
  Layers,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  History,
  CalendarDays,
  CalendarRange,
  Clock,
  SlidersHorizontal
} from 'lucide-react';

interface CardsManagementViewProps {
  isDarkMode: boolean;
  ownerName?: string;
  networkName?: string;
  networkCode?: string;
  networkId?: string | number;
  globalUpdateTick?: number;
}

const CustomDropdown = ({ options, value, onChange, isDarkMode }: { options: {value: string, label: string}[], value: string, onChange: (val: string) => void, isDarkMode: boolean }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedOption = options.find(opt => opt.value === value);

  return (
    <div className="relative" ref={dropdownRef}>
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full rounded-xl py-2.5 px-4 pl-10 text-sm font-bold cursor-pointer flex items-center justify-between transition-all border ${isDarkMode ? 'bg-[#182232] text-white border-slate-700 hover:border-blue-500' : 'bg-slate-50 text-slate-900 border-slate-300 hover:border-blue-500 shadow-sm'}`}
      >
        <span className="truncate">{selectedOption ? selectedOption.label : 'اختر'}</span>
        <ChevronDown className={`w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 transition-transform duration-300 ${isOpen ? 'rotate-180 text-blue-500' : (isDarkMode ? 'text-slate-400' : 'text-slate-500')}`} />
      </div>
      
      {isOpen && (
        <div className={`absolute z-50 w-full mt-2 rounded-xl border shadow-xl max-h-60 overflow-y-auto custom-scrollbar animate-in fade-in zoom-in-95 duration-200 ${isDarkMode ? 'bg-[#1e293b] border-slate-700 shadow-black/50' : 'bg-white border-slate-200 shadow-slate-200/50'}`}>
          <div className="p-1.5 flex flex-col gap-1">
            {options.map((opt) => (
              <div
                key={opt.value}
                onClick={() => { onChange(opt.value); setIsOpen(false); }}
                className={`px-3 py-2.5 rounded-lg text-sm font-bold cursor-pointer transition-colors flex items-center gap-2 ${value === opt.value ? (isDarkMode ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-50 text-blue-600') : (isDarkMode ? 'text-slate-300 hover:bg-slate-800' : 'text-slate-700 hover:bg-slate-100')}`}
              >
                {value === opt.value ? <CheckCircle2 className="w-4 h-4 text-current shrink-0" /> : <div className="w-4 h-4 shrink-0" />}
                <span className="truncate">{opt.label}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const ModernDatePicker = ({ value, onChange, isDarkMode, placeholder }: { value: string, onChange: (val: string) => void, isDarkMode: boolean, placeholder: string }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  
  useEffect(() => {
    if (value) {
      const d = new Date(value);
      if (!isNaN(d.getTime())) setCurrentMonth(d);
    }
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay();
  
  const handlePrevMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  const handleNextMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));

  const handleDateClick = (day: number) => {
    const newDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    const offset = newDate.getTimezoneOffset();
    newDate.setMinutes(newDate.getMinutes() - offset);
    const dateStr = newDate.toISOString().split('T')[0];
    onChange(dateStr);
    setIsOpen(false);
  };

  const monthNames = ["يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو", "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"];

  return (
    <div className="relative" ref={dropdownRef}>
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full rounded-xl py-2.5 px-4 text-sm font-bold cursor-pointer flex items-center justify-between transition-all border ${isDarkMode ? 'bg-[#182232] text-white border-slate-700 hover:border-blue-500' : 'bg-slate-50 text-slate-900 border-slate-300 hover:border-blue-500 shadow-sm'}`}
      >
        <div className="flex items-center gap-2">
          <Calendar className={`w-4 h-4 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`} />
          <span className={value ? 'font-mono' : 'text-slate-500'} dir="ltr">{value ? value.replace(/-/g, '/') : placeholder}</span>
        </div>
      </div>
      
      {isOpen && (
        <div className={`absolute z-50 w-[280px] mt-2 rounded-2xl border shadow-2xl p-4 animate-in fade-in zoom-in-95 duration-200 ${isDarkMode ? 'bg-[#1e293b] border-slate-700 shadow-black/50' : 'bg-white border-slate-200 shadow-slate-200/50'}`} style={{ right: 0 }}>
          <div className="flex items-center justify-between mb-4">
            <button type="button" onClick={handleNextMonth} className={`p-1.5 rounded-lg transition-colors ${isDarkMode ? 'hover:bg-slate-700 text-slate-300' : 'hover:bg-slate-100 text-slate-700'}`}>
              <ChevronRight className="w-5 h-5" />
            </button>
            <div className="font-bold text-sm">
              {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
            </div>
            <button type="button" onClick={handlePrevMonth} className={`p-1.5 rounded-lg transition-colors ${isDarkMode ? 'hover:bg-slate-700 text-slate-300' : 'hover:bg-slate-100 text-slate-700'}`}>
              <ChevronLeft className="w-5 h-5" />
            </button>
          </div>
          
          <div className="grid grid-cols-7 gap-1 mb-2 text-center" dir="rtl">
            {['ح', 'ن', 'ث', 'ر', 'خ', 'ج', 'س'].map(d => (
              <div key={d} className={`text-[10px] font-black ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>{d}</div>
            ))}
          </div>
          
          <div className="grid grid-cols-7 gap-1" dir="rtl">
            {Array.from({ length: firstDayOfMonth }).map((_, i) => (
              <div key={`empty-${i}`} />
            ))}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const dateStr = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
              const isSelected = value === dateStr;
              const isToday = new Date().toISOString().split('T')[0] === dateStr;
              
              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => handleDateClick(day)}
                  className={`w-8 h-8 flex items-center justify-center rounded-lg text-xs font-bold transition-all
                    ${isSelected 
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30' 
                      : isToday
                        ? (isDarkMode ? 'bg-slate-700 text-blue-400' : 'bg-blue-50 text-blue-600')
                        : (isDarkMode ? 'hover:bg-slate-700 text-slate-300' : 'hover:bg-slate-100 text-slate-700')
                    }
                  `}
                >
                  <span className="font-mono">{day}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export const CardsManagementView: React.FC<CardsManagementViewProps> = ({
  isDarkMode,
  ownerName = 'المالك',
  networkName = 'الشبكة',
  networkCode = '',
  networkId,
  globalUpdateTick = 0,
}) => {
  const router = useRouter();
  
  // Data State
  const [cards, setCards] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Filtering State
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  
  // Date Filtering State
  const [dateRangeType, setDateRangeType] = useState('all');
  const [customDateFrom, setCustomDateFrom] = useState('');
  const [customDateTo, setCustomDateTo] = useState('');
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 30;

  // Modals & Notifications
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [cardToDelete, setCardToDelete] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchData = async () => {
    if (!networkId) return;
    setIsLoading(true);
    try {
      const token = typeof localStorage !== 'undefined' ? localStorage.getItem('auth_token') : null;
      const headers: Record<string, string> = token ? { 'Authorization': `Bearer ${token}` } : {};
      
      // Fetch Network details to get Categories
      const netRes = await fetch('/api/networks', { headers });
      if (netRes.ok) {
        const nets = await netRes.json();
        const found = nets.find((n: any) => n.id.toString() === networkId.toString());
        if (found && found.card_categories) {
          setCategories(found.card_categories);
        }
      }

      // Fetch Cards
      const cardsRes = await fetch(`/api/admin/networks/${networkId}/cards`, { headers });
      if (cardsRes.ok) {
        const data = await cardsRes.json();
        setCards(data);
      }
    } catch (err) {
      console.error('Failed to fetch cards data', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch Data on Mount
  useEffect(() => {
    fetchData();
  }, [networkId, globalUpdateTick]);

  // Toast Helper
  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  // Actions

  const handleDeleteCard = async () => {
    if (!cardToDelete || !networkId) return;
    setIsDeleting(true);
    try {
      const token = typeof localStorage !== 'undefined' ? localStorage.getItem('auth_token') : null;
      const res = await fetch(`/api/admin/networks/${networkId}/cards/${cardToDelete}`, {
        method: 'DELETE',
        headers: token ? { 'Authorization': `Bearer ${token}` } : ({} as Record<string, string>)
      });
      
      if (res.ok) {
        setCards(prev => prev.filter(c => c.id !== cardToDelete));
        showToast('تم حذف الكرت بنجاح ✓');
      } else {
        const data = await res.json();
        alert(data.error || 'فشل الحذف');
      }
    } catch (e) {
      alert('حدث خطأ في الاتصال');
    } finally {
      setIsDeleting(false);
      setCardToDelete(null);
    }
  };

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter, categoryFilter, dateRangeType, customDateFrom, customDateTo]);

  // Derived filtered cards
  const filteredCards = useMemo(() => {
    return cards.filter(card => {
      // Search
      const matchesSearch = 
        searchQuery === '' || 
        card.card_code?.includes(searchQuery) || 
        card.password?.includes(searchQuery);
        
      if (!matchesSearch) return false;

      // Status
      if (statusFilter !== 'all' && card.status !== statusFilter) return false;

      // Category
      if (categoryFilter !== 'all' && card.card_category_id?.toString() !== categoryFilter) return false;

      // Date Range
      if (dateRangeType !== 'all') {
        const cardDate = new Date(card.created_at);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (dateRangeType === 'today') {
          if (cardDate < today) return false;
        } else if (dateRangeType === 'week') {
          const weekAgo = new Date(today);
          weekAgo.setDate(weekAgo.getDate() - 7);
          if (cardDate < weekAgo) return false;
        } else if (dateRangeType === 'month') {
          const monthAgo = new Date(today);
          monthAgo.setMonth(monthAgo.getMonth() - 1);
          if (cardDate < monthAgo) return false;
        } else if (dateRangeType === 'custom') {
          if (customDateFrom) {
            const from = new Date(customDateFrom);
            from.setHours(0, 0, 0, 0);
            if (cardDate < from) return false;
          }
          if (customDateTo) {
            const to = new Date(customDateTo);
            to.setHours(23, 59, 59, 999);
            if (cardDate > to) return false;
          }
        }
      }

      return true;
    });
  }, [cards, searchQuery, statusFilter, categoryFilter, dateRangeType, customDateFrom, customDateTo]);

  const totalPages = Math.ceil(filteredCards.length / itemsPerPage);
  const paginatedCards = filteredCards.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const getStatusBadge = (status: string) => {
    if (status === 'available') return <span className="px-2 py-1 rounded bg-emerald-500/10 text-emerald-500 font-bold text-[10px]">متاح</span>;
    if (status === 'sold') return <span className="px-2 py-1 rounded bg-blue-500/10 text-blue-500 font-bold text-[10px]">مباع</span>;
    return <span className="px-2 py-1 rounded bg-slate-500/10 text-slate-500 font-bold text-[10px]">{status}</span>;
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    const d = new Date(dateString);
    return `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')} ${String(d.getHours() % 12 || 12).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')} ${d.getHours() >= 12 ? 'PM' : 'AM'}`;
  };

  // Stats
  const stats = useMemo(() => {
    return {
      total: filteredCards.length,
      available: filteredCards.filter(c => c.status === 'available').length,
      sold: filteredCards.filter(c => c.status === 'sold').length,
    };
  }, [filteredCards]);

  if (isLoading && cards.length === 0) {
    return (
      <div className={`min-h-[60vh] flex flex-col items-center justify-center font-['Cairo',sans-serif] ${isDarkMode ? 'bg-[#0a0f18] text-slate-100' : 'bg-slate-100 text-slate-800'}`}>
        <Loader2 className="w-12 h-12 text-blue-500 animate-spin mb-4" />
        <h2 className="text-xl font-bold">جاري تحميل بيانات الكروت...</h2>
      </div>
    );
  }

  return (
    <div dir="rtl" className={`transition-colors font-['Cairo',sans-serif] ${isDarkMode ? 'bg-[#0a0f18] text-slate-100' : 'bg-slate-100 text-slate-800'}`}>
      
      {toastMsg && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-50 bg-emerald-600 text-white font-extrabold text-sm px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-2 border border-emerald-400 animate-in fade-in slide-in-from-top-5">
          <CheckCircle2 className="w-5 h-5 text-white" />
          <span>{toastMsg}</span>
        </div>
      )}

      <main className="max-w-7xl mx-auto px-4 md:px-8 py-6 space-y-6">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white flex items-center justify-center shadow-lg shadow-blue-600/30">
              <CreditCard className="w-6 h-6" />
            </div>
            <div>
              <h1 className={`text-xl md:text-3xl font-black tracking-wide ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                إدارة الكروت الشاملة
              </h1>
              <p className={`text-xs md:text-sm font-bold mt-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                تصفح، بحث، وفلترة جميع الكروت الخاصة بشبكة ({networkName})
              </p>
            </div>
          </div>
          
          <button 
            onClick={() => fetchData()}
            disabled={isLoading}
            className={`px-4 py-2.5 rounded-xl text-white font-bold text-xs md:text-sm transition-all shadow-md flex items-center gap-2 cursor-pointer ${isLoading ? 'bg-slate-500 opacity-70' : 'bg-blue-600 hover:bg-blue-500 shadow-blue-900/30'}`}
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            <span>تحديث البيانات</span>
          </button>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className={`p-5 rounded-2xl border flex items-center gap-4 shadow-sm ${isDarkMode ? 'bg-[#141d2b] border-slate-800' : 'bg-white border-slate-200'}`}>
            <div className="p-3.5 rounded-xl bg-blue-500/10 text-blue-500">
              <Layers className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-400 mb-1">إجمالي الكروت (حسب الفلتر)</div>
              <div className="text-2xl font-black">{stats.total}</div>
            </div>
          </div>
          <div className={`p-5 rounded-2xl border flex items-center gap-4 shadow-sm ${isDarkMode ? 'bg-[#141d2b] border-slate-800' : 'bg-white border-slate-200'}`}>
            <div className="p-3.5 rounded-xl bg-emerald-500/10 text-emerald-500">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-400 mb-1">الكروت المتاحة</div>
              <div className="text-2xl font-black text-emerald-500">{stats.available}</div>
            </div>
          </div>
          <div className={`p-5 rounded-2xl border flex items-center gap-4 shadow-sm ${isDarkMode ? 'bg-[#141d2b] border-slate-800' : 'bg-white border-slate-200'}`}>
            <div className="p-3.5 rounded-xl bg-amber-500/10 text-amber-500">
              <Activity className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-400 mb-1">الكروت المباعة</div>
              <div className="text-2xl font-black text-blue-500">{stats.sold}</div>
            </div>
          </div>
        </div>

        {/* Low Stock Inventory Alert Box */}
        {(() => {
          const lowStockCats = categories.filter(c => (c.stock || 0) <= 5 && c.status !== 'inactive');
          
          if (lowStockCats.length === 0) return null;

          return (
            <div
              className={`rounded-2xl p-5 border transition-colors shadow-sm ${
                isDarkMode
                  ? 'bg-[#2a1700]/90 border-amber-600/60 text-amber-200'
                  : 'bg-amber-50 border-amber-300 text-amber-900'
              }`}
            >
              <div className="flex items-start gap-3 text-right">
                <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                <div className="space-y-2 flex-1">
                  <h3 className="font-bold text-sm md:text-base">تنبيه: مخزون منخفض</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 text-xs font-semibold mt-2">
                    {lowStockCats.map((cat, idx) => (
                      <div key={idx} className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-between gap-4">
                        <span className="truncate text-amber-600 dark:text-amber-400">فئة "{cat.name || cat.price}" - باقي {cat.stock || 0} كرت فقط</span>
                        <Link href="/owner/import-cards" className="text-amber-500 hover:text-amber-600 dark:hover:text-amber-300 underline font-black cursor-pointer shrink-0 transition-colors">
                          أضف كروت
                        </Link>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          );
        })()}

        {/* Filters Section */}
        <div className={`rounded-2xl border transition-all ${isDarkMode ? 'bg-[#121926] border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`}>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`w-full px-5 py-3.5 flex items-center justify-between text-xs font-black transition-colors cursor-pointer ${showFilters ? 'rounded-t-2xl' : 'rounded-2xl'} ${
              isDarkMode ? 'hover:bg-slate-800/40 text-slate-200' : 'hover:bg-slate-50 text-slate-800'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-xl ${isDarkMode ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-100 text-blue-600'}`}>
                <Filter className="w-4 h-4" />
              </div>
              <span>تصفية وفلترة الكروت</span>
              {(categoryFilter !== 'all' || statusFilter !== 'all' || searchQuery || dateRangeType !== 'all') && (
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse shadow-[0_0_10px_rgba(59,130,246,0.8)]" />
              )}
            </div>
            <div className="flex items-center gap-2 text-slate-400">
              <span className="text-xs font-bold hidden sm:inline">خيارات التصفية والتاريخ</span>
              {showFilters ? <ChevronUp className="w-5 h-5 text-blue-500" /> : <ChevronDown className="w-5 h-5" />}
            </div>
          </button>

          {showFilters && (
            <div className={`p-6 border-t space-y-6 ${isDarkMode ? 'border-slate-800 bg-slate-900/20' : 'border-slate-100 bg-slate-50/50'}`}>
              
              {/* Quick Periods */}
              <div className="flex flex-wrap items-center gap-2">
                <span className={`text-xs font-bold ml-2 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>الفترة:</span>
                {[
                  { id: 'all', label: 'كل الأوقات', icon: History },
                  { id: 'today', label: 'اليوم', icon: Calendar },
                  { id: 'week', label: 'آخر 7 أيام', icon: CalendarRange },
                  { id: 'month', label: 'هذا الشهر', icon: CalendarDays },
                  { id: 'custom', label: 'تخصيص', icon: SlidersHorizontal },
                ].map((period) => {
                  const IconComp = period.icon;
                  return (
                    <button
                      key={period.id}
                      onClick={() => setDateRangeType(period.id)}
                      className={`px-4 py-2 rounded-xl transition-all font-bold text-xs flex items-center gap-1.5 ${
                        dateRangeType === period.id
                          ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30 ring-2 ring-blue-500/50 ring-offset-1 ' + (isDarkMode ? 'ring-offset-slate-900' : 'ring-offset-white')
                          : isDarkMode
                          ? 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
                          : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
                      }`}
                    >
                      <IconComp className={`w-3.5 h-3.5 ${dateRangeType === period.id ? 'text-white' : 'text-blue-500'}`} />
                      <span>{period.label}</span>
                    </button>
                  );
                })}
              </div>

              {dateRangeType === 'custom' && (
                <div className={`p-5 rounded-2xl border animate-in fade-in slide-in-from-top-2 duration-300 shadow-sm ${isDarkMode ? 'bg-slate-800/50 border-blue-500/30' : 'bg-blue-50/50 border-blue-200'}`}>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
                    <div>
                      <label className={`block mb-1.5 text-xs font-bold ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>من تاريخ</label>
                      <ModernDatePicker 
                        value={customDateFrom}
                        onChange={(val) => setCustomDateFrom(val)}
                        isDarkMode={isDarkMode}
                        placeholder="اختر تاريخ البداية"
                      />
                    </div>
                    <div>
                      <label className={`block mb-1.5 text-xs font-bold ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>إلى تاريخ</label>
                      <ModernDatePicker 
                        value={customDateTo}
                        onChange={(val) => setCustomDateTo(val)}
                        isDarkMode={isDarkMode}
                        placeholder="اختر تاريخ النهاية"
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                <div>
                  <label className={`block mb-1.5 text-xs font-bold ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>فئة الكرت</label>
                  <CustomDropdown
                    isDarkMode={isDarkMode}
                    value={categoryFilter}
                    onChange={(val) => setCategoryFilter(val)}
                    options={[
                      { value: 'all', label: 'جميع الفئات' },
                      ...categories.map((c: any) => ({ value: c.id.toString(), label: `${c.name || c.price} - ${c.price} ريال` }))
                    ]}
                  />
                </div>

                <div>
                  <label className={`block mb-1.5 text-xs font-bold ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>حالة الكرت</label>
                  <CustomDropdown
                    isDarkMode={isDarkMode}
                    value={statusFilter}
                    onChange={(val) => setStatusFilter(val)}
                    options={[
                      { value: 'all', label: 'جميع الحالات' },
                      { value: 'available', label: 'متاح' },
                      { value: 'sold', label: 'مباع' }
                    ]}
                  />
                </div>

                <div>
                  <label className={`block mb-1.5 text-xs font-bold ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>البحث الشامل</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="رقم الكرت، كلمة المرور..."
                      className={`w-full rounded-xl py-2.5 pr-10 pl-4 text-xs font-bold focus:outline-none transition-all border ${
                        isDarkMode ? 'bg-[#1b2536] text-white border-slate-700 focus:border-blue-500' : 'bg-slate-50 text-slate-900 border-slate-300 focus:border-blue-500'
                      }`}
                    />
                    <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setDateRangeType('all');
                    setCustomDateFrom('');
                    setCustomDateTo('');
                    setCategoryFilter('all');
                    setStatusFilter('all');
                    setSearchQuery('');
                    setCurrentPage(1);
                  }}
                  className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${isDarkMode ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
                >
                  إعادة ضبط
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Data Table */}
        <div className={`rounded-2xl border overflow-hidden shadow-xl ${isDarkMode ? 'bg-[#141d2b] border-slate-800' : 'bg-white border-slate-200'}`}>
          <div className="overflow-x-auto">
            <table className="w-full text-xs md:text-sm text-right">
              <thead>
                <tr className={`border-b ${isDarkMode ? 'border-slate-800 bg-[#1b2536]/80 text-slate-300' : 'border-slate-200 bg-slate-100 text-slate-600'}`}>
                  <th className="py-4 px-4 font-black">#</th>
                  <th className="py-4 px-4 font-black text-center">رقم الكرت</th>
                  <th className="py-4 px-4 font-black text-center">كلمة المرور</th>
                  <th className="py-4 px-4 font-black text-center">الفئة</th>
                  <th className="py-4 px-4 font-black text-center">الحالة</th>
                  <th className="py-4 px-4 font-black text-center">تاريخ الإضافة</th>
                  <th className="py-4 px-4 font-black text-center">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/40">
                {isLoading ? (
                  <tr>
                    <td colSpan={7} className="py-20 text-center">
                      <Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-500 mb-3" />
                      <span className="text-sm text-slate-400 font-bold">جاري تحميل الكروت...</span>
                    </td>
                  </tr>
                ) : paginatedCards.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-20 text-center flex flex-col items-center justify-center">
                      <Search className="w-10 h-10 text-slate-500/50 mb-3 mx-auto" />
                      <span className="text-sm text-slate-500 font-bold block">لا توجد كروت مطابقة للفلاتر الحالية</span>
                    </td>
                  </tr>
                ) : (
                  paginatedCards.map((card, idx) => (
                    <tr key={card.id} className={`transition-colors ${isDarkMode ? 'hover:bg-slate-800/50 text-slate-300' : 'hover:bg-slate-50 text-slate-700'}`}>
                      <td className="py-3 px-4 font-mono text-[10px] md:text-xs opacity-50 font-bold">
                        {(currentPage - 1) * itemsPerPage + idx + 1}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <span className="font-mono font-bold text-blue-500 bg-blue-500/10 px-2 py-1 rounded">{card.card_code}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-center">
                        {card.password ? (
                          <div className="flex items-center justify-center gap-2">
                            <span className="font-mono font-bold text-slate-200 px-2 py-1 bg-slate-800 rounded">{card.password}</span>
                          </div>
                        ) : (
                          <span className="text-slate-500">-</span>
                        )}
                      </td>
                      <td className="py-3 px-4 font-bold text-center">
                        {card.card_category ? (card.card_category.name || card.card_category.price) : '-'}
                      </td>
                      <td className="py-3 px-4 text-center">
                        {getStatusBadge(card.status)}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span dir="ltr" className={`inline-block font-mono text-[10px] md:text-[11px] font-bold px-2 py-1 rounded-md ${isDarkMode ? 'bg-slate-800/60 text-slate-300' : 'bg-slate-100 text-slate-600'}`}>
                          {formatDate(card.created_at)}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center">
                          {card.status === 'available' ? (
                            <button 
                              onClick={() => setCardToDelete(card.id)}
                              className={`p-2 rounded-xl transition-all cursor-pointer shadow-sm ${isDarkMode ? 'bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20' : 'bg-red-50 hover:bg-red-100 text-red-600 border border-red-200'}`}
                              title="حذف الكرت"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          ) : (
                            <span className="text-[10px] text-slate-500 opacity-60 font-bold px-2 py-1 bg-slate-800/30 rounded">محمي</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className={`flex items-center justify-between p-4 border-t ${isDarkMode ? 'border-slate-800 bg-[#1b2536]/30 text-slate-300' : 'border-slate-200 bg-slate-50 text-slate-700'}`}>
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

      {/* Delete Modal */}
      {cardToDelete !== null && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className={`w-full max-w-sm rounded-2xl p-6 border shadow-2xl relative animate-in zoom-in-95 ${isDarkMode ? 'bg-[#141d2b] border-slate-700' : 'bg-white border-slate-200'}`}>
            <div className="flex justify-center mb-4">
              <div className="p-4 rounded-full bg-red-500/10 text-red-500">
                <AlertTriangle className="w-10 h-10" />
              </div>
            </div>
            <h3 className={`text-lg md:text-xl font-black mb-2 text-center ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
              تأكيد حذف الكرت
            </h3>
            <p className={`text-xs md:text-sm text-center mb-6 leading-relaxed font-bold ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
              هل أنت متأكد من رغبتك في حذف هذا الكرت بشكل نهائي؟
              هذا الإجراء لا يمكن التراجع عنه.
            </p>
            <div className="flex gap-3">
              <button 
                onClick={handleDeleteCard}
                disabled={isDeleting}
                className="flex-1 bg-red-600 hover:bg-red-500 text-white font-black py-3 rounded-xl transition-colors cursor-pointer text-xs md:text-sm flex items-center justify-center gap-2 shadow-lg shadow-red-900/20"
              >
                {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                <span>نعم، احذف الكرت</span>
              </button>
              <button 
                onClick={() => setCardToDelete(null)}
                disabled={isDeleting}
                className={`flex-1 font-black py-3 rounded-xl transition-colors cursor-pointer text-xs md:text-sm ${isDarkMode ? 'bg-slate-800 hover:bg-slate-700 text-slate-300' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'}`}
              >
                إلغاء الأمر
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
