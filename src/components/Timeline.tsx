import { Link } from 'react-router-dom';
import type { TripDay, ItemType } from '../types';
import { itemLabels } from '../lib/itemLabels';
import { itemsForStop, placeIdsForStop, placesById } from '../lib/data';
import { directionsUrl } from '../lib/navigation';
import { useCompletedItems } from '../hooks/useCompletedItems';
import { PlaceInfo } from './PlaceInfo';
export function Timeline({ day }: { day: TripDay }) {
  const { isCompleted } = useCompletedItems();
  return <div className="timeline">{day.stops.map(stop => {
    const items = itemsForStop(stop);
    const pending = items.filter(item => !isCompleted(item.id)).length;
    const goals = (Object.keys(itemLabels) as ItemType[]).map(type => ({ type, count: items.filter(item => item.type === type && !isCompleted(item.id)).length })).filter(group => group.count);
    const places = placeIdsForStop(stop).flatMap(id => { const place = placesById.get(id); return place ? [place] : []; });
    return <article className="timeline-row" key={`${day.id}-${stop.id}`}>
      <div className="time"><strong>{stop.startTime}</strong><span>{stop.endTime}</span></div>
      <div className={`card p-4 flex-1 min-w-0 ${items.length ? 'shopping-stop' : ''}`}>
        <span className="eyebrow">{items.length ? '📍 這站有心願' : stop.type}</span>
        <h3 className="text-lg font-semibold mt-1">{stop.name}</h3>
        {stop.notes && <p className="muted mt-2 whitespace-pre-line">{stop.notes}</p>}
        {!!items.length && <Link className="buy-link" to={`/items?${new URLSearchParams({day:day.id,stop:stop.id})}`}><span>{pending ? goals.map(group => `${itemLabels[group.type].icon} ${group.count} 項${itemLabels[group.type].goal}`).join(' · ') : '全部已完成'} · 查看清單</span><span aria-hidden="true">→</span></Link>}
        {places.length === 1 ? <div className="mt-3"><PlaceInfo place={places[0]}/></div> : places.length > 1 ? <details className="stop-places"><summary>店家與導航（{places.length} 個地點）</summary><div className="space-y-3 mt-3">{places.map(place => <PlaceInfo key={place.id} place={place}/>)}</div></details> : <a className="button secondary mt-3" href={directionsUrl(stop.name)} target="_blank" rel="noreferrer" aria-label={`在 Google Maps 查看 ${stop.name}`}>Google Maps 路線 ↗</a>}
      </div>
    </article>;
  })}</div>;
}
