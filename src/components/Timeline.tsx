import { Link } from 'react-router-dom';
import type { TripDay } from '../types';
import { itemsForStore } from '../lib/data';
import { usePurchasedItems } from '../hooks/usePurchasedItems';
export function Timeline({ day }: { day: TripDay }) {
  const { isPurchased } = usePurchasedItems();
  return <div className="timeline">{day.stops.map(stop => <article className="timeline-row" key={stop.id}>
    <div className="time"><strong>{stop.startTime}</strong><span>{stop.endTime}</span></div>
    <div className="card p-4 flex-1 min-w-0"><span className="eyebrow">{stop.type}</span><h3 className="text-lg font-semibold mt-1">{stop.name}</h3>{stop.notes && <p className="muted mt-2 whitespace-pre-line">{stop.notes}</p>}
      {stop.storeId && <Link className="buy-link" to={`/stores/${stop.storeId}`}>{itemsForStore(stop.storeId).filter(item => !isPurchased(item.id)).length} 件待買 <span aria-hidden="true">→</span></Link>}
    </div>
  </article>)}</div>;
}
