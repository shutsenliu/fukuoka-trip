import { useState } from 'react';
import data from '../data/taxRefund.json';
const normalized = (text: string) => text.normalize('NFKC').toLowerCase().replace(/[\s\p{P}\p{S}]/gu, '');
export function TaxRefundPage() {
  const [query, setQuery] = useState('');
  const [copyStatus, setCopyStatus] = useState('');
  const filtered = data.companies.filter(company => query.trim().split(/\s+/).filter(Boolean).every(term => normalized([company.name, ...company.aliases].join(' ')).includes(normalized(term))));
  async function copy(value: string, label: string) {
    try { await navigator.clipboard.writeText(value); setCopyStatus(`已複製${label}`); }
    catch { setCopyStatus('無法自動複製，請長按下方文字複製。'); }
  }
  return <section className="tax-page">
    <h1>退稅</h1>
    <p className="muted tax-intro">12/17 福岡出境 · 領取日圓現金</p>
    <p className="tax-important">先付含稅價 → 出境海關確認 → 領退稅款。<strong>海關確認前，商品不要先託運。</strong></p>
    <section aria-labelledby="tax-flow-title"><h2 id="tax-flow-title">回程怎麼辦</h2><div className="tax-steps">
      <article className="card"><span className="tag">① 託運前</span><h3>海關確認</h3><p>在海關 KIOSK 掃護照；也可用 VJW 連接專用 Wi-Fi 辦理。</p><details><summary>看操作重點</summary><p>帶齊退稅商品、購物時使用的護照及憑證。未在店內完成免稅登記的商品，不能只到機場補辦退稅。</p></details></article>
      <article className="card"><span className="tag">② 看判定</span><h3>GREEN 完成／RED 查驗</h3><p>GREEN 可往報到、託運；RED 先到旁邊海關檢查區。</p><details><summary>看操作重點</summary><p>RED 時出示護照及需查驗的商品，完成確認後再託運。海關確認機不是領現金的機器。</p></details></article>
      <article className="card"><span className="tag">③ 出境審查後</span><h3>Cash JAPAN 領現金</h3><p>掃護照、核對符合現金退款資格的交易，依畫面領取日圓。</p><details><summary>看操作重點</summary><p>購物後先依店家／業者指示設定現金退款；必要時出示退款 QR Code。是否可領、金額及手續費以交易與機台顯示為準。</p></details></article>
    </div></section>
    <section aria-labelledby="tax-airport-title"><h2 id="tax-airport-title">福岡機場去哪辦</h2><div className="tax-locations">
      <article className="card"><h3>託運前：海關 KIOSK</h3><p>國際線 <strong>3F 南側 J～M 櫃檯前</strong></p><p className="muted">06:00–21:00 · RED 檢查區在 KIOSK 旁</p></article>
      <article className="card"><h3>出境後：Cash JAPAN</h3><p>國際線 <strong>3F 管制區 HAKATA FOOD HALL 入口旁</strong></p><p className="muted">機台 06:00–21:00／櫃台 07:00–21:00</p></article>
    </div><details className="card tax-wifi"><summary>改用 VJW：海關專用 Wi-Fi</summary><p>只在國際線 3F 出發大廳內連接，進安檢前辦理。VJW 需先完成帳號與旅客資料設定。</p><div className="tax-copy"><div><span>Wi-Fi 名稱</span><code>{data.wifi.ssid}</code></div><button className="button secondary" onClick={() => copy(data.wifi.ssid, 'Wi-Fi 名稱')}>複製名稱</button></div><div className="tax-copy"><div><span>密碼</span><code>{data.wifi.password}</code></div><button className="button secondary" onClick={() => copy(data.wifi.password, '密碼')}>複製密碼</button></div><a className="button secondary" href="https://www.vjw.digital.go.jp/" target="_blank" rel="noreferrer">開啟 Visit Japan Web ↗</a><p role="status">{copyStatus}</p></details></section>
    <section aria-labelledby="tax-search-title"><h2 id="tax-search-title">查店家／退稅公司</h2><div className="card coupon-search"><label htmlFor="tax-search">搜尋店家或公司</label><div className="coupon-search-input"><input id="tax-search" type="search" placeholder="例如 UNIQLO、GU、松本清、Global Blue" value={query} onChange={event => setQuery(event.target.value)}/>{query && <button className="button secondary" onClick={() => setQuery('')}>清除搜尋</button>}</div></div><p role="status" className="muted">{filtered.length} 家退稅公司</p><div className="tax-company-list">{filtered.map(company => <article className="card" key={company.id}><span className="tag">店家對應：結帳時確認</span><h3>{company.name}</h3><p>{company.stores}</p><dl className="coupon-facts"><div><dt>福岡領現</dt><dd>{company.cash}</dd></div><div><dt>退款設定</dt><dd>{company.qr}</dd></div></dl></article>)}</div>{!filtered.length && <p className="card tax-empty">找不到對應資料，請查看收據／退稅憑證，或向店員確認。查不到不代表無法退稅。</p>}</section>
    <section className="tax-faq" aria-labelledby="tax-faq-title"><h2 id="tax-faq-title">常見問題</h2>
      <details className="card"><summary>一定要用 Visit Japan Web 嗎？</summary><p>不用。店內可出示實體護照；機場可用海關 KIOSK 掃護照。海關 KIOSK 與 VJW 線上確認二選一，領現金仍需另外到 Cash JAPAN。</p></details>
      <details className="card"><summary>三種 QR Code／掃碼差在哪？</summary><ul><li>VJW 免稅購物 QR Code：支援店家可用來登記購物，不能使用截圖。</li><li>店家／業者退款 QR Code：設定退款方式、登記資訊，依業者要求。</li><li>機場海關確認：KIOSK 掃護照，或 VJW 線上辦理；與現金領款分開。</li></ul></details>
      <details className="card"><summary>購物門檻與商品要注意什麼？</summary><p>每店每日合計未稅滿 ¥5,000，並在店內辦理免稅登記。購買後 90 天內出境確認；退稅商品須帶出日本，食品、飲料與化妝品等若已在日本消耗使用，不符合退稅資格。</p></details>
      <details className="card"><summary>Cash JAPAN 和 Self Tax Refund 怎麼選？</summary><p>福岡機場已確認 Cash JAPAN，合作業者為 Global Blue、J&J Tax Free、JPrefund。Self Tax Refund 在福岡未確認設置，不安排到該機台領現。PIE VAT 未列入 Cash JAPAN 合作名單，請另向業者確認退款方式。</p></details>
      <details className="card"><summary>一定能領現？會收手續費嗎？</summary><p>先確認該筆交易有現金退款資格，並完成業者要求的設定及海關確認。可能收取服務費，實領金額以業者／機台顯示為準；別只憑店名判斷。</p></details>
    </section>
  </section>;
}
