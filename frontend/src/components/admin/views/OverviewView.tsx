import React from 'react';
import { 
  TrendingUp, 
  Wallet, 
  Clock, 
  ArrowUpRight, 
  DollarSign, 
  Globe, 
  BarChart3, 
  AlertTriangle, 
  Activity 
} from 'lucide-react';
import { AdminSystemStats, ActiveNetwork, CentralAuditLog } from '../../../types';

interface OverviewViewProps {
  isDarkMode: boolean;
  stats: AdminSystemStats;
  activeNetworks: ActiveNetwork[];
  auditLogs: CentralAuditLog[];
  platformCommissionRate: number;
  setActiveTab: (tab: any) => void;
}

export const OverviewView: React.FC<OverviewViewProps> = ({
  isDarkMode,
  stats,
  activeNetworks,
  auditLogs,
  platformCommissionRate,
  setActiveTab
}) => {
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* KPI Stat Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4">
        <div
          className={`p-4 rounded-3xl border transition-all ${
            isDarkMode ? 'bg-[#121927] border-slate-800' : 'bg-white border-slate-200 shadow-sm'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-slate-400">حجم المبيعات</span>
            <div className="p-1.5 rounded-xl bg-emerald-500/10 text-emerald-400">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <p className="text-lg md:text-xl font-black text-emerald-400 font-mono">
            {(stats.totalSalesVolume || 0).toLocaleString('en-US')}
            <span className="text-[10px] text-slate-400 font-normal mr-1">ر.ي</span>
          </p>
          <span className="text-[10px] text-emerald-500 font-bold block mt-1">+14.2% هذا الشهر</span>
        </div>

        <div
          className={`p-4 rounded-3xl border transition-all ${
            isDarkMode ? 'bg-[#121927] border-slate-800' : 'bg-white border-slate-200 shadow-sm'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-slate-400">رصيد الشبكات</span>
            <div className="p-1.5 rounded-xl bg-indigo-500/10 text-indigo-400">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <p className="text-lg md:text-xl font-black text-indigo-400 font-mono">
            {(stats.totalSystemBalance || 0).toLocaleString('en-US')}
            <span className="text-[10px] text-slate-400 font-normal mr-1">ر.ي</span>
          </p>
          <span className="text-[10px] text-indigo-300 font-bold block mt-1">محفظة جيب المعتمدة</span>
        </div>

        <div
          className={`p-4 rounded-3xl border transition-all ${
            isDarkMode ? 'bg-[#121927] border-slate-800' : 'bg-white border-slate-200 shadow-sm'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-slate-400">طلبات الانضمام</span>
            <div className="p-1.5 rounded-xl bg-amber-500/10 text-amber-400">
              <Clock className="w-4 h-4 animate-pulse" />
            </div>
          </div>
          <p className="text-lg md:text-xl font-black text-amber-400 font-mono">
            {stats.pendingApplications}
            <span className="text-xs text-slate-400 font-normal mr-1">طلب معلق</span>
          </p>
          <span className="text-[10px] text-amber-500 font-bold block mt-1">يحتاج مراجعة</span>
        </div>

        <div
          className={`p-4 rounded-3xl border transition-all ${
            isDarkMode ? 'bg-[#121927] border-slate-800' : 'bg-white border-slate-200 shadow-sm'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-slate-400">سحوبات معلقة</span>
            <div className="p-1.5 rounded-xl bg-rose-500/10 text-rose-400">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
          <p className="text-lg md:text-xl font-black text-rose-400 font-mono">
            {(stats.pendingWithdrawalsAmount || 0).toLocaleString('en-US')}
            <span className="text-[10px] text-slate-400 font-normal mr-1">ر.ي</span>
          </p>
          <span className="text-[10px] text-rose-400 font-bold block mt-1">
            {stats.pendingWithdrawalsCount} طلب تحويل
          </span>
        </div>

        <div
          className={`p-4 rounded-3xl border transition-all ${
            isDarkMode ? 'bg-[#121927] border-slate-800' : 'bg-white border-slate-200 shadow-sm'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-slate-400">عمولات المنظومة</span>
            <div className="p-1.5 rounded-xl bg-purple-500/10 text-purple-400">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <p className="text-lg md:text-xl font-black text-purple-400 font-mono">
            {(stats.totalPlatformCommissions || 0).toLocaleString('en-US')}
            <span className="text-[10px] text-slate-400 font-normal mr-1">ر.ي</span>
          </p>
          <span className="text-[10px] text-purple-300 font-bold block mt-1">نسبة {platformCommissionRate}%</span>
        </div>

        <div
          className={`p-4 rounded-3xl border transition-all ${
            isDarkMode ? 'bg-[#121927] border-slate-800' : 'bg-white border-slate-200 shadow-sm'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-slate-400">الشبكات المفعلة</span>
            <div className="p-1.5 rounded-xl bg-blue-500/10 text-blue-400">
              <Globe className="w-4 h-4" />
            </div>
          </div>
          <p className="text-lg md:text-xl font-black text-blue-400 font-mono">
            {activeNetworks.length}
            <span className="text-xs text-slate-400 font-normal mr-1">شبكة</span>
          </p>
          <span className="text-[10px] text-blue-300 font-bold block mt-1">تغطي المحافظات الرئيسية</span>
        </div>
      </div>

      {/* Geographical Distribution & Low Inventory Monitors */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div
          className={`p-6 rounded-3xl border space-y-4 lg:col-span-2 ${
            isDarkMode ? 'bg-[#121927] border-slate-800' : 'bg-white border-slate-200 shadow-sm'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-indigo-400" />
              <h3 className="font-extrabold text-base text-white">انتشار الشبكات والمبيعات حسب المحافظات</h3>
            </div>
            <span className="text-xs text-slate-400">تحديث تلقائي</span>
          </div>

          <div className="space-y-3">
            {[
              { gov: 'أمانة العاصمة (صنعاء)', count: 12, sales: 284000, percentage: 55 },
              { gov: 'عدن', count: 6, sales: 142000, percentage: 28 },
              { gov: 'تعز', count: 4, sales: 68000, percentage: 12 },
              { gov: 'إب', count: 2, sales: 35000, percentage: 5 },
            ].map((item, idx) => (
              <div key={idx} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-slate-200">{item.gov} ({item.count} شبكة)</span>
                  <span className="font-mono text-indigo-400">{item.sales.toLocaleString('en-US')} ر.ي ({item.percentage}%)</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-500"
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div
          className={`p-6 rounded-3xl border space-y-4 ${
            isDarkMode ? 'bg-[#121927] border-slate-800' : 'bg-white border-slate-200 shadow-sm'
          }`}
        >
          <div className="flex items-center gap-2 text-amber-400">
            <AlertTriangle className="w-5 h-5" />
            <h3 className="font-extrabold text-base text-white">تنبيهات المخزون المنخفض</h3>
          </div>

          <div className="space-y-3">
            {activeNetworks.flatMap((net) =>
              net.categories
                .filter((c) => c.remaining < 10)
                .map((c, i) => (
                  <div
                    key={`${net.id}-${i}`}
                    className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs flex items-center justify-between"
                  >
                    <div>
                      <p className="font-bold text-amber-300">{net.networkName}</p>
                      <p className="text-slate-400">فئة {c.value} ريال</p>
                    </div>
                    <div className="text-right">
                      <span className="px-2.5 py-1 rounded-lg bg-red-500/20 text-red-400 font-black font-mono">
                        متبقي: {c.remaining}
                      </span>
                    </div>
                  </div>
                ))
            )}

            {activeNetworks.flatMap((n) => n.categories.filter((c) => c.remaining < 10)).length === 0 && (
              <p className="text-xs text-slate-400 text-center py-6">جميع الفئات متوفرة بمخزون ممتاز 👍</p>
            )}
          </div>
        </div>
      </div>

      {/* Central Ledger Preview Stream */}
      <div
        className={`p-6 rounded-3xl border space-y-4 ${
          isDarkMode ? 'bg-[#121927] border-slate-800' : 'bg-white border-slate-200 shadow-sm'
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-emerald-400" />
            <h3 className="font-extrabold text-base text-white">سجل العمليات والأنشطة الفورية</h3>
          </div>
          <button
            onClick={() => setActiveTab('ledger')}
            className="text-xs font-bold text-indigo-400 hover:text-indigo-300 cursor-pointer"
          >
            عرض الكشف الكامل ⬅️
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs font-medium">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 pb-2">
                <th className="py-2.5 px-3">الوقت</th>
                <th className="py-2.5 px-3">اسم الشبكة</th>
                <th className="py-2.5 px-3">العملية</th>
                <th className="py-2.5 px-3">المبلغ</th>
                <th className="py-2.5 px-3">المنفذ</th>
                <th className="py-2.5 px-3">التفاصيل</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {auditLogs.slice(0, 5).map((log) => (
                <tr key={log.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="py-3 px-3 text-slate-400 font-mono">
                    {new Date(log.timestamp).toLocaleTimeString('ar-YE', { hour: '2-digit', minute: '2-digit' })}
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
                  <td className="py-3 px-3 font-mono font-bold text-slate-200">
                    {log.amount >= 0 ? `+${log.amount}` : log.amount} ر.ي
                  </td>
                  <td className="py-3 px-3 text-slate-300">{log.performedBy}</td>
                  <td className="py-3 px-3 text-slate-400 font-mono text-[11px]">{log.reference} - {log.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
