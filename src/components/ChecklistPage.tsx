import { Link, useSearchParams } from 'react-router-dom';
import type { TripDay } from '../types';
import { itemLabels } from '../lib/itemLabels';
import type { ItemType } from '../types';
import { itemsForStop, items } from '../lib/data';
import { useCompletedItems } from '../hooks/useCompletedItems';
import { ItemCard } from './ItemCard';
export function ChecklistPage({ days }: { days: TripDay[] }) {
  const [params, setParams] = useSearchParams();
  const { isCompleted, clearCompleted } = useCompletedItems();
  const dayId = params.get('day') ?? 'all';
  const stopId = params.get('stop') ?? 'all';
  const type = params.get('type') ?? 'all';
  const category = params.get('category') ?? 'all';
  const status = (params.get('status') === 'purchased' ? 'completed' : params.get('status')) ?? 'all';
  const selectedDay = days.find(day => day.id === dayId);
  const goalStops = selectedDay?.stops.filter(stop => itemsForStop(stop).length) ?? [];
  const selectedStop = selectedDay?.stops.find(stop => stop.id === stopId);
  const scopedItems = selectedStop ? itemsForStop(selectedStop) : selectedDay ? items.filter(item => selectedDay.stops.some(stop => itemsForStop(stop).some(product => product.id === item.id))) : items;
  const invalidSelection = (dayId !== 'all' && !selectedDay) || (stopId !== 'all' && !selectedStop);
  const filtered = invalidSelection ? [] : scopedItems.filter(item => (type === 'all' || item.type === type) && (category === 'all' || item.category === category) && (status === 'all' || (status === 'completed' ? isCompleted(item.id) : !isCompleted(item.id))));
  function update(key: string, value: string) {
    const next = new URLSearchParams(params);
    if (value === 'all') next.delete(key); else next.set(key, value);
    if (key === 'day') next.delete('stop');
    if (key === 'day' || key === 'stop') { next.delete('category'); next.delete('status'); }
    setParams(next);
  }
  return <>
    <div className="shopping-heading"><h1>旅途心願清單</h1><p className="muted">{invalidSelection ? '請重新選擇日期與站點' : `${scopedItems.filter(item => !isCompleted(item.id)).length} 項未完成 · 共 ${scopedItems.length} 項`}</p></div>
    <section className="card shopping-filters" aria-label="清單篩選">
      <div className="shopping-selects">
        <label>日期<select value={dayId} onChange={event => update('day', event.target.value)}><option value="all">全部日期</option>{days.map(day => <option key={day.id} value={day.id}>Day {day.day} · {day.date.slice(5).replace('-', '/')}</option>)}</select></label>
        <label>站點<select value={stopId} disabled={!selectedDay} onChange={event => update('stop', event.target.value)}><option value="all">{selectedDay ? '當天所有站點' : '先選日期'}</option>{goalStops.map(stop => <option key={stop.id} value={stop.id}>{stop.startTime} · {stop.name}</option>)}</select></label>
        <label className="category-select">細分類<select value={category} onChange={event => update('category', event.target.value)}><option value="all">所有分類</option>{[...new Set(items.filter(item => type === 'all' || item.type === type).map(item => item.category))].map(name => <option key={name}>{name}</option>)}</select></label>
      </div>
      <div className="filter-row type-filters" aria-label="項目類型"><button aria-pressed={type === 'all'} className={type === 'all' ? 'selected' : ''} onClick={() => update('type','all')}>全部</button>{(Object.keys(itemLabels) as ItemType[]).map(value => <button key={value} className={type === value ? 'selected' : ''} aria-pressed={type === value} onClick={() => { const next = new URLSearchParams(params); next.set('type',value); next.delete('category'); setParams(next); }}>{itemLabels[value].icon} {itemLabels[value].name}</button>)}</div>
      <div className="filter-row purchase-filters" aria-label="完成狀態">{[['all','全部'],['pending','未完成'],['completed','已完成']].map(([value,label]) => <button key={value} className={status === value ? 'selected' : ''} aria-pressed={status === value} onClick={() => update('status',value)}>{label}</button>)}</div>
      {(params.size > 0) && <div className="filter-actions">{selectedDay && <Link to="/itinerary">← 返回行程</Link>}<button onClick={() => setParams({})}>重設篩選</button></div>}
    </section>
    {selectedStop && <p className="shopping-context">Day {selectedDay?.day} · {selectedStop.startTime} · {selectedStop.name}</p>}
    <div className="product-grid">{filtered.map(item => <ItemCard key={item.id} item={item}/>)}</div>
    {!filtered.length && <p className="card p-8">{!items.length ? '清單還是空白，提供圖片或指定想買、想吃、想體驗的內容後，就會加入這裡。' : selectedDay && !scopedItems.length ? '這一天尚未加入想買、想吃或想體驗的項目。' : '目前沒有符合條件的項目，換個日期、站點或篩選看看。'}</p>}

    <p className="muted my-6">完成記錄只保存在此瀏覽器，不會同步到其他裝置。清除瀏覽器資料也會清除記錄。</p><button className="button secondary" onClick={() => { if (window.confirm('清除所有完成標記？')) clearCompleted(); }}>清除完成標記</button>
  </>;
}
