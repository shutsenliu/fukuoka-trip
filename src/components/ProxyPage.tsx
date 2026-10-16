import { useState } from 'react';
import { useProxyOrders } from '../hooks/useProxyOrders';
import { proxySummary } from '../lib/proxyOrders';
import { ProxyOrderCard } from './ProxyOrderCard';
import { ProxyBackup } from './ProxyBackup';
const yen=(amount:number)=>`¥${amount.toLocaleString('zh-TW')}`;
export function ProxyPage() {
  const {state,loading,error,refresh,save,remove,restore}=useProxyOrders();
  const [selected,setSelected]=useState('all');
  const {catalog,purchases}=state;
  const people=catalog.people.filter(person=>catalog.orders.some(order=>order.personId===person.id));
  const active=people.some(person=>person.id===selected)?selected:'all';
  const visibleOrders=catalog.orders.filter(order=>active==='all'||order.personId===active);
  const summary=proxySummary(visibleOrders,purchases);
  const products=new Map(catalog.products.map(product=>[product.id,product]));
  const records=new Map(purchases.map(purchase=>[purchase.orderId,purchase]));
  return <>
    <h1 className="sr-only">代購</h1>
    <section className="card proxy-summary" aria-label="代購摘要"><strong>已買 {summary.completed}／{summary.count} 項</strong><span>已記錄 {yen(summary.totalYen)}</span>{summary.incomplete>0&&<p className="muted">{summary.incomplete} 項待補照片或金額；未填金額不計入總額。</p>}</section>
    <div className="filter-row proxy-people" aria-label="代購對象"><button className={active==='all'?'selected':''} aria-pressed={active==='all'} onClick={()=>setSelected('all')}>全部</button>{people.map(person=><button key={person.id} className={active===person.id?'selected':''} aria-pressed={active===person.id} onClick={()=>setSelected(person.id)}>{person.name}</button>)}</div>
    {error&&<div role="alert" className="card p-4 mb-5"><p>{error}</p><button className="button secondary mt-3" onClick={()=>{void refresh();}}>重新讀取</button></div>}
    {loading?<p className="card p-5" role="status">讀取代購紀錄中…</p>:<>
      {!catalog.orders.length&&<p className="card p-5">尚未加入代購項目。把商品、代購對象與數量告訴我，就會列在這裡。</p>}
      {people.filter(person=>active==='all'||person.id===active).map(person=>{
        const orders=catalog.orders.filter(order=>order.personId===person.id),total=proxySummary(orders,purchases);
        return <section className="proxy-person" key={person.id} aria-label={`${person.name}的代購`}><div className="proxy-person-heading"><h2>{person.name}</h2><p className="muted">已買 {total.completed}／{orders.length} 項 · 已記錄 {yen(total.totalYen)}</p></div><div className="product-grid">{orders.map(order=>{
          const product=products.get(order.itemId);return product?<ProxyOrderCard key={order.id} order={order} person={person} product={product} purchase={records.get(order.id)} disabled={!!error} onSave={save} onRemove={remove}/>:<p role="alert" key={order.id}>此項目缺少商品資料，請更新清單。</p>;
        })}</div></section>;
      })}
    </>}
    <ProxyBackup state={state} disabled={loading||!!error} onImport={restore}/>
  </>;
}
