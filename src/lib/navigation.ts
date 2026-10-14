import type { Place, ItineraryMap } from '../types';
export function placeDirectionsUrl(place: Place): string | undefined {
  // Never use itinerary text or a guessed place name as a navigation destination.
  if (!place.navigationDestination) return undefined;
  return `https://www.google.com/maps/dir/?${new URLSearchParams({ api: '1', destination: place.navigationDestination, dir_action: 'navigate' })}`;
}
export function placeSearchUrl(place: Place): string {
  const destination = place.navigationDestination ?? place.mapQuery ?? `日本 ${place.area} ${place.name}`;
  return `https://www.google.com/maps/search/?${new URLSearchParams({ api: '1', query: destination })}`;
}

export function itineraryMapUrl(map: ItineraryMap): string {
  if (!map.origin) return `https://www.google.com/maps/search/?${new URLSearchParams({api:'1',query:map.destination})}`;
  const params = new URLSearchParams({api:'1',origin:map.origin,destination:map.destination});
  if (map.transit) params.set('travelmode','transit');
  else if (map.walking) params.set('travelmode','walking');
  return `https://www.google.com/maps/dir/?${params}`;
}
