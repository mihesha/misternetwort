'use client';

import React, { useState } from 'react';
import { Headphones, MessageSquare, PhoneCall, X, HelpCircle, ChevronLeft } from 'lucide-react';
import { FAQS } from '@/data/public-content';

interface SupportWidgetProps {
  whatsappNumber?: string;
  isOpen?: boolean;
  onClose?: () => void;
  onToggle?: () => void;
}

export const SupportWidget: React.FC<SupportWidgetProps> = ({
  whatsappNumber = '967770000000',
  isOpen: externalIsOpen,
  onClose,
  onToggle,
}) => {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const [activeFaq, setActiveFaq] = useState<string | null>(null);

  const isOpen = externalIsOpen !== undefined ? externalIsOpen : internalIsOpen;

  const handleToggle = () => {
    if (externalIsOpen !== undefined) {
      if (isOpen && onClose) onClose();
      if (!isOpen && onToggle) onToggle();
    } else {
      setInternalIsOpen(!internalIsOpen);
    }
  };

  const handleClose = () => {
    if (externalIsOpen !== undefined) {
      if (onClose) onClose();
    } else {
      setInternalIsOpen(false);
    }
  };

  return (
    <>
      {/* Floating Customer Support Button */}
      <div className="fixed bottom-20 sm:bottom-24 left-4 sm:left-6 z-50">
        <button
          onClick={handleToggle}
          className="w-13 h-13 sm:w-14 sm:h-14 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white flex items-center justify-center shadow-2xl shadow-purple-600/40 hover:scale-105 active:scale-95 transition-all duration-300 ring-4 ring-purple-500/20 cursor-pointer group"
          aria-label="الدعم الفني والخدمة المباشرة"
          title="الدعم الفني والمساعدة"
        >
          {isOpen ? (
            <X className="w-6 h-6" />
          ) : (
            <div className="relative flex items-center justify-center">
              <Headphones className="w-6 h-6 transition-transform group-hover:scale-110" />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full ring-2 ring-purple-600 animate-pulse" />
            </div>
          )}
        </button>
      </div>

      {/* Floating Panel */}
      {isOpen && (
        <div className="fixed bottom-36 sm:bottom-40 left-4 sm:left-6 z-50 w-80 sm:w-96 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl p-5 text-right dir-rtl space-y-4 animate-in fade-in slide-in-from-bottom-5 duration-200">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-400 rounded-xl">
                <Headphones className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-extrabold text-slate-900 dark:text-slate-100 text-sm">
                  خدمة العملاء - Card Box كارد بوكس
                </h4>
                <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping inline-block" />
                  متاحون للمساعدة 24/7
                </p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Contact Direct Options */}
          <div className="grid grid-cols-2 gap-2">
            <a
              href={`https://wa.me/${whatsappNumber}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 hover:bg-emerald-100 text-emerald-700 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800 text-xs font-bold transition-all"
            >
              <MessageSquare className="w-4 h-4 text-emerald-600" />
              <span>واتساب مباشر</span>
            </a>
            <a
              href={`tel:+${whatsappNumber}`}
              className="flex items-center justify-center gap-2 p-3 rounded-2xl bg-purple-50 dark:bg-purple-950/50 hover:bg-purple-100 text-purple-700 dark:text-purple-300 border border-purple-200/80 dark:border-purple-800 text-xs font-bold transition-all"
            >
              <PhoneCall className="w-4 h-4 text-purple-600" />
              <span>اتصال هاتفي</span>
            </a>
          </div>

          {/* Quick FAQs */}
          <div className="space-y-2 pt-1">
            <h5 className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <HelpCircle className="w-3.5 h-3.5 text-purple-600" />
              <span>أسئلة شائعة وإجابات سريعة:</span>
            </h5>

            <div className="space-y-1.5 max-h-48 overflow-y-auto no-scrollbar text-xs">
              {FAQS.slice(0, 3).map((faq) => (
                <div
                  key={faq.id}
                  className="bg-slate-50 dark:bg-slate-800/60 rounded-xl p-2.5 border border-slate-200/60 dark:border-slate-800"
                >
                  <button
                    type="button"
                    onClick={() => setActiveFaq(activeFaq === faq.id ? null : faq.id)}
                    className="w-full flex items-center justify-between text-right font-semibold text-slate-800 dark:text-slate-200 gap-2"
                  >
                    <span>{faq.question}</span>
                    <ChevronLeft
                      className={`w-3.5 h-3.5 text-slate-400 shrink-0 transition-transform ${
                        activeFaq === faq.id ? '-rotate-90' : ''
                      }`}
                    />
                  </button>
                  {activeFaq === faq.id && (
                    <p className="mt-2 pt-2 border-t border-slate-200/60 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-[11px] leading-relaxed">
                      {faq.answer}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SupportWidget;
