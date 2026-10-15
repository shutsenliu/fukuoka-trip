import { useEffect, useState } from 'react';
import { parseComparison } from '../lib/proteinComparison';
import type { ComparisonState } from '../lib/proteinComparison';
export function usePriceComparison(id: string) {
  const key = `fukuoka-trip-price-comparison-${id}`;
  const [storageError, setStorageError] = useState(false);
  const [state, setState] = useState<ComparisonState>(() => {
    try { return parseComparison(localStorage.getItem(key)); } catch { return {records: []}; }
  });
  useEffect(() => {
    function sync(event: StorageEvent) {
      if (event.key !== key && event.key !== null) return;
      try { setState(parseComparison(localStorage.getItem(key))); setStorageError(false); } catch { setStorageError(true); }
    }
    window.addEventListener('storage',sync);
    return () => window.removeEventListener('storage',sync);
  },[key]);
  function save(next: ComparisonState) {
    setState(next);
    try { localStorage.setItem(key,JSON.stringify(next)); setStorageError(false); } catch { setStorageError(true); }
  }
  return {state, save, storageError};
}
