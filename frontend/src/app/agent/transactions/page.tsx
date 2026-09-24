"use client";
import React, { useState, useEffect } from 'react';
import { useAppContext } from '../../../context/AppContext';
import { Receipt, Search, ArrowDownLeft, ArrowUpRight, CheckCircle2 } from 'lucide-react';

export default function AgentTransactionsPage() {
  const { isDarkMode } = useAppContext();
  const [transactions, setTransactions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const token = localStorage.getItem('auth_token');
        const res = await fetch('/api/agent/transactions', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setTransactions(data);
        }
      } catch (e) {
      } finally {
        setIsLoading(false);
      }
    };
    fetchTransactions();
  }, []);

  const filtered = transactions.filter(t => t.reference_number?.includes(search) || t.network_name?.includes(search));

  if (isLoading) {
    return <div className="flex justify-center p-12"><div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div></div>;
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className={`text-2xl font-black ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>السجل المالي</h1>
          <p className={`text-sm mt-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>سجل العمولات والمسحوبات الخاصة بك</p>
        </div>
        <div className="relative w-full sm:w-64">
          <input 
            type="text" 
            placeholder="البحث بالمرجع أو الشبكة..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={`w-full pl-4 pr-10 py-2.5 rounded-xl text-sm font-bold border transition-colors outline-none focus:ring-2 ${isDarkMode ? 'bg-[#1c2638] border-transparent focus:ring-blue-500 text-white' : 'bg-slate-50 border-slate-200 focus:ring-blue-500 text-slate-800'}`}
          />
          <Search className={`absolute right-3 top-3 w-4 h-4 ${isDarkMode ? 'text-slate-400' : 'text-slate-400'}`} />
        </div>
      </div>

      <div className={`rounded-3xl border overflow-hidden shadow-sm ${isDarkMode ? 'bg-[#101726] border-slate-800' : 'bg-white border-slate-200 shadow-slate-300/40'}`}>
        <div className="overflow-x-auto">
          <table className="w-full text-right text-sm">
            <thead className={`text-xs font-black uppercase ${isDarkMode ? 'bg-slate-800/50 text-slate-300' : 'bg-slate-50 text-slate-600'}`}>
              <tr>
                <th className="px-6 py-4 rounded-tr-3xl">العملية</th>
                <th className="px-6 py-4">المرجع</th>
                <th className="px-6 py-4">التاريخ</th>
                <th className="px-6 py-4">المبلغ</th>
                <th className="px-6 py-4 rounded-tl-3xl">الحالة</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${isDarkMode ? 'divide-slate-800' : 'divide-slate-100'}`}>
              {filtered.map((t) => (
                <tr key={t.id} className={`transition-colors ${isDarkMode ? 'hover:bg-slate-800/50' : 'hover:bg-slate-50'}`}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-xl ${t.type === 'commission' ? (isDarkMode ? 'bg-emerald-500/20 text-emerald-400' : 'bg-emerald-100 text-emerald-700') : (isDarkMode ? 'bg-red-500/20 text-red-400' : 'bg-red-100 text-red-700')}`}>
                        {t.type === 'commission' ? <ArrowDownLeft className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                      </div>
                      <div>
                        <div className={`font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                          {t.type === 'commission' ? 'عمولة شبكة' : 'سحب أرباح'}
                        </div>
                        <div className={`text-xs mt-0.5 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>{t.description}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`text-xs font-bold tracking-widest ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>{t.reference_number}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className={`font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{new Date(t.created_at).toLocaleDateString('ar-EG')}</div>
                    <div className={`text-xs mt-0.5 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>{new Date(t.created_at).toLocaleTimeString('ar-EG')}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`font-black tracking-widest ${t.type === 'commission' ? 'text-emerald-500' : 'text-red-500'}`}>
                      {t.type === 'commission' ? '+' : '-'}{t.amount.toLocaleString()} ر.ي
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold ${isDarkMode ? 'bg-emerald-500/20 text-emerald-400' : 'bg-emerald-100 text-emerald-700'}`}>
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>مكتمل</span>
                    </div>
                  </td>
                </tr>
              ))}
              
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className={`px-6 py-12 text-center text-sm font-bold ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                    لا توجد عمليات ماليّة بعد
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
