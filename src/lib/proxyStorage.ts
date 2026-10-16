import { emptyCatalog, mergeCatalog } from './proxyOrders';
import type { ProxyCatalog, ProxyPurchase, ProxyState } from './proxyOrders';
const DB_NAME = 'fukuoka-trip-proxy';
function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve,reject) => {
    const request = indexedDB.open(DB_NAME,1);
    request.onupgradeneeded = () => {
      request.result.createObjectStore('purchases',{keyPath:'orderId'});
      request.result.createObjectStore('catalog');
    };
    request.onerror = () => reject(request.error);
    request.onblocked = () => reject(new Error('請關閉其他開啟此網站的分頁後再試。'));
    request.onsuccess = () => resolve(request.result);
  });
}
export async function readProxyState(): Promise<ProxyState> {
  const db = await openDatabase();
  return new Promise((resolve,reject) => {
    const tx = db.transaction(['purchases','catalog'],'readonly');
    const purchases = tx.objectStore('purchases').getAll();
    const catalog = tx.objectStore('catalog').get('snapshot');
    tx.oncomplete = () => {db.close();resolve({purchases:purchases.result as ProxyPurchase[],catalog:(catalog.result as ProxyCatalog | undefined) ?? emptyCatalog()});};
    tx.onerror = () => {db.close();reject(tx.error);};
    tx.onabort = () => {db.close();reject(tx.error);};
  });
}
// Both photos and their associated catalog are written in one transaction.
async function writePurchases(records: ProxyPurchase[], catalog: ProxyCatalog) {
  const db = await openDatabase();
  return new Promise<void>((resolve,reject) => {
    const tx = db.transaction(['purchases','catalog'],'readwrite');
    const metadata = tx.objectStore('catalog');
    const old = metadata.get('snapshot');
    old.onsuccess = () => {
      metadata.put(mergeCatalog((old.result as ProxyCatalog | undefined) ?? emptyCatalog(),catalog),'snapshot');
      for (const record of records) tx.objectStore('purchases').put(record);
    };
    tx.oncomplete = () => {db.close();resolve();};
    tx.onerror = () => {db.close();reject(tx.error);};
    tx.onabort = () => {db.close();reject(tx.error);};
  });
}
export const saveProxyPurchase = (purchase: ProxyPurchase,catalog: ProxyCatalog) => writePurchases([purchase],catalog);
export const importProxyPurchases = (state: ProxyState) => writePurchases(state.purchases,state.catalog);
export async function deleteProxyPurchase(orderId: string) {
  const db = await openDatabase();
  return new Promise<void>((resolve,reject) => {
    const tx = db.transaction('purchases','readwrite');tx.objectStore('purchases').delete(orderId);
    tx.oncomplete = () => {db.close();resolve();};tx.onerror = () => {db.close();reject(tx.error);};tx.onabort = () => {db.close();reject(tx.error);};
  });
}
