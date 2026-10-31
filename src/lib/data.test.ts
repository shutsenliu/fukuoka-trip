import theme from '../data/theme.json';
import comparisonData from '../data/comparisons.json';
import { existsSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import type { TripItem } from '../types';
import { itemsForStop, itinerary, items, placesById } from './data';
describe('bundled relationships', () => {
  it('uses unique IDs and valid store references', () => {
    expect(new Set(items.map(item => item.id)).size).toBe(items.length);
    expect(itinerary).toHaveLength(6);
    for (const item of items) for (const id of item.placeIds) expect(placesById.has(id)).toBe(true);
    for (const day of itinerary) for (const stop of day.stops) {
      if (stop.placeId) expect(placesById.has(stop.placeId)).toBe(true);
      for (const id of stop.placeIds ?? []) expect(placesById.has(id)).toBe(true);
    }
    expect(itinerary[4].stops.map(stop => stop.id)).toEqual(expect.arrayContaining(['day-5-stop-1','day-5-uniqlo','day-5-nintendo']));
  });
});

describe('user-provided goals', () => {
  it('links the approved Yufuin food goals only to the assigned Day 3 stop', () => {
    const matches = itinerary.flatMap(day => day.stops.filter(stop => itemsForStop(stop).some(item => item.placeIds.some(id => placesById.get(id)?.area === '由布院'))).map(stop => ({day:day.day,stop})));
    expect(matches).toHaveLength(1);
    expect(matches[0].day).toBe(3);
    expect(matches[0].stop.name).toContain('湯之坪街道');
    expect(itemsForStop(matches[0].stop).map(item => item.id)).toEqual(['yufuin-milch-desserts','telato-matcha-gelato','5toku-matcha-latte','kichigo-karaage','cucuchi-montblanc','cucuchi-strawberry-daifuku','bspeak-p-roll','bspeak-earl-grey']);
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
  it('collects both goal types and deduplicates backup places', () => {
    const source: TripItem[] = ['shopping','food'].map((type, i) => ({ id: `fixture-${i}`, name: '測試', type: type as TripItem['type'], category: '測試', priority: 3, image: '', notes: '', placeIds: ['hoka','beams'] }));
    const stop = { id: 'test', startTime: '09:00', endTime: '10:00', name: '測試', type: '行程', notes: '', placeIds: ['hoka','beams'] };
    expect(itemsForStop(stop,source)).toHaveLength(2);
    expect(itemsForStop({...stop, placeIds: []},source)).toEqual([]);
  });
});

describe('itinerary map audit', () => {
  it('gives every location or movement stop a curated map, without guessing activity titles', () => {
    const noMapNeeded = new Set(['day-1-stop-1','day-1-stop-2','day-6-stop-1','day-6-stop-4','day-6-stop-6']);
    for (const day of itinerary) for (const stop of day.stops) {
      if (noMapNeeded.has(stop.id)) expect(stop.maps).toBeUndefined();
      else expect(Boolean(stop.placeId || stop.placeIds?.length || stop.maps?.length)).toBe(true);
      for (const map of stop.maps ?? []) {
        expect(map.destination).toMatch(/^日本 /);
        expect(map.destination).not.toBe(stop.name);
      }
    }
  });
});

describe('approved Hakata shopping plan', () => {
  it('groups station souvenirs in Day 1 and keeps airside purchases in Day 6', () => {
    const day1 = itinerary[0];
    const hankyu = day1.stops.find(stop => stop.id === 'day-1-hankyu-souvenirs')!;
    const station = day1.stops.find(stop => stop.id === 'day-1-station-souvenirs')!;
    expect(itemsForStop(hankyu).map(item => item.id)).toEqual(['ivorish-financier','sugarbutter-amaou','amanberry-strawberry']);
    expect(itemsForStop(station).map(item => item.id)).toEqual(['leclerc-caneles','hanafukudo-ichigo-langue','butterbee-honey-chocolat','hakata-mentai-ebi','fukusaya-castella','menbei-plain','hanafukudo-ichigo-millefeuille','itoking-hakata-pieou','itoking-fukuoka-ichigo-cookies','jiichiro-pudding','calbee-jagarico-mentaiko-gift']);
    const airport = itinerary[5].stops.find(stop => stop.id === 'day-6-stop-5')!;
    expect(itemsForStop(airport).map(item => item.id)).toEqual(['tsukiji-chitose-tempura-senbei','chaoriya-gran-tea-crunch','chaoriya-hojicha-pie-sand']);
    expect(airport.notes).toContain('出境手續後');
    const tenjin = itinerary[4].stops.find(stop => stop.id === 'day-5-stop-8')!;
    expect(itemsForStop(tenjin).some(item => item.id === 'butterstates-amaou-butter-sand')).toBe(true);
    expect(airport.detailMarkdown).toContain('12 月確定販售');
    expect(station.endTime).toBe('16:15');
    const imonne = itinerary[4].stops.find(stop => stop.id === 'day-5-imonne')!;
    expect(itemsForStop(imonne).map(item => item.id)).toEqual(['imonne-matcha-mochi']);
    expect(imonne.startTime).toBe('10:55');
    expect(items.find(item => item.id === 'butterbee-honey-chocolat')?.notes).toContain('供應待確認');
  });
  it('keeps the approved MoMA goal in Day 5 and unlocated LUSH off the itinerary', () => {
    const moma = itinerary[4].stops.find(stop => stop.id === 'day-5-moma')!;
    expect(itemsForStop(moma).map(item => item.id)).toEqual(['pampshade-bread-lamp']);
    expect(placesById.get('moma-fukuoka')?.navigationDestination).toContain('天神1-11-1');
    const lush = items.find(item => item.id === 'lush-sanrio-soap')!;
    expect(lush.placeIds).toEqual([]);
    expect(itinerary.flatMap(day => day.stops).some(stop => itemsForStop(stop).includes(lush))).toBe(false);
  });
  it('retains ordered non-overlapping times and real image assets', () => {
    for (const day of itinerary) {
      expect(new Set(day.stops.map(stop => stop.id)).size).toBe(day.stops.length);
      for (let index = 0; index < day.stops.length; index++) {
        const stop = day.stops[index];
        expect(stop.startTime).toMatch(/^([01]\d|2[0-3]):[0-5]\d$/);
        expect(stop.endTime > stop.startTime).toBe(true);
        if (index) expect(stop.startTime >= day.stops[index - 1].endTime).toBe(true);
      }
    }
    for (const item of items) expect(existsSync(`public/${item.image}`)).toBe(true);
    expect(existsSync(`public/${theme.heroImage}`)).toBe(true);
    for (const day of itinerary) {
      const art = theme.days.find(entry => entry.day === day.day);
      expect(art).toBeDefined();
      expect(existsSync(`public/${art!.image}`)).toBe(true);
    }
  });
});

describe('grouped protein comparison', () => {
  it('counts one goal with three illustrated candidates and keeps unverified shops out of the itinerary', () => {
    const grouped = items.filter(item => item.comparisonId === 'whey-protein');
    expect(grouped).toHaveLength(1);
    expect(grouped[0].placeIds).toEqual([]);
    expect(itinerary.flatMap(day => day.stops).flatMap(stop => itemsForStop(stop)).some(item => item.id === grouped[0].id)).toBe(false);
    expect(comparisonData[0].candidates).toHaveLength(3);
    for (const candidate of comparisonData[0].candidates) expect(existsSync(`public/${candidate.image}`)).toBe(true);
  });
});
