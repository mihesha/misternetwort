'use client';

import React, { useState, useEffect } from 'react';
import {
  ShoppingCart,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  ArrowLeft,
  Copy,
  Check,
  Printer,
  ShieldCheck,
  RefreshCw,
  Zap,
  Info,
  Phone,
  Hash,
  Globe,
} from 'lucide-react';
import Modal from '@/components/common/Modal';
import Button from '@/components/common/Button';
import Input from '@/components/common/Input';
import StepProgress from '@/components/public/StepProgress';
import WalletSelector from '@/components/public/WalletSelector';
import { CartItem, OrderStep, WalletOption, GeneratedCard, OrderDetails, UserAccount } from '@/types';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  totalAmount: number;
  totalCards: number;
  onClearCart: () => void;
  onOrderComplete?: (order: OrderDetails) => void;
  networkCode?: string;
  onOpenAuth?: (mode: 'login' | 'register') => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  cartItems,
  totalAmount,
  totalCards,
  onClearCart,
  onOrderComplete,
  networkCode,
  onOpenAuth
}) => {
  const [user, setUser] = useState<UserAccount | null>(null);
  const [overpaymentData, setOverpaymentData] = useState<any>(null);
  const [step, setStep] = useState<OrderStep>('payment');
  const [selectedWallet, setSelectedWallet] = useState<WalletOption | null>(null);
  const [isSummaryOpen, setIsSummaryOpen] = useState(true);
  const [transactionRef, setTransactionRef] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedPin, setCopiedPin] = useState<string | null>(null);
  const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null);

  useEffect(() => {
    if (isOpen) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      try {
        const savedUser = localStorage.getItem('cardbox_user');
        if (savedUser) setUser(JSON.parse(savedUser));
      } catch {}
    }
  }, [isOpen, step, selectedWallet]);

  const handleSelectWallet = (wallet: WalletOption) => {
    setSelectedWallet(wallet);
    setError('');
    setIsSummaryOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 20);
  };

  const handleProceedToVerification = (e?: React.FormEvent, confirmOverpayment = false) => {
    if (e) e.preventDefault();
    if (!selectedWallet) {
      setError('يرجى اختيار طريقة الدفع أولاً');
      return;
    }
    const isInternal = selectedWallet.id === 'internal_wallet';
    if (!isInternal && (!transactionRef || transactionRef.length < 4)) {
      setError('يرجى إدخال رقم مرجع العملية المولد من تطبيق المحفظة');
      return;
    }

    setError('');
    setIsLoading(true);
    setOverpaymentData(null);
    setStep('verification');

    // Call actual backend API
    const purchaseCard = async () => {
      try {
        if (!networkCode) throw new Error('Network code missing');
        if (cartItems.length === 0) throw new Error('Cart is empty');
        
        // We currently support buying 1 type of card per transaction in the backend
        const item = cartItems[0]; 

        let currentToken = user?.token;
        if (!currentToken) {
          try {
            const savedUser = localStorage.getItem('cardbox_user');
            if (savedUser) currentToken = JSON.parse(savedUser).token;
          } catch {}
        }

        const res = await fetch('/api/wallet/purchase-card', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(currentToken ? { 'Authorization': `Bearer ${currentToken}` } : {})
          },
          body: JSON.stringify({
            network_code: networkCode,
            category_id: item.wifiPackage.id,
            quantity: item.quantity,
            wallet_type: selectedWallet?.id || 'jaib',
            transaction_ref: transactionRef,
            confirm_overpayment: confirmOverpayment
          })
        });

        const data = await res.json();
        
        if (res.status === 400 && data.error === 'overpayment_warning') {
          setOverpaymentData(data);
          setStep('payment');
          setIsLoading(false);
          return;
        }

        if (!res.ok) {
          throw new Error(data.error || 'فشلت عملية الشراء');
        }

        const generatedCards: GeneratedCard[] = (data.cards || []).map((c: any) => ({
            packageId: item.wifiPackage.id,
            packageName: item.wifiPackage.name,
            serialNumber: c.serial_number,
            pinCode: c.card_code,
            dataSize: item.wifiPackage.dataSize,
            duration: item.wifiPackage.duration,
            expireDate: item.wifiPackage.validity,
        }));

        const newOrder: OrderDetails = {
          orderId: `ORD-${Date.now().toString().slice(-6)}`,
          items: cartItems,
          totalAmount,
          totalCards,
          paymentMethod: selectedWallet as WalletOption,
          senderPhone: '',
          senderName: 'عميل كارد بوكس',
          transactionRef,
          date: new Date().toLocaleString('ar-YE'),
          status: 'completed',
          generatedCards,
        };

        setOrderDetails(newOrder);
        if (onOrderComplete) {
          onOrderComplete(newOrder);
        }

        setIsLoading(false);
        setStep('receipt');
        onClearCart();
      } catch (err: any) {
        setError(err.message || 'حدث خطأ غير معروف');
        setStep('payment');
        setIsLoading(false);
      }
    };
    
    purchaseCard();
  };

  const handleCopyPin = (pin: string) => {
    navigator.clipboard.writeText(pin);
    setCopiedPin(pin);
    setTimeout(() => setCopiedPin(null), 2500);
  };

  const handlePrint = () => {
    window.print();
  };

  if (!isOpen) return null;

  return (
    <div dir="rtl" className="space-y-4 sm:space-y-6 text-right max-w-4xl mx-auto pb-12 animate-fadeIn">
      {/* Show Step Progress & Order Summary ONLY when no wallet is selected or when not in payment step */}
      {!selectedWallet && (
        <>
          {/* Step Progress Bar with Back Button */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-4 sm:p-5 shadow-sm space-y-2">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={onClose}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-xl transition-all border border-slate-200/60 dark:border-slate-700 active:scale-95"
              >
                <ArrowRight className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                <span>رجوع للرئيسية</span>
              </button>
              <span className="font-extrabold text-xs sm:text-sm text-slate-800 dark:text-slate-200">
                متابعة وإكمال عملية الشراء
              </span>
            </div>
            <StepProgress currentStep={step} />
          </div>

          {/* ORDER SUMMARY ACCORDION CARD */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm transition-all">
            <button
              type="button"
              onClick={() => setIsSummaryOpen(!isSummaryOpen)}
              className="w-full p-3.5 sm:p-4 flex items-center justify-between bg-purple-50/50 dark:bg-purple-950/20 hover:bg-purple-100/50 dark:hover:bg-purple-900/30 transition-colors"
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
                {isSummaryOpen ? (
                  <ChevronUp className="w-4 h-4 text-slate-400 shrink-0" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                )}
              </div>
            </button>

            {isSummaryOpen && (
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

      {/* Main Payment Step Card */}
      <div className={selectedWallet ? "space-y-4 sm:space-y-5 animate-slide-up" : "bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-5 sm:p-8 shadow-sm"}>
        {/* STEP 2: PAYMENT METHOD & DETAILS FORM */}
        {step === 'payment' && (
          <form onSubmit={handleProceedToVerification} className="space-y-6">
            {!selectedWallet ? (
              /* Wallet Selection Grid (Shown when no wallet is selected) */
              <div className="space-y-3">
                <WalletSelector
                  selectedWallet={selectedWallet}
                  onSelectWallet={handleSelectWallet}
                  totalAmount={totalAmount}
                  user={user}
                />
              </div>
            ) : (
              /* When wallet is selected: Wallet selector hides, showing Account Details Container followed by Inputs Container */
              <div className="space-y-5 animate-slide-up">
                {/* 1. Account Details Container */}
                {(() => {
                  const walletDisplayName = selectedWallet.nameAr.startsWith('محفظة')
                    ? selectedWallet.nameAr
                    : `محفظة ${selectedWallet.nameAr}`;

                  return (
                    <div className="p-5 bg-gradient-to-b from-purple-950/40 via-purple-950/30 to-slate-900/90 dark:from-purple-950/60 dark:to-slate-950/90 border-2 border-purple-500/50 dark:border-purple-500/60 rounded-3xl space-y-4 shadow-xl">
                      <div className="flex items-center justify-between border-b border-purple-500/30 dark:border-purple-800/80 pb-3">
                        <div className="flex items-center gap-2.5">
                          <span className="w-8 h-8 rounded-full bg-purple-600 text-white flex items-center justify-center font-black text-sm shrink-0 shadow-md">
                            ✓
                          </span>
                          <div>
                            <h4 className="font-extrabold text-slate-900 dark:text-slate-100 text-sm sm:text-base">
                              {walletDisplayName}
                            </h4>
                            <span className="text-[11px] sm:text-xs text-purple-600 dark:text-purple-400 font-bold">
                              تم اختيار طريقة الدفع
                            </span>
                          </div>
                        </div>

                        {/* Button to change wallet / show wallet selector again */}
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedWallet(null);
                            setIsSummaryOpen(true);
                          }}
                          className="px-3.5 py-1.5 bg-slate-900/90 dark:bg-slate-900 hover:bg-slate-800 text-purple-400 dark:text-purple-300 border border-purple-500/40 text-xs font-bold rounded-xl transition-all cursor-pointer shadow-2xs active:scale-95"
                        >
                          تغيير المحفظة
                        </button>
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center justify-between bg-slate-950/80 dark:bg-slate-950 p-3.5 rounded-2xl border border-purple-500/40 dark:border-purple-800/80 shadow-inner">
                          <span className="font-bold text-slate-200 dark:text-slate-300 text-xs sm:text-sm">
                            رقم حساب {walletDisplayName}:
                          </span>
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-black text-purple-300 text-lg sm:text-xl dir-ltr">
                              {selectedWallet.accountNumber}
                            </span>
                            <button
                              type="button"
                              onClick={() => {
                                navigator.clipboard.writeText(selectedWallet.accountNumber);
                                setCopiedPin(selectedWallet.accountNumber);
                                setTimeout(() => setCopiedPin(null), 2000);
                              }}
                              className="p-1.5 text-purple-400 hover:bg-purple-900/50 rounded-lg transition-all cursor-pointer"
                              title="نسخ رقم الحساب"
                            >
                              {copiedPin === selectedWallet.accountNumber ? (
                                <Check className="w-4 h-4 text-emerald-400" />
                              ) : (
                                <Copy className="w-4 h-4" />
                              )}
                            </button>
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-xs sm:text-sm text-slate-400 dark:text-slate-400 px-1 font-medium">
                          <span>اسم الحساب المستلم:</span>
                          <span className="font-extrabold text-slate-100 dark:text-slate-200">
                            {selectedWallet.accountName}
                          </span>
                        </div>

                        <div className="flex items-center justify-between text-xs sm:text-sm text-slate-400 dark:text-slate-400 px-1 pt-1 border-t border-purple-500/20 dark:border-purple-800/50 font-medium">
                          <span>المبلغ المطلوب تحويله:</span>
                          <span className="font-black text-purple-400 text-base sm:text-lg inline-flex items-center gap-1">
                            <span>{totalAmount.toFixed(2)}</span>
                            <span className="text-xs font-semibold">ريال يمني</span>
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })()}

                {/* 2. Inputs Container (Phone & Transaction Reference) */}
                {selectedWallet.id !== 'internal_wallet' && (
                  <div className="p-5 bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-4 animate-slide-up">
                    <h4 className="font-bold text-slate-900 dark:text-slate-100 text-xs sm:text-sm border-b border-slate-200 dark:border-slate-800 pb-2">
                      بيانات عملية التحويل
                    </h4>

                    <Input
                      label="رقم مرجع العملية"
                      placeholder="أدخل رقم العملية المولد من المحفظة (مثال: 9812401)"
                      value={transactionRef}
                      onChange={(e) => setTransactionRef(e.target.value)}
                      leadingIcon={<Hash className="w-4 h-4" />}
                      helperText="ستجد رقم مرجع العملية في الرسالة النصية أو إشعار التحويل المباشر"
                    />
                  </div>
                )}

                {error && (
                  <p className="text-xs sm:text-sm font-bold text-red-500 bg-red-50 dark:bg-red-950/50 p-4 rounded-xl border border-red-200 dark:border-red-800">
                    {error}
                  </p>
                )}

                {/* Submit CTA */}
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-4 rounded-2xl text-base shadow-lg shadow-purple-600/30 cursor-pointer"
                >
                  تأكيد وإرسال طلب الشراء
                </Button>
              </div>
            )}
          </form>
        )}

        {/* OVERPAYMENT POPUP */}
        {overpaymentData && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn">
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 max-w-sm w-full shadow-2xl border border-amber-200 dark:border-amber-800 text-center space-y-5 animate-slide-up">
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
                      setOverpaymentData(null);
                      onClose();
                      if (onOpenAuth) onOpenAuth('login');
                      else window.dispatchEvent(new CustomEvent('open_auth', { detail: 'login' }));
                    }}
                  >
                    تسجيل الدخول / إنشاء حساب
                  </Button>
                ) : (
                  <Button
                    variant="primary"
                    className="w-full bg-emerald-600 hover:bg-emerald-700 font-bold py-3 rounded-xl"
                    onClick={() => handleProceedToVerification(undefined, true)}
                  >
                    موافق، إتمام الشراء
                  </Button>
                )}
                
                <button
                  type="button"
                  onClick={() => setOverpaymentData(null)}
                  className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 text-sm font-semibold transition-colors"
                >
                  إلغاء العملية
                </button>
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: VERIFICATION LOADING SCREEN */}
        {step === 'verification' && (
          <div className="py-12 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-400 flex items-center justify-center mx-auto animate-bounce">
              <RefreshCw className="w-8 h-8 animate-spin" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                جاري مطابقة عملية التحويل وتوليد الكروت...
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                يرجى الانتظار بضع ثوانٍ بينما يقوم النظام التلقائي بالتحقق من رقم السند ({transactionRef}) وبناء رمز الوصول الخاص بك.
              </p>
            </div>
          </div>
        )}

        {/* STEP 4: RECEIPT & GENERATED PIN CODES */}
        {step === 'receipt' && orderDetails && (
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

            {/* Generated Cards Display Grid */}
            <div className="space-y-4 max-h-96 overflow-y-auto no-scrollbar pr-1">
              {orderDetails.generatedCards.map((card, idx) => (
                <div
                  key={idx}
                  className="bg-gradient-to-br from-purple-900 to-indigo-950 text-white p-6 rounded-3xl shadow-xl relative overflow-hidden border border-purple-500/30"
                >
                  <div className="flex items-center justify-between border-b border-purple-700/50 pb-3 mb-3">
                    <div className="flex items-center gap-2">
                      <Zap className="w-5 h-5 text-amber-400" />
                      <span className="font-extrabold text-base">{card.packageName}</span>
                    </div>
                    <span className="text-xs bg-purple-800/80 px-3 py-1 rounded-full text-purple-200 font-mono">
                      {card.serialNumber}
                    </span>
                  </div>

                  {/* PIN Display */}
                  <div className="bg-black/40 backdrop-blur-md p-5 rounded-2xl text-center my-4 border border-purple-400/20">
                    <span className="text-xs text-purple-300 block mb-1 font-semibold">رمز الكرت (رمز الدخول):</span>
                    <span className="text-2xl sm:text-3xl font-mono font-black tracking-wider text-amber-300 select-all">
                      {card.pinCode.replace(/-/g, '')}
                    </span>
                  </div>

                  {/* Card Specs */}
                  <div className="flex items-center justify-between text-xs sm:text-sm text-purple-200 pt-1">
                    <span>الحجم: <strong className="text-white inline-flex items-center gap-1"><span>{card.dataSize.split(' ')[1]}</span><span>{card.dataSize.split(' ')[0]}</span></strong></span>
                    <span>المدة: <strong className="text-white" dir="auto">{card.duration}</strong></span>
                    <span>الصلاحية: <strong className="text-white" dir="auto">{card.expireDate}</strong></span>
                  </div>

                  {/* Copy Button */}
                  <div className="mt-4 pt-3 border-t border-purple-700/50 flex items-center justify-between">
                    <button
                      onClick={() => handleCopyPin(card.pinCode)}
                      className="w-full py-3 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 transition-all active:scale-98 shadow-md"
                    >
                      {copiedPin === card.pinCode ? (
                        <>
                          <Check className="w-4 h-4 text-slate-950" />
                          <span>تم نسخ الرمز بنجاح!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4" />
                          <span>نسخ رمز الكرت</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Wi-Fi Instructions */}
            <div className="p-4 bg-slate-100 dark:bg-slate-900 rounded-2xl text-xs sm:text-sm text-slate-600 dark:text-slate-400 space-y-2 border border-slate-200 dark:border-slate-800">
              <p className="font-bold text-slate-900 dark:text-slate-200 flex items-center gap-1.5">
                <Info className="w-4 h-4 text-purple-600" />
                <span>كيفية الاستخدام:</span>
              </p>
              <ol className="list-decimal list-inside space-y-1 text-slate-600 dark:text-slate-400 pr-2">
                <li>اتصل بشبكة الواي فاي المحلية الخاصة بك.</li>
                <li>ستظهر لك صفحة تسجيل الدخول تلقائياً (أو افتح أي موقع في المتصفح).</li>
                <li>أدخل رمز الكرت المنسوخ أعلاه واضغط على تسجيل الدخول.</li>
              </ol>
            </div>

            {/* Actions */}
            <div className="pt-2">
              <Button
                variant="primary"
                size="lg"
                onClick={() => {
                  // You can redirect to the network's local login page if needed.
                  onClose();
                }}
                icon={<Globe className="w-5 h-5" />}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white font-extrabold py-4 rounded-2xl text-base shadow-lg shadow-purple-600/30 flex items-center justify-center gap-2 cursor-pointer active:scale-98 transition-all"
              >
                الانتقال لصفحة الشبكة
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CheckoutModal;
