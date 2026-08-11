import React from 'react';
import { X, CheckCircle2, XCircle, MessageCircle, FileEdit } from 'lucide-react';
import { useAdminContext } from '../../../context/AdminContext';
import { useAdminActions } from '../../../hooks/useAdminActions';
import { useAppContext } from '../../../context/AppContext';

export const InspectDataEditReqModal = () => {
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
    inspectDataEditReq, setInspectDataEditReq
  } = ctx;

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
      {/* INSPECT DATA EDIT REQUEST MODAL - FULL COMPARISON DIFF VIEW */}
      {inspectDataEditReq && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#121927] border border-slate-800 rounded-3xl p-6 max-w-3xl w-full my-8 space-y-6 text-right font-['Cairo',sans-serif] shadow-2xl">
            {/* Modal Header */}
            <div className="flex justify-between items-center border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                  <FileEdit className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-black text-white text-lg">مقارنة وتدقيق طلب تعديل بيانات الشبكة</h3>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                      جدول الفروقات (Diff)
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 font-mono mt-0.5">
                    مرجع الطلب: <span className="text-indigo-400 font-bold">{inspectDataEditReq.referenceNumber}</span> • كود الشبكة: <span className="text-amber-400 font-bold">#{inspectDataEditReq.networkCode}</span>
                  </p>
                </div>
              </div>
              <button
                onClick={() => setInspectDataEditReq(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Owner Note / Alert */}
            {inspectDataEditReq.adminNotes && (
              <div className="p-4 rounded-2xl bg-indigo-950/50 border border-indigo-500/30 text-xs space-y-1">
                <span className="text-indigo-300 font-bold flex items-center gap-1.5">
                  💬 ملاحظات وتوضيح المالك للإدارة العامة:
                </span>
                <p className="text-slate-200 leading-relaxed font-medium">{inspectDataEditReq.adminNotes}</p>
              </div>
            )}

            {/* 1. BASIC INFORMATION COMPARISON TABLE */}
            <div className="space-y-3">
              <h4 className="font-black text-white text-sm flex items-center gap-2">
                <span>📋 مقارنة البيانات الأساسية للشبكة (قبل التعديل ⬅️ بعد التعديل)</span>
              </h4>

              <div className="border border-slate-800 rounded-2xl overflow-hidden shadow-inner bg-slate-900/40">
                <table className="w-full text-right text-xs">
                  <thead className="bg-slate-800/90 text-slate-300 font-bold border-b border-slate-700">
                    <tr>
                      <th className="p-3 w-1/4">اسم الخانة / البيان</th>
                      <th className="p-3 w-1/3 text-slate-400">قبل التعديل (السابق)</th>
                      <th className="p-3 w-1/3 text-emerald-400">بعد التعديل (المطلوب)</th>
                      <th className="p-3 text-center">حالة التغيير</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 text-slate-200">
                    {/* Row 1: Network Name */}
                    {(() => {
                      const oldVal = inspectDataEditReq.previousData?.networkName || inspectDataEditReq.networkName;
                      const newVal = inspectDataEditReq.networkName;
                      const isChanged = oldVal !== newVal;
                      return (
                        <tr className={isChanged ? 'bg-amber-500/10 border-r-4 border-r-amber-500' : 'hover:bg-slate-800/30'}>
                          <td className="p-3 font-bold text-slate-300">اسم الشبكة</td>
                          <td className="p-3 text-slate-400 font-medium">{oldVal}</td>
                          <td className="p-3 font-bold text-white">{newVal}</td>
                          <td className="p-3 text-center">
                            {isChanged ? (
                              <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">✏️ تم التعديل</span>
                            ) : (
                              <span className="px-2.5 py-1 rounded-full text-[11px] font-medium bg-slate-800 text-slate-400">بدون تغيير</span>
                            )}
                          </td>
                        </tr>
                      );
                    })()}

                    {/* Row 2: Owner Name */}
                    {(() => {
                      const oldVal = inspectDataEditReq.previousData?.ownerName || inspectDataEditReq.ownerName;
                      const newVal = inspectDataEditReq.ownerName;
                      const isChanged = oldVal !== newVal;
                      return (
                        <tr className={isChanged ? 'bg-amber-500/10 border-r-4 border-r-amber-500' : 'hover:bg-slate-800/30'}>
                          <td className="p-3 font-bold text-slate-300">اسم المالك / المسجل</td>
                          <td className="p-3 text-slate-400 font-medium">{oldVal}</td>
                          <td className="p-3 font-bold text-white">{newVal}</td>
                          <td className="p-3 text-center">
                            {isChanged ? (
                              <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">✏️ تم التعديل</span>
                            ) : (
                              <span className="px-2.5 py-1 rounded-full text-[11px] font-medium bg-slate-800 text-slate-400">بدون تغيير</span>
                            )}
                          </td>
                        </tr>
                      );
                    })()}

                    {/* Row 3: Contact Phone */}
                    {(() => {
                      const oldVal = inspectDataEditReq.previousData?.contactPhone || inspectDataEditReq.contactPhone;
                      const newVal = inspectDataEditReq.contactPhone;
                      const isChanged = oldVal !== newVal;
                      return (
                        <tr className={isChanged ? 'bg-amber-500/10 border-r-4 border-r-amber-500' : 'hover:bg-slate-800/30'}>
                          <td className="p-3 font-bold text-slate-300">رقم الهاتف والتواصل</td>
                          <td className="p-3 text-slate-400 font-mono" dir="ltr">{oldVal}</td>
                          <td className="p-3 font-mono font-bold text-emerald-400" dir="ltr">{newVal}</td>
                          <td className="p-3 text-center">
                            {isChanged ? (
                              <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">✏️ تم التعديل</span>
                            ) : (
                              <span className="px-2.5 py-1 rounded-full text-[11px] font-medium bg-slate-800 text-slate-400">بدون تغيير</span>
                            )}
                          </td>
                        </tr>
                      );
                    })()}

                    {/* Row 4: Governorate & City */}
                    {(() => {
                      const oldVal = inspectDataEditReq.previousData
                        ? `${inspectDataEditReq.previousData.governorate || ''} - ${inspectDataEditReq.previousData.city || ''}`
                        : `${inspectDataEditReq.governorate} - ${inspectDataEditReq.city}`;
                      const newVal = `${inspectDataEditReq.governorate} - ${inspectDataEditReq.city}`;
                      const isChanged = oldVal !== newVal;
                      return (
                        <tr className={isChanged ? 'bg-amber-500/10 border-r-4 border-r-amber-500' : 'hover:bg-slate-800/30'}>
                          <td className="p-3 font-bold text-slate-300">المحافظة والمدينة</td>
                          <td className="p-3 text-slate-400 font-medium">{oldVal}</td>
                          <td className="p-3 font-bold text-white">{newVal}</td>
                          <td className="p-3 text-center">
                            {isChanged ? (
                              <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">✏️ تم التعديل</span>
                            ) : (
                              <span className="px-2.5 py-1 rounded-full text-[11px] font-medium bg-slate-800 text-slate-400">بدون تغيير</span>
                            )}
                          </td>
                        </tr>
                      );
                    })()}

                    {/* Row 5: District */}
                    {(() => {
                      const oldVal = inspectDataEditReq.previousData?.district || inspectDataEditReq.district;
                      const newVal = inspectDataEditReq.district;
                      const isChanged = oldVal !== newVal;
                      return (
                        <tr className={isChanged ? 'bg-amber-500/10 border-r-4 border-r-amber-500' : 'hover:bg-slate-800/30'}>
                          <td className="p-3 font-bold text-slate-300">الحي والشارع المفصل</td>
                          <td className="p-3 text-slate-400 font-medium">{oldVal}</td>
                          <td className="p-3 font-bold text-white">{newVal}</td>
                          <td className="p-3 text-center">
                            {isChanged ? (
                              <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">✏️ تم التعديل</span>
                            ) : (
                              <span className="px-2.5 py-1 rounded-full text-[11px] font-medium bg-slate-800 text-slate-400">بدون تغيير</span>
                            )}
                          </td>
                        </tr>
                      );
                    })()}

                    {/* Row 6: Jaib Wallet */}
                    {(() => {
                      const oldVal = inspectDataEditReq.previousData?.jaibWallet || inspectDataEditReq.jaibWallet;
                      const newVal = inspectDataEditReq.jaibWallet;
                      const isChanged = oldVal !== newVal;
                      return (
                        <tr className={isChanged ? 'bg-amber-500/10 border-r-4 border-r-amber-500' : 'hover:bg-slate-800/30'}>
                          <td className="p-3 font-bold text-slate-300">رقم محفظة جيب للتحويلات</td>
                          <td className="p-3 text-slate-400 font-mono" dir="ltr">{oldVal}</td>
                          <td className="p-3 font-mono font-bold text-emerald-400" dir="ltr">{newVal}</td>
                          <td className="p-3 text-center">
                            {isChanged ? (
                              <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">✏️ تم التعديل</span>
                            ) : (
                              <span className="px-2.5 py-1 rounded-full text-[11px] font-medium bg-slate-800 text-slate-400">بدون تغيير</span>
                            )}
                          </td>
                        </tr>
                      );
                    })()}
                  </tbody>
                </table>
              </div>
            </div>

            {/* 2. CATEGORIES COMPARISON TABLE */}
            <div className="space-y-3">
              <h4 className="font-black text-white text-sm flex items-center justify-between">
                <span>🎴 مقارنة فئات الكروت والأسعار (قبل التعديل vs بعد التعديل)</span>
              </h4>

              <div className="border border-slate-800 rounded-2xl overflow-x-auto shadow-inner bg-slate-900/40">
                <table className="w-full text-right text-xs">
                  <thead className="bg-slate-800/90 text-slate-300 font-bold border-b border-slate-700">
                    <tr>
                      <th className="p-3">اسم الفئة</th>
                      <th className="p-3 text-slate-400">المواصفات السابقة (قبل)</th>
                      <th className="p-3 text-emerald-400">المواصفات الجديدة (بعد)</th>
                      <th className="p-3 text-center">التغيير المطلوب</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 text-slate-200">
                    {(() => {
                      const oldCats = inspectDataEditReq.previousData?.categories || [];
                      const newCats = inspectDataEditReq.categories || [];

                      const allCatNames = Array.from(
                        new Set([...oldCats.map((c) => c.name), ...newCats.map((c) => c.name)])
                      );

                      return allCatNames.map((catName) => {
                        const oldC = oldCats.find((c) => c.name === catName);
                        const newC = newCats.find((c) => c.name === catName);

                        let statusType: 'same' | 'added' | 'removed' | 'modified' | 'deactivated' | 'reactivated' = 'same';
                        if (!oldC && newC) statusType = 'added';
                        else if (oldC && !newC) statusType = 'removed';
                        else if (oldC && newC) {
                          const oldEnabled = oldC.enabled !== false; // default true
                          const newEnabled = newC.enabled !== false; // default true
                          
                          if (oldEnabled && !newEnabled) {
                            statusType = 'deactivated';
                          } else if (!oldEnabled && newEnabled) {
                            statusType = 'reactivated';
                          } else if (
                            oldC.price !== newC.price ||
                            oldC.mb !== newC.mb ||
                            oldC.hours !== newC.hours ||
                            oldC.validityDays !== newC.validityDays
                          ) {
                            statusType = 'modified';
                          }
                        }

                        return (
                          <tr
                            key={catName}
                            className={
                              statusType === 'modified'
                                ? 'bg-amber-500/10 border-r-4 border-r-amber-500'
                                : statusType === 'added'
                                ? 'bg-emerald-500/10 border-r-4 border-r-emerald-500'
                                : statusType === 'removed'
                                ? 'bg-rose-500/10 border-r-4 border-r-rose-500'
                                : statusType === 'deactivated'
                                ? 'bg-red-500/10 border-r-4 border-r-red-500'
                                : statusType === 'reactivated'
                                ? 'bg-blue-500/10 border-r-4 border-r-blue-500'
                                : 'hover:bg-slate-800/30'
                            }
                          >
                            <td className="p-3 font-bold text-indigo-300">
                              فئة {catName} ريال
                            </td>

                            {/* Before */}
                            <td className="p-3 text-slate-400">
                              {oldC ? (
                                <div className="space-y-0.5">
                                  <span className="font-mono text-slate-300 font-bold">{oldC.price} ر.ي</span>
                                  <span className="block text-[11px] text-slate-400">
                                    {oldC.mb}MB • {oldC.hours}س • {oldC.validityDays}أيام
                                  </span>
                                  {statusType === 'deactivated' && (
                                    <span className="block text-[11px] text-emerald-400 font-bold mt-1">كانت مفعلة ✅</span>
                                  )}
                                  {statusType === 'reactivated' && (
                                    <span className="block text-[11px] text-red-400 font-bold mt-1">كانت معطلة ❌</span>
                                  )}
                                </div>
                              ) : (
                                <span className="text-slate-500 italic">غير موجودة سابقاً</span>
                              )}
                            </td>

                            {/* After */}
                            <td className="p-3 text-emerald-300">
                              {newC ? (
                                <div className="space-y-0.5">
                                  <span className={`font-mono font-bold ${statusType === 'deactivated' ? 'text-red-400 line-through opacity-70' : 'text-emerald-400'}`}>{newC.price} ر.ي</span>
                                  <span className={`block text-[11px] ${statusType === 'deactivated' ? 'text-slate-500 line-through' : 'text-slate-200'}`}>
                                    {newC.mb}MB • {newC.hours}س • {newC.validityDays}أيام
                                  </span>
                                  {statusType === 'deactivated' && (
                                    <span className="block text-[11px] text-red-400 font-bold mt-1 bg-red-500/10 px-2 py-0.5 rounded w-fit">تم الإيقاف ❌</span>
                                  )}
                                  {statusType === 'reactivated' && (
                                    <span className="block text-[11px] text-blue-400 font-bold mt-1 bg-blue-500/10 px-2 py-0.5 rounded w-fit">تم التفعيل ✅</span>
                                  )}
                                </div>
                              ) : (
                                <span className="text-rose-400 font-bold">تم إلغاؤها / حذفها</span>
                              )}
                            </td>

                            {/* Diff badge */}
                            <td className="p-3 text-center">
                              {statusType === 'added' && (
                                <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                                  ✨ فئة جديدة مضافة
                                </span>
                              )}
                              {statusType === 'removed' && (
                                <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30">
                                  ❌ فئة ملغاة
                                </span>
                              )}
                              {statusType === 'modified' && (
                                <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                                  ⚡ تعديل مواصفات/سعر
                                </span>
                              )}
                              {statusType === 'same' && (
                                <span className="px-2.5 py-1 rounded-full text-[11px] font-medium bg-slate-800 text-slate-400">
                                  بدون تغيير
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      });
                    })()}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Status & Action Buttons */}
            <div className="pt-3 border-t border-slate-800 space-y-3">
              {inspectDataEditReq.status === 'pending' ? (
                <div className="flex flex-col sm:flex-row items-center gap-3">
                  <button
                    onClick={() => handleApproveDataEditRequest(inspectDataEditReq)}
                    className="w-full sm:flex-1 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs shadow-lg shadow-emerald-900/30 cursor-pointer flex items-center justify-center gap-2 transition-all hover:scale-[1.01]"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>قبول واعتمد جميع التعديلات والشبكة 🟢</span>
                  </button>

                  <button
                    onClick={() => {
                      const reason = prompt('أدخل سبب رفض طلب التعديل (سيظهر للمالك):', 'بيانات غير مكتملة، يرجى التواصل مع الدعم الفني.');
                      if (reason !== null) {
                        handleRejectDataEditRequest(inspectDataEditReq, reason);
                      }
                    }}
                    className="w-full sm:flex-1 py-3.5 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-black text-xs shadow-lg shadow-rose-900/30 cursor-pointer flex items-center justify-center gap-2 transition-all hover:scale-[1.01]"
                  >
                    <XCircle className="w-4 h-4" />
                    <span>رفض طلب التعديل 🔴</span>
                  </button>

                  <a
                    href={`https://wa.me/967${inspectDataEditReq.contactPhone.replace(/^0+/, '')}?text=${encodeURIComponent(
                      `أهلاً بك أ/ ${inspectDataEditReq.ownerName}! 💬\nبخصوص طلب تعديل بيانات شبكتك (${inspectDataEditReq.networkName}) [مرجع: ${inspectDataEditReq.referenceNumber}]:`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full sm:w-auto px-5 py-3.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs cursor-pointer flex items-center justify-center gap-2 transition-all"
                  >
                    <MessageCircle className="w-4 h-4 text-emerald-400" />
                    <span>واتساب</span>
                  </a>
                </div>
              ) : (
                <div className="flex items-center justify-between bg-slate-800/40 p-4 rounded-2xl border border-slate-700">
                  <span className="text-xs text-slate-300">
                    حالة الطلب حالياً:{' '}
                    <strong className={inspectDataEditReq.status === 'approved' ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                      {inspectDataEditReq.status === 'approved' ? '🟢 تم الاعتماد والتحديث بالمنظومة' : '🔴 تم الرفض'}
                    </strong>
                  </span>
                  <button
                    onClick={() => setInspectDataEditReq(null)}
                    className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold"
                  >
                    إغلاق
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

    </>
  );
};
