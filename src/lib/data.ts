import itineraryJson from '../data/itinerary.json';
import storesJson from '../data/stores.json';
import wishlistJson from '../data/wishlist.json';
import type { TripDay, Store, WishlistItem, ItineraryStop } from '../types';
export const itinerary: TripDay[] = itineraryJson;
export const stores: Store[] = storesJson;
export const wishlist: WishlistItem[] = wishlistJson;
export const storesById = new Map(stores.map(store => [store.id, store]));
export const itemsForStore = (id: string) => wishlist.filter(item => item.storeIds.includes(id));

export function storeIdsForStop(stop: ItineraryStop): string[] {
  // Retain bundled shopping groups for previously saved itineraries with the same stop name.
  const bundled = itinerary.flatMap(day => day.stops).find(entry => entry.name === stop.name);
  return [...new Set([...(stop.storeIds ?? bundled?.storeIds ?? []), ...(stop.storeId ? [stop.storeId] : [])])];
}
export function itemsForStop(stop: ItineraryStop): WishlistItem[] {
  const ids = new Set(storeIdsForStop(stop));
  return wishlist.filter(item => item.storeIds.some(id => ids.has(id)));
}
