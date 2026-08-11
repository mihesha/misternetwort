"use client";
import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAppContext } from '../../context/AppContext';
import { useIdleTimeout } from '../../hooks/useIdleTimeout';
import { useAdminContext, AdminProvider } from '../../context/AdminContext';
import { GlobalAdminModals } from '../../components/admin/GlobalAdminModals';
import {
  LayoutDashboard,
  FileText,
  Globe,
  Wallet,
  CreditCard,
  Printer,
  Router as RouterIcon,
  Bot,
  Users,
  Settings,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  ShieldCheck,
  TrendingUp,
  Clock,
  CheckCircle2,
  XCircle,
  Plus,
  Search,
  Filter,
  Download,
  Phone,
  MessageCircle,
  Trash2,
  Edit3,
  FileEdit,
  AlertTriangle,
  DollarSign,
  Activity,
  Eye,
  RefreshCw,
  Lock,
  Sliders,
  Database,
  Copy,
  ExternalLink,
  Zap,
  BarChart3,
  Layers,
  ArrowUpRight,
  Power,
  Check,
} from 'lucide-react';
import {
  NetworkApplication,
  ApplicationStatus,
  ActiveNetwork,
  WithdrawalRequest,
  AdminSystemStats,
  CentralAuditLog,
  NetworkDataEditRequest,
} from '../../types';
import { AIPackageAdvisor } from '../../components/public/portal/AIPackageAdvisor';
import { WalletsApiHub } from '../../components/public/landing/WalletsApiHub';
import { OverviewView } from '../../components/admin/views/OverviewView';
import { ApplicationsView } from '../../components/admin/views/ApplicationsView';
import { NetworksView } from '../../components/admin/views/NetworksView';



type AdminTab =
  | 'overview'
  | 'applications'
  | 'data_edits'
  | 'networks'
  | 'inventory'
  | 'withdrawals'
  | 'ledger'
  | 'mikrotik'
  | 'ai_advisor'
  | 'wallets_api'
  | 'users'
  | 'customers'
  | 'settings';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminProvider>
      <AdminShell>{children}</AdminShell>
    </AdminProvider>
  );
}

