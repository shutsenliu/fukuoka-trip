import { useEffect, useRef, useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import type { ProxyOrder, ProxyPerson, ProxyProduct, ProxyPurchase } from '../lib/proxyOrders';
import { purchaseStatus, validAmount } from '../lib/proxyOrders';
import { prepareProxyPhoto } from '../lib/proxyPhotos';
import { PurchaseOptions } from './PurchaseOptions';
import { PlaceInfo } from './PlaceInfo';
import { placesById } from '../lib/data';

export function ProxyOrderCard({order,person,product,purchase,disabled,onSave,onRemove}: {
  order:ProxyOrder;person:ProxyPerson;product:ProxyProduct;purchase?:ProxyPurchase;disabled:boolean;
  onSave:(purchase:ProxyPurchase)=>Promise<void>;onRemove:(orderId:string)=>Promise<void>;
}) {
  const [photo,setPhoto] = useState<Blob|null>(purchase?.photo??null);
  const [amount,setAmount] = useState(purchase?.amountYen?.toString()??'');
  const [photoUrl,setPhotoUrl] = useState('');
  const [showPhoto,setShowPhoto] = useState(false);
  const [busy,setBusy] = useState(false);
  const [message,setMessage] = useState('');
  const [error,setError] = useState('');
  const camera = useRef<HTMLInputElement>(null), album = useRef<HTMLInputElement>(null);
  useEffect(()=>{setPhoto(purchase?.photo??null);setAmount(purchase?.amountYen?.toString()??'');},[purchase?.updatedAt]);
  useEffect(()=>{if(!photo){setPhotoUrl('');return;}const url=URL.createObjectURL(photo);setPhotoUrl(url);return()=>URL.revokeObjectURL(url);},[photo]);
  async function selectPhoto(event:ChangeEvent<HTMLInputElement>) {
    const file=event.target.files?.[0];event.target.value='';if(!file)return;
    setBusy(true);setMessage('');setError('');
    try{setPhoto(await prepareProxyPhoto(file));setShowPhoto(false);}catch(reason){setError(reason instanceof Error?reason.message:'照片處理失敗，請重試。');}finally{setBusy(false);}
  }
  async function submit(event:FormEvent<HTMLFormElement>) {
    event.preventDefault();const value=amount.trim()===''?null:Number(amount);
    if(value!==null&&!validAmount(value)){setError('請輸入 0～1,000,000,000 的整數日圓總額。');return;}
    setBusy(true);setError('');setMessage('');
    try{await onSave({orderId:order.id,photo,amountYen:value,updatedAt:new Date().toISOString()});setMessage(photo&&value!==null?'已儲存，這項已購買。':'已儲存，待補齊照片或金額。');}
    catch{setError('未能儲存，照片與金額仍留在此頁。請勿關閉頁面，確認瀏覽器儲存空間後重試。');}finally{setBusy(false);}
  }
  async function clear() {
    if(!window.confirm('清除此項目的購買照片與金額？代購需求會保留。'))return;
    setBusy(true);setError('');setMessage('');
    try{await onRemove(order.id);setPhoto(null);setAmount('');setMessage('已清除購買結果。');}catch{setError('清除失敗，請重試。');}finally{setBusy(false);}
  }
  const locked=disabled||busy;
  const place=product.placeIds[0]?placesById.get(product.placeIds[0]):undefined;
  return <article className="card proxy-order overflow-hidden" aria-label={`${person.name}：${product.name}`}>
    <img className="product-image" src={`${import.meta.env.BASE_URL}${product.image}`} alt={`${product.name} 商品圖片`} loading="lazy" onError={event=>{event.currentTarget.onerror=null;event.currentTarget.src=`${import.meta.env.BASE_URL}items/placeholder.svg`;}}/>
    <div className="p-5 space-y-3">
      <div className="flex flex-wrap gap-2"><span className="tag">幫{person.name}買</span><span className={`tag ${purchaseStatus(purchase)==='已購買'?'proxy-done':''}`}>{purchaseStatus(purchase)}</span></div>
      <h3 className="text-xl font-semibold">{product.name}</h3><p>數量：{order.quantity} 件{product.size?` · ${product.size}`:''}</p>
      {order.notes&&<p className="proxy-request">需求：{order.notes}</p>}
      <PurchaseOptions options={product.purchaseOptions}/>{!product.purchaseOptions?.length&&place&&<PlaceInfo place={place}/>}
      <form className="proxy-form" onSubmit={submit} aria-label={`${person.name}的${product.name}購買結果`}>
        {photoUrl&&<><button className="button secondary" type="button" aria-expanded={showPhoto} onClick={()=>setShowPhoto(value=>!value)}>{showPhoto?'收起購買照片':'查看購買照片'}</button>{showPhoto&&<img className="proxy-photo" src={photoUrl} alt="購買照片"/>}</>}
        <input ref={camera} className="sr-only" tabIndex={-1} type="file" accept="image/*" capture="environment" aria-label="拍攝購買照片" disabled={locked} onChange={selectPhoto}/>
        <input ref={album} className="sr-only" tabIndex={-1} type="file" accept="image/*" aria-label="選擇購買照片" disabled={locked} onChange={selectPhoto}/>
        <div className="proxy-photo-actions"><button className="button secondary" type="button" disabled={locked} onClick={()=>camera.current?.click()}>拍照</button><button className="button secondary" type="button" disabled={locked} onClick={()=>album.current?.click()}>從相簿選取</button>{photo&&<button className="button secondary" type="button" disabled={locked} onClick={()=>{setPhoto(null);setMessage('');}}>移除照片</button>}</div>
        <label>實付總額（日圓，這 {order.quantity} 件合計）<input type="number" inputMode="numeric" min="0" max="1000000000" step="1" value={amount} disabled={locked} onChange={event=>{setAmount(event.target.value);setMessage('');}} placeholder="尚未填寫"/></label>
        <p className="muted text-sm">照片與金額按儲存後才會保留；只填一項也可先儲存。</p>
        {error&&<p role="alert">{error}</p>}{message&&<p role="status">{message}</p>}
        <button className="button" type="submit" disabled={locked}>{busy?'處理中…':'儲存購買結果'}</button>
        {purchase&&<button className="proxy-clear" type="button" disabled={locked} onClick={()=>{void clear();}}>清除已存紀錄</button>}
      </form>
    </div>
  </article>;
}
