// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, expect, it } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { Timeline } from './Timeline';
import { itinerary } from '../lib/data';
afterEach(cleanup);
it('does not produce navigation buttons from unassigned activity text', () => {
  render(<MemoryRouter><Timeline day={{...itinerary[0], stops: itinerary[0].stops.filter(stop => !stop.placeId)}}/></MemoryRouter>);
  expect(screen.getByText('抵達福岡、入境、領行李')).toBeTruthy();
  expect(screen.queryByRole('link')).toBeNull();
});
it('separates confirmed destination navigation from uncertain location lookup', () => {
  render(<MemoryRouter><Timeline day={itinerary[2]}/></MemoryRouter>);
  expect(screen.getByRole('link',{name:'導航至 日本茶 5toku',hidden:true}).getAttribute('href')).toContain('destination=');
  expect(screen.getByRole('link',{name:'地圖查找 中津からあげ専門店 吉吾 湯布院店',hidden:true}).getAttribute('href')).toContain('/maps/search/');
});

it('navigates hotel return stops only to the confirmed Hakata hotel', () => {
  render(<MemoryRouter><Timeline day={itinerary[0]}/></MemoryRouter>);
  const links = screen.getAllByRole('link',{name:'導航至 東急 STAY 博多（TOKYU STAY HAKATA）'});
  expect(links).toHaveLength(2);
  for (const link of links) expect(new URL(link.getAttribute('href')!).searchParams.get('destination')).toContain('博多駅南1-11-11');
});
