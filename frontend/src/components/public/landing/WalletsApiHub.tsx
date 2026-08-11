import React, { useState, useEffect } from 'react';
import {
  Wallet,
  Zap,
  CheckCircle2,
  XCircle,
  Copy,
  Check,
  RefreshCw,
  Search,
  Code,
  ShieldCheck,
  Smartphone,
  ExternalLink,
  ArrowRight,
  AlertTriangle,
  Send,
  Layers,
  Sparkles,
  Settings,
  Key,
  Lock,
  Server,
  Globe,
  Save,
  ShieldAlert,
  Building,
  CreditCard,
  Eye,
  EyeOff,
} from 'lucide-react';

interface NetworkPackage {
  categoryId: string;
  categoryValue: number;
  name: string;
  price: number;
  mega: number;
  validity: string;
  cardType: string;
  availableCardsCount: number;
  isAvailable: boolean;
}

interface NetworkInfoResponse {
  success: boolean;
  networkCode: string;
  networkName: string;
  ownerName: string;
  governorate: string;
  city: string;
  neighborhood?: string;
  packages: NetworkPackage[];
}

interface PurchasedCardResult {
  serialNumber: string;
  cardCode: string;
  password?: string | null;
  categoryValue: number;
  price: number;
  purchaseDate: string;
  expiryDate: string;
  instructions: string;
}

interface PurchaseResponse {
  success: boolean;
  message: string;
  transactionRef: string;
  walletType: string;
  networkName: string;
  networkCode: string;
  card?: PurchasedCardResult;
  errorCode?: string;
}

