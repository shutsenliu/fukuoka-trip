import { useRef, useState } from 'react';
import type { TripDay } from '../types';
import { parseItineraryMarkdown } from '../lib/markdown';
export function ItineraryImport({ onApply, onReset, overridden }: { onApply: (days: TripDay[]) => void; onReset: () => void; overridden: boolean }) {
  const [preview, setPreview] = useState<TripDay[]>([]);
  const [message, setMessage] = useState('');
  const input = useRef<HTMLInputElement>(null);
  return <details className="card p-5 my-6"><summary className="font-semibold cursor-pointer">更新行程 · 匯入 .md</summary><div className="space-y-4 mt-4">
    <p className="muted">只更新此瀏覽器，購買狀態不變。未包含的日期會保留。要讓所有裝置更新，請在 Codex 對話上傳新版檔案。</p>
    <p className="muted">格式：## 12/16 Day 5：購物日<br/>- 09:30 - 11:30｜博多站購物<br/>後續文字會保留為備註。</p>
    <input ref={input} aria-label="選擇新版行程 Markdown" type="file" accept=".md,.markdown,text/markdown,text/plain" onChange={async event => {
      setPreview([]); setMessage(''); const file = event.target.files?.[0]; if (!file) return;
      if (file.size > 1_000_000) { setMessage('檔案請小於 1 MB。'); return; }
      try { setPreview(parseItineraryMarkdown(await file.text())); } catch (error) { setMessage(error instanceof Error ? error.message : '無法讀取檔案'); }
    }}/>
    {!!preview.length && <div className="space-y-3"><p>即將更新 {preview.length} 天：</p>{preview.map(day => <p key={day.id}>Day {day.day} · {day.title}（{day.stops.length} 站）</p>)}<button className="button" onClick={() => { onApply(preview); setPreview([]); setMessage('已套用。若瀏覽器無法儲存，重新整理後會恢復。'); if (input.current) input.current.value = ''; }}>確認套用行程</button></div>}
    {overridden && <button className="button secondary" onClick={() => { if (window.confirm('恢復 repo 內的原始行程？')) { onReset(); setPreview([]); setMessage('已恢復原始行程。'); } }}>恢復原始行程</button>}
    <p role="status">{message}</p>
  </div></details>;
}
