import { QuoteItem } from "@/lib/types";

// Tipos do "banco local" (Context + localStorage) — espelham o
// prisma/schema.prisma na raiz do projeto (ver aquele arquivo pra quando
// isso virar um banco de verdade). Strings em vez de enums do Prisma pra
// manter isso simples no front-end.

export type QuoteType = "VOO" | "HOTEL" | "PACOTE";

/** Etapas do funil de cotações:
 * - RASCUNHO: sem terminar ou ainda não enviada ao cliente;
 * - ENVIADA: criada e já enviada ao cliente;
 * - AGUARDANDO: cliente ainda não aprovou (ex: pediu revisão);
 * - APROVADA: cliente aprovou. */
export type QuoteStatusType = "RASCUNHO" | "ENVIADA" | "AGUARDANDO" | "APROVADA";

/** Rótulo de uma cotação (badge). */
export const QUOTE_STATUS_LABEL: Record<QuoteStatusType, string> = {
  RASCUNHO: "Rascunho",
  ENVIADA: "Enviada",
  AGUARDANDO: "Aguardando",
  APROVADA: "Aprovada",
};

/** Rótulo da coluna no board de cotações. */
export const QUOTE_STATUS_COLUMN_LABEL: Record<QuoteStatusType, string> = {
  RASCUNHO: "Rascunhos",
  ENVIADA: "Enviadas",
  AGUARDANDO: "Aguardando",
  APROVADA: "Aprovadas",
};

/** Ordem das colunas no board de cotações (ver /cotacoes). */
export const QUOTE_STATUS_ORDER: QuoteStatusType[] = ["RASCUNHO", "ENVIADA", "AGUARDANDO", "APROVADA"];

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

export type DuRavTipo = "PERCENTUAL" | "FIXO";
export const DU_RAV_TIPO_LABEL: Record<DuRavTipo, string> = { PERCENTUAL: "Percentual", FIXO: "Valor Fixo" };

