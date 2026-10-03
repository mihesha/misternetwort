'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { CartItem, WalletOption, OrderDetails, UserAccount } from '@/types';

interface CheckoutContextType {
  cartItems: CartItem[];
  setCartItems: (items: CartItem[]) => void;
  totalAmount: number;
  totalCards: number;
  networkCode: string;
  setNetworkCode: (code: string) => void;
  selectedWallet: WalletOption | null;
  setSelectedWallet: (wallet: WalletOption | null) => void;
  transactionRef: string;
  setTransactionRef: (ref: string) => void;
  orderDetails: OrderDetails | null;
  setOrderDetails: (details: OrderDetails | null) => void;
  overpaymentData: any;
  setOverpaymentData: (data: any) => void;
  checkoutError: string | null;
  setCheckoutError: (error: string | null) => void;
}

const CheckoutContext = createContext<CheckoutContextType | undefined>(undefined);

export const CheckoutProvider = ({ children }: { children: React.ReactNode }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = sessionStorage.getItem('checkout_cart');
      if (saved) return JSON.parse(saved);
    }
    return [];
  });
  
  const [networkCode, setNetworkCode] = useState(() => {
    if (typeof window !== 'undefined') {
      return sessionStorage.getItem('checkout_domain') || '';
    }
    return '';
  });
  
  const [selectedWallet, setSelectedWallet] = useState<WalletOption | null>(() => {
    if (typeof window !== 'undefined') {
      const saved = sessionStorage.getItem('checkout_wallet');
      if (saved) return JSON.parse(saved);
    }
    return null;
  });
  
  const [transactionRef, setTransactionRef] = useState(() => {
    if (typeof window !== 'undefined') {
      return sessionStorage.getItem('checkout_tx_ref') || '';
    }
    return '';
  });
  
  const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(() => {
    if (typeof window !== 'undefined') {
      const saved = sessionStorage.getItem('checkout_order_details');
      if (saved) return JSON.parse(saved);
    }
    return null;
  });

  const [overpaymentData, setOverpaymentData] = useState<any>(null);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  const totalAmount = cartItems.reduce((acc, item) => acc + (item.wifiPackage.price * item.quantity), 0);
  const totalCards = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  // Sync to session storage on change (except sensitive data)
  useEffect(() => {
    if (cartItems.length > 0) {
      sessionStorage.setItem('checkout_cart', JSON.stringify(cartItems));
    }
  }, [cartItems]);

  useEffect(() => {
    if (networkCode) {
      sessionStorage.setItem('checkout_domain', networkCode);
    }
  }, [networkCode]);

  useEffect(() => {
    if (selectedWallet) {
      sessionStorage.setItem('checkout_wallet', JSON.stringify(selectedWallet));
    } else {
      sessionStorage.removeItem('checkout_wallet');
    }
  }, [selectedWallet]);

  useEffect(() => {
    if (transactionRef) {
      sessionStorage.setItem('checkout_tx_ref', transactionRef);
    } else {
      sessionStorage.removeItem('checkout_tx_ref');
    }
  }, [transactionRef]);

  useEffect(() => {
    if (orderDetails) {
      sessionStorage.setItem('checkout_order_details', JSON.stringify(orderDetails));
    } else {
      sessionStorage.removeItem('checkout_order_details');
    }
  }, [orderDetails]);

  return (
    <CheckoutContext.Provider value={{
      cartItems, setCartItems,
      totalAmount, totalCards,
      networkCode, setNetworkCode,
      selectedWallet, setSelectedWallet,
      transactionRef, setTransactionRef,
      orderDetails, setOrderDetails,
      overpaymentData, setOverpaymentData,
      checkoutError, setCheckoutError
    }}>
      {children}
    </CheckoutContext.Provider>
  );
};

export const useCheckout = () => {
  const context = useContext(CheckoutContext);
  if (context === undefined) {
    throw new Error('useCheckout must be used within a CheckoutProvider');
  }
  return context;
};
