"use client";
import React from 'react';
import { useAppContext } from '../../../context/AppContext';
import { useAdminContext } from '../../../context/AdminContext';
import { UsersView } from '../../../components/admin/views/UsersView';

export default function UsersPage() {
  const { isDarkMode } = useAppContext();
  const { adminUsers, setShowNewUserModal } = useAdminContext();

  return (
    <UsersView
      isDarkMode={isDarkMode}
      adminUsers={adminUsers}
      setShowNewUserModal={setShowNewUserModal}
    />
  );
}
