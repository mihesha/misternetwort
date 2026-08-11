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
          <div className="px-4 py-2 rounded-xl bg-indigo-600/20 text-indigo-400 font-bold text-xs flex items-center gap-2">
            <Users className="w-4 h-4" />
            <span>إجمالي العملاء: {customers.length}</span>
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
                  <th className="py-2.5 px-3">الحالة</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {customers.map((c, i) => (
                  <tr key={i} className="hover:bg-slate-800/30">
                    <td className="py-3 px-3 font-bold text-white">{c.name}</td>
                    <td className="py-3 px-3 font-mono text-slate-300" dir="ltr">{c.phone}</td>
                    <td className="py-3 px-3 text-slate-400">{new Date().toLocaleDateString('ar-YE')}</td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-400 font-bold text-[10px]">نشط</span>
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
