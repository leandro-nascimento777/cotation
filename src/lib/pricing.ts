import { PricingProfile, PricingRules } from "./store/types";

export interface PricingInput {
  /** Tarifa líquida (o valor extraído do print, sem taxa de embarque). */
  tarifaLiquida: number;
  passageiros: number;
  internacional: boolean;
  /** true quando o cliente paga no cartão da própria agência (em vez do
   * cartão dele direto na cia aérea) — só nesse caso o repasse de
   * gateway/parcelamento é cobrado. */
  pagamentoCartaoAgencia: boolean;
}

export interface PricingBreakdown {
  tarifaLiquida: number;
  duRav: number;
  feeServico: number;
  markup: number;
  /** Soma das taxas da agência (DU/RAV + Fee + Markup) — base do imposto retido. */
  taxasAgencia: number;
  impostoRetido: number;
  gateway: number;
  precoVenda: number;
}

/** Composição do preço de venda em cima da tarifa líquida extraída do
 * print, aplicando as regras de um perfil de cobrança (Configurações >
 * Financeiro). Função pura — sem acesso a store nem I/O — pra poder ser
 * usada tanto num simulador quanto no fluxo real da cotação. */
export const calculatePricing = (input: PricingInput, settings: PricingRules): PricingBreakdown => {
  const tarifaLiquida = Math.max(0, input.tarifaLiquida);
  const passageiros = Math.max(1, input.passageiros);

  const duRav =
    settings.duRavTipo === "PERCENTUAL"
      ? Math.max((tarifaLiquida * settings.duRavValor) / 100, settings.duRavPisoMinimo)
      : settings.duRavValor;

  const feeBase = input.internacional ? settings.feeServicoInternacional : settings.feeServicoNacional;
  const feeServico = settings.feeServicoModo === "POR_PASSAGEIRO" ? feeBase * passageiros : feeBase;

  const markup = (tarifaLiquida * settings.markupPercent) / 100;
  const taxasAgencia = duRav + feeServico + markup;
  const impostoRetido = (taxasAgencia * settings.impostoRetidoPercent) / 100;

  const subtotal = tarifaLiquida + taxasAgencia + impostoRetido;
  const gateway = input.pagamentoCartaoAgencia ? (subtotal * settings.gatewayPercent) / 100 : 0;

  return {
    tarifaLiquida,
    duRav,
    feeServico,
    markup,
    taxasAgencia,
    impostoRetido,
    gateway,
    precoVenda: subtotal + gateway,
  };
};

export interface QuoteValorTotalInput {
  /** Tarifa líquida da cotação (hoje: o menor preço entre os itens de voo
   * selecionados) — a base sobre a qual o perfil de cobrança aplica as
   * taxas. */
  tarifaLiquida: number;
  passageiros: number;
  internacional: boolean;
  pagamentoCartaoAgencia: boolean;
  profile: PricingProfile | undefined;
}

export interface QuoteValorTotalResult {
  valorTotal: number;
  breakdown?: PricingBreakdown;
}

/** Decide o valorTotal de uma cotação: com perfil de cobrança selecionado,
 * aplica calculatePricing e usa o preço de venda (com breakdown pra exibir
 * pro agente); sem perfil, mantém a tarifa líquida como valor total (soma
 * simples, comportamento anterior à existência de perfis de cobrança). */
export const computeQuoteValorTotal = ({
  tarifaLiquida,
  passageiros,
  internacional,
  pagamentoCartaoAgencia,
  profile,
}: QuoteValorTotalInput): QuoteValorTotalResult => {
  if (!profile) return { valorTotal: tarifaLiquida };
  const breakdown = calculatePricing({ tarifaLiquida, passageiros, internacional, pagamentoCartaoAgencia }, profile);
  return { valorTotal: breakdown.precoVenda, breakdown };
};
