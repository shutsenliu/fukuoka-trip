import { useEffect, useRef, useState } from 'react';
import type { Coupon } from '../lib/coupons';

export function CouponViewer({ coupon, onClose }: { coupon: Coupon; onClose: () => void }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
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
    <div className="coupon-viewer-image">
      {failed ? <p role="alert">券圖載入失敗，請關閉後重新開啟。</p> : <img src={`${import.meta.env.BASE_URL}${coupon.image}`} alt={`${coupon.merchant} 原始優惠券`} onError={() => setFailed(true)}/>}
    </div>
  </dialog>;
}
