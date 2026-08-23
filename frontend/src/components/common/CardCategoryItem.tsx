import React, { useState, useRef, useEffect } from 'react';
import { Trash2, Edit3, Wifi, CheckCircle2, AlertCircle, ChevronDown } from 'lucide-react';
import { CardCategory, CardType } from '../../types';

// Inline Custom Select for CardCategoryItem
const CustomSelect = ({ value, onChange, options, isDarkMode }: any) => {
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
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center justify-between w-full px-4 py-3 rounded-xl text-sm transition-all border outline-none cursor-pointer ${isDarkMode ? 'bg-[#1c2638] text-white border-transparent focus:ring-2 focus:ring-indigo-500' : 'bg-slate-50 text-slate-800 border-slate-200 hover:border-indigo-300 focus:ring-2 focus:ring-indigo-500'}`}
      >
        <span>{value}</span>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180 text-indigo-500' : 'text-slate-400'}`} />
      </button>
      {isOpen && (
        <div className={`absolute z-50 w-full mt-2 py-2 rounded-xl shadow-2xl border ${isDarkMode ? 'bg-[#1e293b] border-slate-700 shadow-black/50' : 'bg-white border-slate-100'} animate-in fade-in slide-in-from-top-2`}>
          {options.map((opt: string) => (
            <button
              key={opt}
              type="button"
              onClick={() => { onChange(opt); setIsOpen(false); }}
              className={`flex items-center w-full text-right px-4 py-3 text-sm transition-colors font-medium hover:bg-indigo-50 dark:hover:bg-indigo-500/10 ${value === opt ? 'bg-indigo-50 dark:bg-indigo-500/20 font-bold text-indigo-600 dark:text-indigo-400' : isDarkMode ? 'text-slate-200' : 'text-slate-700'}`}
            >
              {opt}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

interface CardCategoryItemProps {
  category: CardCategory;
  index: number;
  isEditing: boolean;
  onEdit: () => void;
  onSave: () => void;
  onUpdate: (id: string, field: keyof CardCategory, value: string | number) => void;
  onRemove: (id: string) => void;
  isDarkMode: boolean;
  canRemove: boolean;
}

export const CardCategoryItem: React.FC<CardCategoryItemProps> = ({
  category,
  index,
  isEditing,
  onEdit,
  onSave,
  onUpdate,
  onRemove,
  isDarkMode,
  canRemove,
}) => {
  const [error, setError] = useState<string | null>(null);

  const handleSave = () => {
    if (!category.name || !category.price || !category.mega || !category.hours || !category.validityDays) {
      setError('يرجى استكمال جميع الحقول قبل الحفظ');
      return;
    }
    setError(null);
    onSave();
  };

  if (!isEditing) {
    return (
      <div className={`relative p-5 rounded-2xl transition-all border shadow-lg overflow-hidden group ${
        isDarkMode 
          ? 'bg-gradient-to-br from-[#1c2638] to-[#141d2e] border-slate-700/60 shadow-black/40' 
          : 'bg-gradient-to-br from-white to-slate-50 border-slate-200 shadow-slate-200/50'
      }`}>
        {/* Background Decorative Element */}
        <div className="absolute -top-10 -left-10 opacity-10 dark:opacity-5 transform -rotate-12 pointer-events-none">
          <Wifi className="w-32 h-32 text-indigo-500" />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-4">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-inner font-bold text-lg ${
              isDarkMode ? 'bg-indigo-500/20 text-indigo-400' : 'bg-indigo-100 text-indigo-600'
            }`}>
              {category.price}<span className="text-[10px] ml-1 opacity-70">ريال</span>
            </div>
            <div>
              <h3 className={`font-bold text-lg ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>{category.name}</h3>
              <p className={`text-xs mt-1 flex flex-wrap items-center gap-2 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                <span className="font-semibold bg-slate-200 dark:bg-slate-800 px-2 py-0.5 rounded-full">{category.mega} ميجا</span>
                <span className="font-semibold bg-slate-200 dark:bg-slate-800 px-2 py-0.5 rounded-full">{category.hours} ساعة</span>
                <span className="font-semibold bg-slate-200 dark:bg-slate-800 px-2 py-0.5 rounded-full">{category.validityDays} أيام</span>
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 w-full md:w-auto">
            <div className={`flex-1 md:flex-none text-center px-4 py-2 rounded-xl text-xs font-bold ${
              category.cardType === 'مستخدم + كلمة مرور' 
                ? 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400' 
                : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400'
            }`}>
              {category.cardType}
            </div>
            <button type="button" onClick={onEdit} className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-all active:scale-95 shadow-sm">
              <Edit3 className="w-4 h-4" />
            </button>
            {canRemove && (
              <button type="button" onClick={() => onRemove(category.id)} className="p-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-500/10 dark:hover:bg-rose-500/20 text-rose-500 transition-all active:scale-95 shadow-sm">
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative p-5 md:p-6 rounded-2xl transition-all border ${
      error ? 'border-rose-500 shadow-lg shadow-rose-500/10' :
      isDarkMode ? 'bg-[#141d2e] border-indigo-500/50 shadow-lg shadow-indigo-900/20' : 'bg-white border-indigo-200 shadow-xl shadow-indigo-100'
    } animate-in fade-in zoom-in-95 duration-300`}>
      <div className="flex justify-between items-center mb-5 pb-4 border-b border-slate-100 dark:border-slate-800">
        <h3 className={`font-bold text-sm flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
          <div className="w-6 h-6 rounded-full bg-indigo-500 flex items-center justify-center text-white text-xs">{index + 1}</div>
          إعدادات فئة الكرت
        </h3>
        <div className="flex items-center gap-2">
          {canRemove && (
            <button type="button" onClick={() => onRemove(category.id)} className="text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 p-2 rounded-xl transition-all active:scale-95" title="حذف هذه الفئة">
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="mb-5 flex items-center gap-2 text-xs font-bold text-rose-500 bg-rose-50 dark:bg-rose-500/10 p-3 rounded-xl border border-rose-100 dark:border-rose-500/20 animate-in slide-in-from-top-2">
          <AlertCircle className="w-4 h-4 shrink-0" /> {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <label className={`block text-xs font-bold mb-2 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>اسم الفئة <span className="text-rose-500">*</span></label>
          <input type="text" value={category.name} onChange={(e) => { onUpdate(category.id, 'name', e.target.value); setError(null); }} placeholder="مثال: 100 ريال" className={`w-full px-4 py-3 rounded-xl text-sm transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500 ${isDarkMode ? 'bg-[#1c2638] text-white border-slate-700' : 'bg-slate-50 border-slate-200'}`} />
        </div>
        <div>
          <label className={`block text-xs font-bold mb-2 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>سعر الفئة <span className="text-rose-500">*</span></label>
          <input type="number" value={category.price} onChange={(e) => { onUpdate(category.id, 'price', e.target.value === '' ? '' : Number(e.target.value)); setError(null); }} placeholder="50" className={`w-full px-4 py-3 rounded-xl text-sm transition-all text-right focus:outline-none focus:ring-2 focus:ring-indigo-500 ${isDarkMode ? 'bg-[#1c2638] text-white border-slate-700' : 'bg-slate-50 border-slate-200'}`} />
        </div>
        <div>
          <label className={`block text-xs font-bold mb-2 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>حجم الباقة (ميجا) <span className="text-rose-500">*</span></label>
          <input type="number" value={category.mega} onChange={(e) => { onUpdate(category.id, 'mega', e.target.value === '' ? '' : Number(e.target.value)); setError(null); }} placeholder="300" className={`w-full px-4 py-3 rounded-xl text-sm transition-all text-right focus:outline-none focus:ring-2 focus:ring-indigo-500 ${isDarkMode ? 'bg-[#1c2638] text-white border-slate-700' : 'bg-slate-50 border-slate-200'}`} />
        </div>
        <div>
          <label className={`block text-xs font-bold mb-2 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>عدد الساعات <span className="text-rose-500">*</span></label>
          <input type="number" value={category.hours} onChange={(e) => { onUpdate(category.id, 'hours', e.target.value === '' ? '' : Number(e.target.value)); setError(null); }} placeholder="3" className={`w-full px-4 py-3 rounded-xl text-sm transition-all text-right focus:outline-none focus:ring-2 focus:ring-indigo-500 ${isDarkMode ? 'bg-[#1c2638] text-white border-slate-700' : 'bg-slate-50 border-slate-200'}`} />
        </div>
        <div>
          <label className={`block text-xs font-bold mb-2 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>أيام الصلاحية <span className="text-rose-500">*</span></label>
          <input type="number" value={category.validityDays} onChange={(e) => { onUpdate(category.id, 'validityDays', e.target.value === '' ? '' : Number(e.target.value)); setError(null); }} placeholder="3" className={`w-full px-4 py-3 rounded-xl text-sm transition-all text-right focus:outline-none focus:ring-2 focus:ring-indigo-500 ${isDarkMode ? 'bg-[#1c2638] text-white border-slate-700' : 'bg-slate-50 border-slate-200'}`} />
        </div>
        <div>
          <label className={`block text-xs font-bold mb-2 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>نوع الكروت <span className="text-rose-500">*</span></label>
          <CustomSelect 
            value={category.cardType} 
            onChange={(val: CardType) => onUpdate(category.id, 'cardType', val)} 
            options={['مستخدم فقط', 'مستخدم + كلمة مرور']} 
            isDarkMode={isDarkMode} 
          />
        </div>
      </div>
      
      <div className="mt-6 flex justify-end">
        <button type="button" onClick={handleSave} className="flex items-center gap-2 px-8 py-3.5 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 transition-all active:scale-[0.98] shadow-lg shadow-indigo-500/30">
          <CheckCircle2 className="w-5 h-5" /> حفظ الفئة
        </button>
      </div>
    </div>
  );
};
