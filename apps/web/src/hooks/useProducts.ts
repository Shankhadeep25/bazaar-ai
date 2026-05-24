// ─── useProducts Hook ────────────────────────────────────────────────────────

import { useState, useCallback } from 'react';
import { compareProducts } from '../lib/api';
import type { CompareResponse } from '../lib/types';
import { toast } from 'sonner';

export function useProducts() {
  const [compareData, setCompareData] = useState<CompareResponse | null>(null);
  const [isComparing, setIsComparing] = useState(false);
  const [isCompareOpen, setIsCompareOpen] = useState(false);

  const runCompare = useCallback(async (productIds: string[]) => {
    if (productIds.length < 2) {
      toast.error('Select at least 2 products to compare');
      return;
    }

    setIsComparing(true);
    try {
      const data = await compareProducts(productIds);
      setCompareData(data);
      setIsCompareOpen(true);
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      toast.error(`Compare failed: ${error.message}`);
    } finally {
      setIsComparing(false);
    }
  }, []);

  const closeCompare = useCallback(() => {
    setIsCompareOpen(false);
    setCompareData(null);
  }, []);

  return {
    compareData,
    isComparing,
    isCompareOpen,
    runCompare,
    closeCompare,
  };
}
