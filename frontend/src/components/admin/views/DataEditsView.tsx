import React from 'react';
import { Search, FileEdit, Eye } from 'lucide-react';
import { NetworkDataEditRequest } from '../../../types';

interface DataEditsViewProps {
  isDarkMode: boolean;
  dataEditRequests: NetworkDataEditRequest[];
  dataEditSearch: string;
  setDataEditSearch: (val: string) => void;
  dataEditFilterStatus: string;
  setDataEditFilterStatus: (val: string) => void;
  setInspectDataEditReq: (req: NetworkDataEditRequest) => void;
}

export const DataEditsView: React.FC<DataEditsViewProps> = ({
  isDarkMode,
  dataEditRequests,
  dataEditSearch,
  setDataEditSearch,
  dataEditFilterStatus,
  setDataEditFilterStatus,
  setInspectDataEditReq
}) => {
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header Stats Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className={`p-4 rounded-2xl border ${isDarkMode ? 'bg-[#121927] border-slate-800' : 'bg-white border-slate-200'}`}>
          <span className="text-xs text-slate-400 block mb-1 font-bold">إجمالي طلبات التعديل</span>
          <p className="text-2xl font-black text-white font-mono">{dataEditRequests.length}</p>
        </div>
        <div className={`p-4 rounded-2xl border ${isDarkMode ? 'bg-[#121927] border-slate-800' : 'bg-white border-slate-200'}`}>
          <span className="text-xs text-amber-400 block mb-1 font-bold">قيد الانتظار (معلقة)</span>
          <p className="text-2xl font-black text-amber-400 font-mono">
            {dataEditRequests.filter((r) => r.status === 'pending').length}
          </p>
        </div>
        <div className={`p-4 rounded-2xl border ${isDarkMode ? 'bg-[#121927] border-slate-800' : 'bg-white border-slate-200'}`}>
          <span className="text-xs text-emerald-400 block mb-1 font-bold">طلبات معتمدة ومحدثة</span>
          <p className="text-2xl font-black text-emerald-400 font-mono">
            {dataEditRequests.filter((r) => r.status === 'approved').length}
          </p>
        </div>
        <div className={`p-4 rounded-2xl border ${isDarkMode ? 'bg-[#121927] border-slate-800' : 'bg-white border-slate-200'}`}>
          <span className="text-xs text-rose-400 block mb-1 font-bold">طلبات مرفوضة</span>
          <p className="text-2xl font-black text-rose-400 font-mono">
            {dataEditRequests.filter((r) => r.status === 'rejected').length}
          </p>
        </div>
      </div>

      {/* Filters & Search */}
      <div className={`p-4 rounded-2xl border flex flex-col sm:flex-row items-center justify-between gap-4 ${isDarkMode ? 'bg-[#121927] border-slate-800' : 'bg-white border-slate-200'}`}>
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={dataEditSearch}
            onChange={(e) => setDataEditSearch(e.target.value)}
            placeholder="بحث برقم المرجع MOD، اسم الشبكة، أو المالك..."
            className={`w-full pr-9 pl-3 py-2 rounded-xl text-xs font-medium focus:outline-none ${
              isDarkMode ? 'bg-[#1b2536] text-white border border-slate-700' : 'bg-slate-50 text-slate-900 border border-slate-300'
            }`}
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs text-slate-400 font-bold whitespace-nowrap">الحالة:</span>
          <select
            value={dataEditFilterStatus}
            onChange={(e) => setDataEditFilterStatus(e.target.value)}
            className={`py-2 px-3 rounded-xl text-xs font-bold focus:outline-none ${
              isDarkMode ? 'bg-[#1b2536] text-white border border-slate-700' : 'bg-slate-50 text-slate-900 border border-slate-300'
            }`}
          >
            <option value="all">جميع الحالات</option>
            <option value="pending">قيد الانتظار (معلقة)</option>
            <option value="approved">معتمدة ومقبولة</option>
            <option value="rejected">مرفوضة</option>
          </select>
        </div>
      </div>

      {/* Data Edit Requests Cards / List */}
      <div className="space-y-4">
        {dataEditRequests
          .filter((req) => {
            if (dataEditFilterStatus !== 'all' && req.status !== dataEditFilterStatus) return false;
            if (!dataEditSearch.trim()) return true;
            const q = dataEditSearch.toLowerCase();
            return (
              req.networkName.toLowerCase().includes(q) ||
              req.ownerName.toLowerCase().includes(q) ||
              req.referenceNumber.toLowerCase().includes(q) ||
              req.networkCode.includes(q)
            );
          })
          .map((req) => (
            <div
              key={req.id}
              className={`p-5 rounded-3xl border transition-all shadow-xl space-y-4 ${
                isDarkMode ? 'bg-[#121927] border-slate-800' : 'bg-white border-slate-200'
              }`}
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-2xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                    <FileEdit className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-black text-white text-base">{req.networkName}</h4>
                      <span className="text-xs font-mono text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-md border border-indigo-500/20">
                        كود: #{req.networkCode}
                      </span>
                      <span className="text-[11px] font-mono text-slate-400">
                        {req.referenceNumber}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400">المالك: <span className="text-slate-200 font-bold">{req.ownerName}</span> • هاتف: <span dir="ltr" className="font-mono text-slate-300">{req.contactPhone}</span></p>
                  </div>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold border ${
                      req.status === 'pending'
                        ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                        : req.status === 'approved'
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                        : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                    }`}
                  >
                    {req.status === 'pending' && '⏳ قيد المراجعة'}
                    {req.status === 'approved' && '🟢 مقبول ومعتمد'}
                    {req.status === 'rejected' && '🔴 مرفوض'}
                  </span>

                  <button
                    onClick={() => setInspectDataEditReq(req)}
                    className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
                  >
                    <Eye className="w-4 h-4" />
                    <span>معاينة ومراجعة التعديلات</span>
                  </button>
                </div>
              </div>

              {/* Detail Preview Summary Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                <div className="p-3 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-1">
                  <span className="text-slate-400 block font-bold">الموقع المطلوب:</span>
                  <p className="text-slate-200 font-medium">{req.governorate} - {req.city}</p>
                  <p className="text-slate-400">{req.district}</p>
                </div>

                <div className="p-3 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-1">
                  <span className="text-slate-400 block font-bold">محفظة جيب والتواصل:</span>
                  <p className="text-emerald-400 font-mono font-bold" dir="ltr">{req.jaibWallet}</p>
                  <p className="text-slate-300 font-mono" dir="ltr">{req.contactPhone}</p>
                </div>

                <div className="p-3 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-1">
                  <span className="text-slate-400 block font-bold">فئات الكروت المرفقة ({req.categories?.length || 0}):</span>
                  <div className="flex flex-wrap gap-1.5 pt-0.5">
                    {req.categories?.map((c) => (
                      <span key={c.id} className="px-2 py-0.5 rounded-md bg-indigo-950 text-indigo-300 border border-indigo-800 font-mono text-[11px] font-bold">
                        {c.name} ({c.price}ر.ي)
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {req.adminNotes && (
                <div className="p-3 rounded-2xl bg-indigo-950/30 border border-indigo-500/20 text-xs text-indigo-200">
                  <span className="font-bold block mb-0.5 text-indigo-300">💬 ملاحظات المالك للإدارة:</span>
                  <p className="leading-relaxed">{req.adminNotes}</p>
                </div>
              )}
            </div>
          ))}
      </div>
    </div>
  );
};
