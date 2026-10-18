import itineraryJson from '../data/itinerary.json';
import placesJson from '../data/places.json';
import itemsJson from '../data/items.json';
import type { TripDay, Place, TripItem, ItineraryStop } from '../types';
export const itinerary: TripDay[] = itineraryJson;
export const places: Place[] = placesJson.map(place => {
  if (place.type !== 'shop' && place.type !== 'restaurant' && place.type !== 'attraction' && place.type !== 'hotel') throw new Error(`Invalid place type: ${place.id}`);
  return { ...place, type: place.type };
});
export const items: TripItem[] = itemsJson.map((item) => {
  if (item.type !== 'shopping' && item.type !== 'food') throw new Error(`Invalid item type: ${item.id}`);
  if (item.convenienceStore !== undefined && item.convenienceStore !== '7-ELEVEN' && item.convenienceStore !== 'Lawson' && item.convenienceStore !== 'any') throw new Error(`Invalid convenience store: ${item.id}`);
  if (item.convenienceStore && item.placeIds.length) throw new Error(`Convenience goal must be independent: ${item.id}`);
  if (item.shoppingGroup !== undefined && item.shoppingGroup !== 'drugstore') throw new Error(`Invalid shopping group: ${item.id}`);
  return { ...item, shoppingGroup: item.shoppingGroup, type: item.type, convenienceStore: item.convenienceStore };
});
export const placesById = new Map(places.map(store => [store.id, store]));
export const itemsForPlace = (id: string) => items.filter(item => item.placeIds.includes(id));

export function placeIdsForStop(stop: ItineraryStop): string[] {
  return [...new Set([...(stop.placeIds ?? []), ...(stop.placeId ? [stop.placeId] : [])])];
}
export function itemsForStop(stop: ItineraryStop, source: TripItem[] = items): TripItem[] {
  const ids = new Set(placeIdsForStop(stop));
  return source.filter(item => item.placeIds.some(id => ids.has(id)));
}
