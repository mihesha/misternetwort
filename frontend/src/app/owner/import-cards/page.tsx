"use client";
import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useOwnerContext } from '../../../context/OwnerContext';
import { useAppContext } from '../../../context/AppContext';
import { useOwnerActions } from '../../../hooks/useOwnerActions';
import { ImportCardsView } from '../../../components/owner/views/ImportCardsView';

export default function ImportCardsViewPage() {
  const router = useRouter();
  const [idStr, setIdStr] = React.useState<string | null>(null);

  React.useEffect(() => {
    setIdStr(localStorage.getItem('ownerActiveNetworkId'));
  }, []);

  const { isDarkMode, setIsDarkMode } = useAppContext();
  const { ownerName, networks, globalUpdateTick } = useOwnerContext();
  const { fetchOwnerNetworks } = useOwnerActions();

  useEffect(() => {
    if (networks.length === 0) {
      fetchOwnerNetworks();
    }
  }, [networks.length]);

  

  const network = networks.find((n) => n.id.toString() === idStr) || networks[0];

  

  if (!network) {
    return <div className="p-8 text-center text-slate-500 font-bold">جاري تحميل بيانات الشبكة...</div>;
  }

  

  return (
    <>
      
      <ImportCardsView
        isDarkMode={isDarkMode}
        ownerName={ownerName}
        networkName={network.name}
        globalUpdateTick={globalUpdateTick}
        
      />
    </>
  );
}
