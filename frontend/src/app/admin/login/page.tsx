"use client";
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldCheck, Lock, Phone, ArrowLeft, Loader2, Moon, Sun, Eye, EyeOff, RefreshCw } from 'lucide-react';
import { useAppContext } from '../../../context/AppContext';

export default function AdminLoginPage() {
  const router = useRouter();
  const { isDarkMode, setIsDarkMode } = useAppContext();
  
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [phoneReadOnly, setPhoneReadOnly] = useState(true);
  const [passReadOnly, setPassReadOnly] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [captchaImg, setCaptchaImg] = useState('');
  const [captchaKey, setCaptchaKey] = useState('');
  const [captchaInput, setCaptchaInput] = useState('');

  const fetchCaptcha = async () => {
    try {
      const res = await fetch('/api/captcha');
      if (!res.ok) throw new Error('فشل تحميل الكابتشا');
      const data = await res.json();
      setCaptchaImg(data.img);
      setCaptchaKey(data.key);
      setCaptchaInput('');
    } catch (err) {
      console.error('Failed to load captcha', err);
      setError('لا يمكن الاتصال بالخادم لجلب رمز التحقق، يرجى المحاولة لاحقاً');
    }
  };

  React.useEffect(() => {
    fetchCaptcha();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone || !password || !captchaInput) {
      setError('يرجى إدخال جميع الحقول بما فيها رمز التحقق');
      return;
    }
    
    setIsLoading(true);
    setError('');

    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          phone, 
          password,
          captcha: captchaInput,
          captcha_key: captchaKey,
          role: ['admin', 'super_admin']
        })
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
      fetchCaptcha(); // Reload captcha on failure
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
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                onFocus={() => { setPhoneReadOnly(false); setPassReadOnly(false); }}
                readOnly={phoneReadOnly}
                placeholder="أدخل رقم الهاتف"
                autoComplete="username"
                name="admin-phone-login"
                className={`w-full pr-12 pl-4 py-3.5 rounded-xl text-right text-sm font-bold font-mono outline-none transition-all ${
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
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onFocus={() => { setPhoneReadOnly(false); setPassReadOnly(false); }}
                readOnly={passReadOnly}
                placeholder="أدخل كلمة المرور"
                autoComplete="current-password"
                name="admin-password-login"
                className={`w-full pr-12 pl-12 py-3.5 rounded-xl text-right text-sm font-bold outline-none transition-all ${
                  isDarkMode 
                    ? 'bg-[#182232] border-slate-700 text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500' 
                    : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600'
                } border`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className={`absolute left-4 top-1/2 -translate-y-1/2 flex items-center justify-center transition-colors ${isDarkMode ? 'text-slate-400 hover:text-indigo-400' : 'text-slate-400 hover:text-indigo-500'}`}
                tabIndex={-1}
              >
                {showPassword ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <div>
            <label className={`block text-xs font-bold mb-2 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>رمز التحقق (Captcha)</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={captchaInput}
                onChange={(e) => setCaptchaInput(e.target.value)}
                placeholder="أدخل الرمز"
                className={`w-full px-4 py-3.5 rounded-xl text-center text-sm font-bold font-mono outline-none transition-all ${
                  isDarkMode 
                    ? 'bg-[#182232] border-slate-700 text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500' 
                    : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600'
                } border`}
              />
              <div 
                className="relative rounded-xl overflow-hidden cursor-pointer border border-slate-200 dark:border-slate-700 shrink-0 bg-white group"
                onClick={fetchCaptcha}
                title="اضغط لتغيير الصورة"
              >
                {captchaImg ? (
                  <>
                    <img src={captchaImg} alt="captcha" className="h-full w-32 object-cover transition-opacity group-hover:opacity-50" />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20">
                      <RefreshCw className="w-5 h-5 text-white" />
                    </div>
                  </>
                ) : (
                  <div className="h-full w-32 flex items-center justify-center text-xs text-slate-400">
                    <Loader2 className="w-4 h-4 animate-spin" />
                  </div>
                )}
              </div>
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
