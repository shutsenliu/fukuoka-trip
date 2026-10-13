import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { parseItineraryMarkdown } from './markdown';
import { itinerary, wishlist, storesById } from './data';
describe('itinerary import', () => {
  it('reads all six days and preserves notes from the uploaded source', () => {
    const days = parseItineraryMarkdown(readFileSync('docs/itinerary-source.md', 'utf8'));
    expect(days).toHaveLength(6);
    expect(days[4].stops).toHaveLength(16);
    expect(days[4].stops.find(stop => stop.storeId === 'hoka')?.startTime).toBe('14:45');
    expect(days[0].stops[0].notes).toContain('入境');
  });
  it('supports a partial update and rejects invalid input', () => {
    expect(parseItineraryMarkdown('## 12/16 Day 5：新購物日\n- 09:30 - 11:30｜HOKA 福岡天神店')[0].stops[0].storeId).toBe('hoka');
    for (const text of ['hello', '## 12/15 Day 5：錯誤\n- 09:00 - 10:00｜店家', '## 12/16 Day 5：錯誤\n- 25:00 - 26:00｜店家', '## 12/16 Day 5：錯誤\n- 09:00 - 11:00｜A\n- 10:00 - 12:00｜B']) expect(() => parseItineraryMarkdown(text)).toThrow();
  });
});
describe('bundled relationships', () => {
  it('uses unique IDs and valid store references', () => {
    expect(new Set(wishlist.map(item => item.id)).size).toBe(wishlist.length);
    expect(itinerary).toHaveLength(6);
    for (const item of wishlist) for (const id of item.storeIds) expect(storesById.has(id)).toBe(true);
    for (const day of itinerary) for (const stop of day.stops) if (stop.storeId) expect(storesById.has(stop.storeId)).toBe(true);
    expect(itinerary[4].stops).toHaveLength(16);
  });
});
