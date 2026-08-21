'use client';

import React, { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import PurchasesPage from '@/components/public/PurchasesPage';
import { UserAccount, OrderDetails } from '@/types';

export default function PurchasesRoute({ params }: { params: Promise<{ domain: string }> }) {
  const resolvedParams = use(params);
  const domain = resolvedParams.domain;
  const router = useRouter();

  const [user, setUser] = useState<UserAccount | null>(null);
  const [orders, setOrders] = useState<OrderDetails[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const savedUser = localStorage.getItem('cardbox_user');
        let parsedUser = null;
        if (savedUser) {
          parsedUser = JSON.parse(savedUser);
          setUser(parsedUser);
        }

        let fetchedOrders: OrderDetails[] = [];

        // If the user is logged in, fetch from the backend API
        if (parsedUser && parsedUser.token) {
           const res = await fetch('/api/customer/purchases', {
             headers: { 'Authorization': `Bearer ${parsedUser.token}` }
           });
           if (res.ok) {
             const data = await res.json();
             if (data.purchases && data.purchases.length > 0) {
                fetchedOrders.push({
                   orderId: 'API-ORDERS',
                   status: 'completed',
                   date: '',
                   items: [],
                   totalAmount: 0,
                   totalCards: data.purchases.length,
                   paymentMethod: null,
                   senderPhone: '',
                   senderName: '',
                   transactionRef: '',
                   generatedCards: data.purchases
                });
             }
           }
        }
        
        const storageKey = `cardbox_orders_${parsedUser?.phone || 'guest'}`;
        const savedOrders = localStorage.getItem(storageKey);
        let localOrders: OrderDetails[] = [];
        
        if (savedOrders) {
          localOrders = JSON.parse(savedOrders);
        } else {
          // Migration from old generic key
          const oldOrders = localStorage.getItem('cardbox_orders');
          if (oldOrders) {
            localStorage.setItem(storageKey, oldOrders);
            localStorage.removeItem('cardbox_orders');
            localOrders = JSON.parse(oldOrders);
          }
        }

        // Merge API orders and Local orders without duplicating PINs
        const apiPins = new Set();
        fetchedOrders.forEach(o => o.generatedCards.forEach(c => apiPins.add(c.pinCode)));

        const filteredLocalOrders = localOrders.map(o => {
           return {
              ...o,
              generatedCards: o.generatedCards.filter(c => !apiPins.has(c.pinCode))
           }
        }).filter(o => o.generatedCards.length > 0);

        setOrders([...fetchedOrders, ...filteredLocalOrders]);
      } catch (e) {
        console.error('Failed to load user or orders', e);
      } finally {
        setLoading(false);
      }
    };

    loadData();

    const handleUpdate = () => loadData();
    window.addEventListener('cardbox_orders_updated', handleUpdate);
    window.addEventListener('cardbox_user_updated', handleUpdate);

    return () => {
      window.removeEventListener('cardbox_orders_updated', handleUpdate);
      window.removeEventListener('cardbox_user_updated', handleUpdate);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('cardbox_user');
    window.dispatchEvent(new Event('cardbox_user_updated'));
    router.push(`/${domain}`);
  };

  const handleNavigate = (path: string) => {
    router.push(`/${domain}${path === 'home' ? '' : '/' + path}`);
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">جاري التحميل...</div>;
  }

  // If we want this to take over the whole screen over layout, we might need some CSS tricks,
  // but let's render PurchasesPage. PurchasesPage already has a header, so it will look like a standalone app.
  return (
    <div className="fixed inset-0 z-[100] bg-slate-50 dark:bg-slate-950 overflow-y-auto">
      <PurchasesPage
        user={user}
        orders={orders}
        onNavigate={handleNavigate}
        onLogout={handleLogout}
      />
    </div>
  );
}
