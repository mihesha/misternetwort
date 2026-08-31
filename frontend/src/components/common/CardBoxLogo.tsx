'use client';

import React from 'react';

interface CardBoxLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
}

export const CardBoxLogo: React.FC<CardBoxLogoProps> = ({
  className = '',
  size = 'md',
  showText = true,
}) => {
  const sizeMap = {
    sm: { box: 'w-8 h-8', text: 'text-base' },
    md: { box: 'w-10 h-10', text: 'text-xl' },
    lg: { box: 'w-14 h-14', text: 'text-2xl' },
    xl: { box: 'w-20 h-20', text: 'text-3xl' },
  };

  const dimensions = sizeMap[size];

  return (
    <div className={`inline-flex items-center gap-2.5 ${className}`}>
      <div className={`relative shrink-0 ${dimensions.box}`}>
        <img 
          src="/logos/logo-light.png" 
          alt="Card Box Logo" 
          className="w-full h-full object-cover rounded-xl block dark:hidden drop-shadow-md transition-transform hover:scale-105 duration-300" 
        />
        <img 
          src="/logos/logo-dark.png" 
          alt="Card Box Logo" 
          className="w-full h-full object-cover rounded-xl hidden dark:block drop-shadow-md transition-transform hover:scale-105 duration-300" 
        />
      </div>

      {showText && (
        <div className="flex flex-col text-right">
          <span className={`font-black tracking-tight text-slate-900 dark:text-slate-50 leading-tight ${dimensions.text}`}>
            كارد بوكس
          </span>
          <span className="text-[10px] sm:text-xs font-bold text-purple-600 dark:text-purple-400 tracking-wider font-sans uppercase">
            Card Box
          </span>
        </div>
      )}
    </div>
  );
};

export default CardBoxLogo;
