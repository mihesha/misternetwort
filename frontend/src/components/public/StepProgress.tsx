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
    <div className="w-full py-3 my-1" dir="rtl">
      <div className="relative flex items-start justify-between max-w-2xl mx-auto px-4 sm:px-6">
        {/* Continuous Connecting Progress Bar Track & Fill Line */}
        <div className="absolute top-5 left-9 right-9 sm:left-11 sm:right-11 h-1.5 bg-slate-200 dark:bg-slate-800 -translate-y-1/2 z-0 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-l from-emerald-500 via-purple-500 to-purple-600 transition-all duration-500 ease-in-out rounded-full"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>

        {steps.map((step, idx) => {
          const isCompleted = idx < activeIndex;
          const isActive = idx === activeIndex;

          return (
            <div
              key={step.id}
              className="relative z-10 flex flex-col items-center shrink-0 min-w-[64px] sm:min-w-[80px]"
            >
              {/* Step Circle */}
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 border-2 ${
                  isCompleted
                    ? 'bg-emerald-500 border-emerald-500 text-white shadow-md shadow-emerald-500/20'
                    : isActive
                    ? 'bg-purple-600 border-purple-600 text-white shadow-lg shadow-purple-600/30 ring-4 ring-purple-500/20'
                    : 'bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-400 dark:text-slate-500'
                }`}
              >
                {isCompleted ? <Check className="w-5 h-5 stroke-[2.5]" /> : step.icon}
              </div>

              {/* Step Label */}
              <span
                className={`mt-2 text-[11px] sm:text-xs font-bold text-center whitespace-nowrap transition-colors ${
                  isActive
                    ? 'text-purple-600 dark:text-purple-400'
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
