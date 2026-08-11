'use client';

import React, { useState } from 'react';
import { PhoneCall, MessageSquare, MapPin, Mail, Send, CheckCircle2 } from 'lucide-react';
import Button from '@/components/common/Button';
import Input from '@/components/common/Input';

export default function ContactPage() {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone || !message) return;
    setIsSubmitted(true);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 py-6 text-right dir-rtl">
      <div className="text-center space-y-2">
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100">
          الدعم الفني والاتصال
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
          نحن هنا لمساعدتك على مدار الساعة في أي استفسار أو مشكلة تواجهك أثناء الشراء
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Contact Info Cards */}
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 space-y-4">
            <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100">قنوات التواصل المباشر</h3>

            <a
              href="https://wa.me/967770000000"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-3.5 bg-emerald-50 dark:bg-emerald-950/40 rounded-2xl border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 font-bold text-xs sm:text-sm hover:bg-emerald-100 transition-colors"
            >
              <MessageSquare className="w-5 h-5 text-emerald-600" />
              <div>
                <span>خدمة العملاء عبر الواتساب</span>
                <span className="block text-[11px] font-mono dir-ltr text-emerald-600">+967 770 000 000</span>
              </div>
            </a>

            <a
              href="tel:+967770000000"
              className="flex items-center gap-3 p-3.5 bg-purple-50 dark:bg-purple-950/40 rounded-2xl border border-purple-200 dark:border-purple-800 text-purple-800 dark:text-purple-300 font-bold text-xs sm:text-sm hover:bg-purple-100 transition-colors"
            >
              <PhoneCall className="w-5 h-5 text-purple-600" />
              <div>
                <span>الاتصال الهاتفي المباشر</span>
                <span className="block text-[11px] font-mono dir-ltr text-purple-600">+967 770 000 000</span>
              </div>
            </a>

            <div className="flex items-center gap-3 p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 text-xs sm:text-sm">
              <MapPin className="w-5 h-5 text-purple-600 shrink-0" />
              <div>
                <span className="font-bold">المقر الرئيسي:</span>
                <span className="block text-[11px] text-slate-500">اليمن - صنعاء - شارع الزبيري</span>
              </div>
            </div>
          </div>
        </div>

        {/* Send Message Form */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6">
          {isSubmitted ? (
            <div className="py-12 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-emerald-500 text-white flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100">تم إرسال رسالتك بنجاح!</h3>
              <p className="text-xs text-slate-500">سيتواصل معك فريق الدعم الفني عبر الرقم المدخل في أسرع وقت.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100 mb-2">أرسل استفسارك</h3>
              <Input
                label="الاسم"
                placeholder="أدخل اسمك"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <Input
                label="رقم الهاتف"
                placeholder="7XXXXXXXX"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  تفاصيل الاستفسار
                </label>
                <textarea
                  rows={4}
                  placeholder="اكتب رسالتك أو استفسارك هنا..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-sm focus:ring-2 focus:ring-purple-500/20 outline-none"
                />
              </div>
              <Button
                type="submit"
                variant="primary"
                size="lg"
                icon={<Send className="w-4 h-4" />}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold"
              >
                إرسال الرسالة
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
