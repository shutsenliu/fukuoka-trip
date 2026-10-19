import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { coupons, matchesCoupon } from '../lib/coupons';
import type { Coupon } from '../lib/coupons';
import { DoodleIcon } from './DoodleIcon';
import { CouponViewer } from './CouponViewer';

const modeLabels = { image: '圖片券', web: '網頁券', counter: '到店辦理', membership: '會員／票根優惠' };
const statusLabels = { 'in-trip': '涵蓋旅期', check: '需確認', 'out-of-trip': '不涵蓋旅期' };

export function CouponsPage() {
  const [params, setParams] = useSearchParams();
  const query = params.get('q') ?? '';
  const [selected, setSelected] = useState<Coupon | null>(null);
  const [failedImages, setFailedImages] = useState<string[]>([]);
  const filtered = coupons.filter(coupon => matchesCoupon(coupon, query));
  function search(value: string) {
    const next = new URLSearchParams(params);
    if (value) next.set('q', value); else next.delete('q');
    setParams(next, { replace: true });
  }
  return <section className="coupons-page">
    <div className="coupon-heading"><h1>優惠券</h1><p className="muted">旅期 2026/12/12–12/17 · 優惠折扣與免稅／退稅分開計算。</p></div>
    <div className="card coupon-search">
      <label htmlFor="coupon-search">搜尋店家</label>
      <div className="coupon-search-input"><input id="coupon-search" type="search" value={query} onChange={event => search(event.target.value)} placeholder="店名，例如 Donki、松本清、Alpen" autoComplete="off"/>{query && <button className="button secondary" onClick={() => search('')}>清除搜尋</button>}</div>
    </div>
    <p className="muted coupon-results" role="status">{filtered.length} 筆優惠券</p>
    <div className="coupon-list">{filtered.map(coupon => <article className="card coupon-card" key={coupon.id}>
      <div className="coupon-card-top">
        <div className="coupon-card-main">
          <div className="coupon-tags"><span className="tag">{modeLabels[coupon.mode]}</span><span className={`tag coupon-status-${coupon.tripStatus}`}>{statusLabels[coupon.tripStatus]}</span></div>
          <h2>{coupon.merchant}</h2><p className="coupon-offer">{coupon.offer}</p>
        </div>
        {coupon.mode === 'image' && coupon.image && <button className="coupon-thumbnail" aria-label={`放大${coupon.merchant}優惠券`} onClick={() => setSelected(coupon)}>
          {failedImages.includes(coupon.id) ? <span>重新開啟券圖</span> : <img src={`${import.meta.env.BASE_URL}${coupon.image}`} alt={`${coupon.merchant} 券圖縮圖`} loading="lazy" onError={() => setFailedImages(current => [...current, coupon.id])}/>}
          <span>點圖放大</span>
        </button>}
        {coupon.mode !== 'image' && <span className="coupon-mode-icon"><DoodleIcon name="coupon"/></span>}
      </div>
      <dl className="coupon-facts"><div><dt>使用期限</dt><dd>{coupon.validity}</dd></div><div><dt>適用店家</dt><dd>{coupon.stores}</dd></div>{coupon.redeemAt && <div><dt>{coupon.mode === 'counter' ? '辦理方式' : '使用方式'}</dt><dd>{coupon.redeemAt}</dd></div>}</dl>
      {coupon.notice && <p className="coupon-notice">{coupon.notice}</p>}
      {coupon.thresholds && <div className="coupon-thresholds">{coupon.thresholds.map(text => <p key={text}>{text}</p>)}</div>}
      <p className="coupon-quick-limit"><strong>主要限制：</strong>{coupon.limits[0]}</p>
      <details className="coupon-conditions"><summary>限制與使用方式</summary><ul>{coupon.limits.map(limit => <li key={limit}>{limit}</li>)}</ul></details>
      {coupon.actionUrl && <a className="button coupon-action" href={coupon.actionUrl} target="_blank" rel="noreferrer">{coupon.actionLabel ?? '開啟優惠券'} ↗</a>}
    </article>)}</div>
    {!filtered.length && <p className="card coupon-empty">找不到符合的店家，試試中文、英文或其他店名。</p>}
    {selected && <CouponViewer key={selected.id} coupon={selected} onClose={() => setSelected(null)}/>}
  </section>;
}
