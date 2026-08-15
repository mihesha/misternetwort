"use client";
import React from 'react';
import { useAppContext } from '../../../context/AppContext';
import { useAdminContext } from '../../../context/AdminContext';
import { useAdminActions } from '../../../hooks/useAdminActions';
import { SettingsView } from '../../../components/admin/views/SettingsView';

export default function SettingsPage() {
  const { isDarkMode } = useAppContext();
  const {
    platformCommissionType,
    setPlatformCommissionType,
    platformCommissionRate,
    setPlatformCommissionRate,
    supportPhone,
    setSupportPhone,
    maintenanceMode,
    setMaintenanceMode,
    autoApproveApplications,
    setAutoApproveApplications,
  } = useAdminContext();
  const { handleSaveSettings } = useAdminActions();

  return (
    <SettingsView
      isDarkMode={isDarkMode}
      platformCommissionType={platformCommissionType}
      setPlatformCommissionType={setPlatformCommissionType}
      platformCommissionRate={platformCommissionRate}
      setPlatformCommissionRate={setPlatformCommissionRate}
      supportPhone={supportPhone}
      setSupportPhone={setSupportPhone}
      maintenanceMode={maintenanceMode}
      setMaintenanceMode={setMaintenanceMode}
      autoApproveApplications={autoApproveApplications}
      setAutoApproveApplications={setAutoApproveApplications}
      handleSaveSettings={handleSaveSettings}
    />
  );
}
