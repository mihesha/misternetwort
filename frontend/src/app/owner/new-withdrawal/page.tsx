"use client";
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useOwnerContext } from '../../../context/OwnerContext';
import { useAppContext } from '../../../context/AppContext';
import { useOwnerActions } from '../../../hooks/useOwnerActions';
import { NewWithdrawalRequestView } from '../../../components/owner/views/NewWithdrawalRequestView';

export default function NewWithdrawalRequestViewPage() {
  const router = useRouter();
  const [idStr, setIdStr] = useState<string | null>(null);

  useEffect(() => {
    setIdStr(localStorage.getItem('ownerActiveNetworkId'));
  }, []);

  const { isDarkMode } = useAppContext();
  const { ownerName, networks, activeNetwork } = useOwnerContext();
  const { fetchOwnerNetworks } = useOwnerActions();

  useEffect(() => {
    if (networks.length === 0) {
      fetchOwnerNetworks();
    }
  }, [networks.length]);

  const network = activeNetwork || networks.find((n) => n.id.toString() === idStr) || networks[0];

  if (!network) {
    return <div className="p-8 text-center text-slate-500 font-bold">جاري تحميل بيانات الشبكة...</div>;
  }

  return (
    <NewWithdrawalRequestView
      isDarkMode={isDarkMode}
      ownerName={ownerName}
      networkId={network.id}
      networkCode={network.code}
      networkName={network.name}
      availableBalance={network.balance || 0}
    />
  );
}
