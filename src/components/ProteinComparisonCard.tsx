import { useState } from 'react';
import comparisonsJson from '../data/comparisons.json';
import type { TripItem } from '../types';
import type { PriceRecord, ProteinComparison } from '../lib/proteinComparison';
import { paidPrice, pricePer100g, targetLabel } from '../lib/proteinComparison';
import { usePriceComparison } from '../hooks/usePriceComparison';
import { useCompletedItems } from '../hooks/useCompletedItems';
import { PriceRecordForm } from './PriceRecordForm';
const comparisons: ProteinComparison[] = comparisonsJson;
const number = (value: number) => value.toLocaleString('zh-TW',{maximumFractionDigits: 2});
const imageUrl = (path: string) => `${import.meta.env.BASE_URL}${path}`;

export function ProteinComparisonCard({item}: {item: TripItem}) {
  const comparison = comparisons.find(config => config.id === item.comparisonId);
  if (!comparison) return <article className="card p-5"><h3>{item.name}</h3><p>找不到比價設定，請更新清單資料。</p></article>;
  return <ComparisonContent key={comparison.id} item={item} comparison={comparison}/>;
}
function ComparisonContent({item,comparison}: {item: TripItem; comparison: ProteinComparison}) {
  const {state,save,storageError} = usePriceComparison(comparison.id);
  const {isCompleted,toggleCompleted} = useCompletedItems();
  const completed = isCompleted(item.id);
  const [form,setForm] = useState<PriceRecord | 'new' | undefined>();
  const selected = state.records.find(record => record.id === state.selectedRecordId);
  const records = state.records.filter(record => comparison.candidates.some(candidate => candidate.id === record.candidateId)).slice().sort((a,b) => pricePer100g(a)-pricePer100g(b));
  const baselineUnit = comparison.baseline.priceTwd / comparison.baseline.grams * 100;
  function storeRecord(record: PriceRecord) {
    save({...state,records: state.records.some(old => old.id === record.id) ? state.records.map(old => old.id === record.id ? record : old) : [...state.records,record]});setForm(undefined);
  }
  function choose(record: PriceRecord) {
    save({...state,selectedRecordId: record.id});
    if (!completed) toggleCompleted(item.id);
  }
  function remove(record: PriceRecord) {
    const wasSelected = state.selectedRecordId === record.id;
    save({...state,records: state.records.filter(old => old.id !== record.id),selectedRecordId: wasSelected ? undefined : state.selectedRecordId});
    if (wasSelected && completed) toggleCompleted(item.id);
    if (form !== 'new' && form?.id === record.id) setForm(undefined);
  }
  return <article className={`card protein-card p-5 space-y-4 ${completed ? 'purchased' : ''}`}>
    <div className="flex flex-wrap gap-2"><span className="tag">🛍 購物</span><span className="tag">{item.category}</span><span className="tag">{completed ? '已購買' : '尚未決定'}</span></div>
    <h3 className="text-xl font-semibold">{item.name}</h3><p className="muted">{item.notes}</p>
    <div className="protein-previews">{comparison.candidates.map(candidate => <div key={candidate.id}><img src={imageUrl(candidate.image)} alt={`${candidate.name} 示意插圖`} loading="lazy"/><p>{candidate.name}</p></div>)}</div>
    <p className="muted text-sm">AI 辨識插圖，非官方實拍；包裝、重量與口味以現場為準。</p>
    <details className="protein-details"><summary>查看比價與入手標準</summary><div className="space-y-4 mt-3"><p>以下門檻來自你的購買簡表，是個人入手標準，並非即時售價。巧克力優先。</p>{comparison.candidates.map((candidate,index) => <section className="protein-candidate" key={candidate.id}>
      <h4 className="font-semibold">{index+1}. {candidate.name}</h4><p>基準 {candidate.grams}g：≤ ¥{number(candidate.targetYen)} 可買；≤ ¥{number(candidate.bargainYen)} 特別值得。</p>
      <p>口味：{candidate.flavors.join(' → ')}</p><p className="muted">{candidate.nutritionNote}</p><p className="muted">{candidate.availability}</p>
    </section>)}<section className="protein-candidate"><h4 className="font-semibold">{comparison.baseline.name}</h4><p>{comparison.baseline.packageLabel} ≤ NT${number(comparison.baseline.priceTwd)}，約 NT${number(baselineUnit)}／100g。</p><p className="muted">{comparison.baseline.note}</p></section></div></details>
    {storageError && <p role="alert">無法儲存比價紀錄，目前內容可能在重新整理後遺失；請允許瀏覽器使用本機儲存空間。</p>}
    <button className="button" onClick={() => setForm('new')}>記錄現場價格</button>
    {form && <PriceRecordForm key={form === 'new' ? 'new' : form.id} candidates={comparison.candidates} initial={form === 'new' ? undefined : form} onSave={storeRecord} onCancel={() => setForm(undefined)}/>}
    <label className="exchange-rate">日圓換台幣匯率（選填，1 日圓＝多少台幣）<input type="number" inputMode="decimal" min="0.000001" step="any" value={state.exchangeRate ?? ''} onChange={event => { const value = Number(event.target.value); save({...state,exchangeRate: Number.isFinite(value) && value > 0 ? value : undefined}); }}/></label>
    <p className="muted">匯率自行填寫，不自動查詢。所有紀錄依每 100g 單價排序；有填免稅報價時，以該報價比較。</p>
    {!records.length && <p>還沒有現場報價，路過店家時再記錄。福岡分店庫存尚未確認，先不綁行程。</p>}
    <div className="space-y-3">{records.map(record => {
      const candidate = comparison.candidates.find(entry => entry.id === record.candidateId)!;
      const chosen = selected?.id === record.id;
      return <section className="price-record" key={record.id} aria-label={`${candidate.name} ${record.store} 價格紀錄`}>
        <h4 className="font-semibold">{candidate.name} · {record.flavor}</h4><p>{record.store} · {number(record.grams)}g</p>
        <p>含稅 ¥{number(record.priceYen)}{record.taxFreeYen !== undefined && `／實際免稅報價 ¥${number(record.taxFreeYen)}`}</p><p className="font-semibold">¥{number(pricePer100g(record))}／100g（{record.taxFreeYen !== undefined ? '依免稅報價' : '依含稅價'}）</p>
        <p>{targetLabel(record,candidate)}</p>
        {state.exchangeRate && <p>約 NT${number(paidPrice(record)*state.exchangeRate)}／袋，NT${number(pricePer100g(record)*state.exchangeRate)}／100g；{pricePer100g(record)*state.exchangeRate <= baselineUnit ? '低於或等於' : '高於'} {comparison.baseline.name} 入手基準單價。此處只比較價格，非營養等值。</p>}
        {chosen && <p className="font-semibold">{completed ? '✓ 已購買這款' : '上次選擇，尚未完成購買'}</p>}
        <div className="flex flex-wrap gap-2"><button className="button" disabled={chosen && completed} onClick={() => choose(record)}>這款已購買</button><button className="button secondary" onClick={() => setForm(record)}>編輯</button><button className="button secondary" onClick={() => remove(record)}>刪除紀錄</button></div>
      </section>;
    })}</div>
    {completed && <button className="button secondary" onClick={() => toggleCompleted(item.id)}>取消已購買，繼續比較</button>}
    <p className="muted">這組只算 1 項待買；選定一款就完成。報價與選擇只存在此瀏覽器，不跨裝置同步。</p>
  </article>;
}
