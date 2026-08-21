import React, { useEffect, useState } from 'react';
import { 
  User, 
  Phone, 
  Wallet, 
  Calendar, 
  CheckCircle2, 
  XCircle, 
  Key, 
  ArrowRightLeft, 
  ShoppingCart, 
  CreditCard,
  ArrowRight,
  TrendingUp,
  Download,
  AlertCircle,
  Clock
} from 'lucide-react';
import { useAppContext } from '@/context/AppContext';
import { useRouter } from 'next/navigation';

interface CustomerDetailsViewProps {
  customerId: string;
}

export const CustomerDetailsView: React.FC<CustomerDetailsViewProps> = ({ customerId }) => {
  const { isDarkMode } = useAppContext();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'purchases' | 'recharges'>('purchases');
  const [filterPeriod, setFilterPeriod] = useState('all');

  useEffect(() => {
    const fetchDetails = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/admin/customers/${customerId}/details`);
        if (res.ok) {
          const json = await res.json();
          setData(json);
        }
      } catch (err) {
        console.error('Error fetching customer details', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [customerId]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-blue-500 gap-4">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="font-bold text-lg">جاري تحميل بيانات العميل...</p>
      </div>
    );
  }

  if (!data || !data.customer) {
    return (
      <div className="text-center py-20 text-rose-500 font-bold">
        <AlertCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
        لم يتم العثور على بيانات العميل
      </div>
    );
  }

  const { customer, recharges, purchases } = data;

  // Filters
  const filterByPeriod = (items: any[], dateField: string) => {
    if (filterPeriod === 'all') return items;
    const now = new Date();
    return items.filter(item => {
      const itemDate = new Date(item[dateField]);
      if (filterPeriod === 'today') {
        return itemDate.toDateString() === now.toDateString();
      }
      if (filterPeriod === 'week') {
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return itemDate >= weekAgo;
      }
      if (filterPeriod === 'month') {
        return itemDate.getMonth() === now.getMonth() && itemDate.getFullYear() === now.getFullYear();
      }
      return true;
    });
  };

  const filteredPurchases = filterByPeriod(purchases, 'purchased_at');
  const filteredRecharges = filterByPeriod(recharges, 'created_at');

  return (
    <div className={`space-y-6 animate-in fade-in duration-300 font-['Cairo'] pb-10 ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>
      
      {/* Header and Back Button */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => router.push('/admin/customers')}
          className={`flex items-center gap-2 text-sm font-bold px-4 py-2 rounded-xl transition-all ${
            isDarkMode ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'bg-white text-slate-600 hover:bg-slate-100 shadow-sm border border-slate-200'
          }`}
        >
          <ArrowRight className="w-4 h-4" />
          <span>العودة لقائمة العملاء</span>
        </button>
      </div>

      {/* Customer Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Profile Card */}
        <div className={`col-span-1 md:col-span-2 lg:col-span-2 p-6 rounded-3xl border shadow-lg relative overflow-hidden ${
          isDarkMode ? 'bg-gradient-to-bl from-slate-900 to-[#121927] border-slate-800' : 'bg-gradient-to-bl from-white to-blue-50 border-blue-100'
        }`}>
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl -mr-10 -mt-10"></div>
          
          <div className="flex items-start gap-4 relative z-10">
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 shadow-inner ${
              isDarkMode ? 'bg-slate-800 text-blue-400' : 'bg-blue-100 text-blue-600'
            }`}>
              <User className="w-8 h-8" />
            </div>
            
            <div className="space-y-3 flex-1">
              <div>
                <h2 className="text-2xl font-black">{customer.name}</h2>
                <div className="flex items-center gap-2 mt-1">
                  <Phone className={`w-4 h-4 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`} />
                  <span className={`font-mono text-sm font-bold ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`} dir="ltr">
                    {customer.phone}
                  </span>
                </div>
              </div>
              
              <div className="flex flex-wrap items-center gap-2">
                <span className={`px-3 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1.5 ${
                  customer.is_active ? 'bg-emerald-500/20 text-emerald-500' : 'bg-rose-500/20 text-rose-500'
                }`}>
                  {customer.is_active ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                  {customer.is_active ? 'حساب مفعل' : 'غير مفعل'}
                </span>
                
                {customer.otp_code && (
                  <span className={`px-3 py-1 rounded-lg text-[10px] font-bold font-mono tracking-widest flex items-center gap-1.5 ${
                    isDarkMode ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'bg-amber-100 text-amber-600 border border-amber-200'
                  }`}>
                    <Key className="w-3 h-3" />
                    {customer.otp_code}
                  </span>
                )}
                
                <span className={`px-3 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1.5 ${
                  isDarkMode ? 'bg-slate-800 text-slate-400' : 'bg-slate-200 text-slate-600'
                }`}>
                  <Calendar className="w-3 h-3" />
                  انضم: {new Date(customer.joined_at).toLocaleDateString('ar-YE')}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Wallet Balance Card */}
        <div className={`p-6 rounded-3xl border shadow-lg relative overflow-hidden flex flex-col justify-center ${
          isDarkMode ? 'bg-gradient-to-br from-emerald-900/40 to-emerald-950/20 border-emerald-500/30' : 'bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200'
        }`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className={`text-sm font-bold flex items-center gap-2 ${isDarkMode ? 'text-emerald-400' : 'text-emerald-700'}`}>
              <Wallet className="w-5 h-5" />
              رصيد المحفظة
            </h3>
          </div>
          <div className={`text-4xl font-black tracking-tight ${isDarkMode ? 'text-emerald-300' : 'text-emerald-700'}`}>
            {customer.wallet_balance.toLocaleString('en-US')} <span className="text-sm font-normal">ر.ي</span>
          </div>
        </div>

        {/* Total Purchases Summary Card */}
        <div className={`p-6 rounded-3xl border shadow-lg relative overflow-hidden flex flex-col justify-center ${
          isDarkMode ? 'bg-gradient-to-br from-indigo-900/40 to-indigo-950/20 border-indigo-500/30' : 'bg-gradient-to-br from-indigo-50 to-indigo-100 border-indigo-200'
        }`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className={`text-sm font-bold flex items-center gap-2 ${isDarkMode ? 'text-indigo-400' : 'text-indigo-700'}`}>
              <ShoppingCart className="w-5 h-5" />
              إجمالي عمليات الشراء
            </h3>
          </div>
          <div className={`text-4xl font-black tracking-tight ${isDarkMode ? 'text-indigo-300' : 'text-indigo-700'}`}>
            {purchases.length} <span className="text-sm font-normal text-indigo-500">كرت</span>
          </div>
          <div className={`text-xs mt-2 font-bold ${isDarkMode ? 'text-indigo-400' : 'text-indigo-600'}`}>
            بقيمة: {purchases.reduce((acc: number, curr: any) => acc + (curr.price || 0), 0).toLocaleString('en-US')} ر.ي
          </div>
        </div>
      </div>

      {/* Main Operations Section */}
      <div className={`p-6 rounded-3xl border shadow-lg space-y-6 ${
        isDarkMode ? 'bg-[#121927] border-slate-800' : 'bg-white border-slate-200'
      }`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Tabs */}
          <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-900 p-1.5 rounded-2xl w-full md:w-auto overflow-x-auto">
            <button
              onClick={() => setActiveTab('purchases')}
              className={`flex-1 md:flex-none px-6 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap flex items-center justify-center gap-2 ${
                activeTab === 'purchases'
                  ? 'bg-indigo-500 text-white shadow-md'
                  : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800'
              }`}
            >
              <CreditCard className="w-4 h-4" />
              مشتريات الكروت
              <span className="px-2 py-0.5 rounded-full bg-indigo-600/20 text-[10px] font-black">{purchases.length}</span>
            </button>
            <button
              onClick={() => setActiveTab('recharges')}
              className={`flex-1 md:flex-none px-6 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap flex items-center justify-center gap-2 ${
                activeTab === 'recharges'
                  ? 'bg-emerald-500 text-white shadow-md'
                  : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800'
              }`}
            >
              <ArrowRightLeft className="w-4 h-4" />
              عمليات التغذية
              <span className="px-2 py-0.5 rounded-full bg-emerald-600/20 text-[10px] font-black">{recharges.length}</span>
            </button>
          </div>

          {/* Time Filter */}
          <select
            value={filterPeriod}
            onChange={(e) => setFilterPeriod(e.target.value)}
            className={`px-4 py-2.5 rounded-xl text-sm font-bold border outline-none focus:ring-2 ring-blue-500 ${
              isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-200' : 'bg-slate-50 border-slate-200 text-slate-700'
            }`}
          >
            <option value="all">كل الأوقات</option>
            <option value="today">اليوم</option>
            <option value="week">آخر 7 أيام</option>
            <option value="month">هذا الشهر</option>
          </select>
        </div>

        {/* Content based on Tab */}
        <div className="overflow-x-auto min-h-[300px]">
          {activeTab === 'purchases' && (
            filteredPurchases.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                <ShoppingCart className="w-16 h-16 opacity-20 mb-4" />
                <p className="font-bold">لا يوجد عمليات شراء {filterPeriod !== 'all' ? 'في هذه الفترة' : ''}</p>
              </div>
            ) : (
              <table className="w-full text-right text-xs">
                <thead>
                  <tr className={`border-b ${isDarkMode ? 'border-slate-800 text-slate-400' : 'border-slate-200 text-slate-500'}`}>
                    <th className="py-3 px-4 font-bold">التاريخ والوقت</th>
                    <th className="py-3 px-4 font-bold">الشبكة / الفئة</th>
                    <th className="py-3 px-4 font-bold">رقم الكرت (التسلسلي)</th>
                    <th className="py-3 px-4 font-bold text-center">الرقم المرجعي (وسيلة الدفع)</th>
                    <th className="py-3 px-4 font-bold text-center">المبلغ</th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${isDarkMode ? 'divide-slate-800' : 'divide-slate-100'}`}>
                  {filteredPurchases.map((purchase: any) => (
                    <tr key={purchase.id} className={`transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50`}>
                      <td className="py-4 px-4 whitespace-nowrap">
                        <div className="font-bold">{new Date(purchase.purchased_at).toLocaleDateString('ar-YE')}</div>
                        <div className="text-[10px] text-slate-400">{new Date(purchase.purchased_at).toLocaleTimeString('ar-YE')}</div>
                      </td>
                      <td className="py-4 px-4 whitespace-nowrap">
                        <div className="font-bold text-indigo-500">{purchase.network_name}</div>
                        <div className="text-[11px] text-slate-500">{purchase.package_name}</div>
                      </td>
                      <td className="py-4 px-4 whitespace-nowrap">
                        <span className={`font-mono px-2 py-1 rounded-md text-[11px] ${isDarkMode ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-700'}`}>
                          {purchase.serial_number}
                        </span>
                        <div className="mt-1">
                          <span className={`font-mono px-2 py-0.5 rounded-md text-[10px] font-bold tracking-widest ${isDarkMode ? 'bg-emerald-500/10 text-emerald-400' : 'bg-emerald-50 text-emerald-600'}`}>
                            {purchase.pin_code}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-4 whitespace-nowrap text-center">
                        <span className={`font-mono px-2 py-1 rounded-md text-[11px] font-bold ${
                          purchase.reference_number === 'دفع من المحفظة' 
                            ? 'bg-blue-500/10 text-blue-500' 
                            : isDarkMode ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-700'
                        }`}>
                          {purchase.reference_number}
                        </span>
                      </td>
                      <td className="py-4 px-4 whitespace-nowrap text-center">
                        <span className="font-black text-rose-500 text-sm">
                          {purchase.price.toLocaleString('en-US')} <span className="text-[10px] font-normal">ر.ي</span>
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )
          )}

          {activeTab === 'recharges' && (
            filteredRecharges.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                <Wallet className="w-16 h-16 opacity-20 mb-4" />
                <p className="font-bold">لا يوجد عمليات تغذية رصيد {filterPeriod !== 'all' ? 'في هذه الفترة' : ''}</p>
              </div>
            ) : (
              <table className="w-full text-right text-xs">
                <thead>
                  <tr className={`border-b ${isDarkMode ? 'border-slate-800 text-slate-400' : 'border-slate-200 text-slate-500'}`}>
                    <th className="py-3 px-4 font-bold">التاريخ والوقت</th>
                    <th className="py-3 px-4 font-bold">طريقة الإيداع</th>
                    <th className="py-3 px-4 font-bold text-center">الرقم المرجعي</th>
                    <th className="py-3 px-4 font-bold text-center">المبلغ المودع</th>
                    <th className="py-3 px-4 font-bold">الحالة</th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${isDarkMode ? 'divide-slate-800' : 'divide-slate-100'}`}>
                  {filteredRecharges.map((recharge: any) => (
                    <tr key={recharge.id} className={`transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50`}>
                      <td className="py-4 px-4 whitespace-nowrap">
                        <div className="font-bold">{new Date(recharge.created_at).toLocaleDateString('ar-YE')}</div>
                        <div className="text-[10px] text-slate-400">{new Date(recharge.created_at).toLocaleTimeString('ar-YE')}</div>
                      </td>
                      <td className="py-4 px-4 whitespace-nowrap">
                        <div className="font-bold flex flex-col gap-1 text-blue-500">
                          <span>{recharge.receipt_image === 'automated_overpayment' ? 'فائض شراء تلقائي' : 'إيداع إداري/تطبيق'}</span>
                          <span className="text-[10px] font-mono text-slate-500">{recharge.bank_name || 'تلقائي'}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4 whitespace-nowrap text-center">
                        {recharge.receipt_image === 'automated_overpayment' ? (
                          <span className="text-slate-400 text-[11px]">-</span>
                        ) : (
                          <span className={`font-mono px-2 py-1 rounded-md text-[11px] font-bold ${isDarkMode ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-700'}`}>
                            {recharge.receipt_image || 'لا يوجد مرجع'}
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-4 whitespace-nowrap text-center">
                        <span className="font-black text-emerald-500 text-sm">
                          +{recharge.amount.toLocaleString('en-US')} <span className="text-[10px] font-normal">ر.ي</span>
                        </span>
                      </td>
                      <td className="py-4 px-4 whitespace-nowrap">
                        {recharge.status === 'approved' ? (
                          <span className="px-2 py-1 rounded-md bg-emerald-500/20 text-emerald-500 text-[10px] font-bold flex items-center gap-1 w-max">
                            <CheckCircle2 className="w-3 h-3" />
                            مكتمل
                          </span>
                        ) : recharge.status === 'pending' ? (
                          <span className="px-2 py-1 rounded-md bg-amber-500/20 text-amber-500 text-[10px] font-bold flex items-center gap-1 w-max">
                            <Clock className="w-3 h-3" />
                            قيد المراجعة
                          </span>
                        ) : (
                          <span className="px-2 py-1 rounded-md bg-rose-500/20 text-rose-500 text-[10px] font-bold flex items-center gap-1 w-max">
                            <XCircle className="w-3 h-3" />
                            مرفوض
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )
          )}
        </div>
      </div>
    </div>
  );
};
