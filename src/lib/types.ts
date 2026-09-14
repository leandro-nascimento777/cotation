// Tipos compartilhados entre extração (IA), UI e geração de saída (WhatsApp/PDF)

export type Baggage = "sem" | "com";

/** Uma tarifa (linha de preço) dentro de uma opção de voo — cada voo tem
 * normalmente 2: "sem bagagem" e "com bagagem". */
export interface FareOption {
  id: string;
  baggage: Baggage;
  fareLabel: string; // ex: "LIG", "AZU", "CLA", "STA"
  fareClass: string; // ex: "OW" (one way), letra da classe (E, H, P, M...)
  price: number; // valor numérico em reais
  currency: string; // "BRL"
}

/** Uma linha extraída da tabela de voos (uma linha do print). */
export interface FlightRow {
  id: string;
  airline: string;
  flightNumber: string;
  date: string; // como aparece no print, ex: "18 Set"
  departureTime: string;
  arrivalTime: string;
  duration: string;
  origin: string;
  destination: string;
  stops: number;
  aircraft: string;
  fares: FareOption[];
}

/** Um item selecionável na UI: uma linha de voo + uma tarifa específica. */
export interface QuoteItem {
  rowId: string;
  fareId: string;
  airline: string;
  flightNumber: string;
  date: string;
  departureTime: string;
  arrivalTime: string;
  duration: string;
  origin: string;
  destination: string;
  stops: number;
  aircraft: string;
  baggage: Baggage;
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
        airline: row.airline,
        flightNumber: row.flightNumber,
        date: row.date,
        departureTime: row.departureTime,
        arrivalTime: row.arrivalTime,
        duration: row.duration,
        origin: row.origin,
        destination: row.destination,
        stops: row.stops,
        aircraft: row.aircraft,
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
