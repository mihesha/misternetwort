"use client";
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  AdminSystemStats,
  ActiveNetwork,
  WithdrawalRequest,
  CentralAuditLog,
  NetworkDataEditRequest,
  NetworkApplication
} from '../types';

interface AdminContextType {
  stats: AdminSystemStats;
  activeNetworks: ActiveNetwork[];
  withdrawals: WithdrawalRequest[];
  auditLogs: CentralAuditLog[];
  dataEditRequests: NetworkDataEditRequest[];
  platformCommissionRate: number;
  setPlatformCommissionRate: (rate: number) => void;
  supportPhone: string;
  setSupportPhone: (phone: string) => void;
  fetchAdminData: () => Promise<void>;
  setActiveNetworks: React.Dispatch<React.SetStateAction<ActiveNetwork[]>>;
  setWithdrawals: React.Dispatch<React.SetStateAction<WithdrawalRequest[]>>;
  setDataEditRequests: React.Dispatch<React.SetStateAction<NetworkDataEditRequest[]>>;
  

  inspectDataEditReq: NetworkDataEditRequest | null;
  setInspectDataEditReq: React.Dispatch<React.SetStateAction<NetworkDataEditRequest | null>>;
  adminUsers: any[];
  setAdminUsers: React.Dispatch<React.SetStateAction<any[]>>;
  maintenanceMode: boolean;
  setMaintenanceMode: React.Dispatch<React.SetStateAction<boolean>>;
  autoApproveApplications: boolean;
  setAutoApproveApplications: React.Dispatch<React.SetStateAction<boolean>>;
  mikrotikGlobalPort: string;
  setMikrotikGlobalPort: React.Dispatch<React.SetStateAction<string>>;
  // Modals State
  inspectApp: NetworkApplication | null;
  setInspectApp: React.Dispatch<React.SetStateAction<NetworkApplication | null>>;
  inspectNetwork: ActiveNetwork | null;
  setInspectNetwork: React.Dispatch<React.SetStateAction<ActiveNetwork | null>>;
  inspectNetworkCards: any[];
  setInspectNetworkCards: React.Dispatch<React.SetStateAction<any[]>>;
  inspectNetworkTab: 'overview' | 'cards' | 'withdrawals' | 'profile';
  setInspectNetworkTab: React.Dispatch<React.SetStateAction<'overview' | 'cards' | 'withdrawals' | 'profile'>>;
  inspectCardCatFilter: string;
  setInspectCardCatFilter: React.Dispatch<React.SetStateAction<string>>;
  inspectCardStatusFilter: string;
  setInspectCardStatusFilter: React.Dispatch<React.SetStateAction<string>>;
  inspectCardDateFilter: string;
  setInspectCardDateFilter: React.Dispatch<React.SetStateAction<string>>;
  inspectCardStartDate: string;
  setInspectCardStartDate: React.Dispatch<React.SetStateAction<string>>;
  inspectCardEndDate: string;
  setInspectCardEndDate: React.Dispatch<React.SetStateAction<string>>;
  inspectCardSearchQuery: string;
  setInspectCardSearchQuery: React.Dispatch<React.SetStateAction<string>>;
  editNetworkModal: ActiveNetwork | null;
  setEditNetworkModal: React.Dispatch<React.SetStateAction<ActiveNetwork | null>>;
  balanceAdjustNetwork: ActiveNetwork | null;
  setBalanceAdjustNetwork: React.Dispatch<React.SetStateAction<ActiveNetwork | null>>;
  adjustAmount: string;
  setAdjustAmount: React.Dispatch<React.SetStateAction<string>>;
  adjustNote: string;
  setAdjustNote: React.Dispatch<React.SetStateAction<string>>;
  payoutWdModal: WithdrawalRequest | null;
  setPayoutWdModal: React.Dispatch<React.SetStateAction<WithdrawalRequest | null>>;
  payoutRef: string;
  setPayoutRef: React.Dispatch<React.SetStateAction<string>>;
  payoutNotes: string;
  setPayoutNotes: React.Dispatch<React.SetStateAction<string>>;
  
