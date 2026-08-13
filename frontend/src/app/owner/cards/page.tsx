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
    const savedId = localStorage.getItem('ownerActiveNetworkId');
    if (savedId) {
      setIdStr(savedId);
    } else {
      router.push('/owner');
    }
  }, [router]);

  const { isDarkMode } = useAppContext();
  const { ownerName, networks, globalUpdateTick } = useOwnerContext();
  const { fetchOwnerNetworks } = useOwnerActions();

  useEffect(() => {
    if (networks.length === 0) {
      fetchOwnerNetworks();
    }
  }, [networks.length, fetchOwnerNetworks]);

  if (!idStr) return null;
  const activeNetwork = networks.find(n => n.id.toString() === idStr);

  if (!activeNetwork && networks.length > 0) {
    return <div className="p-8 text-center text-red-500 font-bold">الشبكة غير موجودة</div>;
  }

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

