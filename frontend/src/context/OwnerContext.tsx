"use client";
import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface OwnerNetworkCard {
  id: string;
  name: string;
  code: string;
  balance: number;
  total_sales: number;
  status: 'active' | 'inactive';
  notif_out_of_stock?: boolean;
  notif_low_stock?: boolean;
  categories: { id: string | number; value: string; remaining: number; min_threshold: number }[];
}

interface OwnerContextProps {
  ownerName: string;
  setOwnerName: (name: string) => void;
  networks: OwnerNetworkCard[];
  setNetworks: (networks: OwnerNetworkCard[]) => void;
  
  // Modals / Overlays state
  detailedNetwork: OwnerNetworkCard | null;
  setDetailedNetwork: (net: OwnerNetworkCard | null) => void;
  
  importCardsNetwork: OwnerNetworkCard | null;
  setImportCardsNetwork: (net: OwnerNetworkCard | null) => void;
  
  editDataNetwork: OwnerNetworkCard | null;
  setEditDataNetwork: (net: OwnerNetworkCard | null) => void;
  
  mikrotikNetwork: OwnerNetworkCard | null;
  setMikrotikNetwork: (net: OwnerNetworkCard | null) => void;
  
  showSearchModal: boolean;
  setShowSearchModal: (show: boolean) => void;
  
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  
  globalUpdateTick: number;
  setGlobalUpdateTick: React.Dispatch<React.SetStateAction<number>>;
}

const OwnerContext = createContext<OwnerContextProps | undefined>(undefined);

export const OwnerProvider = ({ children }: { children: ReactNode }) => {
  const [ownerName, setOwnerName] = useState<string>('صاحب شبكة');
  const [networks, setNetworks] = useState<OwnerNetworkCard[]>([]);

  React.useEffect(() => {
    try {
      const userStr = typeof window !== 'undefined' ? localStorage.getItem('owner_user') : null;
      if (userStr) {
        const user = JSON.parse(userStr);
        if (user && user.name) {
          setOwnerName(user.name);
        }
      }
    } catch (e) {
      console.error('Failed to load owner name from localStorage:', e);
    }
  }, []);

  React.useEffect(() => {
    if (networks.length > 0) {
      try {
        const savedId = typeof window !== 'undefined' ? localStorage.getItem('ownerActiveNetworkId') : null;
        const isValid = networks.some(n => n.id.toString() === savedId);
        if (!isValid) {
          localStorage.setItem('ownerActiveNetworkId', networks[0].id.toString());
          // Dispatch a custom event to notify components that might be using the ID
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new Event('ownerActiveNetworkIdChanged'));
          }
        }
      } catch (e) {
        console.error('Failed to update ownerActiveNetworkId:', e);
      }
    }
  }, [networks]);

  // Modals
  const [detailedNetwork, setDetailedNetwork] = useState<OwnerNetworkCard | null>(null);
  const [importCardsNetwork, setImportCardsNetwork] = useState<OwnerNetworkCard | null>(null);
  const [editDataNetwork, setEditDataNetwork] = useState<OwnerNetworkCard | null>(null);
  const [mikrotikNetwork, setMikrotikNetwork] = useState<OwnerNetworkCard | null>(null);
  const [showSearchModal, setShowSearchModal] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  const [globalUpdateTick, setGlobalUpdateTick] = useState<number>(0);

  return (
    <OwnerContext.Provider
      value={{
        ownerName, setOwnerName,
        networks, setNetworks,
        detailedNetwork, setDetailedNetwork,
        importCardsNetwork, setImportCardsNetwork,
        editDataNetwork, setEditDataNetwork,
        mikrotikNetwork, setMikrotikNetwork,
        showSearchModal, setShowSearchModal,
        searchQuery, setSearchQuery,
        globalUpdateTick, setGlobalUpdateTick
      }}
    >
      {children}
    </OwnerContext.Provider>
  );
};

export const useOwnerContext = () => {
  const context = useContext(OwnerContext);
  if (context === undefined) {
    throw new Error('useOwnerContext must be used within an OwnerProvider');
  }
  return context;
};
