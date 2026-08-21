import React, { useEffect, useState } from 'react';
import { Users } from 'lucide-react';
import { useAppContext } from '@/context/AppContext';
export const CustomersView: React.FC = () => {
  const { isDarkMode } = useAppContext();
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCustomers = async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/admin/customers');
        if (res.ok) {
          const data = await res.json();
          setCustomers(data);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchCustomers();
  }, []);

  const handleRefresh = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/customers');
      if (res.ok) {
        const data = await res.json();
        setCustomers(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div
        className={`p-6 rounded-3xl border space-y-4 ${
          isDarkMode ? 'bg-[#121927] border-slate-800' : 'bg-white border-slate-200'
        }`}
      >
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-black text-white">قاعدة العملاء المشترين</h3>
            <p className="text-xs text-slate-400">سجل العملاء الذين قاموا بالتسجيل في النظام</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleRefresh}
              disabled={loading}
              className="p-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-xl transition-all disabled:opacity-50"
              title="تحديث البيانات"
            >
              <svg className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
            <div className="px-4 py-2 rounded-xl bg-indigo-600/20 text-indigo-400 font-bold text-xs flex items-center gap-2">
              <Users className="w-4 h-4" />
              <span>إجمالي العملاء: {customers.length}</span>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="text-center py-10 text-slate-400">جاري تحميل البيانات...</div>
          ) : customers.length === 0 ? (
            <div className="text-center py-10 text-slate-500 font-bold">لا يوجد عملاء مسجلين بعد</div>
          ) : (
            <table className="w-full text-right text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 pb-2">
                  <th className="py-2.5 px-3">اسم العميل</th>
                  <th className="py-2.5 px-3">رقم الهاتف (الاسم كمعرف)</th>
                  <th className="py-2.5 px-3">تاريخ التسجيل</th>
                  <th className="py-2.5 px-3 text-center">رمز OTP (التحقق/الاستعادة)</th>
                  <th className="py-2.5 px-3">الحالة</th>
                  <th className="py-2.5 px-3 text-center">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {customers.map((c, i) => (
                  <tr key={i} className="hover:bg-slate-800/30">
                    <td className="py-3 px-3 font-bold text-white">{c.name}</td>
                    <td className="py-3 px-3 font-mono text-slate-300" dir="ltr">{c.phone}</td>
                    <td className="py-3 px-3 text-slate-400">{c.created_at ? new Date(c.created_at).toLocaleDateString('ar-YE') : new Date().toLocaleDateString('ar-YE')}</td>
                    <td className="py-3 px-3 text-center">
                      {c.otp_code ? (
                        <span className="font-mono text-amber-400 font-bold tracking-widest bg-amber-500/10 px-2 py-1 rounded-md border border-amber-500/30">
                          {c.otp_code}
                        </span>
                      ) : (
                        <span className="text-slate-500">-</span>
                      )}
                    </td>
                    <td className="py-3 px-3">
                      {c.phone_verified_at ? (
                        <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-400 font-bold text-[10px]">مفعل</span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-md bg-rose-500/20 text-rose-400 font-bold text-[10px]">غير مفعل</span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <a 
                        href={`/admin/customers/${c.id}`} 
                        className="inline-block px-3 py-1.5 rounded-lg bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 font-bold transition-colors text-[11px]"
                      >
                        عرض التفاصيل
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};
