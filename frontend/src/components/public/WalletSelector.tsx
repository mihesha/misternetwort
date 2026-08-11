'use client';

import React from 'react';
import { CheckCircle2, Wallet } from 'lucide-react';
import { WalletOption } from '@/types';
import { YEMENI_WALLETS } from '@/data/public-content';

interface WalletSelectorProps {
  selectedWallet: WalletOption | null;
  onSelectWallet: (wallet: WalletOption) => void;
  totalAmount: number;
}

export const WalletSelector: React.FC<WalletSelectorProps> = ({
  selectedWallet,
  onSelectWallet,
}) => {
  return (
    <div className="space-y-4 dir-rtl text-right">
      {/* Wallets Grid */}
      <div>
        <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-3 flex items-center gap-2">
          <Wallet className="w-4 h-4 text-purple-600 dark:text-purple-400" />
          <span>اختر طريقة الدفع المناسبة:</span>
        </h4>

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
