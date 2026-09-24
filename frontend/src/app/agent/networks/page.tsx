"use client";
import React, { useState, useEffect } from 'react';
import { useAppContext } from '../../../context/AppContext';
import { Network, Activity, Calendar, Search } from 'lucide-react';
import Link from 'next/link';

export default function AgentNetworksPage() {
  const { isDarkMode } = useAppContext();
  const [networks, setNetworks] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchNetworks = async () => {
      try {
        const token = localStorage.getItem('auth_token');
        const res = await fetch('/api/agent/networks', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setNetworks(data);
        }
      } catch (e) {
      } finally {
        setIsLoading(false);
      }
    };
    fetchNetworks();
  }, []);

  const filteredNetworks = networks.filter(n => n.name.includes(search));

  if (isLoading) {
    return <div className="flex justify-center p-12"><div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div></div>;
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className={`text-2xl font-black ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>شبكاتي المضافة</h1>
          <p className={`text-sm mt-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>الشبكات التي قمت بجلبها للمنصة</p>
        </div>
        <div className="relative w-full sm:w-64">
          <input 
            type="text" 
            placeholder="البحث عن شبكة..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={`w-full pl-4 pr-10 py-2.5 rounded-xl text-sm font-bold border transition-colors outline-none focus:ring-2 ${isDarkMode ? 'bg-[#1c2638] border-transparent focus:ring-blue-500 text-white' : 'bg-slate-50 border-slate-200 focus:ring-blue-500 text-slate-800'}`}
          />
          <Search className={`absolute right-3 top-3 w-4 h-4 ${isDarkMode ? 'text-slate-400' : 'text-slate-400'}`} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredNetworks.map(net => (
          <div key={net.id} className={`p-6 rounded-3xl border transition-all hover:-translate-y-1 hover:shadow-xl ${isDarkMode ? 'bg-[#101726] border-slate-800 hover:border-slate-700 shadow-black/50' : 'bg-white border-slate-200 hover:border-blue-300 shadow-slate-300/40'}`}>
            <div className="flex items-start justify-between mb-4">
              <div className={`p-3 rounded-2xl ${isDarkMode ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-100 text-blue-600'}`}>
                <Network className="w-6 h-6" />
              </div>
              <span className={`px-2 py-1 rounded-lg text-xs font-bold ${net.status === 'active' ? (isDarkMode ? 'bg-emerald-500/20 text-emerald-400' : 'bg-emerald-100 text-emerald-700') : (isDarkMode ? 'bg-amber-500/20 text-amber-400' : 'bg-amber-100 text-amber-700')}`}>
                {net.status === 'active' ? 'نشط' : 'قيد المراجعة'}
              </span>
            </div>
            <h3 className={`text-lg font-black mb-1 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{net.name}</h3>
            <p className={`text-xs font-bold mb-6 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>كود الشبكة: {net.network_code}</p>
            
            <div className={`flex items-center justify-between pt-4 border-t ${isDarkMode ? 'border-slate-800' : 'border-slate-100'}`}>
              <div className="flex items-center gap-1.5">
                <Activity className={`w-4 h-4 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`} />
                <span className={`text-xs font-bold ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>مبيعات: {net.total_sales.toLocaleString()} ر.ي</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Calendar className={`w-4 h-4 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`} />
                <span className={`text-[10px] font-bold ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>{new Date(net.created_at).toLocaleDateString('ar-EG')}</span>
              </div>
            </div>
          </div>
        ))}

        {filteredNetworks.length === 0 && (
          <div className={`col-span-full py-12 text-center rounded-3xl border border-dashed ${isDarkMode ? 'border-slate-700 bg-slate-800/30' : 'border-slate-300 bg-slate-50'}`}>
            <Network className={`w-12 h-12 mx-auto mb-3 opacity-20 ${isDarkMode ? 'text-white' : 'text-slate-900'}`} />
            <p className={`text-sm font-bold ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>لا توجد شبكات مضافة حتى الآن</p>
            <Link href="/agent/add-network" className={`inline-flex mt-4 px-6 py-3 rounded-xl text-sm font-bold transition-all hover:-translate-y-0.5 bg-linear-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 text-white`}>
              إضافة شبكة جديدة
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
