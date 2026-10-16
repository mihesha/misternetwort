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

  const handleLoginSubmit = async (ownerId: string, password?: string, captcha?: string, captchaKey?: string) => {
    const res = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: ownerId, password, captcha, captcha_key: captchaKey, role: 'network_owner' })
    });

    const data = await res.json();
    
    if (!res.ok) {
      throw new Error(data.message || data.error || 'رقم المالك أو كلمة المرور غير صحيحة');
    }

    if (data.user && data.user.role === 'network_owner') {
      localStorage.setItem('owner_auth_token', data.token); // using auth_token or owner_auth_token
      localStorage.setItem('owner_user', JSON.stringify(data.user));
      
      if (data.user.must_change_password || data.user.mustChangePassword) {
        window.location.href = '/owner/change-password';
      } else {
        if (data.first_network_id) {
          localStorage.setItem('ownerActiveNetworkId', data.first_network_id.toString());
        }

        const params = new URLSearchParams(window.location.search);
        const explicitRedirect = params.get('redirect');

        if (explicitRedirect && explicitRedirect !== '/owner' && explicitRedirect !== '/owner/' && explicitRedirect !== '/owner/networks') {
          window.location.href = explicitRedirect;
        } else {
          // If owner has 2 or more networks: redirect to /owner/networks
          // If owner has 1 (or 0) network: redirect directly to main dashboard /owner
          const networksCount = typeof data.networks_count === 'number' ? data.networks_count : 1;
          if (networksCount >= 2) {
            window.location.href = '/owner/networks';
          } else {
            window.location.href = '/owner';
          }
        }
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
          if (typeof window !== 'undefined') window.location.href = '/join';
        }}
      />
    </div>
  );
}
