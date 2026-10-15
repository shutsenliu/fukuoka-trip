export interface ProteinCandidate {
  id: string; name: string; image: string; flavors: string[]; grams: number;
  targetYen: number; bargainYen: number; nutritionNote: string; availability: string; sourceUrls: string[];
}
export interface ProteinComparison {
  id: string; candidates: ProteinCandidate[];
  baseline: { name: string; packageLabel: string; grams: number; priceTwd: number; note: string };
}
export interface PriceRecord {
  id: string; candidateId: string; flavor: string; grams: number; store: string;
  priceYen: number; taxFreeYen?: number; savedAt: string;
}
export interface ComparisonState { records: PriceRecord[]; selectedRecordId?: string; exchangeRate?: number }
export const paidPrice = (record: PriceRecord) => record.taxFreeYen ?? record.priceYen;
export const pricePer100g = (record: PriceRecord) => paidPrice(record) / record.grams * 100;
export function targetLabel(record: PriceRecord, candidate: ProteinCandidate): string {
  if (record.grams !== candidate.grams) return '規格不同，請比較每 100g 單價';
  const price = paidPrice(record);
  return price <= candidate.bargainYen ? '達到特別值得門檻' : price <= candidate.targetYen ? '達到入手門檻' : '高於入手門檻';
}
const object = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null;
const positive = (value: unknown): value is number => typeof value === 'number' && Number.isFinite(value) && value > 0;
export function parseComparison(raw: string | null): ComparisonState {
  try {
    const value: unknown = JSON.parse(raw ?? '{}');
    if (!object(value)) return {records: []};
    const records: PriceRecord[] = [];
    const entries: unknown[] = Array.isArray(value.records) ? value.records : [];
    for (const record of entries) {
      if (!object(record) || !['id','candidateId','flavor','store','savedAt'].every(key => typeof record[key] === 'string' && (record[key] as string).trim()) || !positive(record.grams) || !positive(record.priceYen)) continue;
      if (record.taxFreeYen !== undefined && (!positive(record.taxFreeYen) || record.taxFreeYen > record.priceYen)) continue;
      records.push({id: String(record.id), candidateId: String(record.candidateId), flavor: String(record.flavor), store: String(record.store), grams: record.grams, priceYen: record.priceYen, taxFreeYen: record.taxFreeYen as number | undefined, savedAt: String(record.savedAt)});
    }
    return {records, selectedRecordId: records.some(record => record.id === value.selectedRecordId) ? String(value.selectedRecordId) : undefined, exchangeRate: positive(value.exchangeRate) ? value.exchangeRate : undefined};
  } catch { return {records: []}; }
}
