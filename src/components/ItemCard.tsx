import { Link } from 'react-router-dom';
import type { TripItem } from '../types';
import { itemLabels } from '../lib/itemLabels';
import { placesById } from '../lib/data';
import { useCompletedItems } from '../hooks/useCompletedItems';
export function ItemCard({ item }: { item: TripItem }) {
  const { isCompleted, toggleCompleted } = useCompletedItems();
  const labels = itemLabels[item.type];
  const purchased = isCompleted(item.id);
  return <article className={`card overflow-hidden ${purchased ? 'purchased' : ''}`}>
    <img className="product-image" src={`${import.meta.env.BASE_URL}${item.image.replace(/^\//, '')}`} alt={`${item.name} 圖片`} loading="lazy" onError={event => { event.currentTarget.onerror = null; event.currentTarget.src = `${import.meta.env.BASE_URL}items/placeholder.svg`; }}/>
    {item.imageCaption && <p className="muted px-5 pt-3 text-sm">{item.imageCaption}</p>}
    <div className="p-5 space-y-3"><div className="flex flex-wrap gap-2"><span className={`tag type-${item.type}`}>{labels.icon} {labels.name}</span><span className="tag">{item.category}</span><span className="tag priority">優先度 {item.priority} / 5</span></div>
      <h3 className="text-xl font-semibold">{item.name}</h3>
      {item.color && <p>🎨 {item.color}</p>}{item.size && <p>尺寸：{item.size}</p>}<p className="muted whitespace-pre-line">{item.notes}</p>
      <div className="space-y-2">{item.placeIds.map((id, index) => <Link className="store-link" key={id} to={`/places/${id}`}><span>{index === 0 ? '主要地點' : `備案 ${index}`} · {placesById.get(id)?.name ?? id}</span><span aria-hidden="true">↗</span></Link>)}</div>
      <label className={`purchase-button ${purchased ? 'checked' : ''}`}><input type="checkbox" checked={purchased} onChange={() => toggleCompleted(item.id)}/>{purchased ? labels.done : `標記為${labels.done}`}</label>
    </div>
  </article>;
}
