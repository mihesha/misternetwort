'use client';

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShoppingCart, ArrowLeft } from 'lucide-react';
import Button from '@/components/common/Button';

interface CheckoutBarProps {
  totalCards: number;
  totalPrice: number;
  onProceed: () => void;
}

export const CheckoutBar: React.FC<CheckoutBarProps> = ({
  totalCards,
  totalPrice,
  onProceed,
}) => {
  if (totalCards <= 0) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 150, opacity: 0, scale: 0.95 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: 150, opacity: 0, scale: 0.95 }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="fixed bottom-4 sm:bottom-6 inset-x-4 sm:inset-x-6 z-40 dir-rtl max-w-4xl mx-auto"
      >
        <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-2xl border border-white/50 dark:border-slate-700/50 shadow-2xl shadow-purple-500/20 rounded-[2rem] p-3 sm:p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          
          {/* Background Glow */}
          <div className="absolute inset-0 rounded-[2rem] bg-gradient-to-r from-purple-500/10 via-transparent to-indigo-500/10 pointer-events-none" />

          {/* Stats Info Block */}
          <div className="flex items-center justify-around sm:justify-start w-full sm:w-auto gap-8 sm:gap-12 px-4 relative z-10">
            {/* Total Price */}
            <div className="text-center sm:text-right">
              <span className="block text-[11px] sm:text-xs font-bold text-slate-500 dark:text-slate-400 mb-0.5 tracking-wide">
                إجمالي السعر
              </span>
              <span className="text-lg sm:text-2xl font-black bg-gradient-to-r from-purple-600 to-indigo-600 dark:from-purple-400 dark:to-indigo-400 bg-clip-text text-transparent inline-flex items-baseline gap-1">
                <span>{totalPrice}</span>
                <span className="text-xs sm:text-sm font-bold text-slate-400 dark:text-slate-500">ر.ي</span>
              </span>
            </div>

            <div className="h-10 w-px bg-slate-200/80 dark:bg-slate-700/80" />

            {/* Total Quantity */}
            <div className="text-center sm:text-right">
              <span className="block text-[11px] sm:text-xs font-bold text-slate-500 dark:text-slate-400 mb-0.5 tracking-wide">
                الكمية
              </span>
              <span className="text-lg sm:text-2xl font-black text-slate-800 dark:text-slate-100 inline-flex items-baseline gap-1">
                <span>{totalCards}</span>
                <span className="text-xs sm:text-sm font-bold text-slate-400 dark:text-slate-500">{totalCards === 1 ? 'كرت' : 'كروت'}</span>
              </span>
            </div>
          </div>

          {/* Action Button */}
          <Button
            variant="primary"
            size="lg"
            onClick={onProceed}
            icon={<ShoppingCart className="w-5 h-5 sm:w-6 sm:h-6" />}
            iconPosition="start"
            className="w-full sm:w-auto px-8 sm:px-10 py-4 sm:py-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-extrabold rounded-3xl shadow-xl shadow-purple-600/30 text-sm sm:text-lg transition-all active:scale-95 relative z-10 group overflow-hidden"
          >
            {/* Button inner shine effect */}
            <div className="absolute inset-0 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12" />
            <span className="relative z-10">إتمام الشراء</span>
          </Button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default CheckoutBar;
