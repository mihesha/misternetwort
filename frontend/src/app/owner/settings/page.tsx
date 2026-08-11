"use client";
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useOwnerContext } from '../../../context/OwnerContext';
import { useAppContext } from '../../../context/AppContext';
import { useOwnerActions } from '../../../hooks/useOwnerActions';
import { NetworkSettingsView } from '../../../components/owner/views/NetworkSettingsView';

export default function OwnerSettingsPage() {
  const router = useRouter();
  const [idStr, setIdStr] = useState<string | null>(null);

  useEffect(() => {
    const savedId = localStorage.getItem('ownerActiveNetworkId');
    if (savedId) {
      setIdStr(savedId);
    } else {
      router.push('/owner/overview');
    }
  }, [router]);

  const { isDarkMode } = useAppContext();
  const { ownerName, networks, setMikrotikNetwork } = useOwnerContext();
  const { fetchOwnerNetworks } = useOwnerActions();

  useEffect(() => {
    if (networks.length === 0) {
      fetchOwnerNetworks();
    }
  }, [networks.length, fetchOwnerNetworks]);

  const activeNetwork = networks.find(n => n.id.toString() === idStr);

  if (!idStr) return null;
  if (!activeNetwork) return <div className="p-8 text-center text-slate-500 font-bold">جاري تحميل إعدادات الشبكة...</div>;

  return (
    <>
      <NetworkSettingsView
        isDarkMode={isDarkMode}
        ownerName={ownerName}
        networkName={activeNetwork.name}
        networkCode={activeNetwork.code}
        onOpenMikrotikWizard={() => {
          setMikrotikNetwork(activeNetwork);
        }}
      />
    </>
  );
}
