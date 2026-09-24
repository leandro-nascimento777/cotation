// Tipos compartilhados entre extração (IA), UI e geração de saída (WhatsApp/PDF)

/** Um trecho de voo (ida OU volta). */
export interface FlightLeg {
  airline: string;
  flightNumber: string;
  date: string; // como aparece no print, ex: "18 Set" ou "25/09/26"
  departureTime: string;
  arrivalTime: string;
  duration: string;
  origin: string;
  destination: string;
  stops: number;
  aircraft: string;
}

/** Uma tarifa (linha de preço) dentro de uma opção de voo — cobre o(s)
 * trecho(s) inteiro(s) da linha (só ida, ou ida+volta combinados). */
export interface FareOption {
  id: string;
  baggage: string; // já formatado pra exibição, ex: "Sem bagagem despachada", "Até 12kg"
  fareLabel: string; // ex: "LIG", "AZU", "CLA", "STA", "Econômica"
  fareClass: string; // ex: "OW", letra da classe (E, H, P, M...), ou ""
  price: number; // valor TOTAL da combinação (ida, ou ida+volta) em reais
  currency: string; // "BRL"
}

/** Uma linha extraída do print. Três formas possíveis:
 * - só "ida": uma linha de tabela de voos de ida (ou tabela única one-way).
 * - só "volta": uma linha de uma tabela "Trecho Volta" separada.
 * - "ida" E "volta": um card de pacote combinado (ida+volta com 1 preço só). */
export interface FlightRow {
  id: string;
  ida?: FlightLeg;
  volta?: FlightLeg;
  fares: FareOption[];
}

/** Um item selecionável na UI: uma linha de voo (ver FlightRow) + uma
 * tarifa específica dessa linha. */
export interface QuoteItem {
  rowId: string;
  fareId: string;
  ida?: FlightLeg;
  volta?: FlightLeg;
  baggage: string;
  fareLabel: string;
  fareClass: string;
  price: number;
  currency: string;
  selected: boolean;
}

export type LegKind = "combo" | "ida" | "volta";

/** Classifica uma linha/item: "combo" (ida+volta com 1 preço), "ida" (só
 * trecho de ida) ou "volta" (só trecho de volta, de uma tabela separada). */
export const legKind = (row: { ida?: FlightLeg; volta?: FlightLeg }): LegKind => {
  if (row.ida && row.volta) return "combo";
  return row.volta ? "volta" : "ida";
};

export interface AgencyInfo {
  agencyName: string;
  branch: string;
  sellerName: string;
  email: string;
  phone: string;
  message: string; // texto do banner de destaque / mensagem de agradecimento
  notes: string; // observações importantes (rodapé)
  logoDataUrl: string; // logo da agência (data URL), opcional — vazio = placeholder "LOGO" no PDF
  validityHours: number; // por quantas horas a cotação vale a partir de agora
  cnpj: string; // CNPJ da agência (auto-preenchível via consulta)
  cadastur: string; // número de registro no Cadastur (Ministério do Turismo)
}

export const flightRowsToQuoteItems = (rows: FlightRow[]): QuoteItem[] =>
  rows.flatMap((row) =>
    row.fares.map((fare) => ({
      rowId: row.id,
      fareId: fare.id,
      ida: row.ida,
      volta: row.volta,
      baggage: fare.baggage,
      fareLabel: fare.fareLabel,
      fareClass: fare.fareClass,
      price: fare.price,
      currency: fare.currency,
      selected: false,
    }))
  );
