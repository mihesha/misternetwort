import React from 'react';
import { Moon, Sun, Globe, Settings, ChevronDown, Shield, ArrowRight } from 'lucide-react';

interface PrivacyPolicyPageProps {
  isDarkMode: boolean;
  onToggleTheme: () => void;
  ownerName?: string;
  onBack: () => void;
}

export const PrivacyPolicyPage: React.FC<PrivacyPolicyPageProps> = ({
  isDarkMode,
  onToggleTheme,
  ownerName = 'هشام محمد الجايفي',
  onBack,
}) => {
  return (
    <div
      dir="rtl"
      className={`min-h-screen transition-colors font-['Cairo',sans-serif] ${
        isDarkMode ? 'bg-[#0a0f18] text-slate-100' : 'bg-slate-100 text-slate-800'
      }`}
    >
      {/* Top Navbar */}
      <header
        className={`w-full px-4 md:px-8 py-3 flex items-center justify-between transition-colors ${
          isDarkMode
            ? 'bg-[#111823] border-b border-slate-800/80'
            : 'bg-white border-b border-slate-200 shadow-sm'
        }`}
      >
        {/* Right side: Logo & Navigation items */}
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="shrink-0 flex items-center justify-center">
              <img 
                src={isDarkMode ? '/logos/logo-dark.png' : '/logos/logo-light.png'} 
                alt="Card Box Logo" 
                className="w-10 h-10 object-cover rounded-xl"
              />
            </div>
            <span className={`text-sm md:text-base font-extrabold tracking-tight ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>
              Card Box
            </span>
          </div>

          <nav className={`hidden md:flex items-center gap-4 text-xs font-bold mr-4 ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
            <div className={`flex items-center gap-1.5 transition-colors cursor-pointer ${isDarkMode ? 'hover:text-white' : 'hover:text-slate-900'}`}>
              <Globe className="w-4 h-4 text-indigo-500" />
              <span>لوحة التحكم</span>
            </div>
            <div className={`flex items-center gap-1.5 transition-colors cursor-pointer ${isDarkMode ? 'hover:text-white' : 'hover:text-slate-900'}`}>
              <Settings className={`w-4 h-4 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`} />
              <span>إعدادات الشبكة</span>
            </div>
          </nav>
        </div>

        {/* Left side: Profile Menu & Theme Toggle */}
        <div className="flex items-center gap-3">
          <div
            className={`flex items-center gap-2.5 px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
              isDarkMode
                ? 'bg-[#1b2535] hover:bg-[#222f43] border border-slate-700/50'
                : 'bg-slate-100 hover:bg-slate-200 border border-slate-200'
            }`}
          >
            <ChevronDown className={`w-4 h-4 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`} />
            <div className="text-right">
              <span className={`text-xs font-bold block ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>{ownerName}</span>
              <span className={`text-[10px] block -mt-0.5 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>مالك شبكة</span>
            </div>
            <div className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs">
              م
            </div>
          </div>

          <button
            onClick={onToggleTheme}
            className={`p-2 rounded-xl transition-colors cursor-pointer ${
              isDarkMode
                ? 'bg-[#1b2535] hover:bg-[#222f43] border border-slate-700/50 text-slate-300'
                : 'bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-600'
            }`}
            title="تغيير المظهر"
          >
            {isDarkMode ? <Moon className="w-4 h-4 text-slate-300" /> : <Sun className="w-4 h-4 text-amber-500" />}
          </button>
        </div>
      </header>

      {/* Main Content Container */}
      <main className="max-w-4xl mx-auto px-4 md:px-8 py-8">
        {/* Page Title Top Bar */}
        <div className="mb-8 text-right">
          
        </div>

        {/* Policy Header Icon & Title */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-full bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 mx-auto mb-4">
            <Shield className="w-7 h-7" />
          </div>
          <h2 className={`text-2xl md:text-3xl font-extrabold mb-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
            شروط الخصوصية والسياسة العامة
          </h2>
          <p className={`text-xs md:text-sm font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
            آخر تحديث: 30 يونيو 2026
          </p>
        </div>

        {/* Policy Content Card */}
        <div
          className={`rounded-2xl p-6 md:p-10 mb-8 transition-colors space-y-8 ${
            isDarkMode
              ? 'bg-[#141d2b] border border-slate-800 shadow-2xl shadow-black/60'
              : 'bg-white border border-slate-200 shadow-xl shadow-slate-300/40 text-slate-800'
          }`}
        >
          {/* Section 1 */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <span className="w-7 h-7 rounded-full bg-indigo-600 text-white font-bold text-sm flex items-center justify-center shrink-0">
                1
              </span>
              <h3 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                جمع البيانات
              </h3>
            </div>
            <p className={`text-xs md:text-sm leading-relaxed pr-10 ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
              نقوم بجمع البيانات الشخصية التالية عند استخدامك لمنصة كارتي:
            </p>
            <ul className={`text-xs md:text-sm space-y-2 pr-10 leading-relaxed ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
              <li className="flex items-start gap-2">
                <span className="text-indigo-500 font-bold">•</span>
                <span><strong className={isDarkMode ? 'text-slate-200' : 'text-slate-800'}>معلومات الحساب:</strong> الاسم، البريد الإلكتروني، رقم الهاتف، كلمة المرور</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-indigo-500 font-bold">•</span>
                <span><strong className={isDarkMode ? 'text-slate-200' : 'text-slate-800'}>معلومات الشبكة:</strong> أسماء الشبكات، بطاقات الشحن، الفئات، الأسعار</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-indigo-500 font-bold">•</span>
                <span><strong className={isDarkMode ? 'text-slate-200' : 'text-slate-800'}>بيانات العمليات:</strong> سجل المعاملات، المبيعات اليومية، العمولات</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-indigo-500 font-bold">•</span>
                <span><strong className={isDarkMode ? 'text-slate-200' : 'text-slate-800'}>بيانات الاستخدام:</strong> عنوان IP، نوع الجهاز، سجل التصفح</span>
              </li>
            </ul>
          </div>

          <hr className={isDarkMode ? 'border-slate-800' : 'border-slate-200'} />

          {/* Section 2 */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <span className="w-7 h-7 rounded-full bg-indigo-600 text-white font-bold text-sm flex items-center justify-center shrink-0">
                2
              </span>
              <h3 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                استخدام البيانات
              </h3>
            </div>
            <p className={`text-xs md:text-sm leading-relaxed pr-10 ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
              نستخدم بياناتك للأغراض التالية:
            </p>
            <ul className={`text-xs md:text-sm space-y-2 pr-10 leading-relaxed ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
              <li className="flex items-start gap-2">
                <span className="text-indigo-500 font-bold">•</span>
                <span>توفير خدمات المنصة وإدارة حسابك</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-indigo-500 font-bold">•</span>
                <span>معالجة معاملات الشحن والمدفوعات</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-indigo-500 font-bold">•</span>
                <span>إرسال إشعارات حول حسابك وخدماتنا</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-indigo-500 font-bold">•</span>
                <span>تحسين تجربة المستخدم وتطوير الميزات الجديدة</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-indigo-500 font-bold">•</span>
                <span>الامتثال للمتطلبات القانونية والتنظيمية</span>
              </li>
            </ul>
          </div>

          <hr className={isDarkMode ? 'border-slate-800' : 'border-slate-200'} />

          {/* Section 3 */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <span className="w-7 h-7 rounded-full bg-indigo-600 text-white font-bold text-sm flex items-center justify-center shrink-0">
                3
              </span>
              <h3 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                حماية الحساب
              </h3>
            </div>
            <p className={`text-xs md:text-sm leading-relaxed pr-10 ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
              نحن ملتزمون بحماية بياناتك، ونتبع التدابير التالية:
            </p>
            <ul className={`text-xs md:text-sm space-y-2 pr-10 leading-relaxed ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
              <li className="flex items-start gap-2">
                <span className="text-indigo-500 font-bold">•</span>
                <span>تشفير البيانات أثناء النقل والتخزين</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-indigo-500 font-bold">•</span>
                <span>تطبيق سياسات كلمات مرور قوية</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-indigo-500 font-bold">•</span>
                <span>مراقبة مستمرة للنشاط المشبوه</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-indigo-500 font-bold">•</span>
                <span>النسخ الاحتياطي المنتظم للبيانات</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-indigo-500 font-bold">•</span>
                <span>الوصول المحدود للبيانات بناءً على الحاجة</span>
              </li>
            </ul>
          </div>

          <hr className={isDarkMode ? 'border-slate-800' : 'border-slate-200'} />

          {/* Section 4 */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <span className="w-7 h-7 rounded-full bg-indigo-600 text-white font-bold text-sm flex items-center justify-center shrink-0">
                4
              </span>
              <h3 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                تحديثات السياسة
              </h3>
            </div>
            <p className={`text-xs md:text-sm leading-relaxed pr-10 ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
              قد نقوم بتحديث هذه السياسة من وقت لآخر. سنقوم بإخطارك بأي تغييرات جوهرية عبر:
            </p>
            <ul className={`text-xs md:text-sm space-y-2 pr-10 leading-relaxed ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
              <li className="flex items-start gap-2">
                <span className="text-indigo-500 font-bold">•</span>
                <span>إشعار في لوحة التحكم عند تسجيل الدخول</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-indigo-500 font-bold">•</span>
                <span>البريد الإلكتروني المسجل في حسابك</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-indigo-500 font-bold">•</span>
                <span>نشر النسخة المحدثة على هذه الصفحة</span>
              </li>
            </ul>
            <p className={`text-xs md:text-sm font-medium pr-10 pt-2 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
              استمرارك في استخدام المنصة بعد أي تحديثات يُعتبر قبولك للشروط الجديدة.
            </p>
          </div>
        </div>

        {/* Back Button */}
        <div className="flex justify-center">
          
        </div>
      </main>
    </div>
  );
};
