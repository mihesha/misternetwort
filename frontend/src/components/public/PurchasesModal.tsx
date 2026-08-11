'use client';

import React, { useState } from 'react';
import { History, Copy, Check, Zap, ShoppingBag, Search, Hash } from 'lucide-react';
import Modal from '@/components/common/Modal';
import Button from '@/components/common/Button';
import { OrderDetails, GeneratedCard } from '@/types';

interface PurchasesModalProps {
  isOpen: boolean;
  onClose: () => void;
  orders?: OrderDetails[];
  onStartShopping?: () => void;
}


export const PurchasesModal: React.FC<PurchasesModalProps> = ({
  isOpen,
  onClose,
  orders = [],
  onStartShopping,
}) => {
  const [copiedPin, setCopiedPin] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const allCards: { card: GeneratedCard; date: string; orderId: string }[] = [];

  orders.forEach((ord) => {
    ord.generatedCards.forEach((c) => {
      allCards.push({
        card: c,
        date: ord.date,
        orderId: ord.orderId,
      });
    });
  });

  const cardsToDisplay = allCards;

  const filteredCards = cardsToDisplay.filter(
    (item) =>
      item.card.packageName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.card.pinCode.includes(searchQuery) ||
      item.card.serialNumber.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCopyPin = (pin: string) => {
    navigator.clipboard.writeText(pin);
    setCopiedPin(pin);
    setTimeout(() => setCopiedPin(null), 2000);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="lg">
      <div className="space-y-5 text-right dir-rtl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900 dark:text-slate-100">مشترياتي</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                سجل كروت الواي فاي المشتراة وتفاصيل الأكواد
              </p>
            </div>
          </div>
          <span className="text-xs font-bold bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 px-3 py-1 rounded-full">
            {cardsToDisplay.length} {cardsToDisplay.length === 1 ? 'كرت' : 'كروت'}
          </span>
        </div>

        {/* Search Input */}
        {cardsToDisplay.length > 0 && (
          <div className="relative">
            <input
              type="text"
              placeholder="ابحث باسم الباقة أو الرمز..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 text-xs sm:text-sm rounded-2xl p-3 pr-10 text-right focus:outline-none focus:border-purple-500 transition-colors"
            />
            <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-3.5 pointer-events-none" />
          </div>
        )}

        {/* Cards List */}
        <div className="space-y-3.5 max-h-[60vh] overflow-y-auto no-scrollbar pr-1">
          {filteredCards.length > 0 ? (
            filteredCards.map((item, idx) => (
              <div
                key={idx}
                className="bg-gradient-to-br from-slate-900 to-slate-950 text-white p-5 rounded-3xl border border-purple-500/30 shadow-lg relative overflow-hidden space-y-3"
              >
                {/* Package header */}
                <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-amber-400" />
                    <span className="font-extrabold text-sm sm:text-base">{item.card.packageName}</span>
                    <span className="text-[11px] text-purple-300 bg-purple-900/60 px-2 py-0.5 rounded-md font-medium">
                      {item.orderId || 'شبكة'}
                    </span>
                  </div>
                  <span className="text-xs text-slate-400 font-mono flex items-center gap-1">
                    <Hash className="w-3 h-3" />
                    <span>{item.card.serialNumber}</span>
                  </span>
                </div>

                {/* PIN box */}
                <div className="bg-black/50 p-4 rounded-2xl flex items-center justify-between gap-3 border border-purple-500/20">
                  <div>
                    <span className="text-[10px] text-slate-400 block mb-0.5">رمز الكرت:</span>
                    <span className="text-lg sm:text-2xl font-mono font-black text-amber-300 tracking-wider">
                      {item.card.pinCode}
                    </span>
                  </div>
                  <button
                    onClick={() => handleCopyPin(item.card.pinCode)}
                    className="px-3.5 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-all shrink-0 active:scale-95 shadow-md"
                  >
                    {copiedPin === item.card.pinCode ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>تم النسخ</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>نسخ</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Specs */}
                <div className="flex items-center justify-between text-xs text-slate-300 pt-1">
                  <span>الحجم: <strong className="text-white">{item.card.dataSize}</strong></span>
                  <span>المدة: <strong className="text-white">{item.card.duration}</strong></span>
                  <span>الصلاحية: <strong className="text-white">{item.card.expireDate}</strong></span>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-10 space-y-3">
              <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-900 text-slate-400 flex items-center justify-center mx-auto">
                <ShoppingBag className="w-6 h-6" />
              </div>
              <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
                لا توجد كروت مشتراة مطابقة للبحث
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <Button variant="outline" size="sm" onClick={onClose} className="rounded-xl">
            إغلاق
          </Button>
          {onStartShopping && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                onClose();
                onStartShopping();
              }}
              icon={<ShoppingBag className="w-4 h-4" />}
              className="bg-purple-600 hover:bg-purple-700 text-white rounded-xl"
            >
              شراء كروت جديدة
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default PurchasesModal;
