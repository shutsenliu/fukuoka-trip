// @vitest-environment jsdom
import { afterEach, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import type { ItineraryStop, TripItem } from '../types';
vi.mock('../lib/data', async importOriginal => {
  const actual = await importOriginal<typeof import('../lib/data')>();
  const fixtures: TripItem[] = [
    { id: 'fixture-shopping', name: '測試購物', type: 'shopping', category: '衣物', priority: 3, image: '', notes: '', placeIds: ['hoka','beams'] },
    { id: 'fixture-food', name: '測試小吃', type: 'food', category: '點心', priority: 3, image: '', notes: '', placeIds: ['hoka'] },
    { id: 'fixture-experience', name: '測試體驗', type: 'experience', category: '活動', priority: 3, image: '', notes: '', placeIds: ['fullfull'] },
  ];
  return { ...actual, items: fixtures, itemsForStop: (stop: ItineraryStop) => actual.itemsForStop(stop,fixtures) };
});
import { ChecklistPage } from './ChecklistPage';
import { itinerary } from '../lib/data';
afterEach(() => { cleanup(); localStorage.clear(); window.dispatchEvent(new StorageEvent('storage',{ key: null })); });
it('filters all three types, day/stop and completed status without duplicate backup items', () => {
  render(<MemoryRouter initialEntries={['/items?day=day-5&stop=day-5-stop-6']}><ChecklistPage days={itinerary}/></MemoryRouter>);
  expect(screen.getByText('測試購物')).toBeTruthy(); expect(screen.getByText('測試小吃')).toBeTruthy(); expect(screen.queryByText('測試體驗')).toBeNull();
  fireEvent.click(screen.getByRole('button',{name:'🍡 美食'}));
  expect(screen.queryByText('測試購物')).toBeNull();
  fireEvent.click(screen.getByRole('checkbox'));
  fireEvent.click(screen.getByRole('button',{name:'已完成'}));
  expect(screen.getByText('測試小吃')).toBeTruthy();
  fireEvent.click(screen.getByRole('button',{name:'未完成'}));
  expect(screen.queryByText('測試小吃')).toBeNull();
  fireEvent.click(screen.getByRole('button',{name:'重設篩選'}));
  expect(screen.getAllByRole('checkbox')).toHaveLength(3);
  fireEvent.click(screen.getByRole('button',{name:'✨ 體驗'})); expect(screen.getByText('測試體驗')).toBeTruthy();
});
