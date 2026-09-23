"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { UploadCard } from "@/components/UploadCard";
import { FlightList } from "@/components/FlightList";
import { PreviewPanel } from "@/components/PreviewPanel";
import { QuoteTypeSelector } from "./QuoteTypeSelector";
import { QuoteExtrasForm, QuoteExtras, quoteToExtras } from "./QuoteExtrasForm";
import { ThemeModal } from "./proposal/ThemeModal";
import { ShareModal } from "./proposal/ShareModal";
import { useAppData } from "@/lib/store/AppDataContext";
import { buildAgencyInfoForQuote } from "@/lib/store/mergeAgencyInfo";
import { resolveQuoteClientId } from "@/lib/store/resolveQuoteClient";
import { getProposalShareByQuote } from "@/lib/proposal/actions";
import { ProposalShareRecord } from "@/lib/proposal/types";
import { ProposalPdfThemeInput } from "@/lib/pdf/buildProposalPdfData";
import { Quote } from "@/lib/store/types";
import { FlightRow, flightRowsToQuoteItems, QuoteItem } from "@/lib/types";
import { parseExtractedDateToISO } from "@/lib/format";
import { Send } from "lucide-react";

export function QuoteEditor({ existingQuote }: { existingQuote?: Quote }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { agency, createQuote, updateQuote, getClient, createClient, updateClient } = useAppData();

  const queryClientId = searchParams?.get("clientId") || undefined;
  const targetClientId = existingQuote?.clientId || queryClientId;
  const existingClient = targetClientId ? getClient(targetClientId) : undefined;

  const [quoteId, setQuoteId] = useState<string | null>(existingQuote?.id || null);
  const [numero, setNumero] = useState<string>(existingQuote?.numero || "");
  const [items, setItems] = useState<QuoteItem[]>(existingQuote?.flightItems || []);
  const [extras, setExtras] = useState<QuoteExtras>(() =>
    quoteToExtras(existingQuote, existingClient, agency)
  );
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [extractLoading, setExtractLoading] = useState(false);
  const [extractError, setExtractError] = useState<string | null>(null);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [pdfError, setPdfError] = useState<string | null>(null);
  const [proposalShare, setProposalShare] = useState<ProposalShareRecord | null>(null);
  const [proposalModal, setProposalModal] = useState<"theme" | "share" | "pdf" | null>(null);

  useEffect(() => {
    if (!quoteId) return;
    getProposalShareByQuote(quoteId).then(setProposalShare);
  }, [quoteId]);

  const handleExtract = async (imageDataUrl: string) => {
    setImagePreview(imageDataUrl);
    setExtractLoading(true);
    setExtractError(null);
    try {
      const res = await fetch("/api/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: imageDataUrl }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Falha ao extrair os dados.");
      const rows: FlightRow[] = data.rows;
      setItems(flightRowsToQuoteItems(rows));

      const idaRow = rows.find((r) => r.ida);
      const voltaRow = [...rows].reverse().find((r) => r.volta);
      const passengers: { adults?: number; children?: number; infants?: number } | null = data.passengers ?? null;

      const dateIdaExtracted = idaRow?.ida ? parseExtractedDateToISO(idaRow.ida.date) : "";
      const dateVoltaExtracted = voltaRow?.volta ? parseExtractedDateToISO(voltaRow.volta.date) : "";
      const hasVolta = rows.some((r) => Boolean(r.volta));

      setExtras((prev) => {
        const nextIda = prev.periodoInicio || dateIdaExtracted;
        const nextVolta = prev.periodoFim || dateVoltaExtracted;

        // Avisa o agente caso a data de ida ou volta não tenha sido identificada no print
        if (!nextIda || (hasVolta && !nextVolta)) {
          setTimeout(() => {
            toast.warning(
              "Atenção: A data de ida e/ou retorno não foi identificada no print. Por favor, preencha as datas no formulário para que o bilhete da proposta seja gerado corretamente.",
              { duration: 7000 }
            );
          }, 400);
        }

        return {
          ...prev,
          destino: prev.destino || idaRow?.ida?.destination || voltaRow?.volta?.origin || prev.destino,
          periodoInicio: nextIda,
          periodoFim: nextVolta,
          adults: passengers?.adults ?? prev.adults,
          children: passengers?.children ?? prev.children,
          infants: passengers?.infants ?? prev.infants,
        };
      });
    } catch (err) {
      setExtractError(err instanceof Error ? err.message : "Erro desconhecido.");
    } finally {
      setExtractLoading(false);
    }
  };

  const handleToggle = (rowId: string, fareId: string) => {
    setItems((prev) =>
      prev.map((item) =>
        item.rowId === rowId && item.fareId === fareId ? { ...item, selected: !item.selected } : item
      )
    );
  };

  /** Cria a cotação na primeira vez (atribuindo número) ou atualiza a
   * existente — devolve o {id, numero} atualizados. */
  const persist = (status?: Quote["status"]) => {
    const clientId = resolveQuoteClientId(extras, { getClient, createClient, updateClient });
    if (clientId !== extras.clientId) setExtras((prev) => ({ ...prev, clientId }));

    const selected = items.filter((i) => i.selected);
    const valorTotal = selected.length ? Math.min(...selected.map((i) => i.price)) : 0;
    const payload = {
      type: "VOO" as const,
      clientId,
      responsavelId: extras.responsavelId,
      sellerName: extras.sellerName,
      sellerEmail: extras.sellerEmail,
      sellerPhone: extras.sellerPhone,
      destino: extras.destino,
      periodoInicio: extras.periodoInicio,
      periodoFim: extras.periodoFim,
      paymentMethod: extras.paymentMethod,
      validityHours: extras.validityHours,
      priority: extras.priority,
      pricingProfileId: extras.pricingProfileId,
      adults: extras.adults,
      children: extras.children,
      infants: extras.infants,
      mensagemDestaque: extras.mensagemDestaque,
      observacoes: extras.observacoes,
      valorTotal,
      flightItems: items,
      saleClosed: existingQuote?.saleClosed ?? false,
      closedIda: existingQuote?.closedIda ?? null,
      closedVolta: existingQuote?.closedVolta ?? null,
      bookingRef: existingQuote?.bookingRef ?? "",
    };
    if (quoteId) {
      updateQuote(quoteId, status ? { ...payload, status } : payload);
      return { id: quoteId, numero };
    }
    const created = createQuote(payload);
    setQuoteId(created.id);
    setNumero(created.numero);
    return { id: created.id, numero: created.numero };
  };

  /** Gera o PDF no mesmo layout visual da proposta pública (ver aba Link),
   * porém estático — sem seleção nem somatório, só os voos e detalhes. O
   * tema é escolhido no mesmo modal usado pra montar o link, mas aqui não
   * salva nenhum ProposalShare. */
  const handleGeneratePdfWithTheme = async (theme: ProposalPdfThemeInput) => {
    setPdfLoading(true);
    setPdfError(null);
    try {
      const { numero: numeroOrcamento } = persist();
      const res = await fetch("/api/pdf/proposal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items, extras, agency, numero: numeroOrcamento, theme }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Falha ao gerar PDF.");
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${numeroOrcamento || "proposta"}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      toast.success("PDF gerado e cotação salva.");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erro desconhecido.";
      setPdfError(message);
      toast.error(message);
    } finally {
      setPdfLoading(false);
    }
  };

  const handleSaveDraft = () => {
    persist();
    toast.success(quoteId ? "Cotação salva." : "Rascunho criado.");
    if (!quoteId) return; // setQuoteId já disparou o re-render com o id novo
  };

  const handleMarkSent = () => {
    const { id } = persist("PROPOSTA_ENVIADA");
    toast.success("Cotação marcada como enviada.");
    router.push(`/cotacoes/${id}`);
  };

  const handleCancel = () => {
    router.push("/cotacoes");
  };

  const handleCreate = () => {
    const { id } = persist();
    toast.success("Cotação criada.");
    // Fica na ficha da cotação (agora em modo edição) em vez de ir pro
    // Kanban — a cotação já aparece lá, mas o usuário continua na tela
    // pra seguir com a aba Link (montar/compartilhar a proposta).
    router.push(`/cotacoes/${id}`);
  };

  const agencyInfoPreview = buildAgencyInfoForQuote(agency, extras);

  return (
    <div className="w-full grid grid-cols-1 gap-6 px-4 py-6 sm:px-6 lg:px-8 lg:grid-cols-[3fr_2fr]">
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <QuoteTypeSelector value="VOO" />
          {numero ? <span className="font-mono text-xs text-slate-400">{numero}</span> : null}
        </div>

        <UploadCard onExtract={handleExtract} loading={extractLoading} error={extractError} previewUrl={imagePreview} />
        {items.length > 0 && <FlightList items={items} onToggle={handleToggle} />}

        <QuoteExtrasForm extras={extras} onChange={setExtras} />

        <div className="flex flex-wrap justify-end gap-2">
          {existingQuote ? (
            <>
              <button
                type="button"
                onClick={handleSaveDraft}
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50"
              >
                Salvar rascunho
              </button>
              <button
                type="button"
                onClick={handleMarkSent}
                className="flex items-center gap-1.5 rounded-lg bg-slate-800 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-900"
              >
                <Send className="h-4 w-4" /> Marcar como enviada
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={handleCancel}
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleCreate}
                className="rounded-lg bg-teal-600 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-700"
              >
                Criar cotação
              </button>
            </>
          )}
        </div>
      </div>

      <div className="lg:sticky lg:top-6 lg:self-start">
        <PreviewPanel
          items={items}
          agency={agencyInfoPreview}
          pdfLoading={pdfLoading}
          pdfError={pdfError}
          quoteId={quoteId}
          proposalShare={proposalShare}
          onManageProposal={setProposalModal}
        />
      </div>

      {proposalModal === "theme" || proposalModal === "pdf" ? (
        <ThemeModal
          mode={proposalModal === "pdf" ? "pdf" : "link"}
          quoteId={quoteId}
          numero={numero}
          extras={extras}
          items={items}
          agency={agency}
          existingShare={proposalModal === "pdf" ? null : proposalShare}
          onClose={() => setProposalModal(null)}
          onGenerated={(share) => {
            setProposalShare(share);
            setProposalModal("share");
          }}
          onGeneratePdf={handleGeneratePdfWithTheme}
        />
      ) : null}

      {proposalModal === "share" && proposalShare ? (
        <ShareModal share={proposalShare} onClose={() => setProposalModal(null)} onUpdated={setProposalShare} />
      ) : null}
    </div>
  );
}
