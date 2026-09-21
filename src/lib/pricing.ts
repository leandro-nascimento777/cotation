import { PricingRules } from "./store/types";

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
