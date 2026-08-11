"use client";
import React, { useEffect, useState } from 'react';
import { ChangePasswordPage } from '../../../components/owner/views/ChangePasswordPage';
import { useAppContext } from '../../../context/AppContext';

export default function ChangePasswordRoute() {
  const { isDarkMode, setIsDarkMode } = useAppContext();
  const [ownerName, setOwnerName] = useState('هشام محمد الجايفي');

  useEffect(() => {
    // If we have an owner name in localStorage or something, we can retrieve it
    if (typeof window !== 'undefined') {
      const savedOwnerId = localStorage.getItem('karoot_login_ownerId');
      if (savedOwnerId) {
        setOwnerName(savedOwnerId);
      }
    }
  }, []);

  const handlePasswordChanged = async (newPassword: string) => {
    const token = localStorage.getItem('auth_token');
    
    const res = await fetch('/api/change-password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      },
      body: JSON.stringify({ password: newPassword })
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.message || 'حدث خطأ أثناء تغيير كلمة المرور');
    }

    // Update local user state if present
    const userStr = localStorage.getItem('owner_user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        user.must_change_password = false;
        user.mustChangePassword = false;
        localStorage.setItem('owner_user', JSON.stringify(user));
      } catch (e) {}
    }

    if (typeof window !== 'undefined') {
      setTimeout(() => {
        window.location.href = '/owner/login?pwd_changed=true';
      }, 1000);
    }
  };

  return (
    <ChangePasswordPage
      isDarkMode={isDarkMode}
      onToggleTheme={() => setIsDarkMode(!isDarkMode)}
      ownerName={ownerName}
      onPasswordChanged={handlePasswordChanged}
      onOpenPrivacyPolicy={() => {
        if (typeof window !== 'undefined') window.location.href = '/owner/privacy-policy';
      }}
    />
  );
}
