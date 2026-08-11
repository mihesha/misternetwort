import React from 'react';
import { X, BarChart3, MessageCircle, Filter, Search, CreditCard, Wallet, Globe } from 'lucide-react';
import { useAdminContext } from '../../../context/AdminContext';
import { useAdminActions } from '../../../hooks/useAdminActions';
import { useAppContext } from '../../../context/AppContext';

export const InspectNetworkModal = () => {
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
      {/* INSPECT NETWORK COMPREHENSIVE MODAL */}
      {inspectNetwork && (() => {
        // Compute metrics
        const totalSales = inspectNetwork.totalSalesVolume || 0;
        const commRate = platformCommissionRate || 2.5;
        const totalCommission = Math.round(totalSales * (commRate / 100));
        const netOwnerEarnings = totalSales - totalCommission;

        // Network withdrawals
        const netWds = withdrawals.filter(
          (w) => w.networkName.includes(inspectNetwork.networkName) || w.ownerName === inspectNetwork.ownerName
        );
        const totalWithdrawn = netWds
          .filter((w) => w.status === 'completed')
          .reduce((sum, w) => sum + w.amount, 0);
        const unwithdrawnBalance = netOwnerEarnings - totalWithdrawn;

        // Categories list
        const categories = inspectNetwork.categories || [];

        // Generate full card inventory items with dates from fetched data
        const mappedCards = inspectNetworkCards.map(c => ({
          id: c.id,
          serial: c.serial_number,
          code: c.pin_code,
          category: String(c.card_category?.price || c.category_id),
          price: parseInt(c.card_category?.price || '0') || 0,
          status: c.status,
          date: c.created_at,
          customerPhone: c.customer_phone
        }));

        // Date match logic
        const matchDateFilter = (dateStr?: string) => {
          if (inspectCardDateFilter === 'all') return true;
          if (!dateStr) return true;
          const itemDate = dateStr.slice(0, 10);
          if (inspectCardDateFilter === 'today') {
            return itemDate === '2026-08-04';
          }
          if (inspectCardDateFilter === 'week') {
            return itemDate >= '2026-08-01' && itemDate <= '2026-08-07';
          }
          if (inspectCardDateFilter === 'month') {
            return itemDate.startsWith('2026-08');
          }
          if (inspectCardDateFilter === 'custom') {
            if (inspectCardStartDate && itemDate < inspectCardStartDate) return false;
            if (inspectCardEndDate && itemDate > inspectCardEndDate) return false;
            return true;
          }
          return true;
        };

        // Apply filters to cards
        const filteredCards = mappedCards.filter((card) => {
          if (inspectCardCatFilter !== 'all' && card.category !== inspectCardCatFilter) return false;
          if (inspectCardStatusFilter !== 'all' && card.status !== inspectCardStatusFilter) return false;
          if (!matchDateFilter(card.date)) return false;
          if (inspectCardSearchQuery.trim()) {
            const q = inspectCardSearchQuery.toLowerCase();
            const matchSerial = card.serial.toLowerCase().includes(q);
            const matchCode = card.code.toLowerCase().includes(q);
            const matchPhone = card.customerPhone?.toLowerCase().includes(q);
            if (!matchSerial && !matchCode && !matchPhone) return false;
          }
          return true;
        });

        // Apply date filter to withdrawals
        const filteredWithdrawals = netWds.filter((w) => matchDateFilter(w.requestedAt));

        // Date label display
        const getDateRangeLabel = () => {
          if (inspectCardDateFilter === 'all') return 'جميع الأوقات';
          if (inspectCardDateFilter === 'today') return 'مبيعات اليوم (04-08-2026)';
          if (inspectCardDateFilter === 'week') return 'مبيعات هذا الأسبوع (01-08-2026 إلى 07-08-2026)';
          if (inspectCardDateFilter === 'month') return 'مبيعات هذا الشهر (أغسطس 2026)';
          if (inspectCardDateFilter === 'custom') {
            if (inspectCardStartDate && inspectCardEndDate) return `من ${inspectCardStartDate} إلى ${inspectCardEndDate}`;
            if (inspectCardStartDate) return `ابتداءً من ${inspectCardStartDate}`;
            if (inspectCardEndDate) return `حتى تاريخ ${inspectCardEndDate}`;
            return 'تاريخ مخصص (يرجى تحديد النطاق)';
          }
          return 'الفترة المحددة';
        };

        return (
          <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
            <div className="bg-[#121927] border border-slate-800 rounded-3xl p-5 sm:p-7 max-w-5xl w-full my-6 space-y-6 text-right font-['Cairo',sans-serif] shadow-2xl">
              
              {/* Header */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-800 pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-2xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
                    <BarChart3 className="w-7 h-7" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-extrabold text-white text-xl">{inspectNetwork.networkName}</h3>
                      <span className="px-3 py-0.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        كود: #{inspectNetwork.networkCode}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">
                      المالك: <strong className="text-slate-200">{inspectNetwork.ownerName}</strong> • {inspectNetwork.governorate} ({inspectNetwork.city})
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-auto">
                  <a
                    href={`https://wa.me/967${inspectNetwork.contactNumber.replace(/^0+/, '')}?text=${encodeURIComponent(
                      `أهلاً بك أ/ ${inspectNetwork.ownerName}! 💬\nتقرير وتفاصيل حساب شبكة (${inspectNetwork.networkName}):`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 font-bold text-xs flex items-center gap-1.5 transition-all"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>تواصل واتساب</span>
                  </a>
                  <button
                    onClick={() => setInspectNetwork(null)}
                    className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Top Financial Metric Summary Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                <div className="p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700/60 space-y-1">
                  <span className="text-[11px] text-slate-400 block font-medium">💰 إجمالي المبيعات:</span>
                  <p className="font-mono font-black text-indigo-400 text-base">{totalSales.toLocaleString()} <span className="text-xs">ر.ي</span></p>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700/60 space-y-1">
                  <span className="text-[11px] text-slate-400 block font-medium">✂️ عمولة المنصة ({commRate}%):</span>
                  <p className="font-mono font-black text-amber-400 text-base">{totalCommission.toLocaleString()} <span className="text-xs">ر.ي</span></p>
                </div>

                <div className="p-3.5 rounded-2xl bg-indigo-950/40 border border-indigo-500/30 space-y-1">
                  <span className="text-[11px] text-indigo-300 block font-bold">✨ صافي أرباح المالك:</span>
                  <p className="font-mono font-black text-emerald-400 text-base">{netOwnerEarnings.toLocaleString()} <span className="text-xs">ر.ي</span></p>
                </div>

                <div className="p-3.5 rounded-2xl bg-emerald-950/30 border border-emerald-500/30 space-y-1">
                  <span className="text-[11px] text-emerald-300 block font-bold">💵 المبالغ المسحوبة:</span>
                  <p className="font-mono font-black text-emerald-300 text-base">{totalWithdrawn.toLocaleString()} <span className="text-xs">ر.ي</span></p>
                </div>

                <div className="p-3.5 rounded-2xl bg-purple-950/30 border border-purple-500/30 col-span-2 sm:col-span-1 space-y-1">
                  <span className="text-[11px] text-purple-300 block font-bold">⏳ المتاح للسحب الآن:</span>
                  <p className="font-mono font-black text-purple-300 text-base">{unwithdrawnBalance.toLocaleString()} <span className="text-xs">ر.ي</span></p>
                </div>
              </div>

              {/* 1. Navigation Tabs Bar (تم تقديم التبويبات إلى الأعلى) */}
              <div className="flex border-b border-slate-800 gap-2 overflow-x-auto pb-2 text-xs font-bold">
                <button
                  onClick={() => setInspectNetworkTab('overview')}
                  className={`px-4 py-2.5 rounded-xl transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
                    inspectNetworkTab === 'overview'
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-900/40'
                      : 'bg-slate-800/50 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <BarChart3 className="w-4 h-4" />
                  <span>توزيع المبيعات حسب الفئة (100، 200..)</span>
                </button>

                <button
                  onClick={() => setInspectNetworkTab('cards')}
                  className={`px-4 py-2.5 rounded-xl transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
                    inspectNetworkTab === 'cards'
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-900/40'
                      : 'bg-slate-800/50 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <CreditCard className="w-4 h-4" />
                  <span>جرد الكروت تفصيلي ({filteredCards.length})</span>
                </button>

                <button
                  onClick={() => setInspectNetworkTab('withdrawals')}
                  className={`px-4 py-2.5 rounded-xl transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
                    inspectNetworkTab === 'withdrawals'
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-900/40'
                      : 'bg-slate-800/50 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Wallet className="w-4 h-4" />
                  <span>سجل المسحوبات والتحويلات ({filteredWithdrawals.length})</span>
                </button>

                <button
                  onClick={() => setInspectNetworkTab('profile')}
                  className={`px-4 py-2.5 rounded-xl transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
                    inspectNetworkTab === 'profile'
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-900/40'
                      : 'bg-slate-800/50 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Globe className="w-4 h-4" />
                  <span>البيانات والربط السيرفري</span>
                </button>
              </div>

              {/* 2. Comprehensive Filter Bar (فلترة تقرير الكروت والمبيعات الشاملة تحت التبويبات) */}
              <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                    <Filter className="w-4 h-4 text-indigo-400" />
                    <span>فلترة تقرير الكروت والمبيعات الشاملة والجداول:</span>
                  </span>
                  <span className="text-[11px] text-indigo-300 bg-indigo-950/60 border border-indigo-500/30 px-2.5 py-0.5 rounded-full font-medium">
                    📅 النطاق الحالي: {getDateRangeLabel()}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 text-xs">
                  {/* Category Filter */}
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">فئة الكرت:</label>
                    <select
                      value={inspectCardCatFilter}
                      onChange={(e) => setInspectCardCatFilter(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold outline-none focus:border-indigo-500"
                    >
                      <option value="all">جميع الفئات (100، 200، 500..)</option>
                      {categories.map((c, i) => (
                        <option key={i} value={c.value}>فئة {c.value} ريال</option>
                      ))}
                    </select>
                  </div>

                  {/* Status Filter */}
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">حالة الكرت:</label>
                    <select
                      value={inspectCardStatusFilter}
                      onChange={(e) => setInspectCardStatusFilter(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold outline-none focus:border-indigo-500"
                    >
                      <option value="all">جميع الحالات (متاحة، مباعة، منتهية)</option>
                      <option value="available">🟢 الكروت المتاحة فقط</option>
                      <option value="sold">🔵 الكروت المباعة فقط</option>
                      <option value="expired">🔴 الكروت المنتهية فقط</option>
                    </select>
                  </div>

                  {/* Date Filter */}
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">الفترة الزمنية / التاريخ:</label>
                    <select
                      value={inspectCardDateFilter}
                      onChange={(e) => {
                        setInspectCardDateFilter(e.target.value);
                        if (e.target.value !== 'custom') {
                          setInspectCardStartDate('');
                          setInspectCardEndDate('');
                        }
                      }}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold outline-none focus:border-indigo-500"
                    >
                      <option value="all">كل الأوقات (التاريخ الكلي)</option>
                      <option value="today">مبيعات اليوم (04-08-2026)</option>
                      <option value="week">مبيعات هذا الأسبوع</option>
                      <option value="month">مبيعات هذا الشهر</option>
                      <option value="custom">📅 تاريخ مخصص (حدد نطاق محدد)</option>
                    </select>
                  </div>

                  {/* Search Query */}
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">بحث بالكود / السيريال / الهاتف:</label>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="ابحث بالكود أو الهاتف..."
                        value={inspectCardSearchQuery}
                        onChange={(e) => setInspectCardSearchQuery(e.target.value)}
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl pr-3 pl-8 py-2 text-white font-medium outline-none focus:border-indigo-500 text-xs"
                      />
                      <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-3" />
                    </div>
                  </div>
                </div>

                {/* Custom Date Pickers Range Bar (تاريخ مخصص) */}
                {inspectCardDateFilter === 'custom' && (
                  <div className="pt-2 border-t border-slate-800/80 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 items-end animate-in fade-in duration-200">
                    <div>
                      <label className="text-[11px] text-indigo-300 font-bold block mb-1">من تاريخ (البداية):</label>
                      <input
                        type="date"
                        value={inspectCardStartDate}
                        onChange={(e) => setInspectCardStartDate(e.target.value)}
                        className="w-full bg-slate-800 border border-indigo-500/40 rounded-xl px-3 py-1.5 text-white font-mono text-xs outline-none focus:border-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] text-indigo-300 font-bold block mb-1">إلى تاريخ (النهاية):</label>
                      <input
                        type="date"
                        value={inspectCardEndDate}
                        onChange={(e) => setInspectCardEndDate(e.target.value)}
                        className="w-full bg-slate-800 border border-indigo-500/40 rounded-xl px-3 py-1.5 text-white font-mono text-xs outline-none focus:border-indigo-500"
                      />
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setInspectCardStartDate('2026-08-01');
                          setInspectCardEndDate('2026-08-04');
                        }}
                        className="px-3 py-2 rounded-xl bg-indigo-950 hover:bg-indigo-900 border border-indigo-500/30 text-indigo-200 text-[11px] font-bold cursor-pointer transition-all flex-1 text-center"
                      >
                        أغسطس الحالي
                      </button>
                      <button
                        onClick={() => {
                          setInspectCardStartDate('');
                          setInspectCardEndDate('');
                        }}
                        className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-bold cursor-pointer transition-all"
                      >
                        مسح
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* TAB 1: CATEGORY SALES BREAKDOWN (توزيع المبيعات والأرباح) */}
              {inspectNetworkTab === 'overview' && (
                <div className="space-y-4 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <h4 className="font-extrabold text-white text-sm flex items-center gap-2">
                      <span>📊 كشف المبيعات والأرباح مفصلاً لكل فئة كروت</span>
                      <span className="px-2.5 py-0.5 rounded-full bg-indigo-950 text-indigo-300 border border-indigo-500/30 text-xs font-mono">
                        {getDateRangeLabel()}
                      </span>
                    </h4>
                    <span className="text-xs text-slate-400">عمولة المنصة المعتمدة: {commRate}%</span>
                  </div>

                  <div className="border border-slate-800 rounded-2xl overflow-hidden shadow-inner bg-slate-900/40">
                    <table className="w-full text-right text-xs">
                      <thead className="bg-slate-800/90 text-slate-300 font-bold border-b border-slate-700">
                        <tr>
                          <th className="p-3">الفئة (ريال)</th>
                          <th className="p-3">الكروت المتاحة</th>
                          <th className="p-3">الكروت المباعة ({inspectCardDateFilter !== 'all' ? 'الفترة المحددة' : 'إجمالي'})</th>
                          <th className="p-3">إجمالي الإيراد</th>
                          <th className="p-3 text-amber-400">عمولة المنصة ({commRate}%)</th>
                          <th className="p-3 text-emerald-400">صافي ربح المالك</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800 text-slate-200 font-medium">
                        {categories.map((cat, i) => {
                          // Calculate sold count dynamically based on filtered cards for this category
                          const categoryCards = filteredCards.filter((c) => c.category === cat.value);
                          const finalSoldCount = categoryCards.filter((c) => c.status === 'sold').length;

                          const catRevenue = finalSoldCount * cat.price;
                          const catComm = Math.round(catRevenue * (commRate / 100));
                          const catNet = catRevenue - catComm;

                          return (
                            <tr key={i} className="hover:bg-slate-800/40 transition-colors">
                              <td className="p-3 font-extrabold text-indigo-300 text-sm">
                                فئة {cat.value} ريال
                              </td>
                              <td className="p-3">
                                <span className={`px-2.5 py-1 rounded-full font-mono font-bold ${
                                  cat.remaining < 10 ? 'bg-rose-500/20 text-rose-400' : 'bg-emerald-500/20 text-emerald-400'
                                }`}>
                                  {cat.remaining} كرت
                                </span>
                              </td>
                              <td className="p-3 font-mono font-bold text-indigo-300">
                                {finalSoldCount} كرت مباع
                              </td>
                              <td className="p-3 font-mono font-bold text-white">
                                {catRevenue.toLocaleString()} ر.ي
                              </td>
                              <td className="p-3 font-mono font-bold text-amber-400">
                                -{catComm.toLocaleString()} ر.ي
                              </td>
                              <td className="p-3 font-mono font-bold text-emerald-400">
                                {catNet.toLocaleString()} ر.ي
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* TAB 2: DETAILED CARDS INVENTORY & STATUS */}
              {inspectNetworkTab === 'cards' && (
                <div className="space-y-4 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <h4 className="font-extrabold text-white text-sm flex items-center gap-2">
                      <span>🎴 سجل الكروت المفصل (المتاحة، المباعة، المنتهية)</span>
                      <span className="px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 text-xs font-mono">
                        {getDateRangeLabel()}
                      </span>
                    </h4>
                    <div className="flex items-center gap-2 text-xs">
                      <span className="px-2.5 py-1 rounded-lg bg-indigo-950 text-indigo-300 border border-indigo-500/30 font-bold">
                        العدد المفلتَر حسب التاريخ والأنواع: <strong className="text-white text-sm font-mono mr-1">{filteredCards.length}</strong> كرت
                      </span>
                    </div>
                  </div>

                  <div className="border border-slate-800 rounded-2xl overflow-x-auto shadow-inner bg-slate-900/40">
                    <table className="w-full text-right text-xs">
                      <thead className="bg-slate-800/90 text-slate-300 font-bold border-b border-slate-700">
                        <tr>
                          <th className="p-3">كود الكرت / السيريال</th>
                          <th className="p-3">الفئة / السعر</th>
                          <th className="p-3 text-center">الحالة الحالية</th>
                          <th className="p-3">تاريخ الشراء / العملية</th>
                          <th className="p-3">رقم العميل المشتري</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800 text-slate-200">
                        {filteredCards.length === 0 ? (
                          <tr>
                            <td colSpan={5} className="p-8 text-center text-slate-400 font-bold">
                              ⚠️ لا توجد كروت تطابق نطاق التاريخ والفلترة المحددة
                            </td>
                          </tr>
                        ) : (
                          filteredCards.map((c) => (
                            <tr key={c.id} className="hover:bg-slate-800/40">
                              <td className="p-3 font-mono font-bold text-indigo-300">
                                <span className="block text-white text-xs">{c.code}</span>
                                <span className="text-[10px] text-slate-400">{c.serial}</span>
                              </td>
                              <td className="p-3 font-bold">
                                فئة {c.category} ريال
                              </td>
                              <td className="p-3 text-center">
                                {c.status === 'available' && (
                                  <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                                    🟢 متاح للبيع
                                  </span>
                                )}
                                {c.status === 'sold' && (
                                  <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                                    🔵 تم البيع
                                  </span>
                                )}
                                {c.status === 'expired' && (
                                  <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30">
                                    🔴 منتهي الصلاحية
                                  </span>
                                )}
                              </td>
                              <td className="p-3 text-slate-300 font-mono" dir="ltr">
                                {c.date}
                              </td>
                              <td className="p-3 font-mono text-emerald-400" dir="ltr">
                                {c.customerPhone || '—'}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* TAB 3: WITHDRAWALS LEDGER */}
              {inspectNetworkTab === 'withdrawals' && (
                <div className="space-y-4 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <h4 className="font-extrabold text-white text-sm flex items-center gap-2">
                      <span>💸 سجل المسحوبات الحوالات المالية لمالك الشبكة</span>
                      <span className="px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 text-xs font-mono">
                        {getDateRangeLabel()}
                      </span>
                    </h4>
                    <span className="text-xs text-indigo-300 font-bold">
                      عدد العمليات المفلترة: {filteredWithdrawals.length}
                    </span>
                  </div>

                  <div className="border border-slate-800 rounded-2xl overflow-hidden shadow-inner bg-slate-900/40">
                    <table className="w-full text-right text-xs">
                      <thead className="bg-slate-800/90 text-slate-300 font-bold border-b border-slate-700">
                        <tr>
                          <th className="p-3">رقم مرجع السحب</th>
                          <th className="p-3">المبلغ المسحوب</th>
                          <th className="p-3">طريقة التحويل والحساب</th>
                          <th className="p-3">الحالة</th>
                          <th className="p-3">التاريخ والوقت</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800 text-slate-200">
                        {filteredWithdrawals.length === 0 ? (
                          <tr>
                            <td colSpan={5} className="p-8 text-center text-slate-400 font-bold">
                              ⚠️ لا توجد عمليات سحب أو تحويل مسجلة خلال النطاق الزمني المحدد
                            </td>
                          </tr>
                        ) : (
                          filteredWithdrawals.map((w) => (
                            <tr key={w.id} className="hover:bg-slate-800/40">
                              <td className="p-3 font-mono font-bold text-indigo-300">
                                {w.requestNumber}
                              </td>
                              <td className="p-3 font-mono font-bold text-emerald-400 text-sm">
                                {w.amount.toLocaleString()} ر.ي
                              </td>
                              <td className="p-3">
                                <span className="font-bold block text-white">
                                  {w.payoutMethod === 'jaib_wallet' ? 'محفظة جيب' : 'بنك الكريمي'}
                                </span>
                                <span className="text-[11px] font-mono text-slate-400" dir="ltr">
                                  {w.accountNumber}
                                </span>
                              </td>
                              <td className="p-3">
                                {w.status === 'completed' ? (
                                  <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                                    🟢 تم التحويل
                                  </span>
                                ) : (
                                  <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                                    ⏳ قيد المراجعة
                                  </span>
                                )}
                              </td>
                              <td className="p-3 text-slate-300 font-mono" dir="ltr">
                                {new Date(w.requestedAt).toLocaleString('ar-YE')}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* TAB 4: PROFILE & TECHNICAL SETUP */}
              {inspectNetworkTab === 'profile' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs animate-in fade-in duration-200">
                  <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-700/60 space-y-3">
                    <h5 className="font-black text-indigo-400 border-b border-slate-700/60 pb-2 flex items-center gap-2">
                      <span>👤 بيانات مالك الشبكة والتواصل:</span>
                    </h5>
                    <div className="space-y-2 text-slate-200">
                      <p><span className="text-slate-400">اسم المالك المسجل:</span> <strong className="text-white">{inspectNetwork.ownerName}</strong></p>
                      <p><span className="text-slate-400">رقم الهاتف:</span> <strong className="font-mono text-emerald-400" dir="ltr">{inspectNetwork.contactNumber}</strong></p>
                      <p><span className="text-slate-400">رقم محفظة جيب المعتمدة:</span> <strong className="font-mono text-emerald-400" dir="ltr">{inspectNetwork.jaibWalletNumber}</strong></p>
                      <p><span className="text-slate-400">المحافظة والمدينة:</span> <strong className="text-white">{inspectNetwork.governorate} - {inspectNetwork.city}</strong></p>
                      <p><span className="text-slate-400">الشارع والحي:</span> <strong className="text-white">{inspectNetwork.neighborhood || 'الشارع الرئيسي'}</strong></p>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-700/60 space-y-3">
                    <h5 className="font-black text-indigo-400 border-b border-slate-700/60 pb-2 flex items-center gap-2">
                      <span>⚙️ إعدادات الربط وحالة سيرفر مايكروتك:</span>
                    </h5>
                    <div className="space-y-2 text-slate-200">
                      <p><span className="text-slate-400">كود التعريف بالمنظومة:</span> <strong className="font-mono text-amber-400 font-bold">#{inspectNetwork.networkCode}</strong></p>
                      <p><span className="text-slate-400">عنوان سيرفر MicroTik IP:</span> <strong className="font-mono text-white" dir="ltr">192.168.88.1 (API)</strong></p>
                      <p><span className="text-slate-400">منفذ API المفتوح:</span> <strong className="font-mono text-white">8728</strong></p>
                      <p><span className="text-slate-400">حالة الربط البرمجي:</span> <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-400 font-bold">مربوط وبحالة جيدة 🟢</span></p>
                      <p><span className="text-slate-400">نسبة اقتطاع المنصة:</span> <strong className="text-indigo-300 font-bold">{platformCommissionRate}% لكل عملية بيع</strong></p>
                    </div>
                  </div>
                </div>
              )}

              {/* Close Button */}
              <div className="pt-2 border-t border-slate-800">
                <button
                  onClick={() => setInspectNetwork(null)}
                  className="w-full py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs cursor-pointer transition-all"
                >
                  إغلاق تقرير ومعاينة التفاصيل
                </button>
              </div>

            </div>
          </div>
        );
      })()}
    </>
  );
};
