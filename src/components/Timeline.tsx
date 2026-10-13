import { Link } from 'react-router-dom';
import type { TripDay } from '../types';
import { itemLabels } from '../lib/itemLabels';
import type { ItemType } from '../types';
import { itemsForStop } from '../lib/data';
import { useCompletedItems } from '../hooks/useCompletedItems';
export function Timeline({ day }: { day: TripDay }) {
  const { isCompleted } = useCompletedItems();
  return <div className="timeline">{day.stops.map(stop => {
    const items = itemsForStop(stop);
    const pending = items.filter(item => !isCompleted(item.id)).length;
    const goals = (Object.keys(itemLabels) as ItemType[]).map(type => ({ type, count: items.filter(item => item.type === type && !isCompleted(item.id)).length })).filter(group => group.count);
    const content = <><span className="eyebrow">{items.length ? '📍 這站有心願' : stop.type}</span><h3 className="text-lg font-semibold mt-1">{stop.name}</h3>{stop.notes && <p className="muted mt-2 whitespace-pre-line">{stop.notes}</p>}{!!items.length && <span className="buy-link"><span>{pending ? goals.map(group => `${itemLabels[group.type].icon} ${group.count} 項${itemLabels[group.type].goal}`).join(' · ') : '全部已完成'} · 查看 {items.length} 項</span><span aria-hidden="true">→</span></span>}</>;
    return <article className="timeline-row" key={`${day.id}-${stop.id}`}>
      <div className="time"><strong>{stop.startTime}</strong><span>{stop.endTime}</span></div>
      {items.length ? <Link className="card shopping-stop p-4 flex-1 min-w-0 block" to={`/items?${new URLSearchParams({day:day.id,stop:stop.id})}`}>{content}</Link> : <div className="card p-4 flex-1 min-w-0">{content}</div>}
    </article>;
  })}</div>;
}
