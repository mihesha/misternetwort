import React from 'react';

interface SettingsViewProps {
  isDarkMode: boolean;
  platformCommissionType?: 'fixed' | 'percentage';
  setPlatformCommissionType?: (val: 'fixed' | 'percentage') => void;
  platformCommissionRate: number;
  setPlatformCommissionRate: (val: number) => void;
  supportPhone: string;
  setSupportPhone: (val: string) => void;
  maintenanceMode: boolean;
  setMaintenanceMode: (val: boolean) => void;
  autoApproveApplications: boolean;
  setAutoApproveApplications: (val: boolean) => void;
  handleSaveSettings: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  isDarkMode,
  platformCommissionType,
  setPlatformCommissionType,
  platformCommissionRate,
  setPlatformCommissionRate,
  supportPhone,
  setSupportPhone,
  maintenanceMode,
  setMaintenanceMode,
  autoApproveApplications,
  setAutoApproveApplications,
  handleSaveSettings
}) => {
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div
        className={`p-6 rounded-3xl border space-y-6 ${
          isDarkMode ? 'bg-[#121927] border-slate-800' : 'bg-white border-slate-200'
        }`}
      >
        <div>
          <h3 className="text-lg font-black text-white">إعدادات المنظومة الشاملة</h3>
          <p className="text-xs text-slate-400">تعديل نسبة العمولة، هواتف الدعم الفني، ووضع الصيانة</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
          <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-700/60 space-y-3">
            <div className="flex items-center gap-2 mb-2">
              <label className="text-slate-200 font-bold">نوع العمولة:</label>
              <select
                value={platformCommissionType || 'fixed'}
                onChange={(e) => setPlatformCommissionType && setPlatformCommissionType(e.target.value as 'fixed' | 'percentage')}
                className={`px-2 py-1 rounded-lg border text-[11px] font-bold ${
                  isDarkMode ? 'bg-[#1d273a] border-slate-700 text-white' : 'bg-slate-50 border-slate-300'
                }`}
              >
                <option value="fixed">مبلغ ثابت (ر.ي)</option>
                <option value="percentage">نسبة مئوية (%)</option>
              </select>
            </div>
            <label className="block text-slate-200 font-bold">
              {platformCommissionType === 'fixed' ? 'قيمة العمولة (لكل عملية):' : 'نسبة العمولة من إجمالي البيع:'}
            </label>
            <input
              type="number"
              step={platformCommissionType === 'fixed' ? '1' : '0.5'}
              value={platformCommissionRate}
              onChange={(e) => setPlatformCommissionRate(Number(e.target.value))}
              className={`w-full px-3.5 py-2.5 rounded-xl border ${
                isDarkMode ? 'bg-[#1d273a] border-slate-700 text-white' : 'bg-slate-50 border-slate-300'
              }`}
            />
            <p className="text-[11px] text-slate-400">يتم اقتطاع هذه القيمة تلقائياً من إجمالي عمليات البيع بناءً على النوع المختار.</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-700/60 space-y-3">
            <label className="block text-slate-200 font-bold">رقم هاتف الدعم الفني (واتساب/اتصال):</label>
            <input
              type="text"
              value={supportPhone}
              onChange={(e) => setSupportPhone(e.target.value)}
              className={`w-full px-3.5 py-2.5 rounded-xl border ${
                isDarkMode ? 'bg-[#1d273a] border-slate-700 text-white' : 'bg-slate-50 border-slate-300'
              }`}
            />
            <p className="text-[11px] text-slate-400">يظهر لمالكي الشبكات في لوحة التحكم وتأكيدات السحب.</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-700/60 flex items-center justify-between">
            <div>
              <span className="block font-bold text-slate-200">وضع الصيانة الشاملة:</span>
              <span className="text-[11px] text-slate-400">إيقاف عمليات الشراء المؤقتة لأعمال الصيانة</span>
            </div>
            <button
              onClick={() => setMaintenanceMode(!maintenanceMode)}
              className={`px-4 py-2 rounded-xl text-xs font-bold cursor-pointer ${
                maintenanceMode ? 'bg-rose-600 text-white' : 'bg-slate-700 text-slate-300'
              }`}
            >
              {maintenanceMode ? 'مفعل (الصيانة ناتجة)' : 'معطل (النظام يعمل)'}
            </button>
          </div>

          <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-700/60 flex items-center justify-between">
            <div>
              <span className="block font-bold text-slate-200">الاعتماد التلقائي للطلبات:</span>
              <span className="text-[11px] text-slate-400">تفعيل طلبات الانضمام فور الإرسال</span>
            </div>
            <button
              onClick={() => setAutoApproveApplications(!autoApproveApplications)}
              className={`px-4 py-2 rounded-xl text-xs font-bold cursor-pointer ${
                autoApproveApplications ? 'bg-emerald-600 text-white' : 'bg-slate-700 text-slate-300'
              }`}
            >
              {autoApproveApplications ? 'مفعل' : 'معطل (مراجعة يدوية)'}
            </button>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-800">
          <button
            onClick={handleSaveSettings}
            className="px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-900/30 cursor-pointer"
          >
            حفظ كافة التغييرات
          </button>
        </div>
      </div>
    </div>
  );
};
