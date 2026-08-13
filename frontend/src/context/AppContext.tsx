"use client";
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { NetworkApplication, ApplicationStatus, OwnerCredential } from '../types';

interface AppContextType {
  isDarkMode: boolean;
  setIsDarkMode: (val: boolean) => void;
  applications: NetworkApplication[];
  setApplications: (apps: NetworkApplication[]) => void;
  ownerCredentials: OwnerCredential[];
  saveOwnerCredentials: (creds: OwnerCredential[]) => void;
  loginOwnerId: string;
  setLoginOwnerId: (id: string) => void;
  activeOwnerPhone: string;
  setActiveOwnerPhone: (phone: string) => void;
  fetchRequests: () => Promise<void>;
  handleUpdateStatus: (id: string, status: ApplicationStatus, tempPassword?: string) => Promise<string | null>;
  handleApproveWithCredentials: (app: NetworkApplication, tempPassword: string) => Promise<string | null>;
  handleDeleteApplication: (id: string) => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [isDarkMode, setIsDarkModeState] = useState<boolean>(true);

  // Initialize theme from local storage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('karoot_theme');
      if (savedTheme) {
        setIsDarkModeState(savedTheme === 'dark');
      }
    }
  }, []);

  const setIsDarkMode = (val: boolean) => {
    setIsDarkModeState(val);
    if (typeof window !== 'undefined') {
      localStorage.setItem('karoot_theme', val ? 'dark' : 'light');
    }
  };
  const [applications, setApplications] = useState<NetworkApplication[]>([]);
  const [loginOwnerId, setLoginOwnerId] = useState<string>('هشام محمد الجايفي');
  const [activeOwnerPhone, setActiveOwnerPhone] = useState<string>('775945393');

  const [ownerCredentials, setOwnerCredentials] = useState<OwnerCredential[]>(() => {
    if (typeof localStorage !== 'undefined') {
      const saved = localStorage.getItem('karoot_owner_credentials');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {
          // ignore fallback
        }
      }
    }
    return [
      {
        ownerPhone: '775945393',
        ownerName: 'هشام محمد الجايفي',
        networkName: 'برق نت اللاسلكية',
        tempPassword: 'temp-1234',
        currentPassword: '555222',
        mustChangePassword: false,
        createdAt: new Date().toISOString(),
      },
    ];
  });

  const saveOwnerCredentials = (creds: OwnerCredential[]) => {
    setOwnerCredentials(creds);
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('karoot_owner_credentials', JSON.stringify(creds));
    }
  };

  const fetchRequests = async () => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('admin_auth_token') : null;
      if (!token) return; // Prevent polling if not logged in as admin
      
      const res = await fetch('/api/requests', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setApplications(data);
      }
    } catch {
      // Ignore fallback
    }
  };

  useEffect(() => {
    fetchRequests();
    
    let channel: any = null;
    import('../lib/echo').then(({ default: echo }) => {
      if (echo) {
        channel = echo.channel('global-updates')
          .listen('DataUpdated', () => {
            console.log('Real-time updates received (Apps)');
            fetchRequests();
          });
      }
    });

    return () => {
      if (channel && typeof channel.stopListening === 'function') {
        channel.stopListening('DataUpdated');
      }
    };
  }, []);

  useEffect(() => {
    if (typeof document !== 'undefined') {
      if (isDarkMode) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  }, [isDarkMode]);

  const handleUpdateStatus = async (id: string, status: ApplicationStatus, tempPassword?: string) => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('admin_auth_token') : null;
      const res = await fetch(`/api/requests/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : ({} as any))
        },
        body: JSON.stringify({ status, tempPassword }),
      });
      if (res.ok) {
        const data = await res.json();
        await fetchRequests();
        return data.network_code;
      }
    } catch {
      // Ignore fallback
    }
    return null;
  };

  const handleApproveWithCredentials = async (app: NetworkApplication, tempPassword: string) => {
    const networkCode = await handleUpdateStatus(app.id, 'approved', tempPassword);

    const ownerPhone = app.formData.owner.contactNumber || app.formData.owner.ownerId;
    const existingIndex = ownerCredentials.findIndex((c) => c.ownerPhone === ownerPhone);

    if (existingIndex >= 0) {
      return networkCode; // Credentials already exist, do not overwrite
    }

    const newCred: OwnerCredential = {
      ownerPhone,
      ownerName: app.formData.owner.ownerName,
      networkName: app.formData.network.networkName,
      tempPassword,
      currentPassword: tempPassword,
      mustChangePassword: true,
      createdAt: new Date().toISOString(),
    };

    const updatedCreds = [newCred, ...ownerCredentials];
    saveOwnerCredentials(updatedCreds);
    return networkCode;
  };

  const handleDeleteApplication = async (id: string) => {
    const updated = applications.filter((app) => app.id !== id);
    setApplications(updated);
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('admin_auth_token') : null;
      await fetch(`/api/requests/${id}`, { 
        method: 'DELETE',
        headers: (token ? { 'Authorization': `Bearer ${token}` } : {}) as HeadersInit
      });
    } catch {
      // Ignore fallback
    }
  };

  return (
    <AppContext.Provider
      value={{
        isDarkMode,
        setIsDarkMode,
        applications,
        setApplications,
        ownerCredentials,
        saveOwnerCredentials,
        loginOwnerId,
        setLoginOwnerId,
        activeOwnerPhone,
        setActiveOwnerPhone,
        fetchRequests,
        handleUpdateStatus,
        handleApproveWithCredentials,
        handleDeleteApplication,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
