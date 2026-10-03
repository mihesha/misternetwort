'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCheckout } from '@/context/CheckoutContext';
import WalletSelector from '@/components/public/WalletSelector';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { Check, Copy, Hash, Info, ArrowLeft } from 'lucide-react';
import { UserAccount } from '@/types';

export default function CheckoutPaymentPage({ params }: { params: Promise<{ domain: string }> }) {
  const resolvedParams = React.use(params as any) as { domain: string };
  const domain = resolvedParams.domain;
  const router = useRouter();
  
  const { 
    cartItems, totalAmount, 
    selectedWallet, setSelectedWallet,
    transactionRef, setTransactionRef
  } = useCheckout();

  const [user, setUser] = useState<UserAccount | null>(null);
  const [copiedPin, setCopiedPin] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Clear transaction ref when landing on payment page (e.g. from back button)
    setTransactionRef('');
  }, [setTransactionRef]);

  useEffect(() => {
    // Check session storage directly to avoid race condition with context hydration
    const savedCart = sessionStorage.getItem('checkout_cart');
    if (!savedCart || JSON.parse(savedCart).length === 0) {
      router.push(`/n/${domain}`);
      return;
    }
    
    // Load user
    const savedUser = localStorage.getItem('cardbox_user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch {}
    }
  }, [domain, router]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedWallet) {
      setError('يرجى اختيار طريقة الدفع أولاً');
      return;
    }
    if (selectedWallet.id !== 'internal_wallet' && !transactionRef.trim()) {
      setError('يرجى إدخال الرقم المرجعي للتحويل');
      return;
    }
    
    setError(null);
    router.push(`/n/${domain}/checkout/verify`);
  };

  if (cartItems.length === 0) return null;

  return (
    <div className="bg-white dark:bg-purple-900/20 border border-slate-200/80 dark:border-purple-500/30 rounded-3xl p-5 sm:p-8 shadow-sm">
      <form className="space-y-6">
        <div className="space-y-3">
          <WalletSelector
            selectedWallet={null}
            onSelectWallet={(wallet) => {
              setSelectedWallet(wallet);
              router.push(`/n/${domain}/checkout/transaction`);
            }}
            totalAmount={totalAmount}
            user={user}
          />
        </div>
      </form>
    </div>
  );
}