  whatsappModalData: any | null;
  setWhatsappModalData: React.Dispatch<React.SetStateAction<any | null>>;
  copiedWpText: boolean;
  setCopiedWpText: React.Dispatch<React.SetStateAction<boolean>>;
  
  requestModifyApp: NetworkApplication | null;
  setRequestModifyApp: React.Dispatch<React.SetStateAction<NetworkApplication | null>>;
  modificationReasonText: string;
  setModificationReasonText: React.Dispatch<React.SetStateAction<string>>;
  whatsappModifyData: any | null;
  setWhatsappModifyData: React.Dispatch<React.SetStateAction<any | null>>;
  copiedModifyWpText: boolean;
  setCopiedModifyWpText: React.Dispatch<React.SetStateAction<boolean>>;
  
  showNewNetworkModal: boolean;
  setShowNewNetworkModal: React.Dispatch<React.SetStateAction<boolean>>;
  newNetName: string;
  setNewNetName: React.Dispatch<React.SetStateAction<string>>;
  newNetOwner: string;
  setNewNetOwner: React.Dispatch<React.SetStateAction<string>>;
  newNetPhone: string;
  setNewNetPhone: React.Dispatch<React.SetStateAction<string>>;
  newNetWallet: string;
  setNewNetWallet: React.Dispatch<React.SetStateAction<string>>;
  newNetGov: string;
  setNewNetGov: React.Dispatch<React.SetStateAction<string>>;
  newNetCity: string;
  setNewNetCity: React.Dispatch<React.SetStateAction<string>>;
  
  cardBatchNetId: string;
  setCardBatchNetId: React.Dispatch<React.SetStateAction<string>>;
  cardBatchCategory: string;
  setCardBatchCategory: React.Dispatch<React.SetStateAction<string>>;
  cardBatchCount: number;
  setCardBatchCount: React.Dispatch<React.SetStateAction<number>>;
  generatedBatch: Array<{ pin: string; serial: string }>;
  setGeneratedBatch: React.Dispatch<React.SetStateAction<Array<{ pin: string; serial: string }>>>;
  
  selectedMikrotikNet: ActiveNetwork | null;
  setSelectedMikrotikNet: React.Dispatch<React.SetStateAction<ActiveNetwork | null>>;
  mikrotikIpInput: string;
  setMikrotikIpInput: React.Dispatch<React.SetStateAction<string>>;
  mikrotikUserInput: string;
  setMikrotikUserInput: React.Dispatch<React.SetStateAction<string>>;
  mikrotikPassInput: string;
  setMikrotikPassInput: React.Dispatch<React.SetStateAction<string>>;
  copiedScript: boolean;
  setCopiedScript: React.Dispatch<React.SetStateAction<boolean>>;
  
