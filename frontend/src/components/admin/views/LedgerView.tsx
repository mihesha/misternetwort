import React from 'react';
import { Download } from 'lucide-react';
import { CentralAuditLog } from '../../../types';

interface LedgerViewProps {
  isDarkMode: boolean;
  auditLogs: CentralAuditLog[];
  handleExportCSV: () => void;
}

export const LedgerView: React.FC<LedgerViewProps> = ({
  isDarkMode,
  auditLogs,
  handleExportCSV
}) => {
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div
        className={`p-6 rounded-3xl border space-y-4 ${
          isDarkMode ? 'bg-[#121927] border-slate-800' : 'bg-white border-slate-200'
        }`}
      >
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div>
            <h3 className="text-lg font-black text-white">كشف الحساب وسجل العمليات المركزي</h3>
            <p className="text-xs text-slate-400">تتبع شامل لجميع المبيعات، السحوبات، والعمولات في المنظومة</p>
          </div>

          <button
            onClick={handleExportCSV}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs cursor-pointer flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            <span>تصدير كشف الحساب Excel/CSV</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs font-medium">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 pb-3">
                <th className="py-3 px-3">رقم المرجع</th>
                <th className="py-3 px-3">التاريخ والوقت</th>
                <th className="py-3 px-3">الشبكة</th>
                <th className="py-3 px-3">نوع العملية</th>
                <th className="py-3 px-3">المبلغ</th>
                <th className="py-3 px-3">المنفذ</th>
                <th className="py-3 px-3">التفاصيل</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {auditLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="py-3 px-3 font-mono text-indigo-400 font-bold">{log.reference}</td>
                  <td className="py-3 px-3 text-slate-400 font-mono">
                    {new Date(log.timestamp).toLocaleString('en-US')}
                  </td>
                  <td className="py-3 px-3 font-bold text-white">{log.networkName}</td>
                  <td className="py-3 px-3">
                    <span
                      className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                        log.type === 'sale'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : log.type === 'withdrawal'
                          ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                          : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                      }`}
                    >
                      {log.typeLabel}
                    </span>
                  </td>
                  <td className="py-3 px-3 font-mono font-black text-slate-200">
                    {log.amount >= 0 ? `+${log.amount}` : log.amount} ر.ي
                  </td>
                  <td className="py-3 px-3 text-slate-300">{log.performedBy}</td>
                  <td className="py-3 px-3 text-slate-400 text-[11px]">{log.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
