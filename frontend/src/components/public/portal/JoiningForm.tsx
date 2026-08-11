import React, { useState } from 'react';
import { User, Globe, Wallet, Tag, Plus, Send, AlertCircle, Sparkles } from 'lucide-react';
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

export const JoiningForm: React.FC<JoiningFormProps> = ({
  onSubmit,
  isDarkMode,
  isSubmitting = false,
  initialData,
  referenceNumber,
  adminNotes,
  onCancelEdit,
}) => {
  // Form State initialized with initialData if provided
  const [ownerName, setOwnerName] = useState(initialData?.owner.ownerName || '');
  const [ownerId, setOwnerId] = useState(initialData?.owner.ownerId || '');
  const [contactNumber, setContactNumber] = useState(initialData?.owner.contactNumber || '');

  const [networkName, setNetworkName] = useState(initialData?.network.networkName || '');
  const [networkPhone, setNetworkPhone] = useState(initialData?.network.networkPhone || '');
  const [governorate, setGovernorate] = useState(initialData?.network.governorate || '');
  const [city, setCity] = useState(initialData?.network.city || '');
  const [neighborhood, setNeighborhood] = useState(initialData?.network.neighborhood || '');

  const [jaibWalletNumber, setJaibWalletNumber] = useState(initialData?.jaibWalletNumber || '');

  // Initial Card Denomination matching screenshot defaults
  const [cardCategories, setCardCategories] = useState<CardCategory[]>(
    initialData?.cardCategories && initialData.cardCategories.length > 0
      ? initialData.cardCategories
      : [
          {
            id: 'card-1',
            name: '',
            price: '',
            mega: '',
            hours: '',
            validityDays: '',
            cardType: 'مستخدم فقط',
          },
        ]
  );

  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Available cities based on chosen governorate
  const selectedGovObj = YEMEN_GOVERNORATES.find((g) => g.name === governorate);
  const availableCities = selectedGovObj ? selectedGovObj.cities : [];

  // Handlers for Card Categories
  const handleAddCategory = () => {
    const newCard: CardCategory = {
      id: `card-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
      name: '',
      price: '',
      mega: '',
      hours: '',
      validityDays: '',
      cardType: 'مستخدم فقط',
    };
    setCardCategories([...cardCategories, newCard]);
  };

  const handleUpdateCategory = (
    id: string,
    field: keyof CardCategory,
    value: string | number
  ) => {
    setCardCategories((prev) =>
      prev.map((cat) => (cat.id === id ? { ...cat, [field]: value } : cat))
    );
  };

  const handleRemoveCategory = (id: string) => {
    if (cardCategories.length <= 1) return;
    setCardCategories((prev) => prev.filter((cat) => cat.id !== id));
  };

  // Preset generator for fast standard Yemen packages
  const handleFillPresets = () => {
    setCardCategories([
      {
        id: 'preset-1',
        name: 'فئة 100 ريال',
        price: 100,
        mega: 300,
        hours: 3,
        validityDays: 1,
        cardType: 'مستخدم فقط',
      },
      {
        id: 'preset-2',
        name: 'فئة 250 ريال',
        price: 250,
        mega: 800,
        hours: 12,
        validityDays: 3,
        cardType: 'مستخدم فقط',
      },
      {
        id: 'preset-3',
        name: 'فئة 500 ريال',
        price: 500,
        mega: 2000,
        hours: 24,
        validityDays: 7,
        cardType: 'مستخدم + كلمة مرور',
      },
      {
        id: 'preset-4',
        name: 'فئة 1000 ريال',
        price: 1000,
        mega: 5000,
        hours: 72,
        validityDays: 30,
        cardType: 'مستخدم + كلمة مرور',
      },
    ]);
  };

  // Form Submit Handler
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Validation
    if (!ownerName.trim()) {
      setErrorMessage('يرجى كتابة اسم المالك');
      return;
    }
    if (!ownerId.trim()) {
      setErrorMessage('يرجى كتابة رقم المالك');
      return;
    }
    if (!contactNumber.trim()) {
      setErrorMessage('يرجى كتابة رقم التواصل');
      return;
    }
    if (!networkName.trim()) {
      setErrorMessage('يرجى كتابة اسم الشبكة');
      return;
    }
    if (!governorate) {
      setErrorMessage('يرجى اختيار المحافظة');
      return;
    }
    if (!city) {
      setErrorMessage('يرجى اختيار المدينة');
      return;
    }
    if (!jaibWalletNumber.trim()) {
      setErrorMessage('يرجى كتابة رقم محفظة جيب');
      return;
    }

    // Check categories
    for (let i = 0; i < cardCategories.length; i++) {
      const cat = cardCategories[i];
      if (!cat.name.trim()) {
        setErrorMessage(`يرجى كتابة اسم الفئة للكرت رقم ${i + 1}`);
        return;
      }
      if (cat.price === '' || Number(cat.price) <= 0) {
        setErrorMessage(`يرجى تحديد سعر الفئة للكرت رقم ${i + 1}`);
        return;
      }
      if (!cat.mega || Number(cat.mega) <= 0) {
        setErrorMessage(`يرجى كتابة حجم الميجا للفئة رقم ${i + 1}`);
        return;
      }
      if (!cat.hours || Number(cat.hours) <= 0) {
        setErrorMessage(`يرجى كتابة عدد الساعات للفئة رقم ${i + 1}`);
        return;
      }
      if (!cat.validityDays || Number(cat.validityDays) <= 0) {
        setErrorMessage(`يرجى تحديد أيام الصلاحية للفئة رقم ${i + 1}`);
        return;
      }
    }

    const formData: ApplicationFormData = {
      owner: {
        ownerName: ownerName.trim(),
        ownerId: ownerId.trim(),
        contactNumber: contactNumber.trim(),
      },
      network: {
        networkName: networkName.trim(),
        networkPhone: networkPhone.trim(),
        governorate,
        city,
        neighborhood: neighborhood.trim(),
      },
      jaibWalletNumber: jaibWalletNumber.trim(),
      cardCategories,
    };

    onSubmit(formData);
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-5 pb-12">
      {/* Admin Modification Notice if requested */}
      {adminNotes && (
        <div className="p-5 rounded-2xl bg-amber-500/15 border border-amber-500/40 text-amber-200 space-y-2 shadow-lg animate-in fade-in duration-300">
          <div className="flex items-center gap-2 font-bold text-sm text-amber-400">
            <AlertCircle className="w-5 h-5 shrink-0 text-amber-400" />
            <span>طلب تعديل بيانات من الإدارة {referenceNumber ? `(مرجع: ${referenceNumber})` : ''}:</span>
          </div>
          <p className="text-xs md:text-sm text-amber-100/90 font-medium bg-amber-950/40 p-3 rounded-xl border border-amber-500/20">
            {adminNotes}
          </p>
          <p className="text-xs text-slate-300 pt-0.5">
            يرجى تعديل الحقول المطلوبة أعلاه أو الفئات أدناه، ثم النقر على زر <strong>"إعادة إرسال الطلب بعد التعديل"</strong> لإرساله للإدارة مجدداً.
          </p>
        </div>
      )}

      {/* Main Form Box */}
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Error Alert if any */}
        {errorMessage && (
          <div className="flex items-center gap-2 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-sm font-semibold animate-shake">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* SECTION 1: معلومات المالك */}
        <div
          className={`p-5 md:p-6 rounded-2xl border transition-all ${
            isDarkMode
              ? 'bg-[#101726] border-slate-800/80 shadow-xl'
              : 'bg-white border-slate-200 shadow-sm'
          }`}
        >
          <div className="flex items-center gap-2.5 mb-5 pb-3 border-b border-slate-800/60">
            <User className="w-5 h-5 text-indigo-400" />
            <h2 className={`text-base md:text-lg font-bold ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
              معلومات المالك
            </h2>
          </div>

          <div className="space-y-4">
            {/* اسم المالك * */}
            <div>
              <label className={`block text-xs md:text-sm font-semibold mb-1.5 ${isDarkMode ? 'text-slate-200' : 'text-slate-700'}`}>
                اسم المالك <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={ownerName}
                onChange={(e) => setOwnerName(e.target.value)}
                placeholder="أدخل اسم المالك"
                className={`w-full px-4 py-3 rounded-xl text-sm transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                  isDarkMode
                    ? 'bg-[#1c2638] text-white border border-slate-700/80 placeholder-slate-500'
                    : 'bg-slate-50 text-slate-900 border border-slate-300 placeholder-slate-400'
                }`}
              />
            </div>

            {/* رقم المالك * */}
            <div>
              <label className={`block text-xs md:text-sm font-semibold mb-1.5 ${isDarkMode ? 'text-slate-200' : 'text-slate-700'}`}>
                رقم المالك <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={ownerId}
                onChange={(e) => setOwnerId(e.target.value)}
                placeholder="أدخل رقم المالك"
                className={`w-full px-4 py-3 rounded-xl text-sm transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                  isDarkMode
                    ? 'bg-[#1c2638] text-white border border-slate-700/80 placeholder-slate-500'
                    : 'bg-slate-50 text-slate-900 border border-slate-300 placeholder-slate-400'
                }`}
              />
            </div>

            {/* رقم التواصل * */}
            <div>
              <label className={`block text-xs md:text-sm font-semibold mb-1.5 ${isDarkMode ? 'text-slate-200' : 'text-slate-700'}`}>
                رقم التواصل <span className="text-rose-500">*</span>
              </label>
              <input
                type="tel"
                required
                value={contactNumber}
                onChange={(e) => setContactNumber(e.target.value)}
                placeholder="أدخل رقم التواصل"
                className={`w-full px-4 py-3 rounded-xl text-sm transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                  isDarkMode
                    ? 'bg-[#1c2638] text-white border border-slate-700/80 placeholder-slate-500'
                    : 'bg-slate-50 text-slate-900 border border-slate-300 placeholder-slate-400'
                }`}
              />
            </div>
          </div>
        </div>

        {/* SECTION 2: معلومات الشبكة */}
        <div
          className={`p-5 md:p-6 rounded-2xl border transition-all ${
            isDarkMode
              ? 'bg-[#101726] border-slate-800/80 shadow-xl'
              : 'bg-white border-slate-200 shadow-sm'
          }`}
        >
          <div className="flex items-center gap-2.5 mb-5 pb-3 border-b border-slate-800/60">
            <Globe className="w-5 h-5 text-indigo-400" />
            <h2 className={`text-base md:text-lg font-bold ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
              معلومات الشبكة
            </h2>
          </div>

          <div className="space-y-4">
            {/* اسم الشبكة * */}
            <div>
              <label className={`block text-xs md:text-sm font-semibold mb-1.5 ${isDarkMode ? 'text-slate-200' : 'text-slate-700'}`}>
                اسم الشبكة <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={networkName}
                onChange={(e) => setNetworkName(e.target.value)}
                placeholder="أدخل اسم الشبكة"
                className={`w-full px-4 py-3 rounded-xl text-sm transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                  isDarkMode
                    ? 'bg-[#1c2638] text-white border border-slate-700/80 placeholder-slate-500'
                    : 'bg-slate-50 text-slate-900 border border-slate-300 placeholder-slate-400'
                }`}
              />
            </div>

            {/* رقم هاتف الشبكة */}
            <div>
              <label className={`block text-xs md:text-sm font-semibold mb-1.5 ${isDarkMode ? 'text-slate-200' : 'text-slate-700'}`}>
                رقم هاتف الشبكة
              </label>
              <input
                type="tel"
                value={networkPhone}
                onChange={(e) => setNetworkPhone(e.target.value)}
                placeholder="أدخل رقم هاتف الشبكة"
                className={`w-full px-4 py-3 rounded-xl text-sm transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                  isDarkMode
                    ? 'bg-[#1c2638] text-white border border-slate-700/80 placeholder-slate-500'
                    : 'bg-slate-50 text-slate-900 border border-slate-300 placeholder-slate-400'
                }`}
              />
            </div>

            {/* المحافظة * */}
            <div>
              <label className={`block text-xs md:text-sm font-semibold mb-1.5 ${isDarkMode ? 'text-slate-200' : 'text-slate-700'}`}>
                المحافظة <span className="text-rose-500">*</span>
              </label>
              <select
                required
                value={governorate}
                onChange={(e) => {
                  setGovernorate(e.target.value);
                  setCity('');
                }}
                className={`w-full px-4 py-3 rounded-xl text-sm transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer ${
                  isDarkMode
                    ? 'bg-[#1c2638] text-white border border-slate-700/80'
                    : 'bg-slate-50 text-slate-900 border border-slate-300'
                }`}
              >
                <option value="">اختر المحافظة</option>
                {YEMEN_GOVERNORATES.map((gov) => (
                  <option key={gov.name} value={gov.name}>
                    {gov.name}
                  </option>
                ))}
              </select>
            </div>

            {/* المدينة * */}
            <div>
              <label className={`block text-xs md:text-sm font-semibold mb-1.5 ${isDarkMode ? 'text-slate-200' : 'text-slate-700'}`}>
                المدينة <span className="text-rose-500">*</span>
              </label>
              <select
                required
                disabled={!governorate}
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className={`w-full px-4 py-3 rounded-xl text-sm transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer ${
                  isDarkMode
                    ? 'bg-[#1c2638] text-white border border-slate-700/80 disabled:opacity-50'
                    : 'bg-slate-50 text-slate-900 border border-slate-300 disabled:opacity-50'
                }`}
              >
                <option value="">
                  {governorate ? 'اختر المدينة' : 'اختر المحافظة أولاً'}
                </option>
                {availableCities.map((cityName) => (
                  <option key={cityName} value={cityName}>
                    {cityName}
                  </option>
                ))}
              </select>
            </div>

            {/* المنطقة/الحي */}
            <div>
              <label className={`block text-xs md:text-sm font-semibold mb-1.5 ${isDarkMode ? 'text-slate-200' : 'text-slate-700'}`}>
                المنطقة/الحي
              </label>
              <input
                type="text"
                value={neighborhood}
                onChange={(e) => setNeighborhood(e.target.value)}
                placeholder="المنطقة أو الحي (اختياري)"
                className={`w-full px-4 py-3 rounded-xl text-sm transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                  isDarkMode
                    ? 'bg-[#1c2638] text-white border border-slate-700/80 placeholder-slate-500'
                    : 'bg-slate-50 text-slate-900 border border-slate-300 placeholder-slate-400'
                }`}
              />
            </div>
          </div>
        </div>

        {/* SECTION 3: رقم محفظة جيب */}
        <div
          className={`p-5 md:p-6 rounded-2xl border transition-all ${
            isDarkMode
              ? 'bg-[#101726] border-slate-800/80 shadow-xl'
              : 'bg-white border-slate-200 shadow-sm'
          }`}
        >
          <div className="flex items-center gap-2.5 mb-1">
            <Wallet className="w-5 h-5 text-indigo-400" />
            <h2 className={`text-base md:text-lg font-bold ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
              رقم محفظة جيب <span className="text-rose-500">*</span>
            </h2>
          </div>

          <p className="text-xs text-slate-400 mb-4 pr-7 leading-relaxed">
            يرجى التأكد من رقم المحفظة لأن المبالغ المالية سيتم توريدها إليه
          </p>

          <div>
            <input
              type="text"
              required
              value={jaibWalletNumber}
              onChange={(e) => setJaibWalletNumber(e.target.value)}
              placeholder="أدخل رقم محفظة جيب"
              className={`w-full px-4 py-3 rounded-xl text-sm transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                isDarkMode
                  ? 'bg-[#1c2638] text-white border border-slate-700/80 placeholder-slate-500'
                  : 'bg-slate-50 text-slate-900 border border-slate-300 placeholder-slate-400'
              }`}
            />
          </div>
        </div>

        {/* SECTION 4: فئات الكروت */}
        <div
          className={`p-5 md:p-6 rounded-2xl border transition-all ${
            isDarkMode
              ? 'bg-[#101726] border-slate-800/80 shadow-xl'
              : 'bg-white border-slate-200 shadow-sm'
          }`}
        >
          <div className="flex items-center gap-2.5 mb-5 pb-3 border-b border-slate-800/60">
            <Tag className="w-5 h-5 text-indigo-400" />
            <h2 className={`text-base md:text-lg font-bold ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
              فئات الكروت
            </h2>
          </div>

          {/* Repeatable List of Categories */}
          <div className="space-y-4">
            {cardCategories.map((cat, idx) => (
              <CardCategoryItem
                key={cat.id}
                category={cat}
                index={idx}
                onUpdate={handleUpdateCategory}
                onRemove={handleRemoveCategory}
                isDarkMode={isDarkMode}
                canRemove={cardCategories.length > 1}
              />
            ))}
          </div>

          {/* Add New Category Button */}
          <div className="mt-6 flex justify-center">
            <button
              type="button"
              onClick={handleAddCategory}
              className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-xs md:text-sm font-bold text-white bg-[#4f46e5] hover:bg-indigo-600 border border-indigo-400/30 transition-all shadow-md cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>إضافة فئة جديدة</span>
            </button>
          </div>
        </div>

        {/* SUBMIT BUTTON: إرسال الطلب / إعادة الإرسال */}
        <div className="pt-2 flex justify-center gap-3">
          {onCancelEdit && (
            <button
              type="button"
              onClick={onCancelEdit}
              className="px-6 py-3 rounded-xl text-sm font-bold text-slate-300 bg-slate-800 hover:bg-slate-700 transition-all cursor-pointer"
            >
              إلغاء التعديل
            </button>
          )}
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center justify-center gap-2.5 py-3 px-10 rounded-xl text-base font-bold text-white bg-[#5b3bf0] hover:bg-indigo-600 shadow-lg shadow-indigo-900/30 border border-indigo-400/30 transition-all cursor-pointer disabled:opacity-50"
          >
            <Send className="w-5 h-5 -scale-x-100" />
            <span>
              {isSubmitting
                ? 'جاري إرسال التعديلات...'
                : initialData
                ? 'إعادة إرسال الطلب بعد التعديل 🚀'
                : 'إرسال الطلب'}
            </span>
          </button>
        </div>

        {/* FOOTER NOTE MATCHING SCREENSHOT */}
        <div className="text-center pt-4 px-2">
          <p className="text-xs text-slate-400 leading-relaxed font-medium max-w-lg mx-auto">
            للاستفسار يرجى التواصل مع الوكيل خدمة العملاء على الرقم: 784999804 أو مع الدعم الفني على الرقم:
            <br />
            784999802
          </p>
        </div>
      </form>
    </div>
  );
};
