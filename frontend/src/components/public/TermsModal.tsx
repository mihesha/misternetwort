'use client';

import React from 'react';
import { ShieldCheck, X } from 'lucide-react';

interface TermsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAccept: () => void;
}

export const TermsModal: React.FC<TermsModalProps> = ({ isOpen, onClose, onAccept }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200 dir-rtl text-right">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl max-h-[90vh] flex flex-col">
        {/* Modal Header */}
        <div className="p-5 sm:p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-purple-100 dark:bg-purple-950/80 text-purple-600 dark:text-purple-400 rounded-2xl shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-extrabold text-base sm:text-lg text-slate-900 dark:text-slate-100">
                مراجعة سياسة الاستخدام والخصوصية والموافقة عليها
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                يرجى قراءة جميع البنود حتى النهاية للمتابعة
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shrink-0"
            aria-label="إغلاق"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Terms Content */}
        <div className="p-5 sm:p-6 space-y-4 overflow-y-auto text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-sans">
          <h4 className="font-extrabold text-base text-slate-900 dark:text-slate-100 border-b border-slate-100 dark:border-slate-800 pb-2">
            سياسة الاستخدام والخصوصية
          </h4>

          <div className="space-y-2">
            <p className="font-bold text-slate-800 dark:text-slate-200">
              مرحباً بك في Card Box كارد بوكس.
            </p>
            <p className="text-slate-600 dark:text-slate-400">
              باستخدامك لمنصة Card Box كارد بوكس أو إنشاء حساب أو إجراء أي عملية شراء، فإنك توافق على هذه السياسة. إذا كنت لا توافق على أي من بنودها، يرجى عدم استخدام المنصة.
            </p>
          </div>

          {/* Section 1 */}
          <div className="space-y-1.5 pt-2">
            <h5 className="font-extrabold text-slate-900 dark:text-slate-100 text-sm">
              1. عن Card Box كارد بوكس
            </h5>
            <p className="text-slate-600 dark:text-slate-400">
              Card Box كارد بوكس منصة إلكترونية تربط بين العملاء وأصحاب الشبكات، وتتيح شراء كروت الإنترنت وإدارتها بطريقة سهلة وآمنة. تعمل المنصة كوسيط تقني، ولا تُعد مزوداً لخدمة الإنترنت.
            </p>
          </div>

          {/* Section 2 */}
          <div className="space-y-2 pt-2">
            <h5 className="font-extrabold text-slate-900 dark:text-slate-100 text-sm">
              2. البيانات التي نجمعها
            </h5>
            <p className="text-slate-600 dark:text-slate-400">
              قد نجمع البيانات اللازمة لتقديم الخدمة، ومنها:
            </p>
            <ul className="space-y-1.5 list-disc list-inside text-slate-600 dark:text-slate-400 pr-2">
              <li>الاسم الكامل.</li>
              <li>رقم الهاتف.</li>
              <li>المحافظة أو المدينة (عند الحاجة).</li>
              <li>بيانات الشبكة لأصحاب الشبكات.</li>
              <li>بيانات الطلبات وعمليات الشراء.</li>
              <li>بيانات الدفع اللازمة لإتمام العملية.</li>
              <li>بيانات تقنية مثل عنوان IP ونوع الجهاز لتحسين الأمان ومنع إساءة الاستخدام.</li>
            </ul>
            <p className="text-slate-600 dark:text-slate-400 pt-1 font-semibold">
              نحرص على جمع الحد الأدنى من البيانات اللازمة لتقديم الخدمة.
            </p>
          </div>
        </div>

        {/* Modal Action Buttons */}
        <div className="p-4 sm:p-5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 space-y-2.5">
          <button
            type="button"
            onClick={() => {
              onAccept();
              onClose();
            }}
            className="w-full py-3.5 px-4 bg-purple-600 hover:bg-purple-700 text-white font-extrabold rounded-2xl text-sm transition-all shadow-md shadow-purple-600/25 active:scale-[0.99] cursor-pointer"
          >
            أوافق على جميع الشروط والسياسات
          </button>
          <button
            type="button"
            onClick={onClose}
            className="w-full py-3 px-4 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold rounded-2xl text-sm transition-all cursor-pointer"
          >
            إلغاء
          </button>
        </div>
      </div>
    </div>
  );
};

export default TermsModal;
