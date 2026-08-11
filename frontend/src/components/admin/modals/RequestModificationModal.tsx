import React from 'react';
import { X, FileEdit } from 'lucide-react';
import { useAdminContext } from '../../../context/AdminContext';
import { useAdminActions } from '../../../hooks/useAdminActions';

export const RequestModificationModal = () => {
  const { requestModifyApp, setRequestModifyApp, modificationReasonText, setModificationReasonText } = useAdminContext();
  const { handleConfirmRequestModify } = useAdminActions();

  if (!requestModifyApp) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#121927] border border-amber-500/40 rounded-3xl p-6 max-w-lg w-full space-y-4 shadow-2xl shadow-amber-950/40 animate-in fade-in duration-200">
        <div className="flex justify-between items-center border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <FileEdit className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-white text-base">طلب تعديل البيانات من المالك 📝</h3>
              <p className="text-xs text-slate-400">شبكة: {requestModifyApp.formData.network.networkName} (مرجع: {requestModifyApp.referenceNumber})</p>
            </div>
          </div>
          <button onClick={() => setRequestModifyApp(null)} className="text-slate-400 hover:text-white p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-3 text-xs">
          <div>
            <label className="block text-slate-200 font-bold mb-1.5">
              اكتب ملاحظات التعديل المطلوبة ليرسلها النظام للمالك عبر الواتساب:
            </label>
            <textarea
              rows={4}
              value={modificationReasonText}
              onChange={(e) => setModificationReasonText(e.target.value)}
              placeholder="مثال: يرجى التأكد من سعر فئات الكروت، وتوضيح اسم المنطقة أو تصحيح رقم محفظة جيب..."
              className="w-full p-3.5 rounded-2xl bg-[#0b101a] border border-slate-700 text-white placeholder-slate-500 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-[11px] text-slate-400 space-y-1">
            <p>💡 <strong className="text-slate-300">ملاحظة:</strong> سيتم تحويل حالة الطلب إلى <span className="text-amber-400 font-bold">"مطلوب تعديل البيانات"</span> وسيتلقى المالك رابطاً مباشراً لتعديل حقول الطلب وإعادة إرساله للإدارة.</p>
          </div>
        </div>

        <div className="flex items-center gap-2 pt-2">
          <button
            type="button"
            onClick={handleConfirmRequestModify}
            className="flex-1 py-3 rounded-2xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs shadow-lg shadow-amber-900/40 cursor-pointer flex items-center justify-center gap-2 transition-all hover:scale-[1.01]"
          >
            <FileEdit className="w-4 h-4" />
            <span>تأكيد طلب التعديل وإرسال واتساب 💬</span>
          </button>
          <button
            type="button"
            onClick={() => setRequestModifyApp(null)}
            className="px-4 py-3 rounded-2xl bg-slate-800 text-slate-400 hover:text-white text-xs font-bold cursor-pointer"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
};
