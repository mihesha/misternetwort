import { useRouter } from 'next/navigation';
import React, { useState } from 'react';
import {
  Moon,
  Sun,
  Globe,
  Settings,
  ChevronDown,
  ArrowRight,
  Check,
  Sliders,
  Key,
  Shield,
  LogOut,
  Wifi,
  Server,
  Layers,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Cpu,
} from 'lucide-react';

interface MikrotikSetupWizardViewProps {
  isDarkMode: boolean;
  ownerName?: string;
  networkName?: string;
  onNavigateView?: (view: string) => void;
}

export const MikrotikSetupWizardView: React.FC<MikrotikSetupWizardViewProps> = ({
  isDarkMode,
  ownerName = 'هشام محمد الجايفي',
  networkName = 'برق نت',
  onNavigateView,
}) => {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testSuccess, setTestSuccess] = useState(false);

  // Step 1 State: Basic Info
  const [cardAddType, setCardAddType] = useState('كروت يوزر منجر');
  const [cardDataType, setCardDataType] = useState('اسم مستخدم وكلمة سر فارغة');
  const [usernameLength, setUsernameLength] = useState('12');
  const [usernameComponents, setUsernameComponents] = useState('أرقام فقط');

  // Step 2 State: Cloud Router Connection
  const [cloudUrl, setCloudUrl] = useState('');
  const [apiPort, setApiPort] = useState('8728');
  const [routerUser, setRouterUser] = useState('');
  const [routerPass, setRouterPass] = useState('');

  // Step 3 State: Additional Settings
  const [dnsName, setDnsName] = useState('net.local');
  const [serverProfile, setServerProfile] = useState('hsprof1');
  const [autoSync, setAutoSync] = useState(true);

  // Step 4 State: Profiles Binding
  const [profile100, setProfile100] = useState('100_MB_Profile');
  const [profile200, setProfile200] = useState('200_MB_Profile');
  const [profile500, setProfile500] = useState('500_MB_Profile');
  const [profile1000, setProfile1000] = useState('1000_MB_Profile');

  const steps = [
    { id: 1, title: 'معلومات أساسية' },
    { id: 2, title: 'ربط الراوتر' },
    { id: 3, title: 'إعدادات إضافية' },
    { id: 4, title: 'ربط البروفايلات' },
  ];

  const handleTestConnection = () => {
    setIsTesting(true);
    setTestSuccess(false);
    setTimeout(() => {
      setIsTesting(false);
      setTestSuccess(true);
    }, 1200);
  };

  const handleFinish = () => {
    alert('تم حفظ إعدادات المايكروتك وربط الراوتر بنجاح!');
    router.push('/owner/details');
  };

  return (
    <div
      dir="rtl"
      className={` transition-colors font-['Cairo',sans-serif] ${
        isDarkMode ? 'bg-[#0a0f18] text-slate-100' : 'bg-slate-100 text-slate-800'
      }`}
    >
      {/* Main Area */}
      <main className="max-w-4xl mx-auto px-4 md:px-8 py-8 space-y-6">
        {/* Header Title */}
        <div className="flex items-center justify-between">
          

          
        </div>

        {/* Wizard Main Title */}
        <div className="text-center space-y-1">
          <h2 className="text-2xl md:text-3xl font-black tracking-wide">إعدادات المايكروتك</h2>
          <p className={`text-xs md:text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
            معالج إعداد MikroTik الأولي
          </p>
        </div>

        {/* Stepper Header Bar */}
        <div className="relative py-4 px-2 max-w-2xl mx-auto">
          <div className="flex items-center justify-between relative z-10">
            {steps.map((step, idx) => {
              const isCompleted = currentStep > step.id;
              const isActive = currentStep === step.id;

              return (
                <div key={step.id} className="flex flex-col items-center gap-1.5 flex-1">
                  <button
                    onClick={() => {
                      if (step.id < currentStep) setCurrentStep(step.id);
                    }}
                    className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs md:text-sm transition-all cursor-pointer ${
                      isCompleted
                        ? 'bg-emerald-500 text-white shadow-md shadow-emerald-900/30'
                        : isActive
                        ? 'bg-purple-600 text-white ring-4 ring-purple-600/30 shadow-lg'
                        : isDarkMode
                        ? 'bg-[#1f2a3c] text-slate-400 border border-slate-700'
                        : 'bg-slate-200 text-slate-500'
                    }`}
                  >
                    {isCompleted ? <Check className="w-4 h-4 stroke-[3]" /> : step.id}
                  </button>
                  <span
                    className={`text-[10px] md:text-xs font-bold transition-colors ${
                      isActive
                        ? 'text-purple-400'
                        : isCompleted
                        ? 'text-emerald-400'
                        : isDarkMode
                        ? 'text-slate-500'
                        : 'text-slate-400'
                    }`}
                  >
                    {step.title}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Stepper Connector Lines */}
          <div className="absolute top-8 left-12 right-12 h-0.5 bg-slate-700/50 -z-0">
            <div
              className="h-full bg-purple-600 transition-all duration-300"
              style={{ width: `${((currentStep - 1) / 3) * 100}%` }}
            />
          </div>
        </div>

        {/* Wizard Content Card */}
        <div
          className={`rounded-2xl p-6 md:p-8 border transition-all shadow-2xl relative ${
            isDarkMode
              ? 'bg-[#121926] border-slate-800 text-slate-100'
              : 'bg-white border-slate-200 text-slate-900 shadow-xl'
          }`}
        >
          {/* STEP 1: Basic Info */}
          {currentStep === 1 && (
            <div className="space-y-6 text-right">
              <h3 className="text-base md:text-lg font-extrabold flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-purple-600 text-white text-xs flex items-center justify-center font-bold">
                  1
                </span>
                <span>معلومات أساسية</span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-extrabold mb-2">نوع إضافة الكروت</label>
                  <select
                    value={cardAddType}
                    onChange={(e) => setCardAddType(e.target.value)}
                    className={`w-full rounded-xl py-3 px-3.5 text-xs md:text-sm text-right font-medium focus:outline-none transition-all ${
                      isDarkMode
                        ? 'bg-[#1b2536] text-slate-100 border border-slate-700 focus:border-purple-500'
                        : 'bg-slate-50 text-slate-900 border border-slate-300'
                    }`}
                  >
                    <option value="كروت يوزر منجر">كروت يوزر منجر</option>
                    <option value="كروت هوتسبوت العادية">كروت هوتسبوت العادية</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-extrabold mb-2">نوع بيانات الكرت</label>
                  <select
                    value={cardDataType}
                    onChange={(e) => setCardDataType(e.target.value)}
                    className={`w-full rounded-xl py-3 px-3.5 text-xs md:text-sm text-right font-medium focus:outline-none transition-all ${
                      isDarkMode
                        ? 'bg-[#1b2536] text-slate-100 border border-slate-700 focus:border-purple-500'
                        : 'bg-slate-50 text-slate-900 border border-slate-300'
                    }`}
                  >
                    <option value="اسم مستخدم وكلمة سر فارغة">اسم مستخدم وكلمة سر فارغة</option>
                    <option value="اسم مستخدم وكلمة سر متطابقان">اسم مستخدم وكلمة سر متطابقان</option>
                    <option value="اسم مستخدم وكلمة سر مختلفة">اسم مستخدم وكلمة سر مختلفة</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-extrabold mb-2">طول اسم المستخدم (6 - 16)</label>
                  <input
                    type="number"
                    min={6}
                    max={16}
                    value={usernameLength}
                    onChange={(e) => setUsernameLength(e.target.value)}
                    className={`w-full rounded-xl py-2.5 px-3.5 text-xs md:text-sm text-right font-mono font-bold focus:outline-none transition-all ${
                      isDarkMode
                        ? 'bg-[#1b2536] text-slate-100 border border-slate-700 focus:border-purple-500'
                        : 'bg-slate-50 text-slate-900 border border-slate-300'
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-xs font-extrabold mb-2">مكونات اسم المستخدم</label>
                  <select
                    value={usernameComponents}
                    onChange={(e) => setUsernameComponents(e.target.value)}
                    className={`w-full rounded-xl py-3 px-3.5 text-xs md:text-sm text-right font-medium focus:outline-none transition-all ${
                      isDarkMode
                        ? 'bg-[#1b2536] text-slate-100 border border-slate-700 focus:border-purple-500'
                        : 'bg-slate-50 text-slate-900 border border-slate-300'
                    }`}
                  >
                    <option value="أرقام فقط">أرقام فقط</option>
                    <option value="أحرف فقط">أحرف فقط</option>
                    <option value="أحرف وأرقام">أحرف وأرقام</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  onClick={() => setCurrentStep(2)}
                  className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-extrabold text-xs md:text-sm transition-all shadow-md shadow-purple-900/40 cursor-pointer flex items-center gap-1.5"
                >
                  <span>التالي</span>
                  <span>←</span>
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: Cloud Router Connection */}
          {currentStep === 2 && (
            <div className="space-y-6 text-right">
              <h3 className="text-base md:text-lg font-extrabold flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-purple-600 text-white text-xs flex items-center justify-center font-bold">
                  2
                </span>
                <span>اتصال الكلاود - ربط الراوتر</span>
              </h3>

              {/* Instructions Blue Card */}
              <div
                className={`rounded-2xl p-5 border transition-colors space-y-2 text-right ${
                  isDarkMode
                    ? 'bg-[#15233c] border-blue-900/60 text-blue-100'
                    : 'bg-blue-50/90 border-blue-200 text-blue-950'
                }`}
              >
                <h4 className="font-extrabold text-xs md:text-sm text-blue-400 flex items-center gap-1.5">
                  <span>🔊</span>
                  <span>تعليمات الاتصال السحابي</span>
                </h4>
                <ul className="text-xs space-y-1 opacity-90 leading-relaxed pr-2">
                  <li>• للاتصال السحابي، يجب أن يكون للراوتر IP عام أو DNS عام (مثل DDNS).</li>
                  <li>• يمكنك استخدام راوتر مستضاف سحابياً من مايكروتك (CHR) من MikroTik.</li>
                  <li>• أو إعداد DDNS (Dynamic DNS) إذا كان لديك IP عام متغير.</li>
                  <li>• تأكد من تفعيل خدمة API على الراوتر: <code className="font-mono bg-blue-500/20 px-1 py-0.5 rounded text-blue-300">/ip service enable api</code> (للمنفذ 8728).</li>
                  <li>• أضف منفذ API إلى الجدار الناري: <code className="font-mono bg-blue-500/20 px-1 py-0.5 rounded text-blue-300">/ip firewall filter add dst-port=8728 protocol=tcp action=accept place-before=0</code></li>
                </ul>
              </div>

              {/* Input Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-extrabold mb-1.5">رابط الكلاود (DNS أو IP عام)</label>
                  <input
                    type="text"
                    value={cloudUrl}
                    onChange={(e) => setCloudUrl(e.target.value)}
                    placeholder="router.example.com"
                    className={`w-full rounded-xl py-2.5 px-3.5 text-xs md:text-sm text-right font-mono focus:outline-none transition-all ${
                      isDarkMode
                        ? 'bg-[#1b2536] text-slate-100 border border-slate-700 focus:border-purple-500'
                        : 'bg-slate-50 text-slate-900 border border-slate-300'
                    }`}
                  />
                  <span className="text-[10px] text-slate-400 block mt-1">
                    www.example.com أو 203.0.113.1 (بدون http:// أو بورت)
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-extrabold mb-1.5">بورت API</label>
                  <input
                    type="text"
                    value={apiPort}
                    onChange={(e) => setApiPort(e.target.value)}
                    className={`w-full rounded-xl py-2.5 px-3.5 text-xs md:text-sm text-right font-mono font-bold focus:outline-none transition-all ${
                      isDarkMode
                        ? 'bg-[#1b2536] text-slate-100 border border-slate-700 focus:border-purple-500'
                        : 'bg-slate-50 text-slate-900 border border-slate-300'
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-xs font-extrabold mb-1.5">اسم مستخدم الراوتر</label>
                  <input
                    type="text"
                    value={routerUser}
                    onChange={(e) => setRouterUser(e.target.value)}
                    placeholder="admin"
                    className={`w-full rounded-xl py-2.5 px-3.5 text-xs md:text-sm text-right font-mono focus:outline-none transition-all ${
                      isDarkMode
                        ? 'bg-[#1b2536] text-slate-100 border border-slate-700 focus:border-purple-500'
                        : 'bg-slate-50 text-slate-900 border border-slate-300'
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-xs font-extrabold mb-1.5">كلمة سر الراوتر</label>
                  <input
                    type="password"
                    value={routerPass}
                    onChange={(e) => setRouterPass(e.target.value)}
                    placeholder="اتركها فارغة إذا لا توجد"
                    className={`w-full rounded-xl py-2.5 px-3.5 text-xs md:text-sm text-right font-mono focus:outline-none transition-all ${
                      isDarkMode
                        ? 'bg-[#1b2536] text-slate-100 border border-slate-700 focus:border-purple-500'
                        : 'bg-slate-50 text-slate-900 border border-slate-300'
                    }`}
                  />
                </div>
              </div>

              {testSuccess && (
                <div className="p-3.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>تم الاتصال بالسيرفر بنجاح! السيرفر متصل وشغال.</span>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-700/30">
                <button
                  onClick={() => setCurrentStep(1)}
                  className={`px-5 py-2.5 rounded-xl font-bold text-xs md:text-sm transition-all cursor-pointer ${
                    isDarkMode ? 'bg-[#1d2738] hover:bg-[#253247] text-slate-300' : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  ← السابق
                </button>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleTestConnection}
                    disabled={isTesting}
                    className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-extrabold text-xs md:text-sm transition-all shadow-md shadow-purple-900/40 cursor-pointer flex items-center gap-2 disabled:opacity-50"
                  >
                    {isTesting ? <RefreshCw className="w-4 h-4 animate-spin" /> : null}
                    <span>{isTesting ? 'جاري الفحص...' : 'اختبار الاتصال والمتابعة ←'}</span>
                  </button>

                  <button
                    onClick={() => setCurrentStep(3)}
                    className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs md:text-sm transition-all shadow-md shadow-emerald-900/40 cursor-pointer"
                  >
                    تخطي والتالي ←
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Additional Settings */}
          {currentStep === 3 && (
            <div className="space-y-6 text-right">
              <h3 className="text-base md:text-lg font-extrabold flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-purple-600 text-white text-xs flex items-center justify-center font-bold">
                  3
                </span>
                <span>إعدادات إضافية</span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-extrabold mb-1.5">DNS Name الخاص بالسيرفر</label>
                  <input
                    type="text"
                    value={dnsName}
                    onChange={(e) => setDnsName(e.target.value)}
                    placeholder="net.local"
                    className={`w-full rounded-xl py-2.5 px-3.5 text-xs md:text-sm text-right font-mono focus:outline-none transition-all ${
                      isDarkMode
                        ? 'bg-[#1b2536] text-slate-100 border border-slate-700 focus:border-purple-500'
                        : 'bg-slate-50 text-slate-900 border border-slate-300'
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-xs font-extrabold mb-1.5">اسم Hotspot Server Profile</label>
                  <input
                    type="text"
                    value={serverProfile}
                    onChange={(e) => setServerProfile(e.target.value)}
                    className={`w-full rounded-xl py-2.5 px-3.5 text-xs md:text-sm text-right font-mono focus:outline-none transition-all ${
                      isDarkMode
                        ? 'bg-[#1b2536] text-slate-100 border border-slate-700 focus:border-purple-500'
                        : 'bg-slate-50 text-slate-900 border border-slate-300'
                    }`}
                  />
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[#182335] border border-slate-700/60 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold block">تزامن الكروت تلقائياً مع السيرفر</span>
                  <span className="text-[10px] text-slate-400">إضافة الكروت إلى MikroTik مباشرة فور رفع الملفات</span>
                </div>
                <input
                  type="checkbox"
                  checked={autoSync}
                  onChange={(e) => setAutoSync(e.target.checked)}
                  className="w-5 h-5 text-purple-600 rounded cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-700/30">
                <button
                  onClick={() => setCurrentStep(2)}
                  className={`px-5 py-2.5 rounded-xl font-bold text-xs md:text-sm transition-all cursor-pointer ${
                    isDarkMode ? 'bg-[#1d2738] hover:bg-[#253247] text-slate-300' : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  ← السابق
                </button>

                <button
                  onClick={() => setCurrentStep(4)}
                  className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-extrabold text-xs md:text-sm transition-all shadow-md shadow-purple-900/40 cursor-pointer flex items-center gap-1.5"
                >
                  <span>التالي</span>
                  <span>←</span>
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: Profiles Binding */}
          {currentStep === 4 && (
            <div className="space-y-6 text-right">
              <h3 className="text-base md:text-lg font-extrabold flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-purple-600 text-white text-xs flex items-center justify-center font-bold">
                  4
                </span>
                <span>ربط البروفايلات (Profile Binding)</span>
              </h3>

              <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                اختر اسم البروفايل المكتوب داخل المايكروتك المقابل لكل فئة
              </p>

              <div className="space-y-3">
                <div className="p-3.5 rounded-xl border border-slate-700/50 flex items-center justify-between">
                  <input
                    type="text"
                    value={profile100}
                    onChange={(e) => setProfile100(e.target.value)}
                    className={`w-1/2 rounded-lg py-1.5 px-3 text-xs font-mono font-bold text-left dir-ltr ${
                      isDarkMode ? 'bg-[#1b2536] text-white border border-slate-700' : 'bg-slate-100 text-slate-900 border border-slate-300'
                    }`}
                  />
                  <span className="text-xs font-bold text-slate-300">فئة 100 ر.ي (300MB / 3 ساعات)</span>
                </div>

                <div className="p-3.5 rounded-xl border border-slate-700/50 flex items-center justify-between">
                  <input
                    type="text"
                    value={profile200}
                    onChange={(e) => setProfile200(e.target.value)}
                    className={`w-1/2 rounded-lg py-1.5 px-3 text-xs font-mono font-bold text-left dir-ltr ${
                      isDarkMode ? 'bg-[#1b2536] text-white border border-slate-700' : 'bg-slate-100 text-slate-900 border border-slate-300'
                    }`}
                  />
                  <span className="text-xs font-bold text-slate-300">فئة 200 ر.ي (650MB / 8 ساعات)</span>
                </div>

                <div className="p-3.5 rounded-xl border border-slate-700/50 flex items-center justify-between">
                  <input
                    type="text"
                    value={profile500}
                    onChange={(e) => setProfile500(e.target.value)}
                    className={`w-1/2 rounded-lg py-1.5 px-3 text-xs font-mono font-bold text-left dir-ltr ${
                      isDarkMode ? 'bg-[#1b2536] text-white border border-slate-700' : 'bg-slate-100 text-slate-900 border border-slate-300'
                    }`}
                  />
                  <span className="text-xs font-bold text-slate-300">فئة 500 ر.ي (1500MB / 18 ساعة)</span>
                </div>

                <div className="p-3.5 rounded-xl border border-slate-700/50 flex items-center justify-between">
                  <input
                    type="text"
                    value={profile1000}
                    onChange={(e) => setProfile1000(e.target.value)}
                    className={`w-1/2 rounded-lg py-1.5 px-3 text-xs font-mono font-bold text-left dir-ltr ${
                      isDarkMode ? 'bg-[#1b2536] text-white border border-slate-700' : 'bg-slate-100 text-slate-900 border border-slate-300'
                    }`}
                  />
                  <span className="text-xs font-bold text-slate-300">فئة 1,000 ر.ي (3000MB / 40 ساعة)</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-700/30">
                <button
                  onClick={() => setCurrentStep(3)}
                  className={`px-5 py-2.5 rounded-xl font-bold text-xs md:text-sm transition-all cursor-pointer ${
                    isDarkMode ? 'bg-[#1d2738] hover:bg-[#253247] text-slate-300' : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  ← السابق
                </button>

                <button
                  onClick={handleFinish}
                  className="px-8 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs md:text-sm transition-all shadow-lg shadow-emerald-900/40 cursor-pointer flex items-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>حفظ وإكمال الإعدادات</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};
