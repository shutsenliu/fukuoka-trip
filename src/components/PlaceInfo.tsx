import type { Place } from '../types';
import { placeDirectionsUrl } from '../lib/navigation';
export function PlaceInfo({ place }: { place: Place }) {
  const navigation = placeDirectionsUrl(place);
  return <section className="place-info" aria-label={`${place.name} 地點資訊`}>
    <p className="font-semibold">📍 {place.name}</p>
    <p className="muted mt-1">{[place.area, place.hours, place.closedDays].filter(Boolean).join(' · ')}</p>
    {!/確認|待確認/.test(place.address) && <p className="muted mt-1">{place.shortAddress ?? place.address}</p>}
    {navigation && <a className="button navigation-button mt-3" href={navigation} target="_blank" rel="noreferrer" aria-label={`導航至 ${place.name}`}>Google Maps 導航 ↗</a>}

    {place.notes && !place.notes.startsWith('行程中的停留地點') && <details className="place-more"><summary>詳細資訊</summary><p className="muted whitespace-pre-line mt-2">{place.notes}</p></details>}
  </section>;
}
