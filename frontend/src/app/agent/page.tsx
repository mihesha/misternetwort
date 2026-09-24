"use client";
import React from 'react';
import { useAgentContext } from '../../context/AgentContext';
import { useAppContext } from '../../context/AppContext';
import { Wallet, Network, TrendingUp, Sparkles, PlusCircle, ArrowUpRight } from 'lucide-react';
import Link from 'next/link';

export default function AgentDashboard() {
  const { isDarkMode } = useAppContext();
  const { agentName, stats, isDataLoaded } = useAgentContext();

  if (!isDataLoaded) {
    return (
      <div className="flex items-center justify-center min-h-100">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const statCards = [
    {
      title: 'الرصيد المتاح',
      value: `${stats?.balance.toLocaleString()} ر.ي`,
      icon: Wallet,
      lightColor: 'text-indigo-600 bg-indigo-100 border-indigo-200',
      darkColor: 'text-indigo-400 bg-indigo-500/20 border-indigo-500/30'
    },
    {
      title: 'الشبكات المضافة',
      value: stats?.total_networks || 0,
      icon: Network,
      lightColor: 'text-blue-600 bg-blue-100 border-blue-200',
      darkColor: 'text-blue-400 bg-blue-500/20 border-blue-500/30'
    },
    {
      title: 'إجمالي الأرباح السابقة',
      value: `${stats?.total_earnings.toLocaleString()} ر.ي`,
      icon: TrendingUp,
      lightColor: 'text-emerald-600 bg-emerald-100 border-emerald-200',
      darkColor: 'text-emerald-400 bg-emerald-500/20 border-emerald-500/30'
    }
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-4xl p-8 md:p-10 shadow-xl group">
        <div className="absolute inset-0 bg-linear-to-r from-indigo-600 to-violet-500 opacity-95 transition-all duration-700" />
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-30 mix-blend-overlay" />
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-right w-full md:w-auto">
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold mb-4 bg-white/20 text-white border border-white/30 backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5" />
              <span>أهلاً بك في بوابة المهندسين</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-black tracking-tight mb-2 text-white drop-shadow-md">
              مرحباً، {agentName.split(' ')[0]} 👋
            </h1>
            <p className="text-base font-medium max-w-lg text-white/90 leading-relaxed">
              تابع مبيعات الشبكات التي أضفتها واستلم عمولاتك أولاً بأول، أنت شريك أساسي في نجاحنا.
            </p>
          </div>
          <Link href="/agent/add-network" className="w-full md:w-auto shrink-0 px-6 py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-transform active:scale-95 shadow-lg bg-white text-indigo-700 hover:bg-slate-50 hover:-translate-y-0.5">
            <PlusCircle className="w-5 h-5" />
            <span>إضافة شبكة جديدة</span>
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {statCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div key={idx} className={`relative p-6 rounded-3xl border transition-all hover:-translate-y-1 hover:shadow-xl ${isDarkMode ? 'bg-[#101726] border-slate-800 hover:border-slate-700 shadow-black/50' : 'bg-white border-slate-200 hover:border-blue-300 shadow-slate-300/40'}`}>
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-2xl border ${isDarkMode ? card.darkColor : card.lightColor}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <ArrowUpRight className={`w-5 h-5 opacity-50 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`} />
              </div>
              <div className={`text-sm font-bold mb-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>{card.title}</div>
              <div className={`text-2xl md:text-3xl font-black ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{card.value}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
