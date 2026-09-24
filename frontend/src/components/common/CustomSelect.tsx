/* eslint-disable tailwindcss/no-contradicting-classname */
import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

export const CustomSelect = ({ value, onChange, options, placeholder, error, isDarkMode, disabled = false }: any) => {
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
        className={`flex items-center justify-between w-full px-4 py-3.5 rounded-xl text-sm transition-all border outline-none ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'} ${error ? (isDarkMode ? 'border-rose-500 bg-rose-500/10 text-rose-400' : 'border-rose-500 bg-rose-50 text-rose-600') : isDarkMode ? 'bg-[#1c2638] text-white border-transparent focus:ring-2 focus:ring-indigo-500' : 'bg-slate-50 text-slate-800 border-slate-200 hover:border-indigo-300 focus:ring-2 focus:ring-indigo-500'}`}
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
                className={`flex items-center w-full text-right px-4 py-3 text-sm transition-colors font-medium ${isDarkMode ? 'hover:bg-indigo-500/10' : 'hover:bg-indigo-50'} ${value === opt ? (isDarkMode ? 'bg-indigo-500/20 font-bold text-indigo-400' : 'bg-indigo-50 font-bold text-indigo-600') : isDarkMode ? 'text-slate-200' : 'text-slate-700'}`}
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
