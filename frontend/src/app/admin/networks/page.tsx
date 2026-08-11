"use client";
import React from 'react';
import { NetworksView } from '../../../components/admin/views/NetworksView';
import { useAppContext } from '../../../context/AppContext';
import { useAdminContext } from '../../../context/AdminContext';
import { useAdminActions } from '../../../hooks/useAdminActions';

export default function NetworksPage() {
  const { isDarkMode } = useAppContext();
  const { 
    activeNetworks,
    setShowNewNetworkModal,
    setInspectNetwork,
    setInspectNetworkTab,
    setInspectCardCatFilter,
    setInspectCardStatusFilter,
    setInspectCardDateFilter,
    setInspectCardStartDate,
    setInspectCardEndDate,
    setInspectCardSearchQuery,
    setInspectNetworkCards
  } = useAdminContext();

  const { handleRegeneratePassword } = useAdminActions();
  
  return (
    <>
      <NetworksView
        isDarkMode={isDarkMode}
        activeNetworks={activeNetworks}
        setShowNewNetworkModal={setShowNewNetworkModal}
        setInspectNetwork={setInspectNetwork}
        setInspectNetworkTab={setInspectNetworkTab}
        setInspectCardCatFilter={setInspectCardCatFilter}
        setInspectCardStatusFilter={setInspectCardStatusFilter}
        setInspectCardDateFilter={setInspectCardDateFilter}
        setInspectCardStartDate={setInspectCardStartDate}
        setInspectCardEndDate={setInspectCardEndDate}
        setInspectCardSearchQuery={setInspectCardSearchQuery}
        setInspectNetworkCards={setInspectNetworkCards}
        handleRegeneratePassword={handleRegeneratePassword}
      />
    </>
  );
}
