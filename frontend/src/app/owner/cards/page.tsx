"use client";
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useOwnerContext } from '../../../context/OwnerContext';
import { useAppContext } from '../../../context/AppContext';
import { useOwnerActions } from '../../../hooks/useOwnerActions';
import { CardsManagementView } from '../../../components/owner/views/CardsManagementView';

export default function CardsManagementPage() {
  const router = useRouter();
  const [idStr, setIdStr] = useState<string | null>(null);

  useEffect(() => {
    setIdStr(localStorage.getItem('ownerActiveNetworkId'));
  }, []);

  const { isDarkMode } = useAppContext();
  const { ownerName, networks, globalUpdateTick } = useOwnerContext();
  const { fetchOwnerNetworks } = useOwnerActions();

  useEffect(() => {
    if (networks.length === 0) {
      fetchOwnerNetworks();
    }
  }, [networks.length, fetchOwnerNetworks]);

  
  const activeNetwork = networks.find(n => n.id.toString() === idStr) || networks[0];

  

  if (!activeNetwork) {
    return <div className="p-8 text-center text-slate-500 font-bold">جاري تحميل بيانات الشبكة...</div>;
  }

  return (
    <CardsManagementView
      isDarkMode={isDarkMode}
      ownerName={ownerName}
      networkName={activeNetwork.name}
      networkCode={activeNetwork.code}
      networkId={activeNetwork.id}
      globalUpdateTick={globalUpdateTick}
    />
  );
}

