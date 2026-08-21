'use client';

import React from 'react';
import { Check, CreditCard, Clock, Zap, ShoppingBag } from 'lucide-react';
import { OrderStep } from '@/types';

interface StepProgressProps {
  currentStep: OrderStep;
}

export const StepProgress: React.FC<StepProgressProps> = ({ currentStep }) => {
  const steps: { id: OrderStep; label: string; icon: React.ReactNode }[] = [
    { id: 'select', label: 'اختيار الباقة', icon: <ShoppingBag className="w-4 h-4" /> },
    { id: 'payment', label: 'تفاصيل الدفع', icon: <CreditCard className="w-4 h-4" /> },
    { id: 'verification', label: 'التحقق والمطابقة', icon: <Clock className="w-4 h-4" /> },
    { id: 'receipt', label: 'استلام الكرت', icon: <Zap className="w-4 h-4" /> },
  ];

  const getStepIndex = (step: OrderStep) => steps.findIndex((s) => s.id === step);
  const activeIndex = getStepIndex(currentStep);
  const progressPercentage = (activeIndex / (steps.length - 1)) * 100;

  return (
    <div className="w-full py-4 my-2" dir="rtl">
      <div className="relative flex items-start justify-between max-w-2xl mx-auto px-4 sm:px-6">
        {/* Continuous Connecting Progress Bar Track & Fill Line */}
        <div className="absolute top-6 left-9 right-9 sm:left-11 sm:right-11 h-2 bg-slate-200/50 dark:bg-slate-800/50 -translate-y-1/2 z-0 rounded-full overflow-hidden backdrop-blur-sm">
          <div
            className="h-full bg-gradient-to-l from-emerald-400 via-purple-500 to-indigo-600 transition-all duration-700 ease-out rounded-full shadow-[0_0_15px_rgba(168,85,247,0.5)]"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>

        {steps.map((step, idx) => {
          const isCompleted = idx < activeIndex;
          const isActive = idx === activeIndex;

          return (
            <div
              key={step.id}
              className="relative z-10 flex flex-col items-center shrink-0 min-w-[64px] sm:min-w-[80px] group"
            >
              {/* Step Circle Glow behind */}
              {isActive && (
                <div className="absolute top-1 w-10 h-10 bg-purple-500/30 rounded-full blur-xl animate-pulse pointer-events-none" />
              )}

              {/* Step Circle */}
              <div
                className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center font-bold text-sm transition-all duration-500 border-2 relative z-10 ${
                  isCompleted
                    ? 'bg-gradient-to-br from-emerald-400 to-teal-500 border-emerald-400 text-white shadow-lg shadow-emerald-500/30'
                    : isActive
                    ? 'bg-gradient-to-br from-purple-500 to-indigo-600 border-purple-400 text-white shadow-2xl shadow-purple-500/40 ring-4 ring-purple-500/20 scale-110'
                    : 'bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-slate-200 dark:border-slate-700 text-slate-400 dark:text-slate-500 group-hover:border-purple-300 dark:group-hover:border-purple-800'
                }`}
              >
                {isCompleted ? <Check className="w-5 h-5 sm:w-6 sm:h-6 stroke-[3]" /> : step.icon}
              </div>

              {/* Step Label */}
              <span
                className={`mt-3 text-[11px] sm:text-xs font-black text-center whitespace-nowrap transition-colors duration-300 ${
                  isActive
                    ? 'text-purple-600 dark:text-purple-400 drop-shadow-sm scale-110'
                    : isCompleted
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : 'text-slate-400 dark:text-slate-500'
                }`}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default StepProgress;
