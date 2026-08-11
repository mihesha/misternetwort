"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { KarootLogo } from '../components/common/Logos';
import {
  Wifi,
  CreditCard,
  Zap,
  ShieldCheck,
  Smartphone,
  CheckCircle2,
  ChevronLeft,
  Search,
  ArrowLeft,
  Users,
  Activity,
  Award,
  Wallet,
  Clock
} from 'lucide-react';
import { PublicHeader } from '../components/public/PublicHeader';

export default function CustomerLandingPage() {

  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0a0f1c] text-slate-900 dark:text-white selection:bg-indigo-500/30 font-sans overflow-x-hidden transition-colors duration-300" dir="rtl">
      
      {/* Navbar */}
      <PublicHeader />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute top-0 inset-x-0 h-full overflow-hidden -z-10 pointer-events-none">
          <div className="absolute -top-40 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl"></div>
          <div className="absolute top-40 -left-20 w-[30rem] h-[30rem] bg-violet-500/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-1/2 translate-x-1/2 w-full max-w-lg h-64 bg-blue-500/5 rounded-t-full blur-3xl"></div>
        </div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div 
            initial="hidden" 
            animate="visible" 
            variants={staggerContainer}
            className="flex flex-col items-center"
          >
            <motion.div variants={fadeIn} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20 text-indigo-700 dark:text-indigo-300 text-sm font-bold mb-8">
              <ShieldCheck className="w-4 h-4" />
              منصة رقمية موثوقة لبيع كروت الشبكات المحلية
            </motion.div>

            <motion.h1 variants={fadeIn} className="text-4xl md:text-6xl lg:text-7xl font-black tracking-tight text-slate-900 dark:text-white mb-6 leading-[1.2]">
              شراء وإدارة كروت الإنترنت
              <br className="hidden md:block" />
              أصبح <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-violet-500">أسرع وأوضح وأكثر احترافية</span>
            </motion.h1>

            <motion.p variants={fadeIn} className="max-w-2xl text-lg md:text-xl text-slate-600 dark:text-slate-400 mb-10 leading-relaxed font-medium">
              نوفر تجربة رقمية تربط العملاء بأصحاب شبكات الهوتسبوت من خلال واجهة سهلة لاختيار الشبكة والباقة، متابعة الطلب، واستلام بيانات الكرت بعد التحقق من الدفع.
            </motion.p>

            <motion.div variants={fadeIn} className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
              <Link href="/join" className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 rounded-full font-bold text-lg transition-all shadow-xl shadow-indigo-600/20 flex items-center justify-center gap-2 group">
                <Zap className="w-5 h-5 group-hover:scale-110 transition-transform" />
                <span>ابدأ واشتر كرتك</span>
              </Link>
              <Link href="/networks" className="w-full sm:w-auto bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 px-8 py-4 rounded-full font-bold text-lg transition-all flex items-center justify-center gap-2 group">
                <Search className="w-5 h-5 text-slate-400 group-hover:text-indigo-500 transition-colors" />
                <span>تصفح الشبكات</span>
              </Link>
            </motion.div>

            {/* Quick Stats Row */}
            <motion.div variants={fadeIn} className="mt-16 pt-8 border-t border-slate-200 dark:border-slate-800/50 w-full max-w-3xl flex flex-wrap justify-center gap-8 md:gap-16">
              <div className="flex flex-col items-center gap-2">
                <span className="text-3xl font-black text-slate-900 dark:text-white">+١٢٩</span>
                <span className="text-sm font-medium text-slate-500 dark:text-slate-400">شبكة نشطة</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <span className="text-3xl font-black text-slate-900 dark:text-white">+١٨,٧٢١</span>
                <span className="text-sm font-medium text-slate-500 dark:text-slate-400">كرت مباع</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <span className="text-3xl font-black text-slate-900 dark:text-white">+١١,٠٦٠</span>
                <span className="text-sm font-medium text-slate-500 dark:text-slate-400">عميل سعيد</span>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Stats Bento Grid */}
      <section id="features" className="py-20 bg-white dark:bg-[#0f172a]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white mb-4">منصتنا بالأرقام والنتائج الملموسة</h2>
            <p className="text-lg text-slate-600 dark:text-slate-400 font-medium">نحن فخورون بثقة عملائنا ومزودي الخدمة. إليك نظرة سريعة على حجم نشاطنا واستقرارنا العالي.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Zap, color: 'text-yellow-500', bg: 'bg-yellow-500/10', border: 'border-yellow-500/20', title: '+١٨,٧٢١', subtitle: 'كروت تسلم تلقائياً', desc: 'عملية الشراء والتسليم تتم في ثوانٍ معدودة دون أي تدخل بشري.' },
              { icon: Wifi, color: 'text-indigo-500', bg: 'bg-indigo-500/10', border: 'border-indigo-500/20', title: '+١٢٩', subtitle: 'شبكة هوتسبوت نشطة', desc: 'مزودو خدمة معتمدون يقدمون خدماتهم عبر منصتنا باستمرار.' },
              { icon: Activity, color: 'text-emerald-500', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', title: '99.99%', subtitle: 'معدل استقرار وقت تشغيل', desc: 'خوادم مستقرة وجاهزة لتلبية طلباتك في أي وقت.' },
              { icon: Users, color: 'text-blue-500', bg: 'bg-blue-500/10', border: 'border-blue-500/20', title: '+١١,٠٦٠', subtitle: 'عميل موثق ونشط', desc: 'يستخدمون منصتنا كخيارهم الأول لشراء كروت الإنترنت.' },
            ].map((stat, i) => (
              <div key={i} className="group relative bg-slate-50 dark:bg-slate-900 rounded-3xl p-8 border border-slate-100 dark:border-slate-800 hover:border-indigo-500/50 dark:hover:border-indigo-500/50 transition-colors overflow-hidden">
                <div className={`absolute -right-10 -top-10 w-32 h-32 rounded-full ${stat.bg} blur-3xl group-hover:scale-150 transition-transform duration-700`}></div>
                <div className={`w-12 h-12 rounded-2xl ${stat.bg} ${stat.color} border ${stat.border} flex items-center justify-center mb-6 relative z-10`}>
                  <stat.icon className="w-6 h-6" />
                </div>
                <div className="relative z-10">
                  <h3 className="text-3xl font-black text-slate-900 dark:text-white mb-2">{stat.title}</h3>
                  <h4 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-3">{stat.subtitle}</h4>
                  <p className="text-sm text-slate-600 dark:text-slate-400 font-medium leading-relaxed">{stat.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Solutions Section */}
      <section id="solutions" className="py-20 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-indigo-600 dark:text-indigo-400 font-bold text-sm tracking-wider uppercase mb-2 block">خدماتنا</span>
            <h2 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white mb-4">حلول متكاملة لبيع الكروت وتشغيل شبكات الهوتسبوت</h2>
            <p className="text-lg text-slate-600 dark:text-slate-400 font-medium">منصتنا توفر لك كل ما تحتاجه لتجربة شراء إنترنت سلسة وآمنة، سواء كنت مشترياً لكارت واحد أو موزعاً للبطاقات.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Search, title: 'تصفح وشراء كروت الإنترنت', desc: 'استعرض الشبكات المتاحة في منطقتك واختر الباقة الأنسب لك من حيث السعر والمدة، وقم بالشراء بضغطة زر وتصنيف دقيق.' },
              { icon: Zap, title: 'تسليم فوري وتلقائي للكروت', desc: 'لا داعي للانتظار! بمجرد إتمام عملية الدفع، ستستلم بيانات كرت الإنترنت فوراً على الشاشة ومع رسالة نصية.' },
              { icon: Wallet, title: 'محفظة رقمية مسبقة الدفع', desc: 'اشحن محفظتك الرقمية برصيد مسبق، واستخدمه لشراء الكروت بسهولة وسرعة دون الحاجة لإدخال بيانات الدفع كل مرة.' },
              { icon: Clock, title: 'سجل مشتريات محفوظ ودعم متكامل', desc: 'تتبع مشترياتك السابقة واسترجع بيانات الكروت النشطة في أي وقت، مع فريق دعم مخصص لمساعدتك ولضمان حقوقك.' },
            ].map((feature, i) => (
              <div key={i} className="bg-white dark:bg-[#0f172a] rounded-3xl p-8 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-xl hover:shadow-indigo-500/5 transition-all">
                <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-6">
                  <feature.icon className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">{feature.title}</h3>
                <p className="text-slate-600 dark:text-slate-400 font-medium leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Vision & Mission Split */}
      <section className="py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-slate-100 dark:bg-slate-900/50 rounded-3xl p-10 lg:p-12 border border-slate-200 dark:border-slate-800 flex flex-col justify-center h-full">
              <span className="text-indigo-600 dark:text-indigo-400 font-bold mb-4">من نحن</span>
              <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-6 leading-tight">نبني قناة رقمية أوضح بين مزودي الإنترنت المحليين وعملائهم</h2>
              <p className="text-slate-600 dark:text-slate-400 font-medium leading-relaxed mb-6">
                شراء كروت الإنترنت التقليدية من البقالات أو نقاط البيع يرافقه الكثير من المشاكل: بطاقات تالفة، أرقام غير واضحة، أخطاء في الإدخال، وأحياناً بيع الكرت لأكثر من شخص بالخطأ.
              </p>
              <p className="text-slate-600 dark:text-slate-400 font-medium leading-relaxed">
                منصة كارد بوكس وُجدت لتغيير هذا الواقع؛ لنجعل شراء الكروت وتصفح الشبكات أكثر موثوقية وشفافية، ونضمن للعميل حصوله على حقه كاملاً دون أي تعقيد.
              </p>
            </div>

            <div className="bg-gradient-to-br from-indigo-900 to-slate-900 rounded-3xl p-10 lg:p-12 border border-indigo-800 flex flex-col justify-center relative overflow-hidden h-full">
              <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl"></div>
              <div className="relative z-10">
                <span className="text-indigo-300 font-bold mb-4 block">رؤيتنا</span>
                <h2 className="text-3xl font-black text-white mb-6 leading-tight">أن نكون المنصة الأكثر ثقة وسهولة لإدارة وشراء كروت الإنترنت محلياً.</h2>
                <div className="h-px w-16 bg-indigo-500/50 mb-6"></div>
                <span className="text-indigo-300 font-bold mb-4 block">رسالتنا</span>
                <h2 className="text-2xl font-bold text-white leading-tight">تمكين الشبكات المحلية من البيع بكفاءة، وتمكين العملاء من الوصول إلى الإنترنت بلا تعقيد.</h2>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Workflow Section */}
      <section id="workflow" className="py-20 bg-white dark:bg-[#0f172a]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
            <div>
              <span className="text-indigo-600 dark:text-indigo-400 font-bold text-sm tracking-wider uppercase mb-2 block">آلية العمل</span>
              <h2 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white">رحلة قصيرة وواضحة من الطلب إلى الاستلام</h2>
            </div>
            <Link href="/join" className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline underline-offset-4 decoration-2">
              عرض الشبكات ←
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            <div className="hidden md:block absolute top-1/2 left-0 w-full h-0.5 bg-gradient-to-l from-indigo-100 to-indigo-50 dark:from-slate-800 dark:to-slate-800/50 -translate-y-1/2 z-0"></div>
            
            {[
              { step: '١', icon: ShieldCheck, title: 'دخول آمن', desc: 'تسجيل الدخول برقم جوالك والتحقق برمز OTP لضمان سرية معلوماتك ورصيدك في أمان تام.' },
              { step: '٢', icon: Wifi, title: 'اختيار الشبكة والباقة', desc: 'تصفح الشبكات القريبة، اختر الباقة التي تناسبك وقم بتأكيد الدفع من رصيد محفظتك الرقمي.' },
              { step: '٣', icon: Smartphone, title: 'تأكيد واستلام', desc: 'يتم تسليم بيانات كرت الإنترنت فوراً على الشاشة، وتحفظ في سجل مشترياتك.' },
            ].map((item, i) => (
              <div key={i} className="relative z-10 bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/20 dark:shadow-none text-center group hover:-translate-y-2 transition-transform">
                <div className="absolute -top-4 -right-4 w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-black border-2 border-white dark:border-[#0f172a]">{item.step}</div>
                <div className="w-16 h-16 mx-auto rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <item.icon className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">{item.title}</h3>
                <p className="text-slate-600 dark:text-slate-400 font-medium leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Footer */}
      <section className="bg-indigo-600 dark:bg-indigo-900 py-16 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-10">
            <div className="text-center lg:text-right">
              <span className="text-indigo-200 font-bold mb-2 block">تواصل معنا</span>
              <h2 className="text-3xl md:text-4xl font-black text-white mb-4">هل لديك شبكة أو تحتاج مساعدة في الطلب؟</h2>
              <p className="text-indigo-100 font-medium max-w-2xl text-lg">
                فريقنا متاح لمساعدتك في الاستفسارات، ومتابعة عمليات الشراء، وربط شبكتك بالمنصة لتقديم تجربة أكثر احترافية لعملائك.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
              <a href="https://wa.me/775945393" target="_blank" rel="noopener noreferrer" className="bg-white hover:bg-slate-50 text-indigo-600 dark:text-indigo-900 px-8 py-4 rounded-full font-bold text-lg transition-colors flex items-center justify-center gap-2 whitespace-nowrap shadow-lg">
                <Search className="w-5 h-5" />
                تواصل مع الدعم
              </a>
              <Link href="/join" className="bg-indigo-700 hover:bg-indigo-800 text-white border border-indigo-500 px-8 py-4 rounded-full font-bold text-lg transition-colors flex items-center justify-center gap-2 whitespace-nowrap">
                <Users className="w-5 h-5" />
                انضم إلينا كشريك
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Minimal Footer */}
      <footer className="bg-slate-900 text-slate-400 py-8 text-center border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 grayscale opacity-70">
            <KarootLogo isDarkMode={true} className="w-auto h-8" />
          </div>
          <p className="text-sm font-medium">جميع الحقوق محفوظة لمنصة كارد بوكس © {new Date().getFullYear()}</p>
        </div>
      </footer>

    </div>
  );
}
