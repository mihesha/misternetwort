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
      className={`relative p-4 sm:p-5 transition-all duration-300 flex flex-col justify-between overflow-hidden group rounded-[2rem] ${
        isSelected
          ? 'bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/30 dark:to-indigo-900/30 border-2 border-purple-500/60 shadow-xl shadow-purple-500/20'
          : 'bg-white dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200 dark:border-slate-800/80 shadow-md hover:shadow-xl hover:shadow-purple-500/10 hover:border-purple-300 dark:hover:border-purple-700/60 hover:-translate-y-1'
      }`}
    >
      {/* Top Background Glow */}
      <div className={`absolute -top-12 -right-12 w-24 h-24 rounded-full blur-2xl opacity-50 transition-all duration-500 ${isSelected ? 'bg-purple-500/30' : 'bg-slate-300/30 dark:bg-slate-800/30 group-hover:bg-purple-400/20'}`} />

      {/* Top Badge */}
      <div className="absolute top-3 left-3 z-10 flex gap-1">
        <span className="inline-flex items-center justify-center bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-[10px] sm:text-xs font-bold px-2.5 py-0.5 rounded-full shadow-sm shadow-emerald-500/30 pointer-events-none select-none">
          {cardPackage.badgeText || 'متوفر'}
        </span>
      </div>

      {/* Popular Badge if applicable */}
      {cardPackage.popular && (
        <div className="absolute top-3 right-3 flex items-center gap-1 bg-gradient-to-r from-amber-400 to-orange-500 text-white shadow-sm shadow-orange-500/30 px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-bold z-10">
          <Zap className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-white fill-white" />
          <span>الأكثر طلباً</span>
        </div>
      )}

      {/* Header Title & Price */}
      <div className="pt-5 pb-3 text-center relative z-10">
        <div className={`mx-auto w-12 h-12 flex items-center justify-center rounded-2xl mb-2 shadow-inner transition-all duration-300 ${isSelected ? 'bg-gradient-to-br from-purple-500 to-indigo-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 group-hover:text-purple-500 group-hover:bg-purple-50 dark:group-hover:bg-purple-900/30'}`}>
          <Wifi className="w-6 h-6" />
        </div>
        <div className="inline-flex items-baseline justify-center gap-1.5 px-4 py-2 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 backdrop-blur-md bg-gradient-to-b from-white to-slate-50 dark:from-slate-900 dark:to-slate-950 shadow-sm mt-1">
          <span className="font-black text-purple-600 dark:text-purple-400 text-2xl sm:text-3xl">
            {cardPackage.price}
          </span>
          <span className="text-[10px] sm:text-xs font-bold text-slate-500 dark:text-slate-400">
            ر.ي
          </span>
        </div>
      </div>

      {/* Specifications Grid */}
      <div className="pt-2 pb-4 text-[11px] sm:text-sm relative z-10">
        <div className="border border-slate-200/80 dark:border-slate-800/80 rounded-2xl overflow-hidden divide-y divide-slate-100 dark:divide-slate-800/60 bg-white/50 dark:bg-slate-950/20 shadow-sm">
          <div className="flex items-center justify-between px-4 py-2.5 hover:bg-slate-50/80 dark:hover:bg-slate-900/50 transition-colors">
            <span className="font-bold text-slate-500 dark:text-slate-400">الحجم</span>
            <span className="font-black text-slate-900 dark:text-slate-100" dir="ltr">{cardPackage.dataSize}</span>
          </div>

          <div className="flex items-center justify-between px-4 py-2.5 hover:bg-slate-50/80 dark:hover:bg-slate-900/50 transition-colors">
            <span className="font-bold text-slate-500 dark:text-slate-400">المدة</span>
            <span className="font-black text-slate-900 dark:text-slate-100" dir="auto">{cardPackage.duration}</span>
          </div>

          <div className="flex items-center justify-between px-4 py-2.5 hover:bg-slate-50/80 dark:hover:bg-slate-900/50 transition-colors">
            <span className="font-bold text-slate-500 dark:text-slate-400">الصلاحية</span>
            <span className="font-black text-slate-900 dark:text-slate-100" dir="auto">{cardPackage.validity}</span>
          </div>
        </div>
      </div>

      {/* Quantity Selector Row */}
      <div className="mt-auto flex items-center justify-between relative z-10 bg-slate-50 dark:bg-slate-900/60 p-2 rounded-[1.25rem] border border-slate-200 dark:border-slate-800 shadow-inner">
        <button
          type="button"
          onClick={() => onUpdateQuantity(cardPackage.id, 1)}
          className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 text-white flex items-center justify-center hover:from-purple-600 hover:to-indigo-700 transition-all active:scale-95 shadow-md shadow-purple-500/20 cursor-pointer border border-purple-400/50"
          aria-label="زيادة الكمية"
        >
          <Plus className="w-5 h-5" />
        </button>

        <span className="font-black text-xl sm:text-2xl text-slate-900 dark:text-slate-100 min-w-[2.5rem] text-center font-mono">
          {quantity}
        </span>

        <button
          type="button"
          onClick={() => onUpdateQuantity(cardPackage.id, -1)}
          disabled={quantity <= 0}
          className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-40 disabled:border-slate-100 dark:disabled:border-slate-800/50 disabled:pointer-events-none transition-all active:scale-95 shadow-sm cursor-pointer"
          aria-label="إنقاص الكمية"
        >
          <Minus className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default CardItem;
