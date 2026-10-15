import comparisonsJson from '../data/comparisons.json';
import type { TripItem } from '../types';
import type { ProteinComparison } from '../lib/proteinComparison';
import { useCompletedItems } from '../hooks/useCompletedItems';
const comparisons: ProteinComparison[] = comparisonsJson;
const number = (value: number) => value.toLocaleString('zh-TW');

export function ProteinComparisonCard({item}: {item: TripItem}) {
  const {isCompleted,toggleCompleted} = useCompletedItems();
  const completed = isCompleted(item.id);
  const comparison = comparisons.find(config => config.id === item.comparisonId);
  if (!comparison) return <article className="card p-5"><h3>{item.name}</h3><p>找不到比價設定，請更新清單資料。</p></article>;
  return <article className={`card protein-card p-5 space-y-4 ${completed ? 'purchased' : ''}`}>
    <div className="flex flex-wrap gap-2"><span className="tag">🛍 購物</span><span className="tag">乳清</span></div>
    <h3 className="text-xl font-semibold">{item.name}</h3><p className="muted">{item.notes}</p>
    <h4 className="text-lg font-semibold">比價與入手標準</h4>
    <p>以下為購買簡表的個人入手標準，並非即時售價。巧克力優先；現場確認重量與口味後再決定。</p>
    <div className="protein-candidates">{comparison.candidates.map((candidate,index) => <section className="protein-candidate space-y-2" key={candidate.id}>
      <img className="protein-image" src={`${import.meta.env.BASE_URL}${candidate.image}`} alt={`${candidate.name} 示意插圖`} loading="lazy"/>
      <h4 className="font-semibold">{index+1}. {candidate.name}</h4>
      <p>基準 {candidate.grams}g</p><p className="font-semibold">≤ ¥{number(candidate.targetYen)} 可買</p><p>≤ ¥{number(candidate.bargainYen)} 特別值得</p>
      <p>口味：{candidate.flavors.join(' → ')}</p><p className="muted">{candidate.nutritionNote}</p><p className="muted">{candidate.availability}</p>
    </section>)}</div>
    <p className="muted text-sm">AI 辨識插圖，非官方實拍；實際包裝與規格以門市為準。</p>
    <section className="protein-candidate"><h4 className="font-semibold">{comparison.baseline.name}</h4><p>{comparison.baseline.packageLabel} ≤ NT${number(comparison.baseline.priceTwd)}</p><p className="muted">{comparison.baseline.note}</p></section>
    <label className={`purchase-button ${completed ? 'checked' : ''}`}><input type="checkbox" checked={completed} onChange={() => toggleCompleted(item.id)}/>{completed ? '已購買' : '標記為已購買'}</label>
  </article>;
}
