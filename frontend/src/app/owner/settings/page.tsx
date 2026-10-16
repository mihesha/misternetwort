"use client";
import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useOwnerContext } from '../../../context/OwnerContext';
import { useAppContext } from '../../../context/AppContext';
import { useOwnerActions } from '../../../hooks/useOwnerActions';
import { NetworkSettingsView } from '../../../components/owner/views/NetworkSettingsView';

export default function OwnerSettingsPage() {
  const router = useRouter();
  const { isDarkMode } = useAppContext();
  const { ownerName, networks, activeNetwork: contextActiveNetwork, setMikrotikNetwork, globalUpdateTick } = useOwnerContext();
  const { fetchOwnerNetworks } = useOwnerActions();

  useEffect(() => {
    if (networks.length === 0) {
      fetchOwnerNetworks();
    }
  }, [networks.length, fetchOwnerNetworks]);

  const activeNetwork = contextActiveNetwork || networks[0];

  if (!activeNetwork) {
    return <div className="p-8 text-center text-slate-500 font-bold">جاري تحميل إعدادات الشبكة...</div>;
  }

  return (
    <NetworkSettingsView
      isDarkMode={isDarkMode}
      ownerName={ownerName}
      networkName={activeNetwork.name}
      networkCode={activeNetwork.code}
      onOpenMikrotikWizard={() => {
        setMikrotikNetwork(activeNetwork);
      }}
      globalUpdateTick={globalUpdateTick}
    />
  );
}
