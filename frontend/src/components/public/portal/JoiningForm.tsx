import React, { useState, useRef, useEffect } from 'react';
import { User, Globe, Wallet, Tag, Plus, Send, AlertCircle, ChevronLeft, ChevronRight, CheckCircle2, ShieldCheck, Zap, ChevronDown, ListChecks, X } from 'lucide-react';
import { ApplicationFormData, CardCategory } from '../../../types';
import { YEMEN_GOVERNORATES } from '../../../data/yemenLocations';
import { CardCategoryItem } from '../../common/CardCategoryItem';

interface JoiningFormProps {
  onSubmit: (data: ApplicationFormData) => void;
  isDarkMode: boolean;
  isSubmitting?: boolean;
  initialData?: ApplicationFormData;
  referenceNumber?: string;
  adminNotes?: string;
  onCancelEdit?: () => void;
}

const CustomSelect = ({ value, onChange, options, placeholder, error, isDarkMode, disabled = false }: any) => {
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={wrapperRef}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center justify-between w-full px-4 py-3.5 rounded-xl text-sm transition-all border outline-none ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'} ${error ? 'border-rose-500 bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400' : isDarkMode ? 'bg-[#1c2638] text-white border-transparent focus:ring-2 focus:ring-indigo-500' : 'bg-slate-50 text-slate-800 border-slate-200 hover:border-indigo-300 focus:ring-2 focus:ring-indigo-500'}`}
      >
        <span className={!value ? 'text-slate-400' : ''}>{value || placeholder}</span>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180 text-indigo-500' : 'text-slate-400'}`} />
      </button>
      {isOpen && !disabled && (
        <div className={`absolute z-50 w-full mt-2 py-2 rounded-xl shadow-2xl border ${isDarkMode ? 'bg-[#1e293b] border-slate-700 shadow-black/50' : 'bg-white border-slate-100'} max-h-60 overflow-y-auto animate-in fade-in slide-in-from-top-2`}>
          {options.length === 0 ? (
            <div className="px-4 py-3 text-sm text-slate-400 text-center font-medium">لا يوجد خيارات</div>
          ) : (
            options.map((opt: string) => (
              <button
                key={opt}
                type="button"
                onClick={() => { onChange(opt); setIsOpen(false); }}
                className={`flex items-center w-full text-right px-4 py-3 text-sm transition-colors font-medium hover:bg-indigo-50 dark:hover:bg-indigo-500/10 ${value === opt ? 'bg-indigo-50 dark:bg-indigo-500/20 font-bold text-indigo-600 dark:text-indigo-400' : isDarkMode ? 'text-slate-200' : 'text-slate-700'}`}
              >
                {opt}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export const JoiningForm: React.FC<JoiningFormProps> = ({
  onSubmit,
  isDarkMode,
  isSubmitting = false,
  initialData,
  referenceNumber,
  adminNotes,
  onCancelEdit,
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 5;

  const [ownerName, setOwnerName] = useState(initialData?.owner.ownerName || '');
  const [ownerId, setOwnerId] = useState(initialData?.owner.ownerId || '');
  const [contactNumber, setContactNumber] = useState(initialData?.owner.contactNumber || '');

  const [networkName, setNetworkName] = useState(initialData?.network.networkName || '');
  const [englishName, setEnglishName] = useState(initialData?.network.englishName || '');
  const [externalLink, setExternalLink] = useState(initialData?.network.externalLink || '');
  const [networkPhone, setNetworkPhone] = useState(initialData?.network.networkPhone || '');
  const [governorate, setGovernorate] = useState(initialData?.network.governorate || '');
  const [city, setCity] = useState(initialData?.network.city || '');
  const [neighborhood, setNeighborhood] = useState(initialData?.network.neighborhood || '');

  const [jaibWalletNumber, setJaibWalletNumber] = useState(initialData?.jaibWalletNumber || '');

  const [cardCategories, setCardCategories] = useState<CardCategory[]>(
    initialData?.cardCategories && initialData.cardCategories.length > 0
      ? initialData.cardCategories
      : [
          {
            id: `card-${Date.now()}`,
            name: '',
            price: '',
            mega: '',
            hours: '',
            validityDays: '',
            cardType: 'مستخدم فقط',
          }
        ]
  );
  
  // Track which category is currently being edited. If null, show saved list.
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(
    initialData?.cardCategories && initialData.cardCategories.length > 0 ? null : cardCategories[0].id
  );

  const [agreed, setAgreed] = useState(false);
  const [showPrivacyPolicy, setShowPrivacyPolicy] = useState(false);

  const [errors, setErrors] = useState<Record<string, string>>({});

  const selectedGovObj = YEMEN_GOVERNORATES.find((g) => g.name === governorate);
  const availableCities = selectedGovObj ? selectedGovObj.cities : [];

  const handleAddCategory = () => {
    const newCard: CardCategory = {
      id: `card-${Date.now()}`,
      name: '',
      price: '',
      mega: '',
      hours: '',
      validityDays: '',
      cardType: 'مستخدم فقط',
    };
    setCardCategories([...cardCategories, newCard]);
    setEditingCategoryId(newCard.id);
  };

  const handleUpdateCategory = (id: string, field: keyof CardCategory, value: string | number) => {
    setCardCategories((prev) =>
      prev.map((cat) => (cat.id === id ? { ...cat, [field]: value } : cat))
    );
  };

  const handleRemoveCategory = (id: string) => {
    const newCategories = cardCategories.filter((cat) => cat.id !== id);
    if (newCategories.length === 0) {
      // Must have at least one category
      const newCard: CardCategory = { id: `card-${Date.now()}`, name: '', price: '', mega: '', hours: '', validityDays: '', cardType: 'مستخدم فقط' };
      setCardCategories([newCard]);
      setEditingCategoryId(newCard.id);
    } else {
      setCardCategories(newCategories);
      if (editingCategoryId === id) setEditingCategoryId(null);
    }
  };

  const scrollToFirstError = () => {
    setTimeout(() => {
      const errorEl = document.querySelector('.border-rose-500');
      if (errorEl) {
        errorEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 100);
  };

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};
    if (step === 1) {
      if (!ownerName.trim()) newErrors.ownerName = 'يرجى كتابة اسم المالك';
      if (!ownerId.trim() || ownerId.trim().length < 9) newErrors.ownerId = 'رقم المالك يجب أن لا يقل عن 9 أرقام';
      if (!contactNumber.trim() || contactNumber.trim().length < 9) newErrors.contactNumber = 'رقم التواصل يجب أن لا يقل عن 9 أرقام';
    } else if (step === 2) {
      if (!networkName.trim()) newErrors.networkName = 'يرجى كتابة اسم الشبكة';
      if (!englishName.trim()) newErrors.englishName = 'يرجى كتابة اسم الشبكة بالإنجليزي';
      if (!externalLink.trim()) newErrors.externalLink = 'يرجى كتابة رابط الشبكة';
      if (networkPhone.trim() && networkPhone.trim().length < 9) newErrors.networkPhone = 'رقم الهاتف الإضافي يجب أن لا يقل عن 9 أرقام';
      if (!governorate) newErrors.governorate = 'يرجى اختيار المحافظة';
      if (!city) newErrors.city = 'يرجى اختيار المدينة';
    } else if (step === 3) {
      if (!jaibWalletNumber.trim() || jaibWalletNumber.trim().length < 9) newErrors.jaibWalletNumber = 'رقم محفظة جيب يجب أن لا يقل عن 9 أرقام';
    } else if (step === 4) {
      if (editingCategoryId) {
         newErrors.categories = 'يرجى حفظ الفئة الحالية قبل المتابعة أو النقر على حفظ الفئة';
      } else if (cardCategories.length === 0) {
         newErrors.categories = 'يرجى إضافة فئة واحدة على الأقل قبل المتابعة';
      }
    } else if (step === 5) {
      if (!agreed) {
         newErrors.agreed = 'يرجى الموافقة على شروط الخصوصية والسياسة العامة قبل إرسال الطلب';
      }
    }
    
    setErrors(newErrors);
    
    if (Object.keys(newErrors).length > 0) {
      scrollToFirstError();
      return false;
    }
    return true;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, totalSteps));
    }
  };

  const prevStep = () => {
    setErrors({});
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentStep !== 5) {
      nextStep();
      return;
    }
    if (!validateStep(5)) return;

    const formData: ApplicationFormData = {
      owner: { ownerName: ownerName.trim(), ownerId: ownerId.trim(), contactNumber: contactNumber.trim() },
      network: { networkName: networkName.trim(), englishName: englishName.trim(), externalLink: externalLink.trim(), networkPhone: networkPhone.trim(), governorate, city, neighborhood: neighborhood.trim() },
      jaibWalletNumber: jaibWalletNumber.trim(),
      cardCategories,
    };
    onSubmit(formData);
  };

  const stepsList = [
    { num: 1, label: 'المالك', icon: <User className="w-4 h-4 md:w-5 md:h-5" /> },
    { num: 2, label: 'الشبكة', icon: <Globe className="w-4 h-4 md:w-5 md:h-5" /> },
    { num: 3, label: 'المحفظة', icon: <Wallet className="w-4 h-4 md:w-5 md:h-5" /> },
    { num: 4, label: 'الفئات', icon: <Tag className="w-4 h-4 md:w-5 md:h-5" /> },
    { num: 5, label: 'مراجعة', icon: <ListChecks className="w-4 h-4 md:w-5 md:h-5" /> },
  ];

  return (
    <div className="w-full max-w-4xl mx-auto pb-24 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Compact Modern Responsive Hero Header */}
      <div className="relative mb-10 overflow-hidden rounded-[2rem] shadow-xl group">
        <div className="absolute inset-0 bg-gradient-to-r from-[#4f46e5] to-[#8b5cf6] opacity-95 transition-all duration-700" />
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-30 mix-blend-overlay" />
        
        <div className="relative p-6 md:p-8 flex flex-col md:flex-row items-center gap-5 md:gap-6 text-center md:text-right">
          <div className="inline-flex items-center justify-center p-3 bg-white/20 rounded-2xl backdrop-blur-md shadow-inner ring-1 ring-white/30 shrink-0">
            <ShieldCheck className="w-10 h-10 text-white drop-shadow-md" />
          </div>
          <div>
            <h1 className="text-xl md:text-3xl font-black text-white tracking-tight drop-shadow-lg mb-1.5">
              {initialData ? 'تعديل بيانات طلبك' : 'بوابة الانضمام الرقمية'}
            </h1>
            <p className="text-white/80 font-medium text-xs md:text-sm max-w-xl leading-relaxed">
              {initialData 
                ? 'قم بمراجعة وتعديل بياناتك بدقة لإتمام التفعيل' 
                : 'أدخل بياناتك للانضمام لشبكة الموزعين المعتمدين بأسرع وأسهل الخطوات'}
            </p>
          </div>
        </div>
      </div>

      {adminNotes && (
        <div className="mb-8 p-5 rounded-2xl bg-gradient-to-br from-amber-500/20 to-amber-600/10 border border-amber-500/40 text-amber-200 shadow-xl backdrop-blur-md animate-in fade-in duration-500">
          <div className="flex items-center gap-2 font-bold text-sm text-amber-400 mb-3">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>ملاحظات إدارية هامة {referenceNumber ? `(رقم المرجع: ${referenceNumber})` : ''}</span>
          </div>
          <p className="text-sm md:text-base text-amber-100 font-medium bg-amber-950/60 p-4 rounded-xl border border-amber-500/30 leading-relaxed shadow-inner">
            {adminNotes}
          </p>
        </div>
      )}

      {/* Stepper Wizard */}
      <div className="mb-10 px-2 md:px-10 relative">
        <div className="absolute top-1/2 left-4 right-4 md:left-14 md:right-14 h-1 -translate-y-1/2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-700 ease-out"
            style={{ width: `${((currentStep - 1) / (totalSteps - 1)) * 100}%` }}
          />
        </div>
        <div className="relative flex justify-between">
          {stepsList.map((step) => {
            const isActive = step.num === currentStep;
            const isCompleted = step.num < currentStep;
            return (
              <div key={step.num} className="flex flex-col items-center gap-2 bg-slate-50 dark:bg-[#0a0f1c] px-2 md:px-4 transition-all duration-300">
                <div 
                  className={`w-10 h-10 md:w-12 md:h-12 rounded-2xl flex items-center justify-center font-bold shadow-lg transition-all duration-500 z-10 ${
                    isActive 
                      ? 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white scale-110 ring-4 ring-indigo-500/30 shadow-indigo-500/40' 
                      : isCompleted
                      ? 'bg-indigo-500 text-white shadow-indigo-500/20'
                      : isDarkMode ? 'bg-slate-800 text-slate-500 border border-slate-700' : 'bg-white text-slate-400 border border-slate-200'
                  }`}
                >
                  {isCompleted ? <CheckCircle2 className="w-5 h-5 md:w-6 md:h-6" /> : step.icon}
                </div>
                <span className={`text-[10px] md:text-xs font-black transition-colors mt-1 ${isActive ? (isDarkMode ? 'text-white' : 'text-slate-800') : isCompleted ? (isDarkMode ? 'text-indigo-400' : 'text-indigo-600') : 'text-slate-400'}`}>
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="relative">
        <div className={`transition-all duration-700 ease-in-out transform bg-white dark:bg-[#101726] rounded-3xl p-6 md:p-8 shadow-xl border ${isDarkMode ? 'border-slate-800/80 shadow-black/50' : 'border-slate-200 shadow-slate-300/40'}`}>
          
          {/* Step 1: Owner Info */}
          {currentStep === 1 && (
            <div className="space-y-6 animate-in slide-in-from-right-8 fade-in duration-500">
              <div className="flex flex-col md:flex-row md:items-center gap-4 mb-2 pb-5 border-b border-slate-100 dark:border-slate-800">
                <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-500/10 rounded-xl flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
                  <User className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-slate-800 dark:text-white">البيانات الشخصية للمالك</h2>
                  <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium">الرجاء إدخال البيانات الشخصية لمالك الشبكة بدقة لمطابقتها لاحقاً.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6">
                <div className="space-y-2">
                  <label className={`block text-xs font-bold ${errors.ownerName ? 'text-rose-500' : 'text-slate-700 dark:text-slate-300'}`}>اسم المالك <span className="text-rose-500">*</span></label>
                  <input type="text" value={ownerName} onChange={(e) => { setOwnerName(e.target.value); if(errors.ownerName) setErrors({...errors, ownerName: ''}) }} placeholder="الاسم الرباعي كما في الهوية" className={`w-full px-4 py-3 rounded-xl text-sm transition-all focus:outline-none focus:ring-2 border ${errors.ownerName ? 'border-rose-500 focus:ring-rose-500 bg-rose-50 dark:bg-rose-500/10' : isDarkMode ? 'bg-[#1c2638] text-white border-transparent focus:ring-indigo-500' : 'bg-slate-50 border-slate-200 focus:ring-indigo-500'}`} />
                  {errors.ownerName && <p className="text-xs font-bold text-rose-500 flex items-center gap-1"><AlertCircle className="w-3 h-3"/> {errors.ownerName}</p>}
                </div>
                
                <div className="space-y-2">
                  <label className={`block text-xs font-bold ${errors.ownerId ? 'text-rose-500' : 'text-slate-700 dark:text-slate-300'}`}>رقم المالك (للدخول) <span className="text-rose-500">*</span></label>
                  <input type="number" value={ownerId} onChange={(e) => { setOwnerId(e.target.value); if(errors.ownerId) setErrors({...errors, ownerId: ''}) }} placeholder="رقم الهاتف الأساسي" className={`w-full px-4 py-3 text-right rounded-xl text-sm transition-all focus:outline-none focus:ring-2 border ${errors.ownerId ? 'border-rose-500 focus:ring-rose-500 bg-rose-50 dark:bg-rose-500/10' : isDarkMode ? 'bg-[#1c2638] text-white border-transparent focus:ring-indigo-500' : 'bg-slate-50 border-slate-200 focus:ring-indigo-500'}`} />
                  {errors.ownerId && <p className="text-xs font-bold text-rose-500 flex items-center gap-1"><AlertCircle className="w-3 h-3"/> {errors.ownerId}</p>}
                </div>
                
                <div className="space-y-2 md:col-span-2">
                  <label className={`block text-xs font-bold ${errors.contactNumber ? 'text-rose-500' : 'text-slate-700 dark:text-slate-300'}`}>رقم التواصل المخصص للشبكة <span className="text-rose-500">*</span></label>
                  <input type="number" value={contactNumber} onChange={(e) => { setContactNumber(e.target.value); if(errors.contactNumber) setErrors({...errors, contactNumber: ''}) }} placeholder="رقم متاح للتواصل والدعم الفني" className={`w-full px-4 py-3 text-right rounded-xl text-sm transition-all focus:outline-none focus:ring-2 border ${errors.contactNumber ? 'border-rose-500 focus:ring-rose-500 bg-rose-50 dark:bg-rose-500/10' : isDarkMode ? 'bg-[#1c2638] text-white border-transparent focus:ring-indigo-500' : 'bg-slate-50 border-slate-200 focus:ring-indigo-500'}`} />
                  {errors.contactNumber && <p className="text-xs font-bold text-rose-500 flex items-center gap-1"><AlertCircle className="w-3 h-3"/> {errors.contactNumber}</p>}
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Network Info */}
          {currentStep === 2 && (
            <div className="space-y-6 animate-in slide-in-from-right-8 fade-in duration-500">
              <div className="flex flex-col md:flex-row md:items-center gap-4 mb-2 pb-5 border-b border-slate-100 dark:border-slate-800">
                <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
                  <Globe className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-slate-800 dark:text-white">بيانات الشبكة</h2>
                  <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium">التفاصيل الجغرافية ومعلومات العرض لشبكتك</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6">
                <div className="space-y-2">
                  <label className={`block text-xs font-bold ${errors.networkName ? 'text-rose-500' : 'text-slate-700 dark:text-slate-300'}`}>اسم الشبكة بالعربي <span className="text-rose-500">*</span></label>
                  <input type="text" value={networkName} onChange={(e) => { setNetworkName(e.target.value); if(errors.networkName) setErrors({...errors, networkName: ''}) }} placeholder="مثال: يمن نت للإتصالات" className={`w-full px-4 py-3 rounded-xl text-sm transition-all focus:outline-none focus:ring-2 border ${errors.networkName ? 'border-rose-500 focus:ring-rose-500 bg-rose-50 dark:bg-rose-500/10' : isDarkMode ? 'bg-[#1c2638] text-white border-transparent focus:ring-indigo-500' : 'bg-slate-50 border-slate-200 focus:ring-indigo-500'}`} />
                  {errors.networkName && <p className="text-xs font-bold text-rose-500 flex items-center gap-1"><AlertCircle className="w-3 h-3"/> {errors.networkName}</p>}
                </div>
                
                <div className="space-y-2">
                  <label className={`block text-xs font-bold ${errors.englishName ? 'text-rose-500' : 'text-slate-700 dark:text-slate-300'}`}>اسم الشبكة بالإنجليزي <span className="text-rose-500">*</span></label>
                  <input type="text" value={englishName} onChange={(e) => { setEnglishName(e.target.value); if(errors.englishName) setErrors({...errors, englishName: ''}) }} placeholder="مثال: speed-net" className={`w-full px-4 py-3 rounded-xl text-sm transition-all focus:outline-none focus:ring-2 border ${errors.englishName ? 'border-rose-500 focus:ring-rose-500 bg-rose-50 dark:bg-rose-500/10' : isDarkMode ? 'bg-[#1c2638] text-white border-transparent focus:ring-indigo-500' : 'bg-slate-50 border-slate-200 focus:ring-indigo-500'}`} dir="ltr" />
                  {errors.englishName && <p className="text-xs font-bold text-rose-500 flex items-center gap-1"><AlertCircle className="w-3 h-3"/> {errors.englishName}</p>}
                </div>

                <div className="space-y-2">
                  <label className={`block text-xs font-bold ${errors.externalLink ? 'text-rose-500' : 'text-slate-700 dark:text-slate-300'}`}>رابط الشبكة <span className="text-rose-500">*</span></label>
                  <input type="text" value={externalLink} onChange={(e) => { setExternalLink(e.target.value); if(errors.externalLink) setErrors({...errors, externalLink: ''}) }} placeholder="example.com" className={`w-full px-4 py-3 rounded-xl text-sm transition-all focus:outline-none focus:ring-2 border ${errors.externalLink ? 'border-rose-500 focus:ring-rose-500 bg-rose-50 dark:bg-rose-500/10' : isDarkMode ? 'bg-[#1c2638] text-white border-transparent focus:ring-indigo-500' : 'bg-slate-50 border-slate-200 focus:ring-indigo-500'}`} dir="ltr" />
                  {errors.externalLink && <p className="text-xs font-bold text-rose-500 flex items-center gap-1"><AlertCircle className="w-3 h-3"/> {errors.externalLink}</p>}
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">هاتف آخر للشبكة <span className="text-slate-400 font-normal">(اختياري)</span></label>
                  <input type="number" value={networkPhone} onChange={(e) => { setNetworkPhone(e.target.value); if(errors.networkPhone) setErrors({...errors, networkPhone: ''}) }} placeholder="رقم هاتف إضافي" className={`w-full px-4 py-3 text-right rounded-xl text-sm transition-all focus:outline-none focus:ring-2 border ${errors.networkPhone ? 'border-rose-500 focus:ring-rose-500 bg-rose-50 dark:bg-rose-500/10' : isDarkMode ? 'bg-[#1c2638] text-white border-transparent focus:ring-indigo-500' : 'bg-slate-50 border-slate-200 focus:ring-indigo-500'}`} />
                  {errors.networkPhone && <p className="text-xs font-bold text-rose-500 flex items-center gap-1"><AlertCircle className="w-3 h-3"/> {errors.networkPhone}</p>}
                </div>
                
                <div className="space-y-2">
                  <label className={`block text-xs font-bold ${errors.governorate ? 'text-rose-500' : 'text-slate-700 dark:text-slate-300'}`}>المحافظة <span className="text-rose-500">*</span></label>
                  <CustomSelect 
                    value={governorate} 
                    onChange={(val: string) => { setGovernorate(val); setCity(''); if(errors.governorate) setErrors({...errors, governorate: ''}) }} 
                    options={YEMEN_GOVERNORATES.map(g => g.name)} 
                    placeholder="اختر المحافظة من القائمة" 
                    error={!!errors.governorate} 
                    isDarkMode={isDarkMode} 
                  />
                  {errors.governorate && <p className="text-xs font-bold text-rose-500 flex items-center gap-1"><AlertCircle className="w-3 h-3"/> {errors.governorate}</p>}
                </div>
                
                <div className="space-y-2">
                  <label className={`block text-xs font-bold ${errors.city ? 'text-rose-500' : 'text-slate-700 dark:text-slate-300'}`}>المدينة / المديرية <span className="text-rose-500">*</span></label>
                  <CustomSelect 
                    value={city} 
                    onChange={(val: string) => { setCity(val); if(errors.city) setErrors({...errors, city: ''}) }} 
                    options={availableCities} 
                    placeholder={governorate ? "اختر المدينة" : "يرجى اختيار المحافظة أولاً"} 
                    error={!!errors.city} 
                    isDarkMode={isDarkMode} 
                    disabled={!governorate}
                  />
                  {errors.city && <p className="text-xs font-bold text-rose-500 flex items-center gap-1"><AlertCircle className="w-3 h-3"/> {errors.city}</p>}
                </div>
                
                <div className="space-y-2 md:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">المنطقة أو الحي <span className="text-slate-400 font-normal">(اختياري)</span></label>
                  <input type="text" value={neighborhood} onChange={(e) => setNeighborhood(e.target.value)} placeholder="اسم الحي أو الشارع لمزيد من الدقة" className={`w-full px-4 py-3 rounded-xl text-sm transition-all focus:outline-none focus:ring-2 border ${isDarkMode ? 'bg-[#1c2638] text-white border-transparent focus:ring-indigo-500' : 'bg-slate-50 border-slate-200 focus:ring-indigo-500'}`} />
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Wallet Info */}
          {currentStep === 3 && (
            <div className="space-y-6 animate-in slide-in-from-right-8 fade-in duration-500">
              <div className="flex flex-col md:flex-row md:items-center gap-4 mb-2 pb-5 border-b border-slate-100 dark:border-slate-800">
                <div className="w-12 h-12 bg-amber-50 dark:bg-amber-500/10 rounded-xl flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0">
                  <Wallet className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-slate-800 dark:text-white">المحفظة المالية</h2>
                  <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium">إعدادات الدفع واستقبال أرباحك بأمان</p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-500/5 border border-indigo-100 dark:border-indigo-500/20 mb-6 flex items-start gap-4 shadow-sm">
                <div className="p-2 bg-white dark:bg-[#101726] rounded-xl shadow-sm shrink-0">
                  <Zap className="w-6 h-6 text-indigo-500" />
                </div>
                <p className="text-xs md:text-sm text-slate-700 dark:text-slate-300 font-semibold leading-relaxed">
                  نحن نعتمد نظام <span className="font-bold text-indigo-600 dark:text-indigo-400">محفظة جيب</span> لتحويل كافة المبالغ والمبيعات لحسابك بشكل يومي وآمن. يرجى التأكد من كتابة الرقم بشكل صحيح.
                </p>
              </div>

              <div className="space-y-3">
                <label className={`block text-xs font-bold ${errors.jaibWalletNumber ? 'text-rose-500' : 'text-slate-700 dark:text-slate-300'}`}>رقم محفظة جيب (JAIB) <span className="text-rose-500">*</span></label>
                <div className="relative group">
                  <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none text-slate-400 group-focus-within:text-indigo-500 transition-colors">
                    <Wallet className="w-5 h-5" />
                  </div>
                  <input type="number" value={jaibWalletNumber} onChange={(e) => { setJaibWalletNumber(e.target.value); if(errors.jaibWalletNumber) setErrors({...errors, jaibWalletNumber: ''}) }} placeholder="أدخل رقم محفظتك المعتمد" className={`w-full pr-12 pl-4 py-3.5 text-right rounded-xl text-base font-bold tracking-widest transition-all focus:outline-none focus:ring-2 border ${errors.jaibWalletNumber ? 'border-rose-500 focus:ring-rose-500 bg-rose-50 dark:bg-rose-500/10' : isDarkMode ? 'bg-[#1c2638] text-white border-transparent focus:ring-indigo-500 shadow-inner' : 'bg-slate-50 border-slate-200 focus:ring-indigo-500'}`} />
                </div>
                {errors.jaibWalletNumber && <p className="text-xs font-bold text-rose-500 flex items-center gap-1"><AlertCircle className="w-3 h-3"/> {errors.jaibWalletNumber}</p>}
              </div>
            </div>
          )}

          {/* Step 4: Cards */}
          {currentStep === 4 && (
            <div className="space-y-6 animate-in slide-in-from-right-8 fade-in duration-500">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2 pb-5 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-purple-50 dark:bg-purple-500/10 rounded-xl flex items-center justify-center text-purple-600 dark:text-purple-400 shrink-0">
                    <Tag className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-slate-800 dark:text-white">باقات وفئات الكروت</h2>
                    <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium">أضف الفئات المخصصة لشبكتك والتي سيتم عرضها للمشترين</p>
                  </div>
                </div>
              </div>

              {errors.categories && (
                <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/30 text-rose-600 dark:text-rose-400 text-sm font-bold flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 shrink-0" />
                  {errors.categories}
                </div>
              )}

              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                {cardCategories.map((cat, idx) => {
                  // Only show the card if it's the one currently being edited, or if NO card is being edited.
                  if (editingCategoryId && editingCategoryId !== cat.id) return null;

                  return (
                    <CardCategoryItem
                      key={cat.id}
                      category={cat}
                      index={idx}
                      isEditing={editingCategoryId === cat.id}
                      onEdit={() => setEditingCategoryId(cat.id)}
                      onSave={() => setEditingCategoryId(null)}
                      onUpdate={handleUpdateCategory}
                      onRemove={handleRemoveCategory}
                      isDarkMode={isDarkMode}
                      canRemove={cardCategories.length > 1}
                    />
                  );
                })}
              </div>

              {/* Only show "Add Category" if no category is currently being edited */}
              {!editingCategoryId && (
                <div className="pt-2 animate-in fade-in zoom-in-95 duration-300">
                  <button
                    type="button"
                    onClick={handleAddCategory}
                    className="w-full flex items-center justify-center gap-2 px-5 py-4 rounded-2xl text-sm font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-500/10 dark:hover:bg-indigo-500/20 border-2 border-dashed border-indigo-200 dark:border-indigo-500/30 transition-all hover:scale-[1.01] active:scale-[0.98]"
                  >
                    <Plus className="w-5 h-5" />
                    <span>إضافة فئة كرت جديدة</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Step 5: Review */}
          {currentStep === 5 && (
            <div className="space-y-6 animate-in slide-in-from-right-8 fade-in duration-500">
              <div className="flex flex-col md:flex-row md:items-center gap-4 mb-2 pb-5 border-b border-slate-100 dark:border-slate-800">
                <div className="w-12 h-12 bg-sky-50 dark:bg-sky-500/10 rounded-xl flex items-center justify-center text-sky-600 dark:text-sky-400 shrink-0">
                  <ListChecks className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-slate-800 dark:text-white">المراجعة النهائية</h2>
                  <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium">يرجى التأكد من صحة كافة البيانات أدناه قبل الإرسال النهائي</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Summary Card: Owner */}
                <div className="p-5 rounded-2xl bg-slate-50 dark:bg-[#141d2e] border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-1.5 h-full bg-indigo-500" />
                  <h3 className="text-sm font-black text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2">
                    <User className="w-4 h-4 text-indigo-500" /> معلومات المالك
                  </h3>
                  <div className="space-y-3 text-xs md:text-sm font-medium">
                    <div className="flex justify-between items-center pb-2 border-b border-slate-200 dark:border-slate-700/50">
                      <span className="text-slate-500 dark:text-slate-400">الاسم</span>
                      <span className="text-slate-800 dark:text-white font-bold">{ownerName}</span>
                    </div>
                    <div className="flex justify-between items-center pb-2 border-b border-slate-200 dark:border-slate-700/50">
                      <span className="text-slate-500 dark:text-slate-400">الرقم</span>
                      <span className="text-slate-800 dark:text-white font-bold" dir="ltr">{ownerId}</span>
                    </div>
                    <div className="flex justify-between items-center pb-2 border-b border-slate-200 dark:border-slate-700/50">
                      <span className="text-slate-500 dark:text-slate-400">التواصل</span>
                      <span className="text-slate-800 dark:text-white font-bold" dir="ltr">{contactNumber}</span>
                    </div>
                  </div>
                </div>

                {/* Summary Card: Network */}
                <div className="p-5 rounded-2xl bg-slate-50 dark:bg-[#141d2e] border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-1.5 h-full bg-emerald-500" />
                  <h3 className="text-sm font-black text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2">
                    <Globe className="w-4 h-4 text-emerald-500" /> معلومات الشبكة
                  </h3>
                  <div className="space-y-3 text-xs md:text-sm font-medium">
                    <div className="flex justify-between items-center pb-2 border-b border-slate-200 dark:border-slate-700/50">
                      <span className="text-slate-500 dark:text-slate-400">الشبكة</span>
                      <span className="text-slate-800 dark:text-white font-bold">{networkName}</span>
                    </div>
                    <div className="flex justify-between items-center pb-2 border-b border-slate-200 dark:border-slate-700/50">
                      <span className="text-slate-500 dark:text-slate-400">بالإنجليزي</span>
                      <span className="text-slate-800 dark:text-white font-bold" dir="ltr">{englishName}</span>
                    </div>
                    <div className="flex justify-between items-center pb-2 border-b border-slate-200 dark:border-slate-700/50">
                      <span className="text-slate-500 dark:text-slate-400">الرابط الخارجي</span>
                      <span className="text-slate-800 dark:text-white font-bold" dir="ltr">{externalLink || 'لا يوجد'}</span>
                    </div>
                    <div className="flex justify-between items-center pb-2 border-b border-slate-200 dark:border-slate-700/50">
                      <span className="text-slate-500 dark:text-slate-400">المكان</span>
                      <span className="text-slate-800 dark:text-white font-bold">{governorate} - {city}</span>
                    </div>
                    <div className="flex justify-between items-center pb-2 border-b border-slate-200 dark:border-slate-700/50">
                      <span className="text-slate-500 dark:text-slate-400">هاتف آخر</span>
                      <span className="text-slate-800 dark:text-white font-bold" dir="ltr">{networkPhone || 'لا يوجد'}</span>
                    </div>
                  </div>
                </div>

                {/* Summary Card: Wallet */}
                <div className="p-5 rounded-2xl bg-slate-50 dark:bg-[#141d2e] border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden group md:col-span-2">
                  <div className="absolute top-0 right-0 w-1.5 h-full bg-amber-500" />
                  <h3 className="text-sm font-black text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2">
                    <Wallet className="w-4 h-4 text-amber-500" /> حساب المحفظة
                  </h3>
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <p className="text-xs md:text-sm font-medium text-slate-500 dark:text-slate-400">رقم المحفظة المعتمد لاستقبال الأرباح:</p>
                    <div className="px-5 py-2.5 bg-white dark:bg-[#1c2638] rounded-xl border border-slate-200 dark:border-slate-700 font-black text-lg tracking-widest text-slate-800 dark:text-white shadow-sm" dir="ltr">
                      {jaibWalletNumber}
                    </div>
                  </div>
                </div>

                {/* Summary Card: Categories */}
                <div className="p-5 rounded-2xl bg-slate-50 dark:bg-[#141d2e] border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden group md:col-span-2">
                  <div className="absolute top-0 right-0 w-1.5 h-full bg-purple-500" />
                  <h3 className="text-sm font-black text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2">
                    <Tag className="w-4 h-4 text-purple-500" /> الفئات المضافة ({cardCategories.length})
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {cardCategories.map(cat => (
                      <div key={cat.id} className="flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-[#1c2638] border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-bold shadow-sm">
                        <span className="text-slate-800 dark:text-white">{cat.name}</span>
                        <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600" />
                        <span className="text-indigo-600 dark:text-indigo-400">{cat.price} ريال</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Agreement Checkbox */}
                <div className={`mt-6 p-4 rounded-2xl border ${errors.agreed ? 'border-rose-500 bg-rose-50 dark:bg-rose-500/10' : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#141d2e]'} md:col-span-2 flex items-center justify-start gap-3 transition-colors`}>
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
                        className="text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                      >
                        شروط الخصوصية والسياسة العامة
                      </span>
                    </label>
                    {errors.agreed && <span className="text-xs font-bold text-rose-500 mt-1">{errors.agreed}</span>}
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="mt-10 flex flex-col-reverse md:flex-row justify-between items-center gap-4 pt-5 border-t border-slate-100 dark:border-slate-800/80">
            <button
              type="button"
              onClick={prevStep}
              disabled={currentStep === 1 || isSubmitting}
              className={`w-full md:w-auto flex justify-center items-center gap-2 px-8 py-3.5 rounded-xl text-sm font-bold transition-all active:scale-[0.98] ${
                currentStep === 1 || isSubmitting
                  ? 'opacity-0 pointer-events-none'
                  : isDarkMode
                  ? 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white shadow-lg shadow-black/20'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-800 shadow-sm'
              }`}
            >
              <ChevronRight className="w-4 h-4" />
              <span>السابق</span>
            </button>

            {currentStep < totalSteps ? (
              <button
                type="button"
                onClick={nextStep}
                className="w-full md:w-auto flex justify-center items-center gap-2 px-10 py-3.5 rounded-xl text-sm font-black text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 transition-all hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98]"
              >
                <span>متابعة للخطوة التالية</span>
                <ChevronLeft className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="w-full md:w-auto flex justify-center items-center gap-2 px-10 py-3.5 rounded-xl text-sm font-black text-white bg-gradient-to-r from-[#10b981] to-[#059669] hover:from-[#059669] hover:to-[#047857] shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 transition-all hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>جاري الإرسال...</span>
                  </>
                ) : (
                  <>
                    <span>إرسال الطلب واعتماده</span>
                    <Send className="w-4 h-4 -scale-x-100" />
                  </>
                )}
              </button>
            )}
          </div>

          {onCancelEdit && (
            <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 text-center">
              <button
                type="button"
                onClick={onCancelEdit}
                className="text-xs md:text-sm font-bold text-slate-500 hover:text-rose-500 transition-colors underline underline-offset-4"
              >
                إلغاء التعديل والعودة
              </button>
            </div>
          )}
        </div>

        {/* Support Note */}
        <div className="mt-8 mb-6 text-center px-4">
          <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 font-medium flex flex-wrap items-center justify-center gap-1.5">
            <span>للاستفسار تواصل مع</span>
            <span className="font-bold text-indigo-500">خدمة العملاء:</span>
            <a href="tel:777310606" className="font-black tracking-wider text-indigo-600 dark:text-indigo-400 hover:underline" dir="ltr">777310606</a>
            <span className="mx-2 opacity-50">|</span>
            <span className="font-bold text-indigo-500">الدعم الفني:</span>
            <a href="tel:775945393" className="font-black tracking-wider text-indigo-600 dark:text-indigo-400 hover:underline" dir="ltr">775945393</a>
          </p>
        </div>

        </div>

        {/* Privacy Policy Modal */}
        {showPrivacyPolicy && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowPrivacyPolicy(false)} />
            <div className={`relative w-full max-w-2xl max-h-[85vh] flex flex-col rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300 ${isDarkMode ? 'bg-[#141d2b] border border-slate-800 text-slate-200' : 'bg-white border border-slate-200 text-slate-800'}`}>
              <div className={`flex items-center justify-between p-5 border-b ${isDarkMode ? 'border-slate-800/80 bg-[#101726]' : 'border-slate-100 bg-slate-50'}`}>
                <h3 className="text-lg font-black flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-indigo-500" />
                  شروط الخصوصية والسياسة العامة
                </h3>
                <button type="button" onClick={() => setShowPrivacyPolicy(false)} className={`p-2 rounded-xl transition-colors ${isDarkMode ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-slate-200 text-slate-500'}`}>
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className={`p-6 overflow-y-auto text-sm leading-relaxed space-y-6 ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                <div>
                  <h4 className={`font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>1. مقدمة وإقرار</h4>
                  <p>توضح هذه السياسة الشروط والأحكام التي تحكم انضمامك إلى شبكة الموزعين المعتمدين. بتقديمك لهذا الطلب، فإنك تقر بقراءة وفهم هذه الشروط والموافقة عليها بالكامل.</p>
                </div>
                
                <div>
                  <h4 className={`font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>2. دقة المعلومات</h4>
                  <p>يتعهد مقدم الطلب بأن جميع البيانات والمعلومات المقدمة (بما في ذلك أرقام الهواتف وبيانات المحفظة) صحيحة ودقيقة، ويتحمل المسؤولية القانونية الكاملة عن أي خطأ أو تلاعب.</p>
                </div>
                
                <div>
                  <h4 className={`font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>3. الحسابات المالية والأرباح</h4>
                  <p>سيتم اعتماد رقم محفظة جيب المدخل في هذا الطلب كحساب رئيسي لاستقبال الأرباح والعمولات. أي تغيير في هذا الرقم يتطلب تقديم طلب رسمي للإدارة.</p>
                </div>
                
                <div>
                  <h4 className={`font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>4. الخصوصية وحماية البيانات</h4>
                  <p>نلتزم بحماية بياناتك الشخصية والمالية وفقاً لأعلى معايير الأمان، ولن يتم مشاركتها مع أي طرف ثالث إلا بموجب موافقتك الصريحة أو وفقاً للقوانين واللوائح المعمول بها.</p>
                </div>
                
                <div>
                  <h4 className={`font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>5. الإلغاء والتعديل</h4>
                  <p>تحتفظ الإدارة بالحق في رفض الطلب، أو تعديل هذه الشروط في أي وقت مع إشعار المستخدمين بذلك. كما يحق لها تعليق حساب الموزع في حال الإخلال بأي من هذه الشروط.</p>
                </div>
              </div>
              
              <div className={`p-5 border-t text-left ${isDarkMode ? 'border-slate-800/80 bg-[#101726]' : 'border-slate-100 bg-slate-50'}`}>
                <button
                  type="button"
                  onClick={() => {
                    setAgreed(true);
                    setShowPrivacyPolicy(false);
                    if(errors.agreed) setErrors({...errors, agreed: ''});
                  }}
                  className="px-8 py-3 rounded-xl text-sm font-black text-white bg-indigo-600 hover:bg-indigo-500 shadow-lg shadow-indigo-500/30 transition-all active:scale-95"
                >
                  موافق وإغلاق
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
  );
};
