import React, { useState } from 'react';
import {
  Moon,
  Sun,
  Globe,
  Settings,
  ChevronDown,
  ArrowRight,
  Bell,
  Clock,
  Sliders,
  AlertTriangle,
  CheckCircle2,
  Save,
  RefreshCw,
  Router,
  Smartphone,
  MessageSquare,
  Send,
  Loader2,
  Check,
  Shield,
  Key,
  LogOut,
  Sparkles,
  Zap,
  Activity,
  Layers,
  Tag,
  Wallet,
  Building2,
  SmartphoneNfc,
  CheckSquare,
  Square,
  SlidersHorizontal,
} from 'lucide-react';

interface NetworkSettingsViewProps {
  isDarkMode: boolean;
  ownerName?: string;
  networkName?: string;
  networkCode?: string;
  networkPhone?: string;
  onNavigateView?: (view: string) => void;
  onOpenMikrotikWizard?: () => void;
  globalUpdateTick?: number;
}

interface CategorySetting {
  id: string;
  category: string;
  price: number;
  available: number;
  minThreshold: number;
  mikrotikProfile: string;
  prefix: string;
  suffix: string;
}

export const NetworkSettingsView: React.FC<NetworkSettingsViewProps> = ({
  isDarkMode,
  ownerName = 'هشام محمد الجايفي',
  networkName = 'برق نت',
  networkCode = '22744',
  networkPhone = '777310606',
  onNavigateView,
  onOpenMikrotikWizard,
  globalUpdateTick = 0,
}) => {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Notification settings state
  const [notifOutOfStock, setNotifOutOfStock] = useState(true);
  const [notifLowStock, setNotifLowStock] = useState(true);
  const [notifNewStock, setNotifNewStock] = useState(false);
  const [channelSMS, setChannelSMS] = useState(true);
  const [channelWhatsapp, setChannelWhatsapp] = useState(false);
  const [channelTelegram, setChannelTelegram] = useState(false);
  const [isSavingNotifs, setIsSavingNotifs] = useState(false);

  // Auto Withdrawal settings state
  const [autoWithdrawEnabled, setAutoWithdrawEnabled] = useState(true);
  const [withdrawFrequency, setWithdrawFrequency] = useState('يومي');
  const [withdrawTime, setWithdrawTime] = useState('01:00');
  const [isSavingWithdraw, setIsSavingWithdraw] = useState(false);

  // Category threshold & router state
  const [fetchingRouterCategory, setFetchingRouterCategory] = useState<string | null>(null);
  const [savingCategory, setSavingCategory] = useState<string | null>(null);
  const [categories, setCategories] = useState<CategorySetting[]>([]);

  React.useEffect(() => {
    const fetchNetworkData = async () => {
      try {
        const token = typeof localStorage !== 'undefined' ? localStorage.getItem('auth_token') : null;
        const res = await fetch('/api/networks', {
          headers: token ? { 'Authorization': `Bearer ${token}` } : {}
        });
        if (res.ok) {
          const data = await res.json();
          const found = data.find((n: any) => n.network_code === networkCode || n.name === networkName);
          if (found && found.card_categories) {
            const mappedCategories = found.card_categories.map((c: any) => ({
              id: c.id?.toString() || `cat-${c.price}`,
              category: c.name || c.price?.toString(),
              price: c.price || 0,
              available: c.stock || 0,
              minThreshold: 100,
              mikrotikProfile: '',
              prefix: '',
              suffix: '',
            }));
            setCategories(mappedCategories);
          }
        }
      } catch (err) {
        console.error('Failed to fetch network data', err);
      }
    };
    if (networkCode || networkName) {
      fetchNetworkData();
    }
  }, [networkCode, networkName, globalUpdateTick]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  const handleSaveNotifications = () => {
    setIsSavingNotifs(true);
    setTimeout(() => {
      setIsSavingNotifs(false);
      showToast('تم حفظ إعدادات الإشعارات وقنوات التنبيه بنجاح! ✓');
    }, 600);
  };

  const handleSaveAutoWithdraw = () => {
    setIsSavingWithdraw(true);
    setTimeout(() => {
      setIsSavingWithdraw(false);
      showToast('تم حفظ إعدادات السحب التلقائي بنجاح! ✓');
    }, 600);
  };

  const handleFetchFromRouter = (id: string, categoryName: string) => {
    setFetchingRouterCategory(id);
    setTimeout(() => {
      setFetchingRouterCategory(null);
      setCategories((prev) =>
        prev.map((c) =>
          c.id === id ? { ...c, mikrotikProfile: `profile_${categoryName}` } : c
        )
      );
      showToast(`تم جلب البروفايل (profile_${categoryName}) للفئة ${categoryName} من راوتر MikroTik بنجاح!`);
    }, 1000);
  };

  const handleSaveCategorySettings = (id: string, categoryName: string) => {
    setSavingCategory(id);
    setTimeout(() => {
      setSavingCategory(null);
      showToast(`تم حفظ التعديلات والبادئة/اللاحقة للفئة ${categoryName} بنجاح! ✓`);
    }, 500);
  };

  const handleCategoryInputChange = (
    id: string,
    field: keyof CategorySetting,
    value: any
  ) => {
    setCategories((prev) =>
      prev.map((c) => (c.id === id ? { ...c, [field]: value } : c))
    );
  };

  return (
    <div
      dir="rtl"
      className={` transition-colors font-['Cairo',sans-serif] ${
        isDarkMode ? 'bg-[#0a0f18] text-slate-100' : 'bg-slate-100 text-slate-800'
      }`}
    >
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-emerald-600 text-white font-extrabold text-xs md:text-sm px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-2 border border-emerald-400 animate-bounce">
          <CheckCircle2 className="w-5 h-5 text-white" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Navbar */}
      

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 md:px-8 py-6 space-y-6">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1 text-right">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white flex items-center justify-center shadow-lg shadow-blue-600/30">
                <Settings className="w-5 h-5 animate-spin-slow" />
              </div>
              <div>
                <h1 className={`text-xl md:text-2xl font-black tracking-wide ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                  إعدادات الشبكة والتنبيهات
                </h1>
                <p className={`text-xs font-bold ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                  إدارة إعدادات الشبكة الإشعارات، السحب التلقائي، وحدود المخزون لراوتر MikroTik
                </p>
              </div>
            </div>
          </div>

          
        </div>

        {/* 1. Network Information Top Header Grid Card */}
        <div
          className={`rounded-2xl p-5 md:p-6 border transition-all relative overflow-hidden shadow-xl ${
            isDarkMode
              ? 'bg-[#121a28] border-slate-800/90 text-slate-100 shadow-black/50'
              : 'bg-white border-slate-200/90 text-slate-800 shadow-slate-300/30'
          }`}
        >
          <div className="flex items-center justify-between border-b pb-4 mb-4 border-slate-700/30">
            <div className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-blue-500" />
              <h2 className="text-base md:text-lg font-black">معلومات الشبكة الرسمية</h2>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-black bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>حالة الشبكة: نشطة</span>
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
            <div className={`p-3.5 rounded-xl border ${isDarkMode ? 'bg-[#182234] border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
              <span className="text-[11px] font-bold text-slate-400 block mb-1">اسم الشبكة</span>
              <span className="text-sm font-black text-blue-400">{networkName}</span>
            </div>

            <div className={`p-3.5 rounded-xl border ${isDarkMode ? 'bg-[#182234] border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
              <span className="text-[11px] font-bold text-slate-400 block mb-1">كود الشبكة</span>
              <span className="text-sm font-black font-mono">{networkCode}</span>
            </div>

            <div className={`p-3.5 rounded-xl border ${isDarkMode ? 'bg-[#182234] border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
              <span className="text-[11px] font-bold text-slate-400 block mb-1">رقم التواصل</span>
              <span className="text-sm font-black font-mono dir-ltr inline-block">{networkPhone}</span>
            </div>

            <div className={`p-3.5 rounded-xl border ${isDarkMode ? 'bg-[#182234] border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
              <span className="text-[11px] font-bold text-slate-400 block mb-1">رقم محفظة جيب</span>
              <span className="text-sm font-black font-mono text-amber-400 dir-ltr inline-block">777310606</span>
            </div>
          </div>
        </div>

        {/* 2. Notification Settings Section */}
        <div
          className={`rounded-2xl p-6 md:p-7 border transition-all shadow-xl space-y-6 ${
            isDarkMode
              ? 'bg-[#121926] border-slate-800/90 text-slate-100'
              : 'bg-white border-slate-200/90 text-slate-900 shadow-slate-200/50'
          }`}
        >
          <div className="flex items-center justify-between border-b pb-4 border-slate-700/30">
            <div className="space-y-1 text-right">
              <h2 className="text-lg md:text-xl font-black flex items-center gap-2.5 text-amber-500">
                <Bell className="w-5 h-5 shrink-0" />
                <span>إعدادات الإشعارات والتنبيهات</span>
              </h2>
              <p className={`text-xs font-semibold ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                حدد أنواع الإشعارات والقنوات التي تريد استقبالها لهذه الشبكة
              </p>
            </div>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Zap className="w-5 h-5" />
            </div>
          </div>

          <div className="space-y-6 text-right">
            {/* Notification Types */}
            <div>
              <h3 className="text-xs md:text-sm font-extrabold mb-3 text-slate-300 flex items-center gap-2">
                <Layers className="w-4 h-4 text-blue-400" />
                <span>أنواع الإشعارات</span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Out of stock */}
                <div
                  onClick={() => setNotifOutOfStock(!notifOutOfStock)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer flex items-start gap-3 ${
                    notifOutOfStock
                      ? isDarkMode
                        ? 'bg-blue-950/40 border-blue-600/70 text-blue-200 shadow-md'
                        : 'bg-blue-50 border-blue-300 text-blue-950 shadow-sm'
                      : isDarkMode
                      ? 'bg-[#182234] border-slate-800 text-slate-400'
                      : 'bg-slate-50 border-slate-200 text-slate-600'
                  }`}
                >
                  <div className={`mt-0.5 ${notifOutOfStock ? 'text-blue-500' : 'text-slate-500'}`}>
                    {notifOutOfStock ? <CheckSquare className="w-5 h-5" /> : <Square className="w-5 h-5" />}
                  </div>
                  <div>
                    <div className="font-extrabold text-xs md:text-sm">نفاذ المخزون</div>
                    <div className="text-[11px] opacity-80 mt-0.5">عند نفاذ كروت فئة بالكامل من المتاح</div>
                  </div>
                </div>

                {/* Low stock */}
                <div
                  onClick={() => setNotifLowStock(!notifLowStock)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer flex items-start gap-3 ${
                    notifLowStock
                      ? isDarkMode
                        ? 'bg-blue-950/40 border-blue-600/70 text-blue-200 shadow-md'
                        : 'bg-blue-50 border-blue-300 text-blue-950 shadow-sm'
                      : isDarkMode
                      ? 'bg-[#182234] border-slate-800 text-slate-400'
                      : 'bg-slate-50 border-slate-200 text-slate-600'
                  }`}
                >
                  <div className={`mt-0.5 ${notifLowStock ? 'text-blue-500' : 'text-slate-500'}`}>
                    {notifLowStock ? <CheckSquare className="w-5 h-5" /> : <Square className="w-5 h-5" />}
                  </div>
                  <div>
                    <div className="font-extrabold text-xs md:text-sm">نقص المخزون</div>
                    <div className="text-[11px] opacity-80 mt-0.5">عند وصول مخزون فئة إلى الحد الأدنى</div>
                  </div>
                </div>

                {/* New stock */}
                <div
                  className={`p-4 rounded-xl border transition-all opacity-80 relative flex items-start gap-3 ${
                    isDarkMode ? 'bg-[#182234] border-slate-800 text-slate-400' : 'bg-slate-50 border-slate-200 text-slate-600'
                  }`}
                >
                  <div className="mt-0.5 text-slate-500">
                    <Square className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-xs md:text-sm">مخزون جديد</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-500/20 text-red-400 border border-red-500/30">
                        موقوف من الإدارة
                      </span>
                    </div>
                    <div className="text-[11px] opacity-80 mt-0.5">عند إضافة كروت جديدة للشبكة</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Notification Channels */}
            <div>
              <h3 className="text-xs md:text-sm font-extrabold mb-3 text-slate-300 flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-emerald-400" />
                <span>قنوات الإشعارات</span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* SMS */}
                <div
                  onClick={() => setChannelSMS(!channelSMS)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                    channelSMS
                      ? isDarkMode
                        ? 'bg-emerald-950/40 border-emerald-600/70 text-emerald-200 shadow-md'
                        : 'bg-emerald-50 border-emerald-300 text-emerald-950 shadow-sm'
                      : isDarkMode
                      ? 'bg-[#182234] border-slate-800 text-slate-400'
                      : 'bg-slate-50 border-slate-200 text-slate-600'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Smartphone className="w-4 h-4 text-emerald-400" />
                    <span className="font-extrabold text-xs md:text-sm">رسائل نصية SMS</span>
                  </div>
                  {channelSMS ? <CheckSquare className="w-5 h-5 text-emerald-500" /> : <Square className="w-5 h-5 text-slate-500" />}
                </div>

                {/* Whatsapp */}
                <div
                  className={`p-4 rounded-xl border transition-all opacity-80 flex items-center justify-between ${
                    isDarkMode ? 'bg-[#182234] border-slate-800 text-slate-400' : 'bg-slate-50 border-slate-200 text-slate-600'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <MessageSquare className="w-4 h-4 text-slate-500" />
                    <span className="font-extrabold text-xs md:text-sm">واتساب</span>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-500/20 text-red-400 border border-red-500/30">
                    موقوف من الإدارة
                  </span>
                </div>

                {/* Telegram */}
                <div
                  className={`p-4 rounded-xl border transition-all opacity-80 flex items-center justify-between ${
                    isDarkMode ? 'bg-[#182234] border-slate-800 text-slate-400' : 'bg-slate-50 border-slate-200 text-slate-600'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Send className="w-4 h-4 text-slate-500" />
                    <span className="font-extrabold text-xs md:text-sm">تلجرام</span>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-500/20 text-red-400 border border-red-500/30">
                    موقوف من الإدارة
                  </span>
                </div>
              </div>
            </div>

            {/* Save Notifications Button */}
            <div className="pt-2">
              <button
                onClick={handleSaveNotifications}
                disabled={isSavingNotifs}
                className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs md:text-sm transition-all shadow-md shadow-blue-900/30 cursor-pointer flex items-center gap-2 disabled:opacity-70"
              >
                {isSavingNotifs ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                <span>{isSavingNotifs ? 'جاري الحفظ...' : 'حفظ إعدادات الإشعارات'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* 3. Auto Withdrawal Settings Section */}
        <div
          className={`rounded-2xl p-6 md:p-7 border transition-all shadow-xl space-y-6 ${
            isDarkMode
              ? 'bg-[#121926] border-slate-800/90 text-slate-100'
              : 'bg-white border-slate-200/90 text-slate-900 shadow-slate-200/50'
          }`}
        >
          <div className="flex items-center justify-between border-b pb-4 border-slate-700/30">
            <div className="space-y-1 text-right">
              <h2 className="text-lg md:text-xl font-black flex items-center gap-2.5 text-blue-400">
                <Clock className="w-5 h-5 shrink-0" />
                <span>السحب التلقائي لرصيد الشبكة</span>
              </h2>
              <p className={`text-xs font-semibold ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                إنشاء طلب سحب تلقائي عند الوقت المحدد وتحويل الأرباح لمحفظة جيب
              </p>
            </div>

            {/* Toggle Switch */}
            <button
              onClick={() => setAutoWithdrawEnabled(!autoWithdrawEnabled)}
              className={`w-14 h-8 rounded-full p-1 transition-colors cursor-pointer relative ${
                autoWithdrawEnabled ? 'bg-blue-600' : 'bg-slate-700'
              }`}
            >
              <div
                className={`w-6 h-6 rounded-full bg-white shadow-md transition-transform transform ${
                  autoWithdrawEnabled ? 'translate-x-0' : '-translate-x-6'
                }`}
              />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-right">
            <div>
              <label className="block text-xs font-bold mb-2 text-slate-300">تكرار السحب التلقائي</label>
              <select
                value={withdrawFrequency}
                onChange={(e) => setWithdrawFrequency(e.target.value)}
                className={`w-full rounded-xl py-2.5 px-4 text-xs md:text-sm text-right font-bold focus:outline-none transition-all ${
                  isDarkMode
                    ? 'bg-[#1b2536] text-white border border-slate-700/80 focus:border-blue-500'
                    : 'bg-slate-50 text-slate-900 border border-slate-300'
                }`}
              >
                <option value="يومي">يومي (Daily)</option>
                <option value="أسبوعي">أسبوعي (Weekly)</option>
                <option value="شهري">شهري (Monthly)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold mb-2 text-slate-300">وقت التشغيل (التوقيت المحلي)</label>
              <div
                className={`w-full rounded-xl py-2.5 px-4 text-xs md:text-sm text-right font-mono font-bold flex items-center justify-between border ${
                  isDarkMode ? 'bg-[#1b2536] text-blue-300 border-slate-700/80' : 'bg-slate-50 text-blue-900 border-slate-300'
                }`}
              >
                <span className="text-[11px] text-slate-400">(Asia/Aden)</span>
                <span>{withdrawTime}</span>
              </div>
            </div>
          </div>

          <div className="pt-2">
            <button
              onClick={handleSaveAutoWithdraw}
              disabled={isSavingWithdraw}
              className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs md:text-sm transition-all shadow-md shadow-blue-900/30 cursor-pointer flex items-center gap-2 disabled:opacity-70"
            >
              {isSavingWithdraw ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              <span>{isSavingWithdraw ? 'جاري الحفظ...' : 'حفظ إعدادات السحب'}</span>
            </button>
          </div>
        </div>

        {/* 4. Low Stock Threshold & Category Router Settings Table */}
        <div
          className={`rounded-2xl p-6 md:p-7 border transition-all shadow-xl space-y-5 ${
            isDarkMode
              ? 'bg-[#121926] border-slate-800/90 text-slate-100'
              : 'bg-white border-slate-200/90 text-slate-900 shadow-slate-200/50'
          }`}
        >
          <div className="flex items-center justify-between border-b pb-4 border-slate-700/30">
            <div className="space-y-1 text-right">
              <h2 className="text-lg md:text-xl font-black flex items-center gap-2.5 text-emerald-400">
                <Bell className="w-5 h-5 shrink-0 text-emerald-500" />
                <span>حد المخزون المنخفض للفئات</span>
              </h2>
              <p className={`text-xs font-semibold ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                عند انخفاض مخزون الفئة عن الحد المحدد، ستظهر رسالة تنبيه في لوحة التحكم وتنبيه الآلي
              </p>
            </div>
          </div>

          {/* Interactive Category Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-right border-collapse">
              <thead>
                <tr className={`border-b text-slate-400 font-bold ${isDarkMode ? 'border-slate-800' : 'border-slate-200'}`}>
                  <th className="py-3 px-3">الفئة</th>
                  <th className="py-3 px-3">السعر</th>
                  <th className="py-3 px-3 text-center">الكروت المتاحة</th>
                  <th className="py-3 px-3 text-center">الحد الأدنى للتنبيه</th>
                  <th className="py-3 px-3">بروفايل MikroTik</th>
                  <th className="py-3 px-3 text-center">بادئة/لاحقة الاسم</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/40">
                {categories.map((item) => (
                  <tr key={item.id} className={isDarkMode ? 'hover:bg-slate-800/30' : 'hover:bg-slate-50'}>
                    {/* Category */}
                    <td className="py-4 px-3 font-black text-sm font-mono text-blue-400">
                      {item.category}
                    </td>

                    {/* Price */}
                    <td className="py-4 px-3 font-bold whitespace-nowrap">
                      {item.price.toLocaleString('en-US')} ريال
                    </td>

                    {/* Available Cards */}
                    <td className="py-4 px-3 text-center font-mono font-bold text-red-400">
                      {item.available}
                    </td>

                    {/* Minimum Alert Threshold */}
                    <td className="py-4 px-3 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <input
                          type="number"
                          value={item.minThreshold}
                          onChange={(e) =>
                            handleCategoryInputChange(item.id, 'minThreshold', parseInt(e.target.value) || 0)
                          }
                          className={`w-20 rounded-lg py-1.5 px-2 text-center font-mono font-bold text-xs focus:outline-none border ${
                            isDarkMode
                              ? 'bg-[#1a2436] text-white border-slate-700'
                              : 'bg-slate-100 text-slate-900 border-slate-300'
                          }`}
                        />
                        <button
                          onClick={() => handleSaveCategorySettings(item.id, item.category)}
                          disabled={savingCategory === item.id}
                          className="px-2.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-[11px] transition-all cursor-pointer"
                        >
                          {savingCategory === item.id ? <Loader2 className="w-3 h-3 animate-spin" /> : 'حفظ'}
                        </button>
                      </div>
                    </td>

                    {/* MikroTik Profile */}
                    <td className="py-4 px-3">
                      <div className="flex items-center gap-2">
                        {item.mikrotikProfile ? (
                          <span className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-mono text-[11px] font-bold">
                            {item.mikrotikProfile}
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/30 text-[11px] font-bold flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3" />
                            <span>لم يتم إعداد...</span>
                          </span>
                        )}

                        <button
                          onClick={() => handleFetchFromRouter(item.id, item.category)}
                          disabled={fetchingRouterCategory === item.id}
                          className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-[11px] transition-all cursor-pointer border border-slate-700 flex items-center gap-1 whitespace-nowrap"
                        >
                          <RefreshCw className={`w-3 h-3 text-cyan-400 ${fetchingRouterCategory === item.id ? 'animate-spin' : ''}`} />
                          <span>جلب من الراوتر</span>
                        </button>
                      </div>
                    </td>

                    {/* Prefix/Suffix */}
                    <td className="py-4 px-3 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <input
                          type="text"
                          placeholder="بادئة"
                          value={item.prefix}
                          onChange={(e) => handleCategoryInputChange(item.id, 'prefix', e.target.value)}
                          className={`w-16 rounded-lg py-1.5 px-2 text-center text-xs font-mono focus:outline-none border ${
                            isDarkMode ? 'bg-[#1a2436] text-white border-slate-700' : 'bg-slate-100 text-slate-900 border-slate-300'
                          }`}
                        />
                        <input
                          type="text"
                          placeholder="لاحقة"
                          value={item.suffix}
                          onChange={(e) => handleCategoryInputChange(item.id, 'suffix', e.target.value)}
                          className={`w-16 rounded-lg py-1.5 px-2 text-center text-xs font-mono focus:outline-none border ${
                            isDarkMode ? 'bg-[#1a2436] text-white border-slate-700' : 'bg-slate-100 text-slate-900 border-slate-300'
                          }`}
                        />
                        <button
                          onClick={() => handleSaveCategorySettings(item.id, item.category)}
                          disabled={savingCategory === item.id}
                          className="px-2.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-[11px] transition-all cursor-pointer"
                        >
                          حفظ
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 5. MikroTik Setup Warning & Setup Wizard Launcher Banner */}
        <div
          className={`rounded-2xl p-6 border transition-all relative overflow-hidden shadow-2xl ${
            isDarkMode
              ? 'bg-gradient-to-r from-[#2e1400] to-[#3a1900] border-amber-600/70 text-amber-200'
              : 'bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-amber-600/20'
          }`}
        >
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="p-3 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 shrink-0">
                <AlertTriangle className="w-7 h-7 text-amber-400" />
              </div>
              <div className="space-y-1 text-right">
                <h3 className="font-black text-base md:text-lg text-amber-300">
                  لم يتم إعداد راوتر MikroTik لهذه الشبكة
                </h3>
                <p className="text-xs md:text-sm opacity-90 leading-relaxed">
                  لإعدادات الطباعة التلقائية للكروت ومزامنة الحزم تلقائياً، يجب إعداد راوتر MikroTik أولاً.
                </p>
              </div>
            </div>

            <button
              onClick={onOpenMikrotikWizard}
              className="px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs md:text-sm transition-all shadow-lg shadow-amber-950/40 flex items-center gap-2 cursor-pointer shrink-0"
            >
              <Router className="w-4 h-4 text-slate-950" />
              <span>إعدادات MikroTik</span>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};
