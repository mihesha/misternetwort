'use client';

import React, { useState, useEffect } from 'react';
import { Wifi, Search, MapPin, Heart, ArrowLeft, Hash } from 'lucide-react';
import Button from '@/components/common/Button';
import { PublicNetworkInfo } from '@/types';
import { useRouter } from 'next/navigation';

export default function NetworksPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<PublicNetworkInfo[] | null>(null);
  const [favoriteNetworks, setFavoriteNetworks] = useState<PublicNetworkInfo[]>([]);
  const [loadingFavorites, setLoadingFavorites] = useState(true);

  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        const savedUser = localStorage.getItem('cardbox_user');
        if (!savedUser) {
          setLoadingFavorites(false);
          return;
        }

        const parsedUser = JSON.parse(savedUser);
        if (parsedUser && parsedUser.token) {
          const res = await fetch('/api/customer/purchases', {
            headers: { 'Authorization': `Bearer ${parsedUser.token}` }
          });
          if (res.ok) {
            const data = await res.json();
            if (data.purchases && data.purchases.length > 0) {
              const networksMap = new Map<string, PublicNetworkInfo>();

              data.purchases.forEach((card: any) => {
                if (card.networkCode && card.networkName && card.networkName !== 'غير معروف') {
                  if (!networksMap.has(card.networkCode)) {
                    networksMap.set(card.networkCode, {
                      id: card.englishName || card.networkCode,
                      networkCode: card.networkCode,
                      name: card.networkName,
                      nameAr: card.networkName,
                      location: 'الشبكة',
                      coverageArea: '',
                      activeNodes: 1,
                      status: 'online'
                    });
                  }
                }
              });

              setFavoriteNetworks(Array.from(networksMap.values()));
            }
          }
        }
      } catch (e) {
        console.error('Failed to load favorites', e);
      } finally {
        setLoadingFavorites(false);
      }
    };

    fetchFavorites();
  }, []);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      // Call search endpoint
      const res = await fetch(`/api/networks/search?q=${encodeURIComponent(searchQuery)}`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          const mapped: PublicNetworkInfo[] = data.map((d: any) => ({
            id: d.english_name || d.network_code || d.networkCode || d.id || 'unknown',
            networkCode: d.network_code || d.networkCode || String(d.id || ''),
            name: d.networkName || d.name || 'غير معروف',
            nameAr: d.networkName || d.name || 'غير معروف',
            location: [d.governorate, d.city, d.neighborhood].filter(Boolean).join(' - '),
            coverageArea: d.neighborhood || '',
            activeNodes: d.activeNodes || 10,
            status: (d.status === 'active' ? 'online' : 'maintenance') as 'online' | 'maintenance',
          }));
          setSearchResults(mapped);
        } else if (data.id || data.networkCode) {
          setSearchResults([{
            id: data.english_name || data.network_code || data.networkCode || data.id,
            networkCode: data.network_code || data.networkCode || String(data.id || ''),
            name: data.networkName || data.name,
            nameAr: data.networkName || data.name,
            location: [data.governorate, data.city, data.neighborhood].filter(Boolean).join(' - '),
            coverageArea: data.neighborhood || '',
            activeNodes: data.activeNodes || 10,
            status: (data.status === 'active' ? 'online' : 'maintenance') as 'online' | 'maintenance',
          }]);
        } else {
          setSearchResults([]);
        }
      } else {
        // Fallback: try fetching by exact domain/code if search endpoint is not available
        const codeRes = await fetch(`/api/networks/${searchQuery}`);
        if (codeRes.ok) {
          const data = await codeRes.json();
          setSearchResults([{
            id: data.english_name || data.network_code || data.networkCode || data.id || searchQuery,
            networkCode: data.network_code || data.networkCode || String(data.id || ''),
            name: data.networkName || data.name,
            nameAr: data.networkName || data.name,
            location: [data.governorate, data.city, data.neighborhood].filter(Boolean).join(' - '),
            coverageArea: data.neighborhood || '',
            activeNodes: data.activeNodes || 10,
            status: (data.status === 'active' ? 'online' : 'maintenance') as 'online' | 'maintenance',
          }]);
        } else {
          setSearchResults([]);
        }
      }
    } catch (error) {
      console.error(error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleNetworkClick = (networkId: string) => {
    // Redirect to the unified network path using Next.js router for a seamless SPA transition
    router.push(`/n/${networkId}`);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-12 py-8 text-right dir-rtl px-4">

      {/* Search Container */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-100 dark:border-slate-800">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">

          {/* Right Side - Title */}
          <div className="text-center md:text-right w-full md:w-auto space-y-1">
            <span className="text-purple-600 dark:text-purple-400 font-bold text-sm">البحث السريع</span>
            <h1 className="text-2xl sm:text-3xl font-extrabold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent pb-1">
              ابحث عن شبكتك
            </h1>
          </div>

          {/* Left Side - Input */}
          <div className="flex items-center gap-3 w-full md:w-[480px]">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="البحث باسم الشبكة او بكود الشبكة..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-2xl py-3.5 pr-11 pl-4 text-sm focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all text-slate-900 dark:text-slate-100"
              />
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            </div>
            <Button
              onClick={handleSearch}
              isLoading={isSearching}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-2xl px-8 py-3.5 font-bold shadow-md shadow-purple-500/20"
            >
              ابحث
            </Button>
          </div>

        </div>
      </div>

      {/* Results or Empty State */}
      <div className="flex flex-col items-center justify-center min-h-[300px]">
        {searchResults === null ? (
          favoriteNetworks.length > 0 ? (
            <div className="w-full space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex items-center gap-2">
                <Heart className="w-6 h-6 text-pink-500 fill-pink-500" />
                <h2 className="text-xl sm:text-2xl font-black text-slate-800 dark:text-slate-100">
                  شبكاتك المفضلة والمشتريات السابقة
                </h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
                {favoriteNetworks.map((net) => (
                  <div
                    key={net.id}
                    onClick={() => handleNetworkClick(net.id)}
                    className="bg-white dark:bg-slate-900 border border-purple-200 dark:border-purple-800/60 rounded-3xl p-6 space-y-4 shadow-sm hover:border-purple-500 hover:shadow-purple-500/10 dark:hover:border-purple-500 transition-all cursor-pointer group"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-indigo-700 text-white rounded-2xl flex items-center justify-center shrink-0 font-bold shadow-md">
                          <Wifi className="w-6 h-6" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-black text-lg text-slate-900 dark:text-slate-100 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors leading-tight">
                              {net.nameAr}
                            </h3>
                            {net.networkCode && (
                              <span className="text-[10px] sm:text-xs font-mono tracking-wider font-bold bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 px-2 py-0.5 rounded border border-purple-200 dark:border-purple-800/60 shadow-sm flex items-center gap-0.5">
                                <Hash className="w-3 h-3 text-purple-500" />
                                {net.networkCode}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-500 flex items-start gap-1.5 mt-1.5">
                            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                            <span className="break-words leading-relaxed">{net.location || 'الشبكة'}</span>
                          </p>
                        </div>
                      </div>
                      <button className="px-3 py-1.5 bg-purple-100 hover:bg-purple-200 dark:bg-purple-900/40 dark:hover:bg-purple-800/60 text-purple-700 dark:text-purple-300 text-xs font-bold rounded-xl flex items-center gap-1 transition-colors">
                        دخول <ArrowLeft className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="w-24 h-24 mx-auto rounded-[2rem] bg-gradient-to-b from-blue-400 to-purple-600 flex items-center justify-center shadow-lg shadow-purple-500/30">
                <Wifi className="w-12 h-12 text-white" />
              </div>
              <div className="space-y-3 max-w-md mx-auto">
                <h2 className="text-xl sm:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-l from-blue-600 to-purple-600 leading-normal">
                  ابحث باسم أو رقم الشبكة لشراء كرتك
                </h2>
                <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                  أدخل اسم الشبكة أو الرقم الفريد الخاص بها في خانة البحث أعلاه، ثم اضغط "ابحث".
                </p>
              </div>
            </div>
          )
        ) : searchResults.length > 0 ? (
          <div className="w-full space-y-4">
            <h3 className="font-bold text-slate-700 dark:text-slate-300 mb-2">نتائج البحث ({searchResults.length}):</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {searchResults.map((net) => (
                <div
                  key={net.id}
                  onClick={() => handleNetworkClick(net.id)}
                  className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 space-y-4 shadow-sm hover:border-purple-500 hover:shadow-purple-500/10 dark:hover:border-purple-500 transition-all cursor-pointer group"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="p-3.5 bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-2xl group-hover:bg-purple-600 group-hover:text-white transition-colors duration-300">
                        <Wifi className="w-7 h-7" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-black text-lg text-slate-900 dark:text-slate-100 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors leading-tight">
                            {net.nameAr}
                          </h3>
                          {net.networkCode && (
                            <span className="text-[10px] sm:text-xs font-mono tracking-wider font-bold bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 px-2 py-0.5 rounded border border-purple-200 dark:border-purple-800/60 shadow-sm flex items-center gap-0.5">
                              <Hash className="w-3 h-3 text-purple-500" />
                              {net.networkCode}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 flex items-start gap-1.5 mt-1.5">
                          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                          <span className="break-words leading-relaxed">{net.location || 'موقع غير محدد'}</span>
                        </p>
                      </div>
                    </div>
                    <span className="inline-flex items-center gap-1.5 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 px-3 py-1.5 rounded-full text-xs font-bold border border-emerald-100 dark:border-emerald-800/30">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                      نشطة
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center space-y-4 animate-in fade-in duration-300">
            <div className="w-20 h-20 mx-auto rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
              <Search className="w-10 h-10 text-slate-400" />
            </div>
            <h3 className="text-slate-800 dark:text-slate-200 font-bold text-xl">لم يتم العثور على شبكة بهذا الاسم أو الرقم</h3>
            <p className="text-slate-500 text-sm max-w-sm mx-auto leading-relaxed">
              يرجى التأكد من كتابة الاسم أو الرقم الفريد بشكل صحيح والمحاولة مرة أخرى.
            </p>
          </div>
        )}
      </div>

    </div>
  );
}
