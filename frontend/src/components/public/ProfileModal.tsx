'use client';

import React from 'react';
import { ShieldCheck, LogOut, CheckCircle2, Wallet, Phone } from 'lucide-react';
import Modal from '@/components/common/Modal';
import Button from '@/components/common/Button';
import { UserAccount } from '@/types';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserAccount | null;
  onLogout: () => void;
  onOpenPurchases?: () => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  onClose,
  user,
  onLogout,
  onOpenPurchases,
}) => {
  if (!user) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="md">
      <div className="space-y-5 text-right dir-rtl">
        {/* Profile Card Header */}
        <div className="flex items-center gap-4 bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 p-5 rounded-3xl text-white shadow-lg border border-purple-800/40">
          <div className="w-14 h-14 rounded-2xl bg-purple-600 text-white flex items-center justify-center text-2xl font-black shadow-lg shrink-0">
            {user.fullName ? user.fullName.charAt(0) : 'ع'}
          </div>
          <div className="space-y-1 min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="text-lg sm:text-xl font-black truncate">{user.fullName || 'عميل كارد بوكس'}</h2>
              <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-emerald-500/30 flex items-center gap-1 shrink-0">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                <span>حساب مفعل</span>
              </span>
            </div>
            <p dir="ltr" className="text-xs text-purple-200 font-mono text-right flex items-center gap-1">
              <Phone className="w-3 h-3 text-purple-300" />
              <span>{user.phone || '+967 770000000'}</span>
            </p>
          </div>
        </div>

        {/* User Details Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-slate-50 dark:bg-slate-900/80 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-1">
            <span className="text-slate-500 dark:text-slate-400 text-xs flex items-center gap-1.5 font-semibold">
              <ShieldCheck className="w-4 h-4 text-purple-600" />
              <span>نوع الحساب</span>
            </span>
            <p className="text-sm sm:text-base font-black text-slate-900 dark:text-slate-100">حساب شخصي</p>
          </div>

          <div className="bg-slate-50 dark:bg-slate-900/80 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-1">
            <span className="text-slate-500 dark:text-slate-400 text-xs flex items-center gap-1.5 font-semibold">
              <Wallet className="w-4 h-4 text-emerald-600" />
              <span>الرصيد المتاح</span>
            </span>
            <p className="text-sm sm:text-base font-black text-emerald-600 dark:text-emerald-400">
              {user.balance !== undefined ? user.balance.toLocaleString('ar-YE') : '0'} ر.ي
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
          {onOpenPurchases && (
            <Button
              variant="outline"
              size="md"
              onClick={() => {
                onClose();
                onOpenPurchases();
              }}
              className="w-full justify-center rounded-2xl font-bold py-3"
            >
              عرض سجل مشترياتي
            </Button>
          )}

          <Button
            variant="danger"
            size="md"
            onClick={() => {
              onClose();
              onLogout();
            }}
            icon={<LogOut className="w-4 h-4" />}
            className="w-full justify-center rounded-2xl font-bold py-3 bg-red-600 hover:bg-red-700 text-white"
          >
            تسجيل الخروج
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default ProfileModal;
