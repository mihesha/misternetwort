'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useCheckout } from '@/context/CheckoutContext';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { Check, Copy, Hash, Info, ArrowLeft, RefreshCw } from 'lucide-react';
import { UserAccount, GeneratedCard, OrderDetails } from '@/types';

export default function CheckoutTransactionPage({ params }: { params: Promise<{ domain: string }> }) {
  const resolvedParams = React.use(params as any) as { domain: string };
  const domain = resolvedParams.domain;
  const router = useRouter();
  
  const { 
    cartItems, totalAmount, totalCards,
    selectedWallet, setSelectedWallet,
    transactionRef, setTransactionRef,
    checkoutError, setCheckoutError,
    setOrderDetails,
    overpaymentData, setOverpaymentData
  } = useCheckout();

  const [user, setUser] = useState<UserAccount | null>(null);
  const [copiedPin, setCopiedPin] = useState<string | null>(null);
  
  const isRequesting = useRef(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Clear any lingering overpayment state or errors when landing on transaction page
    setOverpaymentData(null);
    setCheckoutError(null);
  }, [setOverpaymentData, setCheckoutError]);

  useEffect(() => {
    // Check session storage directly to avoid race condition with context hydration
    const savedCart = sessionStorage.getItem('checkout_cart');
    if (!savedCart || JSON.parse(savedCart).length === 0) {
      router.push(`/n/${domain}`);
      return;
    }

    // If no wallet is selected, go back to payment
    const savedWallet = sessionStorage.getItem('checkout_wallet');
    if (!selectedWallet && !savedWallet) {
        router.push(`/n/${domain}/checkout/payment`);
        return;
    }
    
    // Load user
    const savedUser = localStorage.getItem('cardbox_user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch {}
    }
  }, [domain, router, selectedWallet]);

  useEffect(() => {
    const handleAuthSuccess = () => {
      // Re-fetch user
      try {
        const savedUser = localStorage.getItem('cardbox_user');
        if (savedUser) setUser(JSON.parse(savedUser));
      } catch { }

      if (overpaymentData && overpaymentData.is_guest) {
        handlePurchase(true);
      }
    };
    window.addEventListener('auth_success', handleAuthSuccess as EventListener);
    return () => window.removeEventListener('auth_success', handleAuthSuccess as EventListener);
  }, [overpaymentData]);

  const handlePurchase = async (confirmOverpayment = false) => {
    if (isRequesting.current) return;
    isRequesting.current = true;
    setIsLoading(true);
    setCheckoutError(null);

    try {
      const savedUser = localStorage.getItem('cardbox_user');
      let currentToken = null;
      if (savedUser) {
        const parsed = JSON.parse(savedUser);
        if (parsed.token) currentToken = parsed.token;
      }

      if (cartItems.length === 0) throw new Error('Cart is empty');

      const itemsPayload = cartItems.map(item => ({
        category_id: item.wifiPackage.id,
        quantity: item.quantity
      }));

      const res = await fetch('/api/wallet/purchase-card', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(currentToken ? { 'Authorization': `Bearer ${currentToken}` } : {})
        },
        body: JSON.stringify({
          network_code: domain,
          items: itemsPayload,
          wallet_type: selectedWallet?.id || 'jaib',
          transaction_ref: transactionRef,
          confirm_overpayment: confirmOverpayment
        })
      });

      const data = await res.json();

      if (res.status === 400 && data.error === 'overpayment_warning') {
        setOverpaymentData(data);
        isRequesting.current = false;
        setIsLoading(false);
        return;
      }

      if (!res.ok) {
        throw new Error(data.error || 'فشلت عملية الشراء');
      }

      const generatedCards: GeneratedCard[] = (data.cards || []).map((c: any) => {
        const matchedItem = cartItems.find(i => Number(i.wifiPackage.id) === Number(c.card_category_id)) || cartItems[0];
        return {
          packageId: matchedItem.wifiPackage.id,
          packageName: matchedItem.wifiPackage.name,
          networkName: data.network || '',
          serialNumber: c.serial_number || 'N/A',
          pinCode: c.card_code || c.password || 'N/A',
          dataSize: matchedItem.wifiPackage.dataSize,
          duration: matchedItem.wifiPackage.duration,
          expireDate: matchedItem.wifiPackage.validity,
        };
      });

      const newOrder: OrderDetails = {
        orderId: `ORD-${Date.now().toString().slice(-6)}`,
        items: cartItems,
        totalAmount,
        totalCards,
        paymentMethod: selectedWallet!,
        senderPhone: '',
        senderName: 'عميل كارد بوكس',
        transactionRef,
        date: new Date().toLocaleString('ar-YE', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }),
        status: 'completed',
        generatedCards,
        networkLink: data.network_link,
      };

      setOrderDetails(newOrder);

      // Update user balance globally if returned
      if (data.new_wallet_balance !== undefined && data.new_wallet_balance !== null) {
        if (savedUser) {
          const parsed = JSON.parse(savedUser);
          parsed.wallet_balance = data.new_wallet_balance;
          localStorage.setItem('cardbox_user', JSON.stringify(parsed));
          window.dispatchEvent(new CustomEvent('cardbox_user_updated'));
        }
      }

      // Save order
      try {
        let storageKey = 'cardbox_orders_guest';
        if (savedUser) {
          const parsed = JSON.parse(savedUser);
          if (parsed.phone) {
            storageKey = `cardbox_orders_${parsed.phone}`;
          }
        }
        const savedOrders = localStorage.getItem(storageKey);
        let currentOrders = savedOrders ? JSON.parse(savedOrders) : [];
        currentOrders = [newOrder, ...currentOrders];
        localStorage.setItem(storageKey, JSON.stringify(currentOrders));
        window.dispatchEvent(new Event('cardbox_orders_updated'));
      } catch {}

      router.push(`/n/${domain}/checkout/receipt`);
    } catch (err: any) {
      setCheckoutError(err.message || 'حدث خطأ غير معروف');
      isRequesting.current = false;
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedWallet?.id !== 'internal_wallet' && (!transactionRef || transactionRef.length < 4)) {
      setCheckoutError(`يرجى إدخال ${selectedWallet?.inputLabel || "الرقم المرجعي"} المولد من تطبيق المحفظة`);
      return;
    }
    
    setCheckoutError(null);
    handlePurchase(false);
  };

  if (cartItems.length === 0 || !selectedWallet) return null;

  if (isLoading) {
    const isInternal = selectedWallet?.id === 'internal_wallet';
    
    return (
      <div className="bg-white dark:bg-purple-900/20 border border-slate-200/80 dark:border-purple-500/30 rounded-3xl p-5 sm:p-8 shadow-sm animate-slide-up">
        <div className="py-12 text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-400 flex items-center justify-center mx-auto animate-bounce">
            <RefreshCw className="w-8 h-8 animate-spin" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
              {isInternal 
                ? 'جاري إتمام الدفع وتوليد الكروت...'
                : 'جاري مطابقة عملية التحويل وتوليد الكروت...'}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mt-2 leading-relaxed">
              {isInternal 
                ? 'يرجى الانتظار بضع ثوانٍ بينما يقوم النظام بخصم المبلغ من رصيدك وإصدار بطاقاتك بشكل فوري.'
                : `يرجى الانتظار بضع ثوانٍ بينما يقوم النظام التلقائي بالتحقق من رقم السند (${transactionRef}) وبناء رمز الوصول الخاص بك.`}
            </p>
          </div>
        </div>
      </div>
    );
  }

  const walletDisplayName = selectedWallet.id === 'internal_wallet'
    ? selectedWallet.nameAr
    : selectedWallet.nameAr.replace(/^محفظة\s*/, '');

  return (
    <div className="space-y-4 sm:space-y-5 animate-slide-up relative">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-5">
          {/* Account Details Container */}
          <div className="relative p-6 sm:p-8 rounded-[2rem] space-y-5 shadow-sm border-2 border-purple-200 dark:border-purple-500/30 overflow-hidden group bg-purple-50 dark:bg-purple-900/20">
            <div className="relative z-20 flex items-center justify-between border-b border-purple-200 dark:border-purple-800/80 pb-4">
              <div className="flex items-center gap-3">
                <span className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center font-black text-lg shrink-0 shadow-md overflow-hidden">
                  {selectedWallet.icon && (selectedWallet.icon.startsWith('http') || selectedWallet.icon.startsWith('/')) ? (
                    <img src={selectedWallet.icon} alt={walletDisplayName} className="w-full h-full object-cover bg-white dark:bg-slate-800" />
                  ) : (
                    <Check className="w-6 h-6" />
                  )}
                </span>
                <div>
                  <h4 className="font-extrabold text-purple-950 dark:text-slate-100 text-base sm:text-lg tracking-wide">
                    {walletDisplayName}
                  </h4>
                  <span className="text-[11px] sm:text-xs text-purple-600 dark:text-purple-400 font-bold bg-white/50 dark:bg-white/10 px-2 py-0.5 rounded-full mt-1 inline-block border border-purple-100 dark:border-white/10">
                    تم اختيار طريقة الدفع
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setSelectedWallet(null);
                  router.push(`/n/${domain}/checkout/payment`);
                }}
                className="px-4 py-2 bg-white dark:bg-purple-900/20 hover:bg-slate-50 text-purple-600 dark:text-purple-300 border border-purple-200 dark:border-purple-500/40 text-xs font-bold rounded-xl transition-all cursor-pointer shadow-sm active:scale-95"
              >
                تغيير المحفظة
              </button>
            </div>

            <div className="relative z-20 space-y-3.5">
              {selectedWallet.id === 'internal_wallet' ? (
                <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-white dark:bg-slate-950 p-4 rounded-2xl border border-purple-100 dark:border-purple-800/80 shadow-sm gap-3 sm:gap-0">
                  <span className="font-bold text-slate-700 dark:text-slate-300 text-xs sm:text-sm">
                    الرصيد المتاح:
                  </span>
                  <span className="font-mono font-black text-emerald-600 dark:text-emerald-400 text-xl sm:text-2xl dir-ltr tracking-wider">
                    {user?.wallet_balance?.toFixed(2) || '0.00'} <span className="text-sm">ر.ي</span>
                  </span>
                </div>
              ) : (
                <>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-white dark:bg-slate-950 p-4 rounded-2xl border border-purple-100 dark:border-purple-800/80 shadow-sm gap-3 sm:gap-0">
                    <span className="font-bold text-slate-700 dark:text-slate-300 text-xs sm:text-sm">
                      رقم نقطة الدفع:
                    </span>
                    <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-3">
                      <span className="font-mono font-black text-purple-700 dark:text-purple-300 text-xl sm:text-2xl dir-ltr tracking-wider">
                        {selectedWallet.accountNumber}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(selectedWallet.accountNumber);
                          setCopiedPin(selectedWallet.accountNumber);
                          setTimeout(() => setCopiedPin(null), 2000);
                        }}
                        className="p-2.5 text-purple-500 hover:bg-purple-100 dark:hover:bg-purple-900/50 rounded-xl transition-all cursor-pointer border border-transparent"
                        title="نسخ رقم الحساب"
                      >
                        {copiedPin === selectedWallet.accountNumber ? (
                          <Check className="w-5 h-5 text-emerald-500 dark:text-emerald-400" />
                        ) : (
                          <Copy className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs sm:text-sm text-slate-600 dark:text-slate-400 px-2 font-medium">
                    <span>اسم نقطة الدفع:</span>
                    <span className="font-extrabold text-slate-800 dark:text-slate-200 text-sm sm:text-base">
                      {selectedWallet.accountName}
                    </span>
                  </div>

                  {selectedWallet.steps && selectedWallet.steps.length > 0 && (
                    <div className="pt-2 text-xs text-slate-600 dark:text-slate-400 space-y-1.5 px-2">
                      <p className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                        <Info className="w-3.5 h-3.5 text-purple-500 dark:text-purple-400 shrink-0" /> خطوات الدفع:
                      </p>
                      <ul className="list-disc list-inside space-y-1 pr-1 opacity-90">
                        {selectedWallet.steps.map((step, idx) => (
                          <li key={idx} className="leading-relaxed">{step}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </>
              )}

              <div className="flex items-center justify-between text-xs sm:text-sm text-slate-600 dark:text-slate-400 px-2 pt-3 border-t border-purple-200/50 dark:border-purple-800/50 font-medium">
                <span>المبلغ المطلوب {selectedWallet.id === 'internal_wallet' ? 'خصمه' : 'تحويله'}:</span>
                <span className="font-black text-purple-700 dark:text-amber-300 text-lg sm:text-xl inline-flex items-center gap-1.5">
                  <span>{totalAmount.toFixed(2)}</span>
                  <span className="text-xs font-semibold text-purple-600/80 dark:text-amber-300/80">ريال يمني</span>
                </span>
              </div>
            </div>
          </div>

          {/* Inputs Container (Phone & Transaction Reference) */}
          {selectedWallet.id !== 'internal_wallet' && (
            <div className="p-6 bg-white dark:bg-purple-900/20 border-2 border-slate-100 dark:border-purple-500/30 rounded-[2rem] space-y-5 shadow-sm">
              <h4 className="font-black text-slate-800 dark:text-slate-200 text-sm sm:text-base flex items-center gap-2">
                <Hash className="w-5 h-5 text-purple-500" />
                <span>بيانات عملية التحويل</span>
              </h4>

              <Input
                label={selectedWallet?.inputLabel || "الرقم المرجعي"}
                placeholder={`أدخل ${selectedWallet?.inputLabel || "الرقم المرجعي"}`}
                value={transactionRef}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTransactionRef(e.target.value)}
                leadingIcon={<Hash className="w-5 h-5 text-slate-400" />}
                helperText={`قم بلصق ${selectedWallet?.inputLabel || "الرقم المرجعي"} الذي نسخته بعد إتمام التحويل هنا`}
                className="bg-slate-50 dark:bg-slate-950/50 text-sm font-bold placeholder:text-sm placeholder:font-normal"
              />
            </div>
          )}

          {checkoutError && (
            <p className="text-sm font-bold text-red-600 bg-red-50 dark:bg-red-950/50 p-4 rounded-2xl border border-red-200 dark:border-red-800/50 flex items-center gap-2">
              <Info className="w-5 h-5 shrink-0" />
              <span>{checkoutError}</span>
            </p>
          )}

          {/* Submit CTA */}
          <div className="pt-2">
            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black py-4 sm:py-5 rounded-3xl text-base sm:text-lg shadow-xl shadow-purple-600/20 cursor-pointer active:scale-95 transition-all relative overflow-hidden group"
            >
              <div className="absolute inset-0 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12" />
              <span className="relative z-10 flex items-center justify-center gap-2">
                <span>تأكيد وإرسال طلب الشراء</span>
                <ArrowLeft className="w-5 h-5" />
              </span>
            </Button>
          </div>
        </div>
      </form>

      {/* OVERPAYMENT POPUP OVERLAY (Renders on top of the form) */}
      {overpaymentData && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn text-right dir-rtl">
          <div className="bg-white dark:bg-purple-900/20 rounded-3xl p-6 sm:p-8 max-w-sm w-full shadow-2xl border border-amber-200 dark:border-purple-500/30 text-center space-y-5 animate-slide-up">
            <div className="w-16 h-16 bg-amber-100 dark:bg-amber-900/50 rounded-full flex items-center justify-center mx-auto mb-2 text-amber-600 dark:text-amber-400">
              <Info className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-black text-slate-900 dark:text-slate-100">
              تنبيه: إيداع زائد
            </h3>

            {overpaymentData.is_guest ? (
              <div className="space-y-3 text-sm text-slate-600 dark:text-slate-300">
                <p>
                  لقد قمت بإيداع مبلغ <strong className="text-amber-600 dark:text-amber-400">{overpaymentData.deposited_amount} ر.ي</strong> وهو أكبر من قيمة الكرت المطلوب (<strong className="text-slate-800 dark:text-slate-200">{overpaymentData.card_price} ر.ي</strong>).
                </p>
                <p className="font-bold text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/30 p-3 rounded-xl border border-purple-100 dark:border-purple-800">
                  يرجى تسجيل الدخول أو إنشاء حساب لكي يتم حفظ المبلغ المتبقي ({overpaymentData.remaining_amount} ر.ي) في محفظتك لدينا!
                </p>
              </div>
            ) : (
              <div className="space-y-3 text-sm text-slate-600 dark:text-slate-300">
                <p>
                  لقد قمت بإيداع مبلغ <strong className="text-amber-600 dark:text-amber-400">{overpaymentData.deposited_amount} ر.ي</strong>.
                </p>
                <p>
                  سيتم خصم قيمة الكرت (<strong className="text-slate-800 dark:text-slate-200">{overpaymentData.card_price} ر.ي</strong>) والمبلغ المتبقي (<strong className="text-emerald-600 dark:text-emerald-400 font-bold">{overpaymentData.remaining_amount} ر.ي</strong>) سيتم إيداعه تلقائياً لمحفظتك!
                </p>
              </div>
            )}

            <div className="pt-4 flex flex-col gap-3">
              {overpaymentData.is_guest ? (
                <Button
                  variant="primary"
                  className="w-full bg-purple-600 hover:bg-purple-700 font-bold py-3 rounded-xl"
                  onClick={() => {
                    window.dispatchEvent(new CustomEvent('open_auth', { detail: 'login' }));
                  }}
                >
                  تسجيل الدخول / إنشاء حساب
                </Button>
              ) : (
                <Button
                  variant="primary"
                  className="w-full bg-emerald-600 hover:bg-emerald-700 font-bold py-3 rounded-xl"
                  onClick={() => handlePurchase(true)}
                >
                  موافق، إتمام الشراء
                </Button>
              )}
              
              <button
                type="button"
                onClick={() => setOverpaymentData(null)}
                className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 text-sm font-semibold transition-colors mt-2"
              >
                إلغاء العملية
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
