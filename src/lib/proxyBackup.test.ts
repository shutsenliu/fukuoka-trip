// @vitest-environment jsdom
import { expect, test } from 'vitest';
import { decodeProxyBackup, encodeProxyBackup } from './proxyBackup';
import { blobToDataUrl } from './proxyPhotos';
import type { ProxyState } from './proxyOrders';
const state:ProxyState={catalog:{people:[{id:'a',name:'小美'}],products:[{id:'p',name:'測試商品',image:'items/placeholder.svg',notes:'',placeIds:[]}],orders:[{id:'o',personId:'a',itemId:'p',quantity:2,notes:''}]},purchases:[{orderId:'o',amountYen:null,photo:new Blob([new Uint8Array([255,216,255,224])],{type:'image/jpeg'}),updatedAt:'2026-12-12T00:00:00Z'}]};
test('backup round trip preserves photo, recipient, quantity and unknown amount',async()=>{
 const restored=decodeProxyBackup(await encodeProxyBackup(state));
 expect(restored.catalog).toEqual(state.catalog);
 expect(restored.purchases[0].amountYen).toBeNull();
 expect(await blobToDataUrl(restored.purchases[0].photo!)).toBe(await blobToDataUrl(state.purchases[0].photo!));
});
test('invalid or mismatched backup is rejected before import',async()=>{
 const encoded=await encodeProxyBackup(state);
 const backup=JSON.parse(encoded) as {records:{amountYen:number|null;photoDataUrl:string}[];catalog:{orders:{personId:string}[]}};
 backup.records[0].amountYen=-1;expect(()=>decodeProxyBackup(JSON.stringify(backup))).toThrow('整數日圓');
 backup.records[0].amountYen=null;backup.catalog.orders[0].personId='missing';expect(()=>decodeProxyBackup(JSON.stringify(backup))).toThrow('缺少對應');
 backup.catalog.orders[0].personId='a';backup.records[0].photoDataUrl='data:image/jpeg;base64,YmFk';expect(()=>decodeProxyBackup(JSON.stringify(backup))).toThrow('內容與格式不符');
 expect(()=>decodeProxyBackup('{}')).toThrow('不是支援');
});
