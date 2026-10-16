import { useRef, useState } from 'react';
import type { ChangeEvent } from 'react';
import type { ProxyState } from '../lib/proxyOrders';
import { decodeProxyBackup, encodeProxyBackup } from '../lib/proxyBackup';
export function ProxyBackup({state,disabled,onImport}: {state:ProxyState;disabled:boolean;onImport:(state:ProxyState)=>Promise<void>}) {
  const input=useRef<HTMLInputElement>(null);
  const [pending,setPending]=useState<ProxyState>();
  const [busy,setBusy]=useState(false),[error,setError]=useState(''),[message,setMessage]=useState('');
  async function retainStorage() {
    setError('');setMessage('');
    if(!navigator.storage?.persist){setMessage('此瀏覽器不支援要求保留資料，請定期匯出備份。');return;}
    try{const granted=await navigator.storage.persist();setMessage(granted?'瀏覽器已同意保留本機資料；手動清除網站資料仍會刪除紀錄。':'瀏覽器未同意保留資料；一般重新開啟仍會保留已存紀錄，請定期備份。');}catch{setMessage('無法取得保留資料狀態，請定期匯出備份。');}
  }
  async function exportBackup() {
    setBusy(true);setError('');setMessage('');
    try{
      const content=await encodeProxyBackup(state);const url=URL.createObjectURL(new Blob([content],{type:'application/json'}));
      const link=document.createElement('a');link.href=url;link.download=`fukuoka-proxy-backup-${new Intl.DateTimeFormat('sv-SE',{timeZone:'Asia/Taipei'}).format(new Date())}.json`;document.body.appendChild(link);link.click();link.remove();window.setTimeout(()=>URL.revokeObjectURL(url),10000);setMessage('備份檔已準備下載，包含代購需求、照片與金額。');
    }catch{setError('無法匯出備份，請重試。');}finally{setBusy(false);}
  }
  async function choose(event:ChangeEvent<HTMLInputElement>) {
    const file=event.target.files?.[0];event.target.value='';if(!file)return;
    setBusy(true);setError('');setMessage('');setPending(undefined);
    try{setPending(decodeProxyBackup(await file.text()));}catch(reason){setError(reason instanceof Error?reason.message:'備份讀取失敗。');}finally{setBusy(false);}
  }
  async function restore() {
    if(!pending)return;setBusy(true);setError('');
    try{await onImport(pending);setPending(undefined);setMessage('備份已匯入。');}catch{setError('備份未能儲存，原有紀錄沒有被清除，請確認瀏覽器儲存空間後重試。');}finally{setBusy(false);}
  }
  return <section className="proxy-backup">
    <div className="flex flex-wrap gap-2"><button className="button secondary" disabled={disabled||busy} onClick={()=>{void exportBackup();}}>匯出全部備份</button><button className="button secondary" disabled={disabled||busy} onClick={()=>input.current?.click()}>匯入備份</button></div>
    <input ref={input} className="sr-only" tabIndex={-1} type="file" accept="application/json,.json" aria-label="選擇代購備份" disabled={disabled||busy} onChange={choose}/>
    {pending&&<div className="card p-4 space-y-3"><p>準備匯入 {pending.purchases.length} 筆購買紀錄、{pending.purchases.filter(record=>record.photo).length} 張照片，以及 {pending.catalog.orders.length} 項代購需求。</p><p>其他紀錄會保留；相同項目的照片、金額會由備份覆蓋。</p><div className="flex flex-wrap gap-2"><button className="button" disabled={busy||disabled} onClick={()=>{void restore();}}>確認匯入</button><button className="button secondary" disabled={busy} onClick={()=>setPending(undefined)}>取消</button></div></div>}
    {error&&<p role="alert">{error}</p>}{message&&<p role="status">{message}</p>}
    <button className="button secondary" type="button" disabled={disabled||busy} onClick={()=>{void retainStorage();}}>要求保留本機資料</button>
    <p className="muted">已儲存的紀錄在正常關閉與重新開啟後仍會保留。請使用同一瀏覽器的一般模式。照片與金額只存在此瀏覽器，不會自動同步到其他裝置或 GitHub。清除瀏覽器資料會清除紀錄，請保留備份檔；備份含代購對象與照片，分享前請留意內容。</p>
  </section>;
}
