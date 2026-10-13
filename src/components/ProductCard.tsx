import { Link } from 'react-router-dom';
import type { WishlistItem } from '../types';
import { storesById } from '../lib/data';
import { usePurchasedItems } from '../hooks/usePurchasedItems';
export function ProductCard({ item }: { item: WishlistItem }) {
  const { isPurchased, togglePurchased } = usePurchasedItems();
  const purchased = isPurchased(item.id);
  return <article className={`card overflow-hidden ${purchased ? 'purchased' : ''}`}>
    <img className="product-image" src={`${import.meta.env.BASE_URL}${item.image.replace(/^\//, '')}`} alt={`${item.name} 商品圖片`} loading="lazy" onError={event => { event.currentTarget.onerror = null; event.currentTarget.src = `${import.meta.env.BASE_URL}products/placeholder.svg`; }}/>
    <div className="p-5 space-y-3"><div className="flex flex-wrap gap-2"><span className="tag">{item.category}</span><span className="tag priority">優先度 {item.priority} / 5</span></div>
      <h3 className="text-xl font-semibold">{item.name}</h3>
      {item.color && <p>🎨 {item.color}</p>}{item.size && <p>尺寸：{item.size}</p>}<p className="muted whitespace-pre-line">{item.notes}</p>
      <div className="space-y-2">{item.storeIds.map((id, index) => <Link className="store-link" key={id} to={`/stores/${id}`}><span>{index === 0 ? '主要店家' : `備案 ${index}`} · {storesById.get(id)?.name ?? id}</span><span aria-hidden="true">↗</span></Link>)}</div>
      <label className={`purchase-button ${purchased ? 'checked' : ''}`}><input type="checkbox" checked={purchased} onChange={() => togglePurchased(item.id)}/>{purchased ? '已購買，收進行李！' : '標記為已購買'}</label>
    </div>
  </article>;
}
