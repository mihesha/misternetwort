"use client";

import React, { useState, useEffect } from 'react';
import { useAppContext } from '../../../context/AppContext';
import { CheckCircle2, Clock, XCircle, Search, DollarSign } from 'lucide-react';

export default function AppDepositsPage() {
  const { isDarkMode } = useAppContext();
  const [deposits, setDeposits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchDeposits = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/app-deposits');
      if (res.ok) {
        const data = await res.json();
        setDeposits(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeposits();
  }, []);

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      const res = await fetch(`/api/admin/app-deposits/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        fetchDeposits();
      } else {
        alert('حدث خطأ أثناء تحديث الحالة');
      }
    } catch (e) {
      alert('فشل الاتصال بالخادم');
    }
  };

  const filteredDeposits = deposits.filter((d) => 
    d.reference_number.includes(searchQuery) ||
    d.wallet_name.includes(searchQuery)
  );

  return (
    <div className="space-y-6 animate-in fade-in zoom-in-95 duration-200">
      <div className={`p-4 rounded-2xl flex flex-col md:flex-row gap-4 items-center justify-between border ${isDarkMode ? 'bg-[#1e2638] border-slate-700' : 'bg-white border-slate-200'}`}>
        <div>
          <h2 className="text-lg font-bold">إيداعات تطبيق الهاتف والمحافظ</h2>
          <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>قم بتأكيد عمليات الإيداع التي تصل من التطبيق ليتمكن العملاء من استخدامها لشراء الكروت.</p>
        </div>
        <div className="flex gap-2">
           <button onClick={fetchDeposits} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold transition-colors">
              تحديث البيانات
           </button>
        </div>
      </div>

      <div className={`p-6 rounded-2xl border ${isDarkMode ? 'bg-[#1e2638] border-slate-700' : 'bg-white border-slate-200'}`}>
        <div className="flex items-center gap-2 mb-6">
          <div className="relative flex-1 max-w-sm">
            <Search className={`absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`} />
            <input
              type="text"
              placeholder="ابحث برقم المرجع أو المحفظة..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full pr-9 pl-4 py-2 rounded-xl text-sm border focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all ${
                isDarkMode 
                  ? 'bg-[#0b101d] border-slate-700 text-white placeholder-slate-500' 
                  : 'bg-slate-50 border-slate-200 text-slate-800 placeholder-slate-400'
              }`}
            />
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-40">
            <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filteredDeposits.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${isDarkMode ? 'bg-slate-800 text-slate-500' : 'bg-slate-100 text-slate-400'}`}>
              <DollarSign className="w-8 h-8" />
            </div>
            <p className="font-bold">لا توجد إيداعات مطابقة</p>
            <p className={`text-sm mt-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>لم يتم العثور على أي عمليات إيداع.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-sm">
              <thead className={`${isDarkMode ? 'bg-slate-800/50 text-slate-400' : 'bg-slate-50 text-slate-500'}`}>
                <tr>
                  <th className="px-4 py-3 font-semibold rounded-r-xl">رقم المرجع</th>
                  <th className="px-4 py-3 font-semibold">المحفظة</th>
                  <th className="px-4 py-3 font-semibold">المبلغ</th>
                  <th className="px-4 py-3 font-semibold">التاريخ</th>
                  <th className="px-4 py-3 font-semibold">الحالة</th>
                  <th className="px-4 py-3 font-semibold rounded-l-xl text-center">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-700/50">
                {filteredDeposits.map((d) => (
                  <tr key={d.id} className={`transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/30`}>
                    <td className="px-4 py-4 font-mono font-bold">{d.reference_number}</td>
                    <td className="px-4 py-4">{d.wallet_name}</td>
                    <td className="px-4 py-4 font-bold text-emerald-500">{d.amount} ر.ي</td>
                    <td className="px-4 py-4" dir="ltr">{new Date(d.created_at).toLocaleString('en-US')}</td>
                    <td className="px-4 py-4">
                      {d.status === 'pending' && <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-500/10 text-amber-500 border border-amber-500/20"><Clock className="w-3.5 h-3.5" /> بانتظار التأكيد</span>}
                      {d.status === 'confirmed' && <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-indigo-500/10 text-indigo-500 border border-indigo-500/20"><CheckCircle2 className="w-3.5 h-3.5" /> مؤكد وجاهز للاستخدام</span>}
                      {d.status === 'used' && <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"><CheckCircle2 className="w-3.5 h-3.5" /> تم الاستخدام (شراء كرت)</span>}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center justify-center gap-2">
                        {d.status === 'pending' && (
                          <button
                            onClick={() => handleUpdateStatus(d.id, 'confirmed')}
                            className="px-3 py-1.5 bg-indigo-600/10 hover:bg-indigo-600 hover:text-white text-indigo-500 rounded-lg text-xs font-bold transition-colors"
                          >
                            تأكيد الإيداع
                          </button>
                        )}
                        {d.status === 'confirmed' && (
                          <button
                            onClick={() => handleUpdateStatus(d.id, 'pending')}
                            className="px-3 py-1.5 bg-amber-600/10 hover:bg-amber-600 hover:text-white text-amber-500 rounded-lg text-xs font-bold transition-colors"
                          >
                            إلغاء التأكيد
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
