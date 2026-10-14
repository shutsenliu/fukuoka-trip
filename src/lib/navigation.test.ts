import { expect, it } from 'vitest';
import { placeDirectionsUrl, placeSearchUrl, itineraryMapUrl } from './navigation';
import { placesById } from './data';
it('navigates only to explicitly verified addresses in Japan', () => {
  const url = new URL(placeDirectionsUrl(placesById.get('dazaifu-tenzan-pudding')!)!);
  expect(url.searchParams.get('destination')).toBe('日本 福岡県太宰府市宰府3丁目1-28');
  expect(url.searchParams.has('origin')).toBe(false);
});
it('does not navigate to guessed or disputed locations', () => {
  for (const id of ['yufuin-kichigo','hoka','yufuin']) expect(placeDirectionsUrl(placesById.get(id)!)).toBeUndefined();
  const url = new URL(placeSearchUrl(placesById.get('yufuin-kichigo')!));
  expect(url.pathname).toBe('/maps/search/');
  expect(url.searchParams.get('query')).toContain('日本 大分県由布市');
});

it('preserves exact segment destinations and travel modes', () => {
  const url = new URL(itineraryMapUrl({label:'小倉 → 門司港',origin:'日本 福岡県北九州市 小倉駅',destination:'日本 福岡県北九州市 門司港駅',transit:true}));
  expect(url.searchParams.get('destination')).toContain('門司港駅');
  expect(url.searchParams.get('travelmode')).toBe('transit');
});
