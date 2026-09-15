"use client";

import { useState } from "react";
import { AgencyInfo, QuoteItem } from "@/lib/types";
import { buildWhatsAppText } from "@/lib/whatsapp";
import { ProposalShareRecord } from "@/lib/proposal/types";
import { Check, Copy, Download, FileText, Link2, MessageCircle } from "lucide-react";

interface PreviewPanelProps {
  items: QuoteItem[];
  agency: AgencyInfo;
  pdfLoading: boolean;
  pdfError: string | null;
  quoteId: string | null;
  proposalShare: ProposalShareRecord | null;
  onManageProposal: (mode: "theme" | "share" | "pdf") => void;
}

export function PreviewPanel({
  items,
  agency,
  pdfLoading,
  pdfError,
  quoteId,
  proposalShare,
  onManageProposal,
}: PreviewPanelProps) {
  const [tab, setTab] = useState<"whatsapp" | "pdf" | "link">("whatsapp");
  const [copied, setCopied] = useState(false);
  const selected = items.filter((i) => i.selected);
  const text = buildWhatsAppText(items, agency);

  const copy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex gap-1 rounded-lg bg-slate-100 p-1">
          <button
            onClick={() => setTab("whatsapp")}
            className={`flex items-center gap-1 rounded-md px-3 py-1.5 text-xs font-semibold transition-colors ${
              tab === "whatsapp" ? "bg-white text-teal-700 shadow-sm" : "text-slate-500"
            }`}
          >
            <MessageCircle className="h-3.5 w-3.5" /> WhatsApp
          </button>
          <button
            onClick={() => {
              setTab("pdf");
              if (selected.length > 0) onManageProposal("pdf");
            }}
            className={`flex items-center gap-1 rounded-md px-3 py-1.5 text-xs font-semibold transition-colors ${
              tab === "pdf" ? "bg-white text-teal-700 shadow-sm" : "text-slate-500"
            }`}
          >
            <FileText className="h-3.5 w-3.5" /> PDF
          </button>
          <button
            onClick={() => setTab("link")}
            className={`flex items-center gap-1 rounded-md px-3 py-1.5 text-xs font-semibold transition-colors ${
              tab === "link" ? "bg-white text-teal-700 shadow-sm" : "text-slate-500"
            }`}
          >
            <Link2 className="h-3.5 w-3.5" /> Link
          </button>
        </div>

        {tab === "whatsapp" ? (
          <button
            onClick={copy}
            disabled={selected.length === 0}
            className="flex items-center gap-1 rounded-lg bg-teal-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
            {copied ? "Copiado!" : "Copiar texto"}
          </button>
        ) : null}
      </div>

      {pdfError ? (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700">{pdfError}</p>
      ) : null}

      {tab === "whatsapp" ? (
        <div className="max-h-[520px] overflow-y-auto rounded-lg bg-[#e5ddd5] p-4">
          <div className="whitespace-pre-wrap rounded-lg bg-white px-3 py-2 text-sm leading-relaxed text-slate-800 shadow">
            {formatWhatsAppPreview(text)}
          </div>
        </div>
      ) : tab === "pdf" ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-slate-300 bg-slate-50 px-4 py-14 text-center">
          <FileText className="h-6 w-6 text-slate-300" />
          <p className="text-sm font-medium text-slate-500">Gerar PDF da proposta</p>
          <p className="max-w-xs text-xs text-slate-400">
            Escolha o tema da capa e o sistema gera o PDF no mesmo layout da proposta — com os voos e detalhes, sem
            seleção nem link.
          </p>
          <button
            type="button"
            onClick={() => onManageProposal("pdf")}
            disabled={selected.length === 0 || pdfLoading}
            className="mt-1 flex items-center gap-1.5 rounded-lg bg-teal-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Download className="h-3.5 w-3.5" />
            {pdfLoading ? "Gerando…" : "Escolher tema e gerar PDF"}
          </button>
          {selected.length === 0 ? (
            <p className="text-[11px] text-slate-400">Selecione ao menos uma opção de voo pra habilitar.</p>
          ) : null}
        </div>
      ) : !quoteId ? (
        <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-slate-300 bg-slate-50 px-4 py-14 text-center">
          <Link2 className="h-6 w-6 text-slate-300" />
          <p className="text-sm font-medium text-slate-500">Salve a cotação primeiro</p>
          <p className="max-w-xs text-xs text-slate-400">
            Crie a cotação pra poder montar a proposta pública e gerar o link.
          </p>
        </div>
      ) : !proposalShare ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-slate-300 bg-slate-50 px-4 py-14 text-center">
          <Link2 className="h-6 w-6 text-slate-300" />
          <p className="text-sm font-medium text-slate-500">Nenhuma proposta pública ainda</p>
          <p className="max-w-xs text-xs text-slate-400">
            O cliente escolhe um tema pra capa e você gera um link que ele abre em qualquer aparelho.
          </p>
          <button
            type="button"
            onClick={() => onManageProposal("theme")}
            className="mt-1 flex items-center gap-1.5 rounded-lg bg-teal-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-teal-700"
          >
            <Link2 className="h-3.5 w-3.5" /> Configurar Proposta
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-3 rounded-lg border border-slate-200 bg-slate-50 p-4">
          {proposalShare.clientDecision ? (
            <div
              className={`rounded-lg px-3 py-2 text-xs font-medium ${
                proposalShare.clientDecision === "APROVADO" ? "bg-green-50 text-green-700" : "bg-amber-50 text-amber-700"
              }`}
            >
              {proposalShare.clientDecision === "APROVADO" ? "✓ Cliente aprovou a proposta." : "Cliente pediu revisão."}
              {proposalShare.clientObservation ? (
                <p className="mt-1 italic text-slate-600">&ldquo;{proposalShare.clientObservation}&rdquo;</p>
              ) : null}
            </div>
          ) : (
            <p className="text-xs text-slate-500">Aguardando resposta do cliente.</p>
          )}
          <div className="flex flex-col items-center gap-2">
            <button
              type="button"
              onClick={() => onManageProposal("theme")}
              className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-teal-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-teal-700"
            >
              <Link2 className="h-3.5 w-3.5" /> Configurar Proposta
            </button>
            <button
              type="button"
              onClick={() => onManageProposal("share")}
              className="text-xs font-medium text-slate-500 underline-offset-2 hover:text-slate-700 hover:underline"
            >
              Ver link já gerado
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function formatWhatsAppPreview(text: string) {
  // Converte *negrito* e _itálico_ em elementos simples pro preview visual.
  const parts = text.split(/(\*[^*]+\*|_[^_]+_)/g);
  return parts.map((part, i) => {
    if (part.startsWith("*") && part.endsWith("*")) {
      return <b key={i}>{part.slice(1, -1)}</b>;
    }
    if (part.startsWith("_") && part.endsWith("_")) {
      return <i key={i}>{part.slice(1, -1)}</i>;
    }
    return <span key={i}>{part}</span>;
  });
}
