import { expect, it } from 'vitest';
import { existsSync } from 'node:fs';
import { coupons, matchesCoupon } from './coupons';
it('matches normalized multilingual store aliases and all query terms', () => {
  const donki = coupons.find(c => c.id === 'donki')!;
  expect(matchesCoupon(donki, 'ＤＯＮＫＩ')).toBe(true);
  expect(matchesCoupon(donki, '唐吉訶德')).toBe(true);
  expect(matchesCoupon(donki, 'Donki 不存在')).toBe(false);
  expect(matchesCoupon(donki, '  ')).toBe(true);
});
it('ships complete local image assets only for image coupons and distinct records', () => {
  expect(new Set(coupons.map(c => c.id)).size).toBe(coupons.length);
  for (const coupon of coupons) {
    expect(coupon.limits.length).toBeGreaterThan(0);
    if (coupon.mode === 'image') {
      expect(coupon.image).toBeTruthy();
      expect(existsSync(`public/${coupon.image}`)).toBe(true);
    } else expect(coupon.image).toBeUndefined();
    if (coupon.actionUrl) expect(coupon.actionUrl.startsWith('https://')).toBe(true);
  }
  expect(coupons.find(c => c.id === 'jr-city')?.tripStatus).toBe('out-of-trip');
  expect(coupons.find(c => c.id === 'bic')?.tripStatus).toBe('out-of-trip');
});
