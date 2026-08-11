import { useRouter } from 'next/navigation';
import React, { useState, useEffect } from 'react';
import {
  Moon,
  Sun,
  Globe,
  Settings,
  ChevronDown,
  ArrowRight,
  Plus,
  Wallet,
  Key,
  Shield,
  LogOut,
  Filter,
  CreditCard,
  Building,
  ArrowUpRight,
  Inbox,
  Clock,
  CheckCircle2,
  XCircle,
  Coins,
  Banknote,
  Search,
} from 'lucide-react';

interface WithdrawalRequestsListViewProps {
  isDarkMode: boolean;
  ownerName?: string;
  networkName?: string;
  onNewRequest: () => void;
  onNavigateView?: (view: string) => void;
}

export const WithdrawalRequestsListView: React.FC<WithdrawalRequestsListViewProps> = ({
  isDarkMode,
  ownerName = 'هشام محمد الجايفي',
  networkName = 'برق نت',
  onNewRequest,
  onNavigateView,
}) => {
  const router = useRouter();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');

  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchWithdrawals = async () => {
      try {
        const token = typeof localStorage !== 'undefined' ? localStorage.getItem('auth_token') : null;
        const res = await fetch('/api/withdrawals', {
          headers: token ? { 'Authorization': `Bearer ${token}` } : {}
        });
        if (res.ok) {
          const data = await res.json();
          // Filter for the current network owner
          const myWithdrawals = data.filter((w: any) => w.networkName === networkName);
          setWithdrawals(myWithdrawals);
        }
      } catch (err) {
        console.error('Failed to fetch withdrawals', err);
      } finally {
        setIsLoading(false);
      }
    };
    if (networkName) {
      fetchWithdrawals();
    }
  }, [networkName]);

  const filteredWithdrawals = withdrawals.filter(w => statusFilter === 'all' || w.status === statusFilter);
  
  return (
    <div
      dir="rtl"
      className={`min-h-screen transition-colors font-['Cairo',sans-serif] ${
        isDarkMode ? 'bg-[#0a0f18] text-slate-100' : 'bg-slate-100 text-slate-800'
      }`}
    >
      {/* Top Navbar */}
      

      {/* Main Content Area */}
      <main className="max-w-6xl mx-auto px-4 md:px-8 py-8 space-y-6">
        {/* Page Sub-Header */}
        

        {/* Section Title & Controls Row */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center border border-amber-500/20">
              <ArrowUpRight className="w-5 h-5" />
            </div>
            <div>
              <h2 className={`text-lg md:text-xl font-black ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                سجل طلبات السحب المالي
              </h2>
              <p className="text-xs text-slate-400">تابع وقدم طلبات السحب إلى محافضتك الرقمية وحساباتك المصرفية</p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
            <button
              onClick={onNewRequest}
              className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs transition-all shadow-md shadow-blue-900/40 cursor-pointer flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>طلب سحب جديد</span>
            </button>

            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-slate-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className={`rounded-xl py-2 px-3 text-xs font-bold text-right cursor-pointer focus:outline-none transition-all ${
                  isDarkMode
                    ? 'bg-[#182232] text-white border border-slate-700'
                    : 'bg-white text-slate-900 border border-slate-300 shadow-sm'
                }`}
              >
                <option value="all">كل الحالات</option>
                <option value="pending">قيد الانتظار</option>
                <option value="completed">مكتمل</option>
                <option value="rejected">مرفوض</option>
              </select>
            </div>
          </div>
        </div>

        
        {/* Withdrawals Table */}
        {isLoading ? (
          <div className="text-center py-12 text-slate-500 font-bold">جاري تحميل الطلبات...</div>
        ) : filteredWithdrawals.length > 0 ? (
          <div className={`rounded-2xl border overflow-hidden ${isDarkMode ? 'border-slate-800' : 'border-slate-200'}`}>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-right">
                <thead className={`text-xs ${isDarkMode ? 'bg-[#182232] text-slate-400' : 'bg-slate-50 text-slate-500'}`}>
                  <tr>
                    <th className="px-6 py-4 font-black">رقم الطلب</th>
                    <th className="px-6 py-4 font-black">المبلغ</th>
                    <th className="px-6 py-4 font-black">وسيلة السحب</th>
                    <th className="px-6 py-4 font-black">تاريخ الطلب</th>
                    <th className="px-6 py-4 font-black text-center">الحالة</th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${isDarkMode ? 'divide-slate-800' : 'divide-slate-200'}`}>
                  {filteredWithdrawals.map((req) => (
                    <tr key={req.id} className={`transition-colors ${isDarkMode ? 'hover:bg-[#182232]' : 'hover:bg-slate-50'}`}>
                      <td className={`px-6 py-4 font-mono font-bold text-xs ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>{req.requestNumber}</td>
                      <td className="px-6 py-4 font-bold text-blue-500">{req.amount.toLocaleString()} ر.ي</td>
                      <td className={`px-6 py-4 font-bold ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>{req.payoutMethod}</td>
                      <td className="px-6 py-4 font-mono text-xs text-slate-400">{new Date(req.requestedAt).toLocaleDateString('ar-EG')}</td>
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-flex items-center justify-center px-3 py-1 rounded-lg text-xs font-bold ${
                          req.status === 'completed' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' :
                          req.status === 'rejected' ? 'bg-red-500/10 text-red-500 border border-red-500/20' :
                          'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                        }`}>
                          {req.status === 'completed' ? 'مكتمل' : req.status === 'rejected' ? 'مرفوض' : 'قيد الانتظار'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
        <div
          className={`rounded-2xl p-16 border text-center transition-all shadow-xl flex flex-col items-center justify-center min-h-[350px] ${
            isDarkMode
              ? 'bg-[#121926] border-slate-800 text-slate-300'
              : 'bg-white border-slate-200 text-slate-700 shadow-sm'
          }`}
        >
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mb-4 shadow-inner">
            <Banknote className="w-8 h-8" />
          </div>

          <p className={`text-base font-extrabold mb-2 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
            لا توجد طلبات سحب مسجلة حالياً
          </p>
          <p className="text-xs text-slate-400 mb-6 max-w-md">
            يمكنك إنشاء طلب سحب أرصدتك إلى محفظة جيب، الكريمي، أو تداولات بسهولة وسرعة.
          </p>

          <button
            onClick={onNewRequest}
            className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs transition-all shadow-md shadow-blue-900/40 cursor-pointer flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>تقديم طلب سحب جديد</span>
          </button>
        </div>
        )} 
      </main>
    </div>
  );
};
