// @vitest-environment jsdom
import { afterEach, expect, it } from 'vitest';
import { itinerary } from './data';
import { initialDay, rememberDay, SELECTED_DAY_KEY } from './selectedDay';
afterEach(() => localStorage.clear());
it('starts at Day 1 and remembers the selected day outside the trip', () => {
  const now = new Date('2026-10-13T00:00:00Z');
  expect(initialDay(itinerary,now)).toBe(1);
  rememberDay(3); expect(initialDay(itinerary,now)).toBe(3);
  localStorage.setItem(SELECTED_DAY_KEY,'99'); expect(initialDay(itinerary,now)).toBe(1);
});
it('prioritizes the current Japanese date during the trip', () => {
  rememberDay(5);
  expect(initialDay(itinerary,new Date('2026-12-11T15:00:00Z'))).toBe(1);
  expect(initialDay(itinerary,new Date('2026-12-16T15:00:00Z'))).toBe(6);
});
