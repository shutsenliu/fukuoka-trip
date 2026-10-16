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
    { id: 'fixture-protein', name: '測試乳清', type: 'shopping', category: '乳清蛋白', priority: 3, image: '', notes: '', placeIds: [], comparisonId: 'whey-protein' },
  ];
  return { ...actual, items: fixtures, itemsForStop: (stop: ItineraryStop) => actual.itemsForStop(stop,fixtures) };
});
import { ChecklistPage } from './ChecklistPage';
import { itinerary } from '../lib/data';
afterEach(() => { cleanup(); localStorage.clear(); window.dispatchEvent(new StorageEvent('storage',{ key: null })); });
it('filters shopping and food, day/stop and completed status without duplicate backup items', () => {
  render(<MemoryRouter initialEntries={['/items?day=day-5&stop=day-5-stop-6']}><ChecklistPage days={itinerary}/></MemoryRouter>);
  expect(screen.getByText('測試購物')).toBeTruthy(); expect(screen.getByText('測試小吃')).toBeTruthy();
  fireEvent.click(screen.getByRole('button',{name:'🍡 美食'}));
  expect(screen.queryByText('測試購物')).toBeNull();
  fireEvent.click(screen.getByRole('checkbox'));
  fireEvent.click(screen.getByRole('button',{name:'已完成'}));
  expect(screen.getByText('測試小吃')).toBeTruthy();
  fireEvent.click(screen.getByRole('button',{name:'未完成'}));
  expect(screen.queryByText('測試小吃')).toBeNull();
  fireEvent.click(screen.getByRole('button',{name:'重設篩選'}));
  expect(screen.getAllByRole('checkbox')).toHaveLength(5);
  expect(screen.queryByRole('button',{name:'✨ 體驗'})).toBeNull();
});

it('opens convenience goals from an itinerary filter, separates chains and persists completion', () => {
  render(<MemoryRouter initialEntries={['/items?day=day-5&stop=day-5-stop-6&type=shopping&category=衣物']}><ChecklistPage days={itinerary}/></MemoryRouter>);
  fireEvent.click(screen.getByRole('button',{name:'🏪 超商'}));
  expect(screen.getByText('測試超商冰')).toBeTruthy();
  expect(screen.getByText('測試超商泡芙')).toBeTruthy();
  expect(screen.queryByText('測試購物')).toBeNull();
  expect((screen.getByLabelText('日期') as HTMLSelectElement).disabled).toBe(true);
  fireEvent.change(screen.getByLabelText('超商品牌'),{target:{value:'Lawson'}});
  expect(screen.queryByText('測試超商冰')).toBeNull();
  fireEvent.click(screen.getByRole('checkbox'));
  fireEvent.click(screen.getByRole('button',{name:'已完成'}));
  expect(screen.getByText('測試超商泡芙')).toBeTruthy();
  fireEvent.click(screen.getByRole('button',{name:'未完成'}));
  expect(screen.queryByText('測試超商泡芙')).toBeNull();
  fireEvent.click(screen.getByRole('button',{name:'重設篩選'}));
  expect(screen.getAllByRole('checkbox')).toHaveLength(5);
});

it('places protein next to convenience, clears itinerary scope and removes it from subcategories', () => {
  const {container} = render(<MemoryRouter initialEntries={['/items?day=day-5&stop=day-5-stop-6&type=food']}><ChecklistPage days={itinerary}/></MemoryRouter>);
  expect(screen.queryByRole('option',{name:'乳清蛋白'})).toBeNull();
  const button = screen.getByRole('button',{name:'🥤 乳清'});
  expect(button.previousElementSibling?.textContent).toBe('🏪 超商');
  fireEvent.click(button);
  expect(container.querySelectorAll('article')).toHaveLength(1);
  expect(screen.getByRole('heading',{name:'比價與入手標準'})).toBeTruthy();
  expect(screen.queryByLabelText('細分類')).toBeNull();
  expect((screen.getByLabelText('日期') as HTMLSelectElement).disabled).toBe(true);
  fireEvent.click(screen.getByRole('button',{name:'🏪 超商'}));
  expect(screen.queryByRole('heading',{name:'比價與入手標準'})).toBeNull();
  const drugstore = screen.getByRole('button',{name:'💊 藥妝'});
  expect(drugstore.previousElementSibling?.textContent).toBe('🥤 乳清');
  fireEvent.click(drugstore);
  expect(drugstore.getAttribute('aria-pressed')).toBe('true');
  expect(container.querySelectorAll('article')).toHaveLength(0);
  expect(screen.getByText('藥妝清單還是空白，提供商品圖片或名稱後，就會加入這裡。')).toBeTruthy();
});
