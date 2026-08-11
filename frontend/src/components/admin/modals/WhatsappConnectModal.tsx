import React from 'react';
import { X, Copy, Check, MessageCircle } from 'lucide-react';
import { useAdminContext } from '../../../context/AdminContext';
import { useAdminActions } from '../../../hooks/useAdminActions';
import { useAppContext } from '../../../context/AppContext';

export const WhatsappConnectModal = () => {
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
      {/* WHATSAPP APPROVAL & CREDENTIALS MODAL */}
      {whatsappModalData && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#121927] border border-emerald-500/40 rounded-3xl p-6 max-w-lg w-full space-y-5 shadow-2xl shadow-emerald-950/60 animate-in fade-in duration-200">
            {/* Modal Header */}
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  <MessageCircle className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-black text-white text-base">
                    {whatsappModalData.isReset ? 'تم توليد كلمة مرور جديدة! 🔑' : 'تم قبول الطلب واعتماد بيانات الدخول! 🎉'}
                  </h3>
                  <p className="text-xs text-slate-400">
                    {whatsappModalData.isReset ? 'إرسال بيانات الدخول المحدثة عبر واتساب' : 'إرسال بيانات حساب المالك والكلمة المؤقتة عبر واتساب'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setWhatsappModalData(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Account Details Highlight Cards */}
            <div className="space-y-2.5 text-xs">
              <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">المالك والشبكة:</span>
                  <span className="font-bold text-white">{whatsappModalData.ownerName} ({whatsappModalData.networkName})</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">رقم المالك (الهاتف):</span>
                  <span className="font-mono font-bold text-emerald-400 text-sm" dir="ltr">{whatsappModalData.ownerPhone}</span>
                </div>
                <div className="flex justify-between items-center bg-indigo-500/10 p-2.5 rounded-xl border border-indigo-500/20">
                  <span className="text-indigo-300 font-bold">كلمة المرور المؤقتة:</span>
                  <span className="font-mono font-black text-amber-400 text-base">{whatsappModalData.tempPassword}</span>
                </div>
              </div>

              {/* Message Box Preview */}
              <div>
                <label className="block text-slate-300 mb-1.5 font-bold text-[11px]">
                  نص رسالة الواتساب الجاهزة للإرسال:
                </label>
                <div className="p-3.5 rounded-2xl bg-[#0b101a] border border-slate-800 text-slate-200 text-xs font-mono leading-relaxed space-y-1 dir-rtl text-right">
                  <p className="text-emerald-400 font-bold">أهلاً بك أ/ {whatsappModalData.ownerName}! {whatsappModalData.isReset ? '👋' : '🥳'}</p>
                  <p>{whatsappModalData.isReset ? `تم توليد كلمة مرور مؤقتة جديدة لشبكتك (${whatsappModalData.networkName}) في Card Box.` : `تمت الموافقة على طلب انضمام شبكتك (${whatsappModalData.networkName}) في Card Box.`}</p>
                  <p className="pt-1 text-slate-300 font-bold">{whatsappModalData.isReset ? 'بيانات تسجيل الدخول الجديدة:' : 'بيانات تسجيل الدخول المؤقتة:'}</p>
                  <p>👤 رقم المالك: <span className="text-emerald-300 font-bold">{whatsappModalData.ownerPhone}</span></p>
                  <p>🔑 كلمة المرور المؤقتة: <span className="text-amber-300 font-bold">{whatsappModalData.tempPassword}</span></p>
                  <p>🏢 كود الشبكة: <span className="text-pink-300 font-bold">{whatsappModalData.networkCode}</span></p>
                  <p className="break-all pt-1 text-indigo-300">🔗 رابط الدخول: {whatsappModalData.loginUrl}</p>
                  <p className="text-slate-400 text-[11px] pt-1">ملاحظة: عند تسجيل الدخول بالكلمة المؤقتة سيطلب منك النظام مباشرة تعيين كلمة مرور جديدة خاصة بك.</p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-2 pt-1">
              <a
                href={`https://wa.me/967${whatsappModalData.ownerPhone.replace(/^0+/, '')}?text=${encodeURIComponent(
                  `أهلاً بك أ/ ${whatsappModalData.ownerName}! ${whatsappModalData.isReset ? '👋' : '🥳'}\n${whatsappModalData.isReset ? `تم توليد كلمة مرور مؤقتة جديدة لشبكتك (${whatsappModalData.networkName}) في Card Box.` : `تمت الموافقة على طلب انضمام شبكتك (${whatsappModalData.networkName}) في Card Box.`}\n\n${whatsappModalData.isReset ? 'بيانات تسجيل الدخول الجديدة الخاصة بك:' : 'بيانات تسجيل الدخول المؤقتة الخاصة بك:'}\n👤 رقم المالك: ${whatsappModalData.ownerPhone}\n🔑 كلمة المرور المؤقتة: ${whatsappModalData.tempPassword}\n🏢 كود الشبكة: ${whatsappModalData.networkCode}\n🔗 رابط الدخول: ${whatsappModalData.loginUrl}\n\nيرجى الدخول وتغيير كلمة المرور المؤقتة للوصول للوحة التحكم.`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => {
                  setTimeout(() => setWhatsappModalData(null), 1500);
                }}
                className="w-full py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs shadow-lg shadow-emerald-900/40 cursor-pointer flex items-center justify-center gap-2 transition-all hover:scale-[1.01]"
              >
                <MessageCircle className="w-5 h-5 fill-current" />
                <span>إرسال التفاصيل عبر واتساب 💬</span>
              </a>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const textToCopy = `أهلاً بك أ/ ${whatsappModalData.ownerName}! ${whatsappModalData.isReset ? '👋' : '🥳'}\n${whatsappModalData.isReset ? `تم توليد كلمة مرور مؤقتة جديدة لشبكتك (${whatsappModalData.networkName}) في Card Box.` : `تمت الموافقة على طلب انضمام شبكتك (${whatsappModalData.networkName}) في Card Box.`}\n\n${whatsappModalData.isReset ? 'بيانات تسجيل الدخول الجديدة الخاصة بك:' : 'بيانات تسجيل الدخول المؤقتة الخاصة بك:'}\n👤 رقم المالك: ${whatsappModalData.ownerPhone}\n🔑 كلمة المرور المؤقتة: ${whatsappModalData.tempPassword}\n🏢 كود الشبكة: ${whatsappModalData.networkCode}\n🔗 رابط الدخول: ${whatsappModalData.loginUrl}\n\nيرجى الدخول وتغيير كلمة المرور المؤقتة للوصول للوحة التحكم.`;
                    navigator.clipboard.writeText(textToCopy);
                    setCopiedWpText(true);
                    setTimeout(() => setCopiedWpText(false), 2000);
                  }}
                  className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold cursor-pointer flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Copy className="w-4 h-4 text-indigo-400" />
                  <span>{copiedWpText ? '✅ تم نسخ النص!' : 'نسخ نص الرسالة 📋'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setWhatsappModalData(null)}
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
