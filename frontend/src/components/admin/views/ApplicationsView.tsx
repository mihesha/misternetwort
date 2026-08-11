import React, { useState, useMemo } from 'react';
import { Filter, CheckCircle2, Clock, FileEdit, XCircle, Eye, Trash2, Phone, MessageCircle } from 'lucide-react';
import { NetworkApplication, ApplicationStatus } from '../../../types';

interface ApplicationsViewProps {
  isDarkMode: boolean;
  applications: NetworkApplication[];
  handleApproveAndProvision: (app: NetworkApplication) => void;
  setRequestModifyApp: (app: NetworkApplication) => void;
  setModificationReasonText: (text: string) => void;
  onUpdateStatus: (id: string, status: ApplicationStatus) => void;
  setInspectApp: (app: NetworkApplication) => void;
  onDeleteApplication: (id: string) => void;
}

export const ApplicationsView: React.FC<ApplicationsViewProps> = ({
  isDarkMode,
  applications,
  handleApproveAndProvision,
  setRequestModifyApp,
  setModificationReasonText,
  onUpdateStatus,
  setInspectApp,
  onDeleteApplication,
}) => {
  // Filters State for Applications View
  const [filterGov, setFilterGov] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchKey, setSearchKey] = useState<string>('');

  // Filtered Applications
  const filteredApps = useMemo(() => {
    return applications.filter((app) => {
      // Completely hide approved applications from this view
      if (app.status === 'approved') return false;

      if (filterGov !== 'all' && app.formData.network.governorate !== filterGov) return false;
      if (filterStatus !== 'all' && app.status !== filterStatus) return false;

      if (searchKey.trim()) {
        const term = searchKey.toLowerCase().trim();
        return (
          app.referenceNumber.toLowerCase().includes(term) ||
          app.formData.owner.ownerName.toLowerCase().includes(term) ||
          app.formData.network.networkName.toLowerCase().includes(term) ||
          app.formData.jaibWalletNumber.includes(term) ||
          app.formData.owner.contactNumber.includes(term)
        );
      }
      return true;
    });
  }, [applications, filterGov, filterStatus, searchKey]);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div
        className={`p-4 md:p-5 rounded-3xl border space-y-4 ${
          isDarkMode ? 'bg-[#121927] border-slate-800' : 'bg-white border-slate-200'
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
            <Filter className="w-4 h-4 text-indigo-400" />
            <span>تصفية والبحث في طلبات الانضمام:</span>
          </div>
          <span className="text-xs text-indigo-400 font-bold">عدد النتائج: {filteredApps.length}</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <input
            type="text"
            value={searchKey}
            onChange={(e) => setSearchKey(e.target.value)}
            placeholder="بحث بالاسم، المرجع، المحفظة..."
            className={`w-full px-3.5 py-2.5 rounded-xl text-xs transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
              isDarkMode ? 'bg-[#1d273a] text-white border border-slate-700/80' : 'bg-slate-50 text-slate-900 border border-slate-300'
            }`}
          />

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className={`w-full px-3.5 py-2.5 rounded-xl text-xs transition-all cursor-pointer ${
              isDarkMode ? 'bg-[#1d273a] text-white border border-slate-700/80' : 'bg-slate-50 text-slate-900 border border-slate-300'
            }`}
          >
            <option value="all">جميع الحالات</option>
            <option value="pending">قيد الانتظار</option>
            <option value="under_review">قيد المراجعة</option>
            <option value="needs_modification">مطلوب تعديل البيانات</option>
            <option value="rejected">مرفوض</option>
          </select>

          <select
            value={filterGov}
            onChange={(e) => setFilterGov(e.target.value)}
            className={`w-full px-3.5 py-2.5 rounded-xl text-xs transition-all cursor-pointer ${
              isDarkMode ? 'bg-[#1d273a] text-white border border-slate-700/80' : 'bg-slate-50 text-slate-900 border border-slate-300'
            }`}
          >
            <option value="all">جميع المحافظات</option>
            {Array.from(new Set(applications.map((a) => a.formData.network.governorate))).map((gov) => (
              <option key={gov} value={gov}>
                {gov}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="space-y-4">
        {filteredApps.length === 0 ? (
          <div className="text-center py-16 text-slate-400 bg-[#121927] rounded-3xl border border-slate-800">
            لا توجد طلبات انضمام متطابقة مع التصفية الحالية.
          </div>
        ) : (
          filteredApps.map((app) => (
            <div
              key={app.id}
              className={`p-5 rounded-3xl border transition-all ${
                isDarkMode ? 'bg-[#121927] border-slate-800' : 'bg-white border-slate-200'
              }`}
            >
              <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-4 pb-4 border-b border-slate-800/60">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <span className="font-mono font-bold text-lg text-indigo-400">{app.referenceNumber}</span>
                    <span className="text-xs text-slate-400">{new Date(app.createdAt).toLocaleString('ar-YE')}</span>
                  </div>
                  <h3 className="font-extrabold text-lg text-white">{app.formData.network.networkName}</h3>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    onClick={() => handleApproveAndProvision(app)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                      app.status === 'approved' || app.status === 'activated'
                        ? 'bg-emerald-600 text-white shadow-md'
                        : 'bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25 border border-emerald-500/30'
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>اعتماد وتفعيل كشبكة نشطة</span>
                  </button>

                  <button
                    onClick={() => onUpdateStatus(app.id, 'under_review')}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                      app.status === 'under_review' || app.status === 'pending'
                        ? 'bg-amber-600 text-white shadow-md'
                        : 'bg-amber-500/15 text-amber-400 hover:bg-amber-500/25 border border-amber-500/30'
                    }`}
                  >
                    <Clock className="w-4 h-4" />
                    <span>قيد المراجعة</span>
                  </button>

                  <button
                    onClick={() => {
                      setRequestModifyApp(app);
                      setModificationReasonText(app.notes || 'يرجى مراجعة وتعديل بيانات الطلب وفئات الكروت.');
                    }}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                      app.status === 'needs_modification'
                        ? 'bg-amber-600 text-white shadow-md'
                        : 'bg-amber-500/15 text-amber-400 hover:bg-amber-500/25 border border-amber-500/30'
                    }`}
                  >
                    <FileEdit className="w-4 h-4" />
                    <span>طلب تعديل البيانات</span>
                  </button>

                  <button
                    onClick={() => onUpdateStatus(app.id, 'rejected')}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                      app.status === 'rejected'
                        ? 'bg-rose-600 text-white shadow-md'
                        : 'bg-rose-500/15 text-rose-400 hover:bg-rose-500/25 border border-rose-500/30'
                    }`}
                  >
                    <XCircle className="w-4 h-4" />
                    <span>رفض الطلب</span>
                  </button>

                  <button
                    onClick={() => setInspectApp(app)}
                    className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5 text-indigo-400" />
                    <span>معاينة التفاصيل</span>
                  </button>

                  <button
                    onClick={() => onDeleteApplication(app.id)}
                    className="p-2 rounded-xl text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                    title="حذف الطلب"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                <div className="p-3.5 rounded-2xl bg-slate-800/40 border border-slate-700/50">
                  <span className="text-slate-400 block mb-1">بيانات مالك الشبكة:</span>
                  <p className="font-bold text-white text-sm">{app.formData.owner.ownerName}</p>
                  <p className="text-slate-300 font-mono" dir="ltr">
                    هاتف: {app.formData.owner.contactNumber}
                  </p>
                  <p className="text-slate-400">رقم المالك: {app.formData.owner.ownerId}</p>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-800/40 border border-slate-700/50">
                  <span className="text-slate-400 block mb-1">موقع الشبكة:</span>
                  <p className="font-bold text-white text-sm">
                    {app.formData.network.governorate} - {app.formData.network.city}
                  </p>
                  <p className="text-slate-400">{app.formData.network.neighborhood || 'بدون حي محدد'}</p>
                  <p className="text-indigo-300">هاتف الشبكة: {app.formData.network.networkPhone || 'غير مدخل'}</p>
                </div>

                <div className="p-3.5 rounded-2xl bg-indigo-950/40 border border-indigo-500/30">
                  <span className="text-slate-300 block mb-1">محفظة جيب المعتمدة:</span>
                  <p className="font-mono font-black text-emerald-400 text-base mb-2" dir="ltr">
                    {app.formData.jaibWalletNumber}
                  </p>

                  <div className="flex items-center gap-2">
                    <a
                      href={`tel:${app.formData.owner.contactNumber}`}
                      className="flex-1 py-1.5 px-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-center font-bold text-white text-[11px] flex items-center justify-center gap-1"
                    >
                      <Phone className="w-3.5 h-3.5 text-indigo-400" />
                      <span>اتصال</span>
                    </a>
                    <a
                      href={`https://wa.me/967${app.formData.owner.contactNumber.replace(/^0+/, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 py-1.5 px-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-center font-bold text-white text-[11px] flex items-center justify-center gap-1"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>واتساب</span>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
