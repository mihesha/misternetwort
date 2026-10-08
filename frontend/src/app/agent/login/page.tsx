"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Shield, Phone, Lock, ArrowRight, Loader2, Sparkles, Network, Eye, EyeOff, RefreshCw } from 'lucide-react';
import { useAppContext } from '../../../context/AppContext';
import { PublicHeader } from '../../../components/public/PublicHeader';

export default function AgentLoginPage() {
  const { isDarkMode } = useAppContext();
  const router = useRouter();
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
        body: JSON.stringify({ phone, password, captcha: captchaInput, captcha_key: captchaKey, role: 'agent' })
      });

      const data = await res.json();

      if (res.ok) {
        if (data.user.role !== 'agent') {
          setError('هذا الحساب ليس حساب وكيل.');
          setIsLoading(false);
          return;
        }
        localStorage.setItem('auth_token', data.token);
        localStorage.setItem('agent_user', JSON.stringify(data.user));

        if (data.user.must_change_password) {
          router.push('/agent/change-password'); // Redirect to agent change password logic
        } else {
          router.push('/agent');
        }
      } else {
        setError(data.message || 'رقم الهاتف أو كلمة المرور غير صحيحة');
        fetchCaptcha();
      }
    } catch (err) {
      setError('فشل الاتصال بالخادم. يرجى المحاولة لاحقاً.');
      fetchCaptcha();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div dir="rtl" className={`min-h-screen flex flex-col font-['Cairo',sans-serif] ${isDarkMode ? 'bg-[#0a0f1c] text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
      <PublicHeader showNav={false} />

      <div className="flex-1 flex flex-col items-center justify-center p-4 pt-32 pb-12 w-full max-w-md mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">

        <div className={`w-full p-8 sm:p-10 rounded-4xl shadow-xl relative border overflow-hidden ${isDarkMode ? 'bg-[#101726] border-slate-800/80 shadow-black/50' : 'bg-white border-slate-200 shadow-slate-300/40'}`}>

          <div className="absolute top-0 left-0 w-full h-32 bg-linear-to-r from-indigo-600 to-violet-500 opacity-90"></div>
          <div className="absolute top-0 left-0 w-full h-32 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-30 mix-blend-overlay"></div>

          <div className="text-center mb-8 relative z-10 pt-4">
            <div className={`inline-flex items-center justify-center w-20 h-20 rounded-2xl mb-6 shadow-xl relative backdrop-blur-md border bg-white/20 border-white/30 text-white`}>
              <Network className="w-10 h-10" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight mb-2">تسجيل دخول الوكيل</h1>
            <p className={`text-sm font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              أدخل بياناتك للوصول إلى لوحة التحكم الخاصة بك
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5 relative z-10">
            {error && (
              <div className={`p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-sm font-bold text-center ${isDarkMode ? 'text-red-400' : 'text-red-600'}`}>
                {error}
              </div>
            )}

            <div className="space-y-1.5">
              <label className={`text-xs font-bold px-1 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>رقم الجوال</label>
              <div className="relative group">
                <div className={`absolute inset-y-0 right-0 w-12 flex items-center justify-center transition-colors ${isDarkMode ? 'text-indigo-400' : 'text-indigo-500'}`}>
                  <Phone className="w-5 h-5" />
                </div>
                <input
                  type="text"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  onFocus={() => { setPhoneReadOnly(false); setPassReadOnly(false); }}
                  readOnly={phoneReadOnly}
                  autoComplete="username"
                  name="agent-phone-login"
                  className={`w-full pl-4 pr-12 py-3.5 rounded-xl outline-none font-bold font-mono text-right transition-all border ${isDarkMode ? 'bg-[#1c2638] text-white border-transparent focus:ring-2 focus:ring-indigo-500' : 'bg-slate-50 border-slate-200 focus:ring-2 focus:ring-indigo-500'}`}
                  placeholder="7XXXXXXXX"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className={`text-xs font-bold px-1 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>كلمة المرور</label>
              <div className="relative group">
                <div className={`absolute inset-y-0 right-0 w-12 flex items-center justify-center transition-colors ${isDarkMode ? 'text-indigo-400' : 'text-indigo-500'}`}>
                  <Lock className="w-5 h-5" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => { setPhoneReadOnly(false); setPassReadOnly(false); }}
                  readOnly={passReadOnly}
                  autoComplete="current-password"
                  name="agent-password-login"
                  className={`w-full pl-12 pr-12 py-3.5 rounded-xl outline-none font-bold text-right transition-all border ${isDarkMode ? 'bg-[#1c2638] text-white border-transparent focus:ring-2 focus:ring-indigo-500' : 'bg-slate-50 border-slate-200 focus:ring-2 focus:ring-indigo-500'}`}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className={`absolute inset-y-0 left-0 w-12 flex items-center justify-center transition-colors ${isDarkMode ? 'text-slate-400 hover:text-indigo-400' : 'text-slate-400 hover:text-indigo-500'}`}
                  tabIndex={-1}
                >
                  {showPassword ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className={`text-xs font-bold px-1 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>رمز التحقق (Captcha)</label>
              <div className="flex gap-2" dir="ltr">
                <div 
                  className="relative rounded-xl overflow-hidden cursor-pointer border border-slate-200 dark:border-slate-700 shrink-0 bg-white group"
                  onClick={fetchCaptcha}
                  title="اضغط لتغيير الصورة"
                >
                  {captchaImg ? (
                    <>
                      <img src={captchaImg} alt="captcha" className="h-[46px] w-[110px] object-cover transition-opacity group-hover:opacity-50" />
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20">
                        <RefreshCw className="w-5 h-5 text-white" />
                      </div>
                    </>
                  ) : (
                    <div className="h-[46px] w-[110px] flex items-center justify-center text-xs text-slate-400">
                      <Loader2 className="w-4 h-4 animate-spin" />
                    </div>
                  )}
                </div>
                <input
                  type="text"
                  required
                  value={captchaInput}
                  onChange={(e) => setCaptchaInput(e.target.value)}
                  placeholder="أدخل الرمز هنا"
                  dir="rtl"
                  className={`w-full py-3.5 px-4 rounded-xl outline-none font-bold text-center transition-all border ${isDarkMode ? 'bg-[#1c2638] text-white border-transparent focus:ring-2 focus:ring-indigo-500' : 'bg-slate-50 border-slate-200 focus:ring-2 focus:ring-indigo-500'}`}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 mt-6 rounded-xl font-black text-lg flex items-center justify-center gap-3 transition-all transform active:scale-[0.98] shadow-lg text-white bg-linear-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 shadow-indigo-500/30 hover:shadow-indigo-500/50 disabled:opacity-50"
            >
              {isLoading ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : (
                <>
                  <span>تسجيل الدخول</span>
                  <ArrowRight className="w-6 h-6 rotate-180" />
                </>
              )}
            </button>
          </form>

          <div className={`mt-8 pt-6 border-t flex flex-col items-center gap-4 relative z-10 ${isDarkMode ? 'border-slate-800' : 'border-slate-100'}`}>
            <Link href="/agent/join" className={`text-sm font-bold transition-colors flex items-center gap-1.5 ${isDarkMode ? 'text-indigo-400 hover:text-white' : 'text-indigo-600 hover:text-indigo-800'}`}>
              <Sparkles className="w-4 h-4" />
              <span>ليس لديك حساب؟ انضم كوكيل</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
