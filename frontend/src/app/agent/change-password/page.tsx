"use client";
import React, { useEffect, useState } from 'react';
import { AgentChangePasswordPage } from '../../../components/agent/views/AgentChangePasswordPage';
import { useAppContext } from '../../../context/AppContext';

export default function AgentChangePasswordRoute() {
  const { isDarkMode, setIsDarkMode } = useAppContext();
  const [ownerName, setOwnerName] = useState('حسابي');

  useEffect(() => {
    // If we have an agent user in localStorage or something, we can retrieve it
    if (typeof window !== 'undefined') {
      try {
        const agentStr = localStorage.getItem('agent_user');
        if (agentStr) {
          const agent = JSON.parse(agentStr);
          if (agent.name) {
            setOwnerName(agent.name);
          }
        }
      } catch(e) {}
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
    const userStr = localStorage.getItem('agent_user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        user.must_change_password = false;
        user.mustChangePassword = false;
        localStorage.setItem('agent_user', JSON.stringify(user));
      } catch (e) {}
    }

    if (typeof window !== 'undefined') {
      setTimeout(() => {
        window.location.href = '/agent/login?pwd_changed=true';
      }, 1000);
    }
  };

  return (
    <AgentChangePasswordPage
      isDarkMode={isDarkMode}
      onToggleTheme={() => setIsDarkMode(!isDarkMode)}
      agentName={ownerName}
      onPasswordChanged={handlePasswordChanged}
    />
  );
}
