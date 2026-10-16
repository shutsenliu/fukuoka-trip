import { useCallback, useEffect, useState } from 'react';
import { mergeCatalog, proxyCatalog } from '../lib/proxyOrders';
import type { ProxyPurchase, ProxyState } from '../lib/proxyOrders';
import { deleteProxyPurchase, importProxyPurchases, readProxyState, saveProxyPurchase } from '../lib/proxyStorage';
export function useProxyOrders() {
  const [state,setState] = useState<ProxyState>({catalog:proxyCatalog,purchases:[]});
  const [loading,setLoading] = useState(true);
  const [error,setError] = useState('');
  const refresh = useCallback(async()=>{
    try {const saved=await readProxyState();setState({...saved,catalog:mergeCatalog(saved.catalog,proxyCatalog)});setError('');}
    catch {setError('無法開啟此瀏覽器的代購儲存空間，請允許網站儲存資料後重試。');}
    finally {setLoading(false);}
  },[]);
  useEffect(()=>{void refresh();const sync=()=>{void refresh();};window.addEventListener('focus',sync);return()=>window.removeEventListener('focus',sync);},[refresh]);
  async function save(purchase: ProxyPurchase) { await saveProxyPurchase(purchase,state.catalog);await refresh(); }
  async function remove(orderId:string) { await deleteProxyPurchase(orderId);await refresh(); }
  async function restore(backup:ProxyState) { await importProxyPurchases(backup);await refresh(); }
  return {state,loading,error,refresh,save,remove,restore};
}
