"use client";
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldCheck, Lock, Phone, ArrowLeft, Loader2, Moon, Sun } from 'lucide-react';
import { useAppContext } from '../../../context/AppContext';

export default function AdminLoginPage() {
  const router = useRouter();
  const { isDarkMode, setIsDarkMode } = useAppContext();
  
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone || !password) {
      setError('يرجى إدخال رقم الهاتف وكلمة المرور');
      return;
    }
    
    setIsLoading(true);
    setError('');

    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, password })
      });

      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.message || data.error || 'بيانات الدخول غير صحيحة');
      }

      if (data.user && (data.user.role === 'admin' || data.user.role === 'super_admin')) {
        localStorage.setItem('admin_auth_token', data.token);
        localStorage.setItem('admin_user', JSON.stringify(data.user));
        
        // Setup axios interceptor or global auth if needed, but for now just localStorage
        window.location.href = '/admin/overview';
      } else {
        throw new Error('عفواً، هذا الحساب لا يملك صلاحيات الإدارة العليا');
      }
    } catch (err: any) {
      setError(err.message || 'فشل الاتصال بالخادم، يرجى المحاولة لاحقاً');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div dir="rtl" className={`min-h-screen flex items-center justify-center p-4 font-['Cairo',sans-serif] transition-colors relative ${isDarkMode ? 'bg-[#0a0f18]' : 'bg-slate-100'}`}>
      
      {/* Theme Toggle Button */}
      <div className="absolute top-6 left-6">
        <button
          onClick={() => setIsDarkMode(!isDarkMode)}
          className={`p-3 rounded-2xl flex items-center justify-center transition-all shadow-lg ${
            isDarkMode 
              ? 'bg-[#182232] text-slate-300 hover:bg-slate-800 border border-slate-800' 
              : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
          }`}
          title={isDarkMode ? 'تفعيل الوضع النهاري' : 'تفعيل الوضع الليلي'}
        >
          {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>
      </div>

      <div className={`w-full max-w-md p-8 rounded-3xl shadow-2xl border ${isDarkMode ? 'bg-[#121927] border-slate-800' : 'bg-white border-slate-200'}`}>
        
        <div className="flex flex-col items-center justify-center mb-8">
          <div className="mb-4">
            <img 
              src={isDarkMode ? '/logos/logo-dark.png' : '/logos/logo-light.png'} 
              alt="Card Box Logo" 
              className="w-32 h-32 object-contain drop-shadow-xl rounded-3xl"
            />
          </div>
          <h1 className={`text-2xl font-black ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Card Box - الإدارة المركزية</h1>
          <p className="text-sm text-slate-500 mt-2 font-bold">تسجيل الدخول للمشرفين فقط</p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-bold text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className={`block text-xs font-bold mb-2 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>رقم الهاتف</label>
            <div className="relative">
              <Phone className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                dir="ltr"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="أدخل رقم الهاتف"
                autoComplete="off"
                className={`w-full pr-12 pl-4 py-3.5 rounded-xl text-left text-sm font-bold outline-none transition-all ${
                  isDarkMode 
                    ? 'bg-[#182232] border-slate-700 text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500' 
                    : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600'
                } border`}
              />
            </div>
          </div>

          <div>
            <label className={`block text-xs font-bold mb-2 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>كلمة المرور</label>
            <div className="relative">
              <Lock className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="password"
                dir="ltr"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="أدخل كلمة المرور"
                autoComplete="new-password"
                className={`w-full pr-12 pl-4 py-3.5 rounded-xl text-left text-sm font-bold outline-none transition-all ${
                  isDarkMode 
                    ? 'bg-[#182232] border-slate-700 text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500' 
                    : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600'
                } border`}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-4 flex items-center justify-center gap-2 py-4 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-sm font-black transition-all shadow-lg shadow-indigo-600/30 disabled:opacity-70"
          >
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
              <>
                <span>دخول آمن</span>
                <ArrowLeft className="w-5 h-5" />
              </>
            )}
          </button>
        </form>

      </div>
    </div>
  );
}
