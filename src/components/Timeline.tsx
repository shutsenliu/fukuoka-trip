import { Link } from 'react-router-dom';
import type { TripDay, ItemType } from '../types';
import { itemLabels } from '../lib/itemLabels';
import { itemsForStop, placeIdsForStop, placesById } from '../lib/data';
import { useCompletedItems } from '../hooks/useCompletedItems';
import { stopDirectionsUrl } from '../lib/navigation';
export function Timeline({ day }: { day: TripDay }) {
  const { isCompleted } = useCompletedItems();
  return <div className="timeline">{day.stops.map(stop => {
    const items = itemsForStop(stop);
    const pending = items.filter(item => !isCompleted(item.id)).length;
    const goals = (Object.keys(itemLabels) as ItemType[]).map(type => ({ type, count: items.filter(item => item.type === type && !isCompleted(item.id)).length })).filter(group => group.count);
    const places = placeIdsForStop(stop).flatMap(id => { const place = placesById.get(id); return place ? [place] : []; });
    const navigation = stopDirectionsUrl(stop,places);
    return <article className="timeline-row" key={`${day.id}-${stop.id}`}>
      <div className="time"><strong>{stop.startTime}</strong><span>{stop.endTime}</span></div>
      <div className={`card p-4 flex-1 min-w-0 ${items.length ? 'shopping-stop' : ''}`}>
        <span className="eyebrow">{items.length ? '📍 這站有心願' : stop.type}</span>
        <h3 className="text-lg font-semibold mt-1">{stop.name}</h3>
        {stop.notes && <p className="muted mt-2 whitespace-pre-line">{stop.notes}</p>}
        {!!stop.details?.length && <details className="stop-places itinerary-details"><summary>詳細資訊</summary><div className="space-y-3 mt-3">{stop.details.map((detail,index) => <section key={`${detail.title}-${index}`}><h4 className="font-semibold">{detail.title}</h4><ul className="travel-steps">{detail.content.map((text,i) => <li key={i}>{text}</li>)}</ul></section>)}</div></details>}
        {!!items.length && <Link className="buy-link" to={`/items?${new URLSearchParams({day:day.id,stop:stop.id})}`}><span>{pending ? goals.map(group => `${itemLabels[group.type].icon} ${group.count} 項${itemLabels[group.type].goal}`).join(' · ') : '全部已完成'} · 查看清單</span><span aria-hidden="true">→</span></Link>}
        {navigation && <a className="button secondary mt-3" href={navigation} target="_blank" rel="noreferrer">Google Maps 導航 ↗</a>}

      </div>
    </article>;
  })}</div>;
}
