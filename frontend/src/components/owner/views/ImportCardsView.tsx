import { useRouter } from 'next/navigation';
import React, { useState, useRef } from 'react';
import {
  Moon,
  Sun,
  Globe,
  Settings,
  ChevronDown,
  ArrowRight,
  Upload,
  FileText,
  Key,
  Shield,
  LogOut,
  X,
  Check,
  AlertCircle,
  BarChart2,
  AlertTriangle,
} from 'lucide-react';

interface ImportCardsViewProps {
  isDarkMode: boolean;
  ownerName?: string;
  networkName?: string;
  onNavigateView?: (view: string) => void;
}

import * as XLSX from 'xlsx';

export const ImportCardsView: React.FC<ImportCardsViewProps> = ({
  isDarkMode,
  ownerName = 'هشام محمد الجايفي',
  networkName = 'برق نت',
  onNavigateView,
}) => {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [importStats, setImportStats] = useState<{ total: number; valid: number; invalid: number; batchId?: string; errors?: string[] } | null>(null);
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
            // Filter to only show active categories
            setCategories((found.card_categories || []).filter((c: any) => c.status !== 'inactive'));
          }
        }
      } catch (err) {
        console.error('Failed to fetch network data', err);
      }
    };
    fetchNetworkData();
  }, [networkName]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMessage(null);
    setImportStats(null);
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 10 * 1024 * 1024) {
        setErrorMessage('حجم الملف يتجاوز الحد الأقصى المسموح به (10 ميجابايت).');
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    setErrorMessage(null);
    setImportStats(null);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.size > 10 * 1024 * 1024) {
        setErrorMessage('حجم الملف يتجاوز الحد الأقصى المسموح به (10 ميجابايت).');
        return;
      }
      setSelectedFile(file);
    }
  };

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
              (window as any).pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js';
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

          const firstColLower = cols[0].toLowerCase();
          if (firstColLower.includes('user') || firstColLower.includes('اسم') || firstColLower.includes('كرت') || firstColLower === 'username' || firstColLower.includes('رقم')) {
              continue;
          }

          if (isPasswordRequired) {
              const code = cols[0];
              const password = cols.length > 1 ? cols[1] : undefined;
              if (code.length >= 6 && password && password.length >= 1) {
                  extractedCards.push({ code, password });
              }
          } else {
              // If no password is required, EVERY column in the row might be a separate card!
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

  const handleImport = async () => {
    setErrorMessage(null);
    setImportStats(null);
    
    if (!selectedCategory) {
      setErrorMessage('يرجى اختيار الفئة أولاً');
      return;
    }
    if (!selectedFile) {
      setErrorMessage('يرجى تحديد أو رفع ملف الكروت');
      return;
    }

    const categoryObj = categories.find(c => String(c.id) === String(selectedCategory));
    if (!categoryObj) {
      setErrorMessage('الفئة المحددة غير صالحة');
      return;
    }

    setIsSuccess(true);
    
    try {
      const cards = await parseFileAndExtractCards(selectedFile, categoryObj);
      
      if (cards.length === 0) {
        setErrorMessage('لم يتم العثور على أي كروت صالحة في الملف، أو أنها لا تتطابق مع شروط الفئة المحددة.');
        setIsSuccess(false);
        return;
      }

      const ext = selectedFile.name.split('.').pop()?.toUpperCase() || 'UNKNOWN';
      const file_type = ext;

      // Backend API Call
      const token = typeof localStorage !== 'undefined' ? localStorage.getItem('auth_token') : null;
      const response = await fetch(`/api/networks/${networkData.id}/import-cards`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ category_id: categoryObj.id, cards, file_type, uploaded_by: 'صاحب الشبكة' })
      });

      const responseData = await response.json();

      if (!response.ok) {
        if (responseData.duplicates && responseData.duplicates.length > 0) {
          setImportStats({
             total: cards.length,
             valid: 0,
             invalid: cards.length,
             errors: responseData.duplicates
          });
          setIsSuccess(false);
          return;
        }
        throw new Error(responseData.error || responseData.message || 'فشل استيراد الكروت. تأكد من صحة البيانات.');
      }
      
      setImportStats({
        total: cards.length,
        valid: responseData.count || 0,
        invalid: cards.length - (responseData.count || 0),
        batchId: responseData.batch_id,
        errors: responseData.errors || []
      });
      setIsSuccess(false);

      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

    } catch (error: any) {
      console.error(error);
      setErrorMessage(error.message || 'حدث خطأ أثناء معالجة الملف. يرجى التأكد من أن صيغته مدعومة وسليمة.');
      setIsSuccess(false);
    }
  };

  return (
    <div
      dir="rtl"
      className={` transition-colors font-['Cairo',sans-serif] ${
        isDarkMode ? 'bg-[#0a0f18] text-slate-100' : 'bg-slate-100 text-slate-800'
      }`}
    >
      {/* Main Area */}
      <main className="max-w-5xl mx-auto px-4 md:px-8 py-8 space-y-6">
        {/* Page Sub-Header */}
        <div className="flex items-center justify-between">
          

          
        </div>

        {/* Main Import Card Box */}
        <div
          className={`rounded-2xl p-6 md:p-8 border transition-all shadow-2xl ${
            isDarkMode
              ? 'bg-[#121926] border-slate-800 text-slate-100'
              : 'bg-white border-slate-200 text-slate-900 shadow-xl'
          }`}
        >
          {!importStats && (
            <>
              {/* Section Header */}
          <div className="text-center space-y-2 mb-8">
            <h2 className="text-2xl md:text-3xl font-extrabold flex items-center justify-center gap-2">
              <span>🎛️</span>
              <span>استيراد الكروت</span>
            </h2>
            <p className={`text-xs md:text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              قم برفع ملف CSV أو XLSX أو XLS أو PDF أو TXT يحتوي على الكروت
            </p>
          </div>

          {/* Instructions Box (Blue Card) */}
          <div
            className={`rounded-2xl p-5 md:p-6 mb-8 border transition-colors text-right space-y-2.5 ${
              isDarkMode
                ? 'bg-[#172338] border-blue-900/50 text-blue-100'
                : 'bg-blue-50/80 border-blue-200 text-blue-950'
            }`}
          >
            <h3 className="font-extrabold text-sm md:text-base flex items-center gap-2 text-blue-400">
              <span>📑</span>
              <span>تعليمات:</span>
            </h3>
            <ul className="text-xs md:text-sm space-y-1.5 leading-relaxed opacity-95 pr-2">
              <li className="flex items-start gap-2">
                <span className="text-blue-400 font-bold">•</span>
                <span>يقبل ملفات CSV أو XLSX أو XLS أو PDF أو TXT أو HTML</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-400 font-bold">•</span>
                <span>الحد الأقصى لحجم الملف: 10 MB</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-400 font-bold">•</span>
                <span>يجب ألا يقل طول رقم الكرت عن 6 أحرف/أرقام</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-400 font-bold">•</span>
                <span>
                  للفئات من نوع "مستخدم فقط": يدعم الملف عمود{' '}
                  <code className="px-1.5 py-0.5 rounded bg-blue-500/20 font-mono text-blue-300 font-bold">username</code>{' '}
                  فقط (بدون كلمة مرور)
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-400 font-bold">•</span>
                <span>
                  للفئات من نوع "مستخدم + كلمة مرور": يجب أن يحتوي الملف على عمودين (اسم/كلمة مرور) أو عناوين عربية
                </span>
              </li>
            </ul>
          </div>

          {/* Form Controls */}
          <div className="space-y-6 text-right max-w-3xl mx-auto">
            {/* Category Select */}
            <div>
              <label className={`block text-xs md:text-sm font-extrabold mb-2 ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>
                اختر الفئة:
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className={`w-full rounded-xl py-3 px-4 text-xs md:text-sm text-right font-medium focus:outline-none transition-all ${
                  isDarkMode
                    ? 'bg-[#1a2436] text-slate-100 border border-slate-700/80 focus:border-blue-500'
                    : 'bg-slate-50 text-slate-900 border border-slate-300 focus:border-blue-600'
                }`}
              >
                <option value="">-- اختر الفئة --</option>
                {categories.map((c: any) => (
                  <option key={c.id} value={c.id}>
                    فئة {c.name || c.price} ر.ي - ({c.card_type})
                  </option>
                ))}
              </select>
            </div>

            {/* File Upload Dropzone */}
            <div>
              <label className={`block text-xs md:text-sm font-extrabold mb-2 ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>
                اختر ملف CSV أو XLSX أو XLS أو PDF أو TXT أو HTML
              </label>

              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".csv,.xlsx,.xls,.pdf,.txt,.html"
                className="hidden"
              />

              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`w-full rounded-2xl border-2 border-dashed p-8 md:p-12 text-center transition-all cursor-pointer flex flex-col items-center justify-center space-y-4 ${
                  isDragging
                    ? 'border-blue-500 bg-blue-500/10'
                    : isDarkMode
                    ? 'border-slate-700/80 hover:border-slate-500 bg-[#172030]/60'
                    : 'border-slate-300 hover:border-slate-400 bg-slate-50'
                }`}
              >
                {selectedFile ? (
                  <div className="flex flex-col items-center space-y-2">
                    <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                      <FileText className="w-6 h-6" />
                    </div>
                    <span className="text-sm font-bold text-emerald-400">{selectedFile.name}</span>
                    <span className="text-xs text-slate-400 font-mono">
                      ({(selectedFile.size / 1024).toFixed(1)} KB)
                    </span>
                  </div>
                ) : (
                  <>
                    <p className={`text-xs md:text-sm font-bold ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                      اسحب الملف هنا أو انقر للاستعراض
                    </p>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        fileInputRef.current?.click();
                      }}
                      className="px-6 py-2.5 rounded-xl bg-blue-500 hover:bg-blue-600 text-white font-extrabold text-xs md:text-sm transition-all shadow-md shadow-blue-500/30 cursor-pointer"
                    >
                      استعراض
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Error Message */}
            {errorMessage && (
              <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs md:text-sm font-bold flex items-start gap-2">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            </div>
            </>
          )}

          {/* Import Stats Redesigned UI */}
          {importStats && (
            <div className={`mt-6 p-6 rounded-2xl border ${isDarkMode ? 'bg-[#141d2b] border-slate-700/60' : 'bg-slate-50 border-slate-200'} shadow-lg max-w-3xl mx-auto`}>
              <h3 className="text-lg font-black mb-6 flex items-center gap-2">
                <BarChart2 className="w-6 h-6 text-blue-500" />
                <span>نتائج الاستيراد</span>
              </h3>

              <div className={`grid ${importStats.invalid > 0 ? 'grid-cols-2' : 'grid-cols-1'} gap-6 mb-6`}>
                <div className={`p-6 rounded-xl flex flex-col items-center justify-center gap-2 ${isDarkMode ? 'bg-emerald-950/40 border border-emerald-900/50 text-emerald-500' : 'bg-emerald-50 border border-emerald-200 text-emerald-600'}`}>
                  <span className="text-4xl font-black font-mono">{importStats.valid}</span>
                  <span className="text-sm font-bold opacity-80">تم استيرادهم بنجاح</span>
                </div>
                {importStats.invalid > 0 && (
                  <div className={`p-6 rounded-xl flex flex-col items-center justify-center gap-2 ${isDarkMode ? 'bg-red-950/40 border border-red-900/50 text-red-500' : 'bg-red-50 border border-red-200 text-red-600'}`}>
                    <span className="text-4xl font-black font-mono">{importStats.invalid}</span>
                    <span className="text-sm font-bold opacity-80">فشل</span>
                  </div>
                )}
              </div>

              {importStats.batchId && (
                <div className={`p-4 rounded-xl mb-6 font-mono font-bold flex justify-between items-center text-sm ${isDarkMode ? 'bg-blue-900/20 border border-blue-800/40 text-blue-400' : 'bg-blue-50 border border-blue-200 text-blue-600'}`}>
                  <span>رقم الدفعة:</span>
                  <span>BATCH-{importStats.batchId}</span>
                </div>
              )}

              {importStats.errors && importStats.errors.length > 0 && (
                <div className={`p-4 rounded-xl flex flex-col gap-2 ${isDarkMode ? 'bg-red-950/20 border border-red-900/30' : 'bg-red-50 border border-red-100'}`}>
                  <div className="flex items-center gap-2 text-red-500 font-bold mb-1">
                    <AlertTriangle className="w-5 h-5" />
                    <span>الأخطاء والتكرارات:</span>
                  </div>
                  <div className="max-h-32 overflow-y-auto space-y-1.5 pr-2 custom-scrollbar">
                    {importStats.errors.map((err, idx) => (
                      <div key={idx} className={`text-xs font-bold ${isDarkMode ? 'text-red-400' : 'text-red-700'}`}>
                        - {err}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className={`flex items-center justify-end gap-3 pt-6 mt-6 border-t ${isDarkMode ? 'border-slate-700/30' : 'border-slate-200'}`}>
                <button
                  onClick={() => {
                    setImportStats(null);
                    setSelectedFile(null);
                    setErrorMessage(null);
                    if (fileInputRef.current) {
                      fileInputRef.current.value = '';
                    }
                  }}
                  className="px-8 py-3 rounded-xl bg-blue-500 hover:bg-blue-600 text-white font-extrabold text-xs md:text-sm transition-all shadow-lg shadow-blue-500/30 cursor-pointer"
                >
                  استيراد ملف جديد
                </button>
              </div>
            </div>
          )}
          
          {!importStats && (
            <div className="flex items-center justify-center gap-3 pt-6">
              <button
                onClick={handleImport}
                disabled={isSuccess}
                className="px-8 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs md:text-sm transition-all shadow-lg shadow-emerald-900/40 cursor-pointer flex items-center gap-2 disabled:opacity-50"
              >
                <span>🎛️</span>
                <span>{isSuccess ? 'جاري الاستيراد...' : 'استيراد'}</span>
              </button>

              <button
                onClick={() => router.push('/owner/details')}
                className={`px-8 py-3 rounded-xl font-extrabold text-xs md:text-sm transition-all cursor-pointer ${
                  isDarkMode
                    ? 'bg-[#1f2a3e] hover:bg-[#283650] text-slate-300 border border-slate-700/60'
                    : 'bg-slate-200 hover:bg-slate-300 text-slate-700'
                }`}
              >
                إلغاء
              </button>
            </div>
          )}
          </div>
      </main>
    </div>
  );
};