  showNewUserModal: boolean;
  setShowNewUserModal: React.Dispatch<React.SetStateAction<boolean>>;
  newUserName: string;
  setNewUserName: React.Dispatch<React.SetStateAction<string>>;
  newUserEmail: string;
  setNewUserEmail: React.Dispatch<React.SetStateAction<string>>;
  newUserRole: string;
  setNewUserRole: React.Dispatch<React.SetStateAction<string>>;
  newUserPhone: string;
  setNewUserPhone: React.Dispatch<React.SetStateAction<string>>;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export const AdminProvider = ({ children }: { children: ReactNode }) => {
  const [stats, setStats] = useState<AdminSystemStats>({
    totalApplications: 0,
    pendingApplications: 0,
    approvedNetworks: 0,
    activeNetworksCount: 0,
    totalSystemBalance: 0,
    totalSalesVolume: 0,
    totalWithdrawalsCompleted: 0,
    pendingWithdrawalsCount: 0,
    pendingWithdrawalsAmount: 0,
    totalPlatformCommissions: 0,
  });
  
  const [activeNetworks, setActiveNetworks] = useState<ActiveNetwork[]>([]);
  const [withdrawals, setWithdrawals] = useState<WithdrawalRequest[]>([]);
  const [auditLogs, setAuditLogs] = useState<CentralAuditLog[]>([]);
  const [dataEditRequests, setDataEditRequests] = useState<NetworkDataEditRequest[]>([]);
  
  const [platformCommissionRate, setPlatformCommissionRate] = useState<number>(2.5);
  const [supportPhone, setSupportPhone] = useState<string>('784999804');

  // Modal States

  const [inspectDataEditReq, setInspectDataEditReq] = useState<NetworkDataEditRequest | null>(null);
  const [adminUsers, setAdminUsers] = useState<any[]>([]);
  const [maintenanceMode, setMaintenanceMode] = useState<boolean>(false);
  const [autoApproveApplications, setAutoApproveApplications] = useState<boolean>(false);
  const [mikrotikGlobalPort, setMikrotikGlobalPort] = useState<string>('8728');

  const [inspectApp, setInspectApp] = useState<NetworkApplication | null>(null);
  const [inspectNetwork, setInspectNetwork] = useState<ActiveNetwork | null>(null);
  const [inspectNetworkCards, setInspectNetworkCards] = useState<any[]>([]);
  const [inspectNetworkTab, setInspectNetworkTab] = useState<'overview' | 'cards' | 'withdrawals' | 'profile'>('overview');
  const [inspectCardCatFilter, setInspectCardCatFilter] = useState<string>('all');
  const [inspectCardStatusFilter, setInspectCardStatusFilter] = useState<string>('all');
  const [inspectCardDateFilter, setInspectCardDateFilter] = useState<string>('all');
  const [inspectCardStartDate, setInspectCardStartDate] = useState<string>('');
  const [inspectCardEndDate, setInspectCardEndDate] = useState<string>('');
  const [inspectCardSearchQuery, setInspectCardSearchQuery] = useState<string>('');
  const [editNetworkModal, setEditNetworkModal] = useState<ActiveNetwork | null>(null);
  const [balanceAdjustNetwork, setBalanceAdjustNetwork] = useState<ActiveNetwork | null>(null);
  const [adjustAmount, setAdjustAmount] = useState<string>('');
  const [adjustNote, setAdjustNote] = useState<string>('');
  const [payoutWdModal, setPayoutWdModal] = useState<WithdrawalRequest | null>(null);
  const [payoutRef, setPayoutRef] = useState<string>('');
  const [payoutNotes, setPayoutNotes] = useState<string>('');
  
  const [whatsappModalData, setWhatsappModalData] = useState<any | null>(null);
  const [copiedWpText, setCopiedWpText] = useState(false);
  
  const [requestModifyApp, setRequestModifyApp] = useState<NetworkApplication | null>(null);
  const [modificationReasonText, setModificationReasonText] = useState<string>('يرجى مراجعة وتعديل بيانات الطلب وفئات الكروت.');
  const [whatsappModifyData, setWhatsappModifyData] = useState<any | null>(null);
  const [copiedModifyWpText, setCopiedModifyWpText] = useState(false);
  
  const [showNewNetworkModal, setShowNewNetworkModal] = useState<boolean>(false);
  const [newNetName, setNewNetName] = useState('');
  const [newNetOwner, setNewNetOwner] = useState('');
  const [newNetPhone, setNewNetPhone] = useState('');
  const [newNetWallet, setNewNetWallet] = useState('');
  const [newNetGov, setNewNetGov] = useState('أمانة العاصمة (صنعاء)');
  const [newNetCity, setNewNetCity] = useState('السبعين');
  
  const [cardBatchNetId, setCardBatchNetId] = useState<string>('');
  const [cardBatchCategory, setCardBatchCategory] = useState<string>('500');
  const [cardBatchCount, setCardBatchCount] = useState<number>(0);
  const [generatedBatch, setGeneratedBatch] = useState<Array<{ pin: string; serial: string }>>([]);
  
  const [selectedMikrotikNet, setSelectedMikrotikNet] = useState<ActiveNetwork | null>(null);
  const [mikrotikIpInput, setMikrotikIpInput] = useState<string>('192.168.88.1');
  const [mikrotikUserInput, setMikrotikUserInput] = useState<string>('admin');
  const [mikrotikPassInput, setMikrotikPassInput] = useState<string>('');
  const [copiedScript, setCopiedScript] = useState<boolean>(false);
  
  const [showNewUserModal, setShowNewUserModal] = useState<boolean>(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserRole, setNewUserRole] = useState('مشرف حسابات');
  const [newUserPhone, setNewUserPhone] = useState('');

  const fetchAdminData = async () => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('admin_auth_token') : null;
      const headers: HeadersInit = token ? { 'Authorization': `Bearer ${token}` } : {};

      const [statsRes, networksRes, withdrawalsRes, logsRes, dataEditsRes, usersRes, settingsRes] = await Promise.all([
        fetch('/api/admin/stats', { headers }),
        fetch('/api/admin/networks', { headers }),
        fetch('/api/withdrawals', { headers }),
        fetch('/api/admin/transactions', { headers }),
        fetch('/api/admin/edit-requests', { headers }),
        fetch('/api/admin/users', { headers }),
        fetch('/api/admin/settings', { headers })
      ]);

      if (statsRes.ok) {
        setStats(await statsRes.json());
      }
      if (networksRes.ok) {
        const rawNetworks = await networksRes.json();
        const mappedNetworks = rawNetworks.map((net: any) => ({
          id: String(net.id),
          networkCode: net.network_code,
          networkName: net.name,
          ownerName: net.user?.name || 'مجهول',
          contactNumber: net.owner_phone || net.user?.phone || 'غير متوفر',
          jaibWalletNumber: net.jaib_wallet || 'غير متوفر',
          governorate: net.governorate,
          city: net.city || 'غير محدد',
          neighborhood: net.neighborhood || '',
          totalSalesVolume: parseFloat(net.total_sales || '0'),
          balance: parseFloat(net.balance || '0'),
          categories: (net.card_categories || []).map((cat: any) => ({
            value: cat.name || String(parseFloat(cat.price)),
            price: parseFloat(cat.price),
            remaining: cat.stock || 0
          }))
        }));
        setActiveNetworks(mappedNetworks);
      }
      if (withdrawalsRes.ok) {
        setWithdrawals(await withdrawalsRes.json());
      }
      if (logsRes.ok) {
        setAuditLogs(await logsRes.json());
      }
      if (usersRes.ok) {
        setAdminUsers(await usersRes.json());
      }
      if (settingsRes.ok) {
        const set = await settingsRes.json();
        setPlatformCommissionRate(set.platformCommissionRate ?? 2.5);
        setSupportPhone(set.supportPhone ?? '784999804');
        setMaintenanceMode(set.maintenanceMode ?? false);
        setAutoApproveApplications(set.autoApproveApplications ?? false);
        setMikrotikGlobalPort(set.mikrotikGlobalPort ?? '8728');
      }

      if (dataEditsRes.ok) {
        const rawEdits = await dataEditsRes.json();
        setDataEditRequests(rawEdits.map((e: any) => ({
          id: String(e.id),
          referenceNumber: e.referenceNumber || e.reference_number,
          networkCode: e.networkCode || e.network_code,
          networkName: e.networkName || e.network_name,
          ownerName: e.ownerName || e.owner_name,
          contactPhone: e.contactPhone || e.contact_phone,
          jaibWallet: e.jaibWallet || e.jaib_wallet,
          governorate: e.governorate,
          city: e.city,
          district: e.district || '',
          status: e.status,
          submittedAt: e.createdAt || e.created_at,
          processedAt: e.updatedAt || e.updated_at,
          adminResponse: e.adminNotes || e.admin_notes,
          categories: e.categories || [],
          previousData: e.previousData || {}
        })));
      }
    } catch (e) {
      console.error('Error fetching admin data:', e);
      // Mock data...
      setStats({
        totalApplications: 145,
        pendingApplications: 12,
        approvedNetworks: 133,
        activeNetworksCount: 132,
        totalSystemBalance: 1250000,
        totalSalesVolume: 8540000,
        totalWithdrawalsCompleted: 4200000,
        pendingWithdrawalsCount: 2,
        pendingWithdrawalsAmount: 100000,
        totalPlatformCommissions: 12000,
      });

      setActiveNetworks([
        {
          id: 'NET-001',
          networkCode: '1001',
          networkName: 'برق نت اللاسلكية',
          ownerName: 'هشام محمد الجايفي',
          contactNumber: '775945393',
          jaibWalletNumber: '775945393',
          governorate: 'صنعاء',
          city: 'همدان',
          neighborhood: 'شملان',
          balance: 145000,
          totalSalesVolume: 850000,
          status: 'active',
          createdAt: '2023-01-15T00:00:00Z',
          cardCategoriesCount: 3,
          mikrotikStatus: 'not_configured',
          categories: []
        },
      ]);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  return (
    <AdminContext.Provider
      value={{
        stats, activeNetworks, withdrawals, auditLogs, dataEditRequests, platformCommissionRate, setPlatformCommissionRate, supportPhone, setSupportPhone, fetchAdminData, setActiveNetworks, setWithdrawals, setDataEditRequests,
    
    inspectDataEditReq, setInspectDataEditReq,
    adminUsers, setAdminUsers,
    maintenanceMode, setMaintenanceMode,
    autoApproveApplications, setAutoApproveApplications,
    mikrotikGlobalPort, setMikrotikGlobalPort,
    inspectApp, setInspectApp,
        inspectNetwork, setInspectNetwork,
        inspectNetworkCards, setInspectNetworkCards,
        inspectNetworkTab, setInspectNetworkTab,
        inspectCardCatFilter, setInspectCardCatFilter,
        inspectCardStatusFilter, setInspectCardStatusFilter,
        inspectCardDateFilter, setInspectCardDateFilter,
        inspectCardStartDate, setInspectCardStartDate,
        inspectCardEndDate, setInspectCardEndDate,
        inspectCardSearchQuery, setInspectCardSearchQuery,
        editNetworkModal, setEditNetworkModal,
        balanceAdjustNetwork, setBalanceAdjustNetwork,
        adjustAmount, setAdjustAmount,
        adjustNote, setAdjustNote,
        payoutWdModal, setPayoutWdModal,
        payoutRef, setPayoutRef,
        payoutNotes, setPayoutNotes,
        whatsappModalData, setWhatsappModalData,
        copiedWpText, setCopiedWpText,
        requestModifyApp, setRequestModifyApp,
        modificationReasonText, setModificationReasonText,
        whatsappModifyData, setWhatsappModifyData,
        copiedModifyWpText, setCopiedModifyWpText,
        showNewNetworkModal, setShowNewNetworkModal,
        newNetName, setNewNetName,
        newNetOwner, setNewNetOwner,
        newNetPhone, setNewNetPhone,
        newNetWallet, setNewNetWallet,
        newNetGov, setNewNetGov,
        newNetCity, setNewNetCity,
        cardBatchNetId, setCardBatchNetId,
        cardBatchCategory, setCardBatchCategory,
        cardBatchCount, setCardBatchCount,
        generatedBatch, setGeneratedBatch,
        selectedMikrotikNet, setSelectedMikrotikNet,
        mikrotikIpInput, setMikrotikIpInput,
        mikrotikUserInput, setMikrotikUserInput,
        mikrotikPassInput, setMikrotikPassInput,
        copiedScript, setCopiedScript,
        showNewUserModal, setShowNewUserModal,
        newUserName, setNewUserName,
        newUserEmail, setNewUserEmail,
        newUserRole, setNewUserRole,
        newUserPhone, setNewUserPhone,
      }}
    >
      {children}
    </AdminContext.Provider>
  );
};

export const useAdminContext = () => {
  const context = useContext(AdminContext);
  if (context === undefined) {
    throw new Error('useAdminContext must be used within an AdminProvider');
  }
  return context;
};
