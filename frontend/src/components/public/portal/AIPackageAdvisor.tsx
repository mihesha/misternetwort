import React, { useState } from 'react';
import { Sparkles, Bot, ArrowRight, CheckCircle2, RefreshCw } from 'lucide-react';
import { CardCategory } from '../../../types';

interface AIPackageAdvisorProps {
  onApplyPackages: (packages: CardCategory[]) => void;
  isDarkMode: boolean;
}

export const AIPackageAdvisor: React.FC<AIPackageAdvisorProps> = ({
  onApplyPackages,
  isDarkMode,
}) => {
  const [networkType, setNetworkType] = useState('منطقة سكنية وططلابية');
  const [governorate, setGovernorate] = useState('أمانة العاصمة (صنعاء)');
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<CardCategory[] | null>(null);

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/ai/suggest-packages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ networkType, governorate }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.packages && Array.isArray(data.packages)) {
          setSuggestions(data.packages);
        } else {
          fallbackSuggestions();
        }
      } else {
        fallbackSuggestions();
      }
    } catch {
      fallbackSuggestions();
    } finally {
      setLoading(false);
    }
  };

  const fallbackSuggestions = () => {
    setSuggestions([
      {
        id: `ai-1-${Date.now()}`,
        name: 'فئة 100 ريال - سريعة',
        price: 100,
        mega: 400,
        hours: 4,
        validityDays: 1,
        cardType: 'مستخدم فقط',
      },
      {
        id: `ai-2-${Date.now()}`,
        name: 'فئة 250 ريال - يومية',
        price: 250,
        mega: 1200,
        hours: 24,
        validityDays: 2,
        cardType: 'مستخدم فقط',
      },
      {
        id: `ai-3-${Date.now()}`,
        name: 'فئة 500 ريال - أسبوعية',
        price: 500,
        mega: 3000,
        hours: 48,
        validityDays: 7,
        cardType: 'مستخدم + كلمة مرور',
      },
      {
        id: `ai-4-${Date.now()}`,
        name: 'فئة 1000 ريال - شهرية VIP',
        price: 1000,
        mega: 8000,
        hours: 120,
        validityDays: 30,
        cardType: 'مستخدم + كلمة مرور',
      },
    ]);
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 pb-12">
      {/* Title Header */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-purple-950 via-indigo-950 to-slate-900 border border-purple-500/30 text-center space-y-3">
        <div className="inline-flex p-3 rounded-2xl bg-purple-500/20 text-purple-300 border border-purple-500/30">
          <Sparkles className="w-8 h-8 animate-pulse" />
        </div>
        <h2 className="text-xl md:text-2xl font-black text-white font-['Cairo']">
          مساعد Gemini الذكي لتصميم باقات الشبكات
        </h2>
        <p className="text-xs md:text-sm text-slate-300 max-w-xl mx-auto">
          يقوم الذكاء الاصطناعي بتحليل طبيعة المنطقة وتقديم أفضل توليفة فئات كروت تناسب مستخدمي شبكتك للحصول على أعلى عائد وأعلى نسبة مبيعات.
        </p>
      </div>

      {/* Controls Box */}
      <div
        className={`p-5 md:p-6 rounded-3xl border space-y-4 ${
          isDarkMode ? 'bg-[#121927] border-slate-800' : 'bg-white border-slate-200'
        }`}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs md:text-sm font-semibold mb-1.5 text-slate-300">
              طبيعة المنطقة والمستخدمين:
            </label>
            <select
              value={networkType}
              onChange={(e) => setNetworkType(e.target.value)}
              className="w-full px-4 py-3 rounded-xl text-xs md:text-sm bg-[#1d273a] text-white border border-slate-700/80 focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="منطقة سكنية وططلابية">منطقة سكنية وططلابية (استهلاك عالي)</option>
              <option value="سوق تجاري ومحلات">سوق تجاري ومحلات (استخدام سريع)</option>
              <option value="حي هادئ وعائلات">حي هادئ وعائلات (باقات أسبوعية وشهرية)</option>
              <option value="مقهى أو مطعم">مقهى أو مطعم (باقات ساعات مجانية أو رخيصة)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs md:text-sm font-semibold mb-1.5 text-slate-300">
              المحافظة / المدينة:
            </label>
            <input
              type="text"
              value={governorate}
              onChange={(e) => setGovernorate(e.target.value)}
              className="w-full px-4 py-3 rounded-xl text-xs md:text-sm bg-[#1d273a] text-white border border-slate-700/80 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
        </div>

        <div className="pt-2 flex justify-center">
          <button
            onClick={handleGenerate}
            disabled={loading}
            className="flex items-center gap-2 px-6 py-3 rounded-2xl text-sm font-bold text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 shadow-xl shadow-purple-600/30 transition-all cursor-pointer disabled:opacity-50"
          >
            {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Bot className="w-4 h-4" />}
            <span>{loading ? 'جاري التوليد بالذكاء الاصطناعي...' : 'توليد اقتراح الباقات الآن'}</span>
          </button>
        </div>
      </div>

      {/* Results View */}
      {suggestions && (
        <div className="p-6 rounded-3xl bg-[#121927] border border-purple-500/30 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-base text-white flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              <span>الباقات المقترحة بذكاء:</span>
            </h3>
            <button
              onClick={() => {
                onApplyPackages(suggestions);
                alert('تم تطبيق الباقات المقترحة على نموذج طلب الانضمام!');
              }}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 shadow-md cursor-pointer transition-all"
            >
              <span>تطبيق على نموذج الطلب</span>
              <ArrowRight className="w-4 h-4 -scale-x-100" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {suggestions.map((p, i) => (
              <div key={i} className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60 space-y-1">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-white">{p.name}</span>
                  <span className="text-indigo-400 font-extrabold font-mono text-base">{p.price} ريال</span>
                </div>
                <div className="text-xs text-slate-300 flex items-center gap-2 flex-wrap">
                  {p.mega && <span>{p.mega} MB</span>}
                  {p.hours && <span>• {p.hours} ساعات</span>}
                  {p.validityDays && <span>• صلاحية {p.validityDays} يوم</span>}
                </div>
                <span className="inline-block text-[10px] text-purple-300 bg-purple-500/10 px-2 py-0.5 rounded-md mt-1">
                  {p.cardType}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
