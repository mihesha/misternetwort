'use client';

import React, { useState } from 'react';
import { ShoppingBag, Wallet, CreditCard, CheckCircle2, ChevronRight, ChevronLeft, Wifi, Lightbulb } from 'lucide-react';
import Modal from '@/components/common/Modal';
import Button from '@/components/common/Button';
import { BUYING_GUIDE_STEPS } from '@/data/public-content';

interface GuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartShopping?: () => void;
}

export const GuideModal: React.FC<GuideModalProps> = ({
  isOpen,
  onClose,
  onStartShopping,
}) => {
  const [activeStep, setActiveStep] = useState<number>(0);

  const stepIcons = [
    <ShoppingBag key="1" className="w-8 h-8 text-purple-600 dark:text-purple-400" />,
    <Wallet key="2" className="w-8 h-8 text-purple-600 dark:text-purple-400" />,
    <CreditCard key="3" className="w-8 h-8 text-purple-600 dark:text-purple-400" />,
    <CheckCircle2 key="4" className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />,
  ];

  const currentStepData = BUYING_GUIDE_STEPS[activeStep];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="دليل الشراء والدفع خطوة بخطوة"
      subtitle="توضيح لكيفية شراء كروت الشاشات والإنترنت والدفع عبر المحافظ"
      maxWidth="xl"
    >
      <div dir="rtl" className="space-y-6 text-right">
        {/* Step Indicator Badges */}
        <div dir="rtl" className="grid grid-cols-4 gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
          {BUYING_GUIDE_STEPS.map((step, idx) => (
            <button
              key={step.id}
              onClick={() => setActiveStep(idx)}
              className={`py-2 px-1 rounded-xl text-xs font-bold transition-all text-center relative overflow-hidden group ${
                activeStep === idx
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-600/30 ring-2 ring-purple-400/50'
                  : idx < activeStep
                  ? 'bg-gradient-to-r from-emerald-100 to-teal-100 dark:from-emerald-900/40 dark:to-teal-900/40 text-emerald-700 dark:text-emerald-400'
                  : 'bg-slate-100 dark:bg-slate-800/80 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {activeStep === idx && (
                <div className="absolute inset-0 bg-white/20 blur-md pointer-events-none" />
              )}
              <span className="relative z-10">الخطوة {step.id}</span>
            </button>
          ))}
        </div>

        {/* Current Step Content Box */}
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200 dark:border-slate-800 rounded-[2rem] p-6 space-y-5 shadow-xl relative overflow-hidden">
          {/* Subtle background glow */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 blur-3xl rounded-full pointer-events-none" />
          
          <div className="flex items-center gap-4 relative z-10">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-100 to-indigo-50 dark:from-purple-900/50 dark:to-indigo-900/50 flex items-center justify-center shrink-0 shadow-inner border border-purple-200/50 dark:border-purple-700/30">
              {stepIcons[activeStep]}
            </div>
            <div>
              <span className="text-xs font-black text-purple-600 dark:text-purple-400 uppercase tracking-widest bg-purple-50 dark:bg-purple-900/30 px-2.5 py-0.5 rounded-full inline-block mb-1 border border-purple-100 dark:border-purple-800">
                الخطوة {currentStepData.id} من {BUYING_GUIDE_STEPS.length}
              </span>
              <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-slate-100 mt-0.5 drop-shadow-sm">
                {currentStepData.title}
              </h3>
            </div>
          </div>

          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-bold bg-slate-50 dark:bg-slate-950/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800/80 shadow-inner">
            {currentStepData.description}
          </p>

          {currentStepData.tip && (
            <div className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 border border-amber-200/80 dark:border-amber-800/60 rounded-2xl flex items-start gap-3 text-xs sm:text-sm text-amber-900 dark:text-amber-200 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-400 to-orange-400" />
              <Lightbulb className="w-5 h-5 text-amber-500 shrink-0 mt-0.5 drop-shadow-sm" />
              <span className="font-bold leading-relaxed">{currentStepData.tip}</span>
            </div>
          )}

          {/* Offline Capability Banner */}
          <div className="p-4 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 border border-emerald-200 dark:border-emerald-800/60 rounded-2xl flex items-center gap-3 text-xs sm:text-sm text-emerald-800 dark:text-emerald-200 font-black shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-1 h-full bg-gradient-to-b from-emerald-400 to-teal-400" />
            <Wifi className="w-5 h-5 text-emerald-500 shrink-0 animate-pulse drop-shadow-md" />
            <span>يمكنك الدخول لهذه الصفحة والدفع بدون رصيد إنترنت مسبق!</span>
          </div>
        </div>

        {/* Footer Navigation Controls */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
          <Button
            variant="outline"
            size="md"
            onClick={() => setActiveStep((prev) => Math.max(0, prev - 1))}
            disabled={activeStep === 0}
            icon={<ChevronRight className="w-5 h-5" />}
            className="rounded-xl font-bold"
          >
            السابق
          </Button>

          {activeStep < BUYING_GUIDE_STEPS.length - 1 ? (
            <Button
              variant="primary"
              size="md"
              onClick={() => setActiveStep((prev) => Math.min(BUYING_GUIDE_STEPS.length - 1, prev + 1))}
              icon={<ChevronLeft className="w-5 h-5" />}
              iconPosition="end"
              className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 rounded-xl font-bold shadow-lg shadow-purple-600/20 active:scale-95 transition-all"
            >
              الخطوة التالية
            </Button>
          ) : (
            <Button
              variant="primary"
              size="md"
              onClick={() => {
                onClose();
                if (onStartShopping) onStartShopping();
              }}
              className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white rounded-xl font-black shadow-lg shadow-emerald-500/20 active:scale-95 transition-all"
            >
              ابدأ الشراء الآن
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default GuideModal;
