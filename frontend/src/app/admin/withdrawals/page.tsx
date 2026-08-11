"use client";

import React from 'react';
import { useAppContext } from '../../../context/AppContext';
import { useAdminContext } from '../../../context/AdminContext';
import { WithdrawalsView } from '../../../components/admin/views/WithdrawalsView';

export default function WithdrawalsPage() {
  const { isDarkMode } = useAppContext();
  const { withdrawals, setPayoutWdModal } = useAdminContext();

  return (
    <WithdrawalsView
      isDarkMode={isDarkMode}
      withdrawals={withdrawals}
      setPayoutWdModal={setPayoutWdModal}
    />
  );
}
