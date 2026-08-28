'use client';

import React from 'react';
import { BUYING_GUIDE_STEPS, FAQS } from '@/data/public-content';
import { ShoppingBag, Wallet, CreditCard, CheckCircle2, HelpCircle } from 'lucide-react';

export default function GuidePage() {
  const stepIcons = [
    <ShoppingBag key="1" className="w-6 h-6 text-purple-600" />,
    <Wallet key="2" className="w-6 h-6 text-purple-600" />,
    <CreditCard key="3" className="w-6 h-6 text-purple-600" />,
    <CheckCircle2 key="4" className="w-6 h-6 text-emerald-600" />,
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8 py-6 text-right dir-rtl">
      <div className="text-center space-y-2">
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100">
          دليل الشراء والدفع الشامل
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
          خطوات توضيحية بسيطة تمكنك من شراء كروت Card Box كارد بوكس بسهولة عبر تطبيق المحفظة الإلكترونية
        </p>
      </div>

      {/* Steps List */}
      <div className="space-y-4">
        {BUYING_GUIDE_STEPS.map((step, idx) => (
          <div
            key={step.id}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 flex flex-col sm:flex-row items-start gap-4 shadow-xs"
          >
            <div className="w-12 h-12 rounded-2xl bg-purple-100 dark:bg-purple-950 flex items-center justify-center shrink-0">
              {stepIcons[idx]}
            </div>
            <div className="space-y-1.5 flex-1">
              <span className="text-xs font-bold text-purple-600 dark:text-purple-400">الخطوة {step.id}</span>
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">{step.title}</h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{step.description}</p>
              {step.tip && (
                <p className="text-xs text-amber-700 dark:text-amber-400 font-medium pt-1">💡 ملاحظة: {step.tip}</p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* FAQ Section */}
      <div className="space-y-4 pt-6 border-t border-slate-200 dark:border-slate-800">
        <h2 className="text-xl font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-purple-600" />
          <span>الأسئلة الأكثر تداولاً:</span>
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {FAQS.map((faq) => (
            <div
              key={faq.id}
              className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 space-y-2"
            >
              <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">{faq.question}</h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{faq.answer}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
