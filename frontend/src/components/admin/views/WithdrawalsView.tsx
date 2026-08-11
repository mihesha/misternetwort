import React from 'react';
import { WithdrawalRequest } from '../../../types';

interface WithdrawalsViewProps {
  isDarkMode: boolean;
  withdrawals: WithdrawalRequest[];
  setPayoutWdModal: (wd: WithdrawalRequest) => void;
}

export const WithdrawalsView: React.FC<WithdrawalsViewProps> = ({
  isDarkMode,
  withdrawals,
  setPayoutWdModal
}) => {
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div
        className={`p-6 rounded-3xl border space-y-4 ${
          isDarkMode ? 'bg-[#121927] border-slate-800' : 'bg-white border-slate-200'
        }`}
      >
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-black text-white">طلبات سحب الأرباح والتحويل المالي</h3>
            <p className="text-xs text-slate-400">راجع واعتمد تحويلات محفظة جيب، بنك الكريمي، أو الصرافة</p>
          </div>
          <span className="px-3 py-1 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20 text-xs font-bold">
            معلق: {withdrawals.filter((w) => w.status === 'pending').length} طلب
          </span>
        </div>

        <div className="space-y-4">
          {withdrawals.map((wd) => (
            <div
              key={wd.id}
              className="p-4 rounded-2xl bg-slate-800/40 border border-slate-700/60 flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-indigo-400">{wd.requestNumber}</span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      wd.status === 'pending'
                        ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                        : wd.status === 'completed'
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                    }`}
                  >
                    {wd.status === 'pending' ? 'قيد الانتظار' : wd.status === 'completed' ? 'تم التحويل' : 'مرفوض'}
                  </span>
                </div>
                <p className="font-bold text-white text-sm">{wd.networkName} ({wd.ownerName})</p>
                <p className="text-xs text-slate-300">
                  وسيلة السحب:{' '}
                  <span className="text-indigo-300 font-bold">
                    {wd.payoutMethod === 'jaib_wallet'
                      ? 'محفظة جيب'
                      : wd.payoutMethod === 'kuraimi_bank'
                      ? 'حساب بنك الكريمي'
                      : 'حوالة صرافة'}
                  </span>{' '}
                  - رقم الحساب/المحفظة: <span className="font-mono font-bold text-emerald-400">{wd.accountNumber}</span>
                </p>
                {wd.notes && <p className="text-xs text-slate-400">ملاحظات: {wd.notes}</p>}
              </div>

              <div className="flex items-center gap-3">
                <div className="text-right">
                  <span className="font-mono font-black text-emerald-400 text-lg block">
                    {(wd.amount || 0).toLocaleString('en-US')} ر.ي
                  </span>
                  <span className="text-[10px] text-slate-400 block font-mono">
                    {new Date(wd.requestedAt).toLocaleDateString('ar-YE')}
                  </span>
                </div>

                {wd.status === 'pending' && (
                  <button
                    onClick={() => setPayoutWdModal(wd)}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs cursor-pointer shadow-md"
                  >
                    اعتماد وتوثيق التحويل
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
