import { Link } from 'react-router-dom';
import type { TripDay } from '../types';
import { itemsForStop, storeIdsForStop, storesById } from '../lib/data';
import { usePurchasedItems } from '../hooks/usePurchasedItems';
import { ProductCard } from './ProductCard';
export function Timeline({ day }: { day: TripDay }) {
  const { isPurchased } = usePurchasedItems();
  return <div className="timeline">{day.stops.map(stop => {
    const items = itemsForStop(stop);
    const pending = items.filter(item => !isPurchased(item.id)).length;
    const storeIds = storeIdsForStop(stop);
    return <article className="timeline-row" key={`${day.id}-${stop.id}`}>
      <div className="time"><strong>{stop.startTime}</strong><span>{stop.endTime}</span></div>
      <details className="card stop-card flex-1 min-w-0">
        <summary className="stop-summary p-4">
          <span className="eyebrow">{stop.type}</span>
          <h3 className="text-lg font-semibold mt-1">{stop.name}</h3>
          {stop.notes && <p className="muted mt-2 whitespace-pre-line">{stop.notes}</p>}
          <span className="buy-link"><span>{items.length ? `${pending} 件待買 · ${items.length} 件商品` : '查看這站購物清單'}</span><span className="expand-icon" aria-hidden="true">⌄</span></span>
        </summary>
        <div className="stop-products p-4 pt-0 space-y-4">
          <h4 className="font-semibold">在這站可以買什麼？</h4>
          {!!storeIds.length && <div className="flex flex-wrap gap-2">{storeIds.map(id => <Link key={id} className="tag p-3" to={`/stores/${id}`}>{storesById.get(id)?.name ?? id} ↗</Link>)}</div>}
          {items.length ? <div className="space-y-4">{items.map(item => <ProductCard key={item.id} item={item}/>)}</div> : <p className="muted">目前沒有為這個停留點加入商品。之後新增購物清單，就會顯示在這裡。</p>}
        </div>
      </details>
    </article>;
  })}</div>;
}
