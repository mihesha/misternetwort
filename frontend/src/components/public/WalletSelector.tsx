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
    <div className="space-y-4 dir-rtl text-right">
      {/* Wallets Grid */}
      <div>
        <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-3 flex items-center gap-2">
          <Wallet className="w-4 h-4 text-purple-600 dark:text-purple-400" />
          <span>اختر طريقة الدفع المناسبة:</span>
        </h4>

        {user && user.isLoggedIn && (user.wallet_balance || 0) > 0 && (
          <div className="mb-4">
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
              className={`w-full relative p-3 sm:p-4 rounded-2xl border text-center transition-all duration-200 flex items-center justify-between cursor-pointer active:scale-98 shadow-sm ${
                isInternalSelected
                  ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/50 shadow-md ring-2 ring-emerald-500/30'
                  : 'border-emerald-200 dark:border-emerald-800 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/40 dark:to-teal-950/40 hover:border-emerald-400 dark:hover:border-emerald-700'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center shadow-md">
                  <Wallet className="w-5 h-5" />
                </div>
                <div className="text-right">
                  <span className="block font-black text-slate-900 dark:text-slate-100 text-sm sm:text-base">
                    الدفع عبر محفظتي
                  </span>
                  <span className="block font-bold text-emerald-600 dark:text-emerald-400 text-xs mt-0.5">
                    الرصيد المتاح: {(user.wallet_balance || 0).toFixed(2)} ر.ي
                  </span>
                </div>
              </div>
              {isInternalSelected && (
                <div className="text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="w-6 h-6 fill-emerald-600 text-white" />
                </div>
              )}
            </button>
          </div>
        )}

        <div className="grid grid-cols-3 gap-2 sm:gap-3">
          {YEMENI_WALLETS.map((wallet) => {
            const isSelected = selectedWallet?.id === wallet.id;

            return (
              <button
                key={wallet.id}
                type="button"
                onClick={() => onSelectWallet(wallet)}
                className={`relative p-2 sm:p-3.5 rounded-2xl border text-center transition-all duration-200 flex flex-col items-center justify-center gap-1.5 sm:gap-2.5 cursor-pointer active:scale-98 ${
                  isSelected
                    ? 'border-purple-600 dark:border-purple-500 bg-purple-50/80 dark:bg-purple-950/50 shadow-md ring-2 ring-purple-500/20'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 hover:border-purple-300 dark:hover:border-purple-800'
                }`}
              >
                {/* Selected Checkmark */}
                {isSelected && (
                  <div className="absolute top-1.5 left-1.5 text-purple-600 dark:text-purple-400">
                    <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-purple-600 text-white" />
                  </div>
                )}

                {/* Wallet Icon Badge */}
                <div
                  className={`w-8 h-8 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center text-xs sm:text-sm font-bold shadow-xs ${wallet.bgColor} ${wallet.textColor}`}
                >
                  <Wallet className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>

                {/* Wallet Title */}
                <span className="text-[11px] sm:text-sm font-bold text-slate-800 dark:text-slate-200 leading-tight">
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
