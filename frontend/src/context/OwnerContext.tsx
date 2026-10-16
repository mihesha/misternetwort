"use client";
import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';

export interface OwnerNetworkCard {
  id: string | number;
  name: string;
  english_name?: string;
  code: string;
  external_link?: string;
  owner_phone?: string;
  governorate?: string;
  city?: string;
  neighborhood?: string;
  jaib_wallet?: string;
  balance: number;
  total_sales: number;
  status: 'active' | 'inactive' | 'suspended';
  notif_out_of_stock?: boolean;
  notif_low_stock?: boolean;
  categories: { id: string | number; name?: string; value: string; remaining: number; min_threshold: number }[];
}

interface OwnerContextProps {
  ownerName: string;
  setOwnerName: (name: string) => void;
  networks: OwnerNetworkCard[];
  setNetworks: (networks: OwnerNetworkCard[]) => void;
  
  // Active scoped network
  activeNetwork: OwnerNetworkCard | null;
  activeNetworkId: string | null;
  setActiveNetworkId: (id: string | number) => void;
  
  // Add network modal state
  showAddNetworkModal: boolean;
  setShowAddNetworkModal: (show: boolean) => void;

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
  
  isDataLoaded: boolean;
  setIsDataLoaded: (val: boolean) => void;
}

const OwnerContext = createContext<OwnerContextProps | undefined>(undefined);

export const OwnerProvider = ({ children }: { children: ReactNode }) => {
  const [ownerName, setOwnerName] = useState<string>('صاحب شبكة');
  const [networks, setNetworks] = useState<OwnerNetworkCard[]>([]);
  const [activeNetworkId, setActiveNetworkIdState] = useState<string | null>(null);
  const [isDataLoaded, setIsDataLoaded] = useState<boolean>(false);
  const [showAddNetworkModal, setShowAddNetworkModal] = useState<boolean>(false);

  // Load user name and active network ID from localStorage on mount
  useEffect(() => {
    try {
      const userStr = typeof window !== 'undefined' ? localStorage.getItem('owner_user') : null;
      if (userStr) {
        const user = JSON.parse(userStr);
        if (user && user.name) {
          setOwnerName(user.name);
        }
      }
      const savedId = typeof window !== 'undefined' ? localStorage.getItem('ownerActiveNetworkId') : null;
      if (savedId) {
        setActiveNetworkIdState(savedId);
      }
    } catch (e) {
      console.error('Failed to load initial owner data from localStorage:', e);
    }
  }, []);

  // Synchronize active network ID when networks change
  useEffect(() => {
    if (networks.length > 0) {
      const currentValid = networks.some(n => n.id.toString() === activeNetworkId);
      if (!currentValid) {
        const fallbackId = networks[0].id.toString();
        setActiveNetworkIdState(fallbackId);
        if (typeof window !== 'undefined') {
          localStorage.setItem('ownerActiveNetworkId', fallbackId);
          window.dispatchEvent(new Event('ownerActiveNetworkIdChanged'));
        }
      }
    }
  }, [networks, activeNetworkId]);

  const setActiveNetworkId = (id: string | number) => {
    const stringId = id.toString();
    setActiveNetworkIdState(stringId);
    if (typeof window !== 'undefined') {
      localStorage.setItem('ownerActiveNetworkId', stringId);
      window.dispatchEvent(new Event('ownerActiveNetworkIdChanged'));
    }
  };

  // Memoized active network
  const activeNetwork = useMemo(() => {
    if (networks.length === 0) return null;
    if (!activeNetworkId) return networks[0];
    return networks.find(n => n.id.toString() === activeNetworkId) || networks[0];
  }, [networks, activeNetworkId]);

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
        activeNetwork, activeNetworkId, setActiveNetworkId,
        showAddNetworkModal, setShowAddNetworkModal,
        detailedNetwork, setDetailedNetwork,
        importCardsNetwork, setImportCardsNetwork,
        editDataNetwork, setEditDataNetwork,
        mikrotikNetwork, setMikrotikNetwork,
        showSearchModal, setShowSearchModal,
        searchQuery, setSearchQuery,
        globalUpdateTick, setGlobalUpdateTick,
        isDataLoaded, setIsDataLoaded
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
