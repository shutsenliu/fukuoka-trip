// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import type { TripItem, ItemType } from '../types';
import { ItemCard } from './ItemCard';
import { itemLabels } from '../lib/itemLabels';
afterEach(() => { cleanup(); localStorage.clear(); window.dispatchEvent(new StorageEvent('storage', { key: null })); });
describe('trip goal completion', () => {
  for (const type of ['shopping','food'] as ItemType[]) {
    it(`renders and persists ${type} completion across backup places`, () => {
      const item: TripItem = { id: `test-${type}`, name: '測試目標', type, category: '測試', priority: 3, image: 'items/placeholder.svg', notes: '測試備註', placeIds: ['hoka','beams'] };
      const view = render(<MemoryRouter><ItemCard item={item}/></MemoryRouter>);
      expect(screen.getByText(`標記為${itemLabels[type].done}`)).toBeTruthy();
      fireEvent.click(screen.getByRole('checkbox'));
      expect(screen.getByText(itemLabels[type].done)).toBeTruthy();
      expect(JSON.parse(localStorage.getItem('fukuoka-trip-completed-items')!)).toContain(item.id);
      expect(screen.queryByRole('link')).toBeNull();
      fireEvent.click(screen.getByText('其他可買／吃到的地點（1）'));
      expect(screen.getByText('📍 BEAMS 福岡')).toBeTruthy();
      view.unmount();
      render(<MemoryRouter><ItemCard item={item}/></MemoryRouter>);
      expect((screen.getByRole('checkbox') as HTMLInputElement).checked).toBe(true);
    });
  }
  it('reads legacy purchase records without losing completion state', () => {
    localStorage.setItem('fukuoka-trip-purchased-items', JSON.stringify(['legacy']));
    window.dispatchEvent(new StorageEvent('storage', { key: null }));
    const item: TripItem = { id: 'legacy', name: '測試', type: 'food', category: '點心', priority: 3, image: 'items/placeholder.svg', notes: '', placeIds: ['fullfull'] };
    render(<MemoryRouter><ItemCard item={item}/></MemoryRouter>);
    expect((screen.getByRole('checkbox') as HTMLInputElement).checked).toBe(true);
    fireEvent.click(screen.getByRole('checkbox'));
    expect(JSON.parse(localStorage.getItem('fukuoka-trip-completed-items')!)).toEqual([]);
  });
});
