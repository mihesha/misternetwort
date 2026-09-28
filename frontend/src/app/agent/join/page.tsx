"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import { Shield, Phone, Mail, MapPin, Wallet, CheckCircle, ArrowRight, User, Sparkles, Loader2, Map, AlertCircle, ExternalLink, ShieldCheck } from 'lucide-react';
import { useAppContext } from '../../../context/AppContext';
import { PublicHeader } from '../../../components/public/PublicHeader';
import { YEMEN_GOVERNORATES } from '../../../data/yemenLocations';
import { CustomSelect } from '../../../components/common/CustomSelect';

export default function AgentJoinPage() {
  const { isDarkMode } = useAppContext();
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    jaibWalletNumber: '',
    governorate: '',
    city: '',
    neighborhood: ''
  });
  const [agreed, setAgreed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [refNumber, setRefNumber] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPrivacyPolicy, setShowPrivacyPolicy] = useState(false);

  const selectedGovObj = YEMEN_GOVERNORATES.find((g) => g.name === formData.governorate);
  const availableCities = selectedGovObj ? selectedGovObj.cities : [];

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = 'الاسم مطلوب';
    if (!/^7\d{8}$/.test(formData.phone)) newErrors.phone = 'رقم الجوال يجب أن يكون 9 أرقام ويبدأ بـ 7';
    if (!/^7\d{8}$/.test(formData.jaibWalletNumber)) newErrors.jaibWalletNumber = 'رقم المحفظة يجب أن يكون 9 أرقام ويبدأ بـ 7';
    if (!formData.email.trim() || !/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'البريد الإلكتروني غير صحيح';
    if (!formData.governorate) newErrors.governorate = 'يرجى اختيار المحافظة';
    if (!formData.city) newErrors.city = 'يرجى اختيار المدينة';
    if (!agreed) newErrors.agreed = 'يجب الموافقة على الشروط والأحكام';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    setErrors({});
    
    try {
      const res = await fetch('/api/requests/agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (res.ok) {
        const ref = data.application.referenceNumber;
        setRefNumber(ref);
        setSubmitted(true);
      } else {
        setErrors({ general: data.message || 'حدث خطأ أثناء تقديم الطلب' });
      }
    } catch (err) {
      setErrors({ general: 'فشل الاتصال بالخادم. يرجى المحاولة مرة أخرى.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleWhatsAppRedirect = () => {
    const whatsappNumber = "967780880280"; 
    const message = `مرحباً كارد بوكس،%0Aأنا الوكيل: ${formData.name}%0Aقمت بتقديم طلب انضمام كوكيل شبكات.%0Aرقم الطلب (المرجع): ${refNumber}%0Aيرجى تفعيل حسابي، وشكراً.`;
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${message}`;
    window.open(whatsappUrl, '_blank');
  };

  if (submitted) {
    return (
      <div dir="rtl" className={`min-h-screen flex flex-col font-['Cairo',sans-serif] ${isDarkMode ? 'bg-[#0a0f1c] text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
        <PublicHeader showNav={false} />
        <div className="flex-1 flex items-center justify-center p-4 pt-24 relative overflow-hidden">
          <div className={`w-full max-w-lg p-10 rounded-4xl shadow-xl text-center relative border ${isDarkMode ? 'bg-[#101726] border-slate-800 shadow-black/50' : 'bg-white border-slate-200 shadow-slate-300/40'}`}>
            <div className={`inline-flex items-center justify-center w-24 h-24 rounded-full mb-8 shadow-xl ${isDarkMode ? 'bg-indigo-500/20 border border-indigo-500/30 text-indigo-400' : 'bg-indigo-100 text-indigo-600 border border-indigo-200'}`}>
              <CheckCircle className="w-12 h-12" />
            </div>
            <h2 className="text-3xl font-black mb-4">تم إرسال طلبك بنجاح!</h2>
            <p className={`text-base font-medium mb-6 leading-relaxed ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
              لقد تلقينا طلب انضمامك كوكيل معتمد. يرجى إرسال رسالة التفعيل عبر الواتساب للإدارة لتأكيد حسابك.
            </p>
            <div className={`p-4 rounded-xl mb-8 flex flex-col gap-2 ${isDarkMode ? 'bg-white/5 border border-white/10' : 'bg-slate-50 border border-slate-200'}`}>
              <span className={`text-sm font-bold ${isDarkMode ? 'text-indigo-400' : 'text-indigo-600'}`}>رقم الطلب (المرجع)</span>
              <span className="text-2xl font-black tracking-widest">{refNumber}</span>
            </div>
            
            <button
              onClick={handleWhatsAppRedirect}
              className="w-full py-4 rounded-xl font-black text-white bg-linear-to-r from-[#10b981] to-[#059669] hover:from-[#059669] hover:to-[#047857] shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 transition-all hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] flex items-center justify-center gap-2 mb-4"
            >
              <ExternalLink className="w-5 h-5" />
              <span>إرسال رسالة التفعيل للإدارة</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div dir="rtl" className={`min-h-screen flex flex-col font-['Cairo',sans-serif] ${isDarkMode ? 'bg-[#0a0f1c] text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
      <PublicHeader showNav={false} />
      
      <div className="flex-1 flex flex-col items-center justify-center p-4 pt-32 pb-12 w-full max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
        
        {/* Banner matching the owner page */}
        <div className="relative mb-10 overflow-hidden rounded-4xl shadow-xl group w-full">
          <div className="absolute inset-0 bg-linear-to-r from-indigo-600 to-violet-500 opacity-95 transition-all duration-700" />
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-30 mix-blend-overlay" />
          
          <div className="relative p-6 md:p-8 flex flex-col md:flex-row items-center gap-5 md:gap-6 text-center md:text-right">
            <div className="inline-flex items-center justify-center p-3 bg-white/20 rounded-2xl backdrop-blur-md shadow-inner ring-1 ring-white/30 shrink-0">
              <ShieldCheck className="w-10 h-10 text-white drop-shadow-md" />
            </div>
            <div>
              <h1 className="text-xl md:text-3xl font-black text-white tracking-tight drop-shadow-lg mb-1.5">
                انضم إلينا كوكيل معتمد
              </h1>
              <p className="text-white/80 font-medium text-xs md:text-sm max-w-xl leading-relaxed">
                كن شريكاً استراتيجياً وأضف شبكات جديدة واربح عمولات مستمرة من كل عملية بيع تتم عبر الشبكات التي جلبتها.
              </p>
            </div>
          </div>
        </div>

        <div className={`w-full p-6 md:p-8 rounded-4xl shadow-xl border ${isDarkMode ? 'bg-[#101726] border-slate-800/80 shadow-black/50' : 'bg-white border-slate-200 shadow-slate-300/40'}`}>
          <form onSubmit={handleSubmit} className="space-y-6">
            {errors.general && (
              <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 text-sm font-bold text-center">
                {errors.general}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6">
              {/* Name */}
              <div className="space-y-2 md:col-span-2">
                <label className={`block text-xs font-bold ${errors.name ? 'text-rose-500' : isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>الاسم الرباعي <span className="text-rose-500">*</span></label>
                <div className="relative group">
                  <div className={`absolute inset-y-0 right-0 w-12 flex items-center justify-center transition-colors ${isDarkMode ? 'text-indigo-400' : 'text-indigo-500'}`}>
                    <User className="w-5 h-5" />
                  </div>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => { setFormData({...formData, name: e.target.value}); if(errors.name) setErrors({...errors, name: ''}) }}
                    className={`w-full pl-4 pr-12 py-3.5 rounded-xl text-sm transition-all outline-none focus:ring-2 border ${errors.name ? (isDarkMode ? 'border-rose-500 focus:ring-rose-500 bg-rose-500/10 text-white' : 'border-rose-500 focus:ring-rose-500 bg-rose-50 text-slate-800') : isDarkMode ? 'bg-[#1c2638] text-white border-transparent focus:ring-indigo-500' : 'bg-slate-50 border-slate-200 focus:ring-indigo-500'}`}
                    placeholder="الاسم كامل..."
                  />
                </div>
                {errors.name && <p className="text-xs font-bold text-rose-500">{errors.name}</p>}
              </div>

              {/* Phone */}
              <div className="space-y-2">
                <label className={`block text-xs font-bold ${errors.phone ? 'text-rose-500' : isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>رقم الجوال <span className="text-rose-500">*</span></label>
                <div className="relative group">
                  <div className={`absolute inset-y-0 right-0 w-12 flex items-center justify-center transition-colors ${isDarkMode ? 'text-indigo-400' : 'text-indigo-500'}`}>
                    <Phone className="w-5 h-5" />
                  </div>
                  <input
                    type="tel"
                    dir="ltr"
                    value={formData.phone}
                    onChange={(e) => { setFormData({...formData, phone: e.target.value}); if(errors.phone) setErrors({...errors, phone: ''}) }}
                    className={`w-full pl-4 pr-12 py-3.5 text-right rounded-xl text-sm transition-all outline-none focus:ring-2 border ${errors.phone ? (isDarkMode ? 'border-rose-500 focus:ring-rose-500 bg-rose-500/10 text-white' : 'border-rose-500 focus:ring-rose-500 bg-rose-50 text-slate-800') : isDarkMode ? 'bg-[#1c2638] text-white border-transparent focus:ring-indigo-500' : 'bg-slate-50 border-slate-200 focus:ring-indigo-500'}`}
                    placeholder="7X XXXXXXX"
                  />
                </div>
                {errors.phone && <p className="text-xs font-bold text-rose-500">{errors.phone}</p>}
              </div>

              {/* Email */}
              <div className="space-y-2">
                <label className={`block text-xs font-bold ${errors.email ? 'text-rose-500' : isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>البريد الإلكتروني <span className="text-rose-500">*</span></label>
                <div className="relative group">
                  <div className={`absolute inset-y-0 right-0 w-12 flex items-center justify-center transition-colors ${isDarkMode ? 'text-indigo-400' : 'text-indigo-500'}`}>
                    <Mail className="w-5 h-5" />
                  </div>
                  <input
                    type="email"
                    dir="ltr"
                    value={formData.email}
                    onChange={(e) => { setFormData({...formData, email: e.target.value}); if(errors.email) setErrors({...errors, email: ''}) }}
                    className={`w-full pl-4 pr-12 py-3.5 text-right rounded-xl text-sm transition-all outline-none focus:ring-2 border ${errors.email ? (isDarkMode ? 'border-rose-500 focus:ring-rose-500 bg-rose-500/10 text-white' : 'border-rose-500 focus:ring-rose-500 bg-rose-50 text-slate-800') : isDarkMode ? 'bg-[#1c2638] text-white border-transparent focus:ring-indigo-500' : 'bg-slate-50 border-slate-200 focus:ring-indigo-500'}`}
                    placeholder="example@mail.com"
                  />
                </div>
                {errors.email && <p className="text-xs font-bold text-rose-500">{errors.email}</p>}
              </div>

              {/* Jaib Wallet */}
              <div className="space-y-2 md:col-span-2">
                <label className={`block text-xs font-bold ${errors.jaibWalletNumber ? 'text-rose-500' : isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                  رقم محفظة جيب <span className="text-rose-500">*</span>
                  <span className={`text-[10px] mr-2 px-2 py-0.5 rounded-full ${isDarkMode ? 'bg-indigo-500/20 text-indigo-400' : 'bg-indigo-100 text-indigo-700'}`}>لاستلام العمولات</span>
                </label>
                <div className="relative group">
                  <div className={`absolute inset-y-0 right-0 w-12 flex items-center justify-center transition-colors ${isDarkMode ? 'text-indigo-400' : 'text-indigo-500'}`}>
                    <Wallet className="w-5 h-5" />
                  </div>
                  <input
                    type="tel"
                    dir="ltr"
                    value={formData.jaibWalletNumber}
                    onChange={(e) => { setFormData({...formData, jaibWalletNumber: e.target.value}); if(errors.jaibWalletNumber) setErrors({...errors, jaibWalletNumber: ''}) }}
                    className={`w-full pr-12 pl-4 py-3.5 text-right rounded-xl text-base font-bold tracking-widest transition-all focus:outline-none focus:ring-2 border ${errors.jaibWalletNumber ? (isDarkMode ? 'border-rose-500 focus:ring-rose-500 bg-rose-500/10 text-white' : 'border-rose-500 focus:ring-rose-500 bg-rose-50 text-slate-800') : isDarkMode ? 'bg-[#1c2638] text-white border-transparent focus:ring-indigo-500 shadow-inner' : 'bg-slate-50 border-slate-200 focus:ring-indigo-500'}`}
                    placeholder="7X XXXXXXX"
                  />
                </div>
                {errors.jaibWalletNumber && <p className="text-xs font-bold text-rose-500">{errors.jaibWalletNumber}</p>}
              </div>

              {/* Governorate */}
              <div className="space-y-2">
                <label className={`block text-xs font-bold ${errors.governorate ? 'text-rose-500' : isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>المحافظة <span className="text-rose-500">*</span></label>
                <CustomSelect 
                  value={formData.governorate} 
                  onChange={(val: string) => { setFormData({...formData, governorate: val, city: ''}); if(errors.governorate) setErrors({...errors, governorate: ''}) }} 
                  options={YEMEN_GOVERNORATES.map(g => g.name)} 
                  placeholder="اختر المحافظة من القائمة" 
                  error={!!errors.governorate} 
                  isDarkMode={isDarkMode} 
                />
                {errors.governorate && <p className="text-xs font-bold text-rose-500">{errors.governorate}</p>}
              </div>

              {/* City */}
              <div className="space-y-2">
                <label className={`block text-xs font-bold ${errors.city ? 'text-rose-500' : isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>المدينة / المديرية <span className="text-rose-500">*</span></label>
                <CustomSelect 
                  value={formData.city} 
                  onChange={(val: string) => { setFormData({...formData, city: val}); if(errors.city) setErrors({...errors, city: ''}) }} 
                  options={availableCities} 
                  placeholder={formData.governorate ? "اختر المدينة" : "يرجى اختيار المحافظة أولاً"} 
                  error={!!errors.city} 
                  isDarkMode={isDarkMode} 
                  disabled={!formData.governorate}
                />
                {errors.city && <p className="text-xs font-bold text-rose-500">{errors.city}</p>}
              </div>

              {/* Agreement Checkbox */}
              <div className={`mt-4 p-4 rounded-2xl border ${errors.agreed ? (isDarkMode ? 'border-rose-500 bg-rose-500/10' : 'border-rose-500 bg-rose-50') : (isDarkMode ? 'border-slate-800 bg-[#141d2e]' : 'border-slate-200 bg-slate-50')} md:col-span-2 flex items-center justify-start gap-3 transition-colors`}>
                <input
                  type="checkbox"
                  id="agreeTerms"
                  checked={agreed}
                  onChange={(e) => { setAgreed(e.target.checked); if(errors.agreed) setErrors({...errors, agreed: ''}); }}
                  className={`w-5 h-5 rounded text-indigo-600 focus:ring-0 accent-indigo-600 cursor-pointer ${
                    isDarkMode ? 'bg-[#202b3c] border-slate-600' : 'bg-slate-100 border-slate-300'
                  }`}
                />
                <div className="flex flex-col">
                  <label htmlFor="agreeTerms" className={`text-xs md:text-sm font-bold select-none cursor-pointer ${isDarkMode ? 'text-slate-200' : 'text-slate-700'}`}>
                    أوافق على{' '}
                    <span
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setShowPrivacyPolicy(true);
                      }}
                      className={`${isDarkMode ? 'text-indigo-400' : 'text-indigo-600'} hover:underline cursor-pointer`}
                    >
                      شروط الخصوصية والسياسة العامة
                    </span>
                  </label>
                  {errors.agreed && <span className="text-xs font-bold text-rose-500 mt-1">{errors.agreed}</span>}
                </div>
              </div>

            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-4 flex justify-center items-center gap-2 px-10 py-4 rounded-xl text-lg font-black text-white bg-linear-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 transition-all hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : (
                <>
                  <span>تقديم طلب الانضمام</span>
                  <ArrowRight className="w-6 h-6 rotate-180" />
                </>
              )}
            </button>
          </form>

          <div className={`mt-8 pt-6 border-t flex flex-col items-center gap-4 ${isDarkMode ? 'border-slate-800' : 'border-slate-100'}`}>
            <Link href="/agent/login" className={`text-sm font-bold transition-colors flex items-center gap-1.5 ${isDarkMode ? 'text-indigo-400 hover:text-white' : 'text-indigo-600 hover:text-indigo-800'}`}>
              <User className="w-4 h-4" />
              <span>لديك حساب بالفعل؟ تسجيل الدخول</span>
            </Link>
          </div>
        </div>
      </div>
      
      {/* Privacy Policy Modal */}
      {showPrivacyPolicy && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className={`w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col rounded-3xl shadow-2xl ${isDarkMode ? 'bg-[#0a0f1c] text-white' : 'bg-white text-slate-800'}`}>
            <div className={`p-5 flex justify-between items-center border-b ${isDarkMode ? 'border-slate-800' : 'border-slate-100'}`}>
              <h3 className="font-black text-lg">الشروط والسياسة العامة</h3>
              <button onClick={() => setShowPrivacyPolicy(false)} className={`p-2 rounded-xl transition-colors ${isDarkMode ? 'hover:bg-slate-800' : 'hover:bg-slate-100'}`}>
                <AlertCircle className="w-5 h-5 opacity-0 hidden" />
                <span className="font-bold text-sm">إغلاق</span>
              </button>
            </div>
            <div className={`p-6 overflow-y-auto font-medium text-sm leading-relaxed space-y-6 max-h-[60vh] custom-scrollbar ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
              <div className="text-center mb-6">
                <h4 className={`text-xl font-black mb-2 ${isDarkMode ? 'text-indigo-400' : 'text-indigo-600'}`}>سياسة وشروط وأحكام الوكلاء</h4>
                <h5 className="font-bold text-lg">منصة كارد بوكس (CardBox)</h5>
                <p className={`mt-4 text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>مرحباً بك في منصة كارد بوكس (CardBox). بمجرد تسجيلك وانضمامك كـ وكيل في منصة كارد بوكس، فإنك تقر بأنك قرأت وفهمت ووافقت على جميع الشروط والأحكام وسياسة الخصوصية الموضحة أدناه.</p>
              </div>
              
              <div>
                <h6 className={`font-bold text-base mb-2 ${isDarkMode ? 'text-indigo-400' : 'text-indigo-600'}`}>أولاً: بيانات الوكيل</h6>
                <ul className="list-disc list-inside space-y-2">
                  <li>يلتزم الوكيل بإدخال بيانات صحيحة ودقيقة وكاملة أثناء التسجيل.</li>
                  <li>يجب أن تكون البيانات المقدمة مطابقة للهوية والوثائق الرسمية عند طلبها من المنصة.</li>
                  <li>يتحمل الوكيل المسؤولية الكاملة عن صحة البيانات والمعلومات التي يقدمها للمنصة.</li>
                  <li>يمنع استخدام بيانات شخص آخر أو انتحال أي صفة أو تقديم معلومات غير صحيحة.</li>
                </ul>
              </div>

              <div>
                <h6 className={`font-bold text-base mb-2 ${isDarkMode ? 'text-indigo-400' : 'text-indigo-600'}`}>ثانياً: إضافة الشبكات</h6>
                <ul className="list-disc list-inside space-y-2">
                  <li>يحق للوكيل إضافة شبكات الإنترنت التي يعمل معها أو يمثلها إلى منصة كارد بوكس.</li>
                  <li>يشترط أن تكون كل شبكة تتم إضافتها إلى المنصة مملوكة للوكيل أو أن يكون لديه تفويض أو موافقة صريحة من مالك الشبكة الأصلي لإدارتها أو إضافتها إلى المنصة.</li>
                  <li>يتحمل الوكيل كامل المسؤولية القانونية والإدارية عن أي شبكة يقوم بإضافتها دون الحصول على موافقة مالكها.</li>
                  <li>لا تتحمل منصة كارد بوكس أي مسؤولية عن النزاعات التي تنشأ بين الوكيل ومالك الشبكة نتيجة إضافة شبكة دون تفويض صحيح.</li>
                  <li>يحق للمنصة طلب إثبات ملكية الشبكة أو التفويض من مالكها في أي وقت.</li>
                  <li>يحق للمنصة تعليق أو إزالة أي شبكة عند وجود شكوى أو نزاع أو مخالفة أو عدم وجود تفويض كافٍ.</li>
                </ul>
              </div>

              <div>
                <h6 className={`font-bold text-base mb-2 ${isDarkMode ? 'text-indigo-400' : 'text-indigo-600'}`}>ثالثاً: شروط استحقاق العمولة</h6>
                <ul className="list-disc list-inside space-y-2">
                  <li>لا يتم تفعيل نظام العمولات للوكيل بمجرد التسجيل في المنصة.</li>
                  <li>يشترط لتفعيل استحقاق العمولة أن يقوم الوكيل بإضافة 10 شبكات على الأقل إلى منصة كارد بوكس.</li>
                  <li>يجب أن تكون الشبكات العشر المضافة شبكات حقيقية ومصرحاً للوكيل بإضافتها وإدارتها.</li>
                  <li>لا يكفي إضافة الشبكات فقط لاستحقاق العمولة، بل يشترط أن تبدأ عملية بيع وشراء كروت فعلية من الشبكات المضافة.</li>
                  <li>يتم احتساب استحقاق العمولة بعد تحقق الشرطين التاليين:<br/>- إضافة 10 شبكات على الأقل.<br/>- وجود عمليات شراء فعلية للكروت من الشبكات المضافة.</li>
                  <li>تحتفظ منصة كارد بوكس بحقها في التحقق من صحة الشبكات وعمليات البيع قبل تفعيل العمولة.</li>
                  <li>لا يتم احتساب الشبكات الوهمية أو المكررة أو غير النشطة أو المضافة دون تفويض ضمن العدد المطلوب لتفعيل العمولة.</li>
                </ul>
              </div>

              <div>
                <h6 className={`font-bold text-base mb-2 ${isDarkMode ? 'text-indigo-400' : 'text-indigo-600'}`}>رابعاً: العمولات والتحويلات المالية</h6>
                <ul className="list-disc list-inside space-y-2">
                  <li>يتم تحويل العمولات المستحقة للوكيل عبر محفظة جيب وفق آلية ومواعيد التحويل المعتمدة لدى منصة كارد بوكس.</li>
                  <li>لا تعتبر أي عمولة مستحقة بشكل نهائي إلا بعد اعتماد العمليات والتحقق من صحتها.</li>
                  <li>يحق للمنصة تعليق أي عمولة قيد المراجعة في حال وجود عمليات غير طبيعية أو اشتباه بالتلاعب.</li>
                  <li>في حال اكتشاف عمليات بيع وهمية أو تلاعب أو استخدام غير مشروع للنظام، يحق للمنصة إلغاء العمولات المرتبطة بهذه العمليات.</li>
                  <li>يتحمل الوكيل مسؤولية صحة بيانات المحفظة المستخدمة لاستلام العمولات.</li>
                </ul>
              </div>

              <div>
                <h6 className={`font-bold text-base mb-2 ${isDarkMode ? 'text-indigo-400' : 'text-indigo-600'}`}>خامساً: مكافحة التلاعب والاحتيال</h6>
                <ul className="list-disc list-inside space-y-2">
                  <li>يمنع منعاً باتاً استخدام المنصة في:<br/>- إنشاء شبكات أو حسابات وهمية بهدف الحصول على العمولات.<br/>- إجراء عمليات شراء أو بيع وهمية.<br/>- التلاعب بعدد الشبكات أو الكروت أو العمليات.<br/>- استخدام حسابات متعددة للتحايل على نظام العمولات.<br/>- تقديم بيانات أو مستندات مزورة أو غير صحيحة.<br/>- استخدام المنصة بطريقة تخالف الأنظمة أو القوانين المعمول بها.</li>
                  <li>وفي حال الاشتباه بأي نشاط مخالف، يحق لمنصة كارد بوكس تعليق الحساب أو العمولات أو الشبكات المرتبطة به مؤقتاً لحين انتهاء المراجعة.</li>
                </ul>
              </div>

              <div>
                <h6 className={`font-bold text-base mb-2 ${isDarkMode ? 'text-indigo-400' : 'text-indigo-600'}`}>سادساً: سياسة الخصوصية وحماية البيانات</h6>
                <p className="mb-2">تلتزم منصة كارد بوكس بالحفاظ على سرية البيانات التي يقدمها الوكيل واستخدامها للأغراض المتعلقة بتشغيل المنصة وإدارة الحسابات والخدمات.</p>
                <p className="mb-2">قد تشمل البيانات التي يتم جمعها:</p>
                <ul className="list-disc list-inside space-y-2">
                  <li>الاسم والبيانات الشخصية.</li>
                  <li>رقم الهاتف وبيانات التواصل.</li>
                  <li>بيانات الهوية عند طلب التحقق.</li>
                  <li>بيانات الشبكات التي تتم إضافتها.</li>
                  <li>بيانات العمليات والمبيعات والعمولات.</li>
                  <li>بيانات المحفظة المستخدمة لتحويل العمولات.</li>
                  <li>معلومات تقنية متعلقة باستخدام المنصة لأغراض الأمان والحماية.</li>
                </ul>
                <p className="mt-2">ولا يجوز استخدام بيانات الوكيل إلا في حدود ما يلزم لتقديم الخدمات، والتحقق من الحسابات، وإدارة العمولات، ومنع الاحتيال والتلاعب، وتحسين أمان المنصة.</p>
              </div>

              <div>
                <h6 className={`font-bold text-base mb-2 ${isDarkMode ? 'text-indigo-400' : 'text-indigo-600'}`}>سابعاً: سرية بيانات الشبكات</h6>
                <ul className="list-disc list-inside space-y-2">
                  <li>يلتزم الوكيل بالمحافظة على سرية بيانات الشبكات التي يضيفها إلى المنصة وعدم مشاركة بيانات الدخول أو المعلومات الحساسة الخاصة بالشبكات مع أي طرف غير مصرح له.</li>
                  <li>كما يلتزم بعدم استخدام بيانات الشبكات أو بيانات العملاء لأي غرض خارج نطاق الخدمات المصرح بها.</li>
                </ul>
              </div>

              <div>
                <h6 className={`font-bold text-base mb-2 ${isDarkMode ? 'text-indigo-400' : 'text-indigo-600'}`}>ثامناً: مسؤولية الوكيل</h6>
                <p className="mb-2">الوكيل مسؤول بشكل كامل عن:</p>
                <ul className="list-disc list-inside space-y-2">
                  <li>صحة البيانات التي يقدمها.</li>
                  <li>قانونية الشبكات التي يقوم بإضافتها.</li>
                  <li>الحصول على موافقة مالكي الشبكات قبل إضافتها.</li>
                  <li>المحافظة على بيانات الدخول الخاصة بحسابه.</li>
                  <li>أي نشاط يتم من خلال حسابه.</li>
                  <li>الالتزام بسياسات وشروط منصة كارد بوكس.</li>
                </ul>
              </div>

              <div>
                <h6 className={`font-bold text-base mb-2 ${isDarkMode ? 'text-indigo-400' : 'text-indigo-600'}`}>تاسعاً: إيقاف أو إنهاء الحساب</h6>
                <p className="mb-2">يحق لمنصة كارد بوكس، عند وجود سبب مشروع أو مخالفة للشروط، تعليق الحساب أو تقييد بعض الخدمات أو إنهاء الحساب، ومن ذلك على سبيل المثال:</p>
                <ul className="list-disc list-inside space-y-2">
                  <li>تقديم بيانات غير صحيحة.</li>
                  <li>إضافة شبكات دون تفويض.</li>
                  <li>التلاعب بالعمولات.</li>
                  <li>تنفيذ عمليات وهمية.</li>
                  <li>محاولة اختراق أو تجاوز أنظمة الحماية.</li>
                  <li>استخدام المنصة في أنشطة مخالفة للقوانين أو الشروط.</li>
                </ul>
                <p className="mt-2">وفي الحالات التي تتطلب المراجعة، يحق للمنصة تعليق العمولات المرتبطة بالنشاط محل المراجعة إلى حين التحقق من العمليات.</p>
              </div>

              <div>
                <h6 className={`font-bold text-base mb-2 ${isDarkMode ? 'text-indigo-400' : 'text-indigo-600'}`}>عاشراً: الموافقة على الشروط</h6>
                <p className="mb-2">بتسجيلك كوكيل في منصة كارد بوكس، فإنك تقر بأنك:</p>
                <ul className="list-disc list-inside space-y-2">
                  <li>قرأت جميع الشروط والأحكام وسياسة الخصوصية، وفهمتها، وتوافق على الالتزام بها، وتتحمل المسؤولية عن صحة البيانات والشبكات التي تقوم بإضافتها إلى المنصة.</li>
                  <li>كما تقر بأن تفعيل العمولات يخضع لاستيفاء شروط المنصة، ومن ضمنها إضافة 10 شبكات على الأقل وبدء وجود عمليات شراء فعلية للكروت من الشبكات المضافة.</li>
                  <li>وتحتفظ منصة كارد بوكس بحقها في تحديث هذه الشروط والسياسات عند الحاجة، على أن يتم نشر النسخة المحدثة عبر المنصة.</li>
                </ul>
              </div>
            </div>
            <div className={`p-4 border-t flex justify-end ${isDarkMode ? 'border-slate-800 bg-[#101726]' : 'border-slate-100 bg-slate-50'}`}>
              <button onClick={() => { setAgreed(true); setErrors({...errors, agreed: ''}); setShowPrivacyPolicy(false); }} className="px-6 py-2.5 rounded-xl text-sm font-bold text-white bg-linear-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 shadow-md">
                موافق
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
