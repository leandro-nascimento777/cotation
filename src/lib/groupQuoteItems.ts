import { legKind, LegKind, QuoteItem } from "./types";

export interface QuoteItemGroup {
  kind: LegKind;
  label: string;
  items: QuoteItem[];
}

export interface RowGroup {
  rowId: string;
  fares: QuoteItem[];
}

const LABELS: Record<LegKind, string> = {
  combo: "Ida e volta",
  ida: "Ida",
  volta: "Volta",
};

/** Agrupa itens de cotação pelo identificador da linha (rowId). */
export const groupByRow = (items: QuoteItem[]): RowGroup[] => {
  const rowIds = Array.from(new Set(items.map((i) => i.rowId)));
  return rowIds.map((rowId) => ({ rowId, fares: items.filter((i) => i.rowId === rowId) }));
};

/** Agrupa uma lista de itens (ex: os selecionados) em até 3 grupos —
 * combos (ida+volta com 1 preço), só ida e só volta — na ordem em que devem
 * aparecer no WhatsApp/PDF. Grupos vazios não entram no resultado. */
export const groupQuoteItems = (items: QuoteItem[]): QuoteItemGroup[] => {
  const buckets: Record<LegKind, QuoteItem[]> = { combo: [], ida: [], volta: [] };
  for (const item of items) {
    buckets[legKind(item)].push(item);
  }
  return (["combo", "ida", "volta"] as const)
    .filter((kind) => buckets[kind].length > 0)
    .map((kind) => ({ kind, label: LABELS[kind], items: buckets[kind] }));
};

