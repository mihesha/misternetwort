'use client';

import React, { useState, useEffect } from 'react';
import { User, Phone, Lock, ShieldCheck, Eye, EyeOff, MessageSquare } from 'lucide-react';
import Modal from '@/components/common/Modal';
import Button from '@/components/common/Button';
import TermsModal from '@/components/public/TermsModal';
import { UserAccount } from '@/types';

type AuthMode = 'login' | 'register' | 'verify-otp' | 'forgot-password' | 'verify-reset-otp' | 'reset-password-final';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: AuthMode;
  onSuccess: (user: UserAccount) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'register',
  onSuccess,
}) => {
  const [mode, setMode] = useState<AuthMode>(initialMode as AuthMode);

  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [otpArray, setOtpArray] = useState<string[]>(Array(6).fill(''));
  const [timer, setTimer] = useState(60);
  
  const [agreedTerms, setAgreedTerms] = useState(true);
  const [isTermsOpen, setIsTermsOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [toastMsg, setToastMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setMode(initialMode as AuthMode);
      setError('');
      setSuccessMsg('');
      setToastMsg('');
      setOtpArray(Array(6).fill(''));
      setTimer(60);
      try {
        const savedPhone = localStorage.getItem('cardbox_remember_phone');
        if (savedPhone) {
          setPhone(savedPhone);
          setRememberMe(true);
        }
      } catch {}
    }
  }, [isOpen, initialMode]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if ((mode === 'verify-otp' || mode === 'verify-reset-otp') && timer > 0) {
      interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [mode, timer]);

  const handleResendOTP = async () => {
    setTimer(60);
    setOtpArray(Array(6).fill(''));
    const formattedPhone = phone.startsWith('+967') ? phone : `+967${phone.replace(/^0+/, '')}`;
    
    try {
      if (mode === 'verify-reset-otp') {
        await fetch('/api/customer/auth/forgot-password', { 
          method: 'POST', 
          headers: { 'Content-Type': 'application/json' }, 
          body: JSON.stringify({ phone: formattedPhone }) 
        });
      } else {
        await fetch('/api/customer/auth/resend-otp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ phone: formattedPhone })
        });
      }
    } catch {}
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    const formattedPhone = phone.startsWith('+967') ? phone : `+967${phone.replace(/^0+/, '')}`;
    const otpCode = otpArray.join('');

    if (mode === 'register') {
      if (!phone.trim() || phone.length < 8) return setError('يرجى إدخال رقم جوال صحيح');
      if (!password || password.length < 6) return setError('كلمة المرور يجب أن تكون 6 أرقام/أحرف على الأقل');
      if (password !== confirmPassword) return setError('كلمتا المرور غير متطابقتين');
      if (!agreedTerms) return setError('يجب الموافقة على شروط الاستخدام والخصوصية');
    } else if (mode === 'login') {
      if (!phone.trim()) return setError('يرجى إدخال رقم الجوال');
      if (!password) return setError('يرجى إدخال كلمة المرور');
    } else if (mode === 'verify-otp' || mode === 'verify-reset-otp') {
      if (!otpCode || otpCode.length < 6) return setError('يرجى إدخال رمز التحقق المكون من 6 أرقام');
    } else if (mode === 'forgot-password') {
      if (!phone.trim()) return setError('يرجى إدخال رقم الجوال');
    } else if (mode === 'reset-password-final') {
      if (!password || password.length < 6) return setError('كلمة المرور الجديدة يجب أن تكون 6 أرقام/أحرف على الأقل');
      if (password !== confirmPassword) return setError('كلمتا المرور غير متطابقتين');
    }

    if (rememberMe && phone.trim() && mode === 'login') {
      try { localStorage.setItem('cardbox_remember_phone', phone.trim()); } catch {}
    } else if (!rememberMe && mode === 'login') {
      try { localStorage.removeItem('cardbox_remember_phone'); } catch {}
    }

    setIsLoading(true);

    try {
      let endpoint = '';
      let body: any = { phone: formattedPhone };

      if (mode === 'register') {
        endpoint = '/api/customer/register';
        body.password = password;
      } else if (mode === 'login') {
        endpoint = '/api/customer/login';
        body.password = password;
      } else if (mode === 'verify-otp') {
        endpoint = '/api/customer/auth/verify-otp';
        body.otp_code = otpCode;
      } else if (mode === 'forgot-password') {
        endpoint = '/api/customer/auth/forgot-password';
      } else if (mode === 'verify-reset-otp') {
        endpoint = '/api/customer/auth/check-otp';
        body.otp_code = otpCode;
      } else if (mode === 'reset-password-final') {
        endpoint = '/api/customer/auth/reset-password';
        body.otp_code = otpCode;
        body.new_password = password;
      }

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 403 && data.status === 'unverified') {
          setMode('verify-otp');
          setError('حسابك غير مفعل، يرجى إدخال رمز التحقق الذي تم إرساله لجوالك الآن.');
          setOtpArray(Array(6).fill(''));
          setTimer(60);
          setIsLoading(false);
          return;
        }
        let errorMsg = data.message || 'حدث خطأ غير معروف';
        if (data.errors) {
          errorMsg = (Object.values(data.errors) as any[])[0]?.[0] || errorMsg;
        }
        setError(errorMsg);
        setIsLoading(false);
        return;
      }

      // Routing logic based on mode
      if (mode === 'register') {
        setMode('verify-otp');
        setOtpArray(Array(6).fill(''));
        setTimer(60);
      } else if (mode === 'forgot-password') {
        setMode('verify-reset-otp');
        setOtpArray(Array(6).fill(''));
        setTimer(60);
      } else if (mode === 'verify-reset-otp') {
        setToastMsg('تم التحقق من الرمز بنجاح ✓');
        setTimeout(() => {
          setToastMsg('');
          setMode('reset-password-final');
          setPassword('');
          setConfirmPassword('');
        }, 1200);
      } else if (mode === 'reset-password-final') {
        setToastMsg('تم تعيين كلمة المرور بنجاح ✓');
        setTimeout(() => {
          setToastMsg('');
          setMode('login');
          setPassword('');
          setOtpArray(Array(6).fill(''));
        }, 1500);
      } else if (mode === 'verify-otp' || mode === 'login') {
        if (mode === 'verify-otp') {
          setToastMsg('تم التحقق وتفعيل الحساب بنجاح ✓');
          await new Promise(resolve => setTimeout(resolve, 1500));
          setToastMsg('');
        }
        
        if (data.token) {
          localStorage.setItem('cardbox_customer_token', data.token);
        }
        const userAccount: UserAccount = {
          fullName: data.user.name,
          phone: data.user.phone,
          countryCode: '+967',
          isLoggedIn: true,
          balance: 1000,
          token: data.token,
          wallet_balance: data.user.wallet_balance || 0,
        };
        onSuccess(userAccount);
        window.dispatchEvent(new CustomEvent('auth_success', { detail: userAccount }));
        onClose();
      }
    } catch (err) {
      setError('لا يمكن الاتصال بالخادم حالياً. حاول مرة أخرى.');
    } finally {
      setIsLoading(false);
    }
  };

  const getTitle = () => {
    switch (mode) {
      case 'register': return 'إنشاء حساب جديد';
      case 'login': return 'تسجيل الدخول';
      case 'verify-otp': return 'تحقق من الرمز';
      case 'forgot-password': return 'نسيت كلمة المرور';
      case 'verify-reset-otp': return 'إدخال رمز التحقق';
      case 'reset-password-final': return 'كلمة مرور جديدة';
    }
  };

  const getDescription = () => {
    switch (mode) {
      case 'register': return 'أدخل بياناتك لإنشاء حساب جديد في Card Box';
      case 'login': return 'أدخل رقم الجوال وكلمة المرور للوصول لحسابك';
      case 'verify-otp': return 'أدخل رمز التحقق المرسل في رسالة SMS لجوالك';
      case 'forgot-password': return 'أدخل رقم الجوال لاستلام رمز استعادة الحساب';
      case 'verify-reset-otp': return 'تم إرسال رمز التحقق، يرجى إدخاله هنا للمتابعة';
      case 'reset-password-final': return 'قم بإدخال كلمة مرور جديدة وتأكيدها';
    }
  };

  const getButtonText = () => {
    switch (mode) {
      case 'register': return 'إنشاء حساب';
      case 'login': return 'تسجيل الدخول';
      case 'forgot-password': return 'إرسال الرمز';
      case 'verify-reset-otp': 
      case 'verify-otp': return 'تحقق من الرمز';
      case 'reset-password-final': return 'حفظ كلمة المرور والدخول';
    }
  };

  return (
    <>
      {/* Elegant Floating Toast */}
      {toastMsg && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] animate-in slide-in-from-top-4 fade-in duration-300">
          <div className="bg-emerald-600/90 backdrop-blur-md text-white px-6 py-3.5 rounded-full shadow-2xl shadow-emerald-600/30 flex items-center gap-3 font-bold text-sm border border-emerald-500/50">
            <ShieldCheck className="w-5 h-5 animate-pulse" />
            <span>{toastMsg}</span>
          </div>
        </div>
      )}

      <Modal
        isOpen={isOpen}
        onClose={onClose}
        maxWidth="md"
      >
      <div className="space-y-5 text-right dir-rtl">
        <div className="text-center space-y-1 pt-1 pb-1">
          <h2 className="text-2xl sm:text-3xl font-black text-blue-600 dark:text-blue-400">
            {getTitle()}
          </h2>
          <p className="text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400">
            {getDescription()}
          </p>
        </div>

        {error && (
          <div className="p-3 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800/80 rounded-2xl text-xs text-red-600 dark:text-red-400 font-semibold text-center">
            {error}
          </div>
        )}

        {successMsg && !error && (
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800/80 rounded-2xl text-xs text-emerald-600 dark:text-emerald-400 font-semibold text-center">
            {successMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">

          {/* STEP: Phone Input */}
          {(mode === 'register' || mode === 'login' || mode === 'forgot-password') && (
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5 text-right">
                رقم الجوال
              </label>
              <div className="flex items-center bg-slate-50/80 dark:bg-slate-900/80 border border-purple-200/90 dark:border-purple-900/50 rounded-2xl p-1 focus-within:border-purple-500 focus-within:ring-2 focus-within:ring-purple-500/20 transition-all dir-rtl">
                <div className="flex items-center gap-1.5 px-3 py-2 text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300 border-l border-slate-200 dark:border-slate-700 select-none shrink-0">
                  <span>🇾🇪</span>
                  <span dir="ltr" className="text-slate-800 dark:text-slate-200">+967</span>
                </div>
                <input
                  type="text"
                  dir="ltr"
                  placeholder="7XXXXXXXX"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/[^0-9]/g, ''))}
                  maxLength={9}
                  className="w-full bg-transparent text-slate-900 dark:text-slate-100 text-sm font-medium px-3.5 py-2.5 text-left placeholder:text-left placeholder:text-slate-400 focus:outline-none"
                />
              </div>
            </div>
          )}

          {/* STEP: OTP 6-Boxes Input */}
          {(mode === 'verify-otp' || mode === 'verify-reset-otp') && (
            <div className="space-y-4 py-2">
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 text-center">
                الرمز مكون من 6 أرقام
              </label>
              <div className="flex justify-center gap-2 sm:gap-3" dir="ltr">
                {otpArray.map((digit, idx) => (
                  <input
                    key={idx}
                    id={`otp-input-${idx}`}
                    type="text"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (!/^[0-9]*$/.test(val)) return;
                      const newArr = [...otpArray];
                      newArr[idx] = val;
                      setOtpArray(newArr);
                      
                      if (val !== '' && idx < 5) {
                        const next = document.getElementById(`otp-input-${idx + 1}`);
                        if (next) next.focus();
                      }
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Backspace' && digit === '' && idx > 0) {
                        const prev = document.getElementById(`otp-input-${idx - 1}`);
                        if (prev) {
                          prev.focus();
                          const newArr = [...otpArray];
                          newArr[idx - 1] = '';
                          setOtpArray(newArr);
                        }
                      }
                    }}
                    onPaste={(e) => {
                      e.preventDefault();
                      const pastedData = e.clipboardData.getData('text/plain').replace(/[^0-9]/g, '');
                      if (pastedData) {
                        const newArr = [...otpArray];
                        const digits = pastedData.split('').slice(0, 6 - idx);
                        for (let i = 0; i < digits.length; i++) {
                          newArr[idx + i] = digits[i];
                        }
                        setOtpArray(newArr);
                        
                        const nextFocusIdx = Math.min(5, idx + digits.length);
                        const next = document.getElementById(`otp-input-${nextFocusIdx}`);
                        if (next) next.focus();
                      }
                    }}
                    className="w-10 h-12 sm:w-12 sm:h-14 bg-slate-50 dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20 rounded-xl text-center text-lg font-black text-slate-900 dark:text-white transition-all outline-none shadow-sm"
                  />
                ))}
              </div>
              <div className="text-center pt-2">
                {timer > 0 ? (
                  <p className="text-xs font-bold text-slate-500 dark:text-slate-400">
                    يمكنك إعادة الإرسال بعد <span className="text-amber-500 text-sm mx-1">{timer}</span> ثانية
                  </p>
                ) : (
                  <button 
                    type="button" 
                    onClick={handleResendOTP}
                    className="text-xs font-bold text-purple-600 dark:text-purple-400 hover:underline hover:text-purple-700 transition-colors"
                  >
                    إعادة إرسال الرمز
                  </button>
                )}
              </div>
            </div>
          )}

          {/* STEP: Password Input */}
          {(mode === 'register' || mode === 'login' || mode === 'reset-password-final') && (
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5 text-right">
                {mode === 'reset-password-final' ? 'كلمة المرور الجديدة' : 'كلمة المرور'}
              </label>
              <div className="relative flex items-center bg-slate-50/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-2xl p-1 focus-within:border-purple-500 focus-within:ring-2 focus-within:ring-purple-500/20 transition-all dir-rtl">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="........"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-transparent text-slate-900 dark:text-slate-100 text-sm font-medium py-2.5 pr-10 pl-10 text-right placeholder:text-slate-400 focus:outline-none"
                />
                <Lock className="w-5 h-5 text-slate-400 absolute right-3 pointer-events-none" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="p-1.5 text-slate-400 hover:text-purple-600 transition-colors absolute left-2.5 cursor-pointer"
                  tabIndex={-1}
                >
                  {showPassword ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                </button>
              </div>

              {mode === 'login' && (
                <div className="mt-2.5 flex items-center justify-between text-xs select-none dir-rtl">
                  <label className="flex items-center gap-2 cursor-pointer text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors font-medium">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="rounded border-slate-300 dark:border-slate-700 text-purple-600 focus:ring-purple-500 w-4 h-4 cursor-pointer"
                    />
                    <span>تذكرني</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setMode('forgot-password');
                      setError('');
                      setSuccessMsg('');
                    }}
                    className="font-bold text-purple-600 dark:text-purple-400 hover:underline cursor-pointer"
                  >
                    نسيت كلمة المرور؟
                  </button>
                </div>
              )}
            </div>
          )}

          {/* STEP: Confirm Password */}
          {(mode === 'register' || mode === 'reset-password-final') && (
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5 text-right">
                تأكيد كلمة المرور
              </label>
              <div className="relative flex items-center bg-slate-50/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-2xl p-1 focus-within:border-purple-500 focus-within:ring-2 focus-within:ring-purple-500/20 transition-all dir-rtl">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="........"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-transparent text-slate-900 dark:text-slate-100 text-sm font-medium py-2.5 pr-10 pl-10 text-right placeholder:text-slate-400 focus:outline-none"
                />
                <ShieldCheck className="w-5 h-5 text-slate-400 absolute right-3 pointer-events-none" />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="p-1.5 text-slate-400 hover:text-purple-600 transition-colors absolute left-2.5 cursor-pointer"
                  tabIndex={-1}
                >
                  {showConfirmPassword ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                </button>
              </div>
            </div>
          )}

          {/* Terms Checkbox */}
          {mode === 'register' && (
            <div className="flex items-center justify-between gap-2.5 pt-1 text-xs text-slate-600 dark:text-slate-400 select-none text-right dir-rtl">
              <span className="leading-relaxed">
                أوافق على{' '}
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    setIsTermsOpen(true);
                  }}
                  className="text-purple-600 dark:text-purple-400 font-bold underline hover:text-purple-700 cursor-pointer inline"
                >
                  سياسة الاستخدام والخصوصية
                </button>{' '}
                الخاصة بـ Card Box كارد بوكس.
              </span>
              <input
                type="checkbox"
                checked={agreedTerms}
                onChange={(e) => setAgreedTerms(e.target.checked)}
                className="rounded border-slate-300 dark:border-slate-700 text-purple-600 focus:ring-purple-500 w-4.5 h-4.5 cursor-pointer shrink-0"
              />
            </div>
          )}

          <TermsModal
            isOpen={isTermsOpen}
            onClose={() => setIsTermsOpen(false)}
            onAccept={() => setAgreedTerms(true)}
          />

          <Button
            type="submit"
            variant="primary"
            size="lg"
            isLoading={isLoading}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3.5 rounded-2xl text-base shadow-lg shadow-purple-600/25 mt-2"
          >
            {getButtonText()}
          </Button>
        </form>

        <div className="text-center pt-3 border-t border-slate-100 dark:border-slate-800 text-xs sm:text-sm">

          {mode === 'login' && (
            <p className="text-slate-500 dark:text-slate-400">
              ليس لديك حساب؟{' '}
              <button
                type="button"
                onClick={() => {
                  setMode('register');
                  setError('');
                  setSuccessMsg('');
                }}
                className="text-purple-600 dark:text-purple-400 font-bold hover:underline"
              >
                إنشاء حساب جديد
              </button>
            </p>
          )}
          {mode === 'register' && (
            <p className="text-slate-500 dark:text-slate-400">
              لديك حساب بالفعل؟{' '}
              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setError('');
                  setSuccessMsg('');
                }}
                className="text-purple-600 dark:text-purple-400 font-bold hover:underline"
              >
                تسجيل الدخول
              </button>
            </p>
          )}
        </div>
      </div>
    </Modal>
    </>
  );
};

export default AuthModal;
