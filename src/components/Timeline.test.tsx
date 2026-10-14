// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, expect, it } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { Timeline } from './Timeline';
import { itinerary } from '../lib/data';
afterEach(cleanup);
it('hides unconfirmed locations and removes the place panel from itinerary cards', () => {
  render(<MemoryRouter><Timeline day={itinerary[2]}/></MemoryRouter>);
  expect(screen.queryByText(/店家與導航/)).toBeNull();
  expect(screen.queryByText(/營業時間待確認/)).toBeNull();
  expect(screen.queryByText(/地圖查找/)).toBeNull();
});
it('shows exactly one destination button for travel to Dazaifu', () => {
  const {container} = render(<MemoryRouter><Timeline day={{...itinerary[3],stops:[itinerary[3].stops[0]]}}/></MemoryRouter>);
  const link = screen.getByRole('link',{name:'Google Maps 導航 ↗'});
  expect(screen.getAllByRole('link')).toHaveLength(1);
  const url = new URL(link.getAttribute('href')!);
  expect(url.searchParams.get('destination')).toBe('日本 福岡県太宰府市 太宰府駅');
  expect(url.searchParams.has('origin')).toBe(false);
  expect(container.querySelector('summary')?.textContent).toBe('詳細資訊');
});
it('keeps the confirmed hotel destination without showing a duplicate place card', () => {
  render(<MemoryRouter><Timeline day={{...itinerary[0],stops:[itinerary[0].stops[10]]}}/></MemoryRouter>);
  expect(screen.getAllByRole('link')).toHaveLength(1);
  const url = new URL(screen.getByRole('link').getAttribute('href')!);
  expect(url.searchParams.get('destination')).toContain('博多駅南1-11-11');
});
it('preserves airport bus details with one confirmed destination link', () => {
  const {container} = render(<MemoryRouter><Timeline day={{...itinerary[0],stops:[itinerary[0].stops[2]]}}/></MemoryRouter>);
  expect(container.querySelector('details')?.textContent).toContain('Airport Bus');
  const url = new URL(screen.getByRole('link').getAttribute('href')!);
  expect(url.searchParams.get('destination')).toBe('日本 福岡県福岡市 博多駅');
});
