"use client";
import React, { useEffect, useState, useMemo, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAppContext } from '@/context/AppContext';
import { useOwnerContext } from '@/context/OwnerContext';
import { useOwnerActions } from '@/hooks/useOwnerActions';
import { 
  ArrowRight, User, Phone, Store, 
  TrendingUp, Activity, Filter, 
  BadgeAlert, History, DollarSign, Wallet,
  Calendar, CalendarRange, CalendarDays, Clock,
  SlidersHorizontal, ChevronUp, ChevronDown,
  Search, CheckCircle2, ShieldAlert, CreditCard,
  AlertCircle, ChevronLeft, ChevronRight
} from 'lucide-react';

const toEnglishDigits = (str: string) => {
  return str.replace(/[\u0660-\u0669]/g, (c) => (c.charCodeAt(0) - 0x0660).toString())
            .replace(/[\u06f0-\u06f9]/g, (c) => (c.charCodeAt(0) - 0x06f0).toString());
};

const ModernDatePicker = ({ value, onChange, isDarkMode, placeholder }: { value: string, onChange: (val: string) => void, isDarkMode: boolean, placeholder: string }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
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
        <div className={`absolute z-50 w-[280px] mt-2 rounded-2xl border shadow-2xl p-4 animate-in fade-in zoom-in-95 duration-200 ${isDarkMode ? 'bg-[#1e293b] border-slate-700 shadow-black/50' : 'bg-white border-slate-200 shadow-slate-200/50'}`} style={{ left: 0 }}>
          <div className="flex items-center justify-between mb-4">
            <button type="button" onClick={handlePrevMonth} className={`p-1.5 rounded-lg transition-colors ${isDarkMode ? 'hover:bg-slate-700 text-slate-300' : 'hover:bg-slate-100 text-slate-700'}`}>
              <ChevronRight className="w-5 h-5" />
            </button>
            <div className="font-bold text-sm">
              {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
            </div>
            <button type="button" onClick={handleNextMonth} className={`p-1.5 rounded-lg transition-colors ${isDarkMode ? 'hover:bg-slate-700 text-slate-300' : 'hover:bg-slate-100 text-slate-700'}`}>
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
};


const CustomDropdown = ({ options, value, onChange, isDarkMode }: { options: {value: string, label: string}[], value: string, onChange: (val: string) => void, isDarkMode: boolean }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

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
        className={`w-full rounded-xl py-2.5 px-4 pr-10 text-sm font-bold cursor-pointer flex items-center justify-between transition-all border ${isDarkMode ? 'bg-[#182232] text-white border-slate-700 hover:border-blue-500' : 'bg-slate-50 text-slate-900 border-slate-300 hover:border-blue-500 shadow-sm'}`}
      >
        <span className="truncate">{selectedOption ? selectedOption.label : 'اختر'}</span>
        <ChevronDown className={`w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 transition-transform duration-300 ${isOpen ? 'rotate-180 text-blue-500' : (isDarkMode ? 'text-slate-400' : 'text-slate-500')}`} />
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

export default function OwnerPosDetailsPage() {
  const { isDarkMode } = useAppContext();
  const { networks } = useOwnerContext();
  const { fetchOwnerNetworks } = useOwnerActions();
  const network = networks?.[0];
  const params = useParams();
  const router = useRouter();
  const userId = params.id;

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  
  // Filter States
  const [quickPeriod, setQuickPeriod] = useState<string>('all');
  const [showFilters, setShowFilters] = useState<boolean>(false);
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [category, setCategory] = useState('all');
  const [paymentMethodFilter, setPaymentMethodFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Actions states
  const [modalMode, setModalMode] = useState<'credit' | 'payment' | null>(null);
  const [newCreditLimit, setNewCreditLimit] = useState('');
  const [paymentAmount, setPaymentAmount] = useState('');
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;
  
  // Toast Notification
  const [toast, setToast] = useState<{message: string, type: 'success' | 'error'} | null>(null);
  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  useEffect(() => {
    let mounted = true;
    const init = async () => {
      if (networks.length === 0) {
        await fetchOwnerNetworks();
      }
    };
    init();
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    if (network && userId) {
      fetchData();
    }
  }, [network, userId]);

  const fetchData = async () => {
    if (!network) return;
    setLoading(true);
    try {
      // Always fetch all data, we will filter in frontend like Account Statement
      const res = await fetch(`/api/networks/${network.id}/pos-memberships/${userId}/details?filter=all&_t=${Date.now()}`, {
        cache: 'no-store'
      });
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateCreditLimit = async () => {
    if (!network || !newCreditLimit || !data?.membership) return;
    try {
      const res = await fetch(`/api/networks/${network.id}/pos-memberships/${data.membership.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credit_limit: parseFloat(newCreditLimit) })
      });
      if (res.ok) {
        showToast('تم تحديث السقف المالي بنجاح');
        setModalMode(null);
        setNewCreditLimit('');
        fetchData();
      } else {
        const err = await res.json();
        showToast(err.error || 'حدث خطأ', 'error');
      }
    } catch (e) {
      console.error(e);
      showToast('حدث خطأ غير متوقع', 'error');
    }
  };

  const handlePayDebt = async () => {
    if (!network || !paymentAmount || !data?.membership) return;
    try {
      const res = await fetch(`/api/networks/${network.id}/pos-memberships/${data.membership.id}/pay-debt`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: parseFloat(paymentAmount) })
      });
      if (res.ok) {
        showToast('تم تسجيل السداد بنجاح');
        setModalMode(null);
        setPaymentAmount('');
        fetchData();
      } else {
        const err = await res.json();
        showToast(err.error || 'حدث خطأ', 'error');
      }
    } catch (e) {
      console.error(e);
      showToast('حدث خطأ غير متوقع', 'error');
    }
  };

  const handleQuickPeriodChange = (periodId: string) => {
    setQuickPeriod(periodId);
    const today = new Date();
    const getFormatted = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    
    if (periodId === 'today') {
      setFromDate(getFormatted(today));
      setToDate(getFormatted(today));
    } else if (periodId === 'last_7_days') {
      const past = new Date(today);
      past.setDate(today.getDate() - 6);
      setFromDate(getFormatted(past));
      setToDate(getFormatted(today));
    } else if (periodId === 'current_month') {
      const start = new Date(today.getFullYear(), today.getMonth(), 1);
      const end = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      setFromDate(getFormatted(start));
      setToDate(getFormatted(end));
    } else if (periodId === 'last_month') {
      const start = new Date(today.getFullYear(), today.getMonth() - 1, 1);
      const end = new Date(today.getFullYear(), today.getMonth(), 0);
      setFromDate(getFormatted(start));
      setToDate(getFormatted(end));
    } else if (periodId === 'all') {
      setFromDate('');
      setToDate('');
    }
    setCurrentPage(1);
  };

  // Extract unique categories dynamically from operations
  const uniqueCategories = useMemo(() => {
    if (!data?.operations) return [];
    const cats = new Set<string>();
    data.operations.forEach((op: any) => {
      if (op.category_name) cats.add(op.category_name);
    });
    return Array.from(cats);
  }, [data]);

  // Filtered dataset
  const filteredOperations = useMemo(() => {
    if (!data?.operations) return [];
    let filtered = data.operations.filter((op: any) => {
      // Date filter
      if (fromDate || toDate) {
        // use local date for comparison to match input[type=date] format yyyy-mm-dd
        const opDateStr = new Date(op.purchased_at);
        const opDate = `${opDateStr.getFullYear()}-${String(opDateStr.getMonth() + 1).padStart(2, '0')}-${String(opDateStr.getDate()).padStart(2, '0')}`;
        
        if (fromDate && opDate < fromDate) return false;
        if (toDate && opDate > toDate) return false;
      }
      
      // Category filter
      if (category !== 'all' && op.category_name !== category) {
        return false;
      }

      // Payment Method filter
      if (paymentMethodFilter !== 'all') {
        const isDebt = op.payment_method === 'دين (آجل)';
        if (paymentMethodFilter === 'debt' && !isDebt) return false;
        if (paymentMethodFilter === 'cash' && isDebt) return false;
      }

      // Search filter
      if (
        searchQuery &&
        (!op.reference_number || !op.reference_number.toLowerCase().includes(searchQuery.toLowerCase())) &&
        (!op.card_code || !op.card_code.toLowerCase().includes(searchQuery.toLowerCase()))
      ) {
        return false;
      }
      
      return true;
    });
    
    // Sort by most recent first
    return filtered.sort((a: any, b: any) => new Date(b.purchased_at).getTime() - new Date(a.purchased_at).getTime());
  }, [data, fromDate, toDate, category, paymentMethodFilter, searchQuery]);

  // Filtered settlements
  const filteredSettlements = useMemo(() => {
    if (!data?.settlements) return [];
    let filtered = data.settlements.filter((s: any) => {
      // Date filter
      if (fromDate || toDate) {
        const sDateStr = new Date(s.created_at);
        const sDate = `${sDateStr.getFullYear()}-${String(sDateStr.getMonth() + 1).padStart(2, '0')}-${String(sDateStr.getDate()).padStart(2, '0')}`;
        
        if (fromDate && sDate < fromDate) return false;
        if (toDate && sDate > toDate) return false;
      }
      return true;
    });
    
    // Sort by most recent first
    return filtered.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }, [data, fromDate, toDate]);

  // Pagination for operations
  const totalPages = Math.max(1, Math.ceil(filteredOperations.length / itemsPerPage));
  const paginatedOperations = filteredOperations.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // Dynamic Totals based on filter
  const filteredTotalSales = filteredOperations.reduce((acc: number, op: any) => acc + (op.pos_price || 0), 0);

  if (loading && !data) {
    return (
      <div className={`min-h-[60vh] flex flex-col items-center justify-center font-['Cairo',sans-serif] ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
        <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="font-bold animate-pulse">جاري تحميل بيانات نقطة البيع...</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className={`min-h-[60vh] flex flex-col items-center justify-center font-['Cairo',sans-serif] ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
        <p className="font-bold text-rose-500">حدث خطأ أثناء تحميل البيانات</p>
        <button onClick={() => router.back()} className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg">العودة للوراء</button>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500 font-['Cairo',sans-serif] pb-20 relative">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] animate-in slide-in-from-top-10 fade-in zoom-in-95 duration-300">
          <div className={`px-6 py-3.5 rounded-full shadow-2xl flex items-center gap-3 font-bold text-sm ${toast.type === 'success' ? 'bg-emerald-500 text-white shadow-emerald-500/30' : 'bg-rose-500 text-white shadow-rose-500/30'}`}>
            {toast.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <ShieldAlert className="w-5 h-5" />}
            {toast.message}
          </div>
        </div>
      )}

      {/* Header Banner */}
      <div className={`rounded-3xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden shadow-xl ${isDarkMode ? 'bg-gradient-to-br from-indigo-900/40 to-[#121927] border border-indigo-500/20' : 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white'}`}>
        {!isDarkMode && <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none" />}
        {isDarkMode && <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />}
        
        <div className="flex items-center gap-4 relative z-10">
          <button 
            onClick={() => router.back()} 
            className={`p-3 rounded-2xl transition-all shadow-sm ${isDarkMode ? 'bg-indigo-500/20 text-indigo-400 hover:bg-indigo-500 hover:text-white' : 'bg-white/10 text-white hover:bg-white/20 border border-white/20'}`}
          >
            <ArrowRight className="w-5 h-5" />
          </button>
          <div>
            <h2 className={`text-2xl md:text-3xl font-black flex items-center gap-2 ${isDarkMode ? 'text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400' : 'text-white'}`}>
              <Store className={`w-7 h-7 ${isDarkMode ? 'text-indigo-400' : 'text-indigo-100'}`} />
              {data.user.name}
            </h2>
            <p className={`text-sm mt-1.5 font-bold ${isDarkMode ? 'text-slate-400' : 'text-indigo-200'}`}>
              سجل تفاصيل ومبيعات نقطة البيع لشبكتك
            </p>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-3 relative z-10">
          <button
            onClick={() => { setModalMode('credit'); setNewCreditLimit(data.membership.credit_limit.toString()); }}
            className={`px-5 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 transition-all shadow-lg hover:-translate-y-0.5 ${isDarkMode ? 'bg-blue-500/20 text-blue-400 hover:bg-blue-500 hover:text-white border border-blue-500/30' : 'bg-white text-indigo-700 hover:bg-indigo-50 border border-transparent'}`}
          >
            <CreditCard className="w-4 h-4" />
            تعديل السقف المالي
          </button>
          <button
            onClick={() => { setModalMode('payment'); setPaymentAmount(''); }}
            disabled={data.membership.current_debt <= 0}
            className={`px-5 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 transition-all shadow-lg hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0 disabled:cursor-not-allowed ${isDarkMode ? 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500 hover:text-white border border-emerald-500/30' : 'bg-emerald-500 text-white hover:bg-emerald-400 border border-emerald-400'}`}
          >
            <DollarSign className="w-4 h-4" />
            استلام دفعة سداد
          </button>
        </div>
      </div>

      {/* Overview Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* User Info */}
        <div className={`p-5 rounded-3xl border transition-all hover:shadow-lg ${isDarkMode ? 'bg-[#121927] border-slate-800 hover:border-slate-700' : 'bg-white border-slate-200 hover:border-slate-300'}`}>
          <div className="flex items-center gap-4 mb-4">
            <div className={`p-3.5 rounded-2xl ${isDarkMode ? 'bg-indigo-500/20 text-indigo-400' : 'bg-indigo-50 text-indigo-600'}`}>
              <User className="w-6 h-6" />
            </div>
            <div>
              <p className={`text-xs font-bold mb-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>الاسم التجاري</p>
              <h3 className={`font-black text-sm ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>{data.user.shop_name || 'غير محدد'}</h3>
            </div>
          </div>
          <div className="space-y-3 text-xs font-bold bg-slate-500/5 p-3 rounded-2xl">
            <div className={`flex items-center gap-2 ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
              <Phone className={`w-4 h-4 ${isDarkMode ? 'text-indigo-400' : 'text-indigo-500'}`} />
              <span dir="ltr">{data.user.phone}</span>
            </div>
            <div className={`flex items-center gap-2 ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
              <Activity className={`w-4 h-4 ${isDarkMode ? 'text-indigo-400' : 'text-indigo-500'}`} />
              <span>انضمام: {new Date(data.membership.joined_at).toLocaleDateString('ar-YE')}</span>
            </div>
          </div>
        </div>

        {/* Total Sales Filtered */}
        <div className={`p-5 rounded-3xl border transition-all hover:shadow-lg ${isDarkMode ? 'bg-[#121927] border-slate-800 hover:border-blue-500/30' : 'bg-white border-slate-200 hover:border-blue-300'}`}>
          <div className="flex items-center gap-4 mb-4">
            <div className={`p-3.5 rounded-2xl ${isDarkMode ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-50 text-blue-600'}`}>
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <p className={`text-xs font-bold mb-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>إجمالي مبيعاتك منه</p>
              <h3 className={`font-black text-xl text-transparent bg-clip-text bg-gradient-to-r ${isDarkMode ? 'from-blue-400 to-indigo-400' : 'from-blue-600 to-indigo-600'}`}>
                {filteredTotalSales.toLocaleString()} <span className="text-xs font-bold opacity-70 text-blue-500">ر.ي</span>
              </h3>
            </div>
          </div>
          <p className={`text-[11px] font-bold px-3 py-2 rounded-xl inline-block ${isDarkMode ? 'bg-blue-500/10 text-blue-400' : 'bg-blue-50 text-blue-600'}`}>
            حسب الفلتر ({filteredOperations.length} عملية)
          </p>
        </div>

        {/* Current Debt */}
        <div className={`p-5 rounded-3xl border transition-all hover:shadow-lg ${data.membership.current_debt > 0 ? (isDarkMode ? 'bg-gradient-to-br from-[#121927] to-rose-900/10 border-rose-500/30' : 'bg-gradient-to-br from-white to-rose-50 border-rose-200') : (isDarkMode ? 'bg-gradient-to-br from-[#121927] to-emerald-900/10 border-emerald-500/30' : 'bg-gradient-to-br from-white to-emerald-50 border-emerald-200')}`}>
          <div className="flex items-center gap-4 mb-4">
            <div className={`p-3.5 rounded-2xl ${data.membership.current_debt > 0 ? (isDarkMode ? 'bg-rose-500/20 text-rose-400' : 'bg-rose-100 text-rose-600') : (isDarkMode ? 'bg-emerald-500/20 text-emerald-400' : 'bg-emerald-100 text-emerald-600')}`}>
              <BadgeAlert className="w-6 h-6" />
            </div>
            <div>
              <p className={`text-xs font-bold mb-1 ${data.membership.current_debt > 0 ? (isDarkMode ? 'text-rose-400/80' : 'text-rose-600/80') : (isDarkMode ? 'text-emerald-400/80' : 'text-emerald-600/80')}`}>الديون الحالية (آجل)</p>
              <h3 className={`font-black text-xl text-transparent bg-clip-text bg-gradient-to-r ${data.membership.current_debt > 0 ? (isDarkMode ? 'from-rose-400 to-orange-400' : 'from-rose-600 to-orange-600') : (isDarkMode ? 'from-emerald-400 to-teal-400' : 'from-emerald-600 to-teal-600')}`}>
                {Number(data.membership.current_debt).toLocaleString()} <span className="text-xs font-bold opacity-70 text-current">ر.ي</span>
              </h3>
            </div>
          </div>
          <p className={`text-[11px] font-bold px-3 py-2 rounded-xl inline-block ${data.membership.current_debt > 0 ? (isDarkMode ? 'bg-rose-500/10 text-rose-400' : 'bg-rose-50 text-rose-600') : (isDarkMode ? 'bg-emerald-500/10 text-emerald-400' : 'bg-emerald-50 text-emerald-600')}`}>
            السقف المسموح: {Number(data.membership.credit_limit).toLocaleString()} ر.ي
          </p>
        </div>

        {/* Debt Settlements (Payments) */}
        <div className={`p-5 rounded-3xl border transition-all hover:shadow-lg ${isDarkMode ? 'bg-[#121927] border-slate-800 hover:border-emerald-500/30' : 'bg-white border-slate-200 hover:border-emerald-300'}`}>
          <div className="flex items-center gap-4 mb-4">
            <div className={`p-3.5 rounded-2xl ${isDarkMode ? 'bg-emerald-500/20 text-emerald-400' : 'bg-emerald-50 text-emerald-600'}`}>
              <DollarSign className="w-6 h-6" />
            </div>
            <div>
              <p className={`text-xs font-bold mb-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>سدادات مستلمة (حسب الفلتر)</p>
              <h3 className={`font-black text-xl text-transparent bg-clip-text bg-gradient-to-r ${isDarkMode ? 'from-emerald-400 to-teal-400' : 'from-emerald-500 to-teal-500'}`}>
                {filteredSettlements.reduce((sum: number, s: any) => sum + s.amount, 0).toLocaleString()} <span className="text-xs font-bold opacity-70 text-emerald-500">ر.ي</span>
              </h3>
            </div>
          </div>
          <p className={`text-[11px] font-bold px-3 py-2 rounded-xl inline-block ${isDarkMode ? 'bg-emerald-500/10 text-emerald-400' : 'bg-emerald-50 text-emerald-600'}`}>
            حسب الفلتر ({filteredSettlements.length} دفعة)
          </p>
        </div>
      </div>

      {/* Advanced Filter Panel (Similar to Account Statement) */}
      <div className={`rounded-3xl border transition-all shadow-sm ${isDarkMode ? 'bg-[#121927] border-slate-800' : 'bg-white border-slate-200'}`}>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`w-full px-6 py-4 flex items-center justify-between text-sm font-black transition-colors cursor-pointer ${showFilters ? 'rounded-t-3xl' : 'rounded-3xl'} ${isDarkMode ? 'hover:bg-slate-800/50 text-slate-200' : 'hover:bg-slate-50 text-slate-800'}`}
        >
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-xl ${isDarkMode ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-100 text-blue-600'}`}>
              <Filter className="w-4 h-4" />
            </div>
            <span>تصفية وفلترة العمليات</span>
            {(category !== 'all' || paymentMethodFilter !== 'all' || searchQuery || fromDate || toDate) && (
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
                    className={`px-4 py-2 rounded-xl transition-all font-bold text-xs flex items-center gap-1.5 ${
                      quickPeriod === period.id
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30 ring-2 ring-blue-500/50 ring-offset-1 ' + (isDarkMode ? 'ring-offset-slate-900' : 'ring-offset-white')
                        : isDarkMode
                        ? 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
                        : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
                    }`}
                  >
                    <IconComp className={`w-3.5 h-3.5 ${quickPeriod === period.id ? 'text-white' : 'text-blue-500'}`} />
                    <span>{period.label}</span>
                  </button>
                );
              })}
            </div>

            {quickPeriod === 'custom' && (
              <div className={`p-5 rounded-2xl border animate-in fade-in slide-in-from-top-2 duration-300 shadow-sm ${isDarkMode ? 'bg-slate-800/50 border-blue-500/30' : 'bg-blue-50/50 border-blue-200'}`}>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
                  <div>
                    <label className={`block mb-1.5 text-xs font-bold ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>من تاريخ</label>
                    <ModernDatePicker 
                      value={fromDate}
                      onChange={(val) => { setFromDate(val); setCurrentPage(1); }}
                      isDarkMode={isDarkMode}
                      placeholder="اختر تاريخ البداية"
                    />
                  </div>
                  <div>
                    <label className={`block mb-1.5 text-xs font-bold ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>إلى تاريخ</label>
                    <ModernDatePicker 
                      value={toDate}
                      onChange={(val) => { setToDate(val); setCurrentPage(1); }}
                      isDarkMode={isDarkMode}
                      placeholder="اختر تاريخ النهاية"
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              <div>
                <label className={`block mb-1.5 text-xs font-bold ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>الفئة</label>
                <CustomDropdown
                  isDarkMode={isDarkMode}
                  value={category}
                  onChange={(val) => { setCategory(val); setCurrentPage(1); }}
                  options={[
                    { value: 'all', label: 'كل الفئات' },
                    ...uniqueCategories.map(cat => ({ value: cat, label: cat }))
                  ]}
                />
              </div>

              <div>
                <label className={`block mb-1.5 text-xs font-bold ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>طريقة الدفع</label>
                <CustomDropdown
                  isDarkMode={isDarkMode}
                  value={paymentMethodFilter}
                  onChange={(val) => { setPaymentMethodFilter(val); setCurrentPage(1); }}
                  options={[
                    { value: 'all', label: 'الكل' },
                    { value: 'debt', label: 'آجل (دين)' },
                    { value: 'cash', label: 'نقدي (رصيد الوكيل)' }
                  ]}
                />
              </div>

              <div>
                <label className={`block mb-1.5 text-xs font-bold ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>بحث سريع</label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="رقم المرجع، رقم الكرت..."
                    value={searchQuery}
                    onChange={(e) => {setSearchQuery(e.target.value); setCurrentPage(1);}}
                    className={`w-full rounded-xl py-2.5 px-4 pr-10 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-500 ${isDarkMode ? 'bg-slate-900 text-white border border-slate-700 placeholder-slate-500' : 'bg-white text-slate-900 border border-slate-200 placeholder-slate-400 shadow-sm'}`}
                  />
                  <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setQuickPeriod('all');
                  setFromDate('');
                  setToDate('');
                  setCategory('all');
                  setPaymentMethodFilter('all');
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

      {/* Operations (Sales) Statement */}
      <div className={`rounded-3xl border shadow-xl overflow-hidden ${isDarkMode ? 'bg-[#121927] border-slate-800 shadow-black/20' : 'bg-white border-slate-200 shadow-slate-200/40'}`}>
        <div className={`p-6 border-b flex items-center justify-between ${isDarkMode ? 'border-slate-800 bg-slate-900/30' : 'border-slate-100 bg-slate-50/50'}`}>
          <h3 className={`font-black flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
            <History className="w-5 h-5 text-indigo-500" />
            سجل مبيعات النقطة
          </h3>
          <div className={`text-xs font-bold px-3 py-1.5 rounded-lg ${isDarkMode ? 'bg-slate-800 text-slate-300' : 'bg-white text-slate-600 border border-slate-200 shadow-sm'}`}>
            النتائج: <span className="text-indigo-500">{filteredOperations.length}</span>
          </div>
        </div>

        <div className="overflow-x-auto custom-scrollbar min-h-[300px]">
          {filteredOperations.length === 0 ? (
            <div className={`flex flex-col items-center justify-center py-20 text-center px-4 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${isDarkMode ? 'bg-slate-800/50 text-slate-600' : 'bg-slate-100 text-slate-400'}`}>
                <History className="w-8 h-8" />
              </div>
              <h4 className={`text-lg font-bold mb-2 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>لا توجد مبيعات</h4>
              <p className="text-sm">لم يتم العثور على أي مبيعات مطابقة لمعايير التصفية المحددة.</p>
            </div>
          ) : (
            <table className="w-full text-right">
              <thead>
                <tr className={`text-xs font-black uppercase tracking-wider ${isDarkMode ? 'bg-slate-800/40 text-slate-400' : 'bg-slate-50 text-slate-500'}`}>
                  <th className="py-4 px-6 whitespace-nowrap">الرقم المرجعي</th>
                  <th className="py-4 px-6 whitespace-nowrap">التاريخ والوقت</th>
                  <th className="py-4 px-6 whitespace-nowrap">رقم الكرت</th>
                  <th className="py-4 px-6 whitespace-nowrap">الفئة</th>
                  <th className="py-4 px-6 whitespace-nowrap text-center">طريقة الدفع</th>
                  <th className="py-4 px-6 whitespace-nowrap text-center">السعر للمستخدم</th>
                  <th className="py-4 px-6 whitespace-nowrap text-center">المحتسب عليك</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${isDarkMode ? 'divide-slate-800/50' : 'divide-slate-100'}`}>
                {paginatedOperations.map((op: any, i: number) => {
                  const isDebt = op.payment_method === 'دين (آجل)';
                  return (
                    <tr key={op.id || i} className={`group transition-colors ${isDarkMode ? 'hover:bg-slate-800/30' : 'hover:bg-indigo-50/50'}`}>
                      <td className={`py-4 px-6 font-mono text-[11px] font-bold ${isDarkMode ? 'text-slate-400 group-hover:text-slate-300' : 'text-slate-500 group-hover:text-slate-700'}`}>
                        {op.reference_number || 'بدون مرجع'}
                      </td>
                      <td className="py-4 px-6 font-mono text-[11px] whitespace-nowrap">
                        <span className={`block font-bold text-xs ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                          {new Date(op.purchased_at).toLocaleDateString('en-CA')}
                        </span>
                        <span className={`text-[10px] ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                          {new Date(op.purchased_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}
                        </span>
                      </td>
                      <td className={`py-4 px-6 font-mono text-xs font-black tracking-widest ${isDarkMode ? 'text-indigo-300' : 'text-indigo-600'}`}>
                        {op.card_code}
                      </td>
                      <td className={`py-4 px-6 text-sm font-bold ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>
                        {op.category_name}
                      </td>
                      <td className="py-4 px-6 text-center">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black border ${isDebt ? (isDarkMode ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' : 'bg-rose-50 text-rose-600 border-rose-200') : (isDarkMode ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : 'bg-blue-50 text-blue-600 border-blue-200')}`}>
                          {isDebt ? <Activity className="w-3 h-3" /> : <Wallet className="w-3 h-3" />}
                          {op.payment_method}
                        </span>
                      </td>
                      <td className={`py-4 px-6 text-center text-xs font-bold ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                        {op.price}
                      </td>
                      <td className={`py-4 px-6 text-center font-black text-sm ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                        {op.pos_price}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination Details */}
        {totalPages > 1 && (
          <div className={`flex items-center justify-between p-4 border-t ${isDarkMode ? 'border-slate-800 bg-[#1b2536]/30 text-slate-300' : 'border-slate-200 bg-slate-50 text-slate-700'}`}>
            <div className="text-xs font-bold">
              إجمالي العمليات: {filteredOperations.length}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  currentPage === 1 
                  ? 'opacity-50 cursor-not-allowed border ' + (isDarkMode ? 'border-slate-700 text-slate-500' : 'border-slate-300 text-slate-400')
                  : 'cursor-pointer hover:bg-indigo-600 hover:text-white border border-indigo-500 text-indigo-500'
                }`}
              >
                السابق
              </button>
              <span className="text-xs font-bold px-2">
                صفحة {currentPage} من {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  currentPage === totalPages 
                  ? 'opacity-50 cursor-not-allowed border ' + (isDarkMode ? 'border-slate-700 text-slate-500' : 'border-slate-300 text-slate-400')
                  : 'cursor-pointer hover:bg-indigo-600 hover:text-white border border-indigo-500 text-indigo-500'
                }`}
              >
                التالي
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Debt Settlements Statement */}
      <div className={`rounded-3xl border shadow-lg overflow-hidden mt-8 ${isDarkMode ? 'bg-[#121927] border-slate-800' : 'bg-white border-slate-200'}`}>
        <div className={`p-6 border-b flex items-center justify-between ${isDarkMode ? 'border-slate-800 bg-slate-900/30' : 'border-slate-100 bg-slate-50/50'}`}>
          <h3 className={`font-black flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
            <Wallet className="w-5 h-5 text-emerald-500" />
            سجل دفعات سداد الديون
          </h3>
          <div className={`text-xs font-bold px-3 py-1.5 rounded-lg ${isDarkMode ? 'bg-slate-800 text-slate-300' : 'bg-white text-slate-600 border border-slate-200 shadow-sm'}`}>
            النتائج: <span className="text-emerald-500">{filteredSettlements.length}</span>
          </div>
        </div>
        
        {filteredSettlements.length === 0 ? (
          <p className={`text-center py-12 text-sm font-bold ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
            لا توجد دفعات سداد مطابقة لمعايير الفلتر.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right">
              <thead>
                <tr className={`text-xs font-black uppercase tracking-wider ${isDarkMode ? 'bg-slate-800/40 text-slate-400' : 'bg-slate-50 text-slate-500'}`}>
                  <th className="py-4 px-6 whitespace-nowrap">الرقم المرجعي</th>
                  <th className="py-4 px-6 whitespace-nowrap">التاريخ والوقت</th>
                  <th className="py-4 px-6 whitespace-nowrap text-center">المبلغ المستلم</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${isDarkMode ? 'divide-slate-800/50' : 'divide-slate-100'}`}>
                {filteredSettlements.map((s: any) => (
                  <tr key={s.id} className={`group transition-colors ${isDarkMode ? 'hover:bg-slate-800/30' : 'hover:bg-emerald-50/30'}`}>
                    <td className={`py-4 px-6 font-mono text-[11px] font-bold ${isDarkMode ? 'text-slate-400 group-hover:text-slate-300' : 'text-slate-500 group-hover:text-slate-700'}`}>
                      {s.reference_number}
                    </td>
                    <td className="py-4 px-6 font-mono text-[11px] whitespace-nowrap">
                      <span className={`block font-bold text-xs ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                        {new Date(s.created_at).toLocaleDateString('en-CA')}
                      </span>
                      <span className={`text-[10px] ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                        {new Date(s.created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}
                      </span>
                    </td>
                    <td className={`py-4 px-6 text-center font-black text-sm ${isDarkMode ? 'text-emerald-400' : 'text-emerald-600'}`}>
                      +{s.amount.toLocaleString()} ر.ي
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modals from POS Management Page */}
      {modalMode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setModalMode(null)}></div>
          <div className={`w-full max-w-md p-6 rounded-3xl shadow-2xl relative z-10 animate-in zoom-in-95 duration-300 ${isDarkMode ? 'bg-gradient-to-b from-slate-900 to-[#121927] border border-slate-800' : 'bg-white border border-slate-200'}`}>
            
            <div className="absolute -top-12 left-1/2 -translate-x-1/2">
              <div className={`w-24 h-24 rounded-full p-1 shadow-lg ${modalMode === 'credit' ? 'bg-gradient-to-b from-blue-500 to-indigo-600 shadow-blue-500/30' : 'bg-gradient-to-b from-emerald-500 to-teal-600 shadow-emerald-500/30'}`}>
                <div className={`w-full h-full rounded-full flex items-center justify-center ${isDarkMode ? 'bg-slate-900' : 'bg-white'}`}>
                  {modalMode === 'credit' ? (
                     <CreditCard className="w-10 h-10 text-blue-500" />
                  ) : (
                     <DollarSign className="w-10 h-10 text-emerald-500" />
                  )}
                </div>
              </div>
            </div>

            <div className="mt-12 text-center mb-6">
              <h3 className={`text-xl font-black ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                {modalMode === 'credit' ? 'تعديل السقف المالي' : 'استلام دفعة سداد'}
              </h3>
              <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg mt-3 ${isDarkMode ? 'bg-slate-800/50' : 'bg-slate-100'}`}>
                <User className={`w-4 h-4 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`} />
                <span className={`text-sm font-bold ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>{data.user.name}</span>
              </div>
            </div>
            
            {modalMode === 'credit' ? (
              <div className="space-y-5">
                <div>
                  <label className={`block text-xs font-bold mb-2 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>السقف المالي الجديد</label>
                  <div className="relative group">
                    <Wallet className={`absolute right-4 top-3.5 w-5 h-5 transition-colors ${isDarkMode ? 'text-slate-500 group-focus-within:text-blue-400' : 'text-slate-400 group-focus-within:text-blue-500'}`} />
                    <input
                      type="text"
                      inputMode="numeric"
                      value={newCreditLimit}
                      onChange={e => {
                        const val = toEnglishDigits(e.target.value).replace(/[^0-9]/g, '');
                        setNewCreditLimit(val);
                      }}
                      className={`w-full pr-12 pl-12 py-3.5 rounded-xl border-2 font-mono text-left font-bold focus:ring-4 outline-none transition-all ${isDarkMode ? 'bg-slate-900/50 border-slate-700 focus:border-blue-500 focus:ring-blue-500/20 text-white placeholder-slate-600' : 'bg-slate-50 border-slate-200 focus:border-blue-500 focus:ring-blue-500/20 text-slate-900 placeholder-slate-400'}`}
                      dir="ltr"
                    />
                    <span className="absolute left-4 top-3.5 text-sm font-bold text-slate-400 pointer-events-none">ر.ي</span>
                  </div>
                  <div className={`flex items-start gap-2 mt-3 text-xs p-3 rounded-xl ${isDarkMode ? 'bg-blue-500/10 text-blue-400' : 'bg-blue-50 text-blue-700'}`}>
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <p className="leading-relaxed">السقف المالي يحدد أقصى مبلغ يمكن للوكيل أن يستدينه عبر شراء الكروت آجلاً.</p>
                  </div>
                </div>
                <div className="flex gap-3 pt-4">
                  <button onClick={handleUpdateCreditLimit} className="flex-[2] py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold transition-all shadow-lg shadow-blue-500/20 active:scale-[0.98]">
                    حفظ التعديل
                  </button>
                  <button onClick={() => setModalMode(null)} className={`flex-[1] py-3.5 rounded-xl font-bold transition-all active:scale-[0.98] ${isDarkMode ? 'bg-slate-800 hover:bg-slate-700 text-white' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'}`}>
                    إلغاء
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-5">
                <div className={`p-4 rounded-xl mb-2 border ${isDarkMode ? 'bg-rose-500/10 border-rose-500/20' : 'bg-rose-50 border-rose-200'}`}>
                  <div className="flex justify-between items-center">
                    <span className={`text-sm font-bold ${isDarkMode ? 'text-rose-400' : 'text-rose-600'}`}>إجمالي الديون الحالية:</span>
                    <span className={`text-lg font-black font-mono ${isDarkMode ? 'text-rose-300' : 'text-rose-600'}`}>{Number(data.membership.current_debt).toLocaleString()} <span className="text-sm">ر.ي</span></span>
                  </div>
                </div>
                <div>
                  <label className={`block text-xs font-bold mb-2 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>المبلغ المستلم للسداد</label>
                  <div className="relative group">
                    <DollarSign className={`absolute right-4 top-3.5 w-5 h-5 transition-colors ${isDarkMode ? 'text-slate-500 group-focus-within:text-emerald-400' : 'text-slate-400 group-focus-within:text-emerald-500'}`} />
                    <input
                      type="text"
                      inputMode="numeric"
                      value={paymentAmount}
                      onChange={e => {
                        const val = toEnglishDigits(e.target.value).replace(/[^0-9.]/g, '');
                        setPaymentAmount(val);
                      }}
                      className={`w-full pr-12 pl-12 py-3.5 rounded-xl border-2 font-mono text-left font-bold focus:ring-4 outline-none transition-all ${isDarkMode ? 'bg-slate-900/50 border-slate-700 focus:border-emerald-500 focus:ring-emerald-500/20 text-emerald-400 placeholder-slate-600' : 'bg-slate-50 border-slate-200 focus:border-emerald-500 focus:ring-emerald-500/20 text-emerald-600 placeholder-slate-400'}`}
                      dir="ltr"
                    />
                    <span className="absolute left-4 top-3.5 text-sm font-bold text-slate-400 pointer-events-none">ر.ي</span>
                  </div>
                </div>
                <div className="flex gap-3 pt-4">
                  <button onClick={handlePayDebt} className="flex-[2] py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-bold transition-all shadow-lg shadow-emerald-500/20 active:scale-[0.98]">
                    تأكيد الاستلام
                  </button>
                  <button onClick={() => setModalMode(null)} className={`flex-[1] py-3.5 rounded-xl font-bold transition-all active:scale-[0.98] ${isDarkMode ? 'bg-slate-800 hover:bg-slate-700 text-white' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'}`}>
                    إلغاء
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
