import React from 'react';
import { X, CheckCircle2, XCircle, MessageCircle, Users, Globe, CreditCard, FileEdit } from 'lucide-react';
import { useAdminContext } from '../../../context/AdminContext';
import { useAdminActions } from '../../../hooks/useAdminActions';
import { useAppContext } from '../../../context/AppContext';

export const InspectApplicationModal = () => {
  const ctx = useAdminContext();
  const actions = useAdminActions();
  const { isDarkMode } = useAppContext();

  // Map context state
  const {
    inspectApp, setInspectApp,
    inspectNetwork, setInspectNetwork,
    inspectNetworkCards, setInspectNetworkCards,
    inspectNetworkTab, setInspectNetworkTab,
    inspectCardCatFilter, setInspectCardCatFilter,
    inspectCardStatusFilter, setInspectCardStatusFilter,
    inspectCardDateFilter, setInspectCardDateFilter,
    inspectCardStartDate, setInspectCardStartDate,
    inspectCardEndDate, setInspectCardEndDate,
    inspectCardSearchQuery, setInspectCardSearchQuery,
    editNetworkModal, setEditNetworkModal,
    balanceAdjustNetwork, setBalanceAdjustNetwork,
    adjustAmount, setAdjustAmount,
    adjustNote, setAdjustNote,
    payoutWdModal, setPayoutWdModal,
    payoutRef, setPayoutRef,
    payoutNotes, setPayoutNotes,
    whatsappModalData, setWhatsappModalData,
    copiedWpText, setCopiedWpText,
    requestModifyApp, setRequestModifyApp,
    modificationReasonText, setModificationReasonText,
    whatsappModifyData, setWhatsappModifyData,
    copiedModifyWpText, setCopiedModifyWpText,
    showNewNetworkModal, setShowNewNetworkModal,
    newNetName, setNewNetName,
    newNetOwner, setNewNetOwner,
    newNetPhone, setNewNetPhone,
    newNetWallet, setNewNetWallet,
    newNetGov, setNewNetGov,
    newNetCity, setNewNetCity,
    cardBatchNetId, setCardBatchNetId,
    cardBatchCategory, setCardBatchCategory,
    cardBatchCount, setCardBatchCount,
    generatedBatch, setGeneratedBatch,
    selectedMikrotikNet, setSelectedMikrotikNet,
    mikrotikIpInput, setMikrotikIpInput,
    mikrotikUserInput, setMikrotikUserInput,
    mikrotikPassInput, setMikrotikPassInput,
    copiedScript, setCopiedScript,
    showNewUserModal, setShowNewUserModal,
    newUserName, setNewUserName,
    newUserEmail, setNewUserEmail,
    newUserRole, setNewUserRole,
    newUserPhone, setNewUserPhone,
    dataEditRequests, setDataEditRequests,
    withdrawals, setWithdrawals,
    activeNetworks, setActiveNetworks,
    platformCommissionRate,
  } = ctx;

  const [inspectDataEditReq, setInspectDataEditReq] = React.useState<any>(null); // To be fixed properly later if needed

  // Map actions
  const {
    handleApproveAndProvision,
    handleConfirmRequestModify,
    handleSaveBalanceAdjust,
    handleSaveEditNetwork,
    handleApproveDataEditRequest,
    handleRejectDataEditRequest,
    handleProcessWithdrawal,
    handleCreateNewNetwork,
    handleGenerateCardsBatch,
    handleAddAdminUser,
    handleSaveSettings
  } = actions;

  return (
    <>
      {/* INSPECT APPLICATION MODAL */}
      {inspectApp && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#121927] border border-slate-800 rounded-3xl p-6 max-w-3xl w-full my-8 space-y-5 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-black text-white text-lg">{inspectApp.formData.network.networkName}</h3>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                    {inspectApp.status === 'pending' ? 'قيد المراجعة' : inspectApp.status === 'approved' ? 'معتمد' : inspectApp.status}
                  </span>
                </div>
                <span className="font-mono text-xs text-indigo-400">مرجع الطلب: {inspectApp.referenceNumber} • {new Date(inspectApp.createdAt).toLocaleDateString('ar-YE')}</span>
              </div>
              <button onClick={() => setInspectApp(null)} className="text-slate-400 hover:text-white p-1 rounded-lg">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/70 space-y-2">
                <p className="font-bold text-indigo-400 text-sm flex items-center gap-1.5 border-b border-slate-700/60 pb-1.5">
                  <Users className="w-4 h-4" />
                  <span>بيانات مالك الشبكة الشخصية:</span>
                </p>
                <div className="space-y-1 text-slate-200">
                  <p><span className="text-slate-400">اسم المالك الرباعي:</span> <strong className="text-white">{inspectApp.formData.owner.ownerName}</strong></p>
                  <p><span className="text-slate-400">رقم التواصل:</span> <strong className="text-emerald-400 font-mono" dir="ltr">{inspectApp.formData.owner.contactNumber}</strong></p>
                  <p><span className="text-slate-400">رقم المالك:</span> <strong className="font-mono text-slate-300">{inspectApp.formData.owner.ownerId}</strong></p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/70 space-y-2">
                <p className="font-bold text-indigo-400 text-sm flex items-center gap-1.5 border-b border-slate-700/60 pb-1.5">
                  <Globe className="w-4 h-4" />
                  <span>بيانات الموقع والمحفظة المالية:</span>
                </p>
                <div className="space-y-1 text-slate-200">
                  <p><span className="text-slate-400">المحافظة / المدينة:</span> <strong className="text-white">{inspectApp.formData.network.governorate} - {inspectApp.formData.network.city}</strong></p>
                  <p><span className="text-slate-400">الحي / التغطية:</span> <strong className="text-slate-300">{inspectApp.formData.network.neighborhood || 'المنطقة الرئيسية'}</strong></p>
                  <p><span className="text-slate-400">هاتف الشبكة المعتمد:</span> <strong className="font-mono text-slate-300" dir="ltr">{inspectApp.formData.network.networkPhone || inspectApp.formData.owner.contactNumber}</strong></p>
                  <p><span className="text-slate-400">رقم محفظة جيب المعتمدة:</span> <strong className="text-emerald-400 font-mono font-bold">{inspectApp.formData.jaibWalletNumber}</strong></p>
                </div>
              </div>
            </div>

            {/* Comprehensive Card Categories Table */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-bold text-white text-xs flex items-center gap-1.5">
                  <CreditCard className="w-4 h-4 text-emerald-400" />
                  <span>جدول كروت الفئات المقدمة من المالك ({inspectApp.formData.cardCategories.length} فئات):</span>
                </h4>
              </div>
              <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900/90">
                <table className="w-full text-right text-xs">
                  <thead className="bg-slate-800/80 text-slate-300 border-b border-slate-700">
                    <tr>
                      <th className="py-2.5 px-3">اسم الفئة</th>
                      <th className="py-2.5 px-3">السعر (ر.ي)</th>
                      <th className="py-2.5 px-3">حجم الميجا</th>
                      <th className="py-2.5 px-3">الزمن (ساعات)</th>
                      <th className="py-2.5 px-3">الصلاحية (أيام)</th>
                      <th className="py-2.5 px-3">نوع الكرت</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 text-slate-200">
                    {inspectApp.formData.cardCategories.map((c, i) => (
                      <tr key={i} className="hover:bg-slate-800/40">
                        <td className="py-2.5 px-3 font-bold text-white">{c.name || c.price}</td>
                        <td className="py-2.5 px-3 font-mono font-bold text-emerald-400">{Number(c.price)} ر.ي</td>
                        <td className="py-2.5 px-3 font-mono">{c.mega ? `${c.mega} MB` : 'غير محدد'}</td>
                        <td className="py-2.5 px-3 font-mono">{c.hours ? `${c.hours} ساعة` : 'مفتوح'}</td>
                        <td className="py-2.5 px-3 font-mono">{c.validityDays ? `${c.validityDays} يوم` : 'بلا حد'}</td>
                        <td className="py-2.5 px-3">
                          <span className="px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 text-[11px]">
                            {c.cardType || 'مستخدم وكلمة مرور'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-2.5 pt-3 border-t border-slate-800">
              <button
                onClick={() => handleApproveAndProvision(inspectApp)}
                className="flex-1 w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-900/30 cursor-pointer flex items-center justify-center gap-2 transition-all hover:scale-[1.01]"
              >
                <CheckCircle2 className="w-4.5 h-4.5" />
                <span>قبول واعتماد الطلب وإرسال التفعيل عبر واتساب</span>
              </button>
              <button
                onClick={() => {
                  setRequestModifyApp(inspectApp);
                  setModificationReasonText(inspectApp.notes || 'يرجى مراجعة وتعديل بيانات الطلب وفئات الكروت.');
                }}
                className="py-3 px-4 rounded-2xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs shadow-lg shadow-amber-900/30 cursor-pointer flex items-center justify-center gap-1.5 transition-all hover:scale-[1.01]"
              >
                <FileEdit className="w-4 h-4" />
                <span>طلب تعديل البيانات 📝</span>
              </button>
              <button
                onClick={() => setInspectApp(null)}
                className="px-5 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold cursor-pointer transition-colors"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}

    </>
  );
};
