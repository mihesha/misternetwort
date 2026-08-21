'use client';

import React from 'react';
import { HelpCircle } from 'lucide-react';
import Button from '@/components/common/Button';

interface BannerGuideProps {
  onOpenGuide: () => void;
}

export const BannerGuide: React.FC<BannerGuideProps> = ({ onOpenGuide }) => {
  return (
    <div className="w-full bg-gradient-to-br from-indigo-900 to-purple-900 dark:from-indigo-950 dark:to-purple-950 text-white rounded-3xl p-6 sm:p-8 shadow-2xl shadow-indigo-900/20 relative overflow-hidden transition-all mt-2 mb-6 border border-white/10 group">
      
      {/* Background Abstract Shapes */}
      <div className="absolute -top-24 -right-24 w-48 h-48 bg-purple-500/30 blur-[60px] rounded-full pointer-events-none transition-transform group-hover:scale-110" />
      <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-indigo-500/30 blur-[60px] rounded-full pointer-events-none transition-transform group-hover:scale-110" />
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay pointer-events-none" />

      <div className="flex flex-col items-center max-w-2xl mx-auto space-y-4 relative z-10 text-center">
        {/* Help Circle Icon Header */}
        <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-3xl bg-white/10 backdrop-blur-xl text-purple-200 border border-white/20 flex items-center justify-center shadow-inner mb-2 group-hover:bg-white/20 transition-all duration-300 group-hover:-translate-y-1">
          <HelpCircle className="w-7 h-7 sm:w-8 sm:h-8 stroke-[2]" />
        </div>

        {/* Title */}
        <h2 className="text-lg sm:text-2xl font-black text-white flex items-center justify-center gap-2 drop-shadow-md">
          <span>💡</span>
          <span>كيفية الشراء والدفع عبر المحافظ الإلكترونية</span>
        </h2>

        {/* Subtitle */}
        <p className="text-sm sm:text-base text-purple-100/80 leading-relaxed max-w-xl font-medium">
          الدليل مرتبط بكل محفظة، أو اضغط على الزر لمشاهدة الشرح بالصور خطوة بخطوة بطريقة سلسة وسهلة.
        </p>

        {/* Green Offline Purchase Status Indicator */}
        <div className="inline-flex items-center gap-2.5 bg-emerald-500/10 border border-emerald-500/30 px-4 py-2 rounded-2xl text-xs sm:text-sm font-bold text-emerald-300 my-2 backdrop-blur-md shadow-sm">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping inline-block absolute" />
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 inline-block relative z-10" />
          <span>عملية الشراء تتم بنجاح بدون الحاجة لإنترنت</span>
        </div>

        {/* Purple Step-by-Step Button */}
        <div className="w-full pt-4 max-w-md mx-auto">
          <button
            onClick={onOpenGuide}
            className="w-full flex items-center justify-center gap-2 rounded-2xl bg-white text-indigo-900 hover:bg-indigo-50 font-black py-4 shadow-xl shadow-black/10 text-sm sm:text-base transition-all active:scale-95 group/btn border-2 border-white/50 cursor-pointer"
          >
            <span>عرض دليل الشراء المرئي</span>
            <span className="group-hover/btn:-translate-x-1 transition-transform">←</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default BannerGuide;
