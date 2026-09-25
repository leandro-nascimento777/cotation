"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useAppData } from "@/lib/store/AppDataContext";
import { StatusBadge } from "@/components/shell/StatusBadge";
import { ChosenFlightCard, FlightList } from "@/components/FlightList";
import { PricingBreakdownList } from "@/components/ui/PricingBreakdownList";
import { quoteToExtras } from "./QuoteExtrasForm";
import { CloseSaleForm } from "./CloseSaleForm";
import { ApprovedProposalPanel } from "./proposal/ApprovedProposalPanel";
import { getProposalShareByQuote } from "@/lib/proposal/actions";
import { ProposalShareRecord } from "@/lib/proposal/types";
import { DEFAULT_THEME_ID, DEFAULT_NEXT_STEPS } from "@/lib/proposal/themes";
import { ProposalPdfThemeInput } from "@/lib/pdf/buildProposalPdfData";
import { formatCurrencyBRL, validityDateTimePtBR } from "@/lib/format";
import { PAYMENT_METHOD_LABEL, QUOTE_PRIORITY_LABEL, Quote } from "@/lib/store/types";
import { QuoteItem } from "@/lib/types";
import { CheckCircle2, Pencil, X, FileText, Download, Loader2 } from "lucide-react";

const InfoField = ({ label, value }: { label: string; value: string }) => (
  <div>
    <p className="text-xs font-semibold text-slate-500">{label}</p>
    <p className="text-slate-800">{value}</p>
  </div>
);

const findItem = (quote: Quote, sel: { rowId: string; fareId: string } | null): QuoteItem | undefined => {
  if (!sel) return undefined;
  return quote.flightItems.find((i) => i.rowId === sel.rowId && i.fareId === sel.fareId);
};

interface QuoteDetailModalProps {
  quoteId: string;
  onClose: () => void;
  initialMode?: "view" | "close";
}

/** Modal de detalhes de uma cotação, aberto a partir do card no board
 * (/cotacoes). O Editar leva ao editor completo (/cotacoes/[id]), o mesmo
 * fluxo da Nova cotação. Na coluna Aprovada também é usado pro fluxo de
 * "Fechar venda". */
