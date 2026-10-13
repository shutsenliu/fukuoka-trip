import { Link } from 'react-router-dom';
import type { TripDay } from '../types';
import { itemsForStop } from '../lib/data';
import { usePurchasedItems } from '../hooks/usePurchasedItems';
export function Timeline({ day }: { day: TripDay }) {
  const { isPurchased } = usePurchasedItems();
  return <div className="timeline">{day.stops.map(stop => {
    const items = itemsForStop(stop);
    const pending = items.filter(item => !isPurchased(item.id)).length;
    const content = <><span className="eyebrow">{items.length ? '🛍 購物停留點' : stop.type}</span><h3 className="text-lg font-semibold mt-1">{stop.name}</h3>{stop.notes && <p className="muted mt-2 whitespace-pre-line">{stop.notes}</p>}{!!items.length && <span className="buy-link"><span>{pending} 件待買 · 查看 {items.length} 件商品</span><span aria-hidden="true">→</span></span>}</>;
    return <article className="timeline-row" key={`${day.id}-${stop.id}`}>
      <div className="time"><strong>{stop.startTime}</strong><span>{stop.endTime}</span></div>
      {items.length ? <Link className="card shopping-stop p-4 flex-1 min-w-0 block" to={`/wishlist?${new URLSearchParams({day:day.id,stop:stop.id})}`}>{content}</Link> : <div className="card p-4 flex-1 min-w-0">{content}</div>}
    </article>;
  })}</div>;
}
