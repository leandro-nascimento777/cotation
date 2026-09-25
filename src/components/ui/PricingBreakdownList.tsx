import { formatCurrencyBRL } from "@/lib/format";
import { PricingBreakdown } from "@/lib/pricing";

const BreakdownRow = ({
  label,
  value,
  bold,
  muted,
}: {
  label: string;
  value: string;
  bold?: boolean;
  muted?: boolean;
}) => (
  <div className={`flex items-center justify-between py-1.5 text-sm ${bold ? "font-bold text-slate-900" : "text-slate-700"}`}>
    <span className={muted ? "text-slate-400" : ""}>{label}</span>
    <span className={bold ? "text-base text-teal-700" : ""}>{value}</span>
  </div>
);

/** Discriminação do valor de venda em cima da tarifa líquida (DU/RAV + fee +
 * markup + imposto retido + gateway) — pro agente conferir o que compõe o
 * total. Nunca exibir isso pro cliente final (proposta pública/checkout). */
export const PricingBreakdownList = ({
  breakdown,
  pagamentoCartaoAgencia,
}: {
  breakdown: PricingBreakdown;
  pagamentoCartaoAgencia: boolean;
}) => (
  <div className="divide-y divide-teal-100 rounded-lg bg-white px-4">
    <BreakdownRow label="Tarifa líquida (extraída)" value={formatCurrencyBRL(breakdown.tarifaLiquida)} />
    <BreakdownRow label="+ Taxa DU / RAV" value={formatCurrencyBRL(breakdown.duRav)} />
    <BreakdownRow label="+ Fee de serviço" value={formatCurrencyBRL(breakdown.feeServico)} />
    <BreakdownRow label="+ Markup de lucro" value={formatCurrencyBRL(breakdown.markup)} />
    <BreakdownRow
      label="+ Imposto retido (sobre DU + Fee + Markup)"
      value={formatCurrencyBRL(breakdown.impostoRetido)}
    />
    <BreakdownRow
      label={pagamentoCartaoAgencia ? "+ Repasse de gateway/parcelamento" : "Repasse de gateway (cliente paga direto na cia)"}
      value={formatCurrencyBRL(breakdown.gateway)}
      muted={!pagamentoCartaoAgencia}
    />
    <BreakdownRow label="= Preço de venda" value={formatCurrencyBRL(breakdown.precoVenda)} bold />
  </div>
);
