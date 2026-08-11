"use client";
import React, { useEffect } from 'react';
import { useOwnerContext } from '../../../context/OwnerContext';
import { useAppContext } from '../../../context/AppContext';
import { useOwnerActions } from '../../../hooks/useOwnerActions';
import { Search, AlertTriangle, FileText, CreditCard } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function OwnerOverviewPage() {
  const { isDarkMode, setIsDarkMode } = useAppContext();
  const {
    ownerName,
    networks,
    searchQuery,
    setShowSearchModal,
  } = useOwnerContext();
  const { fetchOwnerNetworks } = useOwnerActions();
  const router = useRouter();

  useEffect(() => {
    fetchOwnerNetworks();
  }, []);

  const filteredNetworks = networks.filter((net) =>
    net.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    net.code.includes(searchQuery)
  );

  return (
    <>
      {/* Sub-Header Row: Title & Search Button */}
      <div className="flex items-center justify-between mb-8">
        <button
          onClick={() => setShowSearchModal(true)}
          className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
            isDarkMode
              ? 'bg-[#141d2b] hover:bg-[#1e293b] border-slate-700/60 text-slate-300'
              : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-600 shadow-sm'
          }`}
          title="بحث بالاسم او الكود..."
        >
          <Search className="w-5 h-5" />
        </button>

        <h1 className={`text-xl md:text-2xl font-black tracking-wide ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
          لوحة التحكم - مالك شبكة
        </h1>
      </div>

      {/* Cards Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 justify-items-end">
        {filteredNetworks.map((net) => {
          const lowStockCount = net.categories.filter((c) => c.remaining < 5).length;

          return (
            <div
              key={net.id}
              className={`w-full max-w-sm rounded-2xl overflow-hidden transition-all duration-200 shadow-xl ${
                isDarkMode
                  ? 'bg-[#121a28] border border-slate-800/80 shadow-black/60'
                  : 'bg-white border border-slate-200/90 shadow-slate-300/40'
              }`}
            >
              {/* Green Header Section */}
              <div className="bg-emerald-600 p-5 text-white relative">
                <div className="flex items-center justify-between mb-2">
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/80 text-white shadow-sm">
                    {net.status === 'active' ? 'نشط' : 'غير نشط'}
                  </span>
                  <h2 className="text-xl font-black tracking-wide">{net.name}</h2>
                </div>

                <div className="space-y-1 text-right text-xs md:text-sm font-semibold opacity-95">
                  <div>كود الشبكة: {net.code}</div>
                  <div>الرصيد: {net.balance} ر.ي</div>
                </div>
              </div>

              {/* Categories Section */}
              <div className="p-5 space-y-4">
                <div className={`text-right text-sm font-bold ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                  الفئات
                </div>

                {/* Category List */}
                <div className="space-y-2">
                  {net.categories.map((cat, idx) => (
                    <div
                      key={idx}
                      className={`flex items-center justify-between px-4 py-2.5 rounded-xl text-xs md:text-sm font-bold transition-colors ${
                        cat.remaining === 0
                          ? isDarkMode
                            ? 'bg-[#3b0d0d] text-red-200 border border-red-900/40'
                            : 'bg-red-50 text-red-700 border border-red-200'
                          : isDarkMode
                          ? 'bg-[#1b2535] text-slate-200'
                          : 'bg-slate-100 text-slate-800'
                      }`}
                    >
                      <span>المتبقي: {cat.remaining}</span>
                      <span className="font-mono">{cat.value}</span>
                    </div>
                  ))}
                </div>

                {/* Low Inventory Alert Banner */}
                {lowStockCount > 0 && (
                  <div className="p-3 rounded-xl bg-amber-900/40 border border-amber-600/40 text-amber-300 text-xs text-center font-bold flex items-center justify-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>تنبيه انخفاض المخزون: {lowStockCount} فئة</span>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <button
                    onClick={() => {
                      localStorage.setItem('ownerActiveNetworkId', net.id.toString());
                      router.push('/owner/details');
                    }}
                    className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs md:text-sm transition-all shadow-md shadow-blue-900/30 cursor-pointer"
                  >
                    <FileText className="w-4 h-4 text-white shrink-0" />
                    <span>عرض التفاصيل</span>
                  </button>

                  <button
                    onClick={() => {
                      localStorage.setItem('ownerActiveNetworkId', net.id.toString());
                      router.push('/owner/import-cards');
                    }}
                    className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl font-bold text-xs md:text-sm transition-all cursor-pointer ${
                      isDarkMode
                        ? 'bg-[#1f293d] hover:bg-[#283650] text-slate-200 border border-slate-700/50'
                        : 'bg-slate-200 hover:bg-slate-300 text-slate-800'
                    }`}
                  >
                    <CreditCard className="w-4 h-4 text-blue-400 shrink-0" />
                    <span>إضافة الكروت</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
