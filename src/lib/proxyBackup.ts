import type { ProxyCatalog, ProxyOrder, ProxyPerson, ProxyProduct, ProxyState } from './proxyOrders';
import { validAmount } from './proxyOrders';
import { blobToDataUrl } from './proxyPhotos';
const FORMAT = 'fukuoka-trip-proxy-backup';
const object = (value: unknown): value is Record<string,unknown> => typeof value === 'object' && value !== null && !Array.isArray(value);
function text(value: unknown,max = 4000): string {
  if (typeof value !== 'string' || value.length > max) throw new Error('備份文字欄位格式不正確。');return value;
}
function id(value: unknown): string { const result = text(value,100);if (!result.trim()) throw new Error('備份缺少項目編號。');return result; }
function list(value: unknown): unknown[] {if (!Array.isArray(value)) throw new Error('備份清單格式不正確。');return value;}
function https(value: unknown): string {
  const result = text(value,2000);try { if (new URL(result).protocol === 'https:') return result; } catch { /* Invalid source metadata. */ }
  throw new Error('備份來源網址格式不正確。');
}
function unique<T extends {id:string}>(entries:T[]):T[] { if(new Set(entries.map(entry=>entry.id)).size!==entries.length)throw new Error('備份含有重複的編號。');return entries; }
function parseCatalog(value: unknown): ProxyCatalog {
  if (!object(value)) throw new Error('備份缺少商品與代購對象資料。');
  const people: ProxyPerson[] = unique(list(value.people).map(entry => {
    if (!object(entry)) throw new Error('代購對象格式不正確。');return {id:id(entry.id),name:id(entry.name)};
  }));
  const products: ProxyProduct[] = unique(list(value.products).map(entry => {
    if (!object(entry)) throw new Error('商品格式不正確。');
    const image = text(entry.image,500);
    if (!/^(?:items|products)\/[a-zA-Z0-9/_-]+\.(?:png|jpe?g|webp|svg)$/.test(image)) throw new Error('備份商品圖片路徑不正確。');
    return {id:id(entry.id),name:text(entry.name,300),image,notes:text(entry.notes),placeIds:list(entry.placeIds).map(value=>id(value)),size:entry.size===undefined?undefined:text(entry.size,100),imageCaption:entry.imageCaption===undefined?undefined:text(entry.imageCaption,500),sourceUrls:entry.sourceUrls===undefined?undefined:list(entry.sourceUrls).map(https),purchaseOptions:entry.purchaseOptions===undefined?undefined:list(entry.purchaseOptions).map(option=>{
      if(!object(option))throw new Error('購買通路格式不正確。');return {name:text(option.name,200),notes:text(option.notes),sourceUrl:https(option.sourceUrl)};
    })};
  }));
  const orders: ProxyOrder[] = unique(list(value.orders).map(entry => {
    if(!object(entry)||!Number.isSafeInteger(entry.quantity)||Number(entry.quantity)<1||Number(entry.quantity)>9999)throw new Error('代購數量格式不正確。');
    return {id:id(entry.id),personId:id(entry.personId),itemId:id(entry.itemId),quantity:Number(entry.quantity),notes:text(entry.notes)};
  }));
  for(const order of orders)if(!people.some(person=>person.id===order.personId)||!products.some(product=>product.id===order.itemId))throw new Error('備份項目缺少對應商品或代購對象。');
  return {people,products,orders};
}
export async function encodeProxyBackup(state: ProxyState): Promise<string> {
  const records = await Promise.all(state.purchases.map(async purchase => ({orderId:purchase.orderId,amountYen:purchase.amountYen,updatedAt:purchase.updatedAt,photoDataUrl:purchase.photo?await blobToDataUrl(purchase.photo):null})));
  return JSON.stringify({format:FORMAT,version:1,exportedAt:new Date().toISOString(),catalog:state.catalog,records});
}
export function decodeProxyBackup(source: string): ProxyState {
  let value: unknown;
  try { value = JSON.parse(source); } catch {throw new Error('檔案不是有效的 JSON 備份。');}
  if(!object(value)||value.format!==FORMAT||value.version!==1)throw new Error('這不是支援的代購備份檔。');
  const catalog = parseCatalog(value.catalog);
  const purchases = list(value.records).map(entry=>{
    if(!object(entry))throw new Error('購買紀錄格式不正確。');
    const orderId = id(entry.orderId);if(!catalog.orders.some(order=>order.id===orderId))throw new Error('購買紀錄沒有對應的代購項目。');
    const amountYen = entry.amountYen;if(amountYen!==null&&!validAmount(amountYen))throw new Error('備份金額必須為非負整數日圓。');
    const updatedAt = text(entry.updatedAt,100);if(!Number.isFinite(Date.parse(updatedAt)))throw new Error('備份日期格式不正確。');
    let photo: Blob|null = null;
    if(entry.photoDataUrl!==null){
      const data = text(entry.photoDataUrl,2_000_000);const match = /^data:(image\/(?:jpeg|png|webp));base64,([A-Za-z0-9+/]+={0,2})$/.exec(data);
      if(!match)throw new Error('備份照片格式不正確。');
      let binary:string;try{binary=atob(match[2]);}catch{throw new Error('備份照片編碼不正確。');}
      if(binary.length>1024*1024)throw new Error('備份單張照片超過 1MB。');
      const bytes = Uint8Array.from(binary,char=>char.charCodeAt(0));
      const valid = match[1]==='image/jpeg'?bytes[0]===255&&bytes[1]===216&&bytes[2]===255:match[1]==='image/png'?bytes[0]===137&&bytes[1]===80&&bytes[2]===78&&bytes[3]===71:binary.startsWith('RIFF')&&binary.slice(8,12)==='WEBP';
      if(!valid)throw new Error('備份照片內容與格式不符。');photo=new Blob([bytes],{type:match[1]});
    }
    return {orderId,amountYen,updatedAt,photo};
  });
  if(new Set(purchases.map(purchase=>purchase.orderId)).size!==purchases.length)throw new Error('備份有重複的購買紀錄。');
  return {catalog,purchases};
}
