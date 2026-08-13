"use client";
import React, { useState, useEffect } from 'react';
import { PublicHeader } from './components/public/PublicHeader';
import { JoiningForm } from './components/public/portal/JoiningForm';
import { RequestSuccessModal } from './components/public/portal/RequestSuccessModal';
import { RequestTracker } from './components/public/portal/RequestTracker';
import { ApplicationFormData, NetworkApplication, ApplicationStatus, OwnerCredential } from './types';
import { useAppContext } from './context/AppContext';

export default function App() {
  const { isDarkMode, setIsDarkMode } = useAppContext();
  const [currentView, setCurrentView] = useState<'register' | 'login' | 'change_password' | 'privacy_policy' | 'owner_dashboard' | 'admin_dashboard'>('register');
  const [applications, setApplications] = useState<NetworkApplication[]>([]);
  const [editingApp, setEditingApp] = useState<NetworkApplication | null>(null);
  const [submittedApp, setSubmittedApp] = useState<NetworkApplication | null>(null);
  const [formKey, setFormKey] = useState<number>(Date.now());
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [loginOwnerId, setLoginOwnerId] = useState<string>('هشام محمد الجايفي');
  const [activeOwnerPhone, setActiveOwnerPhone] = useState<string>('775945393');
  const [passwordChangeSuccessAlert, setPasswordChangeSuccessAlert] = useState<boolean>(false);

  // Owner credentials storage
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

  // Save credentials to localStorage
  const saveOwnerCredentials = (creds: OwnerCredential[]) => {
    setOwnerCredentials(creds);
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('karoot_owner_credentials', JSON.stringify(creds));
    }
  };

  // Check URL params for ?view=login or ?view=admin or ?ref=...
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const viewParam = params.get('view');
    const refParam = params.get('ref');

    if (viewParam === 'login' || params.has('login')) {
      setCurrentView('login');
    } else if (viewParam === 'admin') {
      setCurrentView('admin_dashboard');
    }

    if (refParam && applications.length > 0) {
      const found = applications.find((a) => a.referenceNumber === refParam || a.id === refParam);
      if (found) {
        setEditingApp(found);
        setCurrentView('register');
      }
    }
  }, [applications]);

  // Load applications from API and localStorage fallback
  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const res = await fetch('/api/requests');
      if (res.ok) {
        const data = await res.json();
        setApplications(data);
      }
    } catch {
      // API only
    }
  };

  // Submit Handler
  const handleSubmitForm = async (formData: ApplicationFormData) => {
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        const data = await res.json();
        const newApp: NetworkApplication = data.application || data;
        setApplications([newApp, ...applications]);
        setSubmittedApp(newApp);
        setFormKey(Date.now()); // Reset form
      } else {
        const err = await res.json();
        alert("فشل إرسال الطلب: " + JSON.stringify(err));
      }
    } catch {
       alert("فشل الاتصال بالخادم عند تقديم الطلب");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNavigate = (view: 'register' | 'login') => {
    setCurrentView(view);
    const url = new URL(window.location.href);
    if (view === 'login') {
      url.searchParams.set('view', 'login');
    } else {
      url.searchParams.delete('view');
    }
    window.history.pushState({}, '', url.toString());
  };

  // Handler when Admin Approves an application & generates temporary password
  const handleUpdateStatus = async (id: string, status: ApplicationStatus, tempPassword?: string) => {

    try {
      const res = await fetch(`/api/requests/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, tempPassword }),
      });
      if (res.ok) {
        const data = await res.json();
        await fetchRequests(); // Refresh from DB
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

    const newCred: OwnerCredential = {
      ownerPhone,
      ownerName: app.formData.owner.ownerName,
      networkName: app.formData.network.networkName,
      tempPassword,
      currentPassword: tempPassword,
      mustChangePassword: true,
      createdAt: new Date().toISOString(),
    };

    let updatedCreds: OwnerCredential[];
    if (existingIndex >= 0) {
      updatedCreds = [...ownerCredentials];
      updatedCreds[existingIndex] = newCred;
    } else {
      updatedCreds = [newCred, ...ownerCredentials];
    }
    saveOwnerCredentials(updatedCreds);
    return networkCode;
  };

  const handleLoginSubmit = async (ownerIdInput: string, inputPassword?: string) => {
    const cleanId = ownerIdInput.trim();
    setActiveOwnerPhone(cleanId);

    // Hardcoded Admin Login
    if (cleanId === 'admin' && inputPassword === 'admin') {
      setCurrentView('admin_dashboard');
      return;
    }

    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: cleanId, password: inputPassword || 'temp-1234' })
      });

      if (res.ok) {
        const data = await res.json();
        if (typeof localStorage !== 'undefined') {
            localStorage.setItem('auth_token', data.token);
        }
        setLoginOwnerId(data.user.name);
        
        if (data.user.must_change_password) {
             setCurrentView('change_password');
        } else {
             setCurrentView('owner_dashboard');
        }
      } else {
         const errData = await res.json().catch(() => null);
         throw new Error(errData?.message || "رقم الهاتف أو كلمة المرور غير صحيحة");
      }
    } catch (err: any) {
       throw new Error(err.message || "فشل الاتصال بالسيرفر");
    }
  };

  const handlePasswordChanged = async (newPassword: string) => {
    try {
      const res = await fetch('/api/change-password', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify({ password: newPassword })
      });
      if (res.ok) {
         setPasswordChangeSuccessAlert(true);
         setCurrentView('login');
      } else {
         alert("فشل تغيير كلمة المرور");
      }
    } catch {
       // fallback for local UI if API fails
       const updatedCreds = ownerCredentials.map((c) => {
         if (c.ownerPhone === activeOwnerPhone || c.ownerName === loginOwnerId) {
           return {
             ...c,
             currentPassword: newPassword,
             mustChangePassword: false,
           };
         }
         return c;
       });
       saveOwnerCredentials(updatedCreds);
       setPasswordChangeSuccessAlert(true);
       setCurrentView('login');
    }
  };

  const handleDeleteApplication = async (id: string) => {
    const updated = applications.filter((app) => app.id !== id);
    setApplications(updated);

    try {
      await fetch(`/api/requests/${id}`, {
        method: 'DELETE',
      });
    } catch {
      // Ignore fallback
    }
  };

  if (currentView === 'admin_dashboard') {
    if (typeof window !== 'undefined') {
      window.location.href = '/admin/overview';
    }
    return null;
  }

  if (currentView === 'owner_dashboard') {
    if (typeof window !== 'undefined') {
      window.location.href = '/owner';
    }
    return null;
  }

  if (currentView === 'privacy_policy') {
    if (typeof window !== 'undefined') window.location.href = '/privacy-policy';
    return null;
  }

  if (currentView === 'change_password') {
    if (typeof window !== 'undefined') window.location.href = '/owner/change-password';
    return null;
  }

  if (currentView === 'login') {
    if (typeof window !== 'undefined') window.location.href = '/owner/login';
    return null;
  }

  return (
    <div className="min-h-screen transition-colors font-['Cairo',sans-serif] bg-slate-50 text-slate-900 dark:bg-[#0a0f1c] dark:text-slate-100 selection:bg-indigo-500/30">
      {/* Universal Public Header without Nav Links */}
      <PublicHeader showNav={false} />

      {/* Main View Router */}
      <main className="container mx-auto px-4 pt-28 pb-16 space-y-12 relative z-0">
        {/* Full width Purple Banner: طلب انضمام جديد */}
        <div className="w-full max-w-2xl mx-auto mb-8 mt-2">
          <div className="w-full bg-[#5b3bf0] text-white font-extrabold text-lg md:text-xl py-4 px-6 rounded-2xl shadow-lg shadow-purple-900/30 text-center tracking-wide border border-indigo-400/20">
            طلب انضمام جديد
          </div>
        </div>

        <JoiningForm
          key={formKey}
          onSubmit={handleSubmitForm}
          isDarkMode={isDarkMode}
          isSubmitting={isSubmitting}
        />

        <RequestTracker
          applications={applications}
          isDarkMode={isDarkMode}
        />
      </main>

      {/* Success Confirmation Modal */}
      <RequestSuccessModal
        application={submittedApp}
        onClose={() => setSubmittedApp(null)}
        isDarkMode={isDarkMode}
      />
    </div>
  );
}
