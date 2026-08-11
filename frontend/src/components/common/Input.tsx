'use client';

import React, { forwardRef } from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leadingIcon?: React.ReactNode;
  trailingIcon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, leadingIcon, trailingIcon, className = '', id, ...props }, ref) => {
    const inputId = id || (label ? `input-${label.replace(/\s+/g, '-').toLowerCase()}` : undefined);

    return (
      <div className="w-full text-right dir-rtl">
        {label && (
          <label htmlFor={inputId} className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5 text-right">
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {leadingIcon && (
            <div className="absolute right-3.5 inset-y-0 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
              {leadingIcon}
            </div>
          )}
          <input
            id={inputId}
            ref={ref}
            className={`w-full bg-slate-50 dark:bg-slate-900/80 text-slate-900 dark:text-slate-100 border text-sm rounded-xl py-3 text-right placeholder:text-right transition-all duration-200 outline-none
              ${leadingIcon ? 'pr-11 pl-4' : 'px-4'}
              ${trailingIcon ? 'pl-11' : ''}
              ${
                error
                  ? 'border-red-500 focus:ring-2 focus:ring-red-500/20'
                  : 'border-slate-200 dark:border-slate-800 focus:border-purple-600 dark:focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 dark:focus:ring-purple-500/30'
              }
              ${className}`}
            {...props}
          />
          {trailingIcon && (
            <div className="absolute left-3 inset-y-0 flex items-center text-slate-400 dark:text-slate-500">
              {trailingIcon}
            </div>
          )}
        </div>
        {error && <p className="mt-1 text-xs text-red-500 text-right">{error}</p>}
        {helperText && !error && <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 text-right">{helperText}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';
export default Input;
