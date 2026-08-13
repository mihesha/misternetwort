import { useRouter } from 'next/navigation';
import React, { useState, useEffect } from 'react';
import {
  Moon,
  Sun,
  Globe,
  Settings,
  ChevronDown,
  ArrowRight,
  FileEdit,
  Plus,
  Trash2,
  Key,
  Shield,
  LogOut,
  Send,
  AlertCircle,
  FileText,
  CheckCircle2,
  X,
} from 'lucide-react';
import { NetworkDataEditRequest } from '../../../types';

interface CategoryItem {
  id: string;
  name: string;
  price: string;
  mb: string;
  hours: string;
  validityDays: string;
  cardType: string;
  enabled: boolean;
}

interface EditNetworkDataViewProps {
  isDarkMode: boolean;
  ownerName?: string;
  networkName?: string;
  networkCode?: string;
  onNavigateView?: (view: string) => void;
  globalUpdateTick?: number;
  onSubmitEditRequest?: (req: NetworkDataEditRequest) => void;
}

export const EditNetworkDataView: React.FC<EditNetworkDataViewProps> = ({
  isDarkMode,
  ownerName,
  networkName,
  networkCode,
  onNavigateView,
  globalUpdateTick = 0,
  onSubmitEditRequest,
}) => {
  const router = useRouter();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [submittedRequest, setSubmittedRequest] = useState<NetworkDataEditRequest | null>(null);

  // Form State - loaded from API, start empty
  const [netName, setNetName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [governorate, setGovernorate] = useState('');
  const [city, setCity] = useState('');
  const [district, setDistrict] = useState('');
  const [jaibWallet, setJaibWallet] = useState('');
  const [adminNotes, setAdminNotes] = useState('');
  const [categories, setCategories] = useState<CategoryItem[]>([]);

  // Load real network data from API on mount
  useEffect(() => {
    const loadNetworkData = async () => {
      try {
        const token = typeof localStorage !== 'undefined' ? localStorage.getItem('auth_token') : null;
        const res = await fetch('/api/networks', {
          headers: token ? { 'Authorization': `Bearer ${token}` } : {}
        });
        if (res.ok) {
          const networks = await res.json();
          const found = networks.find((n: any) =>
            (networkCode && n.network_code === networkCode) ||
            (networkName && n.name === networkName)
          ) || networks[0];

          if (found) {
            const mappedCats: CategoryItem[] = (found.card_categories || []).map((c: any) => ({
              id: String(c.id),
              name: c.name || String(Number(c.price)),
              price: String(Number(c.price || 0)),
              mb: String(c.mega || '0'),
              hours: String(c.hours || '0'),
              validityDays: String(c.validity_days || '0'),
              cardType: c.card_type || 'مستخدم فقط',
              enabled: c.status !== 'inactive',
            }));

            setNetName(found.name || '');
            setContactPhone(found.owner_phone || '');
            setGovernorate(found.governorate || '');
            setCity(found.city || '');
            setDistrict(found.neighborhood || '');
            setJaibWallet(found.jaib_wallet || '');
            setCategories(mappedCats);

            // Save a snapshot of original data for comparison in previousData
            setOriginalData({
              networkName: found.name || '',
              contactPhone: found.owner_phone || '',
              governorate: found.governorate || '',
              city: found.city || '',
              district: found.neighborhood || '',
              jaibWallet: found.jaib_wallet || '',
              categories: mappedCats,
            });
          }
        }
      } catch (err) {
        console.error('Failed to load network data', err);
      }
    };
    loadNetworkData();
  }, [networkCode, networkName, globalUpdateTick]);


  const handleCategoryChange = (id: string, field: keyof CategoryItem, value: any) => {
    setCategories((prev) =>
      prev.map((cat) => (cat.id === id ? { ...cat, [field]: value } : cat))
    );
  };

  const handleAddCategory = () => {
    const newCat: CategoryItem = {
      id: Date.now().toString(),
      name: '',
      price: '',
      mb: '',
      hours: '',
      validityDays: '0',
      cardType: 'مستخدم فقط',
      enabled: true,
    };
    setCategories((prev) => [...prev, newCat]);
  };

  const handleRemoveCategory = (id: string) => {
    setCategories((prev) => prev.filter((cat) => cat.id !== id));
  };

  // Store original values from API for previousData comparison
  const [originalData, setOriginalData] = useState<{
    networkName: string; contactPhone: string; governorate: string;
    city: string; district: string; jaibWallet: string;
    categories: CategoryItem[];
  } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate categories (Make all fields mandatory)
    for (let i = 0; i < categories.length; i++) {
      const cat = categories[i];
      if (!cat.price || cat.price === '0') {
        alert(`يرجى تحديد السعر للفئة رقم ${i + 1}`);
        return;
      }
      if (!cat.name.trim()) {
        alert(`يرجى كتابة اسم الفئة للكرت رقم ${i + 1}`);
        return;
      }
      if (!cat.mb || cat.mb === '0') {
        alert(`يرجى كتابة حجم الميجا للفئة رقم ${i + 1}`);
        return;
      }
      if (!cat.hours || cat.hours === '0') {
        alert(`يرجى كتابة عدد الساعات للفئة رقم ${i + 1}`);
        return;
      }
      if (!cat.validityDays || cat.validityDays === '0') {
        alert(`يرجى تحديد أيام الصلاحية للفئة رقم ${i + 1}`);
        return;
      }
    }

    const newReq: NetworkDataEditRequest = {
      id: `EDIT-${Date.now()}`,
      referenceNumber: `MOD-${Math.floor(1000 + Math.random() * 9000)}`,
      networkCode: networkCode || '',
      networkName: netName,
      ownerName: ownerName || '',
      contactPhone: contactPhone,
      governorate: governorate,
      city: city,
      district: district,
      jaibWallet: jaibWallet,
      adminNotes: adminNotes,
      categories: categories,
      previousData: originalData ? {
        networkName: originalData.networkName,
        ownerName: ownerName || '',
        contactPhone: originalData.contactPhone,
        governorate: originalData.governorate,
        city: originalData.city,
        district: originalData.district,
        jaibWallet: originalData.jaibWallet,
        categories: originalData.categories,
      } : undefined,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    try {
      const token = typeof localStorage !== 'undefined' ? localStorage.getItem('auth_token') : null;
      await fetch('/api/edit-requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify(newReq),
      });
    } catch {
      // Ignore network errors
    }

    if (onSubmitEditRequest) {
      onSubmitEditRequest(newReq);
    }

    setSubmittedRequest(newReq);
  };

  return (
    <div
      dir="rtl"
      className={` transition-colors font-['Cairo',sans-serif] ${
        isDarkMode ? 'bg-[#0a0f18] text-slate-100' : 'bg-slate-100 text-slate-800'
      }`}
    >
      {/* Main Area */}
      <main className="max-w-5xl mx-auto px-4 md:px-8 py-8 space-y-6">
        {/* Page Sub-Header */}
        <div className="flex items-center justify-between">
          

          
        </div>

        {/* Form Container */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div
            className={`rounded-2xl p-6 md:p-8 border transition-all shadow-2xl space-y-6 ${
              isDarkMode
                ? 'bg-[#121926] border-slate-800 text-slate-100'
                : 'bg-white border-slate-200 text-slate-900 shadow-xl'
            }`}
          >
            {/* Title Header */}
            <div className="space-y-1 text-center md:text-right border-b pb-4 border-slate-700/40">
              <h2 className="text-xl md:text-2xl font-extrabold flex items-center justify-center md:justify-start gap-2 text-blue-400">
                <FileEdit className="w-6 h-6" />
                <span>طلب تعديل بيانات الشبكة</span>
              </h2>
              <div className={`text-xs font-bold ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                {netName} • {networkCode}
              </div>
            </div>

            {/* Blue Notice Banner */}
            <div
              className={`rounded-xl p-4 border transition-colors text-right flex items-center gap-3 ${
                isDarkMode
                  ? 'bg-[#16233a] border-blue-900/60 text-blue-200'
                  : 'bg-blue-50 border-blue-200 text-blue-900'
              }`}
            >
              <AlertCircle className="w-5 h-5 text-blue-400 shrink-0" />
              <span className="text-xs md:text-sm font-bold">
                ملاحظة: سيتم إرسال طلبك للإدارة للموافقة قبل تطبيق أي تغييرات.
              </span>
            </div>

            {/* Section 1: Network Information */}
            <div className="space-y-4 text-right">
              <h3 className={`text-sm md:text-base font-extrabold flex items-center gap-2 border-r-4 border-blue-500 pr-2 ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>
                <span>📋</span>
                <span>معلومات الشبكة</span>
              </h3>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold mb-1.5 opacity-80">اسم الشبكة</label>
                  <input
                    type="text"
                    value={netName}
                    onChange={(e) => setNetName(e.target.value)}
                    className={`w-full rounded-xl py-2.5 px-3.5 text-xs md:text-sm text-right font-medium focus:outline-none transition-all ${
                      isDarkMode
                        ? 'bg-[#1b2536] text-white border border-slate-700 focus:border-blue-500'
                        : 'bg-slate-50 text-slate-900 border border-slate-300 focus:border-blue-600'
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold mb-1.5 opacity-80">رقم التواصل</label>
                  <input
                    type="text"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    className={`w-full rounded-xl py-2.5 px-3.5 text-xs md:text-sm text-right font-mono font-medium focus:outline-none transition-all ${
                      isDarkMode
                        ? 'bg-[#1b2536] text-white border border-slate-700 focus:border-blue-500'
                        : 'bg-slate-50 text-slate-900 border border-slate-300 focus:border-blue-600'
                    }`}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-bold mb-1.5 opacity-80">المحافظة *</label>
                    <select
                      value={governorate}
                      onChange={(e) => setGovernorate(e.target.value)}
                      className={`w-full rounded-xl py-2.5 px-3 text-xs md:text-sm text-right font-medium focus:outline-none transition-all ${
                        isDarkMode
                          ? 'bg-[#1b2536] text-white border border-slate-700 focus:border-blue-500'
                          : 'bg-slate-50 text-slate-900 border border-slate-300 focus:border-blue-600'
                      }`}
                    >
                      <option value="">اختر المحافظة</option>
                      <option value="صنعاء">أمانة العاصمة / صنعاء</option>
                      <option value="عدن">عدن</option>
                      <option value="تعز">تعز</option>
                      <option value="الحديدة">الحديدة</option>
                      <option value="إب">إب</option>
                      <option value="مأرب">مأرب</option>
                      <option value="حضرموت">حضرموت</option>
                      <option value="ذمار">ذمار</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold mb-1.5 opacity-80">المدينة *</label>
                    <input
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className={`w-full rounded-xl py-2.5 px-3.5 text-xs md:text-sm text-right font-medium focus:outline-none transition-all ${
                        isDarkMode
                          ? 'bg-[#1b2536] text-white border border-slate-700 focus:border-blue-500'
                          : 'bg-slate-50 text-slate-900 border border-slate-300 focus:border-blue-600'
                      }`}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold mb-1.5 opacity-80">المنطقة/الحي</label>
                    <input
                      type="text"
                      value={district}
                      onChange={(e) => setDistrict(e.target.value)}
                      className={`w-full rounded-xl py-2.5 px-3.5 text-xs md:text-sm text-right font-medium focus:outline-none transition-all ${
                        isDarkMode
                          ? 'bg-[#1b2536] text-white border border-slate-700 focus:border-blue-500'
                          : 'bg-slate-50 text-slate-900 border border-slate-300 focus:border-blue-600'
                      }`}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Section 2: Wallet Numbers */}
            <div className="space-y-4 text-right pt-2 border-t border-slate-700/40">
              <h3 className={`text-sm md:text-base font-extrabold flex items-center gap-2 border-r-4 border-amber-500 pr-2 ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>
                <span>💳</span>
                <span>أرقام المحافظ *</span>
              </h3>

              <div>
                <label className="block text-xs font-bold mb-1.5 opacity-80">رقم محفظة جيب *</label>
                <input
                  type="text"
                  value={jaibWallet}
                  onChange={(e) => setJaibWallet(e.target.value)}
                  className={`w-full rounded-xl py-2.5 px-3.5 text-xs md:text-sm text-right font-mono font-medium focus:outline-none transition-all ${
                    isDarkMode
                      ? 'bg-[#1b2536] text-white border border-slate-700 focus:border-blue-500'
                      : 'bg-slate-50 text-slate-900 border border-slate-300 focus:border-blue-600'
                  }`}
                />
              </div>
            </div>

            {/* Section 3: Card Categories */}
            <div className="space-y-4 text-right pt-2 border-t border-slate-700/40">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold opacity-60">{categories.length} فئات</span>
                <h3 className={`text-sm md:text-base font-extrabold flex items-center gap-2 border-r-4 border-emerald-500 pr-2 ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>
                  <span>🎴</span>
                  <span>فئات الكروت</span>
                </h3>
              </div>

              <div className="space-y-4">
                {categories.map((cat, index) => (
                  <div
                    key={cat.id}
                    className={`rounded-xl p-4 md:p-5 border transition-all space-y-3 relative ${
                      isDarkMode
                        ? 'bg-[#182234] border-slate-700/80'
                        : 'bg-slate-50 border-slate-200 shadow-sm'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs font-bold opacity-70 border-b border-slate-700/30 pb-2">
                      {categories.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveCategory(cat.id)}
                          className="text-red-400 hover:text-red-300 cursor-pointer flex items-center gap-1"
                          title="حذف الفئة"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>حذف</span>
                        </button>
                      )}
                      <span>فئة موجودة ({cat.name})</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold mb-1 opacity-70">اسم الفئة</label>
                        <input
                          type="text"
                          value={cat.name}
                          onChange={(e) => handleCategoryChange(cat.id, 'name', e.target.value)}
                          className={`w-full rounded-lg py-2 px-3 text-xs md:text-sm text-right font-bold ${
                            isDarkMode ? 'bg-[#111824] text-white border border-slate-700' : 'bg-white text-slate-900 border border-slate-300'
                          }`}
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold mb-1 opacity-70">السعر</label>
                        <input
                          type="text"
                          value={cat.price}
                          onChange={(e) => handleCategoryChange(cat.id, 'price', e.target.value)}
                          className={`w-full rounded-lg py-2 px-3 text-xs md:text-sm text-right font-mono font-bold ${
                            isDarkMode ? 'bg-[#111824] text-white border border-slate-700' : 'bg-white text-slate-900 border border-slate-300'
                          }`}
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold mb-1 opacity-70">الميجا</label>
                        <input
                          type="text"
                          value={cat.mb}
                          onChange={(e) => handleCategoryChange(cat.id, 'mb', e.target.value)}
                          className={`w-full rounded-lg py-2 px-3 text-xs md:text-sm text-right font-mono font-bold ${
                            isDarkMode ? 'bg-[#111824] text-white border border-slate-700' : 'bg-white text-slate-900 border border-slate-300'
                          }`}
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold mb-1 opacity-70">الساعات</label>
                        <input
                          type="text"
                          value={cat.hours}
                          onChange={(e) => handleCategoryChange(cat.id, 'hours', e.target.value)}
                          className={`w-full rounded-lg py-2 px-3 text-xs md:text-sm text-right font-mono font-bold ${
                            isDarkMode ? 'bg-[#111824] text-white border border-slate-700' : 'bg-white text-slate-900 border border-slate-300'
                          }`}
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold mb-1 opacity-70">أيام الصلاحية</label>
                        <input
                          type="text"
                          value={cat.validityDays}
                          onChange={(e) => handleCategoryChange(cat.id, 'validityDays', e.target.value)}
                          className={`w-full rounded-lg py-2 px-3 text-xs md:text-sm text-right font-mono font-bold ${
                            isDarkMode ? 'bg-[#111824] text-white border border-slate-700' : 'bg-white text-slate-900 border border-slate-300'
                          }`}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-3 items-center pt-1">
                      <div>
                        <label className="block text-[11px] font-bold mb-1 opacity-70">نوع البطاقة</label>
                        <select
                          value={cat.cardType}
                          onChange={(e) => handleCategoryChange(cat.id, 'cardType', e.target.value)}
                          className={`w-full rounded-lg py-2 px-3 text-xs md:text-sm text-right font-bold ${
                            isDarkMode ? 'bg-[#111824] text-white border border-slate-700' : 'bg-white text-slate-900 border border-slate-300'
                          }`}
                        >
                          <option value="مستخدم فقط">مستخدم فقط</option>
                          <option value="مستخدم + كلمة مرور">مستخدم + كلمة مرور</option>
                        </select>
                      </div>

                      <div className="flex items-center gap-2 pt-5">
                        <input
                          type="checkbox"
                          id={`enabled-${cat.id}`}
                          checked={cat.enabled}
                          onChange={(e) => handleCategoryChange(cat.id, 'enabled', e.target.checked)}
                          className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                        />
                        <label htmlFor={`enabled-${cat.id}`} className="text-xs font-bold cursor-pointer opacity-90">
                          مفعلة
                        </label>
                      </div>
                    </div>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={handleAddCategory}
                  className="w-full py-3 rounded-xl border border-dashed border-slate-600 hover:border-blue-500 text-blue-400 font-bold text-xs md:text-sm transition-all flex items-center justify-center gap-2 cursor-pointer bg-blue-500/5 hover:bg-blue-500/10"
                >
                  <Plus className="w-4 h-4" />
                  <span>إضافة فئة جديدة</span>
                </button>
              </div>
            </div>

            {/* Section 4: Notes for Admin */}
            <div className="space-y-4 text-right pt-2 border-t border-slate-700/40">
              <h3 className={`text-sm md:text-base font-extrabold flex items-center gap-2 border-r-4 border-indigo-500 pr-2 ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>
                <span>💬</span>
                <span>ملاحظات للإدارة</span>
              </h3>

              <div>
                <textarea
                  rows={4}
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="أضف أي ملاحظات تريد إيصالها للإدارة"
                  className={`w-full rounded-xl p-3.5 text-xs md:text-sm text-right font-medium focus:outline-none transition-all ${
                    isDarkMode
                      ? 'bg-[#1b2536] text-white border border-slate-700 focus:border-blue-500'
                      : 'bg-slate-50 text-slate-900 border border-slate-300 focus:border-blue-600'
                  }`}
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-center gap-3 pt-6 border-t border-slate-700/40">
              <button
                type="submit"
                className="px-8 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs md:text-sm transition-all shadow-lg shadow-blue-900/40 cursor-pointer flex items-center gap-2"
              >
                <Send className="w-4 h-4" />
                <span>إرسال الطلب</span>
              </button>

              <button
                type="button"
                onClick={() => router.push('/owner/details')}
                className={`px-8 py-3 rounded-xl font-extrabold text-xs md:text-sm transition-all cursor-pointer ${
                  isDarkMode
                    ? 'bg-[#1f2a3e] hover:bg-[#283650] text-slate-300 border border-slate-700/60'
                    : 'bg-slate-200 hover:bg-slate-300 text-slate-700'
                }`}
              >
                إلغاء
              </button>
            </div>
          </div>
        </form>

        {/* SUBMITTED CONFIRMATION MODAL */}
        {submittedRequest && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
            <div className="bg-[#121927] border border-blue-500/40 rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl text-center">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-10 h-10 animate-bounce" />
              </div>
              <div>
                <h3 className="font-black text-white text-lg">تم إرسال طلب التعديل بنجاح! 🚀</h3>
                <p className="text-xs text-slate-400 mt-1">مرجع الطلب: <span className="font-mono text-blue-400 font-bold">{submittedRequest.referenceNumber}</span></p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 text-xs text-slate-300 text-right space-y-2">
                <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                  <span className="text-slate-400">الشبكة:</span>
                  <span className="font-bold text-white">{submittedRequest.networkName}</span>
                </div>
                <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                  <span className="text-slate-400">حالة الطلب:</span>
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">قيد المراجعة بواسطة الإدارة</span>
                </div>
                <p className="text-[11px] text-slate-400 pt-1">
                  سيقوم فريق الإدارة العامة بمراجعة التعديلات وتطبيقها على حساب شبكتك فور الاعتماد.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setSubmittedRequest(null);
                  router.push('/owner/details');
                }}
                className="w-full py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-black text-xs shadow-lg shadow-blue-900/40 cursor-pointer transition-all hover:scale-[1.01]"
              >
                العودة للوحة تحكم الشبكة
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
