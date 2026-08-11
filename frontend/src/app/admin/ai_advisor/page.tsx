"use client";

import React from 'react';
import { useAppContext } from '../../../context/AppContext';
import { AIPackageAdvisor } from '../../../components/public/portal/AIPackageAdvisor';

export default function AIAdvisorPage() {
  const { isDarkMode } = useAppContext();

  return (
    <div className="animate-in fade-in duration-300">
      <AIPackageAdvisor 
        isDarkMode={isDarkMode} 
        onApplyPackages={() => {}} 
      />
    </div>
  );
}
