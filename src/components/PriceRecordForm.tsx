import { useState } from 'react';
import type { FormEvent } from 'react';
import type { PriceRecord, ProteinCandidate } from '../lib/proteinComparison';

export function PriceRecordForm({ candidates, initial, onSave, onCancel }: {
  candidates: ProteinCandidate[]; initial?: PriceRecord; onSave: (record: PriceRecord) => void; onCancel: () => void;
}) {
  const [candidateId,setCandidateId] = useState(initial?.candidateId ?? candidates[0].id);
  const [flavor,setFlavor] = useState(initial?.flavor ?? candidates[0].flavors[0]);
  const [grams,setGrams] = useState(initial ? String(initial.grams) : '');
  const [store,setStore] = useState(initial?.store ?? '');
  const [price,setPrice] = useState(initial ? String(initial.priceYen) : '');
  const [taxFree,setTaxFree] = useState(initial?.taxFreeYen ? String(initial.taxFreeYen) : '');
  const [error,setError] = useState('');
  const candidate = candidates.find(item => item.id === candidateId)!;
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const weight = Number(grams), gross = Number(price), net = taxFree ? Number(taxFree) : undefined;
    if (!flavor.trim() || !store.trim() || !Number.isFinite(weight) || weight <= 0 || !Number.isFinite(gross) || gross <= 0 || (net !== undefined && (!Number.isFinite(net) || net <= 0 || net > gross))) {
      setError('請填口味、店家、正確重量與價格；免稅報價不能高於含稅售價。'); return;
    }
    onSave({id: initial?.id ?? crypto.randomUUID(), candidateId, flavor: flavor.trim(), store: store.trim(), grams: weight, priceYen: gross, taxFreeYen: net, savedAt: new Date().toISOString()});
  }
  return <form className="price-form" onSubmit={submit}>
    <h4 className="font-semibold">{initial ? '編輯價格紀錄' : '記錄現場價格'}</h4>
    <label>品牌<select aria-label="品牌" value={candidateId} onChange={event => { const next = candidates.find(item => item.id === event.target.value)!; setCandidateId(next.id); setFlavor(next.flavors[0]); }}>{candidates.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
    <label>口味<input required maxLength={100} value={flavor} onChange={event => setFlavor(event.target.value)} list="protein-flavors"/></label>
    <datalist id="protein-flavors">{candidate.flavors.map(name => <option key={name} value={name}/>)}</datalist>
    <label>實際重量（g）<input required type="number" inputMode="decimal" min="1" step="any" value={grams} onChange={event => setGrams(event.target.value)} placeholder="依現場包裝填寫"/></label>
    <label>店家／分店<input required maxLength={100} value={store} onChange={event => setStore(event.target.value)} placeholder="例如：博多站某分店"/></label>
    <label>含稅售價（¥）<input required type="number" inputMode="decimal" min="1" step="any" value={price} onChange={event => setPrice(event.target.value)}/></label>
    <label>實際免稅報價（¥，選填）<input type="number" inputMode="decimal" min="1" step="any" value={taxFree} onChange={event => setTaxFree(event.target.value)}/></label>
    <p className="muted">只記錄店員或標價確認的報價，不自動扣稅。重量與口味請看手上的包裝。</p>
    {error && <p role="alert">{error}</p>}
    <div className="flex flex-wrap gap-2"><button className="button" type="submit">儲存價格</button><button className="button secondary" type="button" onClick={onCancel}>取消</button></div>
  </form>;
}
