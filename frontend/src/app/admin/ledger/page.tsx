"use client";

import React from 'react';
import { useAppContext } from '../../../context/AppContext';
import { useAdminContext } from '../../../context/AdminContext';
import { LedgerView } from '../../../components/admin/views/LedgerView';

export default function LedgerPage() {
  const { isDarkMode } = useAppContext();
  const { auditLogs } = useAdminContext();

  const handleExportCSV = () => {
    const headers = ['رقم المرجع', 'التاريخ', 'اسم الشبكة', 'المنفذ', 'نوع العملية', 'المبلغ (ر.ي)', 'التفاصيل'];
    const rows = auditLogs.map((log) => [
      log.reference,
      new Date(log.timestamp).toLocaleString('ar-YE'),
      log.networkName,
      log.performedBy,
      log.typeLabel,
      `${log.amount}`,
      log.description,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers, ...rows].map((e) => e.join(',')).join('\\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Karoot_Admin_Ledger_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <LedgerView
      isDarkMode={isDarkMode}
      auditLogs={auditLogs}
      handleExportCSV={handleExportCSV}
    />
  );
}
