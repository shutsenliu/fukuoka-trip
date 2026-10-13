import { describe, expect, it } from 'vitest';
import { itinerary, wishlist, storesById } from './data';
describe('bundled relationships', () => {
  it('uses unique IDs and valid store references', () => {
    expect(new Set(wishlist.map(item => item.id)).size).toBe(wishlist.length);
    expect(itinerary).toHaveLength(6);
    for (const item of wishlist) for (const id of item.storeIds) expect(storesById.has(id)).toBe(true);
    for (const day of itinerary) for (const stop of day.stops) if (stop.storeId) expect(storesById.has(stop.storeId)).toBe(true);
    expect(itinerary[4].stops).toHaveLength(16);
  });
});

describe('shopping at itinerary stops', () => {
  it('includes grouped stores and counts products only once across backup locations', async () => {
    const { itemsForStop } = await import('./data');
    expect(itemsForStop(itinerary[4].stops[0]).map(item => item.id)).toEqual(['godzilla-sanrio']);
    expect(itemsForStop(itinerary[4].stops[4]).map(item => item.id)).toEqual(['ora-primo','ora-primo-ext']);
    expect(itemsForStop({ id: 'custom', startTime: '09:00', endTime: '10:00', name: '試鞋', type: '購物', notes: '', storeIds: ['hoka','beams','uptown'] })).toHaveLength(2);
    expect(itemsForStop(itinerary[4].stops[1])).toHaveLength(0);
  });
  it('does not infer shopping items from stop names or notes', async () => {
    const { itemsForStop } = await import('./data');
    expect(itemsForStop({ id: 'custom', startTime: '09:00', endTime: '10:00', name: 'HOKA 福岡天神店', type: '購物', notes: 'ORA PRIMO 鞋子' })).toEqual([]);
  });
});
