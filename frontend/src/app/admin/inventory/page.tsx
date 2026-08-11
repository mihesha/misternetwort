"use client";
import React from 'react';
import { useAppContext } from '../../../context/AppContext';
import { useAdminContext } from '../../../context/AdminContext';
import { useAdminActions } from '../../../hooks/useAdminActions';
import { InventoryView } from '../../../components/admin/views/InventoryView';

export default function InventoryPage() {
  const { isDarkMode } = useAppContext();
  const {
    activeNetworks,
    cardBatchNetId,
    setCardBatchNetId,
    cardBatchCategory,
    setCardBatchCategory,
    cardBatchCount,
    setCardBatchCount,
    generatedBatch,
  } = useAdminContext();
  const { handleGenerateCardsBatch } = useAdminActions();

  return (
    <InventoryView
      isDarkMode={isDarkMode}
      activeNetworks={activeNetworks}
      cardBatchNetId={cardBatchNetId}
      setCardBatchNetId={setCardBatchNetId}
      cardBatchCategory={cardBatchCategory}
      setCardBatchCategory={setCardBatchCategory}
      cardBatchCount={cardBatchCount}
      setCardBatchCount={setCardBatchCount}
      handleGenerateCardsBatch={handleGenerateCardsBatch}
      generatedBatch={generatedBatch}
    />
  );
}
