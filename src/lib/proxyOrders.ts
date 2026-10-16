import raw from '../data/proxyOrders.json';
import { items } from './data';
import type { TripItem } from '../types';
export interface ProxyPerson { id: string; name: string }
export type ProxyProduct = Pick<TripItem, 'id' | 'name' | 'image' | 'imageCaption' | 'size' | 'notes' | 'purchaseOptions' | 'sourceUrls' | 'placeIds'>;
export interface ProxyOrder { id: string; personId: string; itemId: string; quantity: number; notes: string }
export interface ProxyCatalog { people: ProxyPerson[]; products: ProxyProduct[]; orders: ProxyOrder[] }
export interface ProxyPurchase { orderId: string; photo: Blob | null; amountYen: number | null; updatedAt: string }
export interface ProxyState { catalog: ProxyCatalog; purchases: ProxyPurchase[] }
export const emptyCatalog = (): ProxyCatalog => ({people:[],products:[],orders:[]});
export const proxyCatalog: ProxyCatalog = { ...raw, products: [...items, ...raw.products] };
export const validAmount = (value: unknown): value is number => typeof value === 'number' && Number.isSafeInteger(value) && value >= 0 && value <= 1_000_000_000;
export function mergeCatalog(base: ProxyCatalog, incoming: ProxyCatalog): ProxyCatalog {
  function merge<T extends {id: string}>(old: T[], next: T[]) { return [...new Map([...old,...next].map(entry => [entry.id,entry])).values()]; }
  return {people:merge(base.people,incoming.people),products:merge(base.products,incoming.products),orders:merge(base.orders,incoming.orders)};
}
export function purchaseStatus(purchase?: ProxyPurchase): string {
  if (!purchase || (!purchase.photo && purchase.amountYen === null)) return '未購買';
  if (!purchase.photo) return '待補照片';
  if (purchase.amountYen === null) return '待補金額';
  return '已購買';
}
export function proxySummary(orders: ProxyOrder[], purchases: ProxyPurchase[]) {
  const byId = new Map(purchases.map(purchase => [purchase.orderId,purchase]));
  let completed = 0, totalYen = 0, incomplete = 0;
  for (const order of orders) {
    const purchase = byId.get(order.id);
    if (purchaseStatus(purchase) === '已購買') completed++;
    if (purchase?.amountYen !== null && purchase?.amountYen !== undefined) totalYen += purchase.amountYen;
    if (purchase && purchaseStatus(purchase) !== '已購買' && purchaseStatus(purchase) !== '未購買') incomplete++;
  }
  return {completed,totalYen,incomplete,count:orders.length};
}
