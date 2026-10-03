import React, { useState } from 'react';
import { Moon, Sun, Key, Eye, EyeOff, Loader2, RefreshCw, Phone, Lock, ArrowRight } from 'lucide-react';

interface LoginPageProps {
  isDarkMode: boolean;
  onToggleTheme: () => void;
  onLoginSuccess?: (ownerId: string, password?: string, captcha?: string, captchaKey?: string) => Promise<void> | void;
  onBackToRegister?: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  isDarkMode,
  onToggleTheme,
  onLoginSuccess,
  onBackToRegister,
}) => {
  const [ownerId, setOwnerId] = useState(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      return params.get('phone') || params.get('ownerId') || '';
    }
    return '';
  });
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [ownerIdReadOnly, setOwnerIdReadOnly] = useState(true);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!ownerId.trim()) {
      setError('يرجى إدخال رقم المالك');
      return;
    }
    if (!password) {
      setError('يرجى إدخال كلمة المرور');
      return;
    }
    if (!captchaInput) {
      setError('يرجى إدخال رمز التحقق (الكابتشا)');
      return;
    }

    setLoading(true);

    try {
      if (onLoginSuccess) {
        await onLoginSuccess(ownerId.trim(), password, captchaInput, captchaKey);
      } else {
        alert(`تم تسجيل الدخول بنجاح! مرحباً برقم المالك: ${ownerId}`);
      }
    } catch (err: any) {
      setError(err.message || 'بيانات الدخول غير صحيحة');
      fetchCaptcha();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div dir="rtl" className={`min-h-screen flex flex-col font-['Cairo',sans-serif] ${isDarkMode ? 'bg-[#0a0f1c] text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
      <div className="flex-1 flex flex-col items-center justify-center p-4 pt-12 pb-12 w-full max-w-md mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className={`w-full p-8 sm:p-10 rounded-4xl shadow-xl relative border overflow-hidden ${isDarkMode ? 'bg-[#101726] border-slate-800/80 shadow-black/50' : 'bg-white border-slate-200 shadow-slate-300/40'}`}>
          
          <div className="absolute top-0 left-0 w-full h-32 bg-linear-to-r from-indigo-600 to-violet-500 opacity-90"></div>
          <div className="absolute top-0 left-0 w-full h-32 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-30 mix-blend-overlay"></div>
          
          <button
            onClick={onToggleTheme}
            type="button"
            className={`absolute top-4 left-4 z-20 p-2 rounded-xl transition-colors cursor-pointer ${
              isDarkMode ? 'bg-white/10 hover:bg-white/20 text-white' : 'bg-black/10 hover:bg-black/20 text-white'
            }`}
            title={isDarkMode ? 'التحويل للوضع الفاتح' : 'التحويل للوضع الداكن'}
          >
            {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>

          <div className="text-center mb-8 relative z-10 pt-4">
            <div className="relative mb-2 inline-block">
              <img 
                src={isDarkMode ? '/logos/logo-dark.png' : '/logos/logo-light.png'} 
                alt="Card Box Logo" 
                className="w-32 h-32 object-contain drop-shadow-xl rounded-3xl mx-auto"
              />
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight mb-2 mt-4">تسجيل دخول المالك</h1>
            <p className={`text-sm font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              نظام ادارة كروت الشبكات وبيعها
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
            {error && (
              <div className={`p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-sm font-bold text-center ${isDarkMode ? 'text-red-400' : 'text-red-600'}`}>
                {error}
              </div>
            )}

            <div className="space-y-1.5">
              <label className={`text-xs font-bold px-1 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>رقم المالك</label>
              <div className="relative group">
                <div className={`absolute inset-y-0 right-0 w-12 flex items-center justify-center transition-colors ${isDarkMode ? 'text-indigo-400' : 'text-indigo-500'}`}>
                  <Phone className="w-5 h-5" />
                </div>
                <input
                  type="text"
                  required
                  value={ownerId}
                  onChange={(e) => setOwnerId(e.target.value)}
                  onFocus={() => { setOwnerIdReadOnly(false); setPassReadOnly(false); }}
                  readOnly={ownerIdReadOnly}
                  autoComplete="username"
                  name="owner-phone-login"
                  className={`w-full pl-4 pr-12 py-3.5 rounded-xl outline-none text-sm font-bold font-mono text-right transition-all border ${isDarkMode ? 'bg-[#1c2638] text-white border-transparent focus:ring-2 focus:ring-indigo-500' : 'bg-slate-50 border-slate-200 focus:ring-2 focus:ring-indigo-500'}`}
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
                  onFocus={() => { setOwnerIdReadOnly(false); setPassReadOnly(false); }}
                  readOnly={passReadOnly}
                  autoComplete="current-password"
                  name="owner-password-login"
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

            <div className="flex items-center justify-start gap-2 pt-1 pb-2">
              <input
                type="checkbox"
                id="rememberMe"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className={`w-4 h-4 rounded text-indigo-600 focus:ring-0 accent-indigo-600 cursor-pointer ${
                  isDarkMode ? 'bg-[#1c2638] border-slate-600' : 'bg-slate-50 border-slate-300'
                }`}
              />
              <label htmlFor="rememberMe" className={`text-xs md:text-sm font-bold cursor-pointer select-none ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                تذكرني
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 mt-2 rounded-xl font-black text-lg flex items-center justify-center gap-3 transition-all transform active:scale-[0.98] shadow-lg text-white bg-linear-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 shadow-indigo-500/30 hover:shadow-indigo-500/50 disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : (
                <>
                  <span>تسجيل الدخول</span>
                  <ArrowRight className="w-6 h-6 rotate-180" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
