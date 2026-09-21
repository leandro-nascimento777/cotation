"use client";

import { useState } from "react";
import { toast } from "sonner";
import { FlightSelector } from "./FlightSelector";
import { submitProposalResponse } from "@/lib/proposal/actions";
import { formatCurrencyBRL } from "@/lib/format";
import { ClosedFlightSelection } from "@/lib/store/types";
import { QuoteItem } from "@/lib/types";
import { AlertCircle, CheckCircle2, CircleCheck, Loader2, ArrowRight } from "lucide-react";
import { ProposalClientSnapshot, ProposalAgencySnapshot } from "@/lib/proposal/actions";
import { TravelerCheckoutView } from "./checkout/TravelerCheckoutView";

interface ProposalResponseFormProps {
  shareId: string;
  flightItems: QuoteItem[];
  alreadyDecided: { decision: string; observation: string | null } | null;
  nextSteps: string | null;
  paymentMethodLabel: string;
  agencyObservations: string;
  validityLabel: string;
  adultsCount?: number;
  childrenCount?: number;
  infantsCount?: number;
  clientSnapshot?: ProposalClientSnapshot | null;
  agencySnapshot?: ProposalAgencySnapshot | null;
  proposalNumero?: string;
  destino?: string;
  periodoInicio?: string | null;
  periodoFim?: string | null;
}

const StepCard = ({ index, text }: { index: number; text: string }) => (
  <div className="flex items-start gap-4 rounded-2xl border border-slate-200 bg-slate-50/50 p-4 transition-all hover:border-indigo-500/20 hover:bg-slate-50">
    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-900 text-sm font-bold text-white shadow-sm">
      {index}
    </div>
    <div className="space-y-1">
      <span className="block text-xs font-bold text-slate-400">Passo {index}</span>
      <p className="text-xs leading-relaxed font-semibold text-slate-800">{text}</p>
    </div>
  </div>
);

