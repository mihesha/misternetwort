"use client";
import React from 'react';
import { useAppContext } from '../../../context/AppContext';
import { useAdminContext } from '../../../context/AdminContext';
import { MikrotikView } from '../../../components/admin/views/MikrotikView';

export default function MikrotikPage() {
  const { isDarkMode } = useAppContext();
  const {
    mikrotikIpInput,
    setMikrotikIpInput,
    mikrotikUserInput,
    setMikrotikUserInput,
    mikrotikPassInput,
    setMikrotikPassInput,
    mikrotikGlobalPort,
    copiedScript,
    setCopiedScript
  } = useAdminContext();

  return (
    <MikrotikView
      isDarkMode={isDarkMode}
      mikrotikIpInput={mikrotikIpInput}
      setMikrotikIpInput={setMikrotikIpInput}
      mikrotikUserInput={mikrotikUserInput}
      setMikrotikUserInput={setMikrotikUserInput}
      mikrotikPassInput={mikrotikPassInput}
      setMikrotikPassInput={setMikrotikPassInput}
      mikrotikGlobalPort={mikrotikGlobalPort}
      copiedScript={copiedScript}
      setCopiedScript={setCopiedScript}
    />
  );
}
