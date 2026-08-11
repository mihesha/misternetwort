"use client";
import React from 'react';
import { ApplicationsView } from '../../../components/admin/views/ApplicationsView';
import { useAppContext } from '../../../context/AppContext';
import { useAdminContext } from '../../../context/AdminContext';
import { useAdminActions } from '../../../hooks/useAdminActions';

export default function ApplicationsPage() {
  const { isDarkMode, applications, handleUpdateStatus, handleDeleteApplication } = useAppContext();
  const { setInspectApp, setRequestModifyApp, setModificationReasonText } = useAdminContext();
  const { handleApproveAndProvision } = useAdminActions();

  return (
    <>
      <ApplicationsView
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
