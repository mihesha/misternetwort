import React from 'react';
import { X, Copy, Check, MessageCircle } from 'lucide-react';
import { useAdminContext } from '../../../context/AdminContext';
import { useAdminActions } from '../../../hooks/useAdminActions';
import { useAppContext } from '../../../context/AppContext';

export const WhatsappModifyRequestModal = () => {
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
      {/* WHATSAPP DATA MODIFICATION MODAL */}
      {whatsappModifyData && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#121927] border border-amber-500/40 rounded-3xl p-6 max-w-lg w-full space-y-5 shadow-2xl shadow-amber-950/60 animate-in fade-in duration-200">
            {/* Modal Header */}
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  <MessageCircle className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-black text-white text-base">تم إعداد إشعار طلب التعديل! 📝</h3>
                  <p className="text-xs text-slate-400">إرسال رابط التعديل وملاحظات الإدارة للمالك عبر واتساب</p>
                </div>
              </div>
              <button
                onClick={() => setWhatsappModifyData(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Message Box Preview */}
            <div className="space-y-2.5 text-xs">
              <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-1.5">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">المالك والشبكة:</span>
                  <span className="font-bold text-white">{whatsappModifyData.ownerName} ({whatsappModifyData.networkName})</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">رقم المالك (الهاتف):</span>
                  <span className="font-mono font-bold text-emerald-400 text-sm" dir="ltr">{whatsappModifyData.ownerPhone}</span>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 mb-1.5 font-bold text-[11px]">
                  نص رسالة طلب التعديل الجاهزة للإرسال:
                </label>
                <div className="p-3.5 rounded-2xl bg-[#0b101a] border border-slate-800 text-slate-200 text-xs font-mono leading-relaxed space-y-1.5 dir-rtl text-right">
                  <p className="text-amber-400 font-bold">أهلاً بك أ/ {whatsappModifyData.ownerName}! ⚠️</p>
                  <p>بخصوص طلب انضمام شبكتك ({whatsappModifyData.networkName}) في Card Box:</p>
                  <p className="text-amber-300 font-bold bg-amber-950/40 p-2 rounded-xl border border-amber-500/20">
                    📝 ملاحظات الإدارة للتعديل: {whatsappModifyData.notes}
                  </p>
                  <p className="break-all pt-1 text-indigo-300">🔗 رابط التعديل المباشر: {whatsappModifyData.editUrl}</p>
                  <p className="text-slate-400 text-[11px]">يرجى فتح الرابط وتعديل البيانات المطلوبة ثم النقر على "إعادة إرسال الطلب بعد التعديل".</p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-2 pt-1">
              <a
                href={`https://wa.me/967${whatsappModifyData.ownerPhone.replace(/^0+/, '')}?text=${encodeURIComponent(
                  `أهلاً بك أ/ ${whatsappModifyData.ownerName}! ⚠️\nبخصوص طلب انضمام شبكتك (${whatsappModifyData.networkName}) في Card Box:\n\nطلبت الإدارة مراجعة وتعديل البيانات التالية:\n📝 الملاحظات: ${whatsappModifyData.notes}\n\n🔗 رابط التعديل وإعادة الإرسال:\n${whatsappModifyData.editUrl}\n\nيرجى فتح الرابط وتعديل البيانات المطلوبة ثم إعادة إرسال الطلب.`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => {
                  setTimeout(() => setWhatsappModifyData(null), 1500);
                }}
                className="w-full py-3.5 rounded-2xl bg-amber-600 hover:bg-amber-500 text-white font-black text-xs shadow-lg shadow-amber-900/40 cursor-pointer flex items-center justify-center gap-2 transition-all hover:scale-[1.01]"
              >
                <MessageCircle className="w-5 h-5 fill-current" />
                <span>إرسال طلب التعديل عبر واتساب 💬</span>
              </a>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const textToCopy = `أهلاً بك أ/ ${whatsappModifyData.ownerName}! ⚠️\nبخصوص طلب انضمام شبكتك (${whatsappModifyData.networkName}) في Card Box:\n\nطلبت الإدارة مراجعة وتعديل البيانات التالية:\n📝 الملاحظات: ${whatsappModifyData.notes}\n\n🔗 رابط التعديل وإعادة الإرسال:\n${whatsappModifyData.editUrl}\n\nيرجى فتح الرابط وتعديل البيانات المطلوبة ثم إعادة إرسال الطلب.`;
                    navigator.clipboard.writeText(textToCopy);
                    setCopiedModifyWpText(true);
                    setTimeout(() => setCopiedModifyWpText(false), 2000);
                  }}
                  className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold cursor-pointer flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Copy className="w-4 h-4 text-indigo-400" />
                  <span>{copiedModifyWpText ? '✅ تم نسخ النص!' : 'نسخ نص الرسالة 📋'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setWhatsappModifyData(null)}
                  className="px-5 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white text-xs font-bold cursor-pointer transition-colors"
                >
                  إغلاق
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </>
  );
};
