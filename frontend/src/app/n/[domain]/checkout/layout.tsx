'use client';

import React, { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { CheckoutProvider, useCheckout } from '@/context/CheckoutContext';
import { StepProgress } from '@/components/public/StepProgress';
import { ChevronDown, ChevronUp, ShoppingCart, ArrowRight } from 'lucide-react';
import { OrderStep } from '@/types';

function CheckoutLayoutInner({ children, domain }: { children: React.ReactNode, domain: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const { cartItems, totalAmount, totalCards, selectedWallet } = useCheckout();
  const [isOrderSummaryOpen, setIsOrderSummaryOpen] = useState(true);

  // Determine current step based on URL path
  let currentStep: OrderStep = 'payment';
  if (pathname.includes('/transaction')) currentStep = 'transaction' as any;
  if (pathname.includes('/verify')) currentStep = 'verification';
  if (pathname.includes('/receipt')) currentStep = 'receipt';

  const isPaymentStep = currentStep === 'payment';

  return (
    <div dir="rtl" className="space-y-4 sm:space-y-6 text-right max-w-4xl mx-auto pb-12 animate-fadeIn pt-6 px-4 sm:px-0">
      {/* Show Step Progress & Order Summary ONLY in payment step */}
      {isPaymentStep && (
        <>
          {/* Step Progress Bar with Back Button */}
          <div className="bg-white dark:bg-purple-900/20 border border-slate-200/80 dark:border-purple-500/30 rounded-3xl p-4 sm:p-5 shadow-sm space-y-2">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => router.push(`/n/${domain}`)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-xl transition-all border border-slate-200/60 dark:border-slate-700 active:scale-95"
              >
                <ArrowRight className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                <span>رجوع للرئيسية</span>
              </button>
              <span className="font-extrabold text-xs sm:text-sm text-slate-800 dark:text-slate-200">
                متابعة وإكمال عملية الشراء
              </span>
            </div>
            <StepProgress currentStep={currentStep} />
          </div>

          {/* ORDER SUMMARY ACCORDION CARD */}
          <div className="bg-white dark:bg-purple-900/20 border border-slate-200/80 dark:border-purple-500/30 rounded-3xl overflow-hidden shadow-sm transition-all">
            <button
              type="button"
              onClick={() => setIsOrderSummaryOpen(!isOrderSummaryOpen)}
              className="w-full p-3.5 sm:p-4 flex items-center justify-between bg-purple-50/50 dark:bg-purple-950/20 hover:bg-purple-100/50 dark:hover:bg-purple-900/30 transition-colors cursor-pointer"
            >
              {/* Right side (start in RTL): Cart icon + Title */}
              <div className="flex items-center gap-2">
                <ShoppingCart className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0" />
                <span className="font-bold text-slate-800 dark:text-slate-200 text-xs sm:text-sm">
                  ملخص الطلب
                </span>
              </div>

              {/* Left side (end in RTL): Badge + Arrow */}
              <div className="flex items-center gap-2.5">
                <span className="bg-purple-600 text-white text-[11px] sm:text-xs font-semibold px-2.5 py-1 rounded-full shadow-xs">
                  {totalCards} {totalCards === 1 ? 'كرت' : 'كروت'} • {totalAmount.toFixed(2)} ر.ي
                </span>
                {isOrderSummaryOpen ? (
                  <ChevronUp className="w-4 h-4 text-slate-400 shrink-0" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                )}
              </div>
            </button>

            {isOrderSummaryOpen && (
              <div className="p-4 border-t border-slate-200/60 dark:border-slate-800 space-y-3 text-xs sm:text-sm">
                <div className="space-y-2.5 max-h-60 overflow-y-auto no-scrollbar">
                  {cartItems.map((item) => (
                    <div
                      key={item.wifiPackage.id}
                      className="flex items-center justify-between py-2.5 border-b border-slate-100 dark:border-slate-800/60 last:border-0 gap-3"
                    >
                      {/* الجانب الأيمن في الواجهة العربية: اسم الباقة والتفاصيل */}
                      <div className="space-y-0.5 text-right min-w-0 flex-1">
                        <span className="font-bold text-slate-800 dark:text-slate-200 block text-xs sm:text-sm truncate">
                          {item.wifiPackage.name}
                        </span>
                        <span className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 block">
                          <span>{item.wifiPackage.validity}</span> • <span dir="ltr" className="inline-block">{item.wifiPackage.dataSize}</span> • <span dir="ltr" className="inline-block">{item.wifiPackage.price.toFixed(2)}</span> <span className="inline-block">ر.ي/كرت</span>
                        </span>
                      </div>

                      {/* الجانب الأيسر في الواجهة العربية: السعر والكمية */}
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 px-2 py-0.5 rounded-md font-bold text-[11px] sm:text-xs">
                          x{item.quantity}
                        </span>
                        <span className="font-bold text-purple-600 dark:text-purple-400 text-xs sm:text-sm flex items-center gap-1">
                          <span className="text-[11px] font-semibold">ر.ي</span>
                          <span>{(item.wifiPackage.price * item.quantity).toFixed(2)}</span>
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pt-2.5 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs sm:text-sm text-slate-800 dark:text-slate-200 font-bold">
                  <span className="inline-flex items-center gap-1">
                    <span>المجموع النهائي</span>
                    <span>({totalCards === 1 ? 'كرت' : 'كروت'}</span>
                    <span>{totalCards})</span>
                  </span>
                  <span className="text-purple-600 dark:text-purple-400 text-sm sm:text-base font-extrabold flex items-center gap-1">
                    <span className="text-xs font-semibold">ريال يمني</span>
                    <span>{totalAmount.toFixed(2)}</span>
                  </span>
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {/* Page Content */}
      <div className="w-full">
        {children}
      </div>
    </div>
  );
}

export default function CheckoutLayout({ children, params }: { children: React.ReactNode, params: Promise<{ domain: string }> }) {
  // We use standard layout pattern. params.domain will be available.
  // Wait, params might be a promise in nextjs 15, let's just use use() hook if needed, but since it's a client component, we should probably unwrap it.
  const resolvedParams = React.use(params);

  return (
    <CheckoutProvider>
      <CheckoutLayoutInner domain={resolvedParams.domain}>
        {children}
      </CheckoutLayoutInner>
    </CheckoutProvider>
  );
}
