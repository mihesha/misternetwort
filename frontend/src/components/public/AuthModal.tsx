'use client';

import React, { useState } from 'react';
import { User, Phone, Lock, ShieldCheck, Eye, EyeOff } from 'lucide-react';
import Modal from '@/components/common/Modal';
import Button from '@/components/common/Button';
import TermsModal from '@/components/public/TermsModal';
import { UserAccount } from '@/types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'register';
  onSuccess: (user: UserAccount) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'register',
  onSuccess,
}) => {
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);

  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreedTerms, setAgreedTerms] = useState(true);
  const [isTermsOpen, setIsTermsOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Synchronize mode when initialMode or isOpen changes
  React.useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
      setError('');
      try {
        const savedPhone = localStorage.getItem('cardbox_remember_phone');
        if (savedPhone) {
          setPhone(savedPhone);
          setRememberMe(true);
        }
      } catch {
        // Ignore localStorage error
      }
    }
  }, [isOpen, initialMode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (mode === 'register') {

      if (!phone.trim() || phone.length < 8) {
        setError('يرجى إدخال رقم جوال صحيح');
        return;
      }
      if (!password || password.length < 6) {
        setError('كلمة المرور يجب أن تكون 6 أرقام/أحرف على الأقل');
        return;
      }
      if (password !== confirmPassword) {
        setError('كلمتا المرور غير متطابقتين');
        return;
      }
      if (!agreedTerms) {
        setError('يجب الموافقة على شروط الاستخدام والخصوصية');
        return;
      }
    } else {
      if (!phone.trim()) {
        setError('يرجى إدخال رقم الجوال');
        return;
      }
      if (!password) {
        setError('يرجى إدخال كلمة المرور');
        return;
      }
    }

    if (rememberMe && phone.trim()) {
      try {
        localStorage.setItem('cardbox_remember_phone', phone.trim());
      } catch {
        // Ignore localStorage error
      }
    } else if (!rememberMe) {
      try {
        localStorage.removeItem('cardbox_remember_phone');
      } catch {
        // Ignore localStorage error
      }
    }

    setIsLoading(true);

    try {
      const endpoint = mode === 'register' ? '/api/customer/register' : '/api/customer/login';
      const formattedPhone = phone.startsWith('+967') ? phone : `+967${phone.replace(/^0+/, '')}`;

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: formattedPhone,
          password: password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        let errorMsg = data.message || 'حدث خطأ غير معروف';
        if (data.errors && data.errors.phone) {
          errorMsg = data.errors.phone[0];
        } else if (data.errors && data.errors.password) {
          errorMsg = data.errors.password[0];
        }
        setError(errorMsg);
        setIsLoading(false);
        return;
      }

      // Save token (if you have token logic)
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
      onClose();
    } catch (err) {
      setError('لا يمكن الاتصال بالخادم حالياً. حاول مرة أخرى.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="md"
    >
      <div className="space-y-5 text-right dir-rtl">
        {/* Title & Description */}
        <div className="text-center space-y-1 pt-1 pb-1">
          <h2 className="text-2xl sm:text-3xl font-black text-blue-600 dark:text-blue-400">
            {mode === 'register' ? 'إنشاء حساب جديد' : 'تسجيل الدخول'}
          </h2>
          <p className="text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400">
            {mode === 'register'
              ? 'أدخل بياناتك لإنشاء حساب جديد في Card Box كارد بوكس'
              : 'أدخل رقم الجوال وكلمة المرور للوصول إلى حسابك'}
          </p>
        </div>

        {error && (
          <div className="p-3 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800/80 rounded-2xl text-xs text-red-600 dark:text-red-400 font-semibold text-center">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">


          {/* Phone Field with Integrated Country Code */}
          <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5 text-right">
              رقم الجوال
            </label>
            <div className="flex items-center bg-slate-50/80 dark:bg-slate-900/80 border border-purple-200/90 dark:border-purple-900/50 rounded-2xl p-1 focus-within:border-purple-500 focus-within:ring-2 focus-within:ring-purple-500/20 transition-all dir-rtl">
              {/* Country Code Block on Left */}
              <div className="flex items-center gap-1.5 px-3 py-2 text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300 border-l border-slate-200 dark:border-slate-700 select-none shrink-0">
                <span>🇾🇪</span>
                <span dir="ltr" className="text-slate-800 dark:text-slate-200">+967</span>
              </div>
              {/* Input Field on Right */}
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

          {/* Password Field */}
          <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5 text-right">
              كلمة المرور
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

            {/* Remember Me & Forgot Password Row (Only in Login Mode) */}
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
                  onClick={() => setError('يرجى التواصل مع الدعم الفني لإعادة تعيين كلمة المرور')}
                  className="font-bold text-purple-600 dark:text-purple-400 hover:underline cursor-pointer"
                >
                  نسيت كلمة المرور؟
                </button>
              </div>
            )}
          </div>

          {/* Confirm Password (Register Mode) */}
          {mode === 'register' && (
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

          {/* Terms & Privacy Policy Review Modal */}
          <TermsModal
            isOpen={isTermsOpen}
            onClose={() => setIsTermsOpen(false)}
            onAccept={() => setAgreedTerms(true)}
          />

          {/* Submit Button */}
          <Button
            type="submit"
            variant="primary"
            size="lg"
            isLoading={isLoading}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3.5 rounded-2xl text-base shadow-lg shadow-purple-600/25 mt-2"
          >
            {mode === 'register' ? 'إنشاء حساب' : 'تسجيل الدخول'}
          </Button>
        </form>

        {/* Switch Mode Footer */}
        <div className="text-center pt-3 border-t border-slate-100 dark:border-slate-800 text-xs sm:text-sm">
          {mode === 'register' ? (
            <p className="text-slate-500 dark:text-slate-400">
              لديك حساب بالفعل؟{' '}
              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setError('');
                }}
                className="text-purple-600 dark:text-purple-400 font-bold hover:underline"
              >
                تسجيل الدخول
              </button>
            </p>
          ) : (
            <p className="text-slate-500 dark:text-slate-400">
              ليس لديك حساب؟{' '}
              <button
                type="button"
                onClick={() => {
                  setMode('register');
                  setError('');
                }}
                className="text-purple-600 dark:text-purple-400 font-bold hover:underline"
              >
                إنشاء حساب جديد
              </button>
            </p>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default AuthModal;
