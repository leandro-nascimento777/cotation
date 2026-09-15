import { QuoteItem } from "@/lib/types";

// Tipos do "banco local" (Context + localStorage) — espelham o
// prisma/schema.prisma na raiz do projeto (ver aquele arquivo pra quando
// isso virar um banco de verdade). Strings em vez de enums do Prisma pra
// manter isso simples no front-end.

export type QuoteType = "VOO" | "HOTEL" | "PACOTE";

export type QuoteStatusType =
  | "NOVA"
  | "EM_ATENDIMENTO"
  | "PROPOSTA_ENVIADA"
  | "AGUARDANDO_CLIENTE"
  | "APROVADA";

export const QUOTE_STATUS_LABEL: Record<QuoteStatusType, string> = {
  NOVA: "Cotações Criadas",
  EM_ATENDIMENTO: "Em Atendimento",
  PROPOSTA_ENVIADA: "Proposta Enviada",
  AGUARDANDO_CLIENTE: "Aguardando Cliente",
  APROVADA: "Aprovada",
};

/** Ordem das colunas no board de cotações (ver /cotacoes). */
export const QUOTE_STATUS_ORDER: QuoteStatusType[] = [
  "NOVA",
  "EM_ATENDIMENTO",
  "PROPOSTA_ENVIADA",
  "AGUARDANDO_CLIENTE",
  "APROVADA",
];

export type QuotePriorityType = "BAIXA" | "NORMAL" | "ALTA";

export const QUOTE_PRIORITY_LABEL: Record<QuotePriorityType, string> = {
  BAIXA: "Baixa",
  NORMAL: "Normal",
  ALTA: "Alta",
};

export type PaymentMethodType = "AVISTA" | "CARTAO_PARCELADO" | "BOLETO" | "OUTRO";

export const PAYMENT_METHOD_LABEL: Record<PaymentMethodType, string> = {
  AVISTA: "À vista",
  CARTAO_PARCELADO: "Cartão parcelado",
  BOLETO: "Boleto",
  OUTRO: "Outro",
};

/** Dados persistentes da agência (Configurações) — separado dos dados que
 * variam por cotação (ver QuoteFormOverrides em lib/types.ts). */
export interface AgencySettings {
  agencyName: string;
  branch: string;
  cnpj: string;
  cadastur: string;
  site: string;
  logoDataUrl: string;
  // Vendedor padrão — pré-preenche cotações novas, pode ser sobrescrito por cotação
  sellerName: string;
  email: string;
  phone: string;
  // Numeração
  orcamentoPrefixo: string;
  proximoOrcamentoNumero: number;
  // Identidade visual do PDF — "" = usa o padrão do sistema
  pdfCorPrimaria: string;
  pdfCorSecundaria: string;
  pdfCorTexto: string;
  pdfUsarLogoAgencia: boolean;
}

export const defaultAgencySettings: AgencySettings = {
  agencyName: "Sua Agência de Viagens",
  branch: "",
  cnpj: "",
  cadastur: "",
  site: "",
  logoDataUrl: "",
  sellerName: "",
  email: "",
  phone: "",
  orcamentoPrefixo: "ORC",
  proximoOrcamentoNumero: 1,
  pdfCorPrimaria: "",
  pdfCorSecundaria: "",
  pdfCorTexto: "",
  pdfUsarLogoAgencia: true,
};

export interface TeamMember {
  id: string;
  createdAt: string;
  nome: string;
  cargo: string;
  email: string;
  telefone: string;
  ativo: boolean;
}

export type TeamMemberDraft = Omit<TeamMember, "id" | "createdAt">;

export interface Client {
  id: string;
  createdAt: string;
  nomeCompleto: string;
  cpf: string;
  email: string;
  telefone: string;
  endereco: string;
  cidade: string;
  observacoes: string;
}

export type ClientDraft = Omit<Client, "id" | "createdAt">;

/** Referência a um item específico de voo (QuoteItem) dentro de flightItems
 * — usado pra registrar qual opção de ida/volta foi efetivamente
 * comprada ao fechar a venda (ver Quote.closedIda/closedVolta). */
export interface ClosedFlightSelection {
  rowId: string;
  fareId: string;
}

export interface Quote {
  id: string;
  createdAt: string;
  updatedAt: string;
  numero: string;
  type: QuoteType;
  clientId: string | null;
  responsavelId: string | null;
  sellerName: string;
  sellerEmail: string;
  sellerPhone: string;
  destino: string;
  periodoInicio: string;
  periodoFim: string;
  paymentMethod: PaymentMethodType | "";
  validityHours: number;
  adults: number;
  children: number;
  infants: number;
  mensagemDestaque: string;
  observacoes: string;
  status: QuoteStatusType;
  priority: QuotePriorityType;
  valorTotal: number;
  flightItems: QuoteItem[];
  /** true a partir do momento em que a venda é fechada (botão "Fechar
   * venda" no card Aprovada) — só a partir daí a cotação conta como venda
   * nas métricas do dashboard (ver src/app/page.tsx). */
  saleClosed: boolean;
  closedIda: ClosedFlightSelection | null;
  closedVolta: ClosedFlightSelection | null;
  bookingRef: string; // localizador da reserva
}

export type QuoteDraft = Omit<Quote, "id" | "createdAt" | "updatedAt" | "numero" | "status"> & {
  status?: QuoteStatusType;
};
