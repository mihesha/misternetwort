"use client";
import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useOwnerContext } from '../../../context/OwnerContext';
import { useAppContext } from '../../../context/AppContext';
import { useOwnerActions } from '../../../hooks/useOwnerActions';
import { MikrotikSetupWizardView } from '../../../components/owner/views/MikrotikSetupWizardView';

export default function MikrotikSetupWizardViewPage() {
  const router = useRouter();
  const { isDarkMode } = useAppContext();
  const { ownerName, networks, activeNetwork: contextActiveNetwork } = useOwnerContext();
  const { fetchOwnerNetworks } = useOwnerActions();

  useEffect(() => {
    if (networks.length === 0) {
      fetchOwnerNetworks();
    }
  }, [networks.length, fetchOwnerNetworks]);

  const network = contextActiveNetwork || networks[0];

  if (!network) {
    return <div className="p-8 text-center text-slate-500 font-bold">جاري تحميل بيانات الشبكة...</div>;
  }

  return (
    <MikrotikSetupWizardView
      isDarkMode={isDarkMode}
      ownerName={ownerName}
      networkName={network.name}
    />
  );
}
