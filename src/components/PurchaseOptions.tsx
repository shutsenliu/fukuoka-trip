import type { PurchaseOption } from '../types';
export function PurchaseOptions({options}: {options?:PurchaseOption[]}) {
  if(!options?.length)return null;
  return <details className="backup-places"><summary>購買通路</summary><div className="space-y-3 mt-3">{options.map(option=><div className="place-info" key={option.name}><p className="font-semibold">{option.name}</p><p className="muted mt-1">{option.notes}</p></div>)}</div></details>;
}
