"use client";
import React, { useState, useEffect } from 'react';
import { useAppContext } from '../../../context/AppContext';
import { useAgentContext } from '../../../context/AgentContext';
import { Wallet, CheckCircle, Clock, XCircle, PlusCircle, CreditCard, Building2, Smartphone } from 'lucide-react';

export default function AgentWithdrawalsPage() {
  const { isDarkMode } = useAppContext();
  const { stats, fetchStats } = useAgentContext();
  
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  
  const [showNewModal, setShowNewModal] = useState(false);
  const [wdAmount, setWdAmount] = useState('');
  const [wdNotes, setWdNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    fetchWithdrawals();
  }, []);

  const fetchWithdrawals = async () => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
      if (!token) return;

      const res = await fetch('/api/agent/withdrawals', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setWithdrawals(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleRequestWithdrawal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!wdAmount || isNaN(Number(wdAmount)) || Number(wdAmount) < 1000) {
      setFormError('الرجاء إدخال مبلغ صحيح لا يقل عن 1000 ريال');
      return;
    }
    
    if (stats && Number(wdAmount) > stats.balance) {
      setFormError('الرصيد غير كافٍ');
      return;
    }

    setFormError('');
    setSubmitting(true);
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
      const res = await fetch('/api/agent/withdrawals', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          amount: Number(wdAmount),
          provider: 'jaib',
          notes: wdNotes
        })
      });
      
      if (res.ok) {
        setSuccessMsg('تم تقديم طلب السحب بنجاح!');
        setTimeout(() => setSuccessMsg(''), 4000);
        setShowNewModal(false);
        setWdAmount('');
        setWdNotes('');
        fetchWithdrawals();
        fetchStats(); // Update balance
      } else {
        const errorData = await res.json();
        setFormError(`خطأ: ${errorData.error || 'فشل تقديم الطلب'}`);
      }
    } catch (e) {
      setFormError('حدث خطأ أثناء الاتصال بالخادم');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredWithdrawals = withdrawals.filter(wd => {
    if (statusFilter === 'all') return true;
    return wd.status === statusFilter;
  });

  return (
    <div className={`p-4 md:p-8 min-h-screen pt-24 ${isDarkMode ? 'bg-[#0a0f18]' : 'bg-[#f4f7fb]'}`}>
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className={`text-2xl md:text-3xl font-black ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>طلبات السحب</h1>
            <p className={`text-sm mt-1 font-bold ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>إدارة ومتابعة طلبات سحب أرباحك</p>
          </div>
          <button 
            onClick={() => { setFormError(''); setShowNewModal(true); }}
            className="flex items-center justify-center gap-2 px-5 py-2.5 bg-linear-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 text-white rounded-xl text-sm font-bold transition-all active:scale-95"
          >
            <PlusCircle className="w-5 h-5" />
            طلب سحب جديد
          </button>
        </div>

        {successMsg && (
          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-sm font-bold flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
            <CheckCircle className="w-5 h-5" /> {successMsg}
          </div>
        )}

        {/* Balance Card */}
        <div className={`p-6 rounded-2xl border flex items-center gap-4 ${isDarkMode ? 'bg-[#0f172a] border-white/5' : 'bg-white border-slate-200'}`}>
          <div className={`w-14 h-14 rounded-full flex items-center justify-center shrink-0 ${isDarkMode ? 'bg-cyan-500/20 text-cyan-400' : 'bg-cyan-50 text-cyan-600'}`}>
            <Wallet className="w-7 h-7" />
          </div>
          <div>
            <p className={`text-sm font-bold ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>الرصيد المتاح للسحب</p>
            <p className={`text-2xl font-black ${isDarkMode ? 'text-white' : 'text-slate-900'}`} dir="ltr">
              {stats ? Number(stats.balance).toLocaleString() : 0} <span className="text-sm text-cyan-500">ر.ي</span>
            </p>
          </div>
        </div>

        {/* Withdrawals List */}
        <div className={`rounded-2xl border overflow-hidden ${isDarkMode ? 'bg-[#0f172a] border-white/5' : 'bg-white border-slate-200'}`}>
          <div className={`px-6 py-4 border-b flex flex-col sm:flex-row items-center justify-between gap-4 ${isDarkMode ? 'border-white/5 bg-white/5' : 'border-slate-100 bg-slate-50'}`}>
            <h2 className={`font-black ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>سجل السحوبات</h2>
            <div className="flex items-center gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className={`text-sm font-bold px-3 py-1.5 rounded-lg border focus:outline-none ${isDarkMode ? 'bg-[#0f172a] border-slate-700 text-slate-300' : 'bg-white border-slate-200 text-slate-700'}`}
              >
                <option value="all">الكل</option>
                <option value="pending">قيد المراجعة</option>
                <option value="completed">مكتمل</option>
                <option value="rejected">مرفوض</option>
              </select>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-right">
              <thead className={`text-xs font-bold ${isDarkMode ? 'text-slate-400 bg-[#141d2b]' : 'text-slate-500 bg-slate-50'}`}>
                <tr>
                  <th className="px-6 py-4">رقم الطلب</th>
                  <th className="px-6 py-4">المبلغ</th>
                  <th className="px-6 py-4">طريقة الاستلام</th>
                  <th className="px-6 py-4">الحساب/الرقم</th>
                  <th className="px-6 py-4">التاريخ</th>
                  <th className="px-6 py-4">الحالة</th>
                </tr>
              </thead>
              <tbody className={`divide-y font-bold ${isDarkMode ? 'divide-white/5' : 'divide-slate-100'}`}>
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-slate-500">جاري جلب البيانات...</td>
                  </tr>
                ) : filteredWithdrawals.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-slate-500">لا توجد طلبات سحب سابقة</td>
                  </tr>
                ) : (
                  filteredWithdrawals.map((wd) => (
                    <tr key={wd.id} className={`transition-colors ${isDarkMode ? 'hover:bg-white/5' : 'hover:bg-slate-50'}`}>
                      <td className={`px-6 py-4 whitespace-nowrap ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>{wd.requestNumber}</td>
                      <td className={`px-6 py-4 whitespace-nowrap font-black text-rose-500`} dir="ltr">
                        {Number(wd.amount).toLocaleString()} ر.ي
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                        {wd.payoutMethod === 'jaib' ? 'محفظة جيب' : 'محفظة جيب'}
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`} dir="ltr">{wd.accountNumber}</td>
                      <td className={`px-6 py-4 whitespace-nowrap text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                        {new Date(wd.requestedAt).toLocaleDateString('ar-YE')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {wd.status === 'completed' && <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"><CheckCircle className="w-3.5 h-3.5"/> مكتمل</span>}
                        {wd.status === 'pending' && <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-500/10 text-amber-500 border border-amber-500/20"><Clock className="w-3.5 h-3.5"/> قيد المراجعة</span>}
                        {wd.status === 'rejected' && <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-rose-500/10 text-rose-500 border border-rose-500/20"><XCircle className="w-3.5 h-3.5"/> مرفوض</span>}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* New Withdrawal Modal */}
      {showNewModal && (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4 sm:p-6">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => !submitting && setShowNewModal(false)}></div>
          <div className={`relative w-full max-w-lg flex flex-col rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300 ${isDarkMode ? 'bg-[#0f172a] border border-slate-800' : 'bg-white border border-slate-200'}`}>
            
            <div className={`px-6 py-5 border-b flex items-center justify-between ${isDarkMode ? 'border-slate-800 bg-[#121927]' : 'border-slate-100 bg-slate-50'}`}>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center text-blue-500">
                  <Wallet className="w-5 h-5" />
                </div>
                <div>
                  <h3 className={`text-base font-black ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>طلب سحب أرباح</h3>
                  <p className="text-xs text-slate-500 mt-1 font-bold">الحد الأدنى للسحب 1,000 ريال</p>
                </div>
              </div>
              <button 
                onClick={() => !submitting && setShowNewModal(false)}
                className={`p-2 rounded-full transition-colors ${isDarkMode ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-slate-200 text-slate-500'}`}
              >
                <span className="text-xl leading-none font-bold">&times;</span>
              </button>
            </div>

            <form onSubmit={handleRequestWithdrawal} className="p-6 space-y-5">
              {formError && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-bold flex items-center gap-2">
                  <XCircle className="w-4 h-4" /> {formError}
                </div>
              )}

              <div>
                <label className={`block text-sm font-bold mb-2 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>المبلغ المطلوب (ريال)</label>
                <input
                  type="text"
                  inputMode="numeric"
                  required
                  value={wdAmount}
                  onChange={(e) => setWdAmount(e.target.value.replace(/\D/g, ''))}
                  placeholder="أدخل المبلغ..."
                  className={`w-full px-4 py-3 rounded-xl text-sm transition-all focus:outline-none focus:ring-2 ${isDarkMode ? 'bg-slate-800/50 border border-slate-700 text-white focus:ring-blue-500/50' : 'bg-slate-50 border border-slate-200 text-slate-800 focus:ring-blue-500/50'}`}
                />
              </div>

              <div className={`p-4 rounded-xl border flex items-center gap-4 ${isDarkMode ? 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400' : 'bg-indigo-50 border-indigo-100 text-indigo-600'}`}>
                <Wallet className="w-8 h-8 shrink-0" />
                <div>
                  <p className="font-bold text-sm">السحب عبر محفظة جيب</p>
                  <p className="text-xs mt-1 opacity-80">سيتم إرسال المبلغ إلى رقم محفظة جيب المربوطة بحسابك.</p>
                </div>
              </div>

              <div>
                <label className={`block text-sm font-bold mb-2 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>ملاحظات إضافية (اختياري)</label>
                <textarea
                  value={wdNotes}
                  onChange={(e) => setWdNotes(e.target.value)}
                  placeholder="إذا كنت ترغب بإرسال الحوالة باسم شخص آخر، يرجى كتابة الاسم الرباعي هنا..."
                  className={`w-full px-4 py-3 rounded-xl text-sm transition-all focus:outline-none focus:ring-2 resize-none h-24 ${isDarkMode ? 'bg-slate-800/50 border border-slate-700 text-white focus:ring-blue-500/50' : 'bg-slate-50 border border-slate-200 text-slate-800 focus:ring-blue-500/50'}`}
                ></textarea>
              </div>

              <div className={`pt-4 border-t flex justify-end gap-3 ${isDarkMode ? 'border-slate-800' : 'border-slate-100'}`}>
                <button 
                  type="button"
                  onClick={() => setShowNewModal(false)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold ${isDarkMode ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'bg-slate-200 text-slate-600 hover:bg-slate-300'}`}
                >
                  إلغاء
                </button>
                <button 
                  type="submit"
                  disabled={submitting || !wdAmount}
                  className="px-6 py-2 rounded-xl bg-linear-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 text-white text-xs font-bold disabled:opacity-50"
                >
                  {submitting ? 'جاري الإرسال...' : 'تأكيد الطلب'}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}
