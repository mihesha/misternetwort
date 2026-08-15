// PosManagementView Component
import React, { useEffect, useState } from 'react';
import { Wallet, Search, Edit3 } from 'lucide-react';
import { useAppContext } from '@/context/AppContext';

export const PosManagementView: React.FC = () => {
  const { isDarkMode } = useAppContext();
  const [posUsers, setPosUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [newBalance, setNewBalance] = useState('');

  const fetchPosUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/pos');
      if (res.ok) {
        const data = await res.json();
        setPosUsers(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosUsers();
  }, []);

  const handleUpdateBalance = async () => {
    if (!selectedUser || !newBalance) return;
    try {
      const res = await fetch(`/api/admin/pos/${selectedUser.id}/balance`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ balance: parseFloat(newBalance) })
      });
      if (res.ok) {
        alert('تم تحديث الرصيد بنجاح');
        setSelectedUser(null);
        setNewBalance('');
        fetchPosUsers();
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
            <h3 className="text-lg font-black text-white">إدارة أرصدة نقاط البيع</h3>
            <p className="text-xs text-slate-400">تحكم بمحافظ نقاط البيع وتعديل أرصدتهم يدوياً</p>
          </div>
          <div className="px-4 py-2 rounded-xl bg-indigo-600/20 text-indigo-400 font-bold text-xs flex items-center gap-2">
            <Wallet className="w-4 h-4" />
            <span>إجمالي نقاط البيع: {posUsers.length}</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="text-center py-10 text-slate-400">جاري تحميل البيانات...</div>
          ) : (
            <table className="w-full text-right text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 pb-2">
                  <th className="py-2.5 px-3">صاحب المحل / الرقم</th>
                  <th className="py-2.5 px-3">الرصيد</th>
                  <th className="py-2.5 px-3">الحالة والـ OTP</th>
                  <th className="py-2.5 px-3">تاريخ الانضمام</th>
                  <th className="py-2.5 px-3">إجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {posUsers.map((u, i) => (
                  <tr key={i} className="hover:bg-slate-800/30">
                    <td className="py-3 px-3">
                      <div className="font-bold text-white">{u.shop_name || u.name}</div>
                      <div className="text-[10px] text-slate-400 font-mono mt-0.5" dir="ltr">{u.phone}</div>
                    </td>
                    <td className="py-3 px-3 font-bold text-emerald-400">{u.wallet_balance} ر.ي</td>
                    <td className="py-3 px-3">
                      {u.status === 'pending' ? (
                        <div className="flex flex-col gap-1">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-400 w-fit">قيد التحقق</span>
                          <span className="text-xs text-slate-300 font-mono">OTP: <span className="text-white font-black bg-slate-800 px-1 rounded">{u.otp_code}</span></span>
                        </div>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400">نشط</span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-slate-400">{new Date(u.created_at).toLocaleDateString('ar-YE')}</td>
                    <td className="py-3 px-3">
                      <button
                        onClick={() => { setSelectedUser(u); setNewBalance(u.wallet_balance.toString()); }}
                        className="px-3 py-1.5 rounded-lg bg-indigo-500/20 text-indigo-400 hover:bg-indigo-500/40 flex items-center gap-1 transition-colors"
                      >
                        <Edit3 className="w-3 h-3" />
                        تعديل الرصيد
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className={`w-full max-w-sm p-6 rounded-3xl border shadow-2xl ${isDarkMode ? 'bg-[#121927] border-slate-800' : 'bg-white border-slate-200'}`}>
            <h3 className="text-lg font-bold text-white mb-4">تعديل رصيد: {selectedUser.phone}</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">الرصيد الجديد (ريال)</label>
                <input
                  type="number"
                  value={newBalance}
                  onChange={e => setNewBalance(e.target.value)}
                  className={`w-full p-3 rounded-xl border font-mono text-left focus:ring-2 focus:ring-indigo-500 outline-none ${isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'}`}
                />
              </div>
              <div className="flex gap-2">
                <button onClick={handleUpdateBalance} className="flex-1 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition-all text-sm">حفظ الرصيد</button>
                <button onClick={() => setSelectedUser(null)} className="flex-1 py-3 rounded-xl bg-slate-700 hover:bg-slate-600 text-white font-bold transition-all text-sm">إلغاء</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
