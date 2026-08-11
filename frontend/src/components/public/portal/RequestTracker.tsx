import React, { useState } from 'react';
import { Search, FileText, CheckCircle2, Clock, XCircle, ShieldCheck, Wallet, MapPin, Phone, User, Calendar, FileEdit, AlertTriangle } from 'lucide-react';
import { NetworkApplication } from '../../../types';

interface RequestTrackerProps {
  applications: NetworkApplication[];
  isDarkMode: boolean;
  onEditApplication?: (app: NetworkApplication) => void;
}

export const RequestTracker: React.FC<RequestTrackerProps> = ({
  applications,
  isDarkMode,
  onEditApplication,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searched, setSearched] = useState(false);

  // Filter requests
  const filteredApps = applications.filter((app) => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.trim().toLowerCase();
    return (
      app.referenceNumber.toLowerCase().includes(term) ||
      app.formData.owner.contactNumber.includes(term) ||
      app.formData.owner.ownerId.includes(term) ||
      app.formData.jaibWalletNumber.includes(term) ||
      app.formData.network.networkName.toLowerCase().includes(term) ||
      app.formData.owner.ownerName.toLowerCase().includes(term)
    );
  });

  const getStatusBadge = (status: NetworkApplication['status']) => {
    switch (status) {
      case 'approved':
      case 'activated':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>تم الاعتماد والتفعيل</span>
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-500/10 text-rose-400 border border-rose-500/30">
            <XCircle className="w-3.5 h-3.5" />
            <span>طلب مرفوض</span>
          </span>
        );
      case 'needs_modification':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-amber-500/20 text-amber-400 border border-amber-500/40">
            <FileEdit className="w-3.5 h-3.5 animate-pulse" />
            <span>مطلوب تعديل البيانات</span>
          </span>
        );
      case 'under_review':
      case 'pending':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30">
            <Clock className="w-3.5 h-3.5 animate-spin" />
            <span>قيد المراجعة</span>
          </span>
        );
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 pb-12">
      {/* Title */}
      <div className="text-center space-y-2">
        <h2 className="text-xl md:text-2xl font-black font-['Cairo']">متابعة حالة طلب الانضمام</h2>
        <p className="text-xs md:text-sm text-slate-400">
          أدخل رقم المرجع، رقم التواصل، أو رقم محفظة جيب للاستعلام عن الطلب
        </p>
      </div>

      {/* Search Input Box */}
      <div
        className={`p-4 md:p-6 rounded-3xl border transition-all ${
          isDarkMode
            ? 'bg-[#121927] border-slate-800 shadow-xl'
            : 'bg-white border-slate-200 shadow-sm'
        }`}
      >
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setSearched(true);
              }}
              placeholder="ابحث برقم المرجع REQ-2026-..., رقم المالك, أو رقم محفظة جيب..."
              className={`w-full pr-12 pl-4 py-3.5 rounded-2xl text-sm transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                isDarkMode
                  ? 'bg-[#1d273a] text-white border border-slate-700/80 placeholder-slate-500'
                  : 'bg-slate-50 text-slate-900 border border-slate-300 placeholder-slate-400'
              }`}
            />
          </div>
          <button
            onClick={() => setSearched(true)}
            className="px-6 py-3.5 rounded-2xl text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-500 transition-all cursor-pointer shadow-md shrink-0"
          >
            بحث عن الطلب
          </button>
        </div>
      </div>

      {/* Results List */}
      <div className="space-y-4">
        {filteredApps.length === 0 ? (
          <div
            className={`text-center py-12 px-4 rounded-3xl border ${
              isDarkMode ? 'bg-[#121927] border-slate-800 text-slate-400' : 'bg-white border-slate-200 text-slate-500'
            }`}
          >
            <FileText className="w-12 h-12 mx-auto mb-3 opacity-40 text-indigo-400" />
            <h3 className="font-bold text-base mb-1">لا توجد طلبات مطابقة</h3>
            <p className="text-xs">
              {searched
                ? 'لم نجد أي طلب برقم المرجع أو بيانات التواصل المدخلة.'
                : 'قم بتقديم طلب انضمام جديد أولاً لاستعراضه هنا.'}
            </p>
          </div>
        ) : (
          filteredApps.map((app) => (
            <div
              key={app.id}
              className={`p-5 md:p-6 rounded-3xl border transition-all ${
                isDarkMode
                  ? 'bg-[#121927] border-slate-800 shadow-xl'
                  : 'bg-white border-slate-200 shadow-sm'
              }`}
            >
              {/* Card Header */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-4 border-b border-slate-800/60 mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs text-indigo-400 font-medium">رقم المرجع:</span>
                    <span className="font-mono font-bold text-lg text-white tracking-wider">
                      {app.referenceNumber}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>تاريخ التقديم: {new Date(app.createdAt).toLocaleString('ar-YE')}</span>
                  </div>
                </div>

                <div>{getStatusBadge(app.status)}</div>
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs md:text-sm mb-4">
                <div className="p-3 rounded-2xl bg-slate-800/40 space-y-1">
                  <div className="flex items-center gap-1.5 text-slate-400">
                    <User className="w-3.5 h-3.5 text-indigo-400" />
                    <span>اسم المالك والشبكة:</span>
                  </div>
                  <p className="font-bold text-white">{app.formData.owner.ownerName}</p>
                  <p className="text-indigo-300 font-semibold">{app.formData.network.networkName}</p>
                </div>

                <div className="p-3 rounded-2xl bg-slate-800/40 space-y-1">
                  <div className="flex items-center gap-1.5 text-slate-400">
                    <MapPin className="w-3.5 h-3.5 text-indigo-400" />
                    <span>الموقع الجغرافي:</span>
                  </div>
                  <p className="font-bold text-white">
                    {app.formData.network.governorate} - {app.formData.network.city}
                  </p>
                  <p className="text-slate-400 text-xs">{app.formData.network.neighborhood || 'المنطقة غير محددة'}</p>
                </div>

                <div className="p-3 rounded-2xl bg-indigo-950/40 border border-indigo-500/20 space-y-1">
                  <div className="flex items-center gap-1.5 text-slate-300">
                    <Wallet className="w-3.5 h-3.5 text-emerald-400" />
                    <span>محفظة جيب للرصيد:</span>
                  </div>
                  <p className="font-mono font-bold text-emerald-400 text-base" dir="ltr">
                    {app.formData.jaibWalletNumber}
                  </p>
                  <p className="text-slate-400 text-[11px]">رقم للتواصل: {app.formData.owner.contactNumber}</p>
                </div>
              </div>

              {/* Admin Modification Note Banner if status is needs_modification */}
              {app.status === 'needs_modification' && (
                <div className="mb-4 p-4 rounded-2xl bg-amber-500/15 border border-amber-500/40 text-amber-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 font-bold text-xs text-amber-400">
                      <AlertTriangle className="w-4 h-4 text-amber-400" />
                      <span>طلب تعديل بيانات من الإدارة:</span>
                    </div>
                    {onEditApplication && (
                      <button
                        onClick={() => onEditApplication(app)}
                        className="px-4 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs flex items-center gap-1.5 shadow-md transition-all cursor-pointer"
                      >
                        <FileEdit className="w-3.5 h-3.5" />
                        <span>تعديل البيانات الآن ✏️</span>
                      </button>
                    )}
                  </div>
                  <p className="text-xs text-amber-100/90 font-medium bg-amber-950/50 p-2.5 rounded-xl border border-amber-500/20">
                    {app.notes || 'يرجى مراجعة وتعديل بيانات الطلب وفئات الكروت.'}
                  </p>
                </div>
              )}

              {/* Categories Preview */}
              <div className="bg-slate-900/60 p-3 rounded-2xl border border-slate-800/80">
                <span className="text-xs font-bold text-slate-300 block mb-2">
                  فئات الكروت المطلوبة ({app.formData.cardCategories.length}):
                </span>
                <div className="flex flex-wrap gap-2">
                  {app.formData.cardCategories.map((c, idx) => (
                    <div key={idx} className="px-3 py-1.5 rounded-xl bg-slate-800 text-xs font-semibold text-slate-200 border border-slate-700/60 flex items-center gap-2">
                      <span>{c.name}</span>
                      <span className="text-indigo-400 font-bold font-mono">{c.price} ريال</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
