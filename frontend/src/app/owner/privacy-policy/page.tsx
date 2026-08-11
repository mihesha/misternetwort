"use client";
import React, { useEffect, useState } from 'react';
import { PrivacyPolicyPage } from '../../../components/owner/views/PrivacyPolicyPage';
import { useAppContext } from '../../../context/AppContext';

export default function PrivacyPolicyRoute() {
  const { isDarkMode, setIsDarkMode } = useAppContext();
  const [ownerName, setOwnerName] = useState('هشام محمد الجايفي');

  useEffect(() => {
    // Attempt to load ownerName if available
    if (typeof window !== 'undefined') {
      const savedOwnerId = localStorage.getItem('karoot_login_ownerId');
      if (savedOwnerId) {
        setOwnerName(savedOwnerId);
      }
    }
  }, []);

  return (
    <PrivacyPolicyPage
      isDarkMode={isDarkMode}
      onToggleTheme={() => setIsDarkMode(!isDarkMode)}
      ownerName={ownerName}
      onBack={() => {
        if (typeof window !== 'undefined') {
          // Typically we go back to settings or auth, but let's go to root or back
          window.history.back();
        }
      }}
    />
  );
}
