import { DoodleIcon } from './DoodleIcon';
import { ProteinComparisonCard } from './ProteinComparisonCard';
import { PlaceInfo } from './PlaceInfo';
import type { TripItem } from '../types';
import { itemLabels } from '../lib/itemLabels';
import { placesById } from '../lib/data';
import { useCompletedItems } from '../hooks/useCompletedItems';
export function ItemCard({ item }: { item: TripItem }) {
  const { isCompleted, toggleCompleted } = useCompletedItems();
  const labels = itemLabels[item.type];
  const purchased = isCompleted(item.id);
  if (item.comparisonId) return <ProteinComparisonCard item={item}/>;
  return <article className={`card overflow-hidden ${purchased ? 'purchased' : ''}`}>
    <img className="product-image" src={`${import.meta.env.BASE_URL}${item.image.replace(/^\//, '')}`} alt={`${item.name} 圖片`} loading="lazy" onError={event => { event.currentTarget.onerror = null; event.currentTarget.src = `${import.meta.env.BASE_URL}items/placeholder.svg`; }}/>
    {item.imageCaption && <p className="muted px-5 pt-3 text-sm">{item.imageCaption}</p>}
    <div className="p-5 space-y-3"><div className="flex flex-wrap gap-2"><span className={`tag type-${item.type}`}><DoodleIcon name={item.type}/>{labels.name}</span><span className="tag">{item.category}</span><span className="tag priority">優先度 {item.priority} / 5</span></div>
      {item.convenienceStore && <p className="font-semibold">🏪 {item.convenienceStore} · 路過再買</p>}
      <h3 className="text-xl font-semibold">{item.name}</h3>
      {item.color && <p>🎨 {item.color}</p>}{item.size && <p>尺寸：{item.size}</p>}<p className="muted whitespace-pre-line">{item.notes}</p>
      {item.placeIds[0] && placesById.get(item.placeIds[0]) && <PlaceInfo place={placesById.get(item.placeIds[0])!}/>}
      {item.placeIds.length > 1 && <details className="backup-places"><summary>其他可買／吃到的地點（{item.placeIds.length - 1}）</summary><div className="space-y-3 mt-3">{item.placeIds.slice(1).map(id => { const place = placesById.get(id); return place ? <PlaceInfo key={id} place={place}/> : null; })}</div></details>}

      <label className={`purchase-button ${purchased ? 'checked' : ''}`}><input type="checkbox" checked={purchased} onChange={() => toggleCompleted(item.id)}/>{purchased ? labels.done : `標記為${labels.done}`}</label>
    </div>
  </article>;
}
