import React from 'react';

export const KarootLogo: React.FC<{ className?: string, isDarkMode?: boolean }> = ({ className = "h-11", isDarkMode = true }) => {
  return (
    <div className={`flex items-center gap-2.5 dir-rtl ${className}`}>
      {/* Icon */}
      <img 
        src={isDarkMode ? '/logos/logo-dark.png' : '/logos/logo-light.png'} 
        alt="Card Box Logo" 
        className="w-10 h-10 object-cover rounded-2xl flex-shrink-0"
      />
      {/* Text */}
      <div className="flex flex-col flex-shrink-0 justify-center">
        <span className={`font-extrabold text-xl tracking-tight font-['Cairo'] whitespace-nowrap leading-none mb-1 ${isDarkMode ? 'text-white' : 'text-slate-900 dark:text-white'}`}>
          Card Box
        </span>
        <span className={`text-[9px] font-bold tracking-widest uppercase opacity-90 whitespace-nowrap leading-none ${isDarkMode ? 'text-slate-300' : 'text-slate-500 dark:text-slate-400'}`}>
          Network Cards
        </span>
      </div>
    </div>
  );
};

export const JaibLogo: React.FC<{ className?: string }> = ({ className = "h-10" }) => {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      {/* Red badge */}
      <div className="bg-gradient-to-r from-red-600 via-rose-600 to-red-700 text-white px-3.5 py-1.5 rounded-2xl shadow-md shadow-red-900/30 border border-red-500/30 flex items-center gap-2">
        <div className="flex flex-col text-right leading-none">
          <span className="font-black text-xl tracking-tight font-['Cairo']">جيب</span>
          <span className="text-[9px] font-bold text-red-200 tracking-wider">JAIB</span>
        </div>
        <div className="w-7 h-7 rounded-full bg-white/15 flex items-center justify-center backdrop-blur-xs">
          <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4 text-white" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="5" width="20" height="14" rx="3" />
            <line x1="2" y1="10" x2="22" y2="10" />
            <circle cx="17" cy="15" r="1.5" fill="currentColor" />
          </svg>
        </div>
      </div>
    </div>
  );
};
