import type { Place } from '../types';
export function directionsUrl(destination: string): string {
  return `https://www.google.com/maps/dir/?${new URLSearchParams({ api: '1', destination, dir_action: 'navigate' })}`;
}
export function placeDirectionsUrl(place: Place): string {
  // Preserve the curated search target when an address is uncertain or disputed.
  if (place.mapUrl) {
    try { const query = new URL(place.mapUrl).searchParams.get('query'); if (query) return directionsUrl(query); }
    catch { /* Fall back to the place name if a stored map link is malformed. */ }
  }
  return directionsUrl(place.name);
}
