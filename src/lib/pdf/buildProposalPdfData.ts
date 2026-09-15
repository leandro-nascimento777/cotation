import { FlightLeg, QuoteItem, legKind } from "../types";
import { formatCurrencyBRL } from "../format";
import { AgencySettings, PAYMENT_METHOD_LABEL, PaymentMethodType } from "../store/types";
import { QuoteExtras } from "@/components/cotacoes/QuoteExtrasForm";
import { getProposalTheme } from "../proposal/themes";

interface ProposalPdfLeg {
  airline: string;
  flightNumber: string;
  date: string;
  origin: string;
  destination: string;
  departureTime: string;
  arrivalTime: string;
  duration: string;
  stops: string;
}

interface ProposalPdfOption {
  label: string;
  ida?: ProposalPdfLeg;
  volta?: ProposalPdfLeg;
  baggage: string;
  fareLabel: string;
  price: string;
}

export interface ProposalPdfData {
  numero: string;
  coverImageUrl: string;
  coverTitle: string;
  coverSubtitle: string;
  agencyName: string;
  agencyPhone: string;
  agencyEmail: string;
  clientName: string;
  destino: string;
  periodoInicio: string;
  periodoFim: string;
  passageiros: string;
  emissao: string;
  options: ProposalPdfOption[];
  nextSteps: string[];
  paymentMethodLabel: string;
  observacoes: string;
}

export interface ProposalPdfThemeInput {
  themeId: string;
  coverImageUrl: string | null;
  coverTitle: string;
  coverSubtitle: string;
  nextSteps: string;
}

function legToPdf(leg: FlightLeg): ProposalPdfLeg {
  return {
    airline: leg.airline,
    flightNumber: leg.flightNumber,
    date: leg.date,
    origin: leg.origin,
    destination: leg.destination,
    departureTime: leg.departureTime,
    arrivalTime: leg.arrivalTime,
    duration: leg.duration,
    stops: leg.stops === 0 ? "Voo direto" : `${leg.stops} conexão(ões)`,
  };
}

const OPTION_LABEL = { combo: "Pacote Ida e Volta", ida: "Voo de Ida", volta: "Voo de Volta" } as const;

/** Monta os dados pro PDF no mesmo layout da proposta pública, mas estático
 * (sem seleção por rádio nem somatório) — usado pela aba PDF, que reaproveita
 * o mesmo seletor de tema da aba Link só pra escolher a capa do documento,
 * sem gerar link nenhum. */
export function buildProposalPdfData(
  items: QuoteItem[],
  extras: QuoteExtras,
  agency: AgencySettings,
  numero: string,
  theme: ProposalPdfThemeInput
): ProposalPdfData {
  const selected = items.filter((i) => i.selected);
  const passageiros = [
    `${extras.adults} adulto${extras.adults === 1 ? "" : "s"}`,
    extras.children ? `${extras.children} criança${extras.children === 1 ? "" : "s"}` : null,
    extras.infants ? `${extras.infants} bebê${extras.infants === 1 ? "" : "s"}` : null,
  ]
    .filter(Boolean)
    .join(", ");

  const themePreset = getProposalTheme(theme.themeId);

  return {
    numero,
    coverImageUrl: theme.coverImageUrl || themePreset.imageUrl,
    coverTitle: theme.coverTitle,
    coverSubtitle: theme.coverSubtitle,
    agencyName: agency.agencyName,
    agencyPhone: extras.sellerPhone || agency.phone,
    agencyEmail: extras.sellerEmail || agency.email,
    clientName: extras.clientName,
    destino: extras.destino,
    periodoInicio: extras.periodoInicio,
    periodoFim: extras.periodoFim,
    passageiros,
    emissao: new Date().toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" }),
    options: selected.map((item) => ({
      label: OPTION_LABEL[legKind(item)],
      ida: item.ida ? legToPdf(item.ida) : undefined,
      volta: item.volta ? legToPdf(item.volta) : undefined,
      baggage: item.baggage,
      fareLabel: item.fareLabel,
      price: formatCurrencyBRL(item.price),
    })),
    nextSteps: theme.nextSteps
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean),
    paymentMethodLabel: extras.paymentMethod
      ? PAYMENT_METHOD_LABEL[extras.paymentMethod as PaymentMethodType]
      : "A combinar com a agência.",
    observacoes: extras.observacoes,
  };
}
