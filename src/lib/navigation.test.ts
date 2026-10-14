import { expect, it } from 'vitest';
import { directionsUrl, placeDirectionsUrl } from './navigation';
import { placesById } from './data';
it('opens directions from the device location to the correct store', () => {
  const place = placesById.get('dazaifu-tenzan-pudding')!;
  const url = new URL(placeDirectionsUrl(place));
  expect(url.pathname).toBe('/maps/dir/');
  expect(url.searchParams.get('destination')).toContain('宰府3丁目1-28');
  expect(url.searchParams.has('origin')).toBe(false);
  expect(url.searchParams.get('dir_action')).toBe('navigate');
});
it('keeps disputed addresses out of navigation and safely encodes stop names', () => {
  expect(new URL(placeDirectionsUrl(placesById.get('yufuin-kichigo')!)).searchParams.get('destination')).toBe('中津からあげ専門店 吉吾 湯布院店');
  expect(new URL(directionsUrl('A & B')).searchParams.get('destination')).toBe('A & B');
});
