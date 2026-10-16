import type { ProxyOrder, ProxyProduct, ProxyPurchase } from '../lib/proxyOrders';
import { proxySummary } from '../lib/proxyOrders';
const yen=(value:number)=>`¥${value.toLocaleString('zh-TW')}`;
export function ProxySummaryTable({orders,products,purchases}:{orders:ProxyOrder[];products:ProxyProduct[];purchases:ProxyPurchase[]}) {
  const productById=new Map(products.map(product=>[product.id,product]));
  const purchaseById=new Map(purchases.map(purchase=>[purchase.orderId,purchase]));
  const summary=proxySummary(orders,purchases);
  return <div className="card proxy-table-wrap"><table className="proxy-table"><caption className="sr-only">代購彙總明細（日圓）</caption><thead><tr><th scope="col">品名</th><th scope="col">數量</th><th scope="col">金額</th></tr></thead><tbody>{orders.map(order=>{
    const product=productById.get(order.itemId),amount=purchaseById.get(order.id)?.amountYen;
    return <tr key={order.id}><th scope="row">{product?.name??'商品資料缺漏'}{product?.size&&<span className="muted">{product.size}</span>}</th><td>{order.quantity}</td><td>{amount===null||amount===undefined?'未填寫':yen(amount)}</td></tr>;
  })}</tbody><tfoot><tr><th scope="row" colSpan={2}>已記錄總金額</th><td>{yen(summary.totalYen)}</td></tr></tfoot></table><p className="muted">金額為該品項所有件數的實付總額（日圓）；未填寫的金額不計入總額。</p></div>;
}
