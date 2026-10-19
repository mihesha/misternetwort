"use client";
import React, { useState } from 'react';
import { useAgentContext } from '../../context/AgentContext';
import { useAppContext } from '../../context/AppContext';
import { 
  Link2, 
  Copy, 
  Check, 
  Share2, 
  QrCode, 
  Download, 
  X, 
  ExternalLink, 
  Sparkles, 
  ShieldCheck, 
  Clock, 
  Network,
  MessageCircle
} from 'lucide-react';

interface AgentReferralCardProps {
  compact?: boolean;
}

export const AgentReferralCard: React.FC<AgentReferralCardProps> = ({ compact = false }) => {
  const { isDarkMode } = useAppContext();
  const { agentName, referralCode, referralUrl, stats } = useAgentContext();
  const [copied, setCopied] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);

  const fallbackOrigin = typeof window !== 'undefined' ? window.location.origin : 'https://cardbox.app';
  const effectiveCode = referralCode || (stats?.referral_code ?? '');
  const effectiveUrl = referralUrl || (effectiveCode ? `${fallbackOrigin}/join?ref=${effectiveCode}` : '');

  const handleCopy = async () => {
    if (!effectiveUrl) return;
    try {
      await navigator.clipboard.writeText(effectiveUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback
      const input = document.createElement('input');
      input.value = effectiveUrl;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleWhatsAppShare = () => {
    if (!effectiveUrl) return;
    const greeting = agentName ? `معكم الوكيل المعتمد / ${agentName}` : 'من منصة كارد بوكس';
    const message = `السلام عليكم ورحمة الله وبركاته 🌹\n\n${greeting}، أدعوك للانضمام إلى منصة كارد بوكس لأتمتة بيع كروت شبكتك إلكترونياً واستلام أرباحك ومبيعاتك بأمان وسرعة فائقة.\n\nيمكنك تقديم طلب الانضمام لشبكتك مباشرة عبر رابط الإحالة المعتمد الخاص بي:\n${effectiveUrl}\n\nنسعد بانضمامك وشراكتك معنا!`;
    const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const qrImageUrl = effectiveUrl 
    ? `https://api.qrserver.com/v1/create-qr-code/?size=350x350&data=${encodeURIComponent(effectiveUrl)}&format=svg&qzone=2`
    : '';

  const handleDownloadQr = async () => {
    if (!qrImageUrl) return;
    try {
      const res = await fetch(qrImageUrl);
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `cardbox-referral-${effectiveCode || 'agent'}.svg`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch {
      window.open(qrImageUrl, '_blank');
    }
  };

  if (!effectiveCode && !stats) {
    return null;
  }

  return (
    <>
      <div 
        className={`relative overflow-hidden rounded-3xl border transition-all duration-300 ${
          isDarkMode 
            ? 'bg-[#101726]/90 border-indigo-500/20 shadow-2xl shadow-indigo-950/30' 
            : 'bg-white border-indigo-100 shadow-xl shadow-indigo-500/5'
        } ${compact ? 'p-5' : 'p-6 md:p-8'}`}
      >
        {/* Glow Decor Background */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-56 h-56 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-56 h-56 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col gap-6">
          
          {/* Header Row */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-linear-to-tr from-indigo-600 to-purple-600 text-white flex items-center justify-center shadow-lg shadow-indigo-500/30 shrink-0">
                <Link2 className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className={`font-black tracking-tight ${compact ? 'text-lg' : 'text-xl md:text-2xl'} ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                    رابط إحالة ملاك الشبكات
                  </h2>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-500/10 text-indigo-500 border border-indigo-500/20">
                    <Sparkles className="w-3 h-3" />
                    <span>مباشر</span>
                  </span>
                </div>
                <p className={`text-xs md:text-sm mt-1 font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                  أرسل هذا الرابط لملاك الشبكات ليسجلوا بأنفسهم، وسيتم ربطهم بحسابك تلقائياً واحتساب عمولاتك.
                </p>
              </div>
            </div>

            {/* Agent Code Badge */}
            <div className="self-start sm:self-center">
              <div className={`px-4 py-2 rounded-xl border flex items-center gap-2 ${
                isDarkMode 
                  ? 'bg-indigo-950/40 border-indigo-500/30 text-indigo-300' 
                  : 'bg-indigo-50/70 border-indigo-200 text-indigo-700'
              }`}>
                <ShieldCheck className="w-4 h-4 text-indigo-500" />
                <span className="text-xs font-bold">كود الوكيل:</span>
                <span className="font-mono font-black text-sm tracking-wider" dir="ltr">
                  {effectiveCode || '...'}
                </span>
              </div>
            </div>
          </div>

          {/* Link Box & Action Controls */}
          <div className="flex flex-col lg:flex-row gap-3">
            <div className="relative flex-1 group">
              <div className={`flex items-center w-full px-4 py-3.5 rounded-2xl border text-sm font-mono font-bold transition-all ${
                isDarkMode 
                  ? 'bg-[#182234] border-slate-700 text-slate-200 focus-within:border-indigo-500' 
                  : 'bg-slate-50 border-slate-200 text-slate-800 focus-within:border-indigo-500'
              }`}>
                <span className="w-full truncate text-right font-mono" dir="ltr">
                  {effectiveUrl || 'جاري تحميل الرابط...'}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap sm:flex-nowrap items-center gap-2">
              <button
                type="button"
                onClick={handleCopy}
                disabled={!effectiveUrl}
                className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl text-sm font-black transition-all shadow-md active:scale-95 ${
                  copied 
                    ? 'bg-emerald-600 text-white shadow-emerald-500/30' 
                    : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-500/25'
                }`}
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>تم النسخ!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>نسخ الرابط</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleWhatsAppShare}
                disabled={!effectiveUrl}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl text-sm font-black text-white bg-emerald-600 hover:bg-emerald-500 transition-all shadow-md shadow-emerald-600/25 active:scale-95"
                title="مشاركة عبر واتساب"
              >
                <MessageCircle className="w-4 h-4" />
                <span>واتساب</span>
              </button>

              <button
                type="button"
                onClick={() => setShowQrModal(true)}
                disabled={!effectiveUrl}
                className={`p-3.5 rounded-2xl border transition-all flex items-center justify-center active:scale-95 ${
                  isDarkMode 
                    ? 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-700 hover:text-white' 
                    : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
                }`}
                title="عرض رمز QR"
              >
                <QrCode className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Quick Metrics / Reassurance */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-200/60 dark:border-slate-800 text-xs">
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-1.5 font-bold">
                <Network className="w-4 h-4 text-indigo-500" />
                <span className={isDarkMode ? 'text-slate-400' : 'text-slate-500'}>الشبكات المعتمدة:</span>
                <span className={`font-black text-sm ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                  {stats?.total_networks ?? 0}
                </span>
              </div>

              {(stats?.pending_networks ?? 0) > 0 && (
                <div className="flex items-center gap-1.5 font-bold">
                  <Clock className="w-4 h-4 text-amber-500" />
                  <span className={isDarkMode ? 'text-slate-400' : 'text-slate-500'}>طلبات قيد المراجعة:</span>
                  <span className="font-black text-sm text-amber-500">
                    {stats?.pending_networks}
                  </span>
                </div>
              )}
            </div>

            <div className={`flex items-center gap-1.5 font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>يتم احتساب عمولتك تلقائياً عن كل كرت يُباع في الشبكات المحالة</span>
            </div>
          </div>

        </div>
      </div>

      {/* QR Code Modal */}
      {showQrModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200" 
            onClick={() => setShowQrModal(false)} 
          />
          <div className={`relative w-full max-w-sm rounded-3xl p-6 shadow-2xl border text-center animate-in zoom-in-95 duration-200 ${
            isDarkMode 
              ? 'bg-[#141d2b] border-slate-800 text-white' 
              : 'bg-white border-slate-200 text-slate-900'
          }`}>
            <button
              onClick={() => setShowQrModal(false)}
              className={`absolute top-4 left-4 p-2 rounded-xl transition-colors ${
                isDarkMode ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-slate-100 text-slate-500'
              }`}
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-12 h-12 mx-auto mb-3 rounded-2xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
              <QrCode className="w-6 h-6" />
            </div>

            <h3 className="text-lg font-black mb-1">رمز الاستجابة السريعة (QR)</h3>
            <p className={`text-xs mb-5 font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              امسح الرمز بكاميرا الجوال للانتقال لصفحة الانضمام برابط إحالتك
            </p>

            <div className="p-4 bg-white rounded-2xl shadow-inner border border-slate-200 inline-block mb-4">
              <img 
                src={qrImageUrl} 
                alt="Referral QR Code" 
                className="w-56 h-56 object-contain rounded-lg"
              />
            </div>

            <div className="text-xs font-mono font-bold mb-5 p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400">
              كود الوكيل: {effectiveCode}
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleDownloadQr}
                className="flex-1 py-3 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white transition-all active:scale-95 shadow-md shadow-indigo-600/30"
              >
                <Download className="w-4 h-4" />
                <span>تحميل الصورة</span>
              </button>

              <button
                type="button"
                onClick={handleCopy}
                className={`py-3 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all border ${
                  copied 
                    ? 'bg-emerald-500 text-white border-emerald-500' 
                    : isDarkMode 
                    ? 'bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700' 
                    : 'bg-slate-100 border-slate-200 text-slate-800 hover:bg-slate-200'
                }`}
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? 'تم النسخ' : 'نسخ الرابط'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
