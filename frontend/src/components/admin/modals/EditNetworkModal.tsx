import React from 'react';
import { X } from 'lucide-react';
import { useAdminContext } from '../../../context/AdminContext';
import { useAdminActions } from '../../../hooks/useAdminActions';
import { useAppContext } from '../../../context/AppContext';

export const EditNetworkModal = () => {
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
      {/* EDIT ACTIVE NETWORK MODAL */}
      {editNetworkModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#121927] border border-slate-800 rounded-3xl p-6 max-w-md w-full space-y-4">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="font-black text-white text-base">تعديل بيانات {editNetworkModal.networkName}</h3>
              <button onClick={() => setEditNetworkModal(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 mb-1 font-bold">اسم الشبكة:</label>
                <input
                  type="text"
                  value={editNetworkModal.networkName}
                  onChange={(e) => setEditNetworkModal({ ...editNetworkModal, networkName: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#1d273a] border border-slate-700 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-bold">اسم المالك:</label>
                <input
                  type="text"
                  value={editNetworkModal.ownerName}
                  onChange={(e) => setEditNetworkModal({ ...editNetworkModal, ownerName: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#1d273a] border border-slate-700 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-bold">رقم محفظة جيب:</label>
                <input
                  type="text"
                  value={editNetworkModal.jaibWalletNumber}
                  onChange={(e) => setEditNetworkModal({ ...editNetworkModal, jaibWalletNumber: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#1d273a] border border-slate-700 text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-bold">الحالة الإدارية:</label>
                <select
                  value={editNetworkModal.status}
                  onChange={(e) => setEditNetworkModal({ ...editNetworkModal, status: e.target.value as any })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#1d273a] border border-slate-700 text-white"
                >
                  <option value="active">نشطة ومفعلة</option>
                  <option value="suspended">موقوفة مؤقتاً</option>
                  <option value="pending_activation">قيد التغيير والتهيئة</option>
                </select>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={handleSaveEditNetwork}
                className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs cursor-pointer"
              >
                حفظ التعديلات
              </button>
              <button
                onClick={() => setEditNetworkModal(null)}
                className="px-4 py-2.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold cursor-pointer"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

    </>
  );
};
