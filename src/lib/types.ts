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

/** Uma linha extraída do print — um trecho de ida e, se o print for de
 * pacote ida+volta, também o trecho de volta combinado com ele. */
export interface FlightRow {
  id: string;
  ida: FlightLeg;
  volta?: FlightLeg;
  fares: FareOption[];
}

/** Um item selecionável na UI: uma linha de voo (ida[+volta]) + uma tarifa
 * específica dessa linha. */
export interface QuoteItem {
  rowId: string;
  fareId: string;
  ida: FlightLeg;
  volta?: FlightLeg;
  baggage: string;
  fareLabel: string;
  fareClass: string;
  price: number;
  currency: string;
  selected: boolean;
}

export interface AgencyInfo {
  agencyName: string;
  branch: string;
  sellerName: string;
  email: string;
  phone: string;
  message: string; // texto do banner de destaque / mensagem de agradecimento
  notes: string; // observações importantes (rodapé)
  logoDataUrl: string; // logo da agência (data URL), opcional — vazio = placeholder "LOGO" no PDF
  validityDays: number; // por quantos dias a cotação vale a partir de hoje
  cnpj: string; // CNPJ da agência (auto-preenchível via consulta)
  cadastur: string; // número de registro no Cadastur (Ministério do Turismo)
}

export const defaultAgencyInfo: AgencyInfo = {
  agencyName: "Sua Agência de Viagens",
  branch: "",
  sellerName: "",
  email: "",
  phone: "",
  message: "Agradecemos a preferência! Seguem as opções de voo selecionadas para sua viagem.",
  notes: "Valores sujeitos a disponibilidade e alteração sem aviso prévio até a confirmação da reserva.",
  logoDataUrl: "",
  validityDays: 3,
  cnpj: "",
  cadastur: "",
};

export function flightRowsToQuoteItems(rows: FlightRow[]): QuoteItem[] {
  const items: QuoteItem[] = [];
  for (const row of rows) {
    for (const fare of row.fares) {
      items.push({
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
      });
    }
  }
  return items;
}
