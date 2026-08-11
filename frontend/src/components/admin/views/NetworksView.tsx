import React from 'react';
import { Plus, Eye, Key } from 'lucide-react';
import { ActiveNetwork } from '../../../types';

interface NetworksViewProps {
  isDarkMode: boolean;
  activeNetworks: ActiveNetwork[];
  setShowNewNetworkModal: (show: boolean) => void;
  setInspectNetwork: (net: ActiveNetwork | null) => void;
  setInspectNetworkTab: (tab: 'overview' | 'cards' | 'withdrawals' | 'profile') => void;
  setInspectCardCatFilter: (filter: string) => void;
  setInspectCardStatusFilter: (filter: string) => void;
  setInspectCardDateFilter: (filter: string) => void;
  setInspectCardStartDate: (date: string) => void;
  setInspectCardEndDate: (date: string) => void;
  setInspectCardSearchQuery: (query: string) => void;
  setInspectNetworkCards: (cards: any[]) => void;
  handleRegeneratePassword?: (net: ActiveNetwork) => void;
}

export const NetworksView: React.FC<NetworksViewProps> = ({
  isDarkMode,
  activeNetworks,
  setShowNewNetworkModal,
  setInspectNetwork,
  setInspectNetworkTab,
  setInspectCardCatFilter,
  setInspectCardStatusFilter,
  setInspectCardDateFilter,
  setInspectCardStartDate,
  setInspectCardEndDate,
  setInspectCardSearchQuery,
  setInspectNetworkCards,
  handleRegeneratePassword,
}) => {
  const [confirmReset, setConfirmReset] = React.useState<ActiveNetwork | null>(null);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-black text-white">دليل ودليل حسابات الشبكات النشطة</h3>
          <p className="text-xs text-slate-400">إدارة أرصدة الشبكات، وتتبع التفاصيل والتقارير المالية والتقارير الشاملة</p>
        </div>

        <button
          onClick={() => setShowNewNetworkModal(true)}
          className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-900/40 cursor-pointer flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>إضافة شبكة جديدة للمنظومة</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {activeNetworks.map((net) => (
          <div
            key={net.id}
            className={`rounded-3xl border overflow-hidden transition-all shadow-xl ${
              isDarkMode ? 'bg-[#121927] border-slate-800' : 'bg-white border-slate-200'
            }`}
          >
            <div className="p-5 bg-gradient-to-r from-indigo-950 to-slate-900 text-white relative border-b border-indigo-500/20">
              <div className="flex items-center justify-between mb-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  كود الشبكة: #{net.networkCode}
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/20 text-indigo-300">
                  {net.governorate}
                </span>
              </div>
              <h4 className="font-extrabold text-lg text-white mb-1">{net.networkName}</h4>
              <p className="text-xs text-slate-300">المالك: {net.ownerName}</p>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <div className="p-3.5 rounded-2xl bg-indigo-950/30 border border-indigo-500/20 flex items-center justify-between">
                <div>
                  <span className="text-slate-400 block text-[11px]">رصيد محفظة جيب المتاح:</span>
                  <span className="font-mono font-black text-emerald-400 text-lg">
                    {(net.balance || 0).toLocaleString('en-US')} ر.ي
                  </span>
                </div>
                <span className="px-2.5 py-1 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[11px] font-bold">
                  حساب نشط 🟢
                </span>
              </div>

              <div className="space-y-1.5 text-slate-300">
                <div className="flex justify-between">
                  <span className="text-slate-400">رقم التواصل:</span>
                  <span className="font-mono font-bold" dir="ltr">{net.contactNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">محفظة جيب المعتمدة:</span>
                  <span className="font-mono font-bold text-emerald-400" dir="ltr">{net.jaibWalletNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">المنطقة والحي:</span>
                  <span>{net.city} - {net.neighborhood || 'الشارع الرئيسي'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">إجمالي المبيعات:</span>
                  <span className="font-mono font-bold text-indigo-400">{(net.totalSalesVolume || 0).toLocaleString('en-US')} ر.ي</span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800 flex flex-col gap-2">
                <button
                  onClick={async () => {
                    setInspectNetwork(net);
                    setInspectNetworkTab('overview');
                    setInspectCardCatFilter('all');
                    setInspectCardStatusFilter('all');
                    setInspectCardDateFilter('all');
                    setInspectCardStartDate('');
                    setInspectCardEndDate('');
                    setInspectCardSearchQuery('');
                    setInspectNetworkCards([]); // Reset previous cards
                    try {
                      const token = typeof window !== 'undefined' ? localStorage.getItem('admin_auth_token') : null;
                      const res = await fetch(`/api/admin/networks/${net.id}/cards`, {
                        headers: (token ? { 'Authorization': `Bearer ${token}` } : {}) as HeadersInit
                      });
                      if (res.ok) {
                        const data = await res.json();
                        setInspectNetworkCards(data);
                      }
                    } catch (e) {
                      console.error(e);
                    }
                  }}
                  className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-indigo-900/30 transition-all hover:scale-[1.01]"
                >
                  <Eye className="w-4 h-4 text-white" />
                  <span>عرض التفاصيل والتقارير الشاملة 📊</span>
                </button>
                
                {handleRegeneratePassword && (
                  <button
                    onClick={() => {
                      setConfirmReset(net);
                    }}
                    className="w-full py-2.5 rounded-xl bg-slate-700/50 hover:bg-slate-700 text-slate-200 hover:text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-all border border-slate-600 hover:border-slate-500"
                  >
                    <Key className="w-4 h-4 text-amber-400" />
                    <span>توليد وإرسال كلمة مرور جديدة</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Custom Confirmation Modal */}
      {confirmReset && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#121927] border border-slate-700 rounded-3xl p-6 max-w-sm w-full shadow-2xl shadow-black/80 animate-in zoom-in-95 duration-200">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-amber-500/20 text-amber-500 flex items-center justify-center border border-amber-500/30">
                <Key className="w-8 h-8" />
              </div>
              <div>
                <h3 className="font-bold text-white text-lg mb-1">إعادة تعيين كلمة المرور</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  هل أنت متأكد من رغبتك في إعادة تعيين كلمة المرور لشبكة <span className="font-bold text-amber-400">{confirmReset.networkName}</span>؟
                  <br/>سيتم إرسال كلمة مرور مؤقتة جديدة للمالك.
                </p>
              </div>
              <div className="flex items-center gap-3 w-full pt-2">
                <button
                  onClick={() => setConfirmReset(null)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-all cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  onClick={() => {
                    if (handleRegeneratePassword) {
                      handleRegeneratePassword(confirmReset);
                      setConfirmReset(null);
                    }
                  }}
                  className="flex-1 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold transition-all shadow-lg shadow-amber-900/30 cursor-pointer"
                >
                  نعم، متأكد
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
