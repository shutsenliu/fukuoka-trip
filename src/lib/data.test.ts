import { describe, expect, it } from 'vitest';
import type { TripItem } from '../types';
import { itemsForStop, itinerary, items, placesById } from './data';
describe('bundled relationships', () => {
  it('uses unique IDs and valid store references', () => {
    expect(new Set(items.map(item => item.id)).size).toBe(items.length);
    expect(itinerary).toHaveLength(6);
    for (const item of items) for (const id of item.placeIds) expect(placesById.has(id)).toBe(true);
    for (const day of itinerary) for (const stop of day.stops) if (stop.placeId) expect(placesById.has(stop.placeId)).toBe(true);
    expect(itinerary[4].stops).toHaveLength(16);
  });
});

describe('user-provided goals', () => {
  it('links the approved Yufuin food goals only to the assigned Day 3 stop', () => {
    const matches = itinerary.flatMap(day => day.stops.filter(stop => itemsForStop(stop).some(item => item.placeIds.some(id => placesById.get(id)?.area === '由布院'))).map(stop => ({day:day.day,stop})));
    expect(matches).toHaveLength(1);
    expect(matches[0].day).toBe(3);
    expect(matches[0].stop.name).toContain('湯之坪街道');
    expect(itemsForStop(matches[0].stop).map(item => item.id)).toEqual(['yufuin-milch-desserts','telato-matcha-gelato','5toku-matcha-latte','kichigo-karaage']);
    expect(itemsForStop({id:'test',startTime:'09:00',endTime:'10:00',name:'Milch',type:'行程',notes:''})).toEqual([]);
  });
});

describe('Dazaifu goals', () => {
  it('links the two approved foods to Day 4 street-food stop', () => {
    const stop = itinerary[3].stops.find(stop => stop.id === 'day-4-stop-5')!;
    expect(itemsForStop(stop).map(item => item.id)).toEqual(['dazaifu-tenzan-pudding','yasutake-umegaemochi']);
  });
});

describe('goal relationships', () => {
  it('collects all three goal types and deduplicates backup places', () => {
    const source: TripItem[] = ['shopping','food','experience'].map((type, i) => ({ id: `fixture-${i}`, name: '測試', type: type as TripItem['type'], category: '測試', priority: 3, image: '', notes: '', placeIds: ['hoka','beams'] }));
    const stop = { id: 'test', startTime: '09:00', endTime: '10:00', name: '測試', type: '行程', notes: '', placeIds: ['hoka','beams'] };
    expect(itemsForStop(stop,source)).toHaveLength(3);
    expect(itemsForStop({...stop, placeIds: []},source)).toEqual([]);
  });
});
