import { useAdminContext } from '../context/AdminContext';
import { NetworkApplication, ActiveNetwork, WithdrawalRequest, NetworkDataEditRequest } from '../types';
import { useAppContext } from '../context/AppContext';

export const useAdminActions = () => {
  const ctx = useAdminContext();
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
    fetchAdminData,
    platformCommissionRate,
    stats,
    auditLogs,
    inspectDataEditReq, setInspectDataEditReq,
    adminUsers, setAdminUsers,
    supportPhone,
    maintenanceMode,
    autoApproveApplications,
    mikrotikGlobalPort
  } = ctx;

  const onUpdateStatus = async (id: string, status: string) => {
    try {
      await fetch('/api/admin/applications/' + id + '/status', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
    } catch(e) {}
  };

  const { handleApproveWithCredentials: onApproveWithCredentials, ownerCredentials } = useAppContext();

  const handleApproveAndProvision = async (app: NetworkApplication) => {
    const ownerPhone = app.formData.owner.contactNumber || app.formData.owner.ownerId;
    
    // Find if we already generated a credential for this owner
    const existingCred = ownerCredentials.find((c) => c.ownerPhone === ownerPhone);
    const generatedTempPass = existingCred ? existingCred.tempPassword : `${Math.floor(100000 + Math.random() * 900000)}`;
    let netCode = `${Math.floor(10000 + Math.random() * 90000)}`;

    if (onApproveWithCredentials) {
      const returnedCode = await onApproveWithCredentials(app, generatedTempPass);
      if (returnedCode && typeof returnedCode === 'string') {
        netCode = returnedCode;
      }
    } else {
      onUpdateStatus(app.id, 'approved');
    }

    // Refresh admin data to fetch the newly created network from the API
    await fetchAdminData();
    setInspectApp(null);

    const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
    const loginLink = `${baseUrl}/owner/login?phone=${ownerPhone}`;

    setWhatsappModalData({
      ownerName: app.formData.owner.ownerName,
      ownerPhone: ownerPhone,
      tempPassword: generatedTempPass,
      networkName: app.formData.network.networkName,
      loginUrl: loginLink,
      networkCode: netCode,
    });
  };

  // Action: Request Data Modification from Applicant
  const handleConfirmRequestModify = () => {
    if (!requestModifyApp) return;
    const notes = modificationReasonText.trim() || 'يرجى مراجعة وتعديل بيانات الطلب وفئات الكروت.';

    // Update application status
    onUpdateStatus(requestModifyApp.id, 'needs_modification');
    requestModifyApp.notes = notes;
    requestModifyApp.status = 'needs_modification';

    const ownerPhone = requestModifyApp.formData.owner.contactNumber || requestModifyApp.formData.owner.ownerId;
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
    const editLink = `${baseUrl}/?view=register&ref=${requestModifyApp.referenceNumber}`;

    setWhatsappModifyData({
      ownerName: requestModifyApp.formData.owner.ownerName,
      ownerPhone: ownerPhone,
      networkName: requestModifyApp.formData.network.networkName,
      notes,
      editUrl: editLink,
    });

    setRequestModifyApp(null);
    setInspectApp(null);
  };

  // Balance Adjustment Action
  const handleSaveBalanceAdjust = async () => {
    if (!balanceAdjustNetwork || !adjustAmount) return;
    const delta = parseFloat(adjustAmount);
    if (isNaN(delta)) return;

    try {
      const res = await fetch(`/api/admin/networks/${balanceAdjustNetwork.id}/balance`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          balance: Math.max(0, balanceAdjustNetwork.balance + delta),
          amount_delta: delta,
          note: adjustNote || `تعديل رصيد بواسطة الإدارة العامة (${delta >= 0 ? '+' : ''}${delta} ر.ي)`
        }),
      });
      if (res.ok) {
        await fetchAdminData();
        setBalanceAdjustNetwork(null);
        setAdjustAmount('');
        setAdjustNote('');
        alert('✅ تم تحديث رصيد الشبكة وتسجيل العملية في السجل المالي!');
      } else {
        alert('❌ حدث خطأ أثناء التعديل');
      }
    } catch {
      alert('❌ فشل الاتصال بالخادم');
    }
  };

  // Save Edit Network Info
  const handleSaveEditNetwork = async () => {
    if (!editNetworkModal) return;

    try {
      const res = await fetch(`/api/admin/networks/${editNetworkModal.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editNetworkModal),
      });
      if (res.ok) {
        await fetchAdminData();
        setEditNetworkModal(null);
        alert('✅ تم حفظ بيانات الشبكة والتعديلات بنجاح!');
      } else {
        alert('❌ حدث خطأ أثناء تعديل الشبكة');
      }
    } catch {
      alert('❌ فشل الاتصال بالخادم');
    }
  };

  // Approve Data Edit Request from Network Owner
  const handleApproveDataEditRequest = async (req: NetworkDataEditRequest) => {
    try {
      await fetch(`/api/admin/edit-requests/${req.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'approved' })
      });
      
      // Refresh admin data to pull updated network and categories from DB
      await fetchAdminData();
    } catch {
      // ignore
    }

    // 1. Update status
    const updatedReqs = dataEditRequests.map(r => r.id === req.id ? { ...r, status: 'approved' as const } : r);
    setDataEditRequests(updatedReqs);

    // Also update matching activeNetwork
    setActiveNetworks((prev) =>
      prev.map((net) => {
        if (net.networkCode === req.networkCode || net.ownerName === req.ownerName) {
          return {
            ...net,
            networkName: req.networkName,
            contactNumber: req.contactPhone,
            governorate: req.governorate,
            city: req.city,
            neighborhood: req.district,
            jaibWalletNumber: req.jaibWallet,
          };
        }
        return net;
      })
    );

    setInspectDataEditReq(null);
    alert(`✅ تم قبول واعتمد طلب تعديل بيانات شبكة (${req.networkName}) [مرجع: ${req.referenceNumber}] وتحديث البيانات بالمنظومة!`);
  };

  // Reject Data Edit Request from Network Owner
  const handleRejectDataEditRequest = async (req: NetworkDataEditRequest, reason?: string) => {
    try {
      await fetch(`/api/admin/edit-requests/${req.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'rejected' })
      });
    } catch {
      // ignore
    }
    const updated = dataEditRequests.map((r) => {
      if (r.id === req.id) {
        return {
          ...r,
          status: 'rejected' as const,
          processedAt: new Date().toISOString(),
          adminResponse: reason || 'تم رفض التعديل بواسطة الإدارة.',
        };
      }
      return r;
    });
    setDataEditRequests(updated);
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('karoot_network_edit_requests', JSON.stringify(updated));
    }
    setInspectDataEditReq(null);
    alert(`❌ تم رفض طلب تعديل بيانات الشبكة (${req.networkName}).`);
  };

  // Withdrawal Payout Action
  const handleProcessWithdrawal = async (status: 'completed' | 'rejected') => {
    if (!payoutWdModal) return;

    const updatedWds = withdrawals.map((w) => {
      if (w.id === payoutWdModal.id) {
        return {
          ...w,
          status,
          transactionRef: payoutRef || 'TRX-DEFAULT',
          notes: payoutNotes || (status === 'completed' ? 'تم التحويل بنجاح' : 'تم الرفض بواسطة الإدارة'),
          processedAt: new Date().toISOString(),
        };
      }
      return w;
    });

    setWithdrawals(updatedWds);

    try {
      await fetch(`/api/withdrawals/${payoutWdModal.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status,
          transactionRef: payoutRef,
          notes: payoutNotes,
        }),
      });
    } catch {
      // Ignore
    }

    setPayoutWdModal(null);
    setPayoutRef('');
    setPayoutNotes('');
    alert(status === 'completed' ? '✅ تم اعتماد وتوثيق تحويل طلب السحب بنجاح!' : '❌ تم رفض طلب السحب');
  };

  // Handle Manual New Network Creation
  const handleCreateNewNetwork = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNetName.trim() || !newNetOwner.trim() || !newNetPhone.trim()) {
      alert('يرجى ملء جميع الحقول المطلوبة');
      return;
    }

    try {
      const res = await fetch('/api/admin/networks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          networkName: newNetName,
          ownerName: newNetOwner,
          contactNumber: newNetPhone,
          jaibWalletNumber: newNetWallet || newNetPhone,
          governorate: newNetGov,
          city: newNetCity,
        })
      });

      if (res.ok) {
        await fetchAdminData();
        setShowNewNetworkModal(false);
        setNewNetName('');
        setNewNetOwner('');
        setNewNetPhone('');
        setNewNetWallet('');
        alert(`✅ تم إضافة الشبكة الجديدة "${newNetName}" بالمنظومة بنجاح!`);
      } else {
        alert('❌ حدث خطأ أثناء إضافة الشبكة');
      }
    } catch {
      alert('❌ فشل الاتصال بالخادم');
    }
  };

  // Bulk Cards Generation Action
  const handleGenerateCardsBatch = async () => {
    if (!cardBatchNetId) return alert('الرجاء اختيار الشبكة');
    if (cardBatchCount < 1 || cardBatchCount > 500) return alert('الرجاء إدخال عدد صالح (1-500)');

    try {
      const res = await fetch(`/api/admin/networks/${cardBatchNetId}/cards/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category: cardBatchCategory, count: cardBatchCount })
      });
      if (res.ok) {
        const list = await res.json();
        setGeneratedBatch(list);
        fetchAdminData();
        alert(`✅ تم توليد ${cardBatchCount} كرت بنجاح بفئة ${cardBatchCategory} ريال!`);
      } else {
        alert('❌ فشل توليد الكروت');
      }
    } catch(e) {
      alert('❌ حدث خطأ أثناء توليد الكروت');
    }
  };

  // Add New Admin User Action
  const handleAddAdminUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName || !newUserEmail) return;
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newUserName,
          email: newUserEmail,
          role: newUserRole
        })
      });
      if (res.ok) {
        const newUser = await res.json();
        setAdminUsers((prev) => [...prev, newUser]);
        setShowNewUserModal(false);
        setNewUserName('');
        setNewUserEmail('');
        alert('✅ تم إضافة المستخدم بنجاح! كلمة المرور الافتراضية هي: password123');
      }
    } catch(e) {
      alert('❌ حدث خطأ أثناء إضافة المستخدم');
    }
  };

  const handleSaveSettings = async () => {
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          platformCommissionRate,
          supportPhone,
          maintenanceMode,
          autoApproveApplications,
          mikrotikGlobalPort
        })
      });
      if (res.ok) {
        alert('✅ تم حفظ كافة إعدادات المنظومة بنجاح!');
      } else {
        alert('❌ حدث خطأ أثناء حفظ الإعدادات');
      }
    } catch(e) {
      alert('❌ حدث خطأ أثناء الاتصال بالخادم');
    }
  };

  const handleRegeneratePassword = async (net: ActiveNetwork) => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('admin_auth_token') : null;
      const res = await fetch(`/api/admin/networks/${net.id}/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        }
      });
      if (res.ok) {
        const data = await res.json();
        
        // Update local owner credentials if it exists (for mock UI logic consistency)
        const existingIndex = ownerCredentials.findIndex((c) => c.ownerPhone === net.contactNumber);
        if (existingIndex >= 0) {
          const updatedCreds = [...ownerCredentials];
          updatedCreds[existingIndex].tempPassword = data.tempPassword;
          updatedCreds[existingIndex].currentPassword = data.tempPassword;
          updatedCreds[existingIndex].mustChangePassword = true;
          if (typeof localStorage !== 'undefined') {
            localStorage.setItem('karoot_owner_credentials', JSON.stringify(updatedCreds));
          }
        }
        
        const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
        const loginLink = `${baseUrl}/owner/login?phone=${net.contactNumber}`;
        
        setWhatsappModalData({
          ownerName: net.ownerName,
          ownerPhone: net.contactNumber,
          tempPassword: data.tempPassword,
          networkName: net.networkName,
          loginUrl: loginLink,
          networkCode: net.networkCode,
          isReset: true,
        });
      } else {
        alert('❌ حدث خطأ أثناء إعادة تعيين كلمة المرور');
      }
    } catch (e) {
      alert('❌ فشل الاتصال بالخادم');
    }
  };

  // CSV Export for Central Ledger

  return {
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
    handleSaveSettings,
    handleRegeneratePassword
  };
};
