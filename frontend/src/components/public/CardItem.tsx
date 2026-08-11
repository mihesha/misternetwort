'use client';

import React from 'react';
import { Minus, Plus, Wifi, Zap } from 'lucide-react';
import { WifiCardPackage } from '@/types';

interface CardItemProps {
  cardPackage: WifiCardPackage;
  quantity: number;
  onUpdateQuantity: (id: string, delta: number) => void;
}

export const CardItem: React.FC<CardItemProps> = ({
  cardPackage,
  quantity,
  onUpdateQuantity,
}) => {
  const isSelected = quantity > 0;

  return (
    <div
      className={`relative bg-white dark:bg-slate-900 border rounded-2xl sm:rounded-3xl p-3 sm:p-5 shadow-xs hover:shadow-md transition-all duration-300 flex flex-col justify-between overflow-hidden group ${
        isSelected
          ? 'border-purple-600 dark:border-purple-500 ring-2 ring-purple-500/20 bg-purple-50/30 dark:bg-purple-950/20'
          : 'border-slate-200/90 dark:border-slate-800/90 hover:border-purple-300 dark:hover:border-purple-800'
      }`}
    >
      {/* Top Badge */}
      <div className="absolute top-2.5 left-2.5 z-10">
        <span className="inline-flex items-center justify-center bg-emerald-600 text-white text-[10px] sm:text-xs font-extrabold px-2.5 py-0.5 rounded-full shadow-sm pointer-events-none select-none">
          {cardPackage.badgeText || 'متوفر'}
        </span>
      </div>

      {/* Popular Badge if applicable */}
      {cardPackage.popular && (
        <div className="absolute top-2 right-2 flex items-center gap-1 bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-bold">
          <Zap className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-amber-500 fill-amber-500" />
          <span>الأكثر طلباً</span>
        </div>
      )}

      {/* Header Title & Price */}
      <div className="pt-3 pb-2 sm:pb-3 text-center border-b border-slate-100 dark:border-slate-800/80">
        <div className="inline-flex items-center justify-center p-1.5 sm:p-2 bg-purple-100/70 dark:bg-purple-950/70 text-purple-600 dark:text-purple-400 rounded-xl mb-1 sm:mb-2">
          <Wifi className="w-4 h-4 sm:w-5 sm:h-5" />
        </div>
        <h3 className="text-base sm:text-xl font-black text-slate-900 dark:text-slate-100">
          {cardPackage.name}
        </h3>
        <div className="mt-1 inline-flex items-center justify-center gap-1 bg-purple-50 dark:bg-purple-950/60 border border-purple-200/60 dark:border-purple-800/60 px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-xl">
          <span className="text-[10px] sm:text-xs font-bold text-slate-600 dark:text-slate-400 inline-block">
            ر.ي
          </span>
          <span className="font-black text-purple-700 dark:text-purple-300 text-sm sm:text-lg inline-block">
            {cardPackage.price}
          </span>
        </div>
      </div>

      {/* Specifications Grid */}
      <div className="py-2.5 sm:py-3.5 space-y-1.5 sm:space-y-2 text-[11px] sm:text-sm">
        <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
          <span className="text-slate-400 dark:text-slate-500 font-medium">الحجم:</span>
          <div className="inline-flex items-center gap-1 font-extrabold text-slate-800 dark:text-slate-200" dir="ltr">
            {cardPackage.dataSize}
          </div>
        </div>

        <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
          <span className="text-slate-400 dark:text-slate-500 font-medium">المدة:</span>
          <span className="font-bold text-slate-800 dark:text-slate-200" dir="auto">{cardPackage.duration}</span>
        </div>

        <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
          <span className="text-slate-400 dark:text-slate-500 font-medium">الصلاحية:</span>
          <span className="font-bold text-slate-800 dark:text-slate-200" dir="auto">{cardPackage.validity}</span>
        </div>
      </div>

      {/* Quantity Selector Row */}
      <div className="mt-1 pt-2 sm:pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between bg-slate-50/80 dark:bg-slate-950/50 p-1.5 sm:p-2 rounded-xl sm:rounded-2xl border border-slate-200/60 dark:border-slate-800">
        <button
          type="button"
          onClick={() => onUpdateQuantity(cardPackage.id, 1)}
          className="w-7 h-7 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl bg-purple-600 text-white flex items-center justify-center hover:bg-purple-700 transition-all active:scale-90 shadow-xs cursor-pointer"
          aria-label="زيادة الكمية"
        >
          <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        </button>

        <span className="font-black text-sm sm:text-lg text-slate-900 dark:text-slate-100 min-w-[1.5rem] text-center">
          {quantity}
        </span>

        <button
          type="button"
          onClick={() => onUpdateQuantity(cardPackage.id, -1)}
          disabled={quantity <= 0}
          className="w-7 h-7 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-30 disabled:pointer-events-none transition-all active:scale-90 shadow-2xs cursor-pointer"
          aria-label="إنقاص الكمية"
        >
          <Minus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        </button>
      </div>
    </div>
  );
};

export default CardItem;
