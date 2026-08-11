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
        {/* SVG Logo that adapts to Light and Dark mode */}
        <svg
          viewBox="0 0 200 200"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full drop-shadow-md transition-transform hover:scale-105 duration-300"
        >
          <defs>
            {/* Glow Filters for Dark Mode */}
            <filter id="neon-glow-cyan" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            {/* Gradient for Wifi Signal */}
            <linearGradient id="wifi-gradient" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#10B981" />
              <stop offset="50%" stopColor="#EAB308" />
              <stop offset="100%" stopColor="#F97316" />
            </linearGradient>

            <linearGradient id="box-light-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#0891B2" />
              <stop offset="100%" stopColor="#0284C7" />
            </linearGradient>
          </defs>

          {/* ===== 1. CARDS (FANNING OUT FROM BOX) ===== */}

          {/* Card 1: RED (Top Left) */}
          <g className="transition-transform origin-center hover:translate-y-[-2px]">
            {/* Dark mode neon outline vs Light mode solid fill */}
            <rect
              x="50"
              y="20"
              width="75"
              height="50"
              rx="6"
              transform="rotate(-25 50 20)"
              className="fill-red-600 dark:fill-transparent stroke-red-500 dark:stroke-red-500 stroke-[3.5] dark:filter-[url(#neon-glow-cyan)]"
            />
            {/* Wifi Lines on Card 1 */}
            <path
              d="M 68 28 A 8 8 0 0 1 76 34 M 70 31 A 5 5 0 0 1 75 35 M 72 34 A 2 2 0 0 1 74 36"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              className="dark:stroke-red-400"
            />
          </g>

          {/* Card 2: BLUE (Second) */}
          <g className="transition-transform origin-center hover:translate-y-[-2px]">
            <rect
              x="68"
              y="32"
              width="75"
              height="50"
              rx="6"
              transform="rotate(-15 68 32)"
              className="fill-blue-600 dark:fill-transparent stroke-blue-500 dark:stroke-cyan-400 stroke-[3.5]"
            />
            <path
              d="M 88 38 A 8 8 0 0 1 96 44 M 90 41 A 5 5 0 0 1 95 45 M 92 44 A 2 2 0 0 1 94 46"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              className="dark:stroke-cyan-300"
            />
          </g>

          {/* Card 3: GREEN (Third) */}
          <g className="transition-transform origin-center hover:translate-y-[-2px]">
            <rect
              x="82"
              y="45"
              width="75"
              height="50"
              rx="6"
              transform="rotate(-5 82 45)"
              className="fill-emerald-600 dark:fill-transparent stroke-emerald-500 dark:stroke-emerald-400 stroke-[3.5]"
            />
            <path
              d="M 105 50 A 8 8 0 0 1 113 56 M 107 53 A 5 5 0 0 1 112 57 M 109 56 A 2 2 0 0 1 111 58"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              className="dark:stroke-emerald-300"
            />
          </g>

          {/* Card 4: ORANGE (Front Right) */}
          <g className="transition-transform origin-center hover:translate-y-[-2px]">
            <rect
              x="95"
              y="58"
              width="75"
              height="50"
              rx="6"
              transform="rotate(8 95 58)"
              className="fill-amber-500 dark:fill-transparent stroke-amber-500 dark:stroke-amber-400 stroke-[3.5]"
            />
            <path
              d="M 120 62 A 8 8 0 0 1 128 68 M 122 65 A 5 5 0 0 1 127 69 M 124 68 A 2 2 0 0 1 126 70"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              className="dark:stroke-amber-300"
            />
          </g>

          {/* ===== 2. WI-FI SYMBOL OVERLAY (CENTER/FRONT) ===== */}
          <g transform="translate(68, 75)">
            <path
              d="M 5 25 A 32 32 0 0 1 55 25"
              stroke="url(#wifi-gradient)"
              strokeWidth="5"
              strokeLinecap="round"
              fill="none"
            />
            <path
              d="M 14 31 A 20 20 0 0 1 46 31"
              stroke="url(#wifi-gradient)"
              strokeWidth="4"
              strokeLinecap="round"
              fill="none"
            />
            <path
              d="M 22 37 A 10 10 0 0 1 38 37"
              stroke="url(#wifi-gradient)"
              strokeWidth="3.5"
              strokeLinecap="round"
              fill="none"
            />
            <circle cx="30" cy="42" r="3" fill="#10B981" className="dark:fill-emerald-400" />
          </g>

          {/* ===== 3. OPEN ISOMETRIC BOX WITH YEMENI ARCHITECTURE ===== */}
          {/* Box Outline & Panels */}
          <g className="stroke-cyan-600 dark:stroke-cyan-400 stroke-[3.5] stroke-linejoin-round stroke-linecap-round">
            {/* Top Flaps (Open Box) */}
            {/* Back Flap Left */}
            <path
              d="M 42 100 L 22 92 L 60 76 L 80 84 Z"
              className="fill-slate-100 dark:fill-transparent stroke-cyan-600 dark:stroke-cyan-400"
            />
            {/* Back Flap Right */}
            <path
              d="M 158 100 L 178 92 L 140 76 L 120 84 Z"
              className="fill-slate-100 dark:fill-transparent stroke-cyan-600 dark:stroke-cyan-400"
            />

            {/* Front Left Flap */}
            <path
              d="M 42 100 L 18 116 L 62 132 L 80 116 Z"
              className="fill-slate-200 dark:fill-transparent stroke-cyan-600 dark:stroke-cyan-400"
            />
            {/* Front Right Flap */}
            <path
              d="M 158 100 L 182 116 L 138 132 L 120 116 Z"
              className="fill-slate-200 dark:fill-transparent stroke-cyan-600 dark:stroke-cyan-400"
            />

            {/* Main Box Base - Front Left Face */}
            <path
              d="M 42 100 L 100 132 L 100 185 L 42 153 Z"
              className="fill-cyan-50/80 dark:fill-slate-950/60 stroke-cyan-600 dark:stroke-cyan-400"
            />
            {/* Main Box Base - Front Right Face (With Yemeni Architecture) */}
            <path
              d="M 100 132 L 158 100 L 158 153 L 100 185 Z"
              className="fill-cyan-100/80 dark:fill-slate-900/80 stroke-cyan-600 dark:stroke-cyan-400"
            />
          </g>

          {/* Yemeni Traditional Architecture Silhouette on Right Face of Box */}
          <g
            transform="translate(108, 138) scale(0.38) rotate(-15)"
            className="stroke-amber-600 dark:stroke-amber-400 stroke-[2.5] fill-none"
          >
            {/* Castle / Dar Al-Hajar outline */}
            <rect x="10" y="30" width="80" height="60" rx="2" />
            <path d="M 10 30 L 50 10 L 90 30" />
            {/* Arched Windows */}
            <path d="M 25 45 A 8 8 0 0 1 40 45 L 40 58 L 25 58 Z" />
            <path d="M 60 45 A 8 8 0 0 1 75 45 L 75 58 L 60 58 Z" />
            <path d="M 42 68 L 58 68 L 58 90 L 42 90 Z" />
            {/* Traditional Yemeni Decorative Frills */}
            <line x1="10" y1="38" x2="90" y2="38" strokeWidth="2" />
            <line x1="10" y1="62" x2="90" y2="62" strokeWidth="2" />
          </g>
        </svg>
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
