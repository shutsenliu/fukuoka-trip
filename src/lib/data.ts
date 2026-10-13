import itineraryJson from '../data/itinerary.json';
import storesJson from '../data/stores.json';
import wishlistJson from '../data/wishlist.json';
import type { TripDay, Store, WishlistItem } from '../types';
export const itinerary: TripDay[] = itineraryJson;
export const stores: Store[] = storesJson;
export const wishlist: WishlistItem[] = wishlistJson;
export const storesById = new Map(stores.map(store => [store.id, store]));
export const itemsForStore = (id: string) => wishlist.filter(item => item.storeIds.includes(id));
