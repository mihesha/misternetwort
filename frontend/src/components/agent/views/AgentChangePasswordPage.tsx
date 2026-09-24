import React, { useState } from 'react';
import { Key, Check, Loader2, ArrowRight, Shield } from 'lucide-react';
import { PublicHeader } from '../../public/PublicHeader';

interface AgentChangePasswordPageProps {
  isDarkMode: boolean;
  onToggleTheme: () => void;
  agentName?: string;
  onPasswordChanged: (newPassword: string) => Promise<void> | void;
}

export const AgentChangePasswordPage: React.FC<AgentChangePasswordPageProps> = ({
  isDarkMode,
  onToggleTheme,
  agentName = 'حسابي',
  onPasswordChanged,
}) => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!newPassword) {
      setError('يرجى إدخال كلمة المرور الجديدة');
      return;
    }
    if (newPassword.length < 6) {
      setError('كلمة المرور يجب أن تكون 6 أحرف أو أرقام على الأقل');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('كلمات المرور غير متطابقة');
      return;
    }

    setLoading(true);

    try {
      await onPasswordChanged(newPassword);
      setLoading(false);
      setSuccess(true);
    } catch (err: any) {
      setLoading(false);
      setError(err.message || 'حدث خطأ أثناء تغيير كلمة المرور');
    }
  };

  return (
    <div dir="rtl" className={`min-h-screen flex flex-col font-['Cairo',sans-serif] ${isDarkMode ? 'bg-[#0a0f1c] text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
      <PublicHeader showNav={false} />
      
      <div className="flex-1 flex flex-col items-center justify-center p-4 pt-32 pb-12 w-full max-w-md mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
        
        <div className={`w-full p-8 sm:p-10 rounded-4xl shadow-xl relative border overflow-hidden ${isDarkMode ? 'bg-[#101726] border-slate-800/80 shadow-black/50' : 'bg-white border-slate-200 shadow-slate-300/40'}`}>
          
          <div className="absolute top-0 left-0 w-full h-32 bg-linear-to-r from-indigo-600 to-violet-500 opacity-90"></div>
          <div className="absolute top-0 left-0 w-full h-32 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-30 mix-blend-overlay"></div>
          
          {success ? (
            <div className="relative z-10 flex flex-col items-center justify-center text-center animate-in fade-in zoom-in duration-300 py-8">
              <div className="w-20 h-20 bg-indigo-500 rounded-full flex items-center justify-center text-white mb-6 shadow-xl shadow-indigo-500/40">
                <Check className="w-10 h-10 stroke-[3]" />
              </div>
              <h3 className={`text-2xl font-black mb-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>تم تغيير كلمة المرور بنجاح!</h3>
              <p className={`text-sm font-bold ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>جاري توجيهك إلى شاشة تسجيل الدخول...</p>
            </div>
          ) : (
            <>
              <div className="text-center mb-8 relative z-10 pt-4">
                <div className={`inline-flex items-center justify-center w-20 h-20 rounded-2xl mb-6 shadow-xl relative backdrop-blur-md border bg-white/20 border-white/30 text-white`}>
                  <Shield className="w-10 h-10" />
                </div>
                <h1 className="text-2xl sm:text-3xl font-black tracking-tight mb-2">تأمين الحساب</h1>
                <p className={`text-sm font-medium ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                  أهلاً بك <span className="font-bold text-indigo-500">{agentName}</span>، يرجى تعيين كلمة مرور جديدة وأساسية قبل المتابعة
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
                {error && (
                  <div className={`p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-sm font-bold text-center ${isDarkMode ? 'text-red-400' : 'text-red-600'}`}>
                    {error}
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className={`text-xs font-bold px-1 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>كلمة المرور الجديدة</label>
                  <div className="relative group">
                    <div className={`absolute inset-y-0 right-0 w-12 flex items-center justify-center transition-colors ${isDarkMode ? 'text-indigo-400' : 'text-indigo-500'}`}>
                      <Key className="w-5 h-5" />
                    </div>
                    <input
                      type="password"
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      dir="ltr"
                      className={`w-full pl-4 pr-12 py-3.5 rounded-xl outline-none font-bold text-left transition-all border ${isDarkMode ? 'bg-[#1c2638] text-white border-transparent focus:ring-2 focus:ring-indigo-500' : 'bg-slate-50 border-slate-200 focus:ring-2 focus:ring-indigo-500'}`}
                      placeholder="••••••••"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className={`text-xs font-bold px-1 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>تأكيد كلمة المرور</label>
                  <div className="relative group">
                    <div className={`absolute inset-y-0 right-0 w-12 flex items-center justify-center transition-colors ${isDarkMode ? 'text-indigo-400' : 'text-indigo-500'}`}>
                      <Key className="w-5 h-5" />
                    </div>
                    <input
                      type="password"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      dir="ltr"
                      className={`w-full pl-4 pr-12 py-3.5 rounded-xl outline-none font-bold text-left transition-all border ${isDarkMode ? 'bg-[#1c2638] text-white border-transparent focus:ring-2 focus:ring-indigo-500' : 'bg-slate-50 border-slate-200 focus:ring-2 focus:ring-indigo-500'}`}
                      placeholder="••••••••"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 mt-6 rounded-xl font-black text-lg flex items-center justify-center gap-3 transition-all transform active:scale-[0.98] shadow-lg text-white bg-linear-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 shadow-indigo-500/30 hover:shadow-indigo-500/50 disabled:opacity-50"
                >
                  {loading ? (
                    <Loader2 className="w-6 h-6 animate-spin" />
                  ) : (
                    <>
                      <span>تحديث كلمة المرور</span>
                      <ArrowRight className="w-6 h-6 rotate-180" />
                    </>
                  )}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
