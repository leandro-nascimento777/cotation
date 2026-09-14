import { legKind, LegKind, QuoteItem } from "./types";

export interface QuoteItemGroup {
  kind: LegKind;
  label: string;
  items: QuoteItem[];
}

const LABELS: Record<LegKind, string> = {
  combo: "Ida e volta",
  ida: "Ida",
  volta: "Volta",
};

/** Agrupa uma lista de itens (ex: os selecionados) em até 3 grupos —
 * combos (ida+volta com 1 preço), só ida e só volta — na ordem em que devem
 * aparecer no WhatsApp/PDF. Grupos vazios não entram no resultado. */
export function groupQuoteItems(items: QuoteItem[]): QuoteItemGroup[] {
  const buckets: Record<LegKind, QuoteItem[]> = { combo: [], ida: [], volta: [] };
  for (const item of items) {
    buckets[legKind(item)].push(item);
  }
  return (["combo", "ida", "volta"] as const)
    .filter((kind) => buckets[kind].length > 0)
    .map((kind) => ({ kind, label: LABELS[kind], items: buckets[kind] }));
}
