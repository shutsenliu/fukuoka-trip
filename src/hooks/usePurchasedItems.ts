import { useSyncExternalStore } from 'react';
const KEY = 'fukuoka-trip-purchased-items';
const listeners = new Set<() => void>();
let cache: string[] = [];
let lastRaw: string | null | undefined;
let storageError = false;
function read(): string[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw !== lastRaw) {
      lastRaw = raw;
      try { const parsed: unknown = JSON.parse(raw ?? '[]'); cache = Array.isArray(parsed) ? parsed.filter((id): id is string => typeof id === 'string') : []; }
      catch { cache = []; }
    }
  } catch { storageError = true; }
  return cache;
}
function write(ids: string[]) {
  cache = ids;
  try { localStorage.setItem(KEY, JSON.stringify(ids)); lastRaw = JSON.stringify(ids); storageError = false; }
  catch { storageError = true; }
  listeners.forEach(listener => listener());
}
function subscribe(listener: () => void) { listeners.add(listener); return () => { listeners.delete(listener); }; }
window.addEventListener('storage', event => { if (event.key === KEY || event.key === null) { lastRaw = undefined; listeners.forEach(listener => listener()); } });
export function usePurchasedItems() {
  const purchased = useSyncExternalStore(subscribe, read);
  return { isPurchased: (id: string) => purchased.includes(id), togglePurchased: (id: string) => write(purchased.includes(id) ? purchased.filter(item => item !== id) : [...purchased, id]), clearPurchased: () => write([]), storageError };
}
