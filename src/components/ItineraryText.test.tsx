// @vitest-environment jsdom
import { cleanup, render } from '@testing-library/react';
import { afterEach, expect, it } from 'vitest';
import { ItineraryText } from './ItineraryText';
afterEach(cleanup);
it('preserves nested lists, emphasis and Japanese phrases as readable content', () => {
  const {container} = render(<ItineraryText>{'### 必帶\n\n* **護照**\n  * 電子憑證\n\n`白やベージュ系はありますか？`'}</ItineraryText>);
  expect(container.querySelector('strong')?.textContent).toBe('護照');
  expect(container.querySelector('ul ul')?.textContent).toContain('電子憑證');
  expect(container.querySelector('code')?.textContent).toContain('ベージュ');
});
it('does not render raw HTML, embedded images or executable links from documents', () => {
  const {container} = render(<ItineraryText>{'<script>alert(1)</script>\n\n![preview](https://example.com/a.png)\n\n[unsafe](javascript:alert%281%29)'}</ItineraryText>);
  expect(container.querySelector('script, img')).toBeNull();
  expect(container.querySelector('a')?.getAttribute('href') ?? '').not.toContain('javascript:');
});
