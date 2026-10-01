'use client';

import { useState, useEffect } from 'react';
import { Wallet, Plus, Edit2, Trash2, CheckCircle2, XCircle, FileImage, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { Modal } from '@/components/common/Modal';

interface BankWalletSource {
  id: number;
  bank_wallet_id: number;
  source_name: string;
}

interface BankWallet {
  id: number;
  name: string;
  logo_path: string | null;
  pos_number: string | null;
  pos_name: string | null;
  input_label: string;
  steps: string[] | null;
  is_active: boolean;
  sources?: BankWalletSource[];
  logo_url?: string;
}

export function BankWalletsView() {
  const [wallets, setWallets] = useState<BankWallet[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingWallet, setEditingWallet] = useState<BankWallet | null>(null);
  
  // Form State
  const [name, setName] = useState('');
  const [posNumber, setPosNumber] = useState('');
  const [posName, setPosName] = useState('');
  const [inputLabel, setInputLabel] = useState('الرقم المرجعي');
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [steps, setSteps] = useState<string[]>(['']);
  const [sources, setSources] = useState<string[]>([]);
  const [sourceInput, setSourceInput] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const fetchWallets = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('admin_auth_token');
      const res = await fetch('/api/admin/bank-wallets', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('فشل جلب البيانات');
      const data = await res.json();
      setWallets(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWallets();
  }, []);

  const resetForm = () => {
    setName('');
    setPosNumber('');
    setPosName('');
    setInputLabel('الرقم المرجعي');
    setLogoFile(null);
    setSteps(['']);
    setSources([]);
    setSourceInput('');
    setEditingWallet(null);
  };

  const openModal = (wallet?: BankWallet) => {
    if (wallet) {
      setEditingWallet(wallet);
      setName(wallet.name);
      setPosNumber(wallet.pos_number || '');
      setPosName(wallet.pos_name || '');
      setInputLabel(wallet.input_label || 'الرقم المرجعي');
      setSteps(wallet.steps?.length ? [...wallet.steps] : ['']);
      setSources(wallet.sources?.map(s => s.source_name) || []);
    } else {
      resetForm();
    }
    setIsModalOpen(true);
  };

  const handleAddStep = () => setSteps([...steps, '']);
  const handleStepChange = (index: number, val: string) => {
    const newSteps = [...steps];
    newSteps[index] = val;
    setSteps(newSteps);
  };
  const handleRemoveStep = (index: number) => {
    const newSteps = steps.filter((_, i) => i !== index);
    if (newSteps.length === 0) newSteps.push('');
    setSteps(newSteps);
  };

  const handleAddSource = () => {
    if (sourceInput.trim() && !sources.includes(sourceInput.trim())) {
      setSources([...sources, sourceInput.trim()]);
      setSourceInput('');
    }
  };
  const handleRemoveSource = (src: string) => {
    setSources(sources.filter(s => s !== src));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const token = localStorage.getItem('admin_auth_token');
      const formData = new FormData();
      formData.append('name', name);
      if (posNumber) formData.append('pos_number', posNumber);
      if (posName) formData.append('pos_name', posName);
      formData.append('input_label', inputLabel);
      
      const validSteps = steps.filter(s => s.trim() !== '');
      validSteps.forEach((s, i) => formData.append(`steps[${i}]`, s));
      
      sources.forEach((s, i) => formData.append(`sources[${i}]`, s));
      
      if (logoFile) formData.append('logo', logoFile);

      if (editingWallet) {
        formData.append('_method', 'PUT'); // Laravel form method spoofing
      }

      const url = editingWallet 
        ? `/api/admin/bank-wallets/${editingWallet.id}` 
        : '/api/admin/bank-wallets';
      
      const method = 'POST'; // using spoofing for PUT

      const res = await fetch(url, {
        method,
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      });

      if (!res.ok) throw new Error('فشل حفظ البيانات');
      
      await fetchWallets();
      setIsModalOpen(false);
      resetForm();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const toggleActive = async (id: number) => {
    try {
      const token = localStorage.getItem('admin_auth_token');
      const res = await fetch(`/api/admin/bank-wallets/${id}/toggle-active`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        fetchWallets();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('هل أنت متأكد من حذف هذه المحفظة؟')) return;
    try {
      const token = localStorage.getItem('admin_auth_token');
      const res = await fetch(`/api/admin/bank-wallets/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        fetchWallets();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="p-6 md:p-8 space-y-8 animate-fadeIn">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white flex items-center gap-3">
              <span className="w-10 h-10 rounded-2xl bg-indigo-600/10 text-indigo-600 flex items-center justify-center">
                <Wallet className="w-6 h-6" />
              </span>
              المحافظ البنكية ووسائل الدفع
            </h1>
            <p className="mt-2 text-slate-500 dark:text-slate-400 font-medium max-w-2xl">
              إدارة المحافظ البنكية، تحديد مصادر التحقق التلقائي، وتخصيص طرق عرض المحافظ وتوجيهات الإيداع للعملاء.
            </p>
          </div>
          <Button onClick={() => openModal()} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold h-12 px-6 rounded-2xl shrink-0 shadow-lg shadow-indigo-600/20">
            <Plus className="w-5 h-5 ml-2" /> إضافة محفظة جديدة
          </Button>
        </div>

        {isLoading ? (
          <div className="h-64 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-600 border-t-transparent"></div>
          </div>
        ) : error ? (
          <div className="bg-red-50 text-red-600 p-6 rounded-2xl border border-red-200 font-bold text-center">
            {error}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {wallets.map(wallet => (
              <div key={wallet.id} className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden group">
                <div className="absolute top-4 left-4 flex gap-2">
                  <button onClick={() => toggleActive(wallet.id)} className={`p-2 rounded-xl border transition-colors ${wallet.is_active ? 'bg-emerald-50 border-emerald-200 text-emerald-600 dark:bg-emerald-500/10 dark:border-emerald-500/20' : 'bg-slate-100 border-slate-200 text-slate-400 dark:bg-slate-800 dark:border-slate-700'}`} title={wallet.is_active ? 'إيقاف' : 'تفعيل'}>
                    {wallet.is_active ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                  </button>
                  <button onClick={() => openModal(wallet)} className="p-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 hover:text-indigo-600 hover:border-indigo-200 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300 dark:hover:text-indigo-400">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(wallet.id)} className="p-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 hover:text-red-600 hover:border-red-200 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300 dark:hover:text-red-400">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex items-center gap-4 mb-6 pt-2">
                  {wallet.logo_url ? (
                    <img src={wallet.logo_url} alt={wallet.name} className="w-14 h-14 rounded-2xl object-cover border border-slate-100 dark:border-slate-800" />
                  ) : (
                    <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                      <Wallet className="w-6 h-6" />
                    </div>
                  )}
                  <div>
                    <h3 className="font-bold text-lg text-slate-900 dark:text-white">{wallet.name}</h3>
                    <span className={`text-xs font-bold px-2 py-1 rounded-lg ${wallet.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                      {wallet.is_active ? 'نشط' : 'موقوف'}
                    </span>
                  </div>
                </div>

                <div className="space-y-3 text-sm">
                  {wallet.pos_number && (
                    <div className="flex justify-between items-center p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                      <span className="text-slate-500 dark:text-slate-400">رقم النقطة</span>
                      <span className="font-bold font-mono text-slate-900 dark:text-slate-100">{wallet.pos_number}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                    <span className="text-slate-500 dark:text-slate-400">حقل التحقق</span>
                    <span className="font-bold text-slate-900 dark:text-slate-100">{wallet.input_label}</span>
                  </div>
                  {wallet.sources && wallet.sources.length > 0 && (
                    <div className="p-3 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800/30">
                      <div className="flex items-center gap-2 mb-2 text-indigo-700 dark:text-indigo-300 font-bold text-xs">
                        <ShieldCheck className="w-4 h-4" /> مصادر التحقق الآلي
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {wallet.sources.map(src => (
                          <span key={src.id} className="text-[10px] font-bold bg-indigo-100 dark:bg-indigo-800/50 text-indigo-700 dark:text-indigo-200 px-2 py-0.5 rounded-md">
                            {src.source_name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingWallet ? "تعديل محفظة" : "إضافة محفظة جديدة"}>
          <form onSubmit={handleSave} className="space-y-6">
            
            {/* Logo Section */}
            <div className="flex items-center gap-4 p-4 border border-slate-200 dark:border-slate-800 rounded-2xl bg-slate-50 dark:bg-slate-900/50">
              <div className="w-16 h-16 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center overflow-hidden shrink-0">
                {logoFile ? (
                  <img src={URL.createObjectURL(logoFile)} alt="Preview" className="w-full h-full object-cover" />
                ) : editingWallet?.logo_path ? (
                  <img src={`/storage/${editingWallet.logo_path}`} alt="Logo" className="w-full h-full object-cover" />
                ) : (
                  <FileImage className="w-6 h-6 text-slate-400" />
                )}
              </div>
              <div className="flex-1">
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">شعار المحفظة</label>
                <input 
                  type="file" 
                  accept="image/*"
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setLogoFile(e.target.files?.[0] || null)}
                  className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-bold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input label="اسم المحفظة *" value={name} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)} required placeholder="مثال: محفظة جيب" />
              <div className="space-y-1.5">
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300">اسم حقل الإدخال للعميل</label>
                <select 
                  value={inputLabel}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setInputLabel(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 font-medium text-slate-900 focus:ring-2 focus:ring-indigo-500 dark:bg-slate-900 dark:border-slate-800 dark:text-white"
                >
                  <option value="الرقم المرجعي">الرقم المرجعي</option>
                  <option value="رقم العملية">رقم العملية</option>
                  <option value="رقم الحوالة">رقم الحوالة</option>
                </select>
              </div>
              <Input label="رقم نقطة البيع (اختياري)" value={posNumber} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPosNumber(e.target.value)} placeholder="مثال: 123456" className="font-mono text-left dir-ltr" />
              <Input label="اسم النقطة / باسم من (اختياري)" value={posName} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPosName(e.target.value)} placeholder="بصمة العصر الحديث" />
            </div>

            {/* Sources Section */}
            <div className="p-5 border border-indigo-100 dark:border-indigo-900/30 rounded-2xl bg-indigo-50/50 dark:bg-indigo-900/10 space-y-3">
              <div>
                <h4 className="font-bold text-indigo-900 dark:text-indigo-100 flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5" /> مصادر التحقق الآلي
                </h4>
                <p className="text-xs text-indigo-600 dark:text-indigo-400 mt-1">الكلمات الدلالية التي يستخدمها نظام التحقق للبحث عن الرقم المرجعي (مثل: jaib, jawali).</p>
              </div>
              
              <div className="flex gap-2">
                <Input value={sourceInput} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSourceInput(e.target.value)} placeholder="اسم المصدر..." className="flex-1" />
                <Button type="button" onClick={handleAddSource} className="bg-indigo-600 text-white shrink-0 mt-7">إضافة</Button>
              </div>
              
              {sources.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-2">
                  {sources.map(src => (
                    <span key={src} className="inline-flex items-center gap-1 pl-1 pr-3 py-1 bg-white dark:bg-slate-800 border border-indigo-200 dark:border-indigo-700 rounded-lg text-sm font-bold text-indigo-800 dark:text-indigo-300">
                      {src}
                      <button type="button" onClick={() => handleRemoveSource(src)} className="p-1 hover:bg-indigo-100 dark:hover:bg-indigo-900 rounded-md text-red-500">
                        <XCircle className="w-4 h-4" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Steps Section */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300">خطوات الإيداع للعميل</label>
                <Button type="button" variant="ghost" onClick={handleAddStep} className="h-8 text-xs font-bold text-indigo-600 bg-indigo-50 dark:bg-indigo-500/10 dark:text-indigo-400">
                  <Plus className="w-3 h-3 ml-1" /> إضافة خطوة
                </Button>
              </div>
              <div className="space-y-2">
                {steps.map((step, idx) => (
                  <div key={idx} className="flex gap-2 items-start">
                    <span className="w-8 h-12 flex items-center justify-center font-bold text-slate-400 shrink-0">{idx + 1}.</span>
                    <Input 
                      value={step}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleStepChange(idx, e.target.value)}
                      placeholder="وصف الخطوة..."
                      className="flex-1"
                    />
                    <button type="button" onClick={() => handleRemoveStep(idx)} className="mt-2.5 p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors">
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-6 border-t border-slate-200 dark:border-slate-800">
              <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>إلغاء</Button>
              <Button type="submit" disabled={isSaving || !name} className="bg-indigo-600 hover:bg-indigo-700 text-white min-w-[120px]">
                {isSaving ? 'جاري الحفظ...' : 'حفظ المحفظة'}
              </Button>
            </div>
          </form>
        </Modal>

      </div>
  );
}
