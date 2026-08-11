import React from 'react';
import { Router as RouterIcon, Check, Copy } from 'lucide-react';

interface MikrotikViewProps {
  isDarkMode: boolean;
  mikrotikIpInput: string;
  setMikrotikIpInput: (val: string) => void;
  mikrotikUserInput: string;
  setMikrotikUserInput: (val: string) => void;
  mikrotikPassInput: string;
  setMikrotikPassInput: (val: string) => void;
  mikrotikGlobalPort: string;
  copiedScript: boolean;
  setCopiedScript: (val: boolean) => void;
}

export const MikrotikView: React.FC<MikrotikViewProps> = ({
  isDarkMode,
  mikrotikIpInput,
  setMikrotikIpInput,
  mikrotikUserInput,
  setMikrotikUserInput,
  mikrotikPassInput,
  setMikrotikPassInput,
  mikrotikGlobalPort,
  copiedScript,
  setCopiedScript
}) => {
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div
        className={`p-6 rounded-3xl border space-y-4 ${
          isDarkMode ? 'bg-[#121927] border-slate-800' : 'bg-white border-slate-200'
        }`}
      >
        <div className="flex items-center gap-2 text-indigo-400">
          <RouterIcon className="w-6 h-6" />
          <div>
            <h3 className="text-lg font-black text-white">إعدادات وسكربتات المايكروتك RouterOS</h3>
            <p className="text-xs text-slate-400">توليد كود السكربت الآلي للربط مع سيرفرات المايكروتك وبوابة Hotspot</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div>
            <label className="block text-slate-300 mb-1 font-bold">عنوان سيرفر المايكروتك IP:</label>
            <input
              type="text"
              value={mikrotikIpInput}
              onChange={(e) => setMikrotikIpInput(e.target.value)}
              className={`w-full px-3 py-2 rounded-xl border ${
                isDarkMode ? 'bg-[#1d273a] border-slate-700 text-white' : 'bg-slate-50 border-slate-300'
              }`}
            />
          </div>

          <div>
            <label className="block text-slate-300 mb-1 font-bold">اسم مستخدم API Admin:</label>
            <input
              type="text"
              value={mikrotikUserInput}
              onChange={(e) => setMikrotikUserInput(e.target.value)}
              className={`w-full px-3 py-2 rounded-xl border ${
                isDarkMode ? 'bg-[#1d273a] border-slate-700 text-white' : 'bg-slate-50 border-slate-300'
              }`}
            />
          </div>

          <div>
            <label className="block text-slate-300 mb-1 font-bold">كلمة مرور API:</label>
            <input
              type="password"
              value={mikrotikPassInput}
              onChange={(e) => setMikrotikPassInput(e.target.value)}
              className={`w-full px-3 py-2 rounded-xl border ${
                isDarkMode ? 'bg-[#1d273a] border-slate-700 text-white' : 'bg-slate-50 border-slate-300'
              }`}
            />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-400 font-mono">سكربت التهيئة الفورية (Winbox Terminal Script):</span>
            <button
              onClick={() => {
                navigator.clipboard.writeText(
                  `/ip hotspot profile set default rate-limit=1M/2M\\n/ip service enable api port=8728\\n/user add name="${mikrotikUserInput}" password="${mikrotikPassInput}" group=full comment="Karoot System API"`
                );
                setCopiedScript(true);
                setTimeout(() => setCopiedScript(false), 2000);
              }}
              className="px-3 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold cursor-pointer flex items-center gap-1"
            >
              {copiedScript ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedScript ? 'تم النسخ!' : 'نسخ السكربت'}</span>
            </button>
          </div>
          <pre className="text-xs font-mono text-emerald-400 overflow-x-auto p-3 bg-black/60 rounded-xl leading-relaxed">
{`/ip hotspot profile set default rate-limit=1M/2M
/ip service enable api port=${mikrotikGlobalPort}
/user add name="${mikrotikUserInput}" password="${mikrotikPassInput}" group=full comment="Karoot System Central Connector"`}
          </pre>
        </div>
      </div>
    </div>
  );
};