export type FeeServicoModo = "POR_PASSAGEIRO" | "POR_BILHETE";
export const FEE_SERVICO_MODO_LABEL: Record<FeeServicoModo, string> = {
  POR_PASSAGEIRO: "Por passageiro",
  POR_BILHETE: "Por bilhete",
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

/** Regras financeiras de um perfil de cobrança (Configurações > Financeiro)
 * — compõem o preço de venda em cima da tarifa líquida extraída do print
 * (ver src/lib/pricing.ts). Um perfil = um conjunto completo de regras; a
 * agência pode ter vários (ex: "Nacional", "Internacional", "Corporativo"),
 * e cada cotação escolhe qual usar (ver Quote.pricingProfileId). */
export interface PricingRules {
  /** 1. Taxa DU / RAV — remuneração da agência de viagens, sobre a tarifa líquida. */
  duRavTipo: DuRavTipo;
  duRavValor: number; // % (duRavTipo=PERCENTUAL) ou R$ (duRavTipo=FIXO)
  duRavPisoMinimo: number; // R$ — piso quando duRavTipo=PERCENTUAL e o % render um valor baixo demais
  /** 2. Fee de serviço / taxa de agenciamento — valor fixo, nacional x internacional. */
  feeServicoModo: FeeServicoModo;
  feeServicoNacional: number; // R$
  feeServicoInternacional: number; // R$
  /** 3. Markup adicional de lucro — % sobre a tarifa líquida. */
  markupPercent: number;
  /** 4. Repasse de custo de parcelamento/gateway — % sobre o valor total da
   * venda, só quando o cliente paga no cartão da própria agência. */
  gatewayPercent: number;
  /** 5. Margem de imposto retido — % sobre a soma das taxas da agência
   * (DU/RAV + Fee + Markup), nunca sobre a tarifa do bilhete. */
  impostoRetidoPercent: number;
}

export const defaultPricingRules: PricingRules = {
  duRavTipo: "PERCENTUAL",
  duRavValor: 0,
  duRavPisoMinimo: 0,
  feeServicoModo: "POR_PASSAGEIRO",
  feeServicoNacional: 0,
  feeServicoInternacional: 0,
  markupPercent: 0,
  gatewayPercent: 0,
  impostoRetidoPercent: 0,
};

export interface PricingProfile extends PricingRules {
  id: string;
  createdAt: string;
  nome: string;
}

export type PricingProfileDraft = Omit<PricingProfile, "id" | "createdAt">;

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

export interface ClientPassenger {
  id: string;
  nome: string;
  sobrenome: string;
  paisResidencia: string;
  tipoDocumento: string; // "CPF" | "RG" | "CPF ou RG" | "Passaporte"
  numeroDocumento: string;
  dataNascimento?: string; // DD/MM/AAAA
  tipo: "Adulto" | "Criança" | "Bebê";
}

export interface Client {
  id: string;
  createdAt: string;
  nomeCompleto: string;
  cpf: string;
  passaporte?: string;
  avatarUrl?: string;
  email: string;
  telefone: string;
  endereco: string;
  cidade: string;
  observacoes: string;
  passageiros?: ClientPassenger[];
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
  /** Perfil de cobrança (Configurações > Financeiro) usado pra deduzir o
   * preço de venda nessa cotação — null = nenhum selecionado. */
  pricingProfileId: string | null;
  valorTotal: number;
  flightItems: QuoteItem[];
  /** true a partir do momento em que a venda é fechada (botão "Fechar
   * venda" no card Aprovada) — só a partir daí a cotação conta como venda
   * nas métricas do dashboard (ver src/app/page.tsx). */
  saleClosed: boolean;
  closedIda: ClosedFlightSelection | null;
  closedVolta: ClosedFlightSelection | null;
  bookingRef: string; // localizador da reserva
  /** Quando a reserva emitida foi finalizada: a cotação sai do board e
   * passa a aparecer em /emitidas. */
  finalizedAt?: string | null;
}

export type QuoteDraft = Omit<Quote, "id" | "createdAt" | "updatedAt" | "numero" | "status"> & {
  status?: QuoteStatusType;
};

export type ReservationStatus = "CONFIRMADA" | "EMITIDA" | "CANCELADA";

export interface ReservationPassenger {
  id: string;
  nome: string;
  tipo?: string; // "Adulto" | "Criança" | "Bebê"
  documento?: string;
  bilheteNumero?: string;
  assentos?: { trecho: string; assento: string }[];
}

export interface ReservationFlight {
  id: string;
  trechoTipo?: "IDA" | "VOLTA" | "INTERNO";
  ciaAerea: string;
  numeroVoo: string;
  origemCodigo: string;
  origemNome: string;
  origemTerminal?: string;
  destinoCodigo: string;
  destinoNome: string;
  destinoTerminal?: string;
  dataPartida: string;
  horaPartida: string;
  dataChegada: string;
  horaChegada: string;
  classe?: string;
  escalas?: number;
  aeronave?: string;
  localizadorCia?: string;
  baseTarifaria?: string;
  bagagem?: string;
  assento?: string;
}

export interface Reservation {
  id: string;
  createdAt: string;
  updatedAt: string;
  localizador: string; // PNR GDS / Consolidadora (ex: ANRXK4)
  localizadorCia?: string; // PNR da Companhia Aérea para Check-in (ex: NXPLPM)
  numeroBilhete?: string;
  status: ReservationStatus;
  clientId?: string | null;
  quoteId?: string | null;
  clienteNome: string;
  clienteEmail?: string;
  clienteTelefone?: string;
  emissor?: string; // ex: Sakura Consolidadora
  dataEmissao?: string;
  passageiros: ReservationPassenger[];
  voos: ReservationFlight[];
  valorTarifa?: number;
  valorTaxas?: number;
  taxaServico?: number; // DU
  valorTotal?: number;
  moeda?: string;
  formaPagamento?: string; // ex: Cartão de Crédito, Pix, Substituição
  bilheteOriginal?: string;
  observacoes?: string;
  instrucoesEmbarque?: string;
}

export type ReservationDraft = Omit<Reservation, "id" | "createdAt" | "updatedAt">;

/** Pedidos pagos online (Pix / Cartão) pelo cliente na proposta pública que aguardam emissão do bilhete pelo agente */
export interface PendingIssuance {
  id: string;
  createdAt: string;
  orderRef: string; // RES-XXXXXX
  shareId?: string;
  quoteId?: string;
  clientId?: string | null;
  clienteNome: string;
  clienteEmail: string;
  clienteTelefone: string;
  passageiros: ClientPassenger[];
  trechosDescricao: string;
  valorPago: number;
  metodoPagamento: "PIX" | "CARTAO" | "NUPAY";
  status: "PENDENTE" | "EMITIDO";
}

export type PendingIssuanceDraft = Omit<PendingIssuance, "id" | "createdAt">;


