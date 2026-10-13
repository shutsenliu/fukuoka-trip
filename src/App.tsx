import { useState } from 'react';
import { HashRouter, NavLink, Route, Routes, Link, useParams } from 'react-router-dom';
import { itinerary, stores, wishlist, itemsForStore } from './lib/data';
import type { TripDay } from './types';
import { usePurchasedItems } from './hooks/usePurchasedItems';
import { ProductCard } from './components/ProductCard';
import { Timeline } from './components/Timeline';
import { ItineraryImport } from './components/ItineraryImport';
import { ITINERARY_KEY, loadDays } from './lib/itineraryStorage';
function DayTabs({ days, selected, onSelect }: { days: TripDay[]; selected: number; onSelect: (day: number) => void }) {
  return <div className="day-tabs" aria-label="選擇旅行日期">{days.map(day => <button key={day.id} aria-pressed={selected === day.day} className={selected === day.day ? 'selected' : ''} onClick={() => onSelect(day.day)}>Day {day.day}<span>{day.date.slice(5).replace('-', '/')}</span></button>)}</div>;
}
function WishlistPage() {
  const [status, setStatus] = useState('all'); const [category, setCategory] = useState('all');
  const { isPurchased, clearPurchased } = usePurchasedItems();
  const filtered = wishlist.filter(item => (category === 'all' || item.category === category) && (status === 'all' || (status === 'purchased' ? isPurchased(item.id) : !isPurchased(item.id))));
  return <><p className="eyebrow">SHOPPING LIST</p><h1>想帶回家的好物</h1><p className="muted mb-5">{wishlist.filter(item => isPurchased(item.id)).length} / {wishlist.length} 件已購買 · 主店與備案一起看</p>
    <div className="filter-row">{[['all','全部'],['pending','未購買'],['purchased','已購買']].map(([value,label]) => <button key={value} className={status === value ? 'selected' : ''} aria-pressed={status === value} onClick={() => setStatus(value)}>{label}</button>)}</div>
    <label className="block my-5">商品分類 <select className="ml-2" value={category} onChange={event => setCategory(event.target.value)}><option value="all">所有分類</option>{[...new Set(wishlist.map(item => item.category))].map(name => <option key={name}>{name}</option>)}</select></label>
    <div className="product-grid">{filtered.map(item => <ProductCard key={item.id} item={item}/>)}</div>{!filtered.length && <p className="card p-8">這個分類沒有商品，換個篩選看看。</p>}
    <p className="muted my-6">購買記錄只保存在此瀏覽器，不會同步到其他裝置。清除瀏覽器資料也會清除記錄。</p><button className="button secondary" onClick={() => { if (window.confirm('清除所有已購買標記？')) clearPurchased(); }}>清除已購買標記</button></>;
}
function StoresPage() {
  const { isPurchased } = usePurchasedItems();
  return <><p className="eyebrow">NEIGHBORHOODS</p><h1>沿路逛逛</h1><p className="muted mb-6">先看每站想買什麼，再決定要不要繞過去。</p>{[...new Set(['博多','天神','大名','太宰府','由布院', ...stores.map(store => store.area)])].map(area => <section key={area} className="mb-7"><h2 className="mb-3">{area}</h2><div className="store-grid">{stores.filter(s => s.area === area).map(store => <Link className="card p-5 block" key={store.id} to={`/stores/${store.id}`}><span className="tag">{store.area}</span><h3 className="text-xl font-semibold mt-3">{store.name} ↗</h3><p className="text-accent font-semibold my-2">{itemsForStore(store.id).filter(item => !isPurchased(item.id)).length} 件待買</p><p>{itemsForStore(store.id).map(item => item.name).join('、') || '目前沒有指定商品'}</p><p className="muted mt-2">{store.notes}</p></Link>)}</div>{!stores.some(s => s.area === area) && <p className="muted">以散步與觀光為主，尚未加入指定購物店家。</p>}</section>)}</>;
}
function StoreDetail() {
  const { id } = useParams(); const store = stores.find(s => s.id === id);
  if (!store) return <><h1>找不到這間店</h1><Link className="button" to="/stores">返回店家</Link></>;
  return <><Link className="back-link" to="/stores">← 所有店家</Link><span className="eyebrow block mt-5">{store.area}</span><h1>{store.name}</h1><p className="muted">{store.address}</p><p className="my-3">{store.notes}</p>{store.mapUrl && <a className="button mb-6" href={store.mapUrl} target="_blank" rel="noreferrer">在地圖搜尋 ↗</a>}<div className="product-grid">{itemsForStore(store.id).map(item => <ProductCard key={item.id} item={item}/>)}</div>{!itemsForStore(store.id).length && <p className="card p-5">這站可以隨意逛逛，目前沒有指定商品。</p>}</>;
}
function AppContent() {
  const [days, setDays] = useState(loadDays);
  const japanDate = new Intl.DateTimeFormat('sv-SE', { timeZone: 'Asia/Tokyo' }).format(new Date());
  const [selected, setSelected] = useState(() => days.find(day => day.date === japanDate)?.day ?? 5);
  const [saveError, setSaveError] = useState(false);
  const { isPurchased, storageError } = usePurchasedItems();
  const day = days.find(d => d.day === selected) ?? days[0];
  function save(next: TripDay[]) { setDays(next); try { localStorage.setItem(ITINERARY_KEY, JSON.stringify(next)); setSaveError(false); } catch { setSaveError(true); } }
  const dayPage = (full: boolean) => <><p className="eyebrow">{full ? 'SIX DAYS IN FUKUOKA' : 'YOUR DAILY COMPANION'}</p><h1>{full ? '六天，一路慢慢玩' : '今天，去哪裡？'}</h1><p className="muted mb-5">{full ? '12/12 — 12/17 · 博多出發的六日旅程' : '旅程外預設顯示 Day 5，也可以自由切換日期。'}</p><DayTabs days={days} selected={selected} onSelect={setSelected}/><div className="day-heading"><span className="eyebrow">{day.date} · DAY {day.day}</span><h2>{day.title}</h2><p className="muted">{day.stops.length} 個停靠點 · 時間與營業資訊請出發前確認</p></div><Timeline day={day}/>{full && <ItineraryImport overridden={JSON.stringify(days) !== JSON.stringify(itinerary)} onApply={updates => save(days.map(original => updates.find(update => update.id === original.id) ?? original))} onReset={() => { setDays(itinerary); try { localStorage.removeItem(ITINERARY_KEY); setSaveError(false); } catch { setSaveError(true); } }}/>}</>;
  return <><header className="site-header"><Link to="/" className="brand"><span className="brand-icon">福</span><span>Fukuoka<span className="brand-sub">TRIP COMPANION</span></span></Link><Link to="/wishlist" className="header-count">🛍 {wishlist.filter(item => !isPurchased(item.id)).length} 件待買</Link></header>
    <main>{(storageError || saveError) && <p role="alert" className="card p-4 mb-4">瀏覽器無法儲存資料。目前的操作仍有效，但重新整理後可能遺失；請允許此網站使用本機儲存空間。</p>}<Routes><Route path="/" element={dayPage(false)}/><Route path="/itinerary" element={dayPage(true)}/><Route path="/wishlist" element={<WishlistPage/>}/><Route path="/stores" element={<StoresPage/>}/><Route path="/stores/:id" element={<StoreDetail/>}/><Route path="*" element={<><h1>找不到頁面</h1><Link to="/">回到今天</Link></>}/></Routes></main>
    <nav className="bottom-nav" aria-label="主要導覽">{[['/','☀','今天'],['/itinerary','▤','行程'],['/wishlist','♡','購物'],['/stores','⌂','店家']].map(([path,icon,label]) => <NavLink end={path === '/'} to={path} key={path}><span aria-hidden="true">{icon}</span>{label}</NavLink>)}</nav></>;
}
export default function App() { return <HashRouter><AppContent/></HashRouter>; }
