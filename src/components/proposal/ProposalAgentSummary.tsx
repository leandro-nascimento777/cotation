import { Prisma } from "@prisma/client";
import { ChosenFlightCard } from "@/components/FlightList";
import { ProposalClientSnapshot, ProposalPaymentSummary } from "@/lib/proposal/actions";
import { PAYMENT_METHOD_KIND_LABEL } from "@/lib/proposal/paymentLabels";
import { formatCurrencyBRL } from "@/lib/format";
import { legKind, QuoteItem } from "@/lib/types";
import { ClientPassenger } from "@/lib/store/types";
import { CreditCard, Eye, User, Wallet } from "lucide-react";

type ProposalShareRow = Prisma.ProposalShareGetPayload<Record<string, never>>;

const findItem = (items: QuoteItem[], sel: { rowId: string; fareId: string } | null): QuoteItem | undefined => {
  if (!sel) return undefined;
  return items.find((i) => i.rowId === sel.rowId && i.fareId === sel.fareId);
};

const SectionTitle = ({ children }: { children: React.ReactNode }) => (
  <h2 className="text-xs font-bold uppercase tracking-wide text-slate-500">{children}</h2>
);

/** Resumo somente-leitura de uma proposta já decidida, pra consulta do
 * agente antes de emitir — sem capa, sem resumo financeiro, sem "continuar
 * pro checkout" e sem nenhum campo editável. Mostra só o trecho escolhido
 * (completo), a forma de pagamento e os dados dos viajantes. */
export const ProposalAgentSummary = ({ share }: { share: ProposalShareRow }) => {
  const flightItems = (share.flightItems as unknown as QuoteItem[]) || [];
  const idaItem = findItem(
    flightItems,
    share.selectedIdaRowId && share.selectedIdaFareId
      ? { rowId: share.selectedIdaRowId, fareId: share.selectedIdaFareId }
      : null
  );
  const voltaItem = findItem(
    flightItems,
    share.selectedVoltaRowId && share.selectedVoltaFareId
      ? { rowId: share.selectedVoltaRowId, fareId: share.selectedVoltaFareId }
      : null
  );

  const clientSnapshot = share.clientSnapshot as unknown as ProposalClientSnapshot | null;
  const travelers: ClientPassenger[] = clientSnapshot?.savedPassengers || [];
  const payment = share.checkoutPayment as unknown as ProposalPaymentSummary | null;

  return (
    <div className="min-h-screen bg-slate-100 px-4 py-8 sm:px-6">
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
          <div>
            <p className="text-xs font-semibold text-slate-400">Resumo da reserva</p>
            <p className="font-mono text-sm font-bold text-slate-900">{share.numero}</p>
          </div>
          <span className="flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
            <Eye className="h-3.5 w-3.5" /> Somente consulta
          </span>
        </div>

        {idaItem || voltaItem ? (
          <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <SectionTitle>Trecho escolhido</SectionTitle>
            {idaItem ? (
              <div className="space-y-1.5">
                <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                  {legKind(idaItem) === "combo" ? "Ida e volta" : "Ida"}
                </p>
                <ChosenFlightCard item={idaItem} size="lg" />
              </div>
            ) : null}
            {voltaItem && voltaItem !== idaItem ? (
              <div className="space-y-1.5">
                <p className="text-xs font-bold uppercase tracking-wide text-slate-400">Volta</p>
                <ChosenFlightCard item={voltaItem} size="lg" />
              </div>
            ) : null}
          </div>
        ) : null}

        <div className="space-y-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <SectionTitle>
            <span className="flex items-center gap-1.5">
              <Wallet className="h-3.5 w-3.5" /> Forma de pagamento
            </span>
          </SectionTitle>
          {!payment ? (
            <p className="rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-400">
              Cliente aprovou mas ainda não concluiu o checkout — sem forma de pagamento registrada.
            </p>
          ) : (
            <div className="rounded-lg border border-slate-200 p-3 text-xs">
              <div className="flex items-center justify-between gap-2">
                <span className="flex items-center gap-1.5 font-semibold text-slate-800">
                  <CreditCard className="h-3.5 w-3.5 text-slate-400" /> {PAYMENT_METHOD_KIND_LABEL[payment.method]}
                </span>
                <span className="text-[11px] text-slate-400">pedido #{payment.bookingRef}</span>
              </div>
              <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
                {payment.cardLast4 ? (
                  <div>
                    <p className="text-slate-400">Cartão</p>
                    <p className="font-semibold text-slate-800">•••• {payment.cardLast4}</p>
                  </div>
                ) : null}
                {payment.cardHolder ? (
                  <div>
                    <p className="text-slate-400">Titular</p>
                    <p className="font-semibold text-slate-800">{payment.cardHolder}</p>
                  </div>
                ) : null}
                {payment.installments ? (
                  <div>
                    <p className="text-slate-400">Parcelas</p>
                    <p className="font-semibold text-slate-800">{payment.installments}x</p>
                  </div>
                ) : null}
                {payment.invoice ? (
                  <div className="col-span-2 sm:col-span-3">
                    <p className="text-slate-400">Nota fiscal</p>
                    <p className="font-semibold text-slate-800">
                      {payment.invoice.fiscalType} — {payment.invoice.fullName} ({payment.invoice.cpfCnpj})
                    </p>
                  </div>
                ) : null}
                <div>
                  <p className="text-slate-400">Desconto</p>
                  <p className="font-semibold text-slate-800">{formatCurrencyBRL(payment.discount)}</p>
                </div>
                <div>
                  <p className="text-slate-400">Total</p>
                  <p className="font-semibold text-slate-800">{formatCurrencyBRL(payment.total)}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <SectionTitle>
            <span className="flex items-center gap-1.5">
              <User className="h-3.5 w-3.5" /> Dados dos viajantes
            </span>
          </SectionTitle>
          {travelers.length === 0 ? (
            <p className="rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-400">Nenhum viajante preenchido ainda.</p>
          ) : (
            <div className="flex flex-col gap-2">
              {clientSnapshot ? (
                <div className="grid grid-cols-1 gap-2 rounded-lg bg-slate-50 p-3 text-xs sm:grid-cols-2">
                  <div>
                    <p className="text-slate-400">Email</p>
                    <p className="font-semibold text-slate-800">{clientSnapshot.email || "—"}</p>
                  </div>
                  <div>
                    <p className="text-slate-400">Telefone</p>
                    <p className="font-semibold text-slate-800">{clientSnapshot.telefone || "—"}</p>
                  </div>
                </div>
              ) : null}
              {travelers.map((t) => (
                <div key={t.id} className="rounded-lg border border-slate-200 p-3 text-xs">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-semibold text-slate-800">
                      {t.nome} {t.sobrenome}
                    </p>
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600">{t.tipo}</span>
                  </div>
                  <div className="mt-1 grid grid-cols-2 gap-1.5 text-slate-500 sm:grid-cols-3">
                    <span>
                      {t.tipoDocumento}: {t.numeroDocumento || "—"}
                    </span>
                    <span>Nascimento: {t.dataNascimento || "—"}</span>
                    <span>País: {t.paisResidencia || "—"}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
