export interface ProteinCandidate {
  id: string; name: string; image: string; flavors: string[]; grams: number;
  targetYen: number; bargainYen: number; nutritionNote: string; availability: string; sourceUrls: string[];
}
export interface ProteinComparison {
  id: string; candidates: ProteinCandidate[];
  baseline: { name: string; packageLabel: string; grams: number; priceTwd: number; note: string };
}
