// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, expect, it } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { Timeline } from './Timeline';
import { itinerary } from '../lib/data';
afterEach(cleanup);
it('does not produce navigation buttons from Day 1 resting or transport text', () => {
  render(<MemoryRouter><Timeline day={itinerary[0]}/></MemoryRouter>);
  expect(screen.getByText('返回飯店 Check-in、休息')).toBeTruthy();
  expect(screen.queryByRole('link')).toBeNull();
});
it('separates confirmed destination navigation from uncertain location lookup', () => {
  render(<MemoryRouter><Timeline day={itinerary[2]}/></MemoryRouter>);
  expect(screen.getByRole('link',{name:'導航至 日本茶 5toku',hidden:true}).getAttribute('href')).toContain('destination=');
  expect(screen.getByRole('link',{name:'地圖查找 中津からあげ専門店 吉吾 湯布院店',hidden:true}).getAttribute('href')).toContain('/maps/search/');
});
