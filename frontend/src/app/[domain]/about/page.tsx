'use client';

import React from 'react';
import { ShieldCheck, Zap, HeartHandshake } from 'lucide-react';
import CardBoxLogo from '@/components/common/CardBoxLogo';

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-8 py-6 text-right dir-rtl">
      {/* Hero Intro */}
      <div className="bg-gradient-to-br from-purple-900 to-indigo-950 text-white rounded-3xl p-8 sm:p-12 shadow-xl relative overflow-hidden text-center space-y-4 flex flex-col items-center">
        <CardBoxLogo size="xl" showText={false} />
        <h1 className="text-2xl sm:text-4xl font-black">Card Box كارد بوكس</h1>
        <p className="text-sm sm:text-base text-purple-200 max-w-2xl mx-auto leading-relaxed">
          المنصة الأولى المعتمدة لتوزيع وشراء كروت إنترنت شبكات الواي فاي والدفع الفوري عبر جميع المحافظ الإلكترونية اليمنية بدون الحاجة لإنترنت مسبق.
        </p>
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-400 flex items-center justify-center">
            <Zap className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">سرعة وتسليم فوري</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            تصلك أرقام الكروت وتتولد الشفرات آلياً فور تأكيد التحويل عبر المحفظة خلال ثوانٍ.
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">أمان وموثوقية عالية</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            أنظمة مطابقة مالية دقيقة تضمن لك عدم ضياع أي حوالة واسترداد سريع في حال حدوث أي خطأ.
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400 flex items-center justify-center">
            <HeartHandshake className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">تغطية وشراكات واسعة</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            دعم كامل لكافة المحافظ المالية (سبأ كاش، بيس، ون كاش، جيب، فلوسك، ايزي، كاش، جوال).
          </p>
        </div>
      </div>
    </div>
  );
}
