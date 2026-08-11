"use client";
import React, { useEffect, useState } from 'react';
import { LoginPage } from '../../../components/owner/views/LoginPage';
import { useAppContext } from '../../../context/AppContext';

export default function LoginRoute() {
  const { isDarkMode, setIsDarkMode } = useAppContext();
  const [passwordChangeSuccessAlert, setPasswordChangeSuccessAlert] = useState<boolean>(false);

  useEffect(() => {
    // Check if redirected from password change success
    const params = new URLSearchParams(window.location.search);
    if (params.get('pwd_changed') === 'true') {
      setPasswordChangeSuccessAlert(true);
      // Clean up URL
      const url = new URL(window.location.href);
      url.searchParams.delete('pwd_changed');
      window.history.replaceState({}, '', url.toString());
    }
  }, []);

  const handleLoginSubmit = async (ownerId: string, password?: string) => {
    const res = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: ownerId, password })
    });

    const data = await res.json();
    
    if (!res.ok) {
      throw new Error(data.message || data.error || 'رقم المالك أو كلمة المرور غير صحيحة');
    }

    if (data.user && data.user.role === 'network_owner') {
      localStorage.setItem('auth_token', data.token); // using auth_token or owner_auth_token
      localStorage.setItem('owner_user', JSON.stringify(data.user));
      
      if (data.user.must_change_password || data.user.mustChangePassword) {
        window.location.href = '/owner/change-password';
      } else {
        window.location.href = '/owner/overview';
      }
    } else {
      throw new Error('عفواً، هذا الحساب غير مسجل كمالك شبكة');
    }
  };

  return (
    <div className="relative">
      {passwordChangeSuccessAlert && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-full max-w-md px-4">
          <div className="p-3.5 rounded-xl bg-emerald-500/90 text-white text-xs text-center font-bold shadow-xl flex items-center justify-between gap-2">
            <span>✅ تم تغيير كلمة المرور بنجاح! يمكنك الآن تسجيل الدخول.</span>
            <button
              onClick={() => setPasswordChangeSuccessAlert(false)}
              className="text-white/80 hover:text-white cursor-pointer text-sm"
            >
              ✕
            </button>
          </div>
        </div>
      )}
      <LoginPage
        isDarkMode={isDarkMode}
        onToggleTheme={() => setIsDarkMode(!isDarkMode)}
        onLoginSuccess={handleLoginSubmit}
        onBackToRegister={() => {
          if (typeof window !== 'undefined') window.location.href = '/';
        }}
      />
    </div>
  );
}
