import React from 'react';
import { useOwnerContext } from '../../context/OwnerContext';
import { useAppContext } from '../../context/AppContext';
import { X } from 'lucide-react';

export const GlobalOwnerModals = () => {
  const { isDarkMode } = useAppContext();
  const { showSearchModal, setShowSearchModal, searchQuery, setSearchQuery } = useOwnerContext();

  return (
    <>
      {/* Search Modal */}
      {showSearchModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-[60] flex items-center justify-center p-4">
          <div
            className={`w-full max-w-md rounded-2xl p-6 border shadow-2xl relative ${
              isDarkMode
                ? 'bg-[#141d2b] border-slate-700 text-white'
                : 'bg-white border-slate-200 text-slate-900'
            }`}
          >
            <button
              onClick={() => setShowSearchModal(false)}
              className="absolute top-4 left-4 text-slate-400 hover:text-slate-200 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-lg font-bold mb-4 text-right">بحث بالاسم او الكود</h3>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="بحث بالاسم او الكود..."
              className={`w-full rounded-xl py-2.5 px-4 text-sm text-right focus:outline-none focus:ring-1 transition-all mb-4 ${
                isDarkMode
                  ? 'bg-[#202b3c] text-white border border-slate-700'
                  : 'bg-slate-100 text-slate-900 border border-slate-300'
              }`}
              autoFocus
            />
            <button
              onClick={() => setShowSearchModal(false)}
              className="w-full bg-blue-600 text-white font-bold py-2.5 rounded-xl cursor-pointer"
            >
              موافق
            </button>
          </div>
        </div>
      )}
    </>
  );
};
