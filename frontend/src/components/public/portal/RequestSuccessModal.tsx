import React from 'react';
import { Check, MessageCircle, X } from 'lucide-react';
import { NetworkApplication } from '../../../types';

interface RequestSuccessModalProps {
  application: NetworkApplication | null;
  onClose: () => void;
  isDarkMode: boolean;
}

export const RequestSuccessModal: React.FC<RequestSuccessModalProps> = ({
  application,
  onClose,
  isDarkMode,
}) => {
  if (!application) return null;

  const { formData } = application;

  const whatsappMessage = encodeURIComponent(
    `الرجاء الموافقة على الطلب\n` +
    `اسم الشبكة: ${formData.network.networkName}\n` +
    `رقم المالك: ${formData.owner.contactNumber || ''}`
  );

  const whatsappUrl = `https://wa.me/967777310606?text=${whatsappMessage}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div
        className={`relative w-full max-w-sm md:max-w-md rounded-2xl p-6 md:p-8 text-center shadow-2xl border transition-all ${
          isDarkMode
            ? 'bg-[#121a28] text-white border-slate-700/80'
            : 'bg-white text-slate-900 border-slate-200'
        }`}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 left-4 p-1.5 rounded-full hover:bg-slate-700/30 text-slate-400 hover:text-white transition-colors cursor-pointer"
          title="إغلاق"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Green Circle Check Icon */}
        <div className="w-14 h-14 bg-[#10b981] rounded-full flex items-center justify-center text-white mx-auto mb-4 shadow-lg shadow-emerald-500/20">
          <Check className="w-8 h-8 stroke-[3]" />
        </div>

        {/* Title */}
        <h3 className="text-xl md:text-2xl font-bold mb-3 tracking-wide">
          تم إرسال البيانات بنجاح
        </h3>

        {/* Subtitle / Instructions */}
        <p className="text-xs md:text-sm text-slate-300 leading-relaxed mb-6 font-medium px-2">
          يرجى تأكيد طلبك بإرسال طلب الموافقة الى الرقم{' '}
          <span className="font-bold text-white font-mono" dir="ltr">777310606</span>
        </p>

        {/* Confirm and Send WhatsApp Button */}
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={onClose}
          className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl text-base font-bold text-white bg-[#10b981] hover:bg-[#059669] active:bg-[#047857] transition-all shadow-lg shadow-emerald-900/40 cursor-pointer"
        >
          <svg className="w-5 h-5 fill-current shrink-0" viewBox="0 0 24 24">
            <path d="M12.012 2c-5.506 0-9.989 4.478-9.99 9.984a9.96 9.96 0 0 0 1.333 4.993L2 22l5.233-1.237a9.96 9.96 0 0 0 4.779 1.217h.004c5.505 0 9.988-4.478 9.989-9.984.001-2.662-1.033-5.166-2.915-7.049A9.914 9.914 0 0 0 12.012 2zm0 1.664c4.588 0 8.322 3.731 8.322 8.32 0 2.222-.865 4.312-2.436 5.885a8.27 8.27 0 0 1-5.883 2.435h-.003a8.28 8.28 0 0 1-3.98-1.015l-.286-.17-2.96.7.77-2.885-.187-.298a8.29 8.29 0 0 1-1.272-4.417c0-4.589 3.733-8.32 8.321-8.32zm-3.57 3.555c-.217 0-.472.08-.718.354-.246.274-.942.921-.942 2.247 0 1.325.967 2.605 1.101 2.784.134.18 1.902 2.903 4.608 4.07 2.249.97 2.707.777 3.197.731.491-.046 1.58-.646 1.803-1.268.223-.623.223-1.157.156-1.269-.067-.112-.246-.18-.514-.313-.268-.134-1.58-.78-1.826-.87-.246-.089-.425-.134-.603.134-.179.268-.692.87-.849 1.049-.156.179-.313.201-.581.067-.268-.134-1.132-.418-2.156-1.331-.796-.71-1.334-1.587-1.49-1.855-.156-.268-.017-.413.117-.546.121-.12.268-.313.402-.469.134-.156.179-.268.268-.446.089-.179.045-.335-.022-.469-.067-.134-.603-1.451-.826-1.986-.217-.522-.437-.451-.603-.459-.156-.008-.335-.008-.514-.008z" />
          </svg>
          <span>تأكيد وإرسال</span>
        </a>
      </div>
    </div>
  );
};

