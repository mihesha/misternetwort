import React from 'react';
import { Printer, Zap } from 'lucide-react';
import { ActiveNetwork } from '../../../types';

interface InventoryViewProps {
  isDarkMode: boolean;
  activeNetworks: ActiveNetwork[];
  cardBatchNetId: string;
  setCardBatchNetId: (val: string) => void;
  cardBatchCategory: string;
  setCardBatchCategory: (val: string) => void;
  cardBatchCount: number;
  setCardBatchCount: (val: number) => void;
  handleGenerateCardsBatch: () => void;
  generatedBatch: any[];
}

export const InventoryView: React.FC<InventoryViewProps> = ({
  isDarkMode,
  activeNetworks,
  cardBatchNetId,
  setCardBatchNetId,
  cardBatchCategory,
  setCardBatchCategory,
  cardBatchCount,
  setCardBatchCount,
  handleGenerateCardsBatch,
  generatedBatch
}) => {
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Bulk Generator Card Panel */}
        <div
          className={`p-6 rounded-3xl border space-y-4 ${
            isDarkMode ? 'bg-[#121927] border-slate-800' : 'bg-white border-slate-200 shadow-sm'
          }`}
        >
          <div className="flex items-center gap-2 text-indigo-400">
            <Printer className="w-5 h-5" />
            <h3 className="font-extrabold text-base text-white">مولد الكروت وطباعة الأرقام بالجملة</h3>
          </div>

          <p className="text-xs text-slate-400">
            قم بتوليد دفعة جديدة من الكروت لأي شبكة محددة وتصدير الرموز مباشرة لحساب الشبكة.
          </p>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block text-slate-300 mb-1 font-bold">اختر الشبكة المستهدفة:</label>
              <select
                value={cardBatchNetId}
                onChange={(e) => setCardBatchNetId(e.target.value)}
                className={`w-full px-3 py-2 rounded-xl border ${
                  isDarkMode ? 'bg-[#1d273a] border-slate-700 text-white' : 'bg-slate-50 border-slate-300'
                }`}
              >
                {activeNetworks.map((net) => (
                  <option key={net.id} value={net.id}>
                    {net.networkName} (كود #{net.networkCode})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-300 mb-1 font-bold">فئة الكروت (بالريال اليمني):</label>
              <select
                value={cardBatchCategory}
                onChange={(e) => setCardBatchCategory(e.target.value)}
                className={`w-full px-3 py-2 rounded-xl border ${
                  isDarkMode ? 'bg-[#1d273a] border-slate-700 text-white' : 'bg-slate-50 border-slate-300'
                }`}
              >
                <option value="100">فئة 100 ريال (100 MB / 2 ساعات)</option>
                <option value="200">فئة 200 ريال (300 MB / 6 ساعات)</option>
                <option value="500">فئة 500 ريال (1,000 MB / 24 ساعة)</option>
                <option value="1000">فئة 1000 ريال (2,500 MB / 3 أيام)</option>
                <option value="2000">فئة 2000 ريال (6,000 MB / 7 أيام)</option>
                <option value="5000">فئة 5000 ريال (20,000 MB / 30 يوم)</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-300 mb-1 font-bold">عدد الكروت المطلوبة:</label>
              <input
                type="number"
                min={10}
                max={500}
                value={cardBatchCount}
                onChange={(e) => setCardBatchCount(Number(e.target.value))}
                className={`w-full px-3 py-2 rounded-xl border ${
                  isDarkMode ? 'bg-[#1d273a] border-slate-700 text-white' : 'bg-slate-50 border-slate-300'
                }`}
              />
            </div>

            <button
              onClick={handleGenerateCardsBatch}
              className="w-full py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-900/40 cursor-pointer flex items-center justify-center gap-2"
            >
              <Zap className="w-4 h-4" />
              <span>توليد الكروت والرموز الآن</span>
            </button>
          </div>
        </div>

        {/* Generated Batch Preview Grid */}
        <div
          className={`p-6 rounded-3xl border space-y-4 lg:col-span-2 ${
            isDarkMode ? 'bg-[#121927] border-slate-800' : 'bg-white border-slate-200 shadow-sm'
          }`}
        >
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-base text-white">معاينة دفعة الكروت المولدَة ({generatedBatch.length} كرت)</h3>
            {generatedBatch.length > 0 && (
              <button
                onClick={() => window.print()}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-indigo-300 text-xs font-bold flex items-center gap-1 cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>طباعة النموذج</span>
              </button>
            )}
          </div>

          {generatedBatch.length === 0 ? (
            <div className="text-center py-20 text-slate-500">
              اضغط على "توليد الكروت" لإنشاء رموز كروت جديدة واستعراض كشوفات الطباعة.
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 max-h-96 overflow-y-auto p-1 scrollbar-thin scrollbar-thumb-slate-800">
              {generatedBatch.map((card, i) => (
                <div
                  key={i}
                  className="p-3 rounded-2xl bg-slate-800/60 border border-slate-700 text-center font-mono space-y-1"
                >
                  <span className="text-[10px] text-slate-400 block">{card.serial}</span>
                  <span className="text-xs font-black text-amber-400 block tracking-wider">{card.pin}</span>
                  <span className="text-[9px] text-emerald-400 block font-sans">فئة {cardBatchCategory} ر.ي</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
