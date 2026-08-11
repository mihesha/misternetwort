"use client";
import React from 'react';
import { OverviewView } from '../../../components/admin/views/OverviewView';
import { useAppContext } from '../../../context/AppContext';
import { useAdminContext } from '../../../context/AdminContext';
import { useRouter } from 'next/navigation';

export default function OverviewPage() {
  const { isDarkMode } = useAppContext();
  const { stats, activeNetworks, auditLogs, platformCommissionRate } = useAdminContext();
  const router = useRouter();

  return (
    <OverviewView
      isDarkMode={isDarkMode}
      stats={stats}
      activeNetworks={activeNetworks}
      auditLogs={auditLogs}
      platformCommissionRate={platformCommissionRate}
      setActiveTab={(tab: string) => router.push(`/admin/${tab}`)}
    />
  );
}