function AdminShell({ children }: { children: React.ReactNode }) {
  const { isDarkMode, setIsDarkMode, applications, handleUpdateStatus, handleDeleteApplication, handleApproveWithCredentials } = useAppContext();
  
  const {
    stats, activeNetworks, withdrawals, auditLogs, dataEditRequests, platformCommissionRate, setPlatformCommissionRate, supportPhone, setSupportPhone, fetchAdminData, setActiveNetworks, setWithdrawals, setDataEditRequests,
    inspectApp, setInspectApp, inspectNetwork, setInspectNetwork, inspectNetworkCards, setInspectNetworkCards, inspectNetworkTab, setInspectNetworkTab, inspectCardCatFilter, setInspectCardCatFilter, inspectCardStatusFilter, setInspectCardStatusFilter, inspectCardDateFilter, setInspectCardDateFilter, inspectCardStartDate, setInspectCardStartDate, inspectCardEndDate, setInspectCardEndDate, inspectCardSearchQuery, setInspectCardSearchQuery, editNetworkModal, setEditNetworkModal, balanceAdjustNetwork, setBalanceAdjustNetwork, adjustAmount, setAdjustAmount, adjustNote, setAdjustNote, payoutWdModal, setPayoutWdModal, payoutRef, setPayoutRef, payoutNotes, setPayoutNotes, whatsappModalData, setWhatsappModalData, copiedWpText, setCopiedWpText, requestModifyApp, setRequestModifyApp, modificationReasonText, setModificationReasonText, whatsappModifyData, setWhatsappModifyData, copiedModifyWpText, setCopiedModifyWpText, showNewNetworkModal, setShowNewNetworkModal, newNetName, setNewNetName, newNetOwner, setNewNetOwner, newNetPhone, setNewNetPhone, newNetWallet, setNewNetWallet, newNetGov, setNewNetGov, newNetCity, setNewNetCity, cardBatchNetId, setCardBatchNetId, cardBatchCategory, setCardBatchCategory, cardBatchCount, setCardBatchCount, generatedBatch, setGeneratedBatch, selectedMikrotikNet, setSelectedMikrotikNet, mikrotikIpInput, setMikrotikIpInput, mikrotikUserInput, setMikrotikUserInput, mikrotikPassInput, setMikrotikPassInput, copiedScript, setCopiedScript, showNewUserModal, setShowNewUserModal, newUserName, setNewUserName, newUserEmail, setNewUserEmail, newUserRole, setNewUserRole, newUserPhone, setNewUserPhone
  } = useAdminContext();
  
  const router = useRouter();
  const pathname = usePathname();
  const activeTab = pathname.split('/').pop() || 'overview';
  const isLoginPage = pathname === '/admin/login';

  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  // Auto Logout on Inactivity (15 minutes)
  useIdleTimeout(() => {
    if (!isLoginPage && isAuthenticated) {
      const token = typeof window !== 'undefined' ? localStorage.getItem('admin_auth_token') : null;
      if (token) {
        fetch('/api/logout', { method: 'POST', headers: { 'Authorization': `Bearer ${token}` } }).catch(() => {});
      }
      localStorage.removeItem('admin_auth_token');
      localStorage.removeItem('admin_user');
      router.replace('/admin/login');
      alert('تم تسجيل خروجك تلقائياً بسبب عدم وجود أي نشاط لفترة طويلة.');
    }
  }, 15 * 60 * 1000);

  useEffect(() => {
    if (isLoginPage) {
      setIsAuthenticated(true);
      return;
    }

    setIsAuthenticated(null); // Reset while checking

    const token = typeof window !== 'undefined' ? localStorage.getItem('admin_auth_token') : null;
    const userStr = typeof window !== 'undefined' ? localStorage.getItem('admin_user') : null;
    
    if (!token || !userStr) {
      router.replace('/admin/login');
      return;
    }

    try {
      const user = JSON.parse(userStr);
      if (user.role !== 'admin' && user.role !== 'super_admin') {
        router.replace('/admin/login');
      } else {
        setIsAuthenticated(true);
      }
    } catch (e) {
      router.replace('/admin/login');
    }
  }, [pathname, isLoginPage, router]);

  // Sidebar Collapsed state
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  
  // States that were not moved to Context
  const [adminUsers, setAdminUsers] = useState<any[]>([]);
  const [inspectDataEditReq, setInspectDataEditReq] = useState<NetworkDataEditRequest | null>(null);
  const [dataEditSearch, setDataEditSearch] = useState<string>('');
  const [dataEditFilterStatus, setDataEditFilterStatus] = useState<string>('all');
  const [maintenanceMode, setMaintenanceMode] = useState<boolean>(false);
  const [autoApproveApplications, setAutoApproveApplications] = useState<boolean>(false);
  const [mikrotikGlobalPort, setMikrotikGlobalPort] = useState<string>('8728');


  // Filtered Applications removed and moved to ApplicationsTab component

  // Action: Approve Application & Provision into Active Network
  const handleExportCSV = () => {
    const headers = ['رقم المرجع', 'التاريخ', 'اسم الشبكة', 'المنفذ', 'نوع العملية', 'المبلغ (ر.ي)', 'التفاصيل'];
    const rows = auditLogs.map((log: any) => [
      log.reference,
      new Date(log.timestamp).toLocaleString('ar-YE'),
      log.networkName,
      log.performedBy,
      log.typeLabel,
      String(log.amount),
      log.description,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\\uFEFF' + [headers, ...rows].map((e) => e.join(',')).join('\\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', "Karoot_Admin_Ledger_" + Date.now() + ".csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const menuGroups = [
    {
      title: 'الرئيسية والتحليلات',
      items: [
        { id: 'overview' as AdminTab, label: 'لوحة التحكم والتحليلات', icon: LayoutDashboard, badge: null },
      ],
    },
    {
      title: 'إدارة الشبكات والطلبات',
      items: [
        {
          id: 'applications' as AdminTab,
          label: 'طلبات الانضمام',
          icon: FileText,
          badge: applications.filter((a) => a.status === 'pending' || a.status === 'under_review').length || null,
          badgeColor: 'bg-amber-500',
        },
        {
          id: 'data_edits' as AdminTab,
          label: 'طلبات تعديل البيانات',
          icon: FileEdit,
          badge: dataEditRequests.filter((r) => r.status === 'pending').length || null,
          badgeColor: 'bg-indigo-500',
        },
        {
          id: 'networks' as AdminTab,
          label: 'دليل الشبكات النشطة',
          icon: Globe,
          badge: activeNetworks.length,
          badgeColor: 'bg-indigo-500',
        },
      ],
    },
    {
      title: 'الكروت والمالية',
      items: [
        { id: 'inventory' as AdminTab, label: 'الكروت والمخزون المركزي', icon: CreditCard, badge: null },
        {
          id: 'withdrawals' as AdminTab,
          label: 'طلبات السحب المالي',
          icon: Wallet,
          badge: withdrawals.filter((w) => w.status === 'pending').length || null,
          badgeColor: 'bg-rose-500',
        },
        { id: 'ledger' as AdminTab, label: 'كشف الحساب والسجل المالي', icon: BarChart3, badge: null },
      ],
    },
    {
      title: 'الأنظمة والذكاء الاصطناعي',
      items: [
        { id: 'mikrotik' as AdminTab, label: 'ربط المايكروتك RouterOS', icon: RouterIcon, badge: null },
        { id: 'ai_advisor' as AdminTab, label: 'مستشار Gemini AI للباقات', icon: Bot, badge: 'ذكائي', badgeColor: 'bg-emerald-500' },
        { id: 'wallets_api' as AdminTab, label: 'ربط محفظتي جيب وجوالي API', icon: Zap, badge: 'نشط 🟢', badgeColor: 'bg-emerald-600' },
      ],
    },
    {
      title: 'الأمان والمنظومة',
      items: [
        { id: 'users' as AdminTab, label: 'المستخدمين والصلاحيات', icon: Users, badge: null },
        { id: 'customers' as AdminTab, label: 'قاعدة بيانات العملاء', icon: Users, badge: null },
        { id: 'settings' as AdminTab, label: 'إعدادات المنظومة الشاملة', icon: Settings, badge: null },
      ],
    },
  ];

  if (isAuthenticated === null) {
    return (
      <div className={`min-h-screen flex flex-col items-center justify-center font-['Cairo',sans-serif] ${isDarkMode ? 'bg-[#0b101d]' : 'bg-slate-100'}`}>
        <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p className={`font-bold ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>جاري التحقق من الصلاحيات والوصول...</p>
      </div>
    );
  }

  if (isLoginPage) {
    return <>{children}</>;
  }

  return (
    <div
      dir="rtl"
      className={`min-h-screen font-['Cairo',sans-serif] flex transition-colors ${
        isDarkMode ? 'bg-[#0b101d] text-slate-100' : 'bg-slate-100 text-slate-800'
      }`}
    >
      {/* MOBILE OVERLAY BACKDROP */}
      {mobileMenuOpen && (
        <div
          onClick={() => setMobileMenuOpen(false)}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden transition-opacity"
        />
      )}

      {/* SIDEBAR NAVIGATION PANEL */}
      <aside
        className={`fixed lg:sticky top-0 z-50 h-screen transition-all duration-300 flex flex-col border-l shadow-2xl ${
          isDarkMode ? 'bg-[#121927] border-slate-800' : 'bg-white border-slate-200'
        } ${sidebarCollapsed ? 'w-20' : 'w-72'} ${
          mobileMenuOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Sidebar Header: Logo & Collapse Button */}
        <div className="p-4 border-b border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="shrink-0 flex items-center justify-center">
              <img 
                src={isDarkMode ? '/logos/logo-dark.png' : '/logos/logo-light.png'} 
                alt="Card Box Logo" 
                className="w-10 h-10 object-cover rounded-xl"
              />
            </div>
            {!sidebarCollapsed && (
              <div className="animate-in fade-in duration-200">
                <h1 className={`text-base font-black tracking-tight whitespace-nowrap ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>Card Box</h1>
                <span className="text-[10px] font-mono font-bold text-emerald-500 block">الإدارة العامة v2.6</span>
              </div>
            )}
          </div>

          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="hidden lg:flex p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            title={sidebarCollapsed ? 'توسيع القائمة' : 'طّي القائمة'}
          >
            {sidebarCollapsed ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
          </button>
        </div>

        {/* Sidebar Navigation Items */}
        <div className="flex-1 overflow-y-auto p-3 space-y-6 scrollbar-thin scrollbar-thumb-slate-800">
          {menuGroups.map((group, idx) => (
            <div key={idx} className="space-y-1.5">
              {!sidebarCollapsed && (
                <p className="px-3 text-[11px] font-extrabold uppercase tracking-wider text-slate-500 mb-1">
                  {group.title}
                </p>
              )}
              {group.items.map((item) => {
                const IconComp = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <Link
                    href={`/admin/${item.id}`}
                    key={item.id}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-2xl text-xs font-bold transition-all cursor-pointer relative group ${
                      isActive
                        ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-900/40 ring-2 ring-indigo-400/30'
                        : isDarkMode
                        ? 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
                        : 'text-slate-700 hover:bg-slate-200/70 hover:text-slate-900'
                    }`}
                    title={sidebarCollapsed ? item.label : undefined}
                  >
                    <IconComp className={`w-5 h-5 shrink-0 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-indigo-400'}`} />
                    {!sidebarCollapsed && (
                      <span className="truncate flex-1 text-right">{item.label}</span>
                    )}
                    {item.badge !== null && !sidebarCollapsed && (
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold text-white shadow-sm ${
                          item.badgeColor || 'bg-indigo-600'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          ))}
        </div>

        {/* Sidebar Footer: Theme Toggle & Exit */}
        <div className="p-3 border-t border-slate-800/80 space-y-2">
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className={`w-full flex items-center justify-center gap-2 p-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                isDarkMode ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
              }`}
            >
              <span>{isDarkMode ? '🌙 الوضع الليلي' : '☀️ الوضع النهار'}</span>
            </button>

            <button
              onClick={async () => {
                const token = typeof window !== 'undefined' ? localStorage.getItem('admin_auth_token') : null;
                if (token) {
                  try {
                    await fetch('/api/logout', {
                      method: 'POST',
                      headers: { 'Authorization': `Bearer ${token}` }
                    });
                  } catch (e) {}
                }
                localStorage.removeItem('admin_auth_token');
                localStorage.removeItem('admin_user');
                router.replace('/admin/login');
              }}
              className="w-full flex items-center justify-center gap-2 p-2.5 rounded-xl text-xs font-bold bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 border border-rose-500/20 transition-all cursor-pointer"
            >
              <Power className="w-4 h-4" />
              {!sidebarCollapsed && <span>تسجيل الخروج</span>}
            </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        {/* Top Header Controls Bar */}
        <header
          className={`sticky top-0 z-30 px-4 md:px-8 py-3.5 border-b backdrop-blur-md transition-colors flex items-center justify-between gap-4 ${
            isDarkMode ? 'bg-[#121927]/90 border-slate-800' : 'bg-white/90 border-slate-200'
          }`}
        >
          <div className="flex items-center gap-3">
            {/* Mobile Sidebar Toggle Button */}
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 rounded-xl bg-slate-800 text-white cursor-pointer"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div>
              <h2 className="text-base md:text-lg font-black text-white flex items-center gap-2">
                <span>
                  {activeTab === 'overview' && '📊 التحليلات والنظرة العامة على المنظومة'}
                  {activeTab === 'applications' && `📋 طلبات الانضمام المعلقة (${applications.length})`}
                  {activeTab === 'data_edits' && `📝 طلبات تعديل بيانات الشبكات (${dataEditRequests.length})`}
                  {activeTab === 'networks' && `📡 دليل شبكات الإنترنت النشطة (${activeNetworks.length})`}
                  {activeTab === 'inventory' && '🎴 إدارة كروت الشبكيات والمخزون المركزي'}
                  {activeTab === 'withdrawals' && '💸 طلبات سحب الأرباح والتحويل المالي'}
                  {activeTab === 'ledger' && '📜 كشف الحساب العام وسجل العمليات المركزية'}
                  {activeTab === 'mikrotik' && '🔌 إعدادات وربط المايكروتك RouterOS'}
                  {activeTab === 'ai_advisor' && '🤖 مستشار Gemini AI لتشغيل وتسعير الباقات'}
                  {activeTab === 'wallets_api' && '💳 ربط وتكامل واجهات محفظتي جيب وجوالي (API)'}
                  {activeTab === 'users' && '👥 إدارة مستخدمين وحسابات المشرفين والمالكين'}
                  {activeTab === 'customers' && '👥 قاعدة بيانات العملاء والمشترين'}
                  {activeTab === 'settings' && '⚙️ الإعدادات العامة وعمولات المنظومة'}
                </span>
              </h2>
              <p className="text-[11px] text-slate-400">لوحة تحكم إدارية مركزية للتحكم بالشبكات وحسابات محفظة جيب</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleExportCSV}
              className="hidden sm:flex px-3.5 py-2 rounded-xl text-xs font-bold bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 transition-all cursor-pointer items-center gap-1.5"
            >
              <Download className="w-4 h-4" />
              <span>تصدير CSV</span>
            </button>

            <div className="px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              <span>النظام متصل</span>
            </div>
          </div>
        </header>

        {/* Content Body Container */}
        <main className="flex-1 p-4 md:p-8 max-w-7xl w-full mx-auto space-y-6">{children}</main>
      </div>

      <GlobalAdminModals />
    </div>
  );
};