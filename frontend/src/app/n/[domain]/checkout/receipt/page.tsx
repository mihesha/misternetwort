'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCheckout } from '@/context/CheckoutContext';
import { Button } from '@/components/common/Button';
import { Check, Copy, Printer, Globe, Wifi } from 'lucide-react';

export default function CheckoutReceiptPage({ params }: { params: Promise<{ domain: string }> }) {
  const resolvedParams = React.use(params as any) as { domain: string };
  const domain = resolvedParams.domain;
  const router = useRouter();
  
  const { orderDetails, setOrderDetails, setCartItems } = useCheckout();
  const [copiedPin, setCopiedPin] = useState<string | null>(null);

  useEffect(() => {
    // If no order details, redirect to home
    const savedOrderDetails = sessionStorage.getItem('checkout_order_details');
    if (!orderDetails && !savedOrderDetails) {
      router.replace(`/n/${domain}`);
      return;
    }

    // Purchase is complete! Clear the cart so going back is impossible
    // Any previous page will automatically redirect to home if cart is empty
    setCartItems([]);
    sessionStorage.removeItem('checkout_cart');
    sessionStorage.removeItem('checkout_wallet');
    sessionStorage.removeItem('checkout_tx_ref');
  }, [orderDetails, domain, router, setCartItems]);

  const handleCopyPin = (pin: string) => {
    navigator.clipboard.writeText(pin);
    setCopiedPin(pin);
    setTimeout(() => setCopiedPin(null), 2500);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleFinish = () => {
    if (orderDetails?.networkLink) {
      let link = orderDetails.networkLink;
      if (!link.startsWith('http://') && !link.startsWith('https://')) {
        link = 'http://' + link;
      }
      // Clear cart on finish
      setCartItems([]);
      sessionStorage.removeItem('checkout_cart');
      window.location.href = link;
    } else {
      setCartItems([]);
      sessionStorage.removeItem('checkout_cart');
      router.push(`/n/${domain}`);
    }
  };

  if (!orderDetails) return null;

  return (
    <div className="space-y-5">
      <div className="p-5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-2xl text-center space-y-1">
        <div className="w-12 h-12 rounded-full bg-emerald-500 text-white flex items-center justify-center mx-auto shadow-sm">
          <Check className="w-7 h-7 stroke-[3]" />
        </div>
        <h3 className="text-xl font-black text-emerald-800 dark:text-emerald-300">
          تمت عملية الشراء بنجاح!
        </h3>
        <p className="text-xs sm:text-sm text-emerald-600 dark:text-emerald-400">
          رقم الطلب: <span className="font-mono font-bold">{orderDetails.orderId}</span> • التاريخ: {orderDetails.date}
        </p>
      </div>

      <div className="space-y-4 max-h-[60vh] overflow-y-auto no-scrollbar pb-2">
        {orderDetails.generatedCards.map((card, idx) => (
          <div key={idx} className="bg-white dark:bg-purple-900/20 border border-slate-200 dark:border-purple-500/30 rounded-2xl p-4 shadow-sm relative overflow-hidden flex flex-col gap-4">
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 dark:bg-purple-500/5 blur-3xl rounded-full pointer-events-none" />

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 relative z-10">
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <div className="w-12 h-12 rounded-xl bg-purple-50 dark:bg-purple-900/30 flex items-center justify-center border border-purple-100 dark:border-purple-800/50 shrink-0">
                  <Wifi className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div className="text-right">
                  <h4 className="font-black text-slate-800 dark:text-slate-100 text-base sm:text-lg">
                    {card.networkName && <span className="text-purple-600 dark:text-purple-400 font-bold ml-1">{card.networkName} -</span>}
                    {card.packageName}
                  </h4>
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mt-0.5 text-[11px] sm:text-xs text-slate-500 font-bold">
                    <span className="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">{card.dataSize}</span>
                    <span className="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">{card.duration}</span>
                    <span className="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">{card.expireDate}</span>
                  </div>
                </div>
              </div>

              <div className="text-left w-full sm:w-auto pr-14 sm:pr-0 -mt-1 sm:mt-0">
                <span className="text-[10px] bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 px-2 py-1 rounded-md text-slate-500 font-mono tracking-wider">
                  S/N: {card.serialNumber}
                </span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 relative z-10">
              <div className="flex-1 bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 flex items-center justify-between group">
                <span className="text-[10px] text-slate-400 font-bold uppercase hidden sm:block">PIN</span>
                <span className="text-xl sm:text-2xl font-mono font-black tracking-widest text-slate-900 dark:text-slate-100 select-all mx-auto sm:mx-0">{card.pinCode.replace(/-/g, '')}</span>
              </div>

              <Button
                onClick={() => handleCopyPin(card.pinCode)}
                variant="primary"
                className={`sm:w-auto w-full h-12 px-6 font-bold rounded-xl text-sm transition-all shadow-md shrink-0 flex items-center justify-center gap-2 ${copiedPin === card.pinCode ? 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-500/20' : 'bg-purple-600 hover:bg-purple-700 text-white shadow-purple-600/20'}`}
              >
                {copiedPin === card.pinCode ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>تم النسخ</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>نسخ الرمز</span>
                  </>
                )}
              </Button>
            </div>
          </div>
        ))}
      </div>

      <div className="pt-2">
        <Button
          variant="primary"
          size="lg"
          onClick={handleFinish}
          icon={<Globe className="w-5 h-5" />}
          className="w-full bg-purple-600 hover:bg-purple-700 text-white font-extrabold py-4 rounded-2xl text-base shadow-lg shadow-purple-600/30 flex items-center justify-center gap-2 cursor-pointer active:scale-98 transition-all"
        >
          الانتقال لصفحة الشبكة
        </Button>
      </div>
    </div>
  );
}
