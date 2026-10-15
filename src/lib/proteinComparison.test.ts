import { expect, it } from 'vitest';
import { paidPrice, parseComparison, pricePer100g, targetLabel } from './proteinComparison';
import type { PriceRecord } from './proteinComparison';
import config from '../data/comparisons.json';
const quote: PriceRecord = {id:'quote',candidateId:'savas',flavor:'Chocolate',store:'測試店',grams:980,priceYen:3800,savedAt:'2026-12-12'};
it('compares actual weights and only applies thresholds to matching package sizes', () => {
  const savas = config[0].candidates.find(item => item.id === 'savas')!;
  expect(pricePer100g(quote)).toBeCloseTo(387.755);
  expect(targetLabel(quote,savas)).toBe('達到入手門檻');
  expect(targetLabel({...quote,grams:800},savas)).toContain('規格不同');
  const net = {...quote,taxFreeYen:3500};
  expect(paidPrice(net)).toBe(3500);
  expect(targetLabel(net,savas)).toBe('達到特別值得門檻');
});
it('recovers malformed storage, rejects invalid arithmetic and stale selections', () => {
  expect(parseComparison('{')).toEqual({records:[]});
  expect(parseComparison(JSON.stringify({records:[quote,{...quote,id:'bad',grams:0},{...quote,id:'badnet',taxFreeYen:5000}],selectedRecordId:'missing',exchangeRate:-1}))).toEqual({records:[quote],selectedRecordId:undefined,exchangeRate:undefined});
});
