// @vitest-environment jsdom
import { afterEach, beforeAll, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { CouponsPage } from './CouponsPage';
beforeAll(() => {
  HTMLDialogElement.prototype.showModal = vi.fn(function (this: HTMLDialogElement) { this.setAttribute('open', ''); });
  HTMLDialogElement.prototype.close = vi.fn(function (this: HTMLDialogElement) { this.removeAttribute('open'); });
});
afterEach(cleanup);
function page(query = '') { render(<MemoryRouter initialEntries={['/coupons' + query]}><CouponsPage/></MemoryRouter>); }
it('searches merchant aliases, clears search and explains empty results', () => {
  page();
  fireEvent.change(screen.getByLabelText('搜尋店家'), { target: { value: 'ＤＯＮＫＩ' } });
  expect(screen.getAllByRole('article')).toHaveLength(1);
  expect(screen.getByRole('link', { name: /開啟優惠券/ }).getAttribute('href')).toContain('japanportal.donki-global.com/coupon/');
  expect(screen.queryByRole('img')).toBeNull();
  fireEvent.change(screen.getByLabelText('搜尋店家'), { target: { value: '不存在的店' } });
  expect(screen.getByText(/找不到符合的店家/)).toBeTruthy();
  fireEvent.click(screen.getByRole('button', { name: '清除搜尋' }));
  expect(screen.getAllByRole('article')).toHaveLength(13);
  expect(screen.queryByText(/最後核對日期|原始網頁連結/)).toBeNull();
});
it('opens the full coupon immediately and restores scroll and focus when closed', () => {
  page('?q=Alpen');
  const opener = screen.getByRole('button', { name: /放大Alpen/ });
  opener.focus();
  fireEvent.click(opener);
  expect(screen.getByRole('dialog')).toBeTruthy();
  expect(document.body.style.overflow).toBe('hidden');
  expect(screen.getByAltText('Alpen Group 原始優惠券')).toBeTruthy();
  expect(screen.queryByRole('button', { name: '放大優惠券' })).toBeNull();
  expect(screen.queryByRole('button', { name: '顯示完整券面' })).toBeNull();
  fireEvent.click(screen.getByRole('button', { name: '關閉' }));
  expect(screen.queryByRole('dialog')).toBeNull();
  expect(document.body.style.overflow).toBe('');
  expect(document.activeElement).toBe(opener);
});
it('keeps regional and travel-date conflicts visible without a misleading image', () => {
  page('?q=鶴羽');
  expect(screen.getByText('需確認')).toBeTruthy();
  expect(screen.queryByRole('img')).toBeNull();
  expect(screen.getByRole('link', { name: /開啟地區券入口/ })).toBeTruthy();
});
