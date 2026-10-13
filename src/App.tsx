import { useState } from 'react';
import { HashRouter, NavLink, Route, Routes, Link, useParams, Navigate, useLocation } from 'react-router-dom';
import { itinerary, places, items, itemsForPlace } from './lib/data';
import type { TripDay } from './types';
import { useCompletedItems } from './hooks/useCompletedItems';
import { ItemCard } from './components/ItemCard';
import { ChecklistPage } from './components/ChecklistPage';
import { initialDay, rememberDay } from './lib/selectedDay';
import { Timeline } from './components/Timeline';
function DayTabs({ days, selected, onSelect }: { days: TripDay[]; selected: number; onSelect: (day: number) => void }) {
  return <div className="day-tabs" aria-label="選擇旅行日期">{days.map(day => <button key={day.id} aria-pressed={selected === day.day} className={selected === day.day ? 'selected' : ''} onClick={() => onSelect(day.day)}>Day {day.day}<span>{day.date.slice(5).replace('-', '/')}</span></button>)}</div>;
}
function PlacesPage() {
  const { isCompleted } = useCompletedItems();
  return <><p className="eyebrow">PLACES</p><h1>沿路的地點</h1><p className="muted mb-6">看看每一站想買、想吃與想體驗的事。</p>{[...new Set(['博多','天神','大名','太宰府','由布院', ...places.map(store => store.area)])].map(area => <section key={area} className="mb-7"><h2 className="mb-3">{area}</h2><div className="store-grid">{places.filter(s => s.area === area).map(store => <Link className="card p-5 block" key={store.id} to={`/places/${store.id}`}><span className="tag">{store.area} · {store.type === 'shop' ? '店家' : store.type === 'restaurant' ? '餐廳' : '景點'}</span><h3 className="text-xl font-semibold mt-3">{store.name} ↗</h3><p className="text-accent font-semibold my-2">{itemsForPlace(store.id).filter(item => !isCompleted(item.id)).length} 項待完成</p><p>{itemsForPlace(store.id).map(item => item.name).join('、') || '目前沒有指定項目'}</p><p className="muted mt-2">{store.notes}</p></Link>)}</div>{!places.some(s => s.area === area) && <p className="muted">以散步與觀光為主，尚未加入指定地點。</p>}</section>)}</>;
}
function PlaceDetail() {
  const { id } = useParams(); const store = places.find(s => s.id === id);
  if (!store) return <><h1>找不到這個地點</h1><Link className="button" to="/places">返回地點</Link></>;
  return <><Link className="back-link" to="/places">← 所有地點</Link><span className="eyebrow block mt-5">{store.area}</span><h1>{store.name}</h1><p className="muted">{store.address}</p><p className="my-3">{store.notes}</p>{store.mapUrl && <a className="button mb-6" href={store.mapUrl} target="_blank" rel="noreferrer">在地圖搜尋 ↗</a>}<div className="product-grid">{itemsForPlace(store.id).map(item => <ItemCard key={item.id} item={item}/>)}</div>{!itemsForPlace(store.id).length && <p className="card p-5">這站可以隨意走走，目前沒有指定項目。</p>}</>;
}
function AppContent() {
  const location = useLocation();
  const days = itinerary;
  const [selected, setSelected] = useState(() => initialDay(days));
  function selectDay(day: number) { setSelected(day); rememberDay(day); }
  const { isCompleted, storageError } = useCompletedItems();
  const day = days.find(d => d.day === selected) ?? days[0];
  const dayPage = () => <><p className="eyebrow">SIX DAYS IN FUKUOKA</p><h1>六天，一路慢慢玩</h1><p className="muted mb-5">12/12 — 12/17 · 博多出發的六日旅程</p><DayTabs days={days} selected={selected} onSelect={selectDay}/><div className="day-heading"><span className="eyebrow">{day.date} · DAY {day.day}</span><h2>{day.title}</h2><p className="muted">{day.stops.length} 個停靠點 · 時間與營業資訊請出發前確認</p></div><Timeline day={day}/></>;
  return <><header className="site-header"><Link to="/" className="brand"><span className="brand-icon">福</span><span>Fukuoka<span className="brand-sub">TRIP COMPANION</span></span></Link><Link to="/items" className="header-count">✓ {items.filter(item => !isCompleted(item.id)).length} 項待完成</Link></header>
    <main>{storageError && <p role="alert" className="card p-4 mb-4">瀏覽器無法儲存資料。目前的操作仍有效，但重新整理後可能遺失；請允許此網站使用本機儲存空間。</p>}<Routes><Route path="/" element={<Navigate to="/itinerary" replace/>}/><Route path="/itinerary" element={dayPage()}/><Route path="/wishlist" element={<Navigate to={{ pathname: '/items', search: location.search }} replace/>}/><Route path="/stores" element={<Navigate to="/places" replace/>}/><Route path="/stores/:id" element={<PlaceDetail/>}/><Route path="/items" element={<ChecklistPage days={days}/>}/><Route path="/places" element={<PlacesPage/>}/><Route path="/places/:id" element={<PlaceDetail/>}/><Route path="*" element={<><h1>找不到頁面</h1><Link to="/">回到行程</Link></>}/></Routes></main>
    <nav className="bottom-nav" aria-label="主要導覽">{[['/itinerary','▤','行程'],['/items','♡','清單'],['/places','⌂','地點']].map(([path,icon,label]) => <NavLink end={path === '/'} to={path} key={path}><span aria-hidden="true">{icon}</span>{label}</NavLink>)}</nav></>;
}
export default function App() { return <HashRouter><AppContent/></HashRouter>; }
