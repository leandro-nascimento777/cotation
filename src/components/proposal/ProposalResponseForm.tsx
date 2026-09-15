"use client";

import { useState } from "react";
import { toast } from "sonner";
import { FlightSelector } from "./FlightSelector";
import { submitProposalResponse } from "@/lib/proposal/actions";
import { formatCurrencyBRL } from "@/lib/format";
import { ClosedFlightSelection } from "@/lib/store/types";
import { QuoteItem } from "@/lib/types";
import { CheckCircle2, Loader2 } from "lucide-react";

interface ProposalResponseFormProps {
  shareId: string;
  flightItems: QuoteItem[];
  alreadyDecided: { decision: string; observation: string | null } | null;
}

export function ProposalResponseForm({ shareId, flightItems, alreadyDecided }: ProposalResponseFormProps) {
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

  if (done) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-xl border border-green-200 bg-green-50 px-6 py-10 text-center">
        <CheckCircle2 className="h-8 w-8 text-green-600" />
        <p className="text-sm font-semibold text-green-800">
          {done === "APROVADO" ? "Viagem confirmada! Recebemos sua aprovação." : "Recebemos suas observações."}
        </p>
        <p className="max-w-sm text-xs text-green-700">
          {done === "APROVADO"
            ? "Nossa equipe vai entrar em contato para os próximos passos da reserva."
            : "Nossa equipe vai revisar a proposta considerando o que você escreveu e retornar em breve."}
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <FlightSelector items={flightItems} onChange={setSelection} />

      <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
        <span className="text-sm font-semibold text-slate-600">Valor Total</span>
        <span className="text-lg font-bold text-slate-900">{formatCurrencyBRL(selection.total)}</span>
      </div>

      <label className="flex flex-col gap-1 text-xs font-medium text-slate-600">
        Observações (opcional)
        <textarea
          value={observation}
          onChange={(e) => setObservation(e.target.value)}
          rows={3}
          placeholder="Alguma dúvida ou pedido de alteração? Escreva aqui."
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-800 focus:border-teal-500 focus:outline-none"
        />
      </label>

      <div className="flex flex-col gap-2 sm:flex-row">
        <button
          type="button"
          onClick={() => handleSubmit("APROVADO")}
          disabled={submitting !== null}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-teal-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting === "APROVADO" ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          Aprovar e Confirmar Viagem
        </button>
        <button
          type="button"
          onClick={() => handleSubmit("REVISAO")}
          disabled={submitting !== null}
          className="flex items-center justify-center gap-1.5 rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting === "REVISAO" ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          Enviar para Revisão
        </button>
      </div>
    </div>
  );
}
