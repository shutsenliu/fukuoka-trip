import 'fake-indexeddb/auto';
import { afterEach, expect, test } from 'vitest';
import { deleteProxyPurchase, importProxyPurchases, readProxyState, saveProxyPurchase } from './proxyStorage';
import { proxySummary, purchaseStatus } from './proxyOrders';
import type { ProxyCatalog, ProxyPurchase } from './proxyOrders';
const catalog: ProxyCatalog = {
  people:[{id:'a',name:'小美'},{id:'b',name:'阿明'}],
  products:[{id:'test',name:'測試商品',image:'items/placeholder.svg',notes:'',placeIds:[]}],
  orders:[{id:'a-test',personId:'a',itemId:'test',quantity:2,notes:''},{id:'b-test',personId:'b',itemId:'test',quantity:1,notes:''}],
};
const record = (orderId:string,amountYen:number|null):ProxyPurchase=>({orderId,amountYen,photo:new Blob(['photo'],{type:'image/jpeg'}),updatedAt:'2026-12-12T12:00:00Z'});
afterEach(()=>new Promise<void>((resolve,reject)=>{const request=indexedDB.deleteDatabase('fukuoka-trip-proxy');request.onsuccess=()=>resolve();request.onerror=()=>reject(request.error);}));
test('saved photo and amount survive database close/reopen and separate recipients',async()=>{
  await saveProxyPurchase(record('a-test',1200),catalog);
  await saveProxyPurchase(record('b-test',null),catalog);
  const reopened=await readProxyState();
  expect(reopened.catalog).toEqual(catalog);
  expect(await reopened.purchases[0].photo?.text()).toBe('photo');
  expect(proxySummary(catalog.orders,reopened.purchases)).toEqual({completed:1,totalYen:1200,incomplete:1,count:2});
  expect(proxySummary([catalog.orders[1]],reopened.purchases).totalYen).toBe(0);
  expect(purchaseStatus(reopened.purchases[1])).toBe('待補金額');
});
test('import replaces matching results while keeping other people and clear keeps demands',async()=>{
  await saveProxyPurchase(record('a-test',1200),catalog);
  await saveProxyPurchase(record('b-test',800),catalog);
  await importProxyPurchases({catalog,purchases:[record('a-test',1500)]});
  expect(proxySummary(catalog.orders,(await readProxyState()).purchases).totalYen).toBe(2300);
  await deleteProxyPurchase('a-test');
  const cleared=await readProxyState();
  expect(cleared.purchases.map(p=>p.orderId)).toEqual(['b-test']);
  expect(cleared.catalog.orders).toHaveLength(2);
});
test('zero yen is valid and missing money or photo stays incomplete',()=>{
  expect(purchaseStatus(record('a-test',0))).toBe('已購買');
  expect(purchaseStatus({...record('a-test',100),photo:null})).toBe('待補照片');
  expect(purchaseStatus()).toBe('未購買');
});
