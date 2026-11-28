import { EggMark } from './DoodleIcon';
import { ItineraryText } from './ItineraryText';
import { Link } from 'react-router-dom';
import type { TripDay, ItemType, ItineraryStop } from '../types';
import { itemLabels } from '../lib/itemLabels';
import { itemsForStop, placeIdsForStop, placesById } from '../lib/data';
import { useCompletedItems } from '../hooks/useCompletedItems';
import { stopDirectionsUrl } from '../lib/navigation';
export function Timeline({ day }: { day: TripDay }) {
  const { isCompleted } = useCompletedItems();
  const renderStop = (stop: ItineraryStop) => {
    const items = itemsForStop(stop);
    const pending = items.filter(item => !isCompleted(item.id)).length;
    const goals = (Object.keys(itemLabels) as ItemType[]).map(type => ({ type, count: items.filter(item => item.type === type && !isCompleted(item.id)).length })).filter(group => group.count);
    const places = placeIdsForStop(stop).flatMap(id => { const place = placesById.get(id); return place ? [place] : []; });
    const navigation = stopDirectionsUrl(stop,places);
    return <article className="timeline-row" key={`${day.id}-${stop.id}`}>
      <div className="time">{stop.optional ? <strong>路過</strong> : <><strong>{stop.startTime}</strong><span>{stop.endTime}</span></>}</div>
      <div className={`card p-4 flex-1 min-w-0 ${items.length ? 'shopping-stop' : ''}`}>
        {!!items.length && <span className="eyebrow goal-eyebrow"><EggMark/>這站有心願</span>}
        <h3 className="text-lg font-semibold mt-1">{stop.name}</h3>
        {stop.optional && <p className="muted text-sm mt-2">{stop.notes}</p>}
        {(stop.detailMarkdown || stop.details?.length || stop.notes) && <details className="stop-places itinerary-details"><summary>詳細資訊</summary><div className="mt-3">
          {stop.detailMarkdown ? <><p className="muted text-sm mb-4">{stop.optional ? '路過有空再選，不限定日期與時段；依當日營業、庫存及食量決定。' : '依原行程與後續確認內容整理；時間以卡片為準，班次、營業與訂位規則仍需向官方確認。'}</p><ItineraryText>{stop.detailMarkdown}</ItineraryText></> : <div className="space-y-3">{stop.notes && <p className="whitespace-pre-line">{stop.notes}</p>}{stop.details?.map((detail,index) => <section key={`${detail.title}-${index}`}><h4 className="font-semibold">{detail.title}</h4><ul className="travel-steps">{detail.content.map((text,i) => <li key={i}>{text}</li>)}</ul></section>)}</div>}
        </div></details>}
        {!!items.length && <Link className="buy-link" to={`/items?${new URLSearchParams({day:day.id,stop:stop.id})}`}><span>{pending ? goals.map(group => `${itemLabels[group.type].icon} ${group.count} 項${itemLabels[group.type].goal}`).join(' · ') : '全部已完成'} · 查看清單</span><span aria-hidden="true">→</span></Link>}
        {navigation && <a className="button secondary mt-3" href={navigation} target="_blank" rel="noreferrer">Google Maps 導航 ↗</a>}

      </div>
    </article>;
  };
  const optional = day.stops.filter(stop => stop.optional);
  return <><div className="timeline">{day.stops.filter(stop => !stop.optional).map(renderStop)}</div>
    {!!optional.length && <details key={day.id} className="card p-4 mt-5 hakata-options"><summary>博多站路過選項 · 有空再逛／吃</summary><p className="muted text-sm mt-3 mb-4">多天都會經過，不必一次完成。先看當天營業、排隊與體力；交通、訂位與取貨優先。</p><div className="timeline">{optional.map(renderStop)}</div></details>}
  </>;
}
