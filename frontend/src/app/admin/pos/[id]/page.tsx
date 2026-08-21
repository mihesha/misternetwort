"use client";
import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAppContext } from '@/context/AppContext';
import { 
  ArrowRight, User, Phone, Store, Wallet, Clock, 
  TrendingUp, CreditCard, Activity, DollarSign, Filter, 
  Wifi, BadgeAlert, History, MapPin
} from 'lucide-react';

export default function PosDetailsPage() {
  const { isDarkMode } = useAppContext();
  const params = useParams();
  const router = useRouter();
  const id = params.id;

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [filter, setFilter] = useState('all'); // all, today, week, month

  useEffect(() => {
    fetchData();
  }, [filter, id]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/pos/${id}/details?filter=${filter}`);
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
            تفاصيل نقطة البيع
          </h2>
          <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
            عرض التقارير، العمليات، الديون، وأرصدة نقطة البيع
          </p>
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
              <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>صاحب النقطة</p>
              <h3 className={`font-bold ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>{data.user.name}</h3>
            </div>
          </div>
          <div className="space-y-2 text-xs">
            <div className={`flex items-center gap-2 ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
              <Store className="w-4 h-4 text-slate-400" />
              <span>المحل: {data.user.shop_name || 'غير محدد'}</span>
            </div>
            <div className={`flex items-center gap-2 ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
              <Phone className="w-4 h-4 text-slate-400" />
              <span dir="ltr">{data.user.phone}</span>
            </div>
          </div>
        </div>

        {/* Wallet Balance */}
        <div className={`p-5 rounded-3xl border bg-gradient-to-br from-emerald-600/20 to-emerald-900/20 border-emerald-500/30`}>
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-xl bg-emerald-500/20 text-emerald-400">
              <Wallet className="w-6 h-6" />
            </div>
            <div>
              <p className={`text-xs ${isDarkMode ? 'text-emerald-400/70' : 'text-emerald-700/70'}`}>رصيد المحفظة</p>
              <h3 className={`font-black text-xl ${isDarkMode ? 'text-emerald-400' : 'text-emerald-600'}`}>
                {data.user.wallet_balance} <span className="text-sm font-bold">ر.ي</span>
              </h3>
            </div>
          </div>
          <p className={`text-xs ${isDarkMode ? 'text-emerald-400/50' : 'text-emerald-700/60'}`}>
            الرصيد المتاح حالياً للمشتريات
          </p>
        </div>

        {/* Total Sales (Filtered) */}
        <div className={`p-5 rounded-3xl border ${isDarkMode ? 'bg-[#121927] border-slate-800' : 'bg-white border-slate-200'}`}>
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-xl bg-blue-500/20 text-blue-400">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>إجمالي المبيعات</p>
              <h3 className={`font-black text-xl ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
                {data.stats.total_sales} <span className="text-sm font-bold text-slate-500">ر.ي</span>
              </h3>
            </div>
          </div>
          <p className={`text-[10px] ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
            حسب الفلتر الحالي ({data.stats.operations_count} عملية)
          </p>
        </div>

        {/* Total Profits (Filtered) */}
        <div className={`p-5 rounded-3xl border ${isDarkMode ? 'bg-[#121927] border-slate-800' : 'bg-white border-slate-200'}`}>
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-xl bg-amber-500/20 text-amber-400">
              <DollarSign className="w-6 h-6" />
            </div>
            <div>
              <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>أرباح النقطة</p>
              <h3 className={`font-black text-xl ${isDarkMode ? 'text-amber-400' : 'text-amber-500'}`}>
                {data.stats.total_profit} <span className="text-sm font-bold text-amber-500/50">ر.ي</span>
              </h3>
            </div>
          </div>
          <p className={`text-[10px] ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
            فارق السعر الخاص بالسعر العام
          </p>
        </div>
      </div>

      {/* Networks & Debts */}
      <div className={`p-6 rounded-3xl border ${isDarkMode ? 'bg-[#121927] border-slate-800' : 'bg-white border-slate-200'}`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className={`font-bold flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
            <Wifi className="w-5 h-5 text-indigo-500" />
            الشبكات المنضم إليها ({data.networks.length})
          </h3>
          <div className="px-3 py-1.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs font-bold flex items-center gap-1">
            <BadgeAlert className="w-4 h-4" />
            إجمالي الديون: {data.user.total_debt} ر.ي
          </div>
        </div>
        
        {data.networks.length === 0 ? (
          <p className={`text-center py-6 text-sm ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
            نقطة البيع هذه لم تنضم لأي شبكة بعد.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead>
                <tr className={`border-b ${isDarkMode ? 'border-slate-800 text-slate-400' : 'border-slate-200 text-slate-500'}`}>
                  <th className="py-3 px-3 font-bold">اسم الشبكة</th>
                  <th className="py-3 px-3 font-bold text-center">السقف المالي</th>
                  <th className="py-3 px-3 font-bold text-center">الديون الحالية</th>
                  <th className="py-3 px-3 font-bold text-center">الرصيد المتاح (الآجل)</th>
                  <th className="py-3 px-3 font-bold text-center">تاريخ الانضمام</th>
                  <th className="py-3 px-3 font-bold text-center">الحالة</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${isDarkMode ? 'divide-slate-800/50' : 'divide-slate-100'}`}>
                {data.networks.map((net: any) => {
                  const availableCredit = Math.max(0, net.credit_limit - net.current_debt);
                  return (
                    <tr key={net.id} className={isDarkMode ? 'hover:bg-slate-800/30' : 'hover:bg-slate-50'}>
                      <td className={`py-3 px-3 font-bold ${isDarkMode ? 'text-indigo-400' : 'text-indigo-600'}`}>{net.name}</td>
                      <td className={`py-3 px-3 text-center ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>{net.credit_limit} ر.ي</td>
                      <td className={`py-3 px-3 text-center font-bold ${net.current_debt > 0 ? 'text-rose-500' : (isDarkMode ? 'text-slate-500' : 'text-slate-400')}`}>
                        {net.current_debt} ر.ي
                      </td>
                      <td className={`py-3 px-3 text-center font-bold ${availableCredit > 0 ? 'text-emerald-500' : (isDarkMode ? 'text-slate-500' : 'text-slate-400')}`}>
                        {availableCredit} ر.ي
                      </td>
                      <td className={`py-3 px-3 text-center ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                        {new Date(net.joined_at).toLocaleDateString('ar-YE')}
                      </td>
                      <td className="py-3 px-3 text-center">
                        {net.status === 'active' ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-500">نشط</span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-500">معلق</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Wallet Recharges & Deposits */}
      <div className={`p-6 rounded-3xl border ${isDarkMode ? 'bg-[#121927] border-slate-800' : 'bg-white border-slate-200'}`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className={`font-bold flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
            <Wallet className="w-5 h-5 text-emerald-500" />
            عمليات الإيداع وتغذية رصيد المحفظة ({data.recharges?.length || 0})
          </h3>
        </div>
        
        {!data.recharges || data.recharges.length === 0 ? (
          <p className={`text-center py-6 text-sm ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
            لا توجد أي عمليات إيداع أو شحن للمحفظة حتى الآن.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead>
                <tr className={`border-b ${isDarkMode ? 'border-slate-800 text-slate-400' : 'border-slate-200 text-slate-500'}`}>
                  <th className="py-3 px-3 font-bold">الرقم المرجعي</th>
                  <th className="py-3 px-3 font-bold">التاريخ والوقت</th>
                  <th className="py-3 px-3 font-bold text-center">المبلغ</th>
                  <th className="py-3 px-3 font-bold text-center">المحفظة (البنك)</th>
                  <th className="py-3 px-3 font-bold text-center">الإيصال المرفق</th>
                  <th className="py-3 px-3 font-bold text-center">الحالة</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${isDarkMode ? 'divide-slate-800/50' : 'divide-slate-100'}`}>
                {data.recharges.map((r: any) => {
                  return (
                    <tr key={r.id} className={isDarkMode ? 'hover:bg-slate-800/30' : 'hover:bg-slate-50'}>
                      <td className={`py-3 px-3 font-mono text-[10px] ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                        {r.reference_number || 'غير متوفر'}
                      </td>
                      <td className={`py-3 px-3 ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                        {new Date(r.created_at).toLocaleString('ar-YE', { year:'numeric', month:'2-digit', day:'2-digit', hour:'2-digit', minute:'2-digit' })}
                      </td>
                      <td className={`py-3 px-3 text-center font-bold ${isDarkMode ? 'text-emerald-400' : 'text-emerald-600'}`}>
                        {r.amount} ر.ي
                      </td>
                      <td className={`py-3 px-3 text-center font-bold ${isDarkMode ? 'text-indigo-400' : 'text-indigo-600'}`}>
                        {r.bank_name}
                      </td>
                      <td className="py-3 px-3 text-center">
                        {r.receipt_image ? (
                          <a href={`/storage/${r.receipt_image}`} target="_blank" rel="noreferrer" className="text-blue-500 hover:underline">عرض الإيصال</a>
                        ) : (
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-500`}>عملية آلية API</span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-center">
                        {r.status === 'approved' ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-500">مكتمل</span>
                        ) : r.status === 'pending' ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-500">قيد المراجعة</span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/10 text-rose-500">مرفوض</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
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
            كشف حساب العمليات ومبيعات الكروت
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
            <p>لا توجد عمليات مبيعات للفترة المحددة.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead>
                <tr className={`border-b ${isDarkMode ? 'border-slate-800 text-slate-400' : 'border-slate-200 text-slate-500'}`}>
                  <th className="py-3 px-3 font-bold">الرقم المرجعي</th>
                  <th className="py-3 px-3 font-bold">التاريخ والوقت</th>
                  <th className="py-3 px-3 font-bold">الشبكة</th>
                  <th className="py-3 px-3 font-bold">رقم الكرت</th>
                  <th className="py-3 px-3 font-bold">الفئة</th>
                  <th className="py-3 px-3 font-bold text-center">طريقة الدفع</th>
                  <th className="py-3 px-3 font-bold text-center">الإرسال (SMS)</th>
                  <th className="py-3 px-3 font-bold text-center">سعر العميل</th>
                  <th className="py-3 px-3 font-bold text-center">تكلفة النقطة</th>
                  <th className="py-3 px-3 font-bold text-center">الربح</th>
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
                      <td className={`py-3 px-3 font-bold ${isDarkMode ? 'text-indigo-300' : 'text-indigo-600'}`}>{op.network_name}</td>
                      <td className={`py-3 px-3 font-mono text-[10px] ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>{op.card_code}</td>
                      <td className={`py-3 px-3 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>{op.category_name}</td>
                      <td className="py-3 px-3 text-center">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${isDebt ? 'bg-rose-500/10 text-rose-500' : 'bg-emerald-500/10 text-emerald-500'}`}>
                          {op.payment_method}
                        </span>
                      </td>
                      <td className="py-3 px-3 flex justify-center">
                        {hasPhone ? (
                          <div className="flex items-center gap-1.5 text-emerald-500 font-mono text-[10px] bg-emerald-500/10 w-fit px-2 py-0.5 rounded">
                            <Phone className="w-3 h-3" />
                            {op.customer_phone}
                          </div>
                        ) : (
                          <span className={`text-[10px] ${isDarkMode ? 'text-slate-600' : 'text-slate-400'}`}>لم يتم الإدخال</span>
                        )}
                      </td>
                      <td className={`py-3 px-3 text-center font-bold ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>{op.price}</td>
                      <td className={`py-3 px-3 text-center ${isDarkMode ? 'text-rose-400/80' : 'text-rose-600/80'}`}>{op.pos_price}</td>
                      <td className="py-3 px-3 text-center font-black text-amber-500">+{op.profit}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}
