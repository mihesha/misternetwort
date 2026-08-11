'use client';

import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'success' | 'purple' | 'amber' | 'slate';
  size?: 'sm' | 'md';
  className?: string;
  dot?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'success',
  size = 'md',
  className = '',
  dot = false,
}) => {
  const variants = {
    success: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20',
    purple: 'bg-purple-500/10 text-purple-700 dark:text-purple-300 border border-purple-500/20',
    amber: 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20',
    slate: 'bg-slate-500/10 text-slate-700 dark:text-slate-300 border border-slate-500/20',
  };

  const sizes = {
    sm: 'text-[11px] px-2 py-0.5 rounded-md font-medium',
    md: 'text-xs px-2.5 py-1 rounded-lg font-semibold',
  };

  return (
    <span className={`inline-flex items-center gap-1.5 ${variants[variant]} ${sizes[size]} ${className}`}>
      {dot && <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />}
      <span>{children}</span>
    </span>
  );
};

export default Badge;
