'use client';

import React, { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import BannerGuide from '@/components/public/BannerGuide';
import CardItem from '@/components/public/CardItem';
import CheckoutBar from '@/components/public/CheckoutBar';
import GuideModal from '@/components/public/GuideModal';
import { CartItem, UserAccount, OrderDetails, WifiCardPackage } from '@/types';

export default function HomePage({ params }: { params: Promise<{ domain: string }> }) {
  const resolvedParams = use(params);
  const domain = resolvedParams.domain;

  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [packages, setPackages] = useState<WifiCardPackage[]>([]);
  const [loading, setLoading] = useState(true);

  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  const router = useRouter();

  useEffect(() => {
    // Fetch packages for this network domain
    const fetchPackages = async () => {
      try {
        const res = await fetch(`/api/networks/${domain}/packages`);
        if (res.ok) {
          const data = await res.json();
          setPackages(data);
        } else {
          setPackages([]);
        }
      } catch (e) {
        console.error('Failed to fetch packages:', e);
        setPackages([]);
      } finally {
        setLoading(false);
      }
    };
    fetchPackages();
  }, [domain]);

  const handleUpdateQuantity = (id: string, delta: number) => {
    setQuantities((prev) => {
      const current = prev[id] || 0;
      const updated = Math.max(0, current + delta);
      return { ...prev, [id]: updated };
    });
  };

  // Compute Cart Items
  const cartItems: CartItem[] = packages.filter(
    (pkg) => (quantities[pkg.id] || 0) > 0
  ).map((pkg) => ({
    packageId: pkg.id,
    wifiPackage: pkg,
    quantity: quantities[pkg.id],
  }));

  const totalCards = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const totalPrice = cartItems.reduce(
    (acc, item) => acc + item.wifiPackage.price * item.quantity,
    0
  );

  const handleProceedToCheckout = () => {
    sessionStorage.setItem('checkout_cart', JSON.stringify(cartItems));
    sessionStorage.setItem('checkout_domain', domain);
    router.push(`/n/${domain}/checkout/payment`);
  };

  if (loading) {
    return <div className="text-center py-20 text-slate-500">جاري تحميل باقات الإنترنت...</div>;
  }

  return (
    <div dir="rtl" className="space-y-6 pb-24 text-right animate-fadeIn">
      {/* How-To-Buy Banner Guide Notice */}
      <BannerGuide onOpenGuide={() => setIsGuideOpen(true)} />

      {/* Cards Catalog Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-base sm:text-2xl font-black text-slate-900 dark:text-slate-100 whitespace-nowrap shrink-0">
            كروت الإنترنت المتاحة
          </h2>
          <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold truncate text-left">
            {packages.length > 0 ? "حدد الكمية المطلوبة واضغط متابعة الشراء" : "لا توجد باقات متاحة حالياً"}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-2.5 sm:gap-5">
          {packages.map((pkg) => (
            <CardItem
              key={pkg.id}
              cardPackage={pkg}
              quantity={quantities[pkg.id] || 0}
              onUpdateQuantity={handleUpdateQuantity}
            />
          ))}
        </div>
      </div>

      {/* Bottom Sticky Purchase Bar */}
      <CheckoutBar
        totalCards={totalCards}
        totalPrice={totalPrice}
        onProceed={handleProceedToCheckout}
      />

      {/* Guide Modal */}
      <GuideModal
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
        onStartShopping={() => setIsGuideOpen(false)}
      />
    </div>
  );
}
