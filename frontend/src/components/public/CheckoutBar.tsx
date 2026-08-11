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
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="fixed bottom-0 inset-x-0 z-40 p-4 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200/90 dark:border-slate-800 shadow-2xl dir-rtl"
      >
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Stats Info Block */}
          <div className="flex items-center justify-around sm:justify-start w-full sm:w-auto gap-6 sm:gap-10 border-b sm:border-b-0 pb-3 sm:pb-0 border-slate-100 dark:border-slate-800">
            {/* Total Price */}
            <div className="text-center sm:text-right">
              <span className="block text-xs font-semibold text-slate-500 dark:text-slate-400">
                السعر الكلي
              </span>
              <span className="text-base sm:text-xl font-extrabold text-purple-600 dark:text-purple-400 inline-flex items-center gap-1">
                <span>{totalPrice}</span>
                <span className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300">ريال يمني</span>
              </span>
            </div>

            <div className="h-8 w-px bg-slate-200 dark:bg-slate-800 hidden sm:block" />

            {/* Total Quantity */}
            <div className="text-center sm:text-right">
              <span className="block text-xs font-semibold text-slate-500 dark:text-slate-400">
                الكمية الإجمالية
              </span>
              <span className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-slate-100 inline-flex items-center gap-1">
                <span>{totalCards}</span>
                <span>{totalCards === 1 ? 'كرت' : 'كروت'}</span>
              </span>
            </div>
          </div>

          {/* Action Button */}
          <Button
            variant="primary"
            size="lg"
            onClick={onProceed}
            icon={<ShoppingCart className="w-5 h-5" />}
            iconPosition="start"
            className="w-full sm:w-auto px-8 py-3.5 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-2xl shadow-lg shadow-purple-600/30 text-sm sm:text-base"
          >
            متابعة عملية الشراء
          </Button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default CheckoutBar;
