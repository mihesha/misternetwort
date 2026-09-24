"use client";
import React from 'react';
import { AgentApplicationsView } from '../../../components/admin/views/AgentApplicationsView';
import { useAppContext } from '../../../context/AppContext';
import { useAdminContext } from '../../../context/AdminContext';
import { useAdminActions } from '../../../hooks/useAdminActions';

export default function AgentApplicationsPage() {
  const { isDarkMode, applications, handleUpdateStatus, handleDeleteApplication } = useAppContext();
  const { setInspectApp, setRequestModifyApp, setModificationReasonText } = useAdminContext();
  const { handleApproveAndProvision } = useAdminActions();

  return (
    <>
      <AgentApplicationsView
        isDarkMode={isDarkMode}
        applications={applications}
        handleApproveAndProvision={handleApproveAndProvision}
        setRequestModifyApp={setRequestModifyApp}
        setModificationReasonText={setModificationReasonText}
        onUpdateStatus={handleUpdateStatus}
        setInspectApp={setInspectApp}
        onDeleteApplication={handleDeleteApplication}
      />
    </>
  );
}
