// PosRechargesView Component
import React, { useEffect, useState } from 'react';
import { CreditCard, CheckCircle, XCircle } from 'lucide-react';
import { useAppContext } from '@/context/AppContext';

export const PosRechargesView: React.FC = () => {
  const { isDarkMode } = useAppContext();
  const [recharges, setRecharges] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRecharges = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/pos-recharges');
      if (res.ok) {
        const data = await res.json();
        setRecharges(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecharges();
  }, []);

  const handleAction = async (id: number, status: 'approved' | 'rejected') => {
    if (!confirm(`هل أنت متأكد من ${status === 'approved' ? 'قبول' : 'رفض'} هذا الطلب؟`)) return;
    try {
      const res = await fetch(`/api/admin/pos-recharges/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        fetchRecharges();
      } else {
        const err = await res.json();
        alert(err.error || 'حدث خطأ');
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className={`p-6 rounded-3xl border space-y-4 ${isDarkMode ? 'bg-[#121927] border-slate-800' : 'bg-white border-slate-200'}`}>
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-black text-white">طلبات شحن نقاط البيع</h3>
            <p className="text-xs text-slate-400">مراجعة الحوالات المالية وإيداعها في محافظ نقاط البيع</p>
          </div>
          <div className="px-4 py-2 rounded-xl bg-amber-500/20 text-amber-400 font-bold text-xs flex items-center gap-2">
            <CreditCard className="w-4 h-4" />
            <span>الطلبات المعلقة: {recharges.filter(r => r.status === 'pending').length}</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="text-center py-10 text-slate-400">جاري تحميل البيانات...</div>
          ) : (
            <table className="w-full text-right text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 pb-2">
                  <th className="py-2.5 px-3">صاحب الطلب</th>
                  <th className="py-2.5 px-3">المبلغ</th>
                  <th className="py-2.5 px-3">البنك / المحفظة</th>
                  <th className="py-2.5 px-3">تاريخ الطلب</th>
                  <th className="py-2.5 px-3">الإيصال</th>
                  <th className="py-2.5 px-3">الحالة والإجراء</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {recharges.map((r, i) => (
                  <tr key={i} className="hover:bg-slate-800/30">
                    <td className="py-3 px-3 font-mono text-slate-300" dir="ltr">{r.user?.phone}</td>
                    <td className="py-3 px-3 font-bold text-emerald-400">{r.amount} ر.ي</td>
                    <td className="py-3 px-3 text-slate-300">{r.bank_name}</td>
                    <td className="py-3 px-3 text-slate-400">{new Date(r.created_at).toLocaleString('ar-YE')}</td>
                    <td className="py-3 px-3">
                      <a href={`/storage/${r.receipt_image}`} target="_blank" rel="noreferrer" className="text-indigo-400 hover:underline">عرض الصورة</a>
                    </td>
                    <td className="py-3 px-3">
                      {r.status === 'pending' ? (
                        <div className="flex gap-2">
                          <button onClick={() => handleAction(r.id, 'approved')} className="px-2 py-1 rounded bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/40 flex items-center gap-1 transition-colors">
                            <CheckCircle className="w-3 h-3" /> قبول
                          </button>
                          <button onClick={() => handleAction(r.id, 'rejected')} className="px-2 py-1 rounded bg-rose-500/20 text-rose-400 hover:bg-rose-500/40 flex items-center gap-1 transition-colors">
                            <XCircle className="w-3 h-3" /> رفض
                          </button>
                        </div>
                      ) : (
                        <span className={`px-2 py-1 rounded text-[10px] font-bold ${r.status === 'approved' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
                          {r.status === 'approved' ? 'مقبول وتم الشحن' : 'مرفوض'}
                        </span>
                      )}
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
