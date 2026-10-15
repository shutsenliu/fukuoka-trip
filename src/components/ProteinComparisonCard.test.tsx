// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import { ProteinComparisonCard } from './ProteinComparisonCard';
import { items } from '../lib/data';
const item = items.find(item => item.id === 'whey-protein-comparison')!;
const key = 'fukuoka-trip-price-comparison-whey-protein';
afterEach(() => {cleanup();localStorage.clear();window.dispatchEvent(new StorageEvent('storage',{key:null}));vi.restoreAllMocks();});
function record(brand: string, grams: string, price: string, store: string, net?: string) {
  fireEvent.click(screen.getByRole('button',{name:'記錄現場價格'}));
  fireEvent.change(screen.getByLabelText('品牌'),{target:{value:brand}});
  fireEvent.change(screen.getByLabelText('實際重量（g）'),{target:{value:grams}});
  fireEvent.change(screen.getByLabelText('店家／分店'),{target:{value:store}});
  fireEvent.change(screen.getByLabelText('含稅售價（¥）'),{target:{value:price}});
  if(net) fireEvent.change(screen.getByLabelText('實際免稅報價（¥，選填）'),{target:{value:net}});
  fireEvent.click(screen.getByRole('button',{name:'儲存價格'}));
}
it('persists multiple quotes, selects one purchase, edits it and restores pending when deleted', () => {
  const view = render(<ProteinComparisonCard item={item}/>);
  expect(screen.getAllByRole('img')).toHaveLength(3);
  record('savas','800','3800','博多 A');
  expect(screen.getByText('規格不同，請比較每 100g 單價')).toBeTruthy();
  record('winzone','1000','3600','天神 B','3500');
  const section = screen.getByRole('region',{name:'WINZONE Whey 天神 B 價格紀錄'});
  expect(within(section).getByText('達到特別值得門檻')).toBeTruthy();
  fireEvent.change(screen.getByLabelText(/日圓換台幣匯率/),{target:{value:'0.21'}});
  fireEvent.click(within(section).getByRole('button',{name:'這款已購買'}));
  expect(JSON.parse(localStorage.getItem('fukuoka-trip-completed-items')!)).toEqual([item.id]);
  view.unmount();render(<ProteinComparisonCard item={item}/>);
  expect(screen.getByText('✓ 已購買這款')).toBeTruthy();
  expect(JSON.parse(localStorage.getItem(key)!).records).toHaveLength(2);
  const restored = screen.getByRole('region',{name:'WINZONE Whey 天神 B 價格紀錄'});
  fireEvent.click(within(restored).getByRole('button',{name:'編輯'}));
  fireEvent.change(screen.getByLabelText('實際重量（g）'),{target:{value:'900'}});
  fireEvent.click(screen.getByRole('button',{name:'儲存價格'}));
  expect(within(restored).getByText('規格不同，請比較每 100g 單價')).toBeTruthy();
  fireEvent.click(within(restored).getByRole('button',{name:'刪除紀錄'}));
  expect(screen.getByText('尚未決定')).toBeTruthy();
  expect(JSON.parse(localStorage.getItem('fukuoka-trip-completed-items')!)).toEqual([]);
});
it('retains entered quotes in memory and reports blocked storage', () => {
  render(<ProteinComparisonCard item={item}/>);
  vi.spyOn(Storage.prototype,'setItem').mockImplementation(()=>{throw new Error('blocked');});
  record('winzone','1000','3800','店家');
  expect(screen.getByRole('alert').textContent).toContain('無法儲存');
  expect(screen.getByText('店家 · 1,000g')).toBeTruthy();
});
