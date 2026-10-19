import { useEffect, useRef, useState } from 'react';
import type { Coupon } from '../lib/coupons';

export function CouponViewer({ coupon, onClose }: { coupon: Coupon; onClose: () => void }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [zoom, setZoom] = useState(1);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    const previousFocus = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    dialog.showModal();
    return () => {
      dialog.close();
      document.body.style.overflow = previousOverflow;
      if (previousFocus instanceof HTMLElement && previousFocus.isConnected) previousFocus.focus();
    };
  }, []);
  return <dialog ref={dialogRef} className="coupon-viewer" aria-labelledby="coupon-viewer-title" onCancel={event => { event.preventDefault(); onClose(); }}>
    <div className="coupon-viewer-header">
      <h2 id="coupon-viewer-title">{coupon.merchant}</h2>
      <button className="button secondary" onClick={onClose} autoFocus>關閉</button>
    </div>
    {coupon.notice && <p className="coupon-viewer-notice">{coupon.notice}</p>}
    <div className="coupon-zoom" aria-label="券圖縮放">
      <button onClick={() => setZoom(value => Math.max(1, value - 0.5))} disabled={zoom === 1} aria-label="縮小優惠券">−</button>
      <button onClick={() => setZoom(1)} aria-label="顯示完整券面">{zoom === 1 ? '完整券面' : `${Math.round(zoom * 100)}% · 重設`}</button>
      <button onClick={() => setZoom(value => Math.min(3, value + 0.5))} disabled={zoom === 3} aria-label="放大優惠券">＋</button>
    </div>
    <div className={`coupon-viewer-image ${zoom > 1 ? 'is-zoomed' : ''}`}>
      {failed ? <p role="alert">券圖載入失敗，請關閉後重新開啟。</p> : <img src={`${import.meta.env.BASE_URL}${coupon.image}`} alt={`${coupon.merchant} 原始優惠券`} style={zoom > 1 ? { width: `${zoom * 100}%` } : undefined} onError={() => setFailed(true)}/>}
    </div>
  </dialog>;
}
