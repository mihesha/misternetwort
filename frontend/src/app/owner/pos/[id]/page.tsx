"use client";
import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAppContext } from '@/context/AppContext';
import { useOwnerContext } from '@/context/OwnerContext';
import { useOwnerActions } from '@/hooks/useOwnerActions';
import { 
  ArrowRight, User, Phone, Store, 
  TrendingUp, Activity, Filter, 
  BadgeAlert, History, DollarSign, Wallet
} from 'lucide-react';

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
  const [filter, setFilter] = useState('all'); // all, today, week, month

  // Actions states
  const [modalMode, setModalMode] = useState<'credit' | 'payment' | null>(null);
  const [newCreditLimit, setNewCreditLimit] = useState('');
  const [paymentAmount, setPaymentAmount] = useState('');

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
  }, [filter, network, userId]);

  const fetchData = async () => {
    if (!network) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/networks/${network.id}/pos-memberships/${userId}/details?filter=${filter}&_t=${Date.now()}`, {
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
        alert('تم تحديث السقف المالي بنجاح');
        setModalMode(null);
        setNewCreditLimit('');
        fetchData();
      }
    } catch (e) {
      console.error(e);
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
        alert('تم تسجيل السداد بنجاح');
        setModalMode(null);
        setPaymentAmount('');
        fetchData();
      } else {
        const err = await res.json();
        alert(err.error || 'حدث خطأ');
      }
    } catch (e) {
      console.error(e);
    }
  };

  if (loading && !data) {
    return (
      <div className={`min-h-[60vh] flex flex-col items-center justify-center font-['Cairo',sans-serif] ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
        <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="font-bold">جاري تحميل بيانات نقطة البيع...</p>
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
    <div className="space-y-6 animate-in fade-in duration-300 font-['Cairo',sans-serif] pb-10">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button 
          onClick={() => router.back()} 
          className={`p-2 rounded-xl transition-colors ${isDarkMode ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'bg-white text-slate-700 hover:bg-slate-100 shadow-sm border border-slate-200'}`}
        >
          <ArrowRight className="w-5 h-5" />
        </button>
        <div>
          <h2 className="text-xl font-black text-indigo-500 flex items-center gap-2">
            <Store className="w-6 h-6" />
            تفاصيل نقطة البيع: {data.user.name}
          </h2>
          <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
            التقارير الخاصة بمبيعات هذه النقطة لشبكتك فقط
          </p>
        </div>
        <div className="mr-auto flex gap-2">
          <button
            onClick={() => { setModalMode('credit'); setNewCreditLimit(data.membership.credit_limit.toString()); }}
            className="px-3 py-2 rounded-xl bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 font-bold text-xs flex items-center gap-1 transition-colors"
          >
            تعديل السقف المالي
          </button>
          <button
            onClick={() => { setModalMode('payment'); setPaymentAmount(''); }}
            disabled={data.membership.current_debt <= 0}
            className="px-3 py-2 rounded-xl bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 font-bold text-xs flex items-center gap-1 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            استلام دفعة
          </button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* User Info */}
        <div className={`p-5 rounded-3xl border ${isDarkMode ? 'bg-[#121927] border-slate-800' : 'bg-white border-slate-200'}`}>
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-xl bg-indigo-500/20 text-indigo-400">
              <User className="w-6 h-6" />
            </div>
            <div>
              <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>الاسم التجاري</p>
              <h3 className={`font-bold ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>{data.user.shop_name || 'غير محدد'}</h3>
            </div>
          </div>
          <div className="space-y-2 text-xs">
            <div className={`flex items-center gap-2 ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
              <Phone className="w-4 h-4 text-slate-400" />
              <span dir="ltr">{data.user.phone}</span>
            </div>
            <div className={`flex items-center gap-2 ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
              <Activity className="w-4 h-4 text-slate-400" />
              <span>تاريخ الانضمام: {new Date(data.membership.joined_at).toLocaleDateString('ar-YE')}</span>
            </div>
          </div>
        </div>

        {/* Total Sales (Owner's Cut) */}
        <div className={`p-5 rounded-3xl border ${isDarkMode ? 'bg-[#121927] border-slate-800' : 'bg-white border-slate-200'}`}>
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-xl bg-blue-500/20 text-blue-400">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>إجمالي مبيعاتك (من هذه النقطة)</p>
              <h3 className={`font-black text-xl ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
                {data.stats.total_owner_sales} <span className="text-sm font-bold text-slate-500">ر.ي</span>
              </h3>
            </div>
          </div>
          <p className={`text-[10px] ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
            حسب الفلتر الحالي ({data.stats.operations_count} كرت)
          </p>
        </div>

        {/* Current Debt */}
        <div className={`p-5 rounded-3xl border bg-gradient-to-br ${data.membership.current_debt > 0 ? 'from-rose-600/20 to-rose-900/20 border-rose-500/30' : 'from-emerald-600/20 to-emerald-900/20 border-emerald-500/30'}`}>
          <div className="flex items-center gap-3 mb-4">
            <div className={`p-3 rounded-xl ${data.membership.current_debt > 0 ? 'bg-rose-500/20 text-rose-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
              <BadgeAlert className="w-6 h-6" />
            </div>
            <div>
              <p className={`text-xs ${data.membership.current_debt > 0 ? (isDarkMode ? 'text-rose-400/70' : 'text-rose-700/70') : (isDarkMode ? 'text-emerald-400/70' : 'text-emerald-700/70')}`}>الديون الحالية (مبيعات آجلة)</p>
              <h3 className={`font-black text-xl ${data.membership.current_debt > 0 ? (isDarkMode ? 'text-rose-400' : 'text-rose-600') : (isDarkMode ? 'text-emerald-400' : 'text-emerald-600')}`}>
                {data.membership.current_debt} <span className="text-sm font-bold">ر.ي</span>
              </h3>
            </div>
          </div>
          <p className={`text-[10px] ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
            السقف المسموح: {data.membership.credit_limit} ر.ي
          </p>
        </div>

        {/* Debt Settlements (Payments) */}
        <div className={`p-5 rounded-3xl border ${isDarkMode ? 'bg-[#121927] border-slate-800' : 'bg-white border-slate-200'}`}>
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-xl bg-emerald-500/20 text-emerald-400">
              <DollarSign className="w-6 h-6" />
            </div>
            <div>
              <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>سدادات الديون المستلمة</p>
              <h3 className={`font-black text-xl ${isDarkMode ? 'text-emerald-400' : 'text-emerald-500'}`}>
                {data.settlements.reduce((sum: number, s: any) => sum + s.amount, 0)} <span className="text-sm font-bold text-emerald-500/50">ر.ي</span>
              </h3>
            </div>
          </div>
          <p className={`text-[10px] ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
            حسب الفلتر الحالي ({data.settlements.length} دفعة)
          </p>
        </div>
      </div>

      {/* Debt Settlements Statement */}
      <div className={`p-6 rounded-3xl border ${isDarkMode ? 'bg-[#121927] border-slate-800' : 'bg-white border-slate-200'}`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className={`font-bold flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
            <Wallet className="w-5 h-5 text-emerald-500" />
            دفعات سداد الديون (الاستلام يداً بيد)
          </h3>
        </div>
        
        {data.settlements.length === 0 ? (
          <p className={`text-center py-6 text-sm ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
            لا توجد دفعات سداد للفترة المحددة.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead>
                <tr className={`border-b ${isDarkMode ? 'border-slate-800 text-slate-400' : 'border-slate-200 text-slate-500'}`}>
                  <th className="py-3 px-3 font-bold">الرقم المرجعي</th>
                  <th className="py-3 px-3 font-bold">التاريخ والوقت</th>
                  <th className="py-3 px-3 font-bold text-center">المبلغ المستلم</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${isDarkMode ? 'divide-slate-800/50' : 'divide-slate-100'}`}>
                {data.settlements.map((s: any) => (
                  <tr key={s.id} className={isDarkMode ? 'hover:bg-slate-800/30' : 'hover:bg-slate-50'}>
                    <td className={`py-3 px-3 font-mono text-[10px] ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                      {s.reference_number}
                    </td>
                    <td className={`py-3 px-3 ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                      {new Date(s.created_at).toLocaleString('ar-YE', { year:'numeric', month:'2-digit', day:'2-digit', hour:'2-digit', minute:'2-digit' })}
                    </td>
                    <td className={`py-3 px-3 text-center font-bold ${isDarkMode ? 'text-emerald-400' : 'text-emerald-600'}`}>
                      +{s.amount} ر.ي
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Operations (Sales) Statement */}
      <div className={`p-6 rounded-3xl border ${isDarkMode ? 'bg-[#121927] border-slate-800' : 'bg-white border-slate-200'}`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <h3 className={`font-bold flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
            <History className="w-5 h-5 text-indigo-500" />
            مبيعات كروت شبكتك عن طريق هذه النقطة
          </h3>
          
          <div className="flex items-center gap-2">
            <Filter className={`w-4 h-4 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`} />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className={`text-xs p-2 rounded-xl border outline-none font-bold ${
                isDarkMode 
                  ? 'bg-slate-800 border-slate-700 text-white focus:border-indigo-500' 
                  : 'bg-slate-50 border-slate-200 text-slate-800 focus:border-indigo-500'
              }`}
            >
              <option value="today">اليوم</option>
              <option value="week">آخر 7 أيام</option>
              <option value="month">آخر 30 يوم</option>
              <option value="all">كل الأوقات</option>
            </select>
          </div>
        </div>

        {data.operations.length === 0 ? (
          <div className={`text-center py-10 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
            <History className="w-10 h-10 mx-auto mb-3 opacity-20" />
            <p>لا توجد مبيعات لكروت شبكتك من هذه النقطة للفترة المحددة.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead>
                <tr className={`border-b ${isDarkMode ? 'border-slate-800 text-slate-400' : 'border-slate-200 text-slate-500'}`}>
                  <th className="py-3 px-3 font-bold">الرقم المرجعي</th>
                  <th className="py-3 px-3 font-bold">التاريخ والوقت</th>
                  <th className="py-3 px-3 font-bold">رقم الكرت</th>
                  <th className="py-3 px-3 font-bold">الفئة</th>
                  <th className="py-3 px-3 font-bold text-center">طريقة الدفع للمالك</th>
                  <th className="py-3 px-3 font-bold text-center">السعر للمستخدم</th>
                  <th className="py-3 px-3 font-bold text-center">السعر المحتسب عليك</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${isDarkMode ? 'divide-slate-800/50' : 'divide-slate-100'}`}>
                {data.operations.map((op: any, i: number) => {
                  const hasPhone = op.customer_phone && op.customer_phone !== 'لم يدخل';
                  const isDebt = op.payment_method === 'دين (آجل)';
                  return (
                    <tr key={op.id || i} className={isDarkMode ? 'hover:bg-slate-800/30' : 'hover:bg-slate-50'}>
                      <td className={`py-3 px-3 font-mono text-[10px] ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                        {op.reference_number || 'بدون مرجع'}
                      </td>
                      <td className={`py-3 px-3 ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                        {new Date(op.purchased_at).toLocaleString('ar-YE', { year:'numeric', month:'2-digit', day:'2-digit', hour:'2-digit', minute:'2-digit' })}
                      </td>
                      <td className={`py-3 px-3 font-mono text-[10px] ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>{op.card_code}</td>
                      <td className={`py-3 px-3 font-bold ${isDarkMode ? 'text-indigo-300' : 'text-indigo-600'}`}>{op.category_name}</td>
                      <td className="py-3 px-3 text-center">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${isDebt ? 'bg-rose-500/10 text-rose-500' : 'bg-blue-500/10 text-blue-500'}`}>
                          {op.payment_method}
                        </span>
                      </td>
                      <td className={`py-3 px-3 text-center ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>{op.price}</td>
                      <td className={`py-3 px-3 text-center font-bold ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>{op.pos_price}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modals */}
      {modalMode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className={`w-full max-w-sm p-6 rounded-3xl border shadow-2xl ${isDarkMode ? 'bg-[#121927] border-slate-800' : 'bg-white border-slate-200'}`}>
            <h3 className="text-lg font-bold text-indigo-500 mb-4">
              {modalMode === 'credit' ? 'تعديل السقف المالي' : 'استلام دفعة سداد ديون'}
            </h3>
            
            {modalMode === 'credit' ? (
              <div className="space-y-4">
                <div>
                  <label className={`block text-xs font-bold mb-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>السقف المالي الجديد (ر.ي)</label>
                  <input
                    type="number"
                    value={newCreditLimit}
                    onChange={e => setNewCreditLimit(e.target.value)}
                    className={`w-full p-3 rounded-xl border font-mono text-left focus:ring-2 focus:ring-blue-500 outline-none ${isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'}`}
                  />
                  <p className="text-[10px] text-amber-500 mt-2">السقف المالي يسمح للبقالة بالاستدانة والشراء بدون رصيد كافي حتى الوصول لهذا الحد.</p>
                </div>
                <div className="flex gap-2 pt-2">
                  <button onClick={handleUpdateCreditLimit} className="flex-1 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold transition-all text-sm">حفظ التعديل</button>
                  <button onClick={() => setModalMode(null)} className="flex-1 py-3 rounded-xl bg-slate-700 hover:bg-slate-600 text-white font-bold transition-all text-sm">إلغاء</button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className={`block text-xs font-bold mb-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>المبلغ المستلم للسداد (ر.ي)</label>
                  <input
                    type="number"
                    value={paymentAmount}
                    onChange={e => setPaymentAmount(e.target.value)}
                    max={data.membership.current_debt}
                    className={`w-full p-3 rounded-xl border font-mono text-left focus:ring-2 focus:ring-emerald-500 outline-none ${isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'}`}
                  />
                  <p className="text-[10px] text-rose-400 mt-2">الديون الحالية: {data.membership.current_debt} ر.ي</p>
                </div>
                <div className="flex gap-2 pt-2">
                  <button onClick={handlePayDebt} className="flex-1 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition-all text-sm">تأكيد الاستلام</button>
                  <button onClick={() => setModalMode(null)} className="flex-1 py-3 rounded-xl bg-slate-700 hover:bg-slate-600 text-white font-bold transition-all text-sm">إلغاء</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
