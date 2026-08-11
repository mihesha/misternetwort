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
              className={`py-2 px-1 rounded-xl text-xs font-bold transition-all text-center ${
                activeStep === idx
                  ? 'bg-purple-600 text-white shadow-sm'
                  : idx < activeStep
                  ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
              }`}
            >
              الخطوة {step.id}
            </button>
          ))}
        </div>

        {/* Current Step Content Box */}
        <div className="bg-slate-50 dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-purple-100 dark:bg-purple-950/80 flex items-center justify-center shrink-0">
              {stepIcons[activeStep]}
            </div>
            <div>
              <span className="text-xs font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider">
                الخطوة {currentStepData.id} من {BUYING_GUIDE_STEPS.length}
              </span>
              <h3 className="text-lg font-extrabold text-slate-900 dark:text-slate-100 mt-0.5">
                {currentStepData.title}
              </h3>
            </div>
          </div>

          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
            {currentStepData.description}
          </p>

          {currentStepData.tip && (
            <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-800/60 rounded-2xl flex items-start gap-2.5 text-xs text-amber-800 dark:text-amber-300">
              <Lightbulb className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              <span>{currentStepData.tip}</span>
            </div>
          )}

          {/* Offline Capability Banner */}
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-2xl flex items-center gap-2.5 text-xs text-emerald-700 dark:text-emerald-300 font-bold">
            <Wifi className="w-4 h-4 text-emerald-500 shrink-0 animate-pulse" />
            <span>يمكنك الدخول لهذه الصفحة والدفع بدون رصيد إنترنت مسبق!</span>
          </div>
        </div>

        {/* Footer Navigation Controls */}
        <div className="flex items-center justify-between pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setActiveStep((prev) => Math.max(0, prev - 1))}
            disabled={activeStep === 0}
            icon={<ChevronRight className="w-4 h-4" />}
          >
            السابق
          </Button>

          {activeStep < BUYING_GUIDE_STEPS.length - 1 ? (
            <Button
              variant="primary"
              size="sm"
              onClick={() => setActiveStep((prev) => Math.min(BUYING_GUIDE_STEPS.length - 1, prev + 1))}
              icon={<ChevronLeft className="w-4 h-4" />}
              iconPosition="end"
            >
              الخطوة التالية
            </Button>
          ) : (
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                onClose();
                if (onStartShopping) onStartShopping();
              }}
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
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