export function QuoteDetailModal({ quoteId, onClose, initialMode = "view" }: QuoteDetailModalProps) {
  const router = useRouter();
  const { agency, getQuote, getClient, updateQuote } = useAppData();
  const quote = getQuote(quoteId);
  const client = quote?.clientId ? getClient(quote.clientId) : undefined;

  const [mode, setMode] = useState<"view" | "close">(initialMode);
  const [proposalShare, setProposalShare] = useState<ProposalShareRecord | null>(null);
  const [pdfGenerating, setPdfGenerating] = useState(false);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  useEffect(() => {
    getProposalShareByQuote(quoteId).then(setProposalShare);
  }, [quoteId]);

  if (!quote) return null;

  const selectedItems = quote.flightItems.filter((i) => i.selected);
  const closedIdaItem = findItem(quote, quote.closedIda);
  const closedVoltaItem = findItem(quote, quote.closedVolta);

  const handleEdit = () => {
    onClose();
    router.push(`/cotacoes/${quote.id}`);
  };

  const handleConfirmClose = (data: { closedIda: Quote["closedIda"]; closedVolta: Quote["closedVolta"]; bookingRef: string }) => {
    updateQuote(quote.id, { ...data, saleClosed: true });
    toast.success("Venda fechada — já conta nas métricas do dashboard.");
    setMode("view");
  };

  const handleGeneratePdf = async () => {
    if (!quote) return;
    setPdfGenerating(true);
    try {
      const flightItems = quote.flightItems || [];
      if (flightItems.length === 0) {
        toast.error("Essa cotação não possui opções de voo cadastradas.");
        return;
      }
      const itemsToPdf = flightItems.some((i) => i.selected)
        ? flightItems
        : flightItems.map((i) => ({ ...i, selected: true }));

      const extrasData = quoteToExtras(quote, client, agency);

      const theme: ProposalPdfThemeInput = {
        themeId: proposalShare?.themeId || DEFAULT_THEME_ID,
        coverImageUrl: proposalShare?.coverImageUrl || null,
        coverTitle: (proposalShare?.coverTitle || `PROPOSTA DE VIAGEM — ${quote.destino || "AÉREO"}`).toUpperCase(),
        coverSubtitle: proposalShare?.coverSubtitle || "Sua viagem, do planejamento ao embarque.",
        nextSteps: proposalShare?.nextSteps || DEFAULT_NEXT_STEPS,
      };

      const res = await fetch("/api/pdf/proposal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: itemsToPdf,
          extras: extrasData,
          agency,
          numero: quote.numero,
          theme,
        }),
      });

      if (!res.ok) {
        const fallbackRes = await fetch("/api/pdf", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            items: itemsToPdf,
            agency: {
              agencyName: agency.agencyName,
              branch: agency.branch,
              sellerName: quote.sellerName || agency.sellerName,
              sellerEmail: quote.sellerEmail || agency.email,
              phone: agency.phone,
              cnpj: agency.cnpj,
              cadastur: agency.cadastur,
              logoUrl: agency.pdfUsarLogoAgencia ? agency.logoDataUrl : "",
            },
            numeroOrcamento: quote.numero,
            corPrimaria: agency.pdfCorPrimaria,
            corSecundaria: agency.pdfCorSecundaria,
            corTexto: agency.pdfCorTexto,
          }),
        });

        if (!fallbackRes.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error || "Falha ao gerar o PDF da cotação.");
        }

        const blob = await fallbackRes.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${quote.numero || "cotacao"}.pdf`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
        toast.success("PDF da cotação baixado com sucesso!");
        return;
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${quote.numero || "proposta-comercial"}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      toast.success("PDF oficial gerado e baixado!");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erro ao gerar PDF.";
      toast.error(msg);
    } finally {
      setPdfGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4" onClick={onClose}>
      <div
        onClick={(e) => e.stopPropagation()}
        className="flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-xl bg-white shadow-xl"
      >
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <div className="flex items-center gap-2">
            <span className="font-mono text-sm font-semibold text-slate-800">{quote.numero}</span>
            <StatusBadge status={quote.status} />
            {quote.saleClosed ? (
              <span className="flex items-center gap-1 rounded-full bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700">
                <CheckCircle2 className="h-3.5 w-3.5" /> Venda fechada
              </span>
            ) : null}
          </div>
          <div className="flex items-center gap-1.5">
            {mode === "view" ? (
              <>
                {/* Botão de Gerar o mesmo PDF enviado */}
                <button
                  type="button"
                  onClick={handleGeneratePdf}
                  disabled={pdfGenerating}
                  className="flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition shadow-xs cursor-pointer disabled:opacity-50"
                  title="Gerar e baixar o mesmo PDF oficial enviado à agência/cliente"
                >
                  {pdfGenerating ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin text-[#1d82f5]" />
                  ) : (
                    <FileText className="h-3.5 w-3.5 text-indigo-600" />
                  )}
                  {pdfGenerating ? "Gerando..." : "Gerar PDF"}
                </button>

                {quote.status === "APROVADA" ? (
                  <button
                    type="button"
                    onClick={() => setMode("close")}
                    className="flex items-center gap-1.5 rounded-lg border border-teal-300 bg-teal-50 px-2.5 py-1.5 text-xs font-semibold text-teal-700 hover:bg-teal-100 cursor-pointer"
                  >
                    {quote.saleClosed ? "Editar venda fechada" : "Fechar venda"}
                  </button>
                ) : null}
                <button
                  type="button"
                  onClick={handleEdit}
                  className="flex items-center gap-1.5 rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  <Pencil className="h-3.5 w-3.5" /> Editar
                </button>
              </>
            ) : null}
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          {mode === "close" ? (
            <CloseSaleForm
              quote={quote}
              lockedByClient={proposalShare?.clientDecision === "APROVADO"}
              onCancel={() => setMode("view")}
              onConfirm={handleConfirmClose}
            />
          ) : (
            <div className="flex flex-col gap-4 text-sm">
              {proposalShare?.clientDecision ? (
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
              ) : null}

              {quote.status === "APROVADA" && proposalShare ? (
                <ApprovedProposalPanel quote={quote} proposalShare={proposalShare} />
              ) : null}

              {quote.saleClosed && (closedIdaItem || closedVoltaItem) ? (
                <div>
                  <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-green-700">
                    <CheckCircle2 className="h-3.5 w-3.5" /> Voo comprado — localizador {quote.bookingRef || "—"}
                  </p>
                  <div className="flex flex-col gap-2">
                    {closedIdaItem ? <ChosenFlightCard item={closedIdaItem} /> : null}
                    {closedVoltaItem && closedVoltaItem !== closedIdaItem ? <ChosenFlightCard item={closedVoltaItem} /> : null}
                  </div>
                </div>
              ) : null}

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <InfoField label="Cliente" value={client?.nomeCompleto || "—"} />
                <InfoField label="Telefone do cliente" value={client?.telefone || "—"} />
                <InfoField label="Vendedor(a)" value={quote.sellerName || "—"} />
                <InfoField label="Prioridade" value={QUOTE_PRIORITY_LABEL[quote.priority]} />
                <InfoField label="Origem" value={quote.origem || "—"} />
                <InfoField label="Destino" value={quote.destino || "—"} />
                <InfoField
                  label="Forma de pagamento"
                  value={quote.paymentMethod ? PAYMENT_METHOD_LABEL[quote.paymentMethod] : "—"}
                />
                <InfoField label="Período — ida" value={quote.periodoInicio || "—"} />
                <InfoField label="Período — volta" value={quote.periodoFim || "—"} />
                <InfoField label="Passageiros" value={`${quote.adults} adulto(s), ${quote.children} criança(s), ${quote.infants} bebê(s)`} />
                <InfoField label="Validade" value={validityDateTimePtBR(quote.validityHours)} />
                <InfoField label="Valor" value={quote.valorTotal ? formatCurrencyBRL(quote.valorTotal) : "—"} />
              </div>

              {quote.pricingBreakdown ? (
                <div>
                  <p className="mb-2 text-xs font-semibold text-slate-500">
                    Composição do valor (só visível pra você)
                  </p>
                  <PricingBreakdownList
                    breakdown={quote.pricingBreakdown}
                    pagamentoCartaoAgencia={quote.pagamentoCartaoAgencia}
                  />
                </div>
              ) : null}

              {quote.mensagemDestaque ? (
                <div>
                  <p className="mb-1 text-xs font-semibold text-slate-500">Mensagem de destaque</p>
                  <p className="rounded-lg bg-slate-50 p-3 text-slate-700">{quote.mensagemDestaque}</p>
                </div>
              ) : null}

              {quote.observacoes ? (
                <div>
                  <p className="mb-1 text-xs font-semibold text-slate-500">Observações</p>
                  <p className="rounded-lg bg-slate-50 p-3 text-slate-700">{quote.observacoes}</p>
                </div>
              ) : null}

              {selectedItems.length > 0 ? (
                <div>
                  <p className="mb-2 text-xs font-semibold text-slate-500">Opções enviadas ao cliente</p>
                  <FlightList items={quote.flightItems} readOnly />
                </div>
              ) : null}

              {/* Banner de Ação Rápida para Gerar o PDF Oficial da Cotação */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 rounded-2xl bg-gradient-to-r from-blue-50/80 via-indigo-50/50 to-white border border-blue-200/80 p-4 mt-2 shadow-2xs">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-[#1d82f5] shadow-xs border border-blue-100 shrink-0">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900">Documento Oficial da Cotação em PDF</p>
                    <p className="text-[11px] text-slate-500">
                      Gere o mesmo documento em PDF com as opções de voo, valores e identidade da sua agência.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleGeneratePdf}
                  disabled={pdfGenerating}
                  className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#1d82f5] hover:bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-sm transition active:scale-95 cursor-pointer shrink-0 disabled:opacity-50"
                >
                  {pdfGenerating ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Download className="h-3.5 w-3.5" />
                  )}
                  {pdfGenerating ? "Gerando PDF..." : "Baixar PDF Oficial"}
                </button>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
