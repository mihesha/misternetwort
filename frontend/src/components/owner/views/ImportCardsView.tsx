import { useRouter } from 'next/navigation';
import React, { useState, useRef } from 'react';
import {
  Upload,
  FileText,
  AlertCircle,
  BarChart2,
  AlertTriangle,
  CloudUpload,
  Layers,
  Info,
  CheckCircle2,
  Loader2,
  ArrowRight,
  ChevronDown,
  Check
} from 'lucide-react';

import * as XLSX from 'xlsx';

interface ImportCardsViewProps {
  isDarkMode: boolean;
  ownerName?: string;
  networkName?: string;
  onNavigateView?: (view: string) => void;
  globalUpdateTick?: number;
}

export const ImportCardsView: React.FC<ImportCardsViewProps> = ({
  isDarkMode,
  networkName = 'برق نت',
  globalUpdateTick = 0,
}) => {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [importStats, setImportStats] = useState<{ total: number; valid: number; invalid: number; batchId?: string; errors?: string[] } | null>(null);
  
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const [isParsing, setIsParsing] = useState(false);
  const [extractedCards, setExtractedCards] = useState<{ code: string; password?: string }[]>([]);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [categories, setCategories] = useState<any[]>([]);
  const [networkData, setNetworkData] = useState<any>(null);

  React.useEffect(() => {
    const fetchNetworkData = async () => {
      try {
        const token = typeof localStorage !== 'undefined' ? localStorage.getItem('auth_token') : null;
        const res = await fetch('/api/networks', {
          headers: token ? { 'Authorization': `Bearer ${token}` } : {}
        });
        if (res.ok) {
          const data = await res.json();
          const found = data.find((n: any) => n.name === networkName);
          if (found) {
            setNetworkData(found);
            setCategories((found.card_categories || []).filter((c: any) => c.status !== 'inactive'));
          }
        }
      } catch (err) {
        console.error('Failed to fetch network data', err);
      }
    };
    if (networkName) {
      fetchNetworkData();
    }
  }, [networkName, globalUpdateTick]);

  const parseFileAndExtractCards = async (file: File, category: any): Promise<{ code: string; password?: string }[]> => {
    return new Promise(async (resolve, reject) => {
      try {
        const isPasswordRequired = category.card_type === 'مستخدم + كلمة مرور' || category.card_type === 'user_password';
        let parsedRows: any[] = [];
        
        const fileName = file.name.toLowerCase();
        
        if (fileName.endsWith('.pdf')) {
            const arrayBuffer = await file.arrayBuffer();
            if (!(window as any).pdfjsLib) {
              const script = document.createElement('script');
              script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.min.js';
              await new Promise((res, rej) => { script.onload = res; script.onerror = rej; document.head.appendChild(script); });
              
              try {
                const workerRes = await fetch('https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js');
                const workerText = await workerRes.text();
                const workerBlob = new Blob([workerText], { type: 'application/javascript' });
                (window as any).pdfjsLib.GlobalWorkerOptions.workerSrc = URL.createObjectURL(workerBlob);
              } catch (e) {
                (window as any).pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js';
              }
            }
            const pdfjsLib = (window as any).pdfjsLib;
            const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
            
            for (let i = 1; i <= pdf.numPages; i++) {
              const page = await pdf.getPage(i);
              const textContent = await page.getTextContent();
              const rowsMap = new Map<number, string[]>();
              for (const item of textContent.items) {
                  const y = Math.round(item.transform[5] / 5) * 5;
                  if (!rowsMap.has(y)) rowsMap.set(y, []);
                  rowsMap.get(y)!.push(item.str.trim());
              }
              const sortedYs = Array.from(rowsMap.keys()).sort((a, b) => b - a);
              for (const y of sortedYs) {
                  const cols = rowsMap.get(y)!.filter(Boolean);
                  if (cols.length > 0) {
                      parsedRows.push(cols);
                  }
              }
            }
        } else if (fileName.endsWith('.txt')) {
            const text = await file.text();
            const lines = text.split(/\r?\n/).filter(line => line.trim());
            parsedRows = lines.map(line => line.split(/[,\t;\s]+/).map(col => col.trim()).filter(Boolean));
        } else {
            const arrayBuffer = await file.arrayBuffer();
            const workbook = XLSX.read(arrayBuffer, { type: 'array' });
            const firstSheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[firstSheetName];
            parsedRows = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        }

        const extractedCards: { code: string; password?: string }[] = [];

        for (const row of parsedRows) {
          if (!row || !Array.isArray(row) || row.length === 0) continue;
          
          const cols = row.map((c: any) => String(c || '').trim()).filter((c: string) => c);
          if (cols.length === 0) continue;

          const isHeader = (str: string) => {
            const s = str.trim().toLowerCase();
            if (!s) return false;
            const exactMatches = ['id', 'pin', 'code', 'pass', 'serial', 'user', 'username', 'password', 'كود', 'الرقم', 'رقم', 'اسم', 'الاسم', 'كرت', 'الكرت', 'كلمة', 'السر'];
            if (exactMatches.includes(s)) return true;
            return s.includes('اسم المستخدم') || s.includes('كلمة المرور') || 
                   s.includes('رقم الكرت') || s.includes('الرقم السري') || 
                   s.includes('بطاق') || s.includes('حساب');
          };

          const hasHeaderKeyword = cols.some((col: any) => isHeader(String(col)));
          if (hasHeaderKeyword) {
              continue;
          }

          if (isPasswordRequired) {
              const code = cols[0];
              const password = cols.length > 1 ? cols[1] : undefined;
              if (code.length >= 6 && password && password.length >= 1) {
                  extractedCards.push({ code, password });
              }
          } else {
              for (const col of cols) {
                  if (col.length >= 6) {
                      extractedCards.push({ code: col });
                  }
              }
          }
        }
        
        if (extractedCards.length === 0) {
            reject(new Error('لم يتم العثور على أي كروت صالحة. تأكد من أن الملف يحتوي على الكروت بتنسيق صحيح وأرقام لا تقل عن 6 أحرف/أرقام.'));
            return;
        }

        resolve(extractedCards);
        
      } catch (error) {
        console.error('File parsing error:', error);
        reject(new Error('فشل قراءة الملف. يرجى التأكد من أن الملف ليس تالفاً وبصيغة مدعومة.'));
      }
    });
  };

  const processFileSelection = async (file: File) => {
    setErrorMessage(null);
    setImportStats(null);
    setExtractedCards([]);
    
    if (!selectedCategory) {
      setErrorMessage('يرجى اختيار الفئة أولاً قبل رفع الملف.');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setErrorMessage('حجم الملف يتجاوز الحد الأقصى المسموح به (10 ميجابايت).');
      return;
    }

    const categoryObj = categories.find(c => String(c.id) === String(selectedCategory));
    if (!categoryObj) return;

    setSelectedFile(file);
    setIsParsing(true);

    try {
      const cards = await parseFileAndExtractCards(file, categoryObj);
      setExtractedCards(cards);
    } catch (err: any) {
      setErrorMessage(err.message || 'فشل في استخراج الكروت من الملف.');
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    } finally {
      setIsParsing(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFileSelection(e.target.files[0]);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFileSelection(e.dataTransfer.files[0]);
    }
  };

  const handleImport = async () => {
    if (!selectedCategory || !selectedFile || extractedCards.length === 0) return;

    setIsSuccess(true);
    setErrorMessage(null);
    
    try {
      const categoryObj = categories.find(c => String(c.id) === String(selectedCategory));
      const ext = selectedFile.name.split('.').pop()?.toUpperCase() || 'UNKNOWN';
      const file_type = ext;

      const token = typeof localStorage !== 'undefined' ? localStorage.getItem('auth_token') : null;
      const response = await fetch(`/api/networks/${networkData.id}/import-cards`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ category_id: categoryObj.id, cards: extractedCards, file_type, uploaded_by: 'صاحب الشبكة' })
      });

      const responseData = await response.json();

      if (!response.ok) {
        if (responseData.duplicates && responseData.duplicates.length > 0) {
          setImportStats({
             total: extractedCards.length,
             valid: 0,
             invalid: extractedCards.length,
             errors: responseData.duplicates
          });
          setIsSuccess(false);
          return;
        }
        throw new Error(responseData.error || responseData.message || 'فشل استيراد الكروت. تأكد من صحة البيانات.');
      }
      
      setImportStats({
        total: extractedCards.length,
        valid: responseData.count || 0,
        invalid: extractedCards.length - (responseData.count || 0),
        batchId: responseData.batch_id,
        errors: responseData.errors || []
      });
      setIsSuccess(false);
      setExtractedCards([]);
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';

    } catch (error: any) {
      setErrorMessage(error.message || 'حدث خطأ أثناء الاتصال بالخادم.');
      setIsSuccess(false);
    }
  };

  const resetState = () => {
    setImportStats(null);
    setSelectedFile(null);
    setExtractedCards([]);
    setErrorMessage(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div dir="rtl" className={`transition-colors font-['Cairo',sans-serif] ${isDarkMode ? 'bg-[#0a0f18] text-slate-100' : 'bg-slate-100 text-slate-800'}`}>
      <main className="max-w-4xl mx-auto px-4 md:px-6 py-8 space-y-6">
        
        {/* Main Import Card Box */}
        <div className={`rounded-3xl p-6 md:p-10 border transition-all shadow-2xl relative overflow-hidden ${
            isDarkMode ? 'bg-gradient-to-br from-[#121926] to-[#0f172a] border-slate-800 text-slate-100 shadow-black/40' : 'bg-gradient-to-br from-white to-slate-50 border-slate-200 text-slate-900 shadow-blue-900/5'
          }`}>
          
          {/* Subtle Background Glow */}
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[120px] -z-10 pointer-events-none opacity-50 translate-x-1/2 -translate-y-1/2" />
          
          {!importStats && (
            <div className="relative z-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
              {/* Section Header */}
              <div className="text-center space-y-3 mb-6">
                <div className={`inline-flex p-4 rounded-3xl mb-2 ${isDarkMode ? 'bg-blue-500/10 text-blue-400' : 'bg-blue-100 text-blue-600'}`}>
                  <CloudUpload className="w-10 h-10" />
                </div>
                <h2 className="text-2xl md:text-3xl font-black">
                  استيراد الكروت
                </h2>
                <p className={`text-sm max-w-lg mx-auto ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                  قم بتحديد الفئة أولاً، ثم ارفع ملف الكروت وسنقوم بتحليله وتجهيزه فوراً.
                </p>
              </div>

              {/* Instructions Box */}
              <div className={`max-w-2xl mx-auto mb-10 rounded-3xl p-5 md:p-6 border transition-all text-right space-y-3 ${
                isDarkMode
                  ? 'bg-blue-950/20 border-blue-900/40 text-blue-200'
                  : 'bg-blue-50/70 border-blue-200/60 text-blue-950'
              }`}>
                <h3 className="font-extrabold text-sm md:text-base flex items-center gap-2 text-blue-500">
                  <Info className="w-5 h-5" />
                  <span>تعليمات هامة قبل الاستيراد:</span>
                </h3>
                <ul className="text-xs md:text-sm space-y-2 opacity-90 pr-1 text-slate-600 dark:text-slate-300">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500 font-bold">•</span>
                    <span>يدعم النظام الملفات بصيغة: <span className="font-bold text-blue-600 dark:text-blue-400">CSV, XLSX, XLS, PDF, TXT, HTML</span>. (الحد الأقصى لحجم الملف هو 10 ميجابايت).</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500 font-bold">•</span>
                    <span>يجب ألا يقل طول رقم الكرت عن 6 أحرف/أرقام.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500 font-bold">•</span>
                    <span>للفئات من نوع "مستخدم فقط": يدعم الملف عموداً واحداً (رقم الكرت أو اسم المستخدم).</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500 font-bold">•</span>
                    <span>للفئات من نوع "مستخدم + كلمة مرور": يجب أن يحتوي الملف على عمودين لتشمل كلمة المرور.</span>
                  </li>
                </ul>
              </div>

              {/* Form Controls */}
              <div className="space-y-6 text-right max-w-2xl mx-auto">
                {/* Custom Category Dropdown */}
                <div className="relative z-40">
                  <div
                    onClick={() => setIsCategoryDropdownOpen(!isCategoryDropdownOpen)}
                    className={`w-full rounded-2xl py-4 px-5 text-sm font-bold flex items-center justify-between cursor-pointer transition-all border shadow-sm ${
                      isDarkMode
                        ? 'bg-[#1a2436] hover:bg-[#202c41] border-slate-700/80 hover:border-blue-500/50 text-slate-200'
                        : 'bg-white hover:bg-slate-50 border-slate-300 hover:border-blue-400 text-slate-800'
                    } ${selectedCategory ? (isDarkMode ? 'border-emerald-500/40 ring-1 ring-emerald-500/20' : 'border-emerald-500/50 ring-1 ring-emerald-500/20') : ''}`}
                  >
                    <div className="flex items-center gap-3">
                      <Layers className={`w-5 h-5 ${selectedCategory ? 'text-emerald-500' : 'text-slate-400'}`} />
                      <span>
                        {selectedCategory 
                          ? (() => {
                              const c = categories.find(c => String(c.id) === String(selectedCategory));
                              return c ? `فئة ${c.name || c.price} ر.ي - (${c.card_type})` : 'فئة غير معروفة';
                            })()
                          : '-- اضغط هنا لاختيار الفئة --'}
                      </span>
                    </div>
                    <ChevronDown className={`w-5 h-5 transition-transform duration-300 ${isCategoryDropdownOpen ? 'rotate-180 text-blue-500' : 'text-slate-400'}`} />
                  </div>

                  {isCategoryDropdownOpen && (
                    <>
                      <div className="fixed inset-0 z-30" onClick={() => setIsCategoryDropdownOpen(false)} />
                      <div className={`absolute top-full left-0 right-0 mt-2 z-40 rounded-2xl border shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 ${
                        isDarkMode ? 'bg-[#1a2436] border-slate-700' : 'bg-white border-slate-200'
                      }`}>
                        <div className="max-h-60 overflow-y-auto custom-scrollbar p-2">
                          {categories.length === 0 ? (
                            <div className={`p-4 text-center text-sm font-bold ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>لا توجد فئات مفعلة</div>
                          ) : (
                            categories.map((c: any) => (
                              <div
                                key={c.id}
                                onClick={() => {
                                  setSelectedCategory(String(c.id));
                                  setIsCategoryDropdownOpen(false);
                                  if (selectedFile) resetState();
                                  setErrorMessage(null);
                                }}
                                className={`w-full text-right p-3.5 rounded-xl text-sm font-bold cursor-pointer flex items-center justify-between transition-all ${
                                  String(selectedCategory) === String(c.id)
                                    ? (isDarkMode ? 'bg-blue-500/10 text-blue-400' : 'bg-blue-50 text-blue-600')
                                    : (isDarkMode ? 'hover:bg-slate-800/80 text-slate-300' : 'hover:bg-slate-50 text-slate-700')
                                }`}
                              >
                                <span>فئة {c.name || c.price} ر.ي - ({c.card_type})</span>
                                {String(selectedCategory) === String(c.id) && <Check className="w-5 h-5" />}
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    </>
                  )}
                </div>

                {/* File Upload Dropzone */}
                <div className={`transition-all duration-500 ${!selectedCategory ? 'opacity-80 grayscale-[30%]' : ''}`}>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept=".csv,text/csv,.xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,.xls,application/vnd.ms-excel,.pdf,application/pdf,.txt,text/plain,.html,text/html"
                    className="hidden"
                  />

                  <div
                    onDragOver={(e) => { 
                      e.preventDefault(); 
                      if (!selectedCategory) return;
                      setIsDragging(true); 
                    }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={(e) => {
                      e.preventDefault();
                      if (!selectedCategory) {
                        setErrorMessage('عذراً! يجب عليك تحديد الفئة أولاً قبل سحب الملف.');
                        return;
                      }
                      handleDrop(e);
                    }}
                    onClick={() => {
                      if (!selectedCategory) {
                        setErrorMessage('عذراً! يجب عليك تحديد الفئة من القائمة أعلاه أولاً قبل استعراض الملف.');
                        return;
                      }
                      fileInputRef.current?.click();
                    }}
                    className={`w-full rounded-3xl border-2 border-dashed p-10 md:p-14 text-center transition-all duration-300 cursor-pointer flex flex-col items-center justify-center space-y-4 group relative overflow-hidden
                      ${!selectedCategory ? (isDarkMode ? 'border-slate-700 hover:border-rose-500/50 bg-[#172030]/40 hover:bg-rose-500/5' : 'border-slate-300 hover:border-rose-400 bg-slate-50/50 hover:bg-rose-50/50') :
                        isDragging ? 'border-blue-500 bg-blue-500/10 scale-[1.02]' : 
                        isDarkMode ? 'border-slate-700 hover:border-blue-500/50 bg-[#172030]/60 hover:bg-[#1a2538]' : 
                        'border-slate-300 hover:border-blue-400 bg-slate-50 hover:bg-blue-50/50'}`}
                  >
                    {isParsing ? (
                      <div className="flex flex-col items-center space-y-4">
                        <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
                        <span className="text-sm font-bold text-blue-500 animate-pulse">جاري تحليل الملف واستخراج الكروت...</span>
                      </div>
                    ) : selectedFile && extractedCards.length > 0 ? (
                      <div className="flex flex-col items-center space-y-3 animate-in zoom-in duration-300">
                        <div className="w-14 h-14 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center shadow-inner">
                          <CheckCircle2 className="w-7 h-7" />
                        </div>
                        <span className="text-base font-black text-emerald-500">{selectedFile.name}</span>
                        <span className="text-xs font-mono opacity-60">
                          ({(selectedFile.size / 1024).toFixed(1)} KB) - تم استخراج {extractedCards.length} كرت بنجاح
                        </span>
                        <p className="text-xs text-blue-500 underline pt-2 hover:text-blue-400">انقر هنا لاختيار ملف آخر</p>
                      </div>
                    ) : (
                      <>
                        <div className={`p-4 rounded-full transition-transform duration-300 group-hover:-translate-y-2 ${isDarkMode ? 'bg-slate-800 text-slate-400 group-hover:text-blue-400' : 'bg-slate-200 text-slate-500 group-hover:text-blue-600'}`}>
                          <Upload className="w-8 h-8" />
                        </div>
                        <p className={`text-sm font-extrabold ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                          اسحب الملف وأفلته هنا أو انقر للاستعراض
                        </p>
                        <span className={`text-xs font-semibold px-4 py-1.5 rounded-full ${isDarkMode ? 'bg-slate-800/80 text-slate-400' : 'bg-slate-200/80 text-slate-500'}`}>
                          يدعم Excel, CSV, PDF, TXT, HTML
                        </span>
                      </>
                    )}
                  </div>
                </div>

                {/* Error Message */}
                {errorMessage && (
                  <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-sm font-bold flex items-start gap-3 animate-in shake duration-300">
                    <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                    <span className="leading-relaxed">{errorMessage}</span>
                  </div>
                )}
                
                {/* Live Preview Area */}
                {extractedCards.length > 0 && !errorMessage && (
                  <div className={`mt-8 p-1 rounded-2xl border overflow-hidden animate-in fade-in slide-in-from-top-4 duration-500 shadow-xl ${isDarkMode ? 'border-slate-800 bg-[#0f172a]' : 'border-slate-200 bg-white'}`}>
                    <div className="px-5 py-4 flex items-center justify-between border-b border-inherit">
                      <h3 className="font-extrabold text-sm flex items-center gap-2">
                        <Info className="w-4 h-4 text-blue-500" />
                        <span>معاينة مبدئية للكروت المستخرجة</span>
                      </h3>
                      <span className="text-xs font-bold text-emerald-500 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                        {extractedCards.length} كرت
                      </span>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm text-right">
                        <thead>
                          <tr className={`border-b ${isDarkMode ? 'border-slate-800/50 text-slate-500' : 'border-slate-100 text-slate-400'}`}>
                            <th className="py-3 px-5 font-bold">رقم الكرت</th>
                            {categories.find(c => String(c.id) === String(selectedCategory))?.card_type?.includes('كلمة مرور') && (
                              <th className="py-3 px-5 font-bold">كلمة المرور</th>
                            )}
                          </tr>
                        </thead>
                        <tbody>
                          {extractedCards.slice(0, 10).map((card, idx) => (
                            <tr key={idx} className={isDarkMode ? 'border-b border-slate-800/20 text-slate-300 hover:bg-white/5' : 'border-b border-slate-50 text-slate-700 hover:bg-slate-50'}>
                              <td className="py-3 px-5 font-mono font-bold text-blue-500">{card.code}</td>
                              {card.password && <td className="py-3 px-5 font-mono font-bold text-slate-500">{card.password}</td>}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    {extractedCards.length > 10 && (
                      <div className={`text-center py-3 text-xs font-bold shadow-inner ${isDarkMode ? 'text-slate-500 bg-[#121926]/50' : 'text-slate-500 bg-slate-50'}`}>
                        ... وهناك {extractedCards.length - 10} كرت آخر مخفي للمعاينة ...
                      </div>
                    )}
                  </div>
                )}
                
                {/* Action Buttons */}
                <div className={`flex flex-col sm:flex-row items-center justify-center gap-3 pt-4 transition-all duration-500 ${extractedCards.length > 0 && !errorMessage ? 'opacity-100' : 'opacity-0 pointer-events-none hidden'}`}>
                  <button
                    onClick={handleImport}
                    disabled={isSuccess}
                    className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-extrabold text-sm transition-all shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-wait"
                  >
                    {isSuccess ? <Loader2 className="w-5 h-5 animate-spin" /> : <Upload className="w-5 h-5" />}
                    <span>{isSuccess ? 'جاري الحفظ في الخادم...' : 'تأكيد وحفظ الكروت'}</span>
                  </button>

                  <button
                    onClick={resetState}
                    disabled={isSuccess}
                    className={`w-full sm:w-auto px-8 py-3.5 rounded-2xl font-bold text-sm transition-all ${
                      isDarkMode ? 'bg-[#1a2436] hover:bg-rose-500/10 text-slate-300 hover:text-rose-400' : 'bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-600'
                    }`}
                  >
                    إلغاء التحديد
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Import Stats Redesigned UI */}
          {importStats && (
            <div className="relative z-10 animate-in zoom-in-95 duration-500 max-w-2xl mx-auto">
              <div className="text-center mb-10">
                <div className={`w-24 h-24 mx-auto rounded-full flex items-center justify-center mb-6 shadow-inner border ${
                  importStats.valid === 0 
                    ? 'bg-rose-500/10 text-rose-500 border-rose-500/20' 
                    : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                }`}>
                  {importStats.valid === 0 ? <AlertTriangle className="w-12 h-12" /> : <CheckCircle2 className="w-12 h-12" />}
                </div>
                <h3 className={`text-2xl md:text-3xl font-black mb-2 ${importStats.valid === 0 ? 'text-rose-500' : 'text-emerald-500'}`}>
                  {importStats.valid === 0 ? 'فشل: جميع الكروت مكررة أو غير صالحة!' : 'تم الاستيراد بنجاح!'}
                </h3>
                {importStats.batchId && importStats.valid > 0 && (
                  <p className={`text-sm font-mono opacity-70`}>رقم الدفعة المرجعي: BATCH-{importStats.batchId}</p>
                )}
                {importStats.valid === 0 && (
                  <p className={`text-sm opacity-80 mt-2 font-bold ${isDarkMode ? 'text-rose-400' : 'text-rose-600'}`}>
                    لم يتم استيراد أي كرت جديد إلى قاعدة البيانات لأن جميع الكروت في الملف موجودة مسبقاً.
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-6 mb-10">
                <div className={`p-8 rounded-3xl flex flex-col items-center justify-center gap-2 transition-transform hover:scale-[1.02] ${isDarkMode ? 'bg-[#1a2436] shadow-xl shadow-black/20' : 'bg-white shadow-xl shadow-slate-200/50 border border-slate-100'}`}>
                  <span className={`text-5xl font-black font-mono ${importStats.valid > 0 ? 'text-emerald-500' : 'text-slate-400'}`}>{importStats.valid}</span>
                  <span className={`text-sm font-bold ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>كرت متاح وجاهز للبيع</span>
                </div>
                <div className={`p-8 rounded-3xl flex flex-col items-center justify-center gap-2 transition-transform hover:scale-[1.02] ${isDarkMode ? 'bg-[#1a2436] shadow-xl shadow-black/20' : 'bg-white shadow-xl shadow-slate-200/50 border border-slate-100'}`}>
                  <span className={`text-5xl font-black font-mono ${importStats.invalid > 0 ? 'text-rose-500' : 'text-slate-400'}`}>{importStats.invalid}</span>
                  <span className={`text-sm font-bold ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>كروت مكررة / تم تجاهلها</span>
                </div>
              </div>

              {importStats.errors && importStats.errors.length > 0 && (
                <div className={`p-6 rounded-2xl mb-10 shadow-inner ${isDarkMode ? 'bg-rose-950/20 border border-rose-900/30' : 'bg-rose-50 border border-rose-100'}`}>
                  <div className="flex items-center gap-2 text-rose-500 font-bold mb-4 text-sm">
                    <AlertTriangle className="w-5 h-5" />
                    <span>سجل الملاحظات والأخطاء (تكرار / صيغة خاطئة):</span>
                  </div>
                  <div className="max-h-40 overflow-y-auto space-y-2.5 pr-2 custom-scrollbar">
                    {importStats.errors.map((err, idx) => (
                      <div key={idx} className={`text-xs font-bold leading-relaxed ${isDarkMode ? 'text-rose-400/80' : 'text-rose-600/80'}`}>
                        - {err}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <button
                  onClick={resetState}
                  className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-sm transition-all shadow-xl shadow-blue-500/25 flex items-center justify-center gap-2"
                >
                  <CloudUpload className="w-5 h-5" />
                  <span>استيراد ملف جديد</span>
                </button>
                
                <button
                  onClick={() => router.push('/owner/cards')}
                  className={`w-full sm:w-auto px-8 py-4 rounded-2xl font-extrabold text-sm transition-all flex items-center justify-center gap-2 shadow-xl ${
                    isDarkMode ? 'bg-[#1a2436] hover:bg-[#223049] text-slate-300 shadow-black/20' : 'bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 shadow-slate-200/50'
                  }`}
                >
                  <Layers className="w-5 h-5 text-blue-500" />
                  <span>الذهاب لإدارة الكروت</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};
