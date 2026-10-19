import couponData from '../data/coupons.json';

export type CouponMode = 'image' | 'web' | 'counter' | 'membership';
export type CouponStatus = 'in-trip' | 'check' | 'out-of-trip';
export interface Coupon {
  id: string;
  merchant: string;
  aliases: string[];
  offer: string;
  validity: string;
  stores: string;
  limits: string[];
  mode: CouponMode;
  tripStatus: CouponStatus;
  thresholds?: string[];
  redeemAt?: string;
  image?: string;
  notice?: string;
  actionUrl?: string;
  actionLabel?: string;
  sourceUrls: string[];
}

function isMode(value: string): value is CouponMode {
  return ['image', 'web', 'counter', 'membership'].includes(value);
}
function isStatus(value: string): value is CouponStatus {
  return ['in-trip', 'check', 'out-of-trip'].includes(value);
}
export const coupons: Coupon[] = couponData.map(coupon => {
  if (!isMode(coupon.mode) || !isStatus(coupon.tripStatus)) throw new Error(`Invalid coupon: ${coupon.id}`);
  return { ...coupon, mode: coupon.mode, tripStatus: coupon.tripStatus };
});

function normalize(value: string): string {
  return value.normalize('NFKC').toLowerCase().replace(/[\s\p{P}\p{S}]/gu, '');
}
export function matchesCoupon(coupon: Coupon, query: string): boolean {
  const terms = query.trim().split(/\s+/).map(normalize).filter(Boolean);
  const text = normalize([coupon.merchant, ...coupon.aliases, coupon.stores].join(' '));
  return terms.every(term => text.includes(term));
}
