"use client";
import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useOwnerContext } from '../../../context/OwnerContext';
import { useAppContext } from '../../../context/AppContext';
import { useOwnerActions } from '../../../hooks/useOwnerActions';
import { NetworkAccountStatementView } from '../../../components/owner/views/NetworkAccountStatementView';

export default function NetworkAccountStatementViewPage() {
  const router = useRouter();
  const [idStr, setIdStr] = React.useState<string | null>(null);

  React.useEffect(() => {
    const savedId = localStorage.getItem('ownerActiveNetworkId');
    if (savedId) {
      setIdStr(savedId);
    } else {
      router.push('/owner/overview');
    }
  }, [router]);

  const { isDarkMode, setIsDarkMode } = useAppContext();
  const { ownerName, networks } = useOwnerContext();
  const { fetchOwnerNetworks } = useOwnerActions();

  useEffect(() => {
    if (networks.length === 0) {
      fetchOwnerNetworks();
    }
  }, [networks.length]);

  if (!idStr) {
    return <div className="p-8 text-center text-red-500 font-bold">لم يتم تحديد الشبكة (مفقود: id)</div>;
  }

  const network = networks.find((n) => n.id.toString() === idStr);

  if (!network && networks.length > 0) {
    return <div className="p-8 text-center text-red-500 font-bold">الشبكة غير موجودة</div>;
  }

  if (!network) {
    return <div className="p-8 text-center text-slate-500 font-bold">جاري تحميل بيانات الشبكة...</div>;
  }

  

  return (
    <>
      
      <NetworkAccountStatementView
        isDarkMode={isDarkMode}
        ownerName={ownerName}
        networkName={network.name}
        networkCode={network.code}
        
        
      />
    </>
  );
}