export const ProposalResponseForm = ({
  shareId,
  flightItems,
  alreadyDecided,
  nextSteps,
  paymentMethodLabel,
  agencyObservations,
  validityLabel,
  adultsCount = 1,
  childrenCount = 0,
  infantsCount = 0,
  clientSnapshot = null,
  agencySnapshot = null,
  proposalNumero,
  destino = "",
  periodoInicio = null,
  periodoFim = null,
}: ProposalResponseFormProps) => {
  const [stage, setStage] = useState<"flights" | "checkout">("flights");
  const [selection, setSelection] = useState<{
    selectedIda: ClosedFlightSelection | null;
    selectedVolta: ClosedFlightSelection | null;
    complete: boolean;
    total: number;
  }>({ selectedIda: null, selectedVolta: null, complete: false, total: 0 });
  const [observation, setObservation] = useState(alreadyDecided?.observation ?? "");
  const [submitting, setSubmitting] = useState<"APROVADO" | "REVISAO" | null>(null);
  const [done, setDone] = useState<"APROVADO" | "REVISAO" | null>(
    alreadyDecided ? (alreadyDecided.decision as "APROVADO" | "REVISAO") : null
  );

  const selectedIdaItem = flightItems.find(
    (i) => selection.selectedIda && i.rowId === selection.selectedIda.rowId && i.fareId === selection.selectedIda.fareId
  ) ?? flightItems.find((i) => i.ida) ?? null;

  const selectedVoltaItem = flightItems.find(
    (i) => selection.selectedVolta && i.rowId === selection.selectedVolta.rowId && i.fareId === selection.selectedVolta.fareId
  ) ?? flightItems.find((i) => i.volta) ?? null;

  const steps = (nextSteps || "")
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);

  const handleSubmit = async (decision: "APROVADO" | "REVISAO") => {
    if (!selection.complete) {
      toast.error("Selecione as opções de voo antes de continuar.");
      return;
    }
    setSubmitting(decision);
    try {
      await submitProposalResponse({
        shareId,
        selectedIda: selection.selectedIda,
        selectedVolta: selection.selectedVolta,
        observation,
        decision,
      });
      setDone(decision);
    } catch {
      toast.error("Não foi possível enviar sua resposta. Tente novamente.");
    } finally {
      setSubmitting(null);
    }
  };

  if (stage === "checkout") {
    return (
      <TravelerCheckoutView
        shareId={shareId}
        selectedIda={selection.selectedIda}
        selectedVolta={selection.selectedVolta}
        selectedIdaItem={selectedIdaItem}
        selectedVoltaItem={selectedVoltaItem}
        totalPrice={selection.total}
        adultsCount={adultsCount}
        childrenCount={childrenCount}
        infantsCount={infantsCount}
        clientSnapshot={clientSnapshot}
        agencySnapshot={agencySnapshot}
        proposalNumero={proposalNumero}
        destino={destino}
        periodoInicio={periodoInicio}
        periodoFim={periodoFim}
        onBackToFlights={() => setStage("flights")}
        onSuccessOrder={() => {
          setDone("APROVADO");
        }}
      />
    );
  }

  return (
    <>
      <FlightSelector items={flightItems} onChange={setSelection} />

      {selection.complete && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 rounded-2xl border border-[#5E17EB]/30 bg-gradient-to-r from-purple-50 via-indigo-50/50 to-white p-5 shadow-md animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="space-y-0.5 text-center sm:text-left">
            <span className="text-xs font-bold uppercase tracking-wider text-[#5E17EB]">
              Trechos selecionados
            </span>
            <p className="text-2xl font-black text-slate-900">
              {formatCurrencyBRL(selection.total)}
            </p>
            <p className="text-xs text-slate-500">
              Ida e volta escolhidas. Pronto para preencher os dados dos viajantes.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setStage("checkout")}
            className="flex items-center gap-2 rounded-full bg-[#5E17EB] px-8 py-3.5 text-sm font-bold text-white shadow-lg transition-all hover:bg-[#4d13c7] hover:shadow-xl active:scale-[0.99] cursor-pointer"
          >
            Continuar para dados do passageiro <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      )}

      {steps.length > 0 ? (
        <div className="space-y-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="flex items-center gap-2.5 border-b border-slate-100 pb-2">
            <div className="rounded-lg bg-indigo-500/10 p-1.5 text-indigo-700 shadow-sm">
              <CircleCheck className="h-4.5 w-4.5" />
            </div>
            <div>
              <h3 className="text-sm font-bold tracking-widest text-slate-900 uppercase">Próximos Passos</h3>
              <p className="mt-0.5 text-[10px] text-slate-400">Instruções para finalização da sua reserva</p>
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {steps.map((step, idx) => (
              <StepCard key={idx} index={idx + 1} text={step} />
            ))}
          </div>
        </div>
      ) : null}

      <div className="space-y-6">
        <div className="border-b border-slate-200 pb-3">
          <h2 className="text-xl font-bold text-slate-900">Resumo Financeiro e Condições</h2>
          <p className="text-xs text-slate-500">Valores totais da proposta comercial e formas de pagamento.</p>
        </div>
        <div className="grid grid-cols-1 items-start gap-6 md:grid-cols-2">
          <div className="space-y-6">
            <div className="space-y-3 rounded-3xl border border-slate-200 bg-white p-5 shadow-lg">
              <h3 className="text-xs font-bold tracking-wider text-slate-400 uppercase">Condições / Formas de Pagamento</h3>
              <p className="text-sm leading-relaxed font-medium whitespace-pre-line text-slate-700">
                {paymentMethodLabel}
              </p>
            </div>
            {agencyObservations ? (
              <div className="space-y-3 rounded-3xl border border-slate-200 bg-white p-5 shadow-lg">
                <h3 className="text-xs font-bold tracking-wider text-slate-400 uppercase">Observações Importantes</h3>
                <p className="text-sm leading-relaxed font-medium whitespace-pre-line text-slate-700">
                  {agencyObservations}
                </p>
              </div>
            ) : null}
          </div>

          <div className="space-y-6">
            <div className="space-y-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-lg">
              <h3 className="border-b border-slate-200 pb-2 text-xs font-bold tracking-wider text-slate-400 uppercase">
                Detalhamento Financeiro
              </h3>
              <div className="space-y-2 text-sm font-semibold text-slate-700">
                <div className="flex justify-between">
                  <span>Soma dos Serviços</span>
                  <span>{formatCurrencyBRL(selection.total)}</span>
                </div>
                <div className="mt-3 flex items-baseline justify-between border-t border-slate-200 pt-3 text-slate-900">
                  <span className="text-base font-black">Valor Total</span>
                  <span className="text-2xl font-black">{formatCurrencyBRL(selection.total)}</span>
                </div>
              </div>
            </div>

            <div className="space-y-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-lg">
              <div className="flex items-center gap-1.5 text-xs text-slate-500">
                <AlertCircle className="h-3.5 w-3.5 text-indigo-700/70" />
                <span>
                  Esta proposta é válida até <strong className="text-slate-700">{validityLabel}</strong>.
                </span>
              </div>

              {done ? (
                <div className="flex flex-col items-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-6 text-center">
                  <CheckCircle2 className="h-7 w-7 text-emerald-600" />
                  <p className="text-sm font-bold text-emerald-800">
                    {done === "APROVADO" ? "Viagem confirmada!" : "Recebemos suas observações."}
                  </p>
                  <p className="max-w-xs text-xs text-emerald-700">
                    {done === "APROVADO"
                      ? "Nossa equipe vai entrar em contato para os próximos passos da reserva."
                      : "Nossa equipe vai revisar a proposta e retornar em breve."}
                  </p>
                </div>
              ) : (
                <>
                  <label className="flex flex-col gap-1 text-xs font-medium text-slate-600">
                    Observações (opcional)
                    <textarea
                      value={observation}
                      onChange={(e) => setObservation(e.target.value)}
                      rows={3}
                      placeholder="Alguma dúvida ou pedido de alteração? Escreva aqui."
                      className="rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-800 focus:border-indigo-500 focus:outline-none"
                    />
                  </label>
                  <div className="flex flex-col gap-3">
                    <button
                      type="button"
                      onClick={() => handleSubmit("APROVADO")}
                      disabled={submitting !== null}
                      className="flex w-full items-center justify-center gap-2 rounded-2xl bg-lime-400 py-3.5 text-sm font-bold tracking-wide text-slate-900 shadow-md transition-all hover:bg-lime-300 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {submitting === "APROVADO" ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                      Aprovar e Confirmar Viagem
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSubmit("REVISAO")}
                      disabled={submitting !== null}
                      className="flex items-center justify-center gap-2 rounded-2xl border border-slate-300 py-3 text-sm font-bold text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {submitting === "REVISAO" ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                      Enviar para Revisão
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
