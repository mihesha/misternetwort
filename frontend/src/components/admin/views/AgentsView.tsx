/* eslint-disable tailwindcss/no-contradicting-classname, tailwindcss/no-custom-classname */
import React, { useState, useEffect } from 'react';
import { useAppContext } from '../../../context/AppContext';
import { Users, Search, Filter, ShieldCheck, Mail, Phone, MapPin, Network, DollarSign, Percent, TrendingUp, MoreVertical, Edit, Lock, Trash2, ExternalLink, Plus, Receipt, Wallet } from 'lucide-react';

export const AgentsView = () => {
  const { isDarkMode } = useAppContext();
  const [agents, setAgents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  
  const [selectedAgentDetails, setSelectedAgentDetails] = useState<any>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [editCommissionModal, setEditCommissionModal] = useState<any>(null);
  const [newCommissionRate, setNewCommissionRate] = useState<string>('');
  const [savingCommission, setSavingCommission] = useState(false);
  
  const fetchAgentDetails = async (id: string) => {
    setLoadingDetails(true);
    try {
      const res = await fetch(`/api/admin/agents/${id}/details`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('admin_auth_token')}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setSelectedAgentDetails(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleSaveCommission = async () => {
    if (!editCommissionModal) return;
    setSavingCommission(true);
    try {
      const res = await fetch(`/api/admin/agents/${editCommissionModal.id}/commission`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('admin_auth_token')}`
        },
        body: JSON.stringify({ custom_commission_rate: newCommissionRate ? Number(newCommissionRate) : null })
      });
      if (res.ok) {
        setEditCommissionModal(null);
        fetchAgents(); // Refresh the list to reflect new commission
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSavingCommission(false);
    }
  };

  useEffect(() => {
    fetchAgents();
  }, []);

  const fetchAgents = async () => {
    try {
      const res = await fetch('/api/admin/users?role=agent', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('admin_auth_token')}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        const mappedAgents = (data.users || data).map((a: any) => ({
          ...a,
          networks_count: a.networks_count || 0,
          commission_rate: a.commission_rate || 5, // fallback 5%
          wallet_balance: a.wallet_balance || 0,
          status: a.status || 'active'
        }));
        setAgents(mappedAgents);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const filteredAgents = agents.filter(a => 
    (a.name && a.name.includes(searchQuery)) || 
    (a.phone && a.phone.includes(searchQuery))
  );

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className={`p-5 rounded-2xl border ${isDarkMode ? 'bg-[#121927]/80 border-slate-800' : 'bg-white border-slate-200'} shadow-sm relative overflow-hidden group`}>
          <div className="absolute top-0 right-0 w-1.5 h-full bg-cyan-500" />
          <div className="flex justify-between items-center">
            <div>
              <p className={`text-xs font-bold mb-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>إجمالي المهندسين</p>
              <h3 className={`text-2xl font-black ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>{agents.length}</h3>
            </div>
            <div className="w-12 h-12 bg-cyan-500/10 rounded-xl flex items-center justify-center text-cyan-500">
              <Users className="w-6 h-6" />
            </div>
          </div>
        </div>

        <div className={`p-5 rounded-2xl border ${isDarkMode ? 'bg-[#121927]/80 border-slate-800' : 'bg-white border-slate-200'} shadow-sm relative overflow-hidden group`}>
          <div className="absolute top-0 right-0 w-1.5 h-full bg-indigo-500" />
          <div className="flex justify-between items-center">
            <div>
              <p className={`text-xs font-bold mb-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>الشبكات المدارة</p>
              <h3 className={`text-2xl font-black ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
                {agents.reduce((acc, curr) => acc + (curr.networks_count || 0), 0)}
              </h3>
            </div>
            <div className="w-12 h-12 bg-indigo-500/10 rounded-xl flex items-center justify-center text-indigo-500">
              <Network className="w-6 h-6" />
            </div>
          </div>
        </div>

        <div className={`p-5 rounded-2xl border ${isDarkMode ? 'bg-[#121927]/80 border-slate-800' : 'bg-white border-slate-200'} shadow-sm relative overflow-hidden group`}>
          <div className="absolute top-0 right-0 w-1.5 h-full bg-amber-500" />
          <div className="flex justify-between items-center">
            <div>
              <p className={`text-xs font-bold mb-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>إجمالي العمولات الموزعة</p>
              <h3 className={`text-2xl font-black ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
                {Number(agents.reduce((acc, curr) => acc + Number(curr.wallet_balance || 0), 0)).toLocaleString()} <span className="text-xs font-normal">ر.ي</span>
              </h3>
            </div>
            <div className="w-12 h-12 bg-amber-500/10 rounded-xl flex items-center justify-center text-amber-500">
              <DollarSign className="w-6 h-6" />
            </div>
          </div>
        </div>
        
        <div className={`p-5 rounded-2xl border ${isDarkMode ? 'bg-linear-to-br from-cyan-900/40 to-blue-900/20 border-cyan-500/30' : 'bg-linear-to-br from-cyan-50 to-blue-50 border-cyan-200'} shadow-sm flex flex-col justify-center items-center text-center cursor-pointer hover:scale-[1.02] transition-transform`}>
           <div className="w-10 h-10 bg-cyan-500 text-white rounded-full flex items-center justify-center mb-2 shadow-lg shadow-cyan-500/40">
             <Plus className="w-5 h-5" />
           </div>
           <h4 className="font-bold text-cyan-600 dark:text-cyan-400 text-sm">إضافة مهندس جديد</h4>
        </div>
      </div>

      <div className={`p-6 rounded-3xl border ${isDarkMode ? 'bg-[#121927] border-slate-800 shadow-black/20' : 'bg-white border-slate-200 shadow-slate-200/40'} shadow-xl`}>
        <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center mb-8 pb-6 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-cyan-500/10 rounded-2xl flex items-center justify-center text-cyan-500 shrink-0">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <h2 className={`text-xl font-black ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>إدارة المهندسين والوكلاء</h2>
              <p className="text-sm text-slate-500 mt-1 font-medium">سجل الوكلاء المعتمدين والمؤشرات المالية ونسب العمولات لكل وكيل</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className={`flex items-center p-1 rounded-xl border ${isDarkMode ? 'bg-[#141d2b] border-slate-800' : 'bg-slate-100 border-slate-200'}`}>
              <button onClick={() => setViewMode('grid')} className={`p-2 rounded-lg transition-colors ${viewMode === 'grid' ? (isDarkMode ? 'bg-slate-800 text-white shadow' : 'bg-white text-slate-800 shadow-sm') : 'text-slate-500 hover:text-slate-700'}`} title="عرض كشبكة">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
              </button>
              <button onClick={() => setViewMode('table')} className={`p-2 rounded-lg transition-colors ${viewMode === 'table' ? (isDarkMode ? 'bg-slate-800 text-white shadow' : 'bg-white text-slate-800 shadow-sm') : 'text-slate-500 hover:text-slate-700'}`} title="عرض كجدول">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg>
              </button>
            </div>
            <div className="relative flex-1 md:w-72">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ابحث باسم المهندس أو رقم الجوال..." 
                className={`w-full pr-10 pl-4 py-3 rounded-xl text-sm font-medium transition-all focus:outline-none focus:ring-2 ${isDarkMode ? 'bg-slate-800/50 border-slate-700 text-white focus:ring-cyan-500/50' : 'bg-slate-50 border-slate-200 text-slate-800 focus:ring-cyan-500/50'}`}
              />
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-10 h-10 border-4 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin mb-4"></div>
            <p className="text-sm font-bold text-slate-500">جاري تحميل بيانات المهندسين...</p>
          </div>
        ) : filteredAgents.length === 0 ? (
          <div className={`text-center py-20 rounded-2xl border border-dashed ${isDarkMode ? 'border-slate-800 text-slate-500' : 'border-slate-300 text-slate-400'}`}>
            <ShieldCheck className="w-16 h-16 mx-auto mb-4 opacity-20" />
            <p className="text-lg font-black mb-2">لا يوجد مهندسين</p>
            <p className="text-sm">لم يتم العثور على بيانات تطابق بحثك أو لم يتم تسجيل أي مهندس بعد.</p>
          </div>
        ) : (
          viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {filteredAgents.map((agent, i) => (
                <div key={i} className={`rounded-3xl border transition-all duration-300 hover:shadow-xl group overflow-hidden ${isDarkMode ? 'bg-slate-800/40 border-slate-700/60 hover:border-cyan-500/50 hover:bg-slate-800/80' : 'bg-white border-slate-200 hover:border-cyan-400 hover:shadow-cyan-900/5'}`}>
                  
                  {/* Card Header */}
                  <div className={`p-5 flex justify-between items-start border-b ${isDarkMode ? 'border-slate-700/50' : 'border-slate-100'}`}>
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <div className="w-14 h-14 rounded-2xl bg-linear-to-br from-cyan-500 to-blue-600 text-white flex items-center justify-center font-black text-xl shadow-lg shadow-cyan-500/30">
                          {agent.name.charAt(0)}
                        </div>
                        {agent.status === 'active' && (
                          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-cyan-500 border-2 border-white dark:border-[#1e293b] rounded-full"></div>
                        )}
                      </div>
                      <div>
                        <h3 className={`font-black text-base truncate max-w-37.5 ${isDarkMode ? 'text-white' : 'text-slate-800'}`} title={agent.name}>{agent.name}</h3>
                        <div className="flex items-center gap-1.5 mt-1 text-xs text-cyan-600 dark:text-cyan-400 font-bold bg-cyan-50 dark:bg-cyan-500/10 px-2 py-1 rounded-lg w-max">
                          <ShieldCheck className="w-3.5 h-3.5" /> <span>مهندس وكيل</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Action Menu */}
                    <div className="flex gap-2">
                      <button onClick={() => { setEditCommissionModal(agent); setNewCommissionRate(agent.custom_commission_rate || ''); }} className={`p-2 rounded-xl transition-colors ${isDarkMode ? 'hover:bg-slate-700 text-slate-400' : 'hover:bg-slate-100 text-slate-500'}`} title="تخصيص النسبة">
                        <Percent className="w-4 h-4" />
                      </button>
                      <button onClick={() => fetchAgentDetails(agent.id)} className={`p-2 rounded-xl transition-colors ${isDarkMode ? 'hover:bg-slate-700 text-slate-400' : 'hover:bg-slate-100 text-slate-500'}`} title="عرض البروفايل التفصيلي">
                        <ExternalLink className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  
                  {/* Stats Grid */}
                  <div className="p-5 grid grid-cols-2 gap-4">
                    <div className={`p-3 rounded-2xl flex flex-col items-center justify-center text-center ${isDarkMode ? 'bg-slate-800/80' : 'bg-slate-50'}`}>
                      <Network className={`w-5 h-5 mb-2 ${isDarkMode ? 'text-indigo-400' : 'text-indigo-500'}`} />
                      <span className="text-[10px] font-bold text-slate-500 mb-1">الشبكات المدارة</span>
                      <span className={`text-lg font-black ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>{agent.networks_count}</span>
                    </div>
                    <div className={`p-3 rounded-2xl flex flex-col items-center justify-center text-center ${isDarkMode ? 'bg-slate-800/80' : 'bg-slate-50'}`}>
                      <Percent className={`w-5 h-5 mb-2 ${isDarkMode ? 'text-amber-400' : 'text-amber-500'}`} />
                      <span className="text-[10px] font-bold text-slate-500 mb-1">نسبة العمولة</span>
                      <span className={`text-lg font-black ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>%{agent.commission_rate}</span>
                    </div>
                    <div className={`col-span-2 p-4 rounded-2xl flex items-center justify-between ${isDarkMode ? 'bg-cyan-500/5 border border-cyan-500/10' : 'bg-cyan-50 border border-cyan-100'}`}>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-cyan-500/20 flex items-center justify-center text-cyan-600 dark:text-cyan-400">
                          <DollarSign className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-slate-500">إجمالي الأرباح</p>
                          <p className="text-base font-black text-cyan-600 dark:text-cyan-400" dir="ltr">
                            {Number(agent.wallet_balance).toLocaleString()} <span className="text-xs">ر.ي</span>
                          </p>
                        </div>
                      </div>
                      <button className="text-xs font-bold text-cyan-600 hover:text-cyan-700 bg-cyan-100/50 hover:bg-cyan-200/50 dark:bg-cyan-500/20 px-3 py-1.5 rounded-lg transition-colors">
                        تحويل للأرباح
                      </button>
                    </div>
                  </div>

                  {/* Contact Info Footer */}
                  <div className={`px-5 py-4 flex flex-col gap-2.5 text-xs font-medium border-t ${isDarkMode ? 'border-slate-700/50 bg-slate-900/50' : 'border-slate-100 bg-slate-50/50'}`}>
                    <div className="flex items-center justify-between">
                      <div className={`flex items-center gap-2 ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                        <Phone className="w-3.5 h-3.5 text-slate-400" /> <span dir="ltr">{agent.phone}</span>
                      </div>
                      <a href={`tel:${agent.phone}`} className="text-indigo-500 hover:underline">اتصال</a>
                    </div>
                    
                    {agent.governorate && (
                      <div className={`flex items-center gap-2 ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                        <MapPin className="w-3.5 h-3.5 text-slate-400" /> 
                        <span>{agent.governorate} {agent.city ? ` - ${agent.city}` : ''}</span>
                      </div>
                    )}
                    
                    {agent.email && (
                      <div className={`flex items-center gap-2 ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                        <Mail className="w-3.5 h-3.5 text-slate-400" /> 
                        <span className="truncate max-w-50" title={agent.email}>{agent.email}</span>
                      </div>
                    )}
                  </div>

                </div>
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-right">
                <thead className={`text-xs uppercase ${isDarkMode ? 'bg-slate-800/50 text-slate-400' : 'bg-slate-50 text-slate-500'}`}>
                  <tr>
                    <th className="px-6 py-4 font-bold rounded-r-xl">المهندس / الوكيل</th>
                    <th className="px-6 py-4 font-bold">معلومات التواصل</th>
                    <th className="px-6 py-4 font-bold">الموقع</th>
                    <th className="px-6 py-4 font-bold text-center">الشبكات</th>
                    <th className="px-6 py-4 font-bold text-center">نسبة العمولة</th>
                    <th className="px-6 py-4 font-bold">إجمالي الأرباح</th>
                    <th className="px-6 py-4 font-bold rounded-l-xl text-center">إجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAgents.map((agent, i) => (
                    <tr key={i} className={`border-b transition-colors hover:shadow-sm ${isDarkMode ? 'border-slate-800/50 hover:bg-slate-800/30' : 'border-slate-100 hover:bg-slate-50/50'}`}>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            <div className="w-10 h-10 rounded-xl bg-linear-to-br from-cyan-500 to-blue-600 text-white flex items-center justify-center font-black text-lg shadow-sm">
                              {agent.name.charAt(0)}
                            </div>
                            {agent.status === 'active' && (
                              <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-cyan-500 border-2 border-white dark:border-[#1e293b] rounded-full"></div>
                            )}
                          </div>
                          <div>
                            <p className={`font-black text-sm ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>{agent.name}</p>
                            <span className="text-[10px] text-cyan-600 dark:text-cyan-400 font-bold bg-cyan-50 dark:bg-cyan-500/10 px-2 py-0.5 rounded-md">مهندس وكيل</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1">
                          <span className="flex items-center gap-1.5 text-xs text-slate-500" dir="ltr"><Phone className="w-3 h-3"/> {agent.phone}</span>
                          {agent.email && <span className="flex items-center gap-1.5 text-xs text-slate-500 truncate max-w-37.5"><Mail className="w-3 h-3"/> {agent.email}</span>}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-xs text-slate-500 font-bold">{agent.governorate} {agent.city ? ` - ${agent.city}` : ''}</span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="inline-flex items-center justify-center min-w-8 px-2 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-black text-xs">
                          {agent.networks_count}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="inline-flex items-center justify-center px-2 py-1 rounded-lg bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 font-black text-xs">
                          %{agent.commission_rate}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-black text-cyan-600 dark:text-cyan-400" dir="ltr">{Number(agent.wallet_balance).toLocaleString()} <span className="text-[10px] font-normal">ر.ي</span></span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button onClick={() => { setEditCommissionModal(agent); setNewCommissionRate(agent.custom_commission_rate || ''); }} className={`p-2 rounded-xl transition-colors ${isDarkMode ? 'hover:bg-slate-700 text-slate-400' : 'hover:bg-slate-100 text-slate-500'}`} title="تخصيص النسبة">
                            <Percent className="w-4 h-4 mx-auto" />
                          </button>
                          <button onClick={() => fetchAgentDetails(agent.id)} className={`p-2 rounded-xl transition-colors ${isDarkMode ? 'hover:bg-slate-700 text-slate-400' : 'hover:bg-slate-100 text-slate-500'}`} title="عرض التفاصيل">
                            <ExternalLink className="w-4 h-4 mx-auto" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        )}
      </div>

      {/* Agent Details Modal */}
      {(selectedAgentDetails || loadingDetails) && (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4 sm:p-6">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSelectedAgentDetails(null)}></div>
          <div className={`relative w-full max-w-4xl max-h-[90vh] flex flex-col rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300 ${isDarkMode ? 'bg-[#0f172a] border border-slate-800' : 'bg-white border border-slate-200'}`}>
            
            {/* Modal Header */}
            <div className={`px-6 py-5 border-b flex items-center justify-between ${isDarkMode ? 'border-slate-800 bg-[#121927]' : 'border-slate-100 bg-slate-50'}`}>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-cyan-500/10 rounded-xl flex items-center justify-center text-cyan-500">
                  <Users className="w-6 h-6" />
                </div>
                <div>
                  <h3 className={`text-lg font-black ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>البروفايل التفصيلي للمهندس</h3>
                  <p className="text-xs text-slate-500 mt-1 font-bold">العمليات المالية، الشبكات، وسجل الأداء</p>
                </div>
              </div>
              <button 
                onClick={() => { setSelectedAgentDetails(null); setLoadingDetails(false); }}
                className={`p-2 rounded-full transition-colors ${isDarkMode ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-slate-200 text-slate-500'}`}
              >
                <Trash2 className="w-5 h-5 opacity-0 absolute" /> 
                <span className="text-xl leading-none font-bold">&times;</span>
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
              {loadingDetails ? (
                <div className="flex flex-col items-center justify-center py-20">
                  <div className="w-12 h-12 border-4 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin mb-4"></div>
                  <p className="font-bold text-slate-500">جاري جلب البيانات التفصيلية...</p>
                </div>
              ) : selectedAgentDetails && (
                <div className="space-y-6">
                  
                  {/* Info Card */}
                  <div className={`p-5 rounded-2xl border flex flex-col md:flex-row items-center gap-6 ${isDarkMode ? 'bg-[#141d2b] border-slate-800' : 'bg-white border-slate-200'}`}>
                    <div className="w-20 h-20 rounded-full bg-linear-to-br from-cyan-500 to-blue-600 text-white flex items-center justify-center font-black text-3xl shadow-lg shadow-cyan-500/30 shrink-0">
                      {selectedAgentDetails.name.charAt(0)}
                    </div>
                    <div className="flex-1 text-center md:text-right">
                      <h2 className={`text-2xl font-black mb-1 ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>{selectedAgentDetails.name}</h2>
                      <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-sm font-bold text-slate-500">
                        <span className="flex items-center gap-1.5"><Phone className="w-4 h-4"/> {selectedAgentDetails.phone}</span>
                        {selectedAgentDetails.email && <span className="flex items-center gap-1.5"><Mail className="w-4 h-4"/> {selectedAgentDetails.email}</span>}
                        {selectedAgentDetails.governorate && <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4"/> {selectedAgentDetails.governorate} {selectedAgentDetails.city ? ` - ${selectedAgentDetails.city}` : ''}</span>}
                        {selectedAgentDetails.jaib_wallet && <span className="flex items-center gap-1.5 text-indigo-500 bg-indigo-50 dark:bg-indigo-500/10 px-2 py-1 rounded-lg"><Wallet className="w-4 h-4"/> محفظة جيب: {selectedAgentDetails.jaib_wallet}</span>}
                      </div>
                    </div>
                    <div className={`px-6 py-4 rounded-2xl text-center ${isDarkMode ? 'bg-cyan-500/10' : 'bg-cyan-50'}`}>
                      <p className="text-xs font-bold text-cyan-600 dark:text-cyan-400 mb-1">الرصيد الكلي</p>
                      <p className="text-2xl font-black text-cyan-600 dark:text-cyan-400" dir="ltr">
                        {Number(selectedAgentDetails.wallet_balance).toLocaleString()} <span className="text-xs">ر.ي</span>
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Networks */}
                    <div className={`p-5 rounded-2xl border ${isDarkMode ? 'bg-[#141d2b] border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                      <h4 className={`font-black flex items-center gap-2 mb-4 ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
                        <Network className="w-5 h-5 text-indigo-500"/> 
                        الشبكات المضافة ({selectedAgentDetails.networks?.length || 0})
                      </h4>
                      <div className="space-y-3 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
                        {(!selectedAgentDetails.networks || selectedAgentDetails.networks.length === 0) ? (
                          <p className="text-slate-500 text-sm font-bold text-center py-4">لا توجد شبكات مضافة بعد.</p>
                        ) : (
                          selectedAgentDetails.networks.map((net: any, idx: number) => (
                            <div key={idx} className={`p-3 rounded-xl border flex items-center justify-between ${isDarkMode ? 'bg-slate-800/50 border-slate-700/50' : 'bg-white border-slate-100'}`}>
                              <div>
                                <p className={`font-bold text-sm ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>{net.name}</p>
                                <p className="text-xs text-slate-500">الكود: {net.network_code}</p>
                              </div>
                              <div className="text-left">
                                <p className="text-xs text-indigo-500 font-bold mb-1">رصيد الشبكة</p>
                                <p className={`font-black text-sm ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`} dir="ltr">{Number(net.balance || 0).toLocaleString()} <span className="text-[10px]">ر.ي</span></p>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>

                    {/* Transactions */}
                    <div className={`p-5 rounded-2xl border ${isDarkMode ? 'bg-[#141d2b] border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                      <h4 className={`font-black flex items-center gap-2 mb-4 ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
                        <Receipt className="w-5 h-5 text-amber-500"/> 
                        سجل العمليات المالية والأرباح
                      </h4>
                      <div className="space-y-3 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
                        {(!selectedAgentDetails.transactions || selectedAgentDetails.transactions.length === 0) ? (
                          <p className="text-slate-500 text-sm font-bold text-center py-4">لا توجد عمليات مالية بعد.</p>
                        ) : (
                          selectedAgentDetails.transactions.map((txn: any, idx: number) => (
                            <div key={idx} className={`p-3 rounded-xl border flex items-center justify-between ${isDarkMode ? 'bg-slate-800/50 border-slate-700/50' : 'bg-white border-slate-100'}`}>
                              <div>
                                <p className={`font-bold text-sm ${txn.type === 'commission' ? 'text-cyan-500' : 'text-rose-500'}`}>
                                  {txn.type === 'commission' ? 'استلام عمولة مبيعات' : 'سحب أرباح'}
                                </p>
                                <p className="text-xs text-slate-500 mt-1">{new Date(txn.created_at).toLocaleDateString('ar-YE')}</p>
                              </div>
                              <p className={`font-black text-sm ${txn.type === 'commission' ? 'text-cyan-600 dark:text-cyan-400' : 'text-rose-600 dark:text-rose-400'}`} dir="ltr">
                                {txn.type === 'commission' ? '+' : '-'}{Number(txn.amount).toLocaleString()} <span className="text-[10px]">ر.ي</span>
                              </p>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>

                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Edit Commission Modal */}
      {editCommissionModal && (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4 sm:p-6">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setEditCommissionModal(null)}></div>
          <div className={`relative w-full max-w-md flex flex-col rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300 ${isDarkMode ? 'bg-[#0f172a] border border-slate-800' : 'bg-white border border-slate-200'}`}>
            
            <div className={`px-6 py-5 border-b flex items-center justify-between ${isDarkMode ? 'border-slate-800 bg-[#121927]' : 'border-slate-100 bg-slate-50'}`}>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-amber-500/10 rounded-xl flex items-center justify-center text-amber-500">
                  <Percent className="w-5 h-5" />
                </div>
                <div>
                  <h3 className={`text-base font-black ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>تخصيص نسبة العمولة</h3>
                  <p className="text-xs text-slate-500 mt-1 font-bold">{editCommissionModal.name}</p>
                </div>
              </div>
              <button 
                onClick={() => setEditCommissionModal(null)}
                className={`p-2 rounded-full transition-colors ${isDarkMode ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-slate-200 text-slate-500'}`}
              >
                <span className="text-xl leading-none font-bold">&times;</span>
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className={`block text-sm font-bold mb-2 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>نسبة العمولة المخصصة (%)</label>
                <input
                  type="number"
                  step="0.5"
                  value={newCommissionRate}
                  onChange={(e) => setNewCommissionRate(e.target.value)}
                  placeholder="اتركه فارغاً لاستخدام النسبة العامة..."
                  className={`w-full px-4 py-3 rounded-xl text-sm transition-all focus:outline-none focus:ring-2 ${isDarkMode ? 'bg-slate-800/50 border border-slate-700 text-white focus:ring-cyan-500/50' : 'bg-slate-50 border border-slate-200 text-slate-800 focus:ring-cyan-500/50'}`}
                />
                <p className="text-xs text-slate-500 mt-2">
                  إذا تركت هذا الحقل فارغاً، سيتم تطبيق النسبة العامة (الافتراضية) من صفحة الإعدادات.
                </p>
              </div>
            </div>
            
            <div className={`px-6 py-4 border-t flex justify-end gap-3 ${isDarkMode ? 'border-slate-800 bg-[#121927]' : 'border-slate-100 bg-slate-50'}`}>
              <button 
                onClick={() => setEditCommissionModal(null)}
                className={`px-4 py-2 rounded-xl text-xs font-bold ${isDarkMode ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'bg-slate-200 text-slate-600 hover:bg-slate-300'}`}
              >
                إلغاء
              </button>
              <button 
                onClick={handleSaveCommission}
                disabled={savingCommission}
                className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold shadow-lg shadow-cyan-900/20 disabled:opacity-50"
              >
                {savingCommission ? 'جاري الحفظ...' : 'حفظ التخصيص'}
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};
