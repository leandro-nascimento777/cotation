import { QuoteItem } from "@/lib/types";

// Tipos do "banco local" (Context + localStorage) — espelham o
// prisma/schema.prisma na raiz do projeto (ver aquele arquivo pra quando
// isso virar um banco de verdade). Strings em vez de enums do Prisma pra
// manter isso simples no front-end.

export type QuoteType = "VOO" | "HOTEL" | "PACOTE";

export type QuoteStatusType = "RASCUNHO" | "ENVIADA" | "APROVADA" | "RECUSADA" | "EXPIRADA";

export const QUOTE_STATUS_LABEL: Record<QuoteStatusType, string> = {
  RASCUNHO: "Rascunho",
  ENVIADA: "Enviada",
  APROVADA: "Aprovada",
  RECUSADA: "Recusada",
  EXPIRADA: "Expirada",
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
  validityDays: number;
  mensagemDestaque: string;
  observacoes: string;
  status: QuoteStatusType;
  valorTotal: number;
  flightItems: QuoteItem[];
}

export type QuoteDraft = Omit<Quote, "id" | "createdAt" | "updatedAt" | "numero" | "status"> & {
  status?: QuoteStatusType;
};
