"use client";
import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface OwnerNetworkCard {
  id: string;
  name: string;
  code: string;
  balance: number;
  status: 'active' | 'inactive';
  categories: { value: string; remaining: number }[];
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
}

const OwnerContext = createContext<OwnerContextProps | undefined>(undefined);

export const OwnerProvider = ({ children }: { children: ReactNode }) => {
  const [ownerName, setOwnerName] = useState<string>('هشام محمد الجايفي');
  const [networks, setNetworks] = useState<OwnerNetworkCard[]>([]);

  // Modals
  const [detailedNetwork, setDetailedNetwork] = useState<OwnerNetworkCard | null>(null);
  const [importCardsNetwork, setImportCardsNetwork] = useState<OwnerNetworkCard | null>(null);
  const [editDataNetwork, setEditDataNetwork] = useState<OwnerNetworkCard | null>(null);
  const [mikrotikNetwork, setMikrotikNetwork] = useState<OwnerNetworkCard | null>(null);
  const [showSearchModal, setShowSearchModal] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');

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
        searchQuery, setSearchQuery
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
