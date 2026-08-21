export type CardType = 'مستخدم فقط' | 'مستخدم + كلمة مرور';

export interface CardCategory {
  id: string;
  name: string;        // اسم الفئة (مثال: 100 ريال)
  price: number | '';  // السعر
  mega: number | '';   // الميجا
  hours: number | '';  // الساعات
  validityDays: number | ''; // أيام الصلاحية
  cardType: CardType; // نوع الكروت
}

export interface OwnerInfo {
  ownerName: string;    // اسم المالك
  ownerId: string;      // رقم المالك
  contactNumber: string;// رقم التواصل
}

export interface NetworkInfo {
  networkName: string;  // اسم الشبكة
  networkPhone: string; // رقم هاتف الشبكة
  governorate: string;  // المحافظة
  city: string;         // المدينة
  neighborhood: string; // المنطقة/الحي
}

export interface ApplicationFormData {
  owner: OwnerInfo;
  network: NetworkInfo;
  jaibWalletNumber: string; // رقم محفظة جيب
  cardCategories: CardCategory[];
}

export type ApplicationStatus = 'pending' | 'under_review' | 'approved' | 'rejected' | 'activated' | 'needs_modification';

export interface NetworkApplication {
  id: string;
  referenceNumber: string; // e.g. REQ-2026-8812
  createdAt: string;
  status: ApplicationStatus;
  formData: ApplicationFormData;
  notes?: string;
  tempPassword?: string;
  assignedPassword?: string;
  mustChangePassword?: boolean;
}

export interface OwnerCredential {
  ownerPhone: string;
  ownerName: string;
  networkName: string;
  tempPassword: string;
  currentPassword: string;
  mustChangePassword: boolean;
  createdAt: string;
}

export interface ActiveNetwork {
  id: string;
  networkName: string;
  networkCode: string;
  ownerName: string;
  contactNumber: string;
  jaibWalletNumber: string;
  governorate: string;
  city: string;
  neighborhood?: string;
  balance: number;
  status: 'active' | 'suspended' | 'pending_activation';
  createdAt: string;
  cardCategoriesCount: number;
  totalSalesVolume: number;
  mikrotikStatus: 'connected' | 'disconnected' | 'not_configured';
  categories: { value: string; remaining: number; price: number }[];
}

export interface WithdrawalRequest {
  id: string;
  requestNumber: string;
  networkId: string;
  networkName: string;
  ownerName: string;
  contactNumber: string;
  payoutMethod: string;
  accountNumber: string; // رقم الحساب / المحفظة
  recipientName: string;
  amount: number;
  status: 'pending' | 'completed' | 'rejected';
  requestedAt: string;
  processedAt?: string;
  transactionRef?: string;
  notes?: string;
}

export interface AdminSystemStats {
  totalApplications: number;
  pendingApplications: number;
  approvedNetworks: number;
  activeNetworksCount: number;
  totalSystemBalance: number;
  totalSalesVolume: number;
  totalWithdrawalsCompleted: number;
  pendingWithdrawalsCount: number;
  pendingWithdrawalsAmount: number;
  totalPlatformCommissions: number;
}

export interface CentralAuditLog {
  id: string;
  timestamp: string;
  networkName: string;
  type: 'sale' | 'withdrawal' | 'topup' | 'status_change' | 'commission';
  typeLabel: string;
  amount: number;
  description: string;
  reference: string;
  performedBy: string;
}

export interface NetworkDataEditRequest {
  id: string;
  referenceNumber: string;
  networkCode: string;
  networkName: string;
  ownerName: string;
  contactPhone: string;
  governorate: string;
  city: string;
  district: string;
  jaibWallet: string;
  adminNotes: string;
  categories: {
    id: string;
    name: string;
    price: string;
    mb: string;
    hours: string;
    validityDays: string;
    cardType: string;
    enabled: boolean;
  }[];
  previousData?: {
    networkName?: string;
    ownerName?: string;
    contactPhone?: string;
    governorate?: string;
    city?: string;
    district?: string;
    jaibWallet?: string;
    categories?: {
      id: string;
      name: string;
      price: string;
      mb: string;
      hours: string;
      validityDays: string;
      cardType: string;
      enabled: boolean;
    }[];
  };
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  processedAt?: string;
  adminResponse?: string;
}

export interface GovernorateData {
  name: string;
  cities: string[];
}

export interface WifiCardPackage {
  id: string;
  name: string; // e.g. "ابو 100"
  price: number; // in YER (ريال يمني)
  dataSize: string; // e.g. "400MB"
  duration: string; // e.g. "3 ساعات"
  validity: string; // e.g. "4 أيام"
  available: boolean;
  badgeText?: string; // e.g. "متوفر"
  popular?: boolean;
}

export interface WalletOption {
  id: string;
  name: string;
  nameAr: string;
  category: 'wallet' | 'bank' | 'exchange';
  icon: string;
  bgColor: string;
  textColor: string;
  borderColor: string;
  minAmount?: number;
  notice?: string;
  accountNumber: string;
  accountName: string;
  steps: string[];
}

export interface CartItem {
  packageId: string;
  wifiPackage: WifiCardPackage;
  quantity: number;
}

export type OrderStep = 'select' | 'payment' | 'verification' | 'receipt';

export interface GeneratedCard {
  packageId: string;
  packageName: string;
  networkName?: string;
  serialNumber: string;
  pinCode: string;
  dataSize: string;
  duration: string;
  expireDate: string;
}

export interface OrderDetails {
  orderId: string;
  items: CartItem[];
  totalAmount: number;
  totalCards: number;
  paymentMethod: WalletOption | null;
  senderPhone: string;
  senderName: string;
  transactionRef: string;
  date: string;
  status: 'pending' | 'completed' | 'failed';
  generatedCards: GeneratedCard[];
}

export interface UserAccount {
  fullName: string;
  phone: string;
  countryCode: string;
  isLoggedIn: boolean;
  balance?: number;
  wallet_balance?: number;
  token?: string;
}

export interface GuideStep {
  id: number;
  title: string;
  description: string;
  imageIcon: string;
  tip?: string;
}

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: 'purchasing' | 'payment' | 'troubleshooting' | 'general';
}

export interface PublicNetworkInfo {
  id: string;
  name: string;
  nameAr: string;
  location: string;
  coverageArea: string;
  activeNodes: number;
  status: 'online' | 'maintenance';
  supportPhone?: string;
}
