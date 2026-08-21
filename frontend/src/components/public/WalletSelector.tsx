'use client';

import React from 'react';
import { CheckCircle2, Wallet } from 'lucide-react';
import { WalletOption, UserAccount } from '@/types';
import { YEMENI_WALLETS } from '@/data/public-content';

interface WalletSelectorProps {
  selectedWallet: WalletOption | null;
  onSelectWallet: (wallet: WalletOption) => void;
  totalAmount: number;
  user?: UserAccount | null;
}

export const WalletSelector: React.FC<WalletSelectorProps> = ({
  selectedWallet,
  onSelectWallet,
  totalAmount,
  user
}) => {
  const isInternalSelected = selectedWallet?.id === 'internal_wallet';
  return (
    <div className="space-y-5 dir-rtl text-right">
      {/* Wallets Grid */}
      <div>
        <h4 className="text-sm sm:text-base font-extrabold text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-purple-100 dark:bg-purple-900/50 flex items-center justify-center">
            <Wallet className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600 dark:text-purple-400" />
          </div>
          <span>اختر طريقة الدفع المناسبة:</span>
        </h4>

        {user && user.isLoggedIn && (user.wallet_balance || 0) > 0 && (
          <div className="mb-5 relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 rounded-3xl blur-md group-hover:blur-lg transition-all" />
            <button
              type="button"
              onClick={() => onSelectWallet({
                id: 'internal_wallet',
                name: 'محفظتي',
                nameAr: 'محفظتي',
                category: 'wallet',
                icon: 'Wallet',
                bgColor: 'bg-emerald-100 dark:bg-emerald-900',
                textColor: 'text-emerald-700 dark:text-emerald-300',
                borderColor: 'border-emerald-200 dark:border-emerald-800',
                accountNumber: '',
                accountName: user.fullName,
                steps: []
              })}
              className={`w-full relative p-4 sm:p-5 rounded-3xl border-2 text-center transition-all duration-300 flex items-center justify-between cursor-pointer active:scale-[0.98] shadow-lg ${
                isInternalSelected
                  ? 'border-emerald-400 bg-emerald-50/90 dark:bg-emerald-950/90 shadow-emerald-500/20'
                  : 'border-white/50 dark:border-slate-700/50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl hover:border-emerald-400/60 dark:hover:border-emerald-600/60'
              }`}
            >
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center shadow-inner transition-colors ${isInternalSelected ? 'bg-gradient-to-br from-emerald-400 to-teal-500 text-white' : 'bg-emerald-100 dark:bg-emerald-900/60 text-emerald-600 dark:text-emerald-400 group-hover:bg-emerald-200 dark:group-hover:bg-emerald-800'}`}>
                  <Wallet className="w-6 h-6 sm:w-7 sm:h-7" />
                </div>
                <div className="text-right">
                  <span className="block font-black text-slate-900 dark:text-slate-100 text-base sm:text-lg">
                    الدفع عبر محفظتي
                  </span>
                  <span className="block font-bold text-emerald-600 dark:text-emerald-400 text-xs sm:text-sm mt-0.5">
                    الرصيد المتاح: {(user.wallet_balance || 0).toFixed(2)} ر.ي
                  </span>
                </div>
              </div>
              {isInternalSelected && (
                <div className="text-emerald-500 dark:text-emerald-400 animate-in zoom-in duration-300">
                  <CheckCircle2 className="w-7 h-7 sm:w-8 sm:h-8 fill-emerald-500 text-white" />
                </div>
              )}
            </button>
          </div>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
          {YEMENI_WALLETS.map((wallet) => {
            const isSelected = selectedWallet?.id === wallet.id;

            return (
              <button
                key={wallet.id}
                type="button"
                onClick={() => onSelectWallet(wallet)}
                className={`relative p-3 sm:p-4 rounded-3xl border-2 text-center transition-all duration-300 flex flex-col items-center justify-center gap-2 sm:gap-3 cursor-pointer active:scale-[0.98] group ${
                  isSelected
                    ? 'border-purple-500 bg-purple-50/90 dark:bg-purple-900/40 shadow-lg shadow-purple-500/20'
                    : 'border-white/60 dark:border-slate-800/60 bg-white/60 dark:bg-slate-900/60 backdrop-blur-md hover:border-purple-300 dark:hover:border-purple-700/60 hover:bg-white dark:hover:bg-slate-800 hover:shadow-md'
                }`}
              >
                {/* Selected Checkmark */}
                {isSelected && (
                  <div className="absolute top-2.5 left-2.5 text-purple-600 dark:text-purple-400 animate-in zoom-in duration-300">
                    <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6 fill-purple-600 text-white drop-shadow-md" />
                  </div>
                )}

                {/* Wallet Icon Badge */}
                <div
                  className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center text-xs sm:text-sm font-bold shadow-inner transition-transform group-hover:-translate-y-1 ${
                    isSelected ? 'bg-gradient-to-br from-purple-500 to-indigo-600 text-white shadow-purple-500/30' : `${wallet.bgColor} ${wallet.textColor}`
                  }`}
                >
                  <Wallet className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>

                {/* Wallet Title */}
                <span className={`text-[13px] sm:text-base font-black transition-colors ${isSelected ? 'text-purple-900 dark:text-purple-100' : 'text-slate-700 dark:text-slate-300'}`}>
                  {wallet.nameAr}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default WalletSelector;
