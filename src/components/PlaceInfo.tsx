import type { Place } from '../types';
import { placeDirectionsUrl, placeSearchUrl } from '../lib/navigation';
export function PlaceInfo({ place }: { place: Place }) {
  const navigation = placeDirectionsUrl(place);
  return <section className="place-info" aria-label={`${place.name} 地點資訊`}>
    <p className="font-semibold">📍 {place.name}</p>
    <p className="muted mt-1">{[place.area, place.hours ?? '營業時間待確認', place.closedDays].filter(Boolean).join(' · ')}</p>
    <p className="muted mt-1">{place.shortAddress ?? place.address}</p>
    <a className="button navigation-button mt-3" href={navigation ?? placeSearchUrl(place)} target="_blank" rel="noreferrer" aria-label={`${navigation ? '導航至' : '地圖查找'} ${place.name}`}>{navigation ? 'Google Maps 導航 ↗' : '地圖查找（請確認位置）↗'}</a>
    {(place.notes || place.sourceUrls?.length) && <details className="place-more"><summary>詳細資訊</summary><p className="muted whitespace-pre-line mt-2">{place.notes}</p>{place.sourceUrls?.map((url,index) => <a className="source-link" key={url} href={url} target="_blank" rel="noreferrer">查證來源 {index + 1} ↗</a>)}</details>}
  </section>;
}
