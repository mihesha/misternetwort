"use client";
import React, { useState, useRef, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { 
  Wifi, ChevronDown, Check, Plus, Globe, Wallet, 
  ArrowRightLeft, Layers, ExternalLink 
} from 'lucide-react';
import { useOwnerContext, OwnerNetworkCard } from '../../context/OwnerContext';

interface NetworkSwitcherProps {
  isDarkMode: boolean;
  isCompact?: boolean;
}

export const NetworkSwitcher: React.FC<NetworkSwitcherProps> = ({
  isDarkMode,
  isCompact = false,
}) => {
  const router = useRouter();
  const pathname = usePathname() || '';
  const { 
    networks, 
    activeNetwork, 
    setActiveNetworkId, 
    setShowAddNetworkModal 
  } = useOwnerContext();

  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!activeNetwork && networks.length === 0) return null;

  const currentNetwork = activeNetwork || networks[0];

  const handleSelect = (net: OwnerNetworkCard) => {
    setActiveNetworkId(net.id);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2.5 px-3 py-2 rounded-2xl border transition-all cursor-pointer outline-none ${
          isOpen
            ? 'ring-2 ring-blue-500/50 border-blue-500'
            : isDarkMode
            ? 'bg-white/5 hover:bg-white/10 border-white/10 text-slate-200'
            : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-800 shadow-xs'
        }`}
      >
        <div className="w-7 h-7 rounded-xl bg-blue-600/10 text-blue-500 flex items-center justify-center shrink-0 border border-blue-500/20">
          <Wifi className="w-3.5 h-3.5" />
        </div>

        <div className="text-right hidden sm:block max-w-[140px] md:max-w-[170px]">
          <div className="text-xs font-black truncate leading-tight">
            {currentNetwork?.name || 'اختر شبكة'}
          </div>
          <div className="text-[10px] text-slate-400 font-mono flex items-center gap-1.5 mt-0.5">
            <span>#{currentNetwork?.code}</span>
            <span>•</span>
            <span className="text-emerald-500 font-bold">{(currentNetwork?.balance || 0).toLocaleString()} ر.ي</span>
          </div>
        </div>

        <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${
          isOpen ? 'rotate-180 text-blue-500' : ''
        }`} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          dir="rtl"
          className={`absolute top-full left-0 sm:left-auto sm:right-0 mt-2.5 w-72 sm:w-80 rounded-3xl p-2.5 shadow-2xl border z-50 animate-in fade-in zoom-in-95 duration-200 ${
            isDarkMode
              ? 'bg-[#121926]/95 backdrop-blur-2xl border-white/10 shadow-black/60 text-slate-200'
              : 'bg-white/95 backdrop-blur-2xl border-slate-200 shadow-slate-900/15 text-slate-800'
          }`}
        >
          {/* Header */}
          <div className={`flex items-center justify-between px-3 py-2 border-b mb-1.5 ${
            isDarkMode ? 'border-white/10' : 'border-slate-100'
          }`}>
            <span className="text-xs font-black flex items-center gap-2">
              <ArrowRightLeft className="w-3.5 h-3.5 text-blue-500" />
              <span>تبديل الشبكة</span>
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-500">
              {networks.length} شبكات
            </span>
          </div>

          {/* Networks List */}
          <div className="max-h-60 overflow-y-auto custom-scrollbar space-y-1 py-1">
            {networks.map((net) => {
              const isSelected = net.id.toString() === currentNetwork?.id?.toString();
              return (
                <div
                  key={net.id}
                  onClick={() => handleSelect(net)}
                  className={`p-2.5 rounded-2xl flex items-center justify-between gap-3 transition-all cursor-pointer ${
                    isSelected
                      ? isDarkMode
                        ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                        : 'bg-blue-50 text-blue-700 border border-blue-200'
                      : isDarkMode
                      ? 'hover:bg-white/5 border border-transparent'
                      : 'hover:bg-slate-50 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                      isSelected
                        ? 'bg-blue-600 text-white shadow-xs'
                        : isDarkMode
                        ? 'bg-white/10 text-slate-400'
                        : 'bg-slate-100 text-slate-600'
                    }`}>
                      <Wifi className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-bold truncate leading-tight">
                        {net.name}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono mt-0.5 flex items-center gap-1.5">
                        <span>#{net.code}</span>
                        <span>•</span>
                        <span className="text-emerald-500 font-bold">{(net.balance || 0).toLocaleString()} ر.ي</span>
                      </div>
                    </div>
                  </div>

                  {isSelected && (
                    <div className="w-5 h-5 rounded-full bg-blue-500 text-white flex items-center justify-center shrink-0">
                      <Check className="w-3 h-3" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Footer Actions */}
          <div className={`pt-2 mt-1 border-t space-y-1 ${isDarkMode ? 'border-white/10' : 'border-slate-100'}`}>
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                setShowAddNetworkModal(true);
              }}
              className="w-full py-2 px-3 rounded-xl text-xs font-bold text-blue-500 hover:bg-blue-500/10 flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>إضافة شبكة جديدة</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                router.push('/owner/networks');
              }}
              className={`w-full py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer ${
                isDarkMode ? 'hover:bg-white/5 text-slate-300' : 'hover:bg-slate-100 text-slate-700'
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              <span>عرض كافة الشبكات</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
