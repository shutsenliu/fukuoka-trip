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

describe('empty shopping list', () => {
  it('does not create products from itinerary store links', async () => {
    const { itemsForStop } = await import('./data');
    expect(wishlist).toEqual([]);
    for (const day of itinerary) for (const stop of day.stops) expect(itemsForStop(stop)).toEqual([]);
  });
});
