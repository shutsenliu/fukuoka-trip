import { Link, useSearchParams } from 'react-router-dom';
import type { TripDay } from '../types';
import { itemsForStop, wishlist } from '../lib/data';
import { usePurchasedItems } from '../hooks/usePurchasedItems';
import { ProductCard } from './ProductCard';
export function WishlistPage({ days }: { days: TripDay[] }) {
  const [params, setParams] = useSearchParams();
  const { isPurchased, clearPurchased } = usePurchasedItems();
  const dayId = params.get('day') ?? 'all';
  const stopId = params.get('stop') ?? 'all';
  const category = params.get('category') ?? 'all';
  const status = params.get('status') ?? 'all';
  const selectedDay = days.find(day => day.id === dayId);
  const shoppingStops = selectedDay?.stops.filter(stop => itemsForStop(stop).length) ?? [];
  const selectedStop = selectedDay?.stops.find(stop => stop.id === stopId);
  const scopedItems = selectedStop ? itemsForStop(selectedStop) : selectedDay ? wishlist.filter(item => selectedDay.stops.some(stop => itemsForStop(stop).some(product => product.id === item.id))) : wishlist;
  const invalidSelection = (dayId !== 'all' && !selectedDay) || (stopId !== 'all' && !selectedStop);
  const filtered = invalidSelection ? [] : scopedItems.filter(item => (category === 'all' || item.category === category) && (status === 'all' || (status === 'purchased' ? isPurchased(item.id) : !isPurchased(item.id))));
  function update(key: string, value: string) {
    const next = new URLSearchParams(params);
    if (value === 'all') next.delete(key); else next.set(key, value);
    if (key === 'day') next.delete('stop');
    if (key === 'day' || key === 'stop') { next.delete('category'); next.delete('status'); }
    setParams(next);
  }
  return <>
    <div className="shopping-heading"><h1>購物清單</h1><p className="muted">{invalidSelection ? '請重新選擇日期與站點' : `${scopedItems.filter(item => !isPurchased(item.id)).length} 件待買 · 共 ${scopedItems.length} 件`}</p></div>
    <section className="card shopping-filters" aria-label="購物篩選">
      <div className="shopping-selects">
        <label>日期<select value={dayId} onChange={event => update('day', event.target.value)}><option value="all">全部日期</option>{days.map(day => <option key={day.id} value={day.id}>Day {day.day} · {day.date.slice(5).replace('-', '/')}</option>)}</select></label>
        <label>站點<select value={stopId} disabled={!selectedDay} onChange={event => update('stop', event.target.value)}><option value="all">{selectedDay ? '當天所有站點' : '先選日期'}</option>{shoppingStops.map(stop => <option key={stop.id} value={stop.id}>{stop.startTime} · {stop.name}</option>)}</select></label>
        <label className="category-select">商品分類<select value={category} onChange={event => update('category', event.target.value)}><option value="all">所有分類</option>{[...new Set(wishlist.map(item => item.category))].map(name => <option key={name}>{name}</option>)}</select></label>
      </div>
      <div className="filter-row purchase-filters" aria-label="購買狀態">{[['all','全部'],['pending','未購買'],['purchased','已購買']].map(([value,label]) => <button key={value} className={status === value ? 'selected' : ''} aria-pressed={status === value} onClick={() => update('status',value)}>{label}</button>)}</div>
      {(params.size > 0) && <div className="filter-actions">{selectedDay && <Link to="/itinerary">← 返回行程</Link>}<button onClick={() => setParams({})}>重設篩選</button></div>}
    </section>
    {selectedStop && <p className="shopping-context">Day {selectedDay?.day} · {selectedStop.startTime} · {selectedStop.name}</p>}
    <div className="product-grid">{filtered.map(item => <ProductCard key={item.id} item={item}/>)}</div>
    {!filtered.length && <p className="card p-8">{selectedDay && !scopedItems.length ? '這一天尚未安排購物商品。' : '目前沒有符合條件的商品，換個日期、站點或篩選看看。'}</p>}
    <p className="muted my-6">購買記錄只保存在此瀏覽器，不會同步到其他裝置。清除瀏覽器資料也會清除記錄。</p><button className="button secondary" onClick={() => { if (window.confirm('清除所有已購買標記？')) clearPurchased(); }}>清除已購買標記</button>
  </>;
}
