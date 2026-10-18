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
    { id: 'fixture-seven', name: '測試超商冰', type: 'food', category: '冰淇淋', priority: 3, image: '', notes: '', placeIds: [], convenienceStore: '7-ELEVEN' },
    { id: 'fixture-lawson', name: '測試超商泡芙', type: 'food', category: '甜點', priority: 3, image: '', notes: '', placeIds: [], convenienceStore: 'Lawson' },
    { id: 'fixture-any', name: '測試冷藏優格', type: 'food', category: '優格', priority: 3, image: '', notes: '', placeIds: [], convenienceStore: 'any' },
    { id: 'fixture-drugstore', name: '測試藥妝', type: 'shopping', shoppingGroup: 'drugstore', category: '保養品', priority: 3, image: '', notes: '', placeIds: [] },
    { id: 'fixture-protein', name: '測試乳清', type: 'shopping', category: '乳清蛋白', priority: 3, image: '', notes: '', placeIds: [], comparisonId: 'whey-protein' },
  ];
  return { ...actual, items: fixtures, itemsForStop: (stop: ItineraryStop) => actual.itemsForStop(stop,fixtures) };
});
import { ChecklistPage } from './ChecklistPage';
import { itinerary } from '../lib/data';
afterEach(() => { cleanup(); localStorage.clear(); window.dispatchEvent(new StorageEvent('storage',{ key: null })); });
it('filters shopping and food, day/stop and completed status without duplicate backup items', () => {
  render(<MemoryRouter initialEntries={['/items?day=day-5&stop=day-5-stop-6&category=已移除分類']}><ChecklistPage days={itinerary}/></MemoryRouter>);
  expect(screen.getByText('測試購物')).toBeTruthy(); expect(screen.getByText('測試小吃')).toBeTruthy();
  fireEvent.click(screen.getByRole('button',{name:'🍡 美食'}));
  expect(screen.queryByText('測試購物')).toBeNull();
  fireEvent.click(screen.getByRole('checkbox'));
  fireEvent.click(screen.getByRole('button',{name:'已完成'}));
  expect(screen.getByText('測試小吃')).toBeTruthy();
  fireEvent.click(screen.getByRole('button',{name:'未完成'}));
  expect(screen.queryByText('測試小吃')).toBeNull();
  fireEvent.click(screen.getByRole('button',{name:'重設篩選'}));
  expect(screen.getAllByRole('checkbox')).toHaveLength(7);
  expect(screen.queryByRole('button',{name:'✨ 體驗'})).toBeNull();
});

it('opens convenience goals from an itinerary filter, separates chains and persists completion', () => {
  render(<MemoryRouter initialEntries={['/items?day=day-5&stop=day-5-stop-6&type=shopping&category=衣物']}><ChecklistPage days={itinerary}/></MemoryRouter>);
  fireEvent.click(screen.getByRole('button',{name:'🏪 超商'}));
  expect(screen.getByText('測試超商冰')).toBeTruthy();
  expect(screen.getByText('測試超商泡芙')).toBeTruthy();
  expect(screen.getByText('測試冷藏優格')).toBeTruthy();
  expect(screen.getByText('🏪 超商／超市 · 路過再買')).toBeTruthy();
  expect(screen.queryByText('測試購物')).toBeNull();
  expect((screen.getByLabelText('日期') as HTMLSelectElement).disabled).toBe(true);
  fireEvent.change(screen.getByLabelText('超商品牌'),{target:{value:'Lawson'}});
  expect(screen.queryByText('測試超商冰')).toBeNull();
  expect(screen.queryByText('測試冷藏優格')).toBeNull();
  fireEvent.click(screen.getByRole('checkbox'));
  fireEvent.click(screen.getByRole('button',{name:'已完成'}));
  expect(screen.getByText('測試超商泡芙')).toBeTruthy();
  fireEvent.click(screen.getByRole('button',{name:'未完成'}));
  expect(screen.queryByText('測試超商泡芙')).toBeNull();
  fireEvent.click(screen.getByRole('button',{name:'重設篩選'}));
  expect(screen.getAllByRole('checkbox')).toHaveLength(7);
});

it('places protein next to convenience, clears itinerary scope and removes it from subcategories', () => {
  const {container} = render(<MemoryRouter initialEntries={['/items?day=day-5&stop=day-5-stop-6&type=food']}><ChecklistPage days={itinerary}/></MemoryRouter>);
  expect(screen.queryByLabelText('細分類')).toBeNull();
  expect(screen.queryByRole('option',{name:'乳清蛋白'})).toBeNull();
  const button = screen.getByRole('button',{name:'🥤 乳清'});
  expect(button.previousElementSibling?.getAttribute('aria-label')).toBe('🏪 超商');
  fireEvent.click(button);
  expect(container.querySelectorAll('article')).toHaveLength(1);
  expect(screen.getByRole('heading',{name:'比價與入手標準'})).toBeTruthy();
  expect(screen.queryByLabelText('細分類')).toBeNull();
  expect((screen.getByLabelText('日期') as HTMLSelectElement).disabled).toBe(true);
  fireEvent.click(screen.getByRole('button',{name:'🏪 超商'}));
  expect(screen.queryByRole('heading',{name:'比價與入手標準'})).toBeNull();
  const drugstore = screen.getByRole('button',{name:'💊 藥妝'});
  expect(drugstore.previousElementSibling?.getAttribute('aria-label')).toBe('🥤 乳清');
  fireEvent.click(drugstore);
  expect(drugstore.getAttribute('aria-pressed')).toBe('true');
  expect(container.querySelectorAll('article')).toHaveLength(1);
  expect(screen.getByText('測試藥妝')).toBeTruthy();
});

it('keeps drugstore items out of shopping and preserves completion when switching groups', () => {
  render(<MemoryRouter initialEntries={['/items?type=shopping']}><ChecklistPage days={itinerary}/></MemoryRouter>);
  expect(screen.getByText('測試購物')).toBeTruthy();
  expect(screen.queryByText('測試藥妝')).toBeNull();
  fireEvent.click(screen.getByRole('button',{name:'💊 藥妝'}));
  expect(screen.getByText('測試藥妝')).toBeTruthy();
  expect(screen.queryByText('測試購物')).toBeNull();
  const card = screen.getByRole('article');
  expect(card.textContent).toContain('藥妝');
  expect(card.textContent).not.toContain('購物');
  fireEvent.click(screen.getByRole('checkbox'));
  fireEvent.click(screen.getByRole('button',{name:'🛍 購物'}));
  expect(screen.queryByText('測試藥妝')).toBeNull();
  fireEvent.click(screen.getByRole('button',{name:'💊 藥妝'}));
  expect((screen.getByRole('checkbox') as HTMLInputElement).checked).toBe(true);
});
