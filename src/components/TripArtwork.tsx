import theme from '../data/theme.json';
import type { TripDay } from '../types';
const asset = (path: string) => `${import.meta.env.BASE_URL}${path}`;
export function TripHero() {
  return <section className="trip-hero" aria-label="福岡行程">
    <h1 className="sr-only">行程</h1>
    <img className="hero-art" src={asset(theme.heroImage)} alt="蛋黃哥與明太子、博多拉麵，搭配福岡塔、博多站及運河城的手繪旅行插圖" fetchPriority="high" width="1536" height="1024"/>
    <p className="trip-date">2026.12.12 — 12.17</p>
  </section>;

}
export function DayHeading({day}: {day: TripDay}) {
  const art = theme.days.find(entry => entry.day === day.day);
  return <section className="day-heading" aria-label={`Day ${day.day} 行程摘要`}>
    <div className="day-copy"><span className="day-label">DAY {String(day.day).padStart(2,'0')} <span>／ {day.date.slice(5).replace('-','.')}</span></span><h2>{day.title}</h2><p className="muted">{day.stops.length} 個停靠點</p></div>
    {art && <img key={art.image} className="day-art" src={asset(art.image)} alt={art.alt} width="1024" height="1024"/>}
  </section>;
}
