// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, expect, it } from 'vitest';
import { ProteinComparisonCard } from './ProteinComparisonCard';
import { items } from '../lib/data';
afterEach(() => {cleanup();localStorage.clear();window.dispatchEvent(new StorageEvent('storage',{key:null}));});
it('shows all standards and images immediately without quote or conversion controls', () => {
  const item = items.find(item => item.comparisonId === 'whey-protein')!;
  const view = render(<ProteinComparisonCard item={item}/>);
  expect(screen.getByRole('heading',{name:'比價與入手標準'})).toBeTruthy();
  expect(screen.getAllByRole('img')).toHaveLength(3);
  expect(view.container.querySelector('details')).toBeNull();
  expect(screen.queryByText('記錄現場價格')).toBeNull();
  expect(screen.queryByRole('spinbutton')).toBeNull();
  fireEvent.click(screen.getByRole('checkbox'));
  view.unmount();render(<ProteinComparisonCard item={item}/>);
  expect((screen.getByRole('checkbox') as HTMLInputElement).checked).toBe(true);
});
