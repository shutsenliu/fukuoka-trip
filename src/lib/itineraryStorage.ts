import type { TripDay, ItineraryStop } from '../types';
import { itinerary } from './data';
export const ITINERARY_KEY = 'fukuoka-trip-itinerary';
function isRecord(value: unknown): value is Record<string, unknown> { return typeof value === 'object' && value !== null; }
function isStop(value: unknown): value is ItineraryStop {
  return isRecord(value) && ['id','startTime','endTime','name','type','notes'].every(key => typeof value[key] === 'string') && (value.storeId === undefined || typeof value.storeId === 'string');
}
function isDay(value: unknown): value is TripDay {
  return isRecord(value) && typeof value.id === 'string' && typeof value.day === 'number' && typeof value.date === 'string' && typeof value.title === 'string' && Array.isArray(value.stops) && (value.stops as unknown[]).every(isStop);
}
export function loadDays(): TripDay[] {
  try {
    const stored: unknown = JSON.parse(localStorage.getItem(ITINERARY_KEY) ?? 'null');
    if (Array.isArray(stored)) {
      const entries: unknown[] = stored;
      if (entries.length === 6 && entries.every(isDay) && itinerary.every(original => entries.some(day => day.day === original.day && day.id === original.id && day.date === original.date))) return entries.sort((a,b) => a.day - b.day);
    }
  } catch { /* Unavailable or malformed browser storage falls back to bundled data. */ }
  return itinerary;
}
