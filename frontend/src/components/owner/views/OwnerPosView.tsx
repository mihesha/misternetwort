import React, { useEffect, useState, useMemo } from 'react';
import { Wallet, Plus, CreditCard, DollarSign, Tag, Save, Store, TrendingUp, AlertCircle, Check, X, Search, User, Phone, ArrowRight, Activity, ShieldAlert, Sparkles, CheckCircle2, CheckCircle } from 'lucide-react';
import { useAppContext } from '@/context/AppContext';
import { useOwnerContext } from '@/context/OwnerContext';
import { useOwnerActions } from '@/hooks/useOwnerActions';

// Helper to convert Arabic/Indic numerals to English
const toEnglishDigits = (str: string) => {
  return str.replace(/[\u0660-\u0669]/g, (c) => (c.charCodeAt(0) - 0x0660).toString())
            .replace(/[\u06f0-\u06f9]/g, (c) => (c.charCodeAt(0) - 0x06f0).toString());
};

export const OwnerPosView: React.FC = () => {
  const { isDarkMode } = useAppContext();
  const { networks, setGlobalUpdateTick } = useOwnerContext();
  const { fetchOwnerNetworks } = useOwnerActions();
  const network = networks?.[0];

  const [memberships, setMemberships] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newPosPhone, setNewPosPhone] = useState('');
  
  const [selectedMembership, setSelectedMembership] = useState<any>(null);
  const [newCreditLimit, setNewCreditLimit] = useState('');
  const [paymentAmount, setPaymentAmount] = useState('');
  const [modalMode, setModalMode] = useState<'credit' | 'payment' | null>(null);

  const [showPricingModal, setShowPricingModal] = useState(false);
  const [packages, setPackages] = useState<any[]>([]);
  const [loadingPackages, setLoadingPackages] = useState(false);
  const [editedPrices, setEditedPrices] = useState<Record<number, string>>({});
  const [isSavingPrices, setIsSavingPrices] = useState(false);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  // Toast Notification State
  const [toast, setToast] = useState<{message: string, type: 'success' | 'error'} | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchMemberships = async () => {
    if (!network) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/networks/${network.id}/pos-memberships`);
      if (res.ok) {
        const data = await res.json();
        setMemberships(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let mounted = true;
    const init = async () => {
      if (networks.length === 0) {
        await fetchOwnerNetworks();
      }
      if (mounted) {
        if (!networks?.[0]) {
          setLoading(false);
        }
      }
    };
    init();
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    if (network) {
      fetchMemberships();
    }
  }, [network]);

  const fetchPackages = async () => {
    if (!network) return;
    setLoadingPackages(true);
    try {
      const res = await fetch(`/api/networks/${network.id}/pos-packages`);
      if (res.ok) {
        setPackages(await res.json());
      }
    } catch(e) {
      console.error(e);
    } finally {
      setLoadingPackages(false);
    }
  };

  const handleSaveAllPrices = async () => {
    if (!network || Object.keys(editedPrices).length === 0) {
      setShowPricingModal(false);
      return;
    }
    setIsSavingPrices(true);
    let successCount = 0;
    try {
      await Promise.all(
        Object.entries(editedPrices).map(async ([pkgId, price]) => {
          const res = await fetch(`/api/networks/${network.id}/pos-packages/${pkgId}/price`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ pos_price: price ? parseFloat(price) : null })
          });
          if (res.ok) successCount++;
        })
      );
      if (successCount > 0) {
        showToast('تم حفظ التعديلات بنجاح', 'success');
        fetchPackages();
        setEditedPrices({});
        setShowPricingModal(false);
      }
    } catch (e) {
      console.error(e);
      showToast('حدث خطأ أثناء حفظ التسعيرات', 'error');
    } finally {
      setIsSavingPrices(false);
    }
  };

  const handleAddPos = async () => {
    if (!newPosPhone || !network) return;
    try {
      const res = await fetch(`/api/networks/${network.id}/pos-memberships`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: toEnglishDigits(newPosPhone).replace(/[^0-9]/g, '') })
      });
      if (res.ok) {
        showToast('تم إضافة نقطة البيع بنجاح');
        setShowAddModal(false);
        setNewPosPhone('');
        fetchMemberships();
      } else {
        const data = await res.json();
        showToast(data.error || 'حدث خطأ', 'error');
      }
    } catch (e) {
      console.error(e);
      showToast('حدث خطأ غير متوقع', 'error');
    }
  };

  const handleUpdateCreditLimit = async () => {
    if (!selectedMembership || !network || !newCreditLimit) return;
    try {
      const res = await fetch(`/api/networks/${network.id}/pos-memberships/${selectedMembership.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credit_limit: parseFloat(newCreditLimit) })
      });
      if (res.ok) {
        showToast('تم تحديث السقف المالي بنجاح');
        setSelectedMembership(null);
        setModalMode(null);
        setNewCreditLimit('');
        fetchMemberships();
      } else {
        const data = await res.json();
        showToast(data.error || 'حدث خطأ', 'error');
      }
    } catch (e) {
      console.error(e);
      showToast('حدث خطأ أثناء الحفظ', 'error');
    }
  };

  const handlePayDebt = async () => {
    if (!selectedMembership || !network || !paymentAmount) return;
    try {
      const res = await fetch(`/api/networks/${network.id}/pos-memberships/${selectedMembership.id}/pay-debt`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: parseFloat(paymentAmount) })
      });
      if (res.ok) {
        showToast('تم تسجيل السداد بنجاح');
        setSelectedMembership(null);
        setModalMode(null);
        setPaymentAmount('');
        fetchMemberships();
        if (typeof setGlobalUpdateTick === 'function') {
          setGlobalUpdateTick((prev: number) => prev + 1);
        }
      } else {
        const data = await res.json();
        showToast(data.error || 'حدث خطأ', 'error');
      }
    } catch (e) {
      console.error(e);
      showToast('حدث خطأ أثناء السداد', 'error');
    }
  };

  const activeMemberships = useMemo(() => memberships.filter(m => m.status === 'active'), [memberships]);
  const totalDebt = useMemo(() => memberships.reduce((sum, m) => sum + (Number(m.current_debt) || 0), 0), [memberships]);
  
  const filteredMemberships = useMemo(() => {
    return memberships.filter(m => 
      m.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
      m.user?.phone?.includes(searchTerm)
    );
  }, [memberships, searchTerm]);

  const totalPages = Math.ceil(filteredMemberships.length / itemsPerPage);
  const paginatedMemberships = filteredMemberships.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20 relative">
      
      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] animate-in slide-in-from-top-10 fade-in zoom-in-95 duration-300">
          <div className={`px-6 py-3.5 rounded-full shadow-2xl flex items-center gap-3 font-bold text-sm ${toast.type === 'success' ? 'bg-emerald-500 text-white shadow-emerald-500/30' : 'bg-rose-500 text-white shadow-rose-500/30'}`}>
            {toast.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <ShieldAlert className="w-5 h-5" />}
            {toast.message}
          </div>
        </div>
      )}

      {/* Header & Stats Dashboard */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        <div className={`xl:col-span-2 p-8 rounded-3xl border relative overflow-hidden ${isDarkMode ? 'bg-gradient-to-br from-indigo-900/30 to-[#121927] border-indigo-500/20 shadow-[0_0_30px_rgba(99,102,241,0.05)]' : 'bg-gradient-to-br from-indigo-50 to-white border-indigo-100 shadow-xl shadow-indigo-100/50'}`}>
          <div className="absolute top-0 right-0 -mt-8 -mr-8 w-40 h-40 bg-indigo-500/20 rounded-full blur-3xl"></div>
          <div className="relative z-10 flex flex-col justify-between h-full min-h-[160px]">
            <div>
              <div className="flex items-center gap-4 mb-3">
                <div className={`p-3 rounded-2xl ${isDarkMode ? 'bg-indigo-500/20 text-indigo-400 shadow-[0_0_15px_rgba(99,102,241,0.2)]' : 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'}`}>
                  <Store className="w-6 h-6" />
                </div>
                <h2 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-500">إدارة نقاط البيع</h2>
              </div>
              <p className={`text-sm leading-relaxed max-w-md ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                أدر شبكة وكلائك ونقاط البيع الخاصة بك. قم بتعيين أسعار خاصة للكروت، إدارة السقوف المالية، ومتابعة مبيعاتهم الآجلة بكل سهولة.
              </p>
            </div>
            <div className="flex flex-wrap gap-3 mt-6">
              <button
                onClick={() => setShowAddModal(true)}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-sm flex items-center gap-2 shadow-lg shadow-blue-500/20 transition-all hover:-translate-y-0.5 active:translate-y-0"
              >
                <Plus className="w-4 h-4" />
                <span>إضافة وكيل جديد</span>
              </button>
              <button
                onClick={() => {
                  setEditedPrices({});
                  setShowPricingModal(true);
                  fetchPackages();
                }}
                className={`px-5 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 transition-all hover:-translate-y-0.5 active:translate-y-0 ${isDarkMode ? 'bg-slate-800 hover:bg-slate-700 text-white shadow-lg shadow-slate-900/50 border border-slate-700' : 'bg-white hover:bg-slate-50 text-slate-800 shadow-lg shadow-slate-200/50 border border-slate-200'}`}
              >
                <Tag className="w-4 h-4" />
                <span>أسعار الوكلاء</span>
              </button>
            </div>
          </div>
        </div>

        <div className={`p-6 rounded-3xl border flex flex-col justify-center relative overflow-hidden transition-all hover:shadow-lg ${isDarkMode ? 'bg-[#121927] border-slate-800 hover:border-blue-500/30' : 'bg-white border-slate-200 hover:border-blue-300 shadow-sm'}`}>
          <div className={`absolute -right-6 -bottom-6 w-32 h-32 rounded-full blur-3xl opacity-20 ${isDarkMode ? 'bg-blue-500' : 'bg-blue-400'}`}></div>
          <div className="flex items-center gap-5 relative z-10">
            <div className={`p-4 rounded-2xl shrink-0 ${isDarkMode ? 'bg-blue-500/10 text-blue-400' : 'bg-blue-50 text-blue-600'}`}>
              <Activity className="w-8 h-8" />
            </div>
            <div>
              <p className={`text-xs font-bold mb-1.5 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>الوكلاء النشطين</p>
              <div className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-500">{activeMemberships.length}</div>
              <p className={`text-[10px] mt-1.5 font-bold ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>من إجمالي {memberships.length} نقطة مسجلة</p>
            </div>
          </div>
        </div>

        <div className={`p-6 rounded-3xl border flex flex-col justify-center relative overflow-hidden transition-all hover:shadow-lg ${isDarkMode ? 'bg-[#121927] border-slate-800 hover:border-rose-500/30' : 'bg-white border-slate-200 hover:border-rose-300 shadow-sm'}`}>
          <div className={`absolute -right-6 -bottom-6 w-32 h-32 rounded-full blur-3xl opacity-20 ${isDarkMode ? 'bg-rose-500' : 'bg-rose-400'}`}></div>
          <div className="flex items-center gap-5 relative z-10">
            <div className={`p-4 rounded-2xl shrink-0 ${isDarkMode ? 'bg-rose-500/10 text-rose-400' : 'bg-rose-50 text-rose-600'}`}>
              <TrendingUp className="w-8 h-8" />
            </div>
            <div>
              <p className={`text-xs font-bold mb-1.5 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>إجمالي الديون الآجلة</p>
              <div className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-rose-400 to-orange-500">
                {totalDebt.toLocaleString()} <span className="text-sm font-bold text-rose-500/50">ر.ي</span>
              </div>
              <p className={`text-[10px] mt-1.5 font-bold ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>مبالغ مستحقة من الوكلاء</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main List Section */}
      <div className={`rounded-3xl border overflow-hidden shadow-xl ${isDarkMode ? 'bg-[#121927] border-slate-800 shadow-black/20' : 'bg-white border-slate-200 shadow-slate-200/40'}`}>
        <div className={`p-5 flex flex-col sm:flex-row justify-between items-center gap-4 border-b ${isDarkMode ? 'border-slate-800 bg-slate-900/30' : 'border-slate-100 bg-slate-50/50'}`}>
          <h3 className={`text-lg font-bold flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
            <User className="w-5 h-5 text-indigo-500" />
            قائمة نقاط البيع
          </h3>
          <div className="relative w-full sm:w-72">
            <Search className={`absolute right-3.5 top-2.5 w-4 h-4 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`} />
            <input 
              type="text" 
              placeholder="ابحث بالاسم أو الرقم..." 
              value={searchTerm}
              onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              className={`w-full pr-10 pl-4 py-2.5 text-sm rounded-xl border-2 focus:ring-4 outline-none transition-all ${isDarkMode ? 'bg-slate-900 border-slate-700 focus:border-indigo-500 focus:ring-indigo-500/20 text-white placeholder-slate-500' : 'bg-white border-slate-200 focus:border-indigo-500 focus:ring-indigo-500/20 text-slate-900 placeholder-slate-400'}`}
            />
          </div>
        </div>
        
        <div className="overflow-x-auto custom-scrollbar min-h-[300px]">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="w-10 h-10 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin mb-4"></div>
              <p className={`font-bold animate-pulse ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>جاري تحميل البيانات...</p>
            </div>
          ) : memberships.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center px-4">
              <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-4 ${isDarkMode ? 'bg-slate-800/50 text-slate-600' : 'bg-slate-100 text-slate-300'}`}>
                <Store className="w-10 h-10" />
              </div>
              <h4 className={`text-lg font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>لا يوجد وكلاء حالياً</h4>
              <p className={`text-sm mb-6 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>قم بإضافة نقاط بيع لشبكتك لتبدأ إدارة مبيعاتهم.</p>
              <button
                onClick={() => setShowAddModal(true)}
                className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition-all shadow-lg shadow-indigo-500/20"
              >
                إضافة نقطة بيع
              </button>
            </div>
          ) : filteredMemberships.length === 0 ? (
            <div className="text-center py-20">
              <p className={`font-bold ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>لا توجد نتائج مطابقة للبحث</p>
            </div>
          ) : (
            <table className="w-full text-right">
              <thead>
                <tr className={`text-xs font-black uppercase tracking-wider ${isDarkMode ? 'bg-slate-800/40 text-slate-400' : 'bg-slate-50 text-slate-500'}`}>
                  <th className="py-4 px-6 whitespace-nowrap">الوكيل</th>
                  <th className="py-4 px-6 whitespace-nowrap text-center">الحالة</th>
                  <th className="py-4 px-6 whitespace-nowrap text-center">السقف المالي</th>
                  <th className="py-4 px-6 whitespace-nowrap text-center">الديون الحالية</th>
                  <th className="py-4 px-6 whitespace-nowrap text-left pl-8">الإجراءات</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${isDarkMode ? 'divide-slate-800/50' : 'divide-slate-100'}`}>
                {paginatedMemberships.map((m, i) => (
                  <tr key={i} className={`group transition-colors ${isDarkMode ? 'hover:bg-slate-800/30' : 'hover:bg-indigo-50/50'}`}>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-4">
                        <div className={`w-11 h-11 rounded-full flex items-center justify-center text-lg font-black shadow-inner shrink-0 ${isDarkMode ? 'bg-gradient-to-br from-indigo-500/20 to-purple-500/20 text-indigo-400 border border-indigo-500/10' : 'bg-gradient-to-br from-indigo-100 to-purple-100 text-indigo-600 border border-indigo-200/50'}`}>
                          {m.user?.name?.charAt(0) || <Store className="w-5 h-5" />}
                        </div>
                        <div>
                          <div className={`font-bold text-sm ${isDarkMode ? 'text-slate-200 group-hover:text-white' : 'text-slate-800 group-hover:text-indigo-900'} transition-colors`}>{m.user?.name}</div>
                          <div className="flex items-center gap-1.5 mt-1">
                            <Phone className="w-3 h-3 text-slate-400" />
                            <span className={`text-xs font-mono font-bold ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`} dir="ltr">{m.user?.phone}</span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-center">
                      {m.status === 'pending' ? (
                        <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border ${isDarkMode ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 'bg-amber-50 text-amber-600 border-amber-200'}`}>
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                          قيد الانتظار
                        </div>
                      ) : m.status === 'active' ? (
                        <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border ${isDarkMode ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-emerald-50 text-emerald-600 border-emerald-200'}`}>
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          نشط
                        </div>
                      ) : (
                        <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border ${isDarkMode ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' : 'bg-rose-50 text-rose-600 border-rose-200'}`}>
                          <ShieldAlert className="w-3.5 h-3.5" />
                          موقوف
                        </div>
                      )}
                    </td>
                    <td className="py-4 px-6 text-center">
                      <div className={`inline-flex items-center gap-1.5 font-black text-sm ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                        <Wallet className="w-4 h-4 opacity-50" />
                        <span>{Number(m.credit_limit).toLocaleString()}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <div className={`inline-flex items-center gap-1.5 font-black text-sm ${Number(m.current_debt) > 0 ? (isDarkMode ? 'text-rose-400' : 'text-rose-600') : (isDarkMode ? 'text-slate-500' : 'text-slate-400')}`}>
                        <Activity className="w-4 h-4 opacity-50" />
                        <span>{Number(m.current_debt).toLocaleString()}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center justify-end gap-2">
                        {m.status === 'pending' ? (
                          <div className="flex gap-2">
                            <button
                              onClick={async () => {
                                await fetch(`/api/networks/${network?.id}/pos-memberships/${m.id}`, {
                                  method: 'PATCH',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify({ status: 'active' })
                                });
                                showToast('تم قبول الوكيل بنجاح');
                                fetchMemberships();
                              }}
                              className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white transition-all shadow-sm"
                              title="موافقة وتفعيل"
                            >
                              <Check className="w-5 h-5" />
                            </button>
                            <button
                              onClick={async () => {
                                await fetch(`/api/networks/${network?.id}/pos-memberships/${m.id}`, {
                                  method: 'PATCH',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify({ status: 'rejected' })
                                });
                                showToast('تم رفض الوكيل', 'error');
                                fetchMemberships();
                              }}
                              className="p-2 rounded-xl bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white transition-all shadow-sm"
                              title="رفض"
                            >
                              <X className="w-5 h-5" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex gap-2">
                            <button
                              onClick={() => { setSelectedMembership(m); setModalMode('credit'); setNewCreditLimit(m.credit_limit.toString()); setPaymentAmount(''); }}
                              className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${isDarkMode ? 'bg-blue-500/10 text-blue-400 hover:bg-blue-500 hover:text-white' : 'bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white shadow-sm'}`}
                            >
                              <CreditCard className="w-4 h-4" /> السقف
                            </button>
                            <button
                              onClick={() => { setSelectedMembership(m); setModalMode('payment'); setPaymentAmount(''); setNewCreditLimit(''); }}
                              className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${m.current_debt <= 0 ? 'opacity-40 cursor-not-allowed' : (isDarkMode ? 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500 hover:text-white' : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white shadow-sm')}`}
                              disabled={m.current_debt <= 0}
                            >
                              <DollarSign className="w-4 h-4" /> سداد
                            </button>
                            <button
                              onClick={() => {
                                window.location.href = `/owner/pos/${m.user_id}`;
                              }}
                              className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${isDarkMode ? 'bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500 hover:text-white' : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white shadow-sm'}`}
                            >
                              التفاصيل <ArrowRight className="w-3.5 h-3.5 rtl:-scale-x-100" />
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        
        {totalPages > 1 && (
          <div className={`p-4 border-t flex flex-col sm:flex-row gap-4 justify-between items-center ${isDarkMode ? 'border-slate-800 bg-slate-900/30' : 'border-slate-100 bg-slate-50/50'}`}>
            <span className={`text-xs font-bold ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              عرض {((currentPage - 1) * itemsPerPage) + 1} إلى {Math.min(currentPage * itemsPerPage, filteredMemberships.length)} من أصل {filteredMemberships.length}
            </span>
            <div className="flex gap-2" dir="ltr">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${currentPage === 1 ? 'opacity-50 cursor-not-allowed ' + (isDarkMode ? 'bg-slate-800 text-slate-500' : 'bg-slate-100 text-slate-400') : (isDarkMode ? 'bg-slate-800 hover:bg-slate-700 text-white' : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200')}`}
              >
                السابق
              </button>
              <div className="flex items-center gap-1 px-1 overflow-x-auto max-w-[150px] sm:max-w-none custom-scrollbar">
                {Array.from({length: totalPages}, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`w-8 h-8 shrink-0 rounded-lg flex items-center justify-center text-xs font-bold transition-all ${currentPage === page ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20' : (isDarkMode ? 'text-slate-400 hover:bg-slate-800' : 'text-slate-600 hover:bg-slate-100')}`}
                  >
                    {page}
                  </button>
                ))}
              </div>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${currentPage === totalPages ? 'opacity-50 cursor-not-allowed ' + (isDarkMode ? 'bg-slate-800 text-slate-500' : 'bg-slate-100 text-slate-400') : (isDarkMode ? 'bg-slate-800 hover:bg-slate-700 text-white' : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200')}`}
              >
                التالي
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Add POS Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowAddModal(false)}></div>
          <div className={`w-full max-w-md p-6 rounded-3xl shadow-2xl relative z-10 animate-in zoom-in-95 duration-300 ${isDarkMode ? 'bg-gradient-to-b from-slate-900 to-[#121927] border border-slate-800' : 'bg-white border border-slate-200'}`}>
            
            <div className="absolute -top-12 left-1/2 -translate-x-1/2">
              <div className="w-24 h-24 rounded-full bg-gradient-to-b from-blue-500 to-indigo-600 p-1 shadow-lg shadow-blue-500/30">
                <div className={`w-full h-full rounded-full flex items-center justify-center ${isDarkMode ? 'bg-slate-900' : 'bg-white'}`}>
                  <Store className="w-10 h-10 text-blue-500" />
                </div>
              </div>
            </div>

            <div className="mt-12 text-center mb-6">
              <h3 className={`text-xl font-black ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>ضم نقطة بيع جديدة</h3>
              <p className={`text-sm mt-2 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>أدخل رقم الهاتف للوكيل لإضافته لشبكتك</p>
            </div>

            <div className="space-y-5">
              <div>
                <label className={`block text-xs font-bold mb-2 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>رقم هاتف الوكيل</label>
                <div className="relative">
                  <Phone className={`absolute right-4 top-3.5 w-5 h-5 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`} />
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="مثال: 777000000"
                    value={newPosPhone}
                    onChange={e => {
                       const val = toEnglishDigits(e.target.value).replace(/[^0-9]/g, '');
                       setNewPosPhone(val);
                    }}
                    className={`w-full pr-12 pl-4 py-3.5 rounded-xl border-2 font-mono text-left font-bold focus:ring-4 outline-none transition-all ${isDarkMode ? 'bg-slate-900/50 border-slate-700 focus:border-blue-500 focus:ring-blue-500/20 text-white placeholder-slate-600' : 'bg-slate-50 border-slate-200 focus:border-blue-500 focus:ring-blue-500/20 text-slate-900 placeholder-slate-400'}`}
                    dir="ltr"
                  />
                </div>
                <div className={`flex items-center gap-2 mt-3 text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                  <AlertCircle className="w-4 h-4 text-amber-500" />
                  <span>يجب أن يكون حساب الوكيل مسجلاً مسبقاً في التطبيق.</span>
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <button onClick={handleAddPos} className="flex-[2] py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold transition-all shadow-lg shadow-blue-500/20 active:scale-[0.98]">
                  بحث وإضافة الوكيل
                </button>
                <button onClick={() => setShowAddModal(false)} className={`flex-[1] py-3.5 rounded-xl font-bold transition-all active:scale-[0.98] ${isDarkMode ? 'bg-slate-800 hover:bg-slate-700 text-white' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'}`}>
                  إلغاء
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Credit/Payment Modals */}
      {selectedMembership && modalMode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => { setSelectedMembership(null); setModalMode(null); }}></div>
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
                <span className={`text-sm font-bold ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>{selectedMembership.user?.name}</span>
                <span className={`text-xs font-mono px-2 border-r ${isDarkMode ? 'text-slate-400 border-slate-600' : 'text-slate-500 border-slate-300'}`}>{selectedMembership.user?.phone}</span>
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
                  <button onClick={() => { setSelectedMembership(null); setModalMode(null); }} className={`flex-[1] py-3.5 rounded-xl font-bold transition-all active:scale-[0.98] ${isDarkMode ? 'bg-slate-800 hover:bg-slate-700 text-white' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'}`}>
                    إلغاء
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-5">
                <div className={`p-4 rounded-xl mb-2 border ${isDarkMode ? 'bg-rose-500/10 border-rose-500/20' : 'bg-rose-50 border-rose-200'}`}>
                  <div className="flex justify-between items-center">
                    <span className={`text-sm font-bold ${isDarkMode ? 'text-rose-400' : 'text-rose-600'}`}>إجمالي الديون الحالية:</span>
                    <span className={`text-lg font-black font-mono ${isDarkMode ? 'text-rose-300' : 'text-rose-600'}`}>{Number(selectedMembership.current_debt).toLocaleString()} <span className="text-sm">ر.ي</span></span>
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
                  <button onClick={() => { setSelectedMembership(null); setModalMode(null); }} className={`flex-[1] py-3.5 rounded-xl font-bold transition-all active:scale-[0.98] ${isDarkMode ? 'bg-slate-800 hover:bg-slate-700 text-white' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'}`}>
                    إلغاء
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* POS Pricing Modal */}
      {showPricingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
           <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowPricingModal(false)}></div>
           <div className={`w-full max-w-4xl flex flex-col max-h-[90vh] rounded-3xl shadow-2xl relative z-10 animate-in zoom-in-95 duration-300 ${isDarkMode ? 'bg-[#0f1522] border border-slate-800' : 'bg-slate-50 border border-slate-200'}`}>
             
             {/* Header */}
             <div className={`p-6 border-b shrink-0 flex justify-between items-center rounded-t-3xl ${isDarkMode ? 'bg-[#121927] border-slate-800' : 'bg-white border-slate-200'}`}>
               <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-2xl ${isDarkMode ? 'bg-blue-500/10 text-blue-400' : 'bg-blue-50 text-blue-600'}`}>
                    <Tag className="w-7 h-7" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-indigo-500">
                      تسعير كروت نقاط البيع
                    </h3>
                    <p className={`text-sm mt-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                      حدد الأسعار الخاصة للوكلاء. الحقل الفارغ يعني بيع الكرت بالسعر الافتراضي للمستخدم.
                    </p>
                  </div>
               </div>
               <button onClick={() => setShowPricingModal(false)} className={`p-2 rounded-full transition-colors ${isDarkMode ? 'bg-slate-800 hover:bg-slate-700 text-slate-400' : 'bg-slate-100 hover:bg-slate-200 text-slate-500'}`}>
                 <X className="w-5 h-5" />
               </button>
             </div>

             {/* Content */}
             <div className="flex-1 overflow-y-auto p-6 custom-scrollbar bg-transparent">
                {loadingPackages ? (
                  <div className="flex flex-col items-center justify-center h-48 space-y-4">
                    <div className="w-10 h-10 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
                    <p className={`font-bold animate-pulse ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>جاري جلب فئات الكروت...</p>
                  </div>
                ) : packages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-48 text-center">
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${isDarkMode ? 'bg-slate-800/50 text-slate-600' : 'bg-slate-100 text-slate-300'}`}>
                      <Store className="w-8 h-8" />
                    </div>
                    <p className="text-lg font-bold text-slate-500">لا يوجد فئات كروت مضافة في هذه الشبكة بعد.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {packages.map((pkg) => (
                      <div key={pkg.id} className={`p-5 rounded-3xl border transition-all hover:shadow-xl ${isDarkMode ? 'bg-[#151c2b] border-slate-800 hover:border-blue-500/30 shadow-black/20' : 'bg-white border-slate-200 hover:border-blue-300 shadow-slate-200/50'}`}>
                        <div className="flex flex-col gap-5">
                          <div className="flex justify-between items-start border-b pb-4 border-dashed border-slate-700/50">
                            <div className={`font-black text-lg ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>{pkg.name}</div>
                            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold shrink-0 ${isDarkMode ? 'bg-amber-500/10 text-amber-400' : 'bg-amber-50 text-amber-600'}`}>
                               <Sparkles className="w-3.5 h-3.5" />
                               سعر المستخدم: {pkg.price} ر.ي
                            </div>
                          </div>
                          
                          <div>
                            <label className={`block text-[11px] font-bold mb-1.5 uppercase tracking-wide ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>سعر الجملة (لنقطة البيع)</label>
                            <div className="relative group">
                              <div className={`absolute inset-y-0 left-0 w-12 flex items-center justify-center rounded-l-xl ${isDarkMode ? 'bg-slate-800' : 'bg-slate-100'} border-r transition-colors ${isDarkMode ? 'border-slate-700' : 'border-slate-200'}`}>
                                <span className={`text-[10px] font-black ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>ر.ي</span>
                              </div>
                              <input
                                type="text"
                                inputMode="numeric"
                                placeholder="السعر الخاص..."
                                value={editedPrices[pkg.id] !== undefined ? editedPrices[pkg.id] : (pkg.pos_price || '')}
                                onChange={(e) => {
                                  const val = toEnglishDigits(e.target.value).replace(/[^0-9.]/g, '');
                                  setEditedPrices(prev => ({...prev, [pkg.id]: val}));
                                }}
                                className={`w-full pr-4 pl-16 py-2.5 text-left text-sm font-bold font-mono rounded-xl border focus:ring-2 outline-none transition-all ${isDarkMode ? 'bg-slate-900/80 border-slate-700 focus:border-blue-500 focus:ring-blue-500/20 text-emerald-400 placeholder-slate-600' : 'bg-white border-slate-200 focus:border-blue-500 focus:ring-blue-500/20 text-emerald-600 placeholder-slate-300 hover:border-slate-300 shadow-sm'}`}
                                dir="ltr"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
             </div>

             {/* Footer with Save All Button */}
             <div className={`p-5 border-t shrink-0 flex justify-between items-center rounded-b-3xl ${isDarkMode ? 'bg-[#121927] border-slate-800' : 'bg-white border-slate-200'}`}>
                <div className={`text-sm font-bold flex items-center gap-2 ${Object.keys(editedPrices).length > 0 ? 'text-amber-500' : 'text-slate-500'}`}>
                  {Object.keys(editedPrices).length > 0 ? (
                    <>
                      <AlertCircle className="w-4 h-4" />
                      يوجد {Object.keys(editedPrices).length} تعديلات غير محفوظة
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      لا توجد تعديلات جديدة
                    </>
                  )}
                </div>
                <div className="flex gap-3">
                  <button 
                    onClick={handleSaveAllPrices} 
                    disabled={isSavingPrices}
                    className={`px-10 py-3 rounded-xl text-white font-bold transition-all shadow-lg active:scale-[0.98] flex items-center gap-2 ${isSavingPrices ? 'bg-slate-500 cursor-not-allowed' : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-blue-500/20'}`}
                  >
                    {isSavingPrices ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                        جاري الحفظ...
                      </>
                    ) : (
                      <>
                        <Save className="w-5 h-5" />
                        حفظ
                      </>
                    )}
                  </button>
                </div>
             </div>
           </div>
        </div>
      )}
    </div>
  );
};
