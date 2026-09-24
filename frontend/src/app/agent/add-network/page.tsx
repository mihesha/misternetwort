"use client";
import React, { useState } from 'react';
import { useAppContext } from '../../../context/AppContext';
import { JoiningForm } from '../../../components/public/portal/JoiningForm';
import { RequestSuccessModal } from '../../../components/public/portal/RequestSuccessModal';
import { ApplicationFormData, NetworkApplication } from '../../../types';

export default function AgentAddNetworkPage() {
  const { isDarkMode } = useAppContext();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedApp, setSubmittedApp] = useState<NetworkApplication | null>(null);
  const [formKey, setFormKey] = useState(Date.now());

  const handleSubmitForm = async (formData: ApplicationFormData) => {
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('auth_token');
      const res = await fetch('/api/requests', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        const data = await res.json();
        setSubmittedApp(data.application || data);
        setFormKey(Date.now());
      } else {
        const err = await res.json();
        alert("فشل إرسال الطلب: " + (err.message || 'خطأ غير معروف'));
      }
    } catch {
       alert("فشل الاتصال بالخادم عند تقديم الطلب");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-12">
      <div>
        <h1 className={`text-2xl font-black ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>إضافة شبكة جديدة</h1>
        <p className={`text-sm mt-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
          قم بتعبئة بيانات الشبكة لمالكها ليتم ربطها بحسابك كوكيل واحتساب عمولاتك.
        </p>
      </div>

      <div className={`p-6 md:p-8 rounded-4xl border ${isDarkMode ? 'bg-[#141d2b] border-white/5 shadow-xl shadow-black/20' : 'bg-white border-slate-100 shadow-xl shadow-blue-900/5'}`}>
        <JoiningForm
          key={formKey}
          onSubmit={handleSubmitForm}
          isDarkMode={isDarkMode}
          isSubmitting={isSubmitting}
        />
      </div>

      <RequestSuccessModal
        application={submittedApp}
        onClose={() => setSubmittedApp(null)}
        isDarkMode={isDarkMode}
      />
    </div>
  );
}
