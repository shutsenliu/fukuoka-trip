import theme from '../data/theme.json';
import type { TripDay } from '../types';
const asset = (path: string) => `${import.meta.env.BASE_URL}${path}`;
export function TripHero() {
  return <section className="trip-hero" aria-label="福岡旅行手帳">
    <div className="hero-copy"><p className="eyebrow">FUKUOKA · A SLOW LITTLE TRIP</p><h1>{theme.title}</h1><p className="hero-subtitle">{theme.subtitle}</p><p className="trip-date"><span>2026</span> 12.12 — 12.17 <span>六日旅行手帳</span></p></div>
    <img className="hero-art" src={asset(theme.heroImage)} alt="蛋黃哥與明太子、博多拉麵，搭配福岡塔、博多站及運河城的手繪旅行插圖" fetchPriority="high" width="1536" height="1024"/>
    <span className="postcard-stamp" aria-hidden="true">福岡<br/>旅日和</span>
  </section>;
}
export function DayHeading({day}: {day: TripDay}) {
  const art = theme.days.find(entry => entry.day === day.day);
  return <section className="day-heading" aria-label={`Day ${day.day} 行程摘要`}>
    <div className="day-copy"><span className="day-label">DAY {String(day.day).padStart(2,'0')} <span>／ {day.date.slice(5).replace('-','.')}</span></span>{art && <p className="day-caption">{art.label}</p>}<h2>{day.title}</h2><p className="muted">{day.stops.length} 個停靠點 · 慢慢走，也別忘了看時間</p></div>
    {art && <img key={art.image} className="day-art" src={asset(art.image)} alt={art.alt} width="1024" height="1024"/>}
  </section>;
}
