'use client';

import React from 'react';
import { HelpCircle } from 'lucide-react';
import Button from '@/components/common/Button';

interface BannerGuideProps {
  onOpenGuide: () => void;
}

export const BannerGuide: React.FC<BannerGuideProps> = ({ onOpenGuide }) => {
  return (
    <div className="w-full bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-5 sm:p-7 shadow-sm text-center relative overflow-hidden transition-all mt-1 mb-4">
      <div className="flex flex-col items-center max-w-2xl mx-auto space-y-3">
        {/* Help Circle Icon Header */}
        <div className="w-12 h-12 rounded-2xl bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center shadow-inner">
          <HelpCircle className="w-6 h-6 stroke-[2.2]" />
        </div>

        {/* Title */}
        <h2 className="text-base sm:text-xl font-extrabold text-slate-900 dark:text-slate-100 flex items-center justify-center gap-2">
          <span>💡</span>
          <span>كيفية الشراء والدفع عبر المحافظ الإلكترونية</span>
        </h2>

        {/* Subtitle */}
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed max-w-xl">
          الدليل مرتبط بكل محفظة، أو اضغط على الزر لمشاهدة الشرح بالصور خطوة بخطوة.
        </p>

        {/* Green Offline Purchase Status Indicator */}
        <div className="inline-flex items-center gap-2 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800/60 px-3.5 py-1.5 rounded-full text-xs font-bold text-emerald-700 dark:text-emerald-400 my-1">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping inline-block" />
          <span>عملية الشراء كاملة بدون إنترنت</span>
        </div>

        {/* Purple Step-by-Step Button */}
        <div className="w-full pt-2">
          <Button
            variant="primary"
            size="lg"
            onClick={onOpenGuide}
            className="w-full rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-bold py-3.5 shadow-lg shadow-purple-600/20 text-sm sm:text-base"
          >
            عرض دليل الشراء خطوة بخطوة
          </Button>
        </div>
      </div>
    </div>
  );
};

export default BannerGuide;
