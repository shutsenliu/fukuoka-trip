// @vitest-environment jsdom
import { afterEach, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { TaxRefundPage } from './TaxRefundPage';
afterEach(() => { cleanup(); vi.restoreAllMocks(); });
it('keeps airport stages and locations distinct with collapsed extra instructions', () => {
  const { container } = render(<TaxRefundPage/>);
  expect(screen.getByText('海關確認前，商品不要先託運。')).toBeTruthy();
  expect(screen.getByText('3F 南側 J～M 櫃檯前')).toBeTruthy();
  expect(screen.getByText('3F 管制區 HAKATA FOOD HALL 入口旁')).toBeTruthy();
  expect(screen.getByText('機台 06:00–21:00／櫃台 07:00–21:00')).toBeTruthy();
  expect([...container.querySelectorAll('details')].every(el => !el.open)).toBe(true);
});
it('searches store aliases without claiming guaranteed merchant participation', () => {
  render(<TaxRefundPage/>);
  fireEvent.change(screen.getByLabelText('搜尋店家或公司'), { target: { value: 'ＵＮＩＱＬＯ' } });
  expect(screen.getByRole('heading', { name: 'J-TaxRefund（J&J）' })).toBeTruthy();
  expect(screen.queryByRole('heading', { name: 'Global Blue' })).toBeNull();
  expect(screen.getByText('店家對應：結帳時確認')).toBeTruthy();
  fireEvent.change(screen.getByLabelText('搜尋店家或公司'), { target: { value: '松本清' } });
  expect(screen.getByRole('heading', { name: 'J-TaxRefund（J&J）' })).toBeTruthy();
  fireEvent.change(screen.getByLabelText('搜尋店家或公司'), { target: { value: '沒有的店家' } });
  expect(screen.getByText(/查不到不代表無法退稅/)).toBeTruthy();
  fireEvent.click(screen.getByRole('button', { name: '清除搜尋' }));
  expect(screen.getByText('4 家退稅公司')).toBeTruthy();
});
it('copies airport wifi accurately and explains clipboard failure', async () => {
  const writeText = vi.fn().mockResolvedValue(undefined);
  Object.defineProperty(navigator, 'clipboard', { value: { writeText }, configurable: true });
  render(<TaxRefundPage/>);
  fireEvent.click(screen.getByText('改用 VJW：海關專用 Wi-Fi'));
  fireEvent.click(screen.getByRole('button', { name: '複製名稱' }));
  await waitFor(() => expect(writeText).toHaveBeenCalledWith('Customs_WiFi_For_TaxRefund'));
  await screen.findByText('已複製Wi-Fi 名稱');
  writeText.mockRejectedValueOnce(new Error('denied'));
  fireEvent.click(screen.getByRole('button', { name: '複製密碼' }));
  await screen.findByText('無法自動複製，請長按下方文字複製。');
  expect(screen.getByText('jcustoms')).toBeTruthy();
});
it('does not route unsupported PIE VAT refunds to Cash JAPAN', () => {
  render(<TaxRefundPage/>);
  fireEvent.change(screen.getByLabelText('搜尋店家或公司'), { target: { value: 'PIE VAT' } });
  expect(screen.getByText('未確認支援福岡機場現金機台')).toBeTruthy();
  expect(screen.getByText(/勿預設可到 Cash JAPAN 領現/)).toBeTruthy();
});