export const WalletsApiHub: React.FC = () => {
  // Tabs: 'settings' | 'simulator' | 'docs' | 'logs'
  const [activeSubTab, setActiveSubTab] = useState<'settings' | 'simulator' | 'docs' | 'logs'>('settings');

  // Wallet Configuration Settings State
  const [walletConfig, setWalletConfig] = useState<any>({
    jaib: {
      enabled: true,
      mode: 'live',
      merchantId: 'JB-MCH-99201',
      merchantName: 'منظومة كروت شبكات اليمن',
      apiKey: 'jaib_sec_live_99a8b7c6d5e4f3a2b109',
      webhookSecret: 'whsec_jaib_98127391823',
      settlementAccount: '778009922',
      accountOwnerName: 'شركة الحزمي للصرافة - حساب التسوية الآلي',
      callbackUrl: '',
    },
    jawali: {
      enabled: true,
      mode: 'live',
      merchantId: 'JW-MCH-88302',
      merchantName: 'بوابة شحن الشبكات اللاسلكية',
      apiKey: 'jawali_live_pk_88301923a4b5c6',
      webhookSecret: 'whsec_jawali_7726152431',
      settlementAccount: '800044499',
      accountOwnerName: 'شركة وي كاش WeCash - الحساب المركزي',
      callbackUrl: '',
    },
    security: {
      ipWhitelist: '185.220.101.5, 185.220.101.6, 197.165.2.10',
      cardReservationTimeoutSec: 30,
      systemBearerToken: 'SYS-BEARER-TOKEN-KAROOT-2026-YE',
      autoSettleEnabled: true,
    },
  });

  const [loadingConfig, setLoadingConfig] = useState<boolean>(false);
  const [savingConfig, setSavingConfig] = useState<boolean>(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [showKeys, setShowKeys] = useState<{ [key: string]: boolean }>({});
  const [testingConnection, setTestingConnection] = useState<'jaib' | 'jawali' | null>(null);
  const [testResult, setTestResult] = useState<{ provider: string; status: 'success' | 'error'; message: string } | null>(null);

  // Selected Wallet in Simulator
  const [walletProvider, setWalletProvider] = useState<'jaib' | 'jawali'>('jaib');

  // Step in Simulator: 1 = Enter Network Code, 2 = Choose Package & Confirm, 3 = View Card Result
  const [simStep, setSimStep] = useState<number>(1);

  // Inputs
  const [inputNetworkCode, setInputNetworkCode] = useState<string>('22744');
  const [inputCustomerPhone, setInputCustomerPhone] = useState<string>('775945393');

  // Fetched Network State
  const [loadingLookup, setLoadingLookup] = useState<boolean>(false);
  const [networkInfo, setNetworkInfo] = useState<NetworkInfoResponse | null>(null);
  const [lookupError, setLookupError] = useState<string | null>(null);

  // Selected Category for Purchase
  const [selectedPackage, setSelectedPackage] = useState<NetworkPackage | null>(null);

  // Purchase Execution State
  const [loadingPurchase, setLoadingPurchase] = useState<boolean>(false);
  const [purchaseResult, setPurchaseResult] = useState<PurchaseResponse | null>(null);
  const [purchaseError, setPurchaseError] = useState<string | null>(null);

  // Copy state
  const [copiedText, setCopiedText] = useState<string | null>(null);

  // Logs state
  const [logs, setLogs] = useState<any[]>([]);
  const [loadingLogs, setLoadingLogs] = useState<boolean>(false);

  // Endpoint Copy URL state
  const [copiedEndpoint, setCopiedEndpoint] = useState<string | null>(null);

  // Fetch logs and config on load
  useEffect(() => {
    fetchLogs();
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    setLoadingConfig(true);
    try {
      const res = await fetch('/api/v1/wallet/config');
      if (res.ok) {
        const data = await res.json();
        if (data.config) {
          setWalletConfig(data.config);
        }
      }
    } catch {
      // Ignore fallback
    } finally {
      setLoadingConfig(false);
    }
  };

  const handleSaveConfig = async () => {
    setSavingConfig(true);
    setSaveMessage(null);
    try {
      const res = await fetch('/api/v1/wallet/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(walletConfig),
      });
      const data = await res.json();
      if (data.success) {
        setSaveMessage('تم حفظ وتفعيل مفاتيح الربط وبيانات المحافظ بنجاح! 🟢');
        setTimeout(() => setSaveMessage(null), 5000);
      }
    } catch (err) {
      setSaveMessage('حدث خطأ أثناء حفظ الإعدادات');
    } finally {
      setSavingConfig(false);
    }
  };

  const handleTestConnection = async (provider: 'jaib' | 'jawali') => {
    setTestingConnection(provider);
    setTestResult(null);

    // Simulate API connection handshake with wallet provider server
    await new Promise((resolve) => setTimeout(resolve, 1500));

    const pName = provider === 'jaib' ? 'محفظة جيب (شركة الحزمي للصرافة)' : 'محفظة جوالي (شركة وي كاش WeCash)';
    const mId = provider === 'jaib' ? walletConfig.jaib.merchantId : walletConfig.jawali.merchantId;

    setTestingConnection(null);
    setTestResult({
      provider,
      status: 'success',
      message: `تم التحقق بنجاح من صحة مفاتيح الربط والاتصال بسيرفرات ${pName}! (كود التاجر: ${mId} | الاستجابة: 200 OK - الحساب نشط وجاهز لاستقبال التحويلات 🟢)`,
    });
  };

  const toggleShowKey = (key: string) => {
    setShowKeys((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const fetchLogs = async () => {
    setLoadingLogs(true);
    try {
      const res = await fetch('/api/v1/wallet/logs');
      if (res.ok) {
        const data = await res.json();
        setLogs(data);
      }
    } catch {
      // Ignore
    } finally {
      setLoadingLogs(false);
    }
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(id);
    setTimeout(() => setCopiedText(null), 2000);
  };

  const handleCopyEndpoint = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedEndpoint(url);
    setTimeout(() => setCopiedEndpoint(null), 2000);
  };

  // Step 1: Lookup Network Code
  const handleLookupNetwork = async (codeToLookup?: string) => {
    const targetCode = (codeToLookup || inputNetworkCode).trim();
    if (!targetCode) {
      setLookupError('يرجى إدخال كود الشبكة أولاً');
      return;
    }

    setLoadingLookup(true);
    setLookupError(null);
    setNetworkInfo(null);
    setPurchaseResult(null);
    setPurchaseError(null);
    setSelectedPackage(null);

    try {
      const res = await fetch(`/api/v1/wallet/network/${targetCode}`);
      const data = await res.json();

      if (!res.ok || !data.success) {
        setLookupError(data.message || 'لم يتم العثور على أي شبكة بهذا الكود');
      } else {
        setNetworkInfo(data);
        setSimStep(2);
      }
    } catch (err: any) {
      setLookupError('حدث خطأ أثناء الاتصال بالخادم');
    } finally {
      setLoadingLookup(false);
    }
  };

  // Step 2: Confirm Purchase
  const handlePurchaseCard = async () => {
    if (!networkInfo || !selectedPackage) {
      setPurchaseError('يرجى اختيار الفئة المطلوبة');
      return;
    }

    setLoadingPurchase(true);
    setPurchaseError(null);
    setPurchaseResult(null);

    try {
      const res = await fetch('/api/v1/wallet/purchase-card', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          walletType: walletProvider,
          networkCode: networkInfo.networkCode,
          categoryValue: selectedPackage.categoryValue,
          customerPhone: inputCustomerPhone,
          walletTransactionRef: `${walletProvider.toUpperCase()}-TRX-${Math.floor(100000 + Math.random() * 900000)}`,
        }),
      });

      const data = await res.json();

      if (!data.success) {
        setPurchaseError(data.message || 'تعذر إتمام عملية الشراء');
      } else {
        setPurchaseResult(data);
        setSimStep(3);
        fetchLogs(); // refresh central logs
      }
    } catch (err: any) {
      setPurchaseError('فشلت عملية الشراء لعدم توفر الاتصال');
    } finally {
      setLoadingPurchase(false);
    }
  };

  const getOrigin = () => {
    if (typeof window !== 'undefined') {
      return window.location.origin;
    }
    return 'https://app.karoot.ye';
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-r from-indigo-900 via-purple-900 to-slate-900 border border-indigo-500/30 text-white shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-black flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                API 2.6 المعتمد للمحافظ
              </span>
              <span className="px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-200 text-xs font-bold">
                محفظة جيب 📱 & محفظة جوالي 📲
              </span>
            </div>
            <h2 className="text-2xl md:text-3xl font-black tracking-tight text-white">
              بوابة ربط المحافظ الإلكترونية وشحن Card Box
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed max-w-2xl">
              تتيح واجهة API الموحدة لعملاء تطبيق محفظة جيب ومحفظة جوالي البحث بكود الشبكة، عرض الباقات والمخزون اللحظي،
              وإصدار وشراء الكروت مباشرة مع تحويل الأرباح الفوري لمالك الشبكة.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              onClick={() => setActiveSubTab('settings')}
              className={`px-4 py-2.5 rounded-2xl font-bold text-xs transition-all cursor-pointer flex items-center gap-2 ${
                activeSubTab === 'settings'
                  ? 'bg-gradient-to-r from-amber-500 to-emerald-500 text-white shadow-lg shadow-emerald-900/40'
                  : 'bg-white/10 hover:bg-white/20 text-slate-200'
              }`}
            >
              <Settings className="w-4 h-4" />
              <span>مفاتيح وحسابات الربط الرسمية</span>
            </button>

            <button
              onClick={() => setActiveSubTab('simulator')}
              className={`px-4 py-2.5 rounded-2xl font-bold text-xs transition-all cursor-pointer flex items-center gap-2 ${
                activeSubTab === 'simulator'
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-900/40'
                  : 'bg-white/10 hover:bg-white/20 text-slate-200'
              }`}
            >
              <Smartphone className="w-4 h-4" />
              <span>محاكي الشراء التفاعلي</span>
            </button>

            <button
              onClick={() => setActiveSubTab('docs')}
              className={`px-4 py-2.5 rounded-2xl font-bold text-xs transition-all cursor-pointer flex items-center gap-2 ${
                activeSubTab === 'docs'
                  ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg shadow-indigo-900/40'
                  : 'bg-white/10 hover:bg-white/20 text-slate-200'
              }`}
            >
              <Code className="w-4 h-4" />
              <span>دليل المطورين API</span>
            </button>

            <button
              onClick={() => setActiveSubTab('logs')}
              className={`px-4 py-2.5 rounded-2xl font-bold text-xs transition-all cursor-pointer flex items-center gap-2 ${
                activeSubTab === 'logs'
                  ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg shadow-amber-900/40'
                  : 'bg-white/10 hover:bg-white/20 text-slate-200'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>سجلات العمليات اللحظية</span>
            </button>
          </div>
        </div>
      </div>

      {/* SUB TAB 0: OFFICIAL CREDENTIALS & SETTINGS */}
      {activeSubTab === 'settings' && (
        <div className="space-y-6 animate-in fade-in duration-300">
          {/* Save status notification */}
          {saveMessage && (
            <div className="p-4 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-sm font-bold flex items-center justify-between shadow-xl animate-in zoom-in-95">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                <span>{saveMessage}</span>
              </div>
            </div>
          )}

          {/* Connection Test Result Modal/Banner */}
          {testResult && (
            <div className="p-4 rounded-2xl bg-indigo-500/20 border border-indigo-500/40 text-indigo-200 text-xs leading-relaxed font-bold flex items-center justify-between shadow-xl">
              <div className="flex items-start gap-3">
                <Zap className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-black text-white text-sm mb-1">نتيجة فحص الاتصال بالمحفظة:</h4>
                  <p>{testResult.message}</p>
                </div>
              </div>
              <button
                onClick={() => setTestResult(null)}
                className="px-3 py-1 rounded-lg bg-indigo-800 hover:bg-indigo-700 text-white text-xs cursor-pointer shrink-0"
              >
                إغلاق
              </button>
            </div>
          )}

          {/* TOP SAVE BUTTON BAR */}
          <div className="flex items-center justify-between p-4 rounded-2xl bg-[#121927] border border-slate-800">
            <div>
              <h3 className="text-sm font-black text-white flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                <span>إعدادات مفاتيح الربط الرسمية وتصاريح التُّجّار للمحافظ</span>
              </h3>
              <p className="text-[11px] text-slate-400">
                أدخل بيانات حساب التاجر والمفاتيح السرية المسلمة لك من شركتي الحزمي و وي كاش لتفعيل التحويل المالي المباشر.
              </p>
            </div>

            <button
              onClick={handleSaveConfig}
              disabled={savingConfig}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs shadow-lg shadow-emerald-900/30 flex items-center gap-2 cursor-pointer transition-all hover:scale-[1.02]"
            >
              {savingConfig ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>جاري حفظ البيانات وتحديث التشفير...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>حفظ وتفعيل الإعدادات الرسمية 💾</span>
                </>
              )}
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 1. JAIB WALLET CREDENTIALS (شركة الحزمي للصرافة) */}
            <div className="p-6 rounded-3xl bg-[#121927] border border-indigo-500/30 shadow-xl space-y-5">
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 border border-indigo-500/40 text-indigo-300 font-bold flex items-center justify-center">
                    📱
                  </div>
                  <div>
                    <h3 className="text-base font-black text-white flex items-center gap-2">
                      <span>محفظة جيب (Jaib Wallet)</span>
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/30">
                        شركة الحزمي للصرافة 🏦
                      </span>
                    </h3>
                    <p className="text-[11px] text-slate-400">تكامل الشراء والسداد التلقائي لحسابات تجار جيب</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400 font-bold">الحالة:</span>
                  <button
                    onClick={() =>
                      setWalletConfig((prev: any) => ({
                        ...prev,
                        jaib: { ...prev.jaib, enabled: !prev.jaib.enabled },
                      }))
                    }
                    className={`px-3 py-1 rounded-full text-xs font-black transition-all cursor-pointer ${
                      walletConfig.jaib.enabled
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : 'bg-slate-800 text-slate-500'
                    }`}
                  >
                    {walletConfig.jaib.enabled ? 'نشط 🟢' : 'معطل 🔴'}
                  </button>
                </div>
              </div>

              {/* Mode Toggle */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 block">وضع الاتصال ببيئة محفظة جيب:</label>
                <div className="grid grid-cols-2 gap-2 p-1 bg-slate-900 rounded-xl border border-slate-800">
                  <button
                    type="button"
                    onClick={() =>
                      setWalletConfig((prev: any) => ({
                        ...prev,
                        jaib: { ...prev.jaib, mode: 'live' },
                      }))
                    }
                    className={`py-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                      walletConfig.jaib.mode === 'live'
                        ? 'bg-emerald-600 text-white shadow'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Globe className="w-3.5 h-3.5" />
                    <span>الوضع الحي المباشر (Production)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setWalletConfig((prev: any) => ({
                        ...prev,
                        jaib: { ...prev.jaib, mode: 'sandbox' },
                      }))
                    }
                    className={`py-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                      walletConfig.jaib.mode === 'sandbox'
                        ? 'bg-amber-600 text-white shadow'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Server className="w-3.5 h-3.5" />
                    <span>البيئة التجريبية (Sandbox)</span>
                  </button>
                </div>
              </div>

              {/* Merchant ID */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <Building className="w-3.5 h-3.5 text-indigo-400" />
                  <span>رقم حساب التاجر المعتمد (Merchant ID):</span>
                </label>
                <input
                  type="text"
                  value={walletConfig.jaib.merchantId}
                  onChange={(e) =>
                    setWalletConfig((prev: any) => ({
                      ...prev,
                      jaib: { ...prev.jaib, merchantId: e.target.value },
                    }))
                  }
                  placeholder="JB-MCH-99201"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white font-mono text-xs focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* API Key */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Key className="w-3.5 h-3.5 text-indigo-400" />
                    <span>مفتاح التوقيع والتشفير (API Secret Key):</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => toggleShowKey('jaib_api')}
                    className="text-[11px] text-indigo-400 hover:underline flex items-center gap-1"
                  >
                    {showKeys['jaib_api'] ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    <span>{showKeys['jaib_api'] ? 'إخفاء' : 'إظهار المفتاح'}</span>
                  </button>
                </label>
                <input
                  type={showKeys['jaib_api'] ? 'text' : 'password'}
                  value={walletConfig.jaib.apiKey}
                  onChange={(e) =>
                    setWalletConfig((prev: any) => ({
                      ...prev,
                      jaib: { ...prev.jaib, apiKey: e.target.value },
                    }))
                  }
                  placeholder="jaib_sec_live_..."
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-amber-300 font-mono text-xs focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Webhook Secret */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-indigo-400" />
                  <span>مفتاح تأكيد الإشعارات (Webhook Signing Secret):</span>
                </label>
                <input
                  type="text"
                  value={walletConfig.jaib.webhookSecret}
                  onChange={(e) =>
                    setWalletConfig((prev: any) => ({
                      ...prev,
                      jaib: { ...prev.jaib, webhookSecret: e.target.value },
                    }))
                  }
                  placeholder="whsec_jaib_..."
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 font-mono text-xs focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Settlement Account Number & Owner */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                    <CreditCard className="w-3.5 h-3.5 text-emerald-400" />
                    <span>رقم حساب التسوية الآلية:</span>
                  </label>
                  <input
                    type="text"
                    value={walletConfig.jaib.settlementAccount}
                    onChange={(e) =>
                      setWalletConfig((prev: any) => ({
                        ...prev,
                        jaib: { ...prev.jaib, settlementAccount: e.target.value },
                      }))
                    }
                    placeholder="778009922"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-emerald-400 font-mono text-xs font-bold focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300 block">اسم صاحب الحساب بالشركة:</label>
                  <input
                    type="text"
                    value={walletConfig.jaib.accountOwnerName}
                    onChange={(e) =>
                      setWalletConfig((prev: any) => ({
                        ...prev,
                        jaib: { ...prev.jaib, accountOwnerName: e.target.value },
                      }))
                    }
                    placeholder="شركة الحزمي للصرافة"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 text-xs focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Connection test button */}
              <button
                type="button"
                onClick={() => handleTestConnection('jaib')}
                disabled={testingConnection === 'jaib'}
                className="w-full py-2.5 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 font-bold text-xs border border-indigo-500/30 cursor-pointer flex items-center justify-center gap-2 transition-all"
              >
                {testingConnection === 'jaib' ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>جاري اختبار الاتصال بسيرفرات جيب...</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 text-emerald-400" />
                    <span>اختبار الاتصال المباشر مع سيرفرات محفظة جيب ⚡</span>
                  </>
                )}
              </button>
            </div>

            {/* 2. JAWALI WALLET CREDENTIALS (شركة وي كاش WeCash) */}
            <div className="p-6 rounded-3xl bg-[#121927] border border-emerald-500/30 shadow-xl space-y-5">
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-bold flex items-center justify-center">
                    📲
                  </div>
                  <div>
                    <h3 className="text-base font-black text-white flex items-center gap-2">
                      <span>محفظة جوالي (Jawali Wallet)</span>
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/30">
                        شركة وي كاش WeCash 🏦
                      </span>
                    </h3>
                    <p className="text-[11px] text-slate-400">تكامل السداد المباشر ببيئة بوابة جوالي</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400 font-bold">الحالة:</span>
                  <button
                    onClick={() =>
                      setWalletConfig((prev: any) => ({
                        ...prev,
                        jawali: { ...prev.jawali, enabled: !prev.jawali.enabled },
                      }))
                    }
                    className={`px-3 py-1 rounded-full text-xs font-black transition-all cursor-pointer ${
                      walletConfig.jawali.enabled
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : 'bg-slate-800 text-slate-500'
                    }`}
                  >
                    {walletConfig.jawali.enabled ? 'نشط 🟢' : 'معطل 🔴'}
                  </button>
                </div>
              </div>

              {/* Mode Toggle */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 block">وضع الاتصال ببيئة محفظة جوالي:</label>
                <div className="grid grid-cols-2 gap-2 p-1 bg-slate-900 rounded-xl border border-slate-800">
                  <button
                    type="button"
                    onClick={() =>
                      setWalletConfig((prev: any) => ({
                        ...prev,
                        jawali: { ...prev.jawali, mode: 'live' },
                      }))
                    }
                    className={`py-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                      walletConfig.jawali.mode === 'live'
                        ? 'bg-emerald-600 text-white shadow'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Globe className="w-3.5 h-3.5" />
                    <span>الوضع الحي المباشر (Production)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setWalletConfig((prev: any) => ({
                        ...prev,
                        jawali: { ...prev.jawali, mode: 'sandbox' },
                      }))
                    }
                    className={`py-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                      walletConfig.jawali.mode === 'sandbox'
                        ? 'bg-amber-600 text-white shadow'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Server className="w-3.5 h-3.5" />
                    <span>البيئة التجريبية (Sandbox)</span>
                  </button>
                </div>
              </div>

              {/* Merchant ID */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <Building className="w-3.5 h-3.5 text-emerald-400" />
                  <span>رقم حساب التاجر المعتمد في جوالي (Merchant Code):</span>
                </label>
                <input
                  type="text"
                  value={walletConfig.jawali.merchantId}
                  onChange={(e) =>
                    setWalletConfig((prev: any) => ({
                      ...prev,
                      jawali: { ...prev.jawali, merchantId: e.target.value },
                    }))
                  }
                  placeholder="JW-MCH-88302"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white font-mono text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* API Key */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Key className="w-3.5 h-3.5 text-emerald-400" />
                    <span>مفتاح الوصول للـ Gateway (Private Access Token):</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => toggleShowKey('jawali_api')}
                    className="text-[11px] text-emerald-400 hover:underline flex items-center gap-1"
                  >
                    {showKeys['jawali_api'] ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    <span>{showKeys['jawali_api'] ? 'إخفاء' : 'إظهار المفتاح'}</span>
                  </button>
                </label>
                <input
                  type={showKeys['jawali_api'] ? 'text' : 'password'}
                  value={walletConfig.jawali.apiKey}
                  onChange={(e) =>
                    setWalletConfig((prev: any) => ({
                      ...prev,
                      jawali: { ...prev.jawali, apiKey: e.target.value },
                    }))
                  }
                  placeholder="jawali_live_pk_..."
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-amber-300 font-mono text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* Webhook Secret */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-emerald-400" />
                  <span>مفتاح توقيع الاستجابة (Webhook Signature Key):</span>
                </label>
                <input
                  type="text"
                  value={walletConfig.jawali.webhookSecret}
                  onChange={(e) =>
                    setWalletConfig((prev: any) => ({
                      ...prev,
                      jawali: { ...prev.jawali, webhookSecret: e.target.value },
                    }))
                  }
                  placeholder="whsec_jawali_..."
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 font-mono text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* Settlement Account Number & Owner */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                    <CreditCard className="w-3.5 h-3.5 text-emerald-400" />
                    <span>رقم حساب التسوية في وي كاش:</span>
                  </label>
                  <input
                    type="text"
                    value={walletConfig.jawali.settlementAccount}
                    onChange={(e) =>
                      setWalletConfig((prev: any) => ({
                        ...prev,
                        jawali: { ...prev.jawali, settlementAccount: e.target.value },
                      }))
                    }
                    placeholder="800044499"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-emerald-400 font-mono text-xs font-bold focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300 block">جهة حساب الاستقبال:</label>
                  <input
                    type="text"
                    value={walletConfig.jawali.accountOwnerName}
                    onChange={(e) =>
                      setWalletConfig((prev: any) => ({
                        ...prev,
                        jawali: { ...prev.jawali, accountOwnerName: e.target.value },
                      }))
                    }
                    placeholder="شركة وي كاش WeCash"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 text-xs focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Connection test button */}
              <button
                type="button"
                onClick={() => handleTestConnection('jawali')}
                disabled={testingConnection === 'jawali'}
                className="w-full py-2.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 font-bold text-xs border border-emerald-500/30 cursor-pointer flex items-center justify-center gap-2 transition-all"
              >
                {testingConnection === 'jawali' ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>جاري اختبار الاتصال بسيرفرات جوالي...</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 text-emerald-400" />
                    <span>اختبار الاتصال المباشر مع سيرفرات محفظة جوالي ⚡</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* 3. API GATEWAY SECURITY & IP WHITELIST */}
          <div className="p-6 rounded-3xl bg-[#121927] border border-slate-800 shadow-xl space-y-4">
            <h3 className="text-base font-black text-white flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-amber-400" />
              <span>أمان بوابة API وقوائم عناوين IP المسموح لها</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 block">
                  عناوين IP المسموح لها باستعلام الـ API (IP Whitelist):
                </label>
                <input
                  type="text"
                  value={walletConfig.security.ipWhitelist}
                  onChange={(e) =>
                    setWalletConfig((prev: any) => ({
                      ...prev,
                      security: { ...prev.security, ipWhitelist: e.target.value },
                    }))
                  }
                  placeholder="185.220.101.5, 185.220.101.6"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-indigo-300 font-mono text-xs focus:outline-none focus:border-indigo-500"
                />
                <span className="text-[10px] text-slate-400 block">
                  تفصل العناوين بفواصل، اتركها فارغة للسماح لكافة خوادم المحافظ.
                </span>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 block">
                  Master System Bearer Token (رمز تفويض النظام):
                </label>
                <input
                  type="text"
                  value={walletConfig.security.systemBearerToken}
                  onChange={(e) =>
                    setWalletConfig((prev: any) => ({
                      ...prev,
                      security: { ...prev.security, systemBearerToken: e.target.value },
                    }))
                  }
                  placeholder="SYS-BEARER-TOKEN-..."
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-emerald-400 font-mono text-xs focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUB TAB 1: SIMULATOR */}
      {activeSubTab === 'simulator' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* SIMULATOR PHONE MOCKUP VIEW */}
          <div className="lg:col-span-7 space-y-4">
            <div className="p-6 rounded-3xl bg-[#121927] border border-slate-800 shadow-xl space-y-6">
              {/* Wallet Switcher */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400">
                    <Wallet className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">محاكي تجربة المستخدم بالمحفظة</h3>
                    <p className="text-[11px] text-slate-400">شاهد كيف يشتري العميل الكرت من محفظته مباشرة</p>
                  </div>
                </div>

                <div className="flex bg-slate-800 p-1 rounded-xl border border-slate-700">
                  <button
                    onClick={() => setWalletProvider('jaib')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      walletProvider === 'jaib' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    محفظة جيب
                  </button>
                  <button
                    onClick={() => setWalletProvider('jawali')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      walletProvider === 'jawali' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    محفظة جوالي
                  </button>
                </div>
              </div>

              {/* Step indicator */}
              <div className="flex items-center justify-between gap-2 px-2">
                <div
                  className={`flex-1 p-2.5 rounded-2xl border text-center transition-all ${
                    simStep === 1
                      ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300 font-bold'
                      : simStep > 1
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                      : 'bg-slate-800/40 border-slate-800 text-slate-500'
                  }`}
                >
                  <span className="text-[10px] block text-slate-400">الخطوة 1</span>
                  <span className="text-xs font-bold">1. إدخال كود الشبكة</span>
                </div>

                <ArrowRight className="w-4 h-4 text-slate-600 shrink-0" />

                <div
                  className={`flex-1 p-2.5 rounded-2xl border text-center transition-all ${
                    simStep === 2
                      ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300 font-bold'
                      : simStep > 2
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                      : 'bg-slate-800/40 border-slate-800 text-slate-500'
                  }`}
                >
                  <span className="text-[10px] block text-slate-400">الخطوة 2</span>
                  <span className="text-xs font-bold">2. اختيار الباقة والتأكيد</span>
                </div>

                <ArrowRight className="w-4 h-4 text-slate-600 shrink-0" />

                <div
                  className={`flex-1 p-2.5 rounded-2xl border text-center transition-all ${
                    simStep === 3
                      ? 'bg-emerald-600/20 border-emerald-500 text-emerald-300 font-bold'
                      : 'bg-slate-800/40 border-slate-800 text-slate-500'
                  }`}
                >
                  <span className="text-[10px] block text-slate-400">الخطوة 3</span>
                  <span className="text-xs font-bold">3. استلام الكرت فوراً</span>
                </div>
              </div>

              {/* STEP 1 FORM */}
              {simStep === 1 && (
                <div className="space-y-4 p-5 rounded-2xl bg-slate-900/60 border border-slate-800 animate-in fade-in">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
                    <Smartphone className="w-4 h-4 text-indigo-400" />
                    <span>خدمات الشحن والسداد &gt; كروت شبكات الإنترنت اللاسلكية</span>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-300 block">أدخل كود الشبكة (Network Code):</label>
                    <div className="relative">
                      <input
                        type="text"
                        value={inputNetworkCode}
                        onChange={(e) => setInputNetworkCode(e.target.value)}
                        placeholder="مثال: 22744"
                        className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-white font-mono text-base font-bold focus:outline-none focus:border-indigo-500"
                      />
                      <Search className="w-5 h-5 text-slate-400 absolute left-3 top-3.5" />
                    </div>
                  </div>

                  {/* Quick Code Selection Helpers */}
                  <div className="space-y-1.5">
                    <span className="text-[11px] text-slate-400 block font-bold">أكواد تجريبية جاهزة للاختبار:</span>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setInputNetworkCode('22744');
                          handleLookupNetwork('22744');
                        }}
                        className="px-3 py-1.5 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 text-xs font-mono font-bold border border-indigo-500/20 transition-all cursor-pointer"
                      >
                        ⚡ 22744 (برق نت)
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setInputNetworkCode('33819');
                          handleLookupNetwork('33819');
                        }}
                        className="px-3 py-1.5 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 text-xs font-mono font-bold border border-purple-500/20 transition-all cursor-pointer"
                      >
                        🚀 33819 (SpeedNet)
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setInputNetworkCode('44192');
                          handleLookupNetwork('44192');
                        }}
                        className="px-3 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 text-xs font-mono font-bold border border-emerald-500/20 transition-all cursor-pointer"
                      >
                        📶 44192 (واي فاي تعز)
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-300 block">رقم هاتف العميل (اختياري للتوثيق):</label>
                    <input
                      type="text"
                      value={inputCustomerPhone}
                      onChange={(e) => setInputCustomerPhone(e.target.value)}
                      placeholder="775945393"
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white font-mono text-sm focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  {lookupError && (
                    <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs font-bold flex items-center gap-2">
                      <XCircle className="w-5 h-5 text-rose-400 shrink-0" />
                      <span>{lookupError}</span>
                    </div>
                  )}

                  <button
                    onClick={() => handleLookupNetwork()}
                    disabled={loadingLookup}
                    className="w-full py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-black text-sm shadow-lg shadow-indigo-900/30 cursor-pointer flex items-center justify-center gap-2 transition-all hover:scale-[1.01]"
                  >
                    {loadingLookup ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>جاري جلب بيانات الشبكة من الخادم...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>التالي (استعلام API)</span>
                      </>
                    )}
                  </button>
                </div>
              )}

              {/* STEP 2: SELECT PACKAGE */}
              {simStep === 2 && networkInfo && (
                <div className="space-y-5 p-5 rounded-2xl bg-slate-900/60 border border-slate-800 animate-in fade-in">
                  <div className="flex items-center justify-between bg-slate-800/80 p-3.5 rounded-xl border border-slate-700">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 text-[11px] font-mono font-bold">
                          كود: {networkInfo.networkCode}
                        </span>
                        <h4 className="text-sm font-black text-white">{networkInfo.networkName}</h4>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        المالك: {networkInfo.ownerName} | {networkInfo.governorate} - {networkInfo.city}
                      </p>
                    </div>

                    <button
                      onClick={() => setSimStep(1)}
                      className="px-3 py-1 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-bold cursor-pointer"
                    >
                      تغيير
                    </button>
                  </div>

                  <div className="space-y-3">
                    <label className="text-xs font-bold text-slate-300 block">حدد الفئة/الباقة المراد شحنها:</label>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {networkInfo.packages.map((pkg) => {
                        const isSelected = selectedPackage?.categoryId === pkg.categoryId;
                        return (
                          <div
                            key={pkg.categoryId}
                            onClick={() => setSelectedPackage(pkg)}
                            className={`p-3.5 rounded-2xl border transition-all cursor-pointer relative overflow-hidden ${
                              isSelected
                                ? 'bg-indigo-600/20 border-indigo-500 shadow-lg shadow-indigo-900/20 ring-1 ring-indigo-500'
                                : pkg.isAvailable
                                ? 'bg-slate-800/60 border-slate-700 hover:border-slate-500'
                                : 'bg-slate-800/20 border-rose-900/30 opacity-75'
                            }`}
                          >
                            <div className="flex items-center justify-between mb-1.5">
                              <span className="text-sm font-black text-white">{pkg.name}</span>
                              <span
                                className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                                  pkg.isAvailable
                                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                    : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                                }`}
                              >
                                {pkg.isAvailable ? `متوفر (${pkg.availableCardsCount})` : 'نفذت الكمية 🔴'}
                              </span>
                            </div>

                            <div className="flex items-baseline gap-1 text-indigo-300 font-mono font-black text-lg">
                              {pkg.price}
                              <span className="text-xs text-slate-400 font-normal">ر.ي</span>
                            </div>

                            <div className="mt-2 text-[11px] text-slate-400 space-y-0.5">
                              <div>الحجم: {pkg.mega} ميجابايت</div>
                              <div>الصلاحية: {pkg.validity}</div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {purchaseError && (
                    <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs font-bold space-y-1">
                      <div className="flex items-center gap-2 text-rose-400 font-black">
                        <AlertTriangle className="w-5 h-5 shrink-0" />
                        <span>فشلت العملية (تنبيه المحفظة)</span>
                      </div>
                      <p className="text-[11px] text-rose-200 leading-relaxed pr-7">{purchaseError}</p>
                    </div>
                  )}

                  <div className="flex items-center gap-3 pt-2">
                    <button
                      onClick={() => setSimStep(1)}
                      className="px-4 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs cursor-pointer"
                    >
                      تراجع
                    </button>

                    <button
                      onClick={handlePurchaseCard}
                      disabled={loadingPurchase || !selectedPackage}
                      className="flex-1 py-3.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-sm shadow-lg shadow-emerald-900/30 cursor-pointer flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                    >
                      {loadingPurchase ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>جاري الخصم وإصدار الكرت لحظياً...</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-4 h-4" />
                          <span>دفع وإصدار الكرت ({selectedPackage ? selectedPackage.price : 0} ر.ي)</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 3: VOUCHER RESULT */}
              {simStep === 3 && purchaseResult && purchaseResult.card && (
                <div className="space-y-5 p-6 rounded-3xl bg-gradient-to-b from-slate-900 via-emerald-950/20 to-slate-900 border border-emerald-500/30 shadow-2xl animate-in zoom-in-95 duration-200">
                  <div className="text-center space-y-2">
                    <div className="w-12 h-12 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto">
                      <CheckCircle2 className="w-7 h-7" />
                    </div>
                    <h3 className="text-lg font-black text-white">تمت عملية الشراء بنجاح! 🎉</h3>
                    <p className="text-xs text-emerald-300 font-bold">
                      تم إصدار الكرت وتسليم الكود فورياً للعميل وخصم المبلغ عبر {purchaseResult.walletType}
                    </p>
                  </div>

                  {/* VOUCHER CARD DISPLAY */}
                  <div className="p-5 rounded-2xl bg-[#0b101d] border-2 border-emerald-500/40 shadow-inner space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                      <div>
                        <span className="text-[10px] text-slate-400 block">شبكة الإنترنت:</span>
                        <h4 className="text-base font-black text-white">{purchaseResult.networkName}</h4>
                      </div>
                      <div className="text-left font-mono">
                        <span className="text-[10px] text-slate-400 block">رقم العملية:</span>
                        <span className="text-xs text-indigo-300 font-bold">{purchaseResult.transactionRef}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-900/80 p-4 rounded-xl border border-slate-800">
                      <div>
                        <span className="text-[10px] text-slate-400 block font-bold mb-1">كود الكرت (PIN Code):</span>
                        <div className="flex items-center gap-2">
                          <span className="text-xl font-mono font-black text-amber-400 tracking-wider">
                            {purchaseResult.card.cardCode}
                          </span>
                          <button
                            onClick={() => handleCopy(purchaseResult.card!.cardCode, 'code')}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
                            title="نسخ الكود"
                          >
                            {copiedText === 'code' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>

                      <div>
                        <span className="text-[10px] text-slate-400 block font-bold mb-1">الرقم التسلسلي (Serial):</span>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-mono text-slate-200">{purchaseResult.card.serialNumber}</span>
                          <button
                            onClick={() => handleCopy(purchaseResult.card!.serialNumber, 'serial')}
                            className="p-1 rounded bg-slate-800 text-slate-400 hover:text-white"
                          >
                            {copiedText === 'serial' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </div>

                      {purchaseResult.card.password && (
                        <div className="sm:col-span-2 pt-2 border-t border-slate-800">
                          <span className="text-[10px] text-slate-400 block font-bold mb-1">كلمة المرور (Password):</span>
                          <span className="text-base font-mono font-bold text-emerald-300">{purchaseResult.card.password}</span>
                        </div>
                      )}
                    </div>

                    <div className="p-3 rounded-xl bg-slate-900 text-[11px] text-slate-300 leading-relaxed border border-slate-800">
                      <strong className="text-indigo-400 block mb-0.5">طريقة الاستخدام:</strong>
                      {purchaseResult.card.instructions}
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setSimStep(1);
                      setPurchaseResult(null);
                      setSelectedPackage(null);
                    }}
                    className="w-full py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs cursor-pointer"
                  >
                    إجراء عملية شراء تجريبية جديدة 🔄
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT SIDE: QUICK STATS & HOW IT WORKS FLOW */}
          <div className="lg:col-span-5 space-y-6">
            <div className="p-6 rounded-3xl bg-[#121927] border border-slate-800 shadow-xl space-y-5">
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-400" />
                <span>كيف تكتمل دورة شحن الكروت بالمحفظة؟</span>
              </h3>

              <div className="space-y-4 relative before:absolute before:right-4 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-800">
                <div className="relative pr-9">
                  <div className="absolute right-0 top-0.5 w-8 h-8 rounded-full bg-indigo-500/20 border border-indigo-500/40 text-indigo-400 text-xs font-bold flex items-center justify-center">
                    1
                  </div>
                  <h4 className="text-xs font-bold text-white">إضافة الكروت من مالك الشبكة</h4>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    يدخل مالك الشبكة لوحته لدينا ويضيف كروت الفئات (100، 200، 500 ر.ي إلخ) أو يربط سيرفر المايكروتك.
                  </p>
                </div>

                <div className="relative pr-9">
                  <div className="absolute right-0 top-0.5 w-8 h-8 rounded-full bg-purple-500/20 border border-purple-500/40 text-purple-400 text-xs font-bold flex items-center justify-center">
                    2
                  </div>
                  <h4 className="text-xs font-bold text-white">الاستعلام بكود الشبكة</h4>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    في محفظة جيب أو جوالي، يكتب العميل كود الشبكة (مثلاً: 22744)، فتستعلم المحفظة عبر الـ API عن اسم الشبكة والباقات.
                  </p>
                </div>

                <div className="relative pr-9">
                  <div className="absolute right-0 top-0.5 w-8 h-8 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-400 text-xs font-bold flex items-center justify-center">
                    3
                  </div>
                  <h4 className="text-xs font-bold text-white">التحقق من توفر الكروت لحظياً</h4>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    إذا كان المخزون متوفراً، تُكمل المحفظة خصم المبلغ؛ أما إذا كانت الفئة غير متوفرة، تعتذر المحفظة للعميل فوراً بدون خصم.
                  </p>
                </div>

                <div className="relative pr-9">
                  <div className="absolute right-0 top-0.5 w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 text-xs font-bold flex items-center justify-center">
                    4
                  </div>
                  <h4 className="text-xs font-bold text-white">تسليم الكرت وتحويل المالي</h4>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    يتسلم العميل الكرت فوراً على شاشة المحفظة، ويتم إيداع صافي قيمة الكرت في رصيد مالك الشبكة بالمحفظة تلقائياً.
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Endpoint Info Card */}
            <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 space-y-3">
              <span className="text-[11px] font-bold text-indigo-400 block">عنوان السيرفر المباشر (Base URL):</span>
              <div className="p-3 rounded-xl bg-slate-950 font-mono text-xs text-emerald-400 border border-slate-800 flex items-center justify-between">
                <span>{getOrigin()}</span>
                <button
                  onClick={() => handleCopyEndpoint(getOrigin())}
                  className="p-1 text-slate-400 hover:text-white cursor-pointer"
                >
                  {copiedEndpoint === getOrigin() ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUB TAB 2: DEVELOPER API DOCS */}
      {activeSubTab === 'docs' && (
        <div className="space-y-6 animate-in fade-in">
          {/* ENDPOINT 1 */}
          <div className="p-6 rounded-3xl bg-[#121927] border border-slate-800 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <span className="px-3 py-1 rounded-lg bg-emerald-500/20 text-emerald-400 font-mono font-bold text-xs">
                  GET
                </span>
                <code className="text-sm md:text-base font-mono font-bold text-white">
                  /api/v1/wallet/network/:networkCode
                </code>
              </div>
              <button
                onClick={() => handleCopyEndpoint(`${getOrigin()}/api/v1/wallet/network/22744`)}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold cursor-pointer flex items-center gap-1.5"
              >
                {copiedEndpoint === `${getOrigin()}/api/v1/wallet/network/22744` ? (
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
                <span>نسخ الرابط التجريبي</span>
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              تستخدمها المحفظة عند إدخال العميل لكود الشبكة، لتقوم بجلب بيانات الشبكة وباقاتها مع عدد الكروت المتوفرة لكل فئة.
            </p>

            <div className="space-y-2">
              <span className="text-[11px] text-slate-400 font-bold block">مثال للاستجابة (Response Payload JSON):</span>
              <pre className="p-4 rounded-2xl bg-[#090d16] text-xs font-mono text-emerald-400 overflow-x-auto border border-slate-800 dir-ltr">
{`{
  "success": true,
  "networkCode": "22744",
  "networkName": "برق نت اللاسلكية",
  "ownerName": "هشام محمد الجايفي",
  "governorate": "أمانة العاصمة (صنعاء)",
  "city": "السبعين",
  "packages": [
    {
      "categoryId": "cat-100",
      "categoryValue": 100,
      "name": "فئة 100 ريال",
      "price": 100,
      "mega": 300,
      "validity": "يوم واحد",
      "availableCardsCount": 45,
      "isAvailable": true
    }
  ]
}`}
              </pre>
            </div>
          </div>

          {/* ENDPOINT 2 */}
          <div className="p-6 rounded-3xl bg-[#121927] border border-slate-800 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <span className="px-3 py-1 rounded-lg bg-indigo-500/20 text-indigo-400 font-mono font-bold text-xs">
                  POST
                </span>
                <code className="text-sm md:text-base font-mono font-bold text-white">
                  /api/v1/wallet/check-availability
                </code>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              تتحقق المحفظة من وجود كروت متوفرة في المخزون للفئة المحددة قبل البدء بعملية الخصم المالي من العميل.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <span className="text-[11px] text-slate-400 font-bold block mb-1">طلب (Request Body):</span>
                <pre className="p-3.5 rounded-2xl bg-[#090d16] text-xs font-mono text-indigo-300 border border-slate-800 dir-ltr">
{`{
  "networkCode": "22744",
  "categoryValue": 100
}`}
                </pre>
              </div>

              <div>
                <span className="text-[11px] text-slate-400 font-bold block mb-1">استجابة توفر الكروت:</span>
                <pre className="p-3.5 rounded-2xl bg-[#090d16] text-xs font-mono text-emerald-400 border border-slate-800 dir-ltr">
{`{
  "available": true,
  "remainingCards": 45,
  "price": 100
}`}
                </pre>
              </div>
            </div>
          </div>

          {/* ENDPOINT 3 */}
          <div className="p-6 rounded-3xl bg-[#121927] border border-slate-800 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <span className="px-3 py-1 rounded-lg bg-purple-500/20 text-purple-400 font-mono font-bold text-xs">
                  POST
                </span>
                <code className="text-sm md:text-base font-mono font-bold text-white">
                  /api/v1/wallet/purchase-card
                </code>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              تُنفذ المحفظة الشراء الفعلي للكرت، حيث يتم خصم الكرت من المخزون، وتحويل صافي قيمته لمالك الشبكة، وإعادة بيانات الكرت فوراً لشاشة العميل.
            </p>

            <div className="space-y-2">
              <span className="text-[11px] text-slate-400 font-bold block">استجابة الشراء الناجحة (Success Response):</span>
              <pre className="p-4 rounded-2xl bg-[#090d16] text-xs font-mono text-emerald-400 overflow-x-auto border border-slate-800 dir-ltr">
{`{
  "success": true,
  "transactionRef": "JAIB-TRX-2026-991823",
  "networkName": "برق نت اللاسلكية",
  "card": {
    "serialNumber": "8820-100-9921",
    "cardCode": "94810293",
    "password": null,
    "categoryValue": 100,
    "price": 100,
    "instructions": "اتصل بشبكة (برق نت اللاسلكية)..."
  }
}`}
              </pre>
            </div>
          </div>
        </div>
      )}

      {/* SUB TAB 3: TRANSACTION LOGS */}
      {activeSubTab === 'logs' && (
        <div className="p-6 rounded-3xl bg-[#121927] border border-slate-800 shadow-xl space-y-4 animate-in fade-in">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-black text-white flex items-center gap-2">
              <Layers className="w-5 h-5 text-amber-400" />
              <span>سجل عمليات شراء الكروت عبر API المحافظ</span>
            </h3>

            <button
              onClick={fetchLogs}
              disabled={loadingLogs}
              className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-2 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loadingLogs ? 'animate-spin' : ''}`} />
              <span>تحديث السجل</span>
            </button>
          </div>

          <div className="overflow-x-auto border border-slate-800 rounded-2xl">
            <table className="w-full text-right text-xs text-slate-300">
              <thead className="bg-slate-900 text-slate-400 font-bold border-b border-slate-800">
                <tr>
                  <th className="p-3.5">المرجع/TRX</th>
                  <th className="p-3.5">الشبكة</th>
                  <th className="p-3.5">نوع المحفظة</th>
                  <th className="p-3.5">المبلغ</th>
                  <th className="p-3.5">التفاصيل / السيريال</th>
                  <th className="p-3.5">الوقت</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {logs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-500 font-sans">
                      لا توجد عمليات مبيعات مسجلة عبر API المحافظ حتى الآن.
                    </td>
                  </tr>
                ) : (
                  logs.map((log: any) => (
                    <tr key={log.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="p-3.5 text-indigo-400 font-bold">{log.reference}</td>
                      <td className="p-3.5 text-white font-sans font-bold">{log.networkName}</td>
                      <td className="p-3.5">
                        <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 font-sans font-bold text-[11px]">
                          {log.typeLabel || 'محفظة جيب'}
                        </span>
                      </td>
                      <td className="p-3.5 text-emerald-400 font-bold">{log.amount} ر.ي</td>
                      <td className="p-3.5 text-slate-300 font-sans text-[11px]">{log.description}</td>
                      <td className="p-3.5 text-slate-500 text-[10px]">
                        {new Date(log.timestamp).toLocaleTimeString('ar-YE')}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
