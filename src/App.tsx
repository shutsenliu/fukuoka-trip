import { useLayoutEffect, useState } from 'react';
import { HashRouter, NavLink, Route, Routes, Link, useParams, Navigate, useLocation } from 'react-router-dom';
import { itinerary, places, items, itemsForPlace } from './lib/data';
import type { TripDay } from './types';
import { useCompletedItems } from './hooks/useCompletedItems';
import { ItemCard } from './components/ItemCard';
import { ProxyPage } from './components/ProxyPage';
import { ChecklistPage } from './components/ChecklistPage';
import { CouponsPage } from './components/CouponsPage';
import { initialDay, rememberDay } from './lib/selectedDay';
import { placeDirectionsUrl } from './lib/navigation';
import { ItineraryText } from './components/ItineraryText';
import { DoodleIcon, EggMark } from './components/DoodleIcon';
import { TripHero, DayHeading } from './components/TripArtwork';
import { Timeline } from './components/Timeline';
function DayTabs({ days, selected, onSelect }: { days: TripDay[]; selected: number; onSelect: (day: number) => void }) {
  return <div className="day-tabs" aria-label="選擇旅行日期">{days.map(day => <button key={day.id} aria-pressed={selected === day.day} className={selected === day.day ? 'selected' : ''} onClick={() => onSelect(day.day)}>Day {day.day}<span>{day.date.slice(5).replace('-', '/')}</span></button>)}</div>;
}
function PlacesPage() {
  const { isCompleted } = useCompletedItems();
  return <><p className="eyebrow">PLACES</p><h1>沿路的地點</h1><p className="muted mb-6">看看每一站想買與想吃的事。</p>{[...new Set(['博多','天神','大名','太宰府','由布院', ...places.map(store => store.area)])].map(area => <section key={area} className="mb-7"><h2 className="mb-3">{area}</h2><div className="store-grid">{places.filter(s => s.area === area).map(store => <Link className="card p-5 block" key={store.id} to={`/places/${store.id}`}><span className="tag">{store.area} · {store.type === 'shop' ? '店家' : store.type === 'restaurant' ? '餐廳' : store.type === 'hotel' ? '飯店' : '景點'}</span><h3 className="text-xl font-semibold mt-3">{store.name} ↗</h3><p className="text-accent font-semibold my-2">{itemsForPlace(store.id).filter(item => !isCompleted(item.id)).length} 項待完成</p><p>{itemsForPlace(store.id).map(item => item.name).join('、') || '目前沒有指定項目'}</p><p className="muted mt-2">{store.notes}</p></Link>)}</div>{!places.some(s => s.area === area) && <p className="muted">以散步與觀光為主，尚未加入指定地點。</p>}</section>)}</>;
}
function PlaceDetail() {
  const { id } = useParams(); const store = places.find(s => s.id === id);
  if (!store) return <><h1>找不到這個地點</h1><Link className="button" to="/places">返回地點</Link></>;
  return <><Link className="back-link" to="/places">← 所有地點</Link><span className="eyebrow block mt-5">{store.area}</span><h1>{store.name}</h1><p className="muted">{store.address}</p><p className="my-3">{store.notes}</p>{store.navigationDestination && <a className="button mb-6" href={placeDirectionsUrl(store)} target="_blank" rel="noreferrer">Google Maps 導航 ↗</a>}<div className="product-grid">{itemsForPlace(store.id).map(item => <ItemCard key={item.id} item={item}/>)}</div>{!itemsForPlace(store.id).length && <p className="card p-5">這站可以隨意走走，目前沒有指定項目。</p>}</>;
}
function AppContent() {
  const location = useLocation();
  useLayoutEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [location.pathname]);
  const days = itinerary;
  const [selected, setSelected] = useState(() => initialDay(days));
  function selectDay(day: number) { setSelected(day); rememberDay(day); }
  const { isCompleted, storageError } = useCompletedItems();
  const day = days.find(d => d.day === selected) ?? days[0];
  const dayPage = () => <><TripHero/><DayTabs days={days} selected={selected} onSelect={selectDay}/><DayHeading day={day}/>{day.remindersMarkdown && <details key={day.id} className="card p-4 mb-5 itinerary-details daily-reminder"><summary>當日提醒</summary><div className="mt-3"><ItineraryText>{day.remindersMarkdown}</ItineraryText></div></details>}<Timeline day={day}/></>;
  return <><header className="site-header"><Link to="/" className="brand"><EggMark/><span>Fukuoka<span className="brand-sub">TRIP COMPANION</span></span></Link><Link to="/items" className="header-count"><DoodleIcon name="checklist"/> {items.filter(item => !isCompleted(item.id)).length} 項待完成</Link></header>
    <main>{storageError && <p role="alert" className="card p-4 mb-4">瀏覽器無法儲存資料。目前的操作仍有效，但重新整理後可能遺失；請允許此網站使用本機儲存空間。</p>}<Routes><Route path="/" element={<Navigate to="/itinerary" replace/>}/><Route path="/itinerary" element={dayPage()}/><Route path="/wishlist" element={<Navigate to={{ pathname: '/items', search: location.search }} replace/>}/><Route path="/stores" element={<Navigate to="/places" replace/>}/><Route path="/stores/:id" element={<PlaceDetail/>}/><Route path="/items" element={<ChecklistPage days={days}/>}/><Route path="/proxy" element={<ProxyPage/>}/><Route path="/coupons" element={<CouponsPage/>}/><Route path="/places" element={<PlacesPage/>}/><Route path="/places/:id" element={<PlaceDetail/>}/><Route path="*" element={<><h1>找不到頁面</h1><Link to="/">回到行程</Link></>}/></Routes></main>
    <footer className="site-footer"><EggMark/><span>個人旅行手帳 · 自製 AI 主題插圖 · 非官方聯名</span></footer>
    <div className="bottom-nav-shell"><nav className="bottom-nav" aria-label="主要導覽"><NavLink to="/itinerary"><DoodleIcon name="itinerary"/><span>行程</span></NavLink><NavLink to="/items"><DoodleIcon name="checklist"/><span>清單</span></NavLink><NavLink to="/proxy"><DoodleIcon name="proxy"/><span>代購</span></NavLink><NavLink to="/coupons"><DoodleIcon name="coupon"/><span>優惠券</span></NavLink></nav></div></>;

}
export default function App() { return <HashRouter><AppContent/></HashRouter>; }
