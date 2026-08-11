import React from 'react';
import { Trash2 } from 'lucide-react';
import { CardCategory, CardType } from '../../types';

interface CardCategoryItemProps {
  category: CardCategory;
  index: number;
  onUpdate: (id: string, field: keyof CardCategory, value: string | number) => void;
  onRemove: (id: string) => void;
  isDarkMode: boolean;
  canRemove: boolean;
}

export const CardCategoryItem: React.FC<CardCategoryItemProps> = ({
  category,
  index,
  onUpdate,
  onRemove,
  isDarkMode,
  canRemove,
}) => {
  return (
    <div
      className={`relative p-4 md:p-5 rounded-xl transition-all border ${
        isDarkMode
          ? 'bg-[#141d2e] border-slate-700/60 shadow-md'
          : 'bg-slate-50 border-slate-200 shadow-sm'
      }`}
    >
      {/* Trash Icon top left */}
      {canRemove && (
        <div className="flex justify-start mb-2">
          <button
            type="button"
            onClick={() => onRemove(category.id)}
            className="text-rose-500 hover:text-rose-400 p-1 rounded transition-colors cursor-pointer"
            title="حذف هذه الفئة"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* اسم الفئة * */}
        <div>
          <label className={`block text-xs font-semibold mb-1.5 ${isDarkMode ? 'text-slate-200' : 'text-slate-700'}`}>
            اسم الفئة <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            required
            value={category.name}
            onChange={(e) => onUpdate(category.id, 'name', e.target.value)}
            placeholder="مثال: 100 ريال"
            className={`w-full px-3.5 py-2.5 rounded-xl text-sm transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
              isDarkMode
                ? 'bg-[#1c2638] text-white border border-slate-700/80 placeholder-slate-500'
                : 'bg-white text-slate-900 border border-slate-300 placeholder-slate-400'
            }`}
          />
        </div>

        {/* السعر * */}
        <div>
          <label className={`block text-xs font-semibold mb-1.5 ${isDarkMode ? 'text-slate-200' : 'text-slate-700'}`}>
            السعر <span className="text-rose-500">*</span>
          </label>
          <input
            type="number"
            min="0"
            required
            value={category.price}
            onChange={(e) => onUpdate(category.id, 'price', e.target.value === '' ? '' : Number(e.target.value))}
            placeholder="50"
            className={`w-full px-3.5 py-2.5 rounded-xl text-sm transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
              isDarkMode
                ? 'bg-[#1c2638] text-white border border-slate-700/80 placeholder-slate-500'
                : 'bg-white text-slate-900 border border-slate-300 placeholder-slate-400'
            }`}
          />
        </div>

        {/* الميجا */}
        <div>
          <label className={`block text-xs font-semibold mb-1.5 ${isDarkMode ? 'text-slate-200' : 'text-slate-700'}`}>
            الميجا
          </label>
          <input
            type="number"
            min="0"
            value={category.mega}
            onChange={(e) => onUpdate(category.id, 'mega', e.target.value === '' ? '' : Number(e.target.value))}
            placeholder="300"
            className={`w-full px-3.5 py-2.5 rounded-xl text-sm transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
              isDarkMode
                ? 'bg-[#1c2638] text-white border border-slate-700/80 placeholder-slate-500'
                : 'bg-white text-slate-900 border border-slate-300 placeholder-slate-400'
            }`}
          />
        </div>

        {/* الساعات */}
        <div>
          <label className={`block text-xs font-semibold mb-1.5 ${isDarkMode ? 'text-slate-200' : 'text-slate-700'}`}>
            الساعات
          </label>
          <input
            type="number"
            min="0"
            value={category.hours}
            onChange={(e) => onUpdate(category.id, 'hours', e.target.value === '' ? '' : Number(e.target.value))}
            placeholder="3"
            className={`w-full px-3.5 py-2.5 rounded-xl text-sm transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
              isDarkMode
                ? 'bg-[#1c2638] text-white border border-slate-700/80 placeholder-slate-500'
                : 'bg-white text-slate-900 border border-slate-300 placeholder-slate-400'
            }`}
          />
        </div>

        {/* أيام الصلاحية - centered full width on single item row as in image */}
        <div className="md:col-span-2 flex flex-col items-center">
          <div className="w-full max-w-xs text-center">
            <label className={`block text-xs font-semibold mb-1.5 ${isDarkMode ? 'text-slate-200' : 'text-slate-700'}`}>
              أيام الصلاحية
            </label>
            <input
              type="number"
              min="0"
              value={category.validityDays}
              onChange={(e) => onUpdate(category.id, 'validityDays', e.target.value === '' ? '' : Number(e.target.value))}
              placeholder="3"
              className={`w-full px-3.5 py-2.5 rounded-xl text-sm text-center transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                isDarkMode
                  ? 'bg-[#1c2638] text-white border border-slate-700/80 placeholder-slate-500'
                  : 'bg-white text-slate-900 border border-slate-300 placeholder-slate-400'
              }`}
            />
          </div>
        </div>

        {/* نوع الكروت * */}
        <div className="md:col-span-2">
          <label className={`block text-xs font-semibold mb-1.5 ${isDarkMode ? 'text-slate-200' : 'text-slate-700'}`}>
            نوع الكروت <span className="text-rose-500">*</span>
          </label>
          <select
            value={category.cardType}
            onChange={(e) => onUpdate(category.id, 'cardType', e.target.value as CardType)}
            className={`w-full px-3.5 py-2.5 rounded-xl text-sm transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer ${
              isDarkMode
                ? 'bg-[#1c2638] text-white border border-slate-700/80'
                : 'bg-white text-slate-900 border border-slate-300'
            }`}
          >
            <option value="مستخدم فقط">مستخدم فقط</option>
            <option value="مستخدم + كلمة مرور">مستخدم + كلمة مرور</option>
          </select>
        </div>
      </div>
    </div>
  );
};
