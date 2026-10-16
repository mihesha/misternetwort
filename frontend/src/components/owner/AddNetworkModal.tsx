"use client";
import React, { useState } from 'react';
import { 
  Globe, Wallet, Tag, ListChecks, Plus, CheckCircle2, Clock,
  X, AlertCircle, ChevronLeft, ChevronRight, Loader2, Sparkles, Building2, MapPin, Link as LinkIcon, Phone
} from 'lucide-react';
import { CardCategory, CardType } from '../../types';
import { YEMEN_GOVERNORATES } from '../../data/yemenLocations';
import { CardCategoryItem } from '../common/CardCategoryItem';
import { CustomSelect } from '../common/CustomSelect';
import { useOwnerContext } from '../../context/OwnerContext';
import { useOwnerActions } from '../../hooks/useOwnerActions';

interface AddNetworkModalProps {
  isOpen: boolean;
  onClose: () => void;
  isDarkMode: boolean;
  onSuccess?: (newNetwork: any) => void;
}

export const AddNetworkModal: React.FC<AddNetworkModalProps> = ({
  isOpen,
  onClose,
  isDarkMode,
  onSuccess,
}) => {
  const { setActiveNetworkId, networks } = useOwnerContext();
  const { fetchOwnerNetworks } = useOwnerActions();

  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 4;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successData, setSuccessData] = useState<any | null>(null);

  // Network Fields
  const [networkName, setNetworkName] = useState('');
  const [englishName, setEnglishName] = useState('');
  const [externalLink, setExternalLink] = useState('');
  const [networkPhone, setNetworkPhone] = useState('');
  const [governorate, setGovernorate] = useState('');
  const [city, setCity] = useState('');
  const [neighborhood, setNeighborhood] = useState('');

  // Wallet
  const [jaibWalletNumber, setJaibWalletNumber] = useState('');

  // Categories
  const [cardCategories, setCardCategories] = useState<CardCategory[]>([
    {
      id: `card-${Date.now()}`,
      name: '100 ريال',
      price: 100,
      mega: 300,
      hours: 3,
      validityDays: 3,
      cardType: 'مستخدم فقط',
    }
  ]);
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);

  const [errors, setErrors] = useState<Record<string, string>>({});

  if (!isOpen) return null;

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
      const newCard: CardCategory = { 
        id: `card-${Date.now()}`, 
        name: '', 
        price: '', 
        mega: '', 
        hours: '', 
        validityDays: '', 
        cardType: 'مستخدم فقط' 
      };
      setCardCategories([newCard]);
      setEditingCategoryId(newCard.id);
    } else {
      setCardCategories(newCategories);
      if (editingCategoryId === id) setEditingCategoryId(null);
    }
  };

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};
    if (step === 1) {
      if (!networkName.trim()) newErrors.networkName = 'يرجى كتابة اسم الشبكة';
      if (!englishName.trim()) newErrors.englishName = 'يرجى كتابة اسم الشبكة بالإنجليزي';
      if (!externalLink.trim()) newErrors.externalLink = 'يرجى إدخال رابط صفحة تسجيل الدخول';
      if (networkPhone.trim() && networkPhone.trim().length < 9) newErrors.networkPhone = 'رقم الهاتف يجب أن لا يقل عن 9 أرقام';
      if (!governorate) newErrors.governorate = 'يرجى اختيار المحافظة';
      if (!city) newErrors.city = 'يرجى اختيار المدينة';
    } else if (step === 2) {
      if (!jaibWalletNumber.trim() || jaibWalletNumber.trim().length < 9) {
        newErrors.jaibWalletNumber = 'رقم محفظة جيب يجب أن لا يقل عن 9 أرقام';
      }
    } else if (step === 3) {
      if (editingCategoryId) {
        newErrors.categories = 'يرجى حفظ الفئة الحالية قبل المتابعة';
      } else if (cardCategories.length === 0) {
        newErrors.categories = 'يرجى إضافة فئة واحدة على الأقل للشبكة';
      } else {
        const hasInvalid = cardCategories.some(c => !c.name || !c.price);
        if (hasInvalid) {
          newErrors.categories = 'يرجى التأكد من ملء وحفظ جميع الفئات المدخلة';
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
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

  const handleSubmit = async () => {
    if (!validateStep(1) || !validateStep(2) || !validateStep(3)) {
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('owner_auth_token') : null;
      if (!token) {
        throw new Error('يرجى تسجيل الدخول أولاً');
      }

      const payload = {
        networkName: networkName.trim(),
        englishName: englishName.trim(),
        externalLink: externalLink.trim(),
        networkPhone: networkPhone.trim() || null,
        governorate,
        city,
        neighborhood: neighborhood.trim() || null,
        jaibWalletNumber: jaibWalletNumber.trim(),
        cardCategories: cardCategories.map(c => ({
          name: c.name,
          price: Number(c.price),
          mega: Number(c.mega || 0),
          hours: Number(c.hours || 0),
          validityDays: Number(c.validityDays || 0),
          cardType: c.cardType || 'مستخدم فقط',
        }))
      };

      const res = await fetch('/api/networks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || data.message || 'فشل في إرسال طلب إضافة الشبكة');
      }

      setSuccessData(data.application || {
        reference_number: `REQ-${Date.now().toString().slice(-4)}`,
        network_name: networkName,
        status: 'pending'
      });
      await fetchOwnerNetworks();
      if (onSuccess) {
        onSuccess(data.application);
      }
    } catch (err: any) {
      setErrors({ submit: err.message || 'حدث خطأ أثناء إرسال طلب إضافة الشبكة' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const stepsList = [
    { num: 1, label: 'الشبكة', icon: <Globe className="w-4 h-4" /> },
    { num: 2, label: 'المحفظة', icon: <Wallet className="w-4 h-4" /> },
    { num: 3, label: 'الفئات', icon: <Tag className="w-4 h-4" /> },
    { num: 4, label: 'مراجعة', icon: <ListChecks className="w-4 h-4" /> },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={() => {
          if (!isSubmitting) onClose();
        }}
      />

      {/* Modal Dialog */}
      <div 
        dir="rtl"
        className={`relative w-full max-w-3xl rounded-3xl shadow-2xl border transition-all duration-300 z-10 my-auto overflow-hidden ${
          isDarkMode 
            ? 'bg-[#0f172a] border-white/10 text-slate-100 shadow-black/80' 
            : 'bg-white border-slate-200 text-slate-800 shadow-slate-900/10'
        }`}
      >
        {/* Header */}
        <div className={`flex items-center justify-between px-6 py-5 border-b ${
          isDarkMode ? 'border-white/10 bg-white/5' : 'border-slate-100 bg-slate-50/70'
        }`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Plus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black">إضافة شبكة جديدة</h2>
              <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                أضف شبكة جديدة وقم بإدارتها بشكل منفصل تماماً في حسابك
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className={`p-2 rounded-xl transition-colors cursor-pointer ${
              isDarkMode ? 'hover:bg-white/10 text-slate-400' : 'hover:bg-slate-200 text-slate-500'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Success View */}
        {successData ? (
          <div className="p-8 sm:p-10 text-center flex flex-col items-center">
            <div className="w-20 h-20 rounded-3xl bg-amber-500/20 text-amber-500 flex items-center justify-center mb-5 ring-8 ring-amber-500/10 animate-in zoom-in-75">
              <Clock className="w-10 h-10" />
            </div>
            <h3 className="text-xl sm:text-2xl font-black mb-2">تم إرسال طلب إضافة الشبكة بنجاح!</h3>
            <p className={`text-sm max-w-md mx-auto mb-3 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
              تم تسجيل طلب إضافة شبكة <span className="font-black text-amber-500">"{successData.network_name || networkName}"</span> برقم مرجعي:
            </p>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-amber-500/10 border border-amber-500/20 font-mono font-black text-base text-amber-400 mb-4">
              <span>#{successData.reference_number}</span>
            </div>
            <p className={`text-xs max-w-md mx-auto mb-6 leading-relaxed ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              الطلب الآن قيد المراجعة لدى إدارة المنصة. سيتم اعتماد وتفعيل الشبكة وإضافتها فوراً وتلقائياً لحسابك الحالي دون الحاجة لأي كلمة سر مؤقتة أو رمز تحقق.
            </p>

            <div className="w-full max-w-xs">
              <button
                onClick={onClose}
                className="w-full py-3.5 px-6 rounded-xl font-black text-sm bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/30 transition-all cursor-pointer"
              >
                حسناً، متابعة شبكاتي
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Steps Navigation Bar */}
            <div className={`px-6 pt-5 pb-3 border-b ${isDarkMode ? 'border-white/5' : 'border-slate-100'}`}>
              <div className="grid grid-cols-4 gap-2">
                {stepsList.map((step) => {
                  const isActive = currentStep === step.num;
                  const isCompleted = currentStep > step.num;
                  return (
                    <button
                      key={step.num}
                      type="button"
                      onClick={() => {
                        if (step.num < currentStep) setCurrentStep(step.num);
                      }}
                      className={`flex items-center justify-center gap-2 py-2 px-2 rounded-xl text-xs font-bold transition-all ${
                        isActive
                          ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                          : isCompleted
                          ? isDarkMode
                            ? 'bg-white/10 text-emerald-400'
                            : 'bg-emerald-50 text-emerald-600'
                          : isDarkMode
                          ? 'bg-white/5 text-slate-400'
                          : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      <span>{step.icon}</span>
                      <span className="hidden sm:inline">{step.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Form Body */}
            <div className="p-6 max-h-[62vh] overflow-y-auto custom-scrollbar">
              {errors.submit && (
                <div className="mb-5 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-sm flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 shrink-0" />
                  <span>{errors.submit}</span>
                </div>
              )}

              {/* Step 1: Network Details */}
              {currentStep === 1 && (
                <div className="space-y-4 animate-in fade-in duration-300">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold mb-2">
                        اسم الشبكة (بالعربي) <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={networkName}
                        onChange={(e) => {
                          setNetworkName(e.target.value);
                          if (!englishName) {
                            setEnglishName(e.target.value.toLowerCase().replace(/[\s_]+/g, '-'));
                          }
                        }}
                        placeholder="مثال: شبكة النور اللاسلكية"
                        className={`w-full px-4 py-3 rounded-xl text-sm transition-all border outline-none ${
                          errors.networkName 
                            ? 'border-rose-500 bg-rose-500/10' 
                            : isDarkMode ? 'bg-[#1c2638] border-white/10 focus:border-blue-500' : 'bg-slate-50 border-slate-200 focus:border-blue-500'
                        }`}
                      />
                      {errors.networkName && <p className="text-xs text-rose-500 mt-1">{errors.networkName}</p>}
                    </div>

                    <div>
                      <label className="block text-xs font-bold mb-2">
                        الاسم بالإنجليزي (Slug) <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        dir="ltr"
                        value={englishName}
                        onChange={(e) => setEnglishName(e.target.value)}
                        placeholder="e.g. al-noor-net"
                        className={`w-full px-4 py-3 rounded-xl text-sm transition-all border outline-none ${
                          errors.englishName 
                            ? 'border-rose-500 bg-rose-500/10' 
                            : isDarkMode ? 'bg-[#1c2638] border-white/10 focus:border-blue-500' : 'bg-slate-50 border-slate-200 focus:border-blue-500'
                        }`}
                      />
                      {errors.englishName && <p className="text-xs text-rose-500 mt-1">{errors.englishName}</p>}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold mb-2">
                      رابط صفحة تسجيل دخول الشبكة (Hotspot Login URL) <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <LinkIcon className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        dir="ltr"
                        value={externalLink}
                        onChange={(e) => setExternalLink(e.target.value)}
                        placeholder="http://10.0.0.1/login or alnoor.net"
                        className={`w-full pl-10 pr-4 py-3 rounded-xl text-sm transition-all border outline-none ${
                          errors.externalLink 
                            ? 'border-rose-500 bg-rose-500/10' 
                            : isDarkMode ? 'bg-[#1c2638] border-white/10 focus:border-blue-500' : 'bg-slate-50 border-slate-200 focus:border-blue-500'
                        }`}
                      />
                    </div>
                    {errors.externalLink && <p className="text-xs text-rose-500 mt-1">{errors.externalLink}</p>}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-bold mb-2">
                        المحافظة <span className="text-rose-500">*</span>
                      </label>
                      <CustomSelect
                        value={governorate}
                        onChange={(val: string) => {
                          setGovernorate(val);
                          setCity('');
                        }}
                        options={YEMEN_GOVERNORATES.map(g => g.name)}
                        placeholder="اختر المحافظة"
                        error={!!errors.governorate}
                        isDarkMode={isDarkMode}
                      />
                      {errors.governorate && <p className="text-xs text-rose-500 mt-1">{errors.governorate}</p>}
                    </div>

                    <div>
                      <label className="block text-xs font-bold mb-2">
                        المديرية / المدينة <span className="text-rose-500">*</span>
                      </label>
                      <CustomSelect
                        value={city}
                        onChange={(val: string) => setCity(val)}
                        options={availableCities}
                        placeholder={governorate ? "اختر المديرية" : "اختر المحافظة أولاً"}
                        disabled={!governorate}
                        error={!!errors.city}
                        isDarkMode={isDarkMode}
                      />
                      {errors.city && <p className="text-xs text-rose-500 mt-1">{errors.city}</p>}
                    </div>

                    <div>
                      <label className="block text-xs font-bold mb-2">
                        الحي / المنطقة (اختياري)
                      </label>
                      <input
                        type="text"
                        value={neighborhood}
                        onChange={(e) => setNeighborhood(e.target.value)}
                        placeholder="مثال: شارع الستين"
                        className={`w-full px-4 py-3.5 rounded-xl text-sm transition-all border outline-none ${
                          isDarkMode ? 'bg-[#1c2638] border-white/10 focus:border-blue-500' : 'bg-slate-50 border-slate-200 focus:border-blue-500'
                        }`}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold mb-2">
                      رقم هاتف الشبكة الإضافي للتواصل (اختياري)
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="tel"
                        dir="ltr"
                        value={networkPhone}
                        onChange={(e) => setNetworkPhone(e.target.value)}
                        placeholder="77XXXXXXX"
                        className={`w-full pl-10 pr-4 py-3 rounded-xl text-sm transition-all border outline-none ${
                          errors.networkPhone 
                            ? 'border-rose-500 bg-rose-500/10' 
                            : isDarkMode ? 'bg-[#1c2638] border-white/10 focus:border-blue-500' : 'bg-slate-50 border-slate-200 focus:border-blue-500'
                        }`}
                      />
                    </div>
                    {errors.networkPhone && <p className="text-xs text-rose-500 mt-1">{errors.networkPhone}</p>}
                  </div>
                </div>
              )}

              {/* Step 2: Financial Wallet */}
              {currentStep === 2 && (
                <div className="space-y-5 animate-in fade-in duration-300">
                  <div className={`p-4 rounded-2xl border ${
                    isDarkMode ? 'bg-blue-900/20 border-blue-500/30 text-blue-200' : 'bg-blue-50 border-blue-200 text-blue-800'
                  } flex items-start gap-3`}>
                    <Wallet className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                    <div className="text-xs leading-relaxed">
                      <span className="font-bold block mb-1">المحفظة المالية الخاصة بأرباح هذه الشبكة:</span>
                      سيتم تحويل أرباح ومبيعات هذه الشبكة بشكل منفصل إلى هذا الحساب عند طلب السحب. يمكنك استخدام نفس محفظتك أو محفظة منفصلة لكل شبكة.
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold mb-2">
                      رقم محفظة جيب للشبكة <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="tel"
                      dir="ltr"
                      value={jaibWalletNumber}
                      onChange={(e) => setJaibWalletNumber(e.target.value)}
                      placeholder="77XXXXXXX"
                      className={`w-full px-4 py-3 rounded-xl text-sm transition-all border outline-none ${
                        errors.jaibWalletNumber 
                          ? 'border-rose-500 bg-rose-500/10' 
                          : isDarkMode ? 'bg-[#1c2638] border-white/10 focus:border-blue-500' : 'bg-slate-50 border-slate-200 focus:border-blue-500'
                      }`}
                    />
                    {errors.jaibWalletNumber && <p className="text-xs text-rose-500 mt-1">{errors.jaibWalletNumber}</p>}
                  </div>

                  {networks.length > 0 && networks[0].jaib_wallet && (
                    <button
                      type="button"
                      onClick={() => setJaibWalletNumber(networks[0].jaib_wallet || '')}
                      className={`text-xs font-bold px-3 py-2 rounded-xl border transition-all cursor-pointer flex items-center gap-2 ${
                        isDarkMode ? 'border-white/10 hover:bg-white/5 text-blue-400' : 'border-slate-200 hover:bg-slate-50 text-blue-600'
                      }`}
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      استخدام نفس محفظة شبكة {networks[0].name} ({networks[0].jaib_wallet})
                    </button>
                  )}
                </div>
              )}

              {/* Step 3: Card Categories */}
              {currentStep === 3 && (
                <div className="space-y-4 animate-in fade-in duration-300">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-bold">باقات وفئات الكروت</h4>
                      <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                        أضف فئات الكروت الخاصة بهذه الشبكة
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleAddCategory}
                      className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-blue-600/30 transition-all cursor-pointer"
                    >
                      <Plus className="w-4 h-4" /> إضافة فئة
                    </button>
                  </div>

                  {errors.categories && (
                    <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs">
                      {errors.categories}
                    </div>
                  )}

                  <div className="space-y-3">
                    {cardCategories.map((cat, idx) => (
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
                    ))}
                  </div>
                </div>
              )}

              {/* Step 4: Review & Confirm */}
              {currentStep === 4 && (
                <div className="space-y-5 animate-in fade-in duration-300">
                  <div className={`p-4 rounded-2xl border ${
                    isDarkMode ? 'bg-white/5 border-white/10' : 'bg-slate-50 border-slate-200'
                  } space-y-3`}>
                    <h4 className="text-sm font-black flex items-center gap-2 text-blue-500">
                      <Globe className="w-4 h-4" /> بيانات الشبكة
                    </h4>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div><span className="text-slate-400">اسم الشبكة:</span> <span className="font-bold">{networkName}</span></div>
                      <div><span className="text-slate-400">الاسم المختصر:</span> <span className="font-mono font-bold">{englishName}</span></div>
                      <div><span className="text-slate-400">الموقع:</span> <span className="font-bold">{governorate} - {city}</span></div>
                      <div><span className="text-slate-400">الرابط:</span> <span className="font-mono text-blue-400 truncate block">{externalLink}</span></div>
                    </div>
                  </div>

                  <div className={`p-4 rounded-2xl border ${
                    isDarkMode ? 'bg-white/5 border-white/10' : 'bg-slate-50 border-slate-200'
                  } space-y-2`}>
                    <h4 className="text-sm font-black flex items-center gap-2 text-emerald-500">
                      <Wallet className="w-4 h-4" /> المحفظة المالية
                    </h4>
                    <div className="text-xs">
                      <span className="text-slate-400">رقم محفظة جيب للشبكة:</span> <span className="font-mono font-bold">{jaibWalletNumber}</span>
                    </div>
                  </div>

                  <div className={`p-4 rounded-2xl border ${
                    isDarkMode ? 'bg-white/5 border-white/10' : 'bg-slate-50 border-slate-200'
                  } space-y-2`}>
                    <h4 className="text-sm font-black flex items-center gap-2 text-purple-500">
                      <Tag className="w-4 h-4" /> فئات الكروت ({cardCategories.length})
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {cardCategories.map((c, i) => (
                        <span key={i} className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${
                          isDarkMode ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200 shadow-xs'
                        }`}>
                          {c.name || `${c.price} ريال`} ({c.price} ر.ي)
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer Actions */}
            <div className={`flex items-center justify-between px-6 py-4 border-t ${
              isDarkMode ? 'border-white/10 bg-white/5' : 'border-slate-100 bg-slate-50'
            }`}>
              {currentStep > 1 ? (
                <button
                  type="button"
                  onClick={prevStep}
                  disabled={isSubmitting}
                  className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-1.5 border transition-all cursor-pointer ${
                    isDarkMode ? 'border-white/10 hover:bg-white/5 text-slate-300' : 'border-slate-200 hover:bg-slate-100 text-slate-700'
                  }`}
                >
                  <ChevronRight className="w-4 h-4" /> السابق
                </button>
              ) : (
                <div />
              )}

              {currentStep < totalSteps ? (
                <button
                  type="button"
                  onClick={nextStep}
                  className="px-6 py-2.5 rounded-xl font-bold text-xs bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-600/30 flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  التالي <ChevronLeft className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="px-7 py-2.5 rounded-xl font-black text-xs bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-lg shadow-blue-600/30 flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      جاري إنشاء الشبكة...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      تأكيد وإنشاء الشبكة الآن
                    </>
                  )}
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};
