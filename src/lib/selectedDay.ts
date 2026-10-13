import type { TripDay } from '../types';
export const SELECTED_DAY_KEY = 'fukuoka-trip-selected-day';
export function initialDay(days: TripDay[], now = new Date()): number {
  const japanDate = new Intl.DateTimeFormat('sv-SE', { timeZone: 'Asia/Tokyo' }).format(now);
  const today = days.find(day => day.date === japanDate);
  if (today) return today.day;
  try {
    const remembered = Number(localStorage.getItem(SELECTED_DAY_KEY));
    if (days.some(day => day.day === remembered)) return remembered;
  } catch { /* Storage may be disabled; the first day remains available. */ }
  return days[0].day;
}
export function rememberDay(day: number): void {
  try { localStorage.setItem(SELECTED_DAY_KEY, String(day)); }
  catch { /* The current selection still works for this session. */ }
}
