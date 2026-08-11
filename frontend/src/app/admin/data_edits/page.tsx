"use client";

import React from 'react';
import { useAppContext } from '../../../context/AppContext';
import { useAdminContext } from '../../../context/AdminContext';
import { DataEditsView } from '../../../components/admin/views/DataEditsView';

export default function DataEditsPage() {
  const { isDarkMode } = useAppContext();
  const {
    dataEditRequests,
    setInspectDataEditReq
  } = useAdminContext();

  const [dataEditSearch, setDataEditSearch] = React.useState<string>('');
  const [dataEditFilterStatus, setDataEditFilterStatus] = React.useState<string>('all');

  return (
    <DataEditsView
      isDarkMode={isDarkMode}
      dataEditRequests={dataEditRequests}
      dataEditSearch={dataEditSearch}
      setDataEditSearch={setDataEditSearch}
      dataEditFilterStatus={dataEditFilterStatus}
      setDataEditFilterStatus={setDataEditFilterStatus}
      setInspectDataEditReq={setInspectDataEditReq}
    />
  );
}
