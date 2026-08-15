import React, { useEffect, useState } from 'react';
import { Wallet, Plus, CreditCard, DollarSign, Tag, Save } from 'lucide-react';
import { useAppContext } from '@/context/AppContext';
import { useOwnerContext } from '@/context/OwnerContext';
import { useOwnerActions } from '@/hooks/useOwnerActions';

export const OwnerPosView: React.FC = () => {
  const { isDarkMode } = useAppContext();
  const { networks, setGlobalUpdateTick } = useOwnerContext();
  const { fetchOwnerNetworks } = useOwnerActions();
  const network = networks?.[0];

  const [memberships, setMemberships] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newPosPhone, setNewPosPhone] = useState('');
  
  const [selectedMembership, setSelectedMembership] = useState<any>(null);
  const [newCreditLimit, setNewCreditLimit] = useState('');
  const [paymentAmount, setPaymentAmount] = useState('');
  const [modalMode, setModalMode] = useState<'credit' | 'payment' | null>(null);

  const [showPricingModal, setShowPricingModal] = useState(false);
  const [packages, setPackages] = useState<any[]>([]);
  const [loadingPackages, setLoadingPackages] = useState(false);

  const fetchMemberships = async () => {
    if (!network) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/networks/${network.id}/pos-memberships`);
      if (res.ok) {
        const data = await res.json();
        setMemberships(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let mounted = true;
    const init = async () => {
      if (networks.length === 0) {
        await fetchOwnerNetworks();
      }
      if (mounted) {
        // If still no network after fetch, stop loading
        if (!networks?.[0]) {
          setLoading(false);
        }
      }
    };
    init();
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    if (network) {
      fetchMemberships();
    }
  }, [network]);

  const fetchPackages = async () => {
    if (!network) return;
    setLoadingPackages(true);
    try {
      const res = await fetch(`/api/networks/${network.id}/pos-packages`);
      if (res.ok) {
        setPackages(await res.json());
      }
    } catch(e) {
      console.error(e);
    } finally {
      setLoadingPackages(false);
    }
  };

  const handleUpdatePosPrice = async (pkgId: number, posPrice: string) => {
    if (!network) return;
    try {
      const res = await fetch(`/api/networks/${network.id}/pos-packages/${pkgId}/price`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pos_price: posPrice ? parseFloat(posPrice) : null })
      });
      if (res.ok) {
         // updated successfully
         alert('تم تحديث السعر بنجاح');
         fetchPackages();
      }
    } catch(e) {
      console.error(e);
    }
  };

  const handleAddPos = async () => {
    if (!newPosPhone || !network) return;
    try {
      const res = await fetch(`/api/networks/${network.id}/pos-memberships`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: newPosPhone })
      });
      if (res.ok) {
        alert('تم إضافة نقطة البيع بنجاح');
        setShowAddModal(false);
        setNewPosPhone('');
        fetchMemberships();
      } else {
        const data = await res.json();
        alert(data.error || 'حدث خطأ');
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleUpdateCreditLimit = async () => {
    if (!selectedMembership || !network || !newCreditLimit) return;
    try {
      const res = await fetch(`/api/networks/${network.id}/pos-memberships/${selectedMembership.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credit_limit: parseFloat(newCreditLimit) })
      });
      if (res.ok) {
        alert('تم تحديث السقف المالي بنجاح');
        setSelectedMembership(null);
        setModalMode(null);
        setNewCreditLimit('');
        fetchMemberships();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handlePayDebt = async () => {
    if (!selectedMembership || !network || !paymentAmount) return;
    try {
      const res = await fetch(`/api/networks/${network.id}/pos-memberships/${selectedMembership.id}/pay-debt`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: parseFloat(paymentAmount) })
      });
      if (res.ok) {
        alert('تم تسجيل السداد بنجاح');
        setSelectedMembership(null);
        setModalMode(null);
        setPaymentAmount('');
        fetchMemberships();
        // Force refresh of global transactions so the account statement updates immediately
        if (typeof setGlobalUpdateTick === 'function') {
          setGlobalUpdateTick(prev => prev + 1);
        }
      } else {
        const data = await res.json();
        alert(data.error || 'حدث خطأ');
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className={`p-6 rounded-3xl border space-y-4 ${isDarkMode ? 'bg-[#121927] border-slate-800' : 'bg-white border-slate-200'}`}>
        <div className="flex justify-between items-center flex-wrap gap-4">
          <div>
            <h3 className="text-lg font-black text-white">إدارة نقاط البيع (البقالات) التابعة لشبكتك</h3>
            <p className="text-xs text-slate-400">يمكنك هنا ضم نقاط البيع والسماح لهم بالبيع الآجل وتحديد السقف المالي</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => {
                setShowPricingModal(true);
                fetchPackages();
              }}
              className="px-4 py-2 rounded-xl bg-slate-700 hover:bg-slate-600 text-white font-bold text-xs flex items-center gap-2 transition-all"
            >
              <Tag className="w-4 h-4" />
              <span>تسعير كروت نقاط البيع</span>
            </button>
            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-2 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>إضافة نقطة بيع جديدة</span>
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="text-center py-10 text-slate-400">جاري تحميل البيانات...</div>
          ) : memberships.length === 0 ? (
            <div className="text-center py-10 text-slate-500 font-bold">لا يوجد نقاط بيع تابعة لشبكتك حالياً. أضف نقطة بيع للبدء.</div>
          ) : (
            <table className="w-full text-right text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 pb-2">
                  <th className="py-2.5 px-3">صاحب النقطة (الاسم/الرقم)</th>
                  <th className="py-2.5 px-3">السقف المالي المسموح</th>
                  <th className="py-2.5 px-3">الديون الحالية (مبيعات آجلة)</th>
                  <th className="py-2.5 px-3">الحالة</th>
                  <th className="py-2.5 px-3">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {memberships.map((m, i) => (
                  <tr key={i} className="hover:bg-slate-800/30">
                    <td className="py-3 px-3">
                      <div className="font-bold text-white">{m.user?.name}</div>
                      <div className="text-[10px] text-slate-400 font-mono mt-0.5" dir="ltr">{m.user?.phone}</div>
                    </td>
                    <td className="py-3 px-3 font-bold text-blue-400">{m.credit_limit} ر.ي</td>
                    <td className="py-3 px-3 font-bold text-rose-400">{m.current_debt} ر.ي</td>
                    <td className="py-3 px-3">
                      {m.status === 'pending' ? (
                        <span className="px-2 py-1 rounded text-[10px] font-bold bg-amber-500/20 text-amber-500">قيد الانتظار</span>
                      ) : m.status === 'active' ? (
                        <span className="px-2 py-1 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400">نشط</span>
                      ) : (
                        <span className="px-2 py-1 rounded text-[10px] font-bold bg-rose-500/20 text-rose-400">موقوف</span>
                      )}
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex gap-2">
                        {m.status === 'pending' ? (
                          <>
                            <button
                              onClick={async () => {
                                await fetch(`/api/networks/${network?.id}/pos-memberships/${m.id}`, {
                                  method: 'PATCH',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify({ status: 'active' })
                                });
                                fetchMemberships();
                              }}
                              className="px-2 py-1 rounded bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/40 font-bold transition-colors"
                            >
                              موافقة وتفعيل
                            </button>
                            <button
                              onClick={async () => {
                                await fetch(`/api/networks/${network?.id}/pos-memberships/${m.id}`, {
                                  method: 'PATCH',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify({ status: 'rejected' })
                                });
                                fetchMemberships();
                              }}
                              className="px-2 py-1 rounded bg-rose-500/20 text-rose-400 hover:bg-rose-500/40 font-bold transition-colors"
                            >
                              رفض
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => { setSelectedMembership(m); setModalMode('credit'); setNewCreditLimit(m.credit_limit.toString()); setPaymentAmount(''); }}
                              className="px-2 py-1 rounded bg-blue-500/20 text-blue-400 hover:bg-blue-500/40 flex items-center gap-1 transition-colors"
                            >
                              <CreditCard className="w-3 h-3" /> السقف المالي
                            </button>
                            <button
                              onClick={() => { setSelectedMembership(m); setModalMode('payment'); setPaymentAmount(''); setNewCreditLimit(''); }}
                              className="px-2 py-1 rounded bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/40 flex items-center gap-1 transition-colors"
                              disabled={m.current_debt <= 0}
                            >
                              <DollarSign className="w-3 h-3" /> استلام دفعة
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className={`w-full max-w-sm p-6 rounded-3xl border shadow-2xl ${isDarkMode ? 'bg-[#121927] border-slate-800' : 'bg-white border-slate-200'}`}>
            <h3 className="text-lg font-bold text-white mb-4">ضم نقطة بيع جديدة لشبكتك</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">رقم الهاتف (الخاص بنقطة البيع)</label>
                <input
                  type="text"
                  placeholder="مثال: 777000000"
                  value={newPosPhone}
                  onChange={e => setNewPosPhone(e.target.value)}
                  className={`w-full p-3 rounded-xl border font-mono text-left focus:ring-2 focus:ring-blue-500 outline-none ${isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'}`}
                />
                <p className="text-[10px] text-slate-500 mt-2">يجب أن تكون نقطة البيع مسجلة مسبقاً في المنظومة (عبر التطبيق).</p>
              </div>
              <div className="flex gap-2 pt-2">
                <button onClick={handleAddPos} className="flex-1 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold transition-all text-sm">بحث وإضافة</button>
                <button onClick={() => setShowAddModal(false)} className="flex-1 py-3 rounded-xl bg-slate-700 hover:bg-slate-600 text-white font-bold transition-all text-sm">إلغاء</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {selectedMembership && modalMode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className={`w-full max-w-sm p-6 rounded-3xl border shadow-2xl ${isDarkMode ? 'bg-[#121927] border-slate-800' : 'bg-white border-slate-200'}`}>
            <h3 className="text-lg font-bold text-white mb-4">
              {modalMode === 'credit' ? 'تعديل السقف المالي' : 'استلام دفعة سداد ديون'}
            </h3>
            <p className="text-sm text-slate-300 mb-4 font-bold">{selectedMembership.user?.name} - {selectedMembership.user?.phone}</p>
            
            {modalMode === 'credit' ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1">السقف المالي الجديد (ر.ي)</label>
                  <input
                    type="number"
                    value={newCreditLimit}
                    onChange={e => setNewCreditLimit(e.target.value)}
                    className={`w-full p-3 rounded-xl border font-mono text-left focus:ring-2 focus:ring-blue-500 outline-none ${isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'}`}
                  />
                  <p className="text-[10px] text-amber-500 mt-2">السقف المالي يسمح للبقالة بالاستدانة والشراء بدون رصيد كافي حتى الوصول لهذا الحد.</p>
                </div>
                <div className="flex gap-2 pt-2">
                  <button onClick={handleUpdateCreditLimit} className="flex-1 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold transition-all text-sm">حفظ التعديل</button>
                  <button onClick={() => { setSelectedMembership(null); setModalMode(null); }} className="flex-1 py-3 rounded-xl bg-slate-700 hover:bg-slate-600 text-white font-bold transition-all text-sm">إلغاء</button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1">المبلغ المستلم للسداد (ر.ي)</label>
                  <input
                    type="number"
                    value={paymentAmount}
                    onChange={e => setPaymentAmount(e.target.value)}
                    max={selectedMembership.current_debt}
                    className={`w-full p-3 rounded-xl border font-mono text-left focus:ring-2 focus:ring-emerald-500 outline-none ${isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'}`}
                  />
                  <p className="text-[10px] text-rose-400 mt-2">الديون الحالية: {selectedMembership.current_debt} ر.ي</p>
                </div>
                <div className="flex gap-2 pt-2">
                  <button onClick={handlePayDebt} className="flex-1 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition-all text-sm">تأكيد الاستلام</button>
                  <button onClick={() => { setSelectedMembership(null); setModalMode(null); }} className="flex-1 py-3 rounded-xl bg-slate-700 hover:bg-slate-600 text-white font-bold transition-all text-sm">إلغاء</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* POS Pricing Modal */}
      {showPricingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className={`w-full max-w-2xl p-6 rounded-3xl border shadow-2xl ${isDarkMode ? 'bg-[#121927] border-slate-800' : 'bg-white border-slate-200'}`}>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-black text-white flex items-center gap-2">
                <Tag className="w-5 h-5 text-blue-500" />
                تحديد أسعار الكروت لنقاط البيع
              </h3>
              <button onClick={() => setShowPricingModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>
            
            <p className="text-sm text-slate-400 mb-6">
              الأسعار التي تحددها هنا هي الأسعار التي سيشتري بها أصحاب البقالات (نقاط البيع) كروتك. إذا تركت الحقل فارغاً سيتم بيعه بالسعر الافتراضي للكرت.
            </p>

            <div className="max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
              {loadingPackages ? (
                <div className="text-center py-10 text-slate-400">جاري تحميل الفئات...</div>
              ) : packages.length === 0 ? (
                <div className="text-center py-10 text-slate-500">لا يوجد فئات كروت في هذه الشبكة</div>
              ) : (
                <div className="space-y-3">
                  {packages.map((pkg) => (
                    <div key={pkg.id} className={`p-4 rounded-2xl flex items-center justify-between gap-4 ${isDarkMode ? 'bg-slate-800/50' : 'bg-slate-50'}`}>
                      <div>
                        <div className="font-bold text-white text-sm">{pkg.name}</div>
                        <div className="text-xs text-slate-400 mt-1">السعر الافتراضي للمستخدم: <span className="text-amber-500 font-mono font-bold">{pkg.price} ر.ي</span></div>
                      </div>
                      
                      <div className="flex gap-2 items-center">
                        <div className="relative">
                          <input
                            type="number"
                            placeholder="السعر لنقطة البيع"
                            defaultValue={pkg.pos_price || ''}
                            onBlur={(e) => {
                              if (e.target.value !== (pkg.pos_price?.toString() || '')) {
                                handleUpdatePosPrice(pkg.id, e.target.value);
                              }
                            }}
                            className={`w-32 p-2.5 text-left text-sm font-bold font-mono rounded-xl border focus:ring-2 focus:ring-blue-500 outline-none ${isDarkMode ? 'bg-slate-900 border-slate-700 text-emerald-400' : 'bg-white border-slate-300 text-emerald-600'}`}
                            dir="ltr"
                          />
                          <span className="absolute right-3 top-2.5 text-xs text-slate-500 pointer-events-none">ر.ي</span>
                        </div>
                        <button 
                          className="p-2.5 rounded-xl bg-blue-500/20 text-blue-400 hover:bg-blue-500 hover:text-white transition-all"
                          title="حفظ السعر"
                        >
                          <Save className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="mt-6 pt-4 border-t border-slate-800 flex justify-end">
              <button onClick={() => setShowPricingModal(false)} className="px-6 py-2.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-white font-bold transition-all text-sm">
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
