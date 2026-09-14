"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { UploadCard } from "@/components/UploadCard";
import { FlightList } from "@/components/FlightList";
import { PreviewPanel } from "@/components/PreviewPanel";
import { QuoteTypeSelector } from "./QuoteTypeSelector";
import { QuoteExtrasForm, QuoteExtras } from "./QuoteExtrasForm";
import { useAppData } from "@/lib/store/AppDataContext";
import { buildAgencyInfoForQuote } from "@/lib/store/mergeAgencyInfo";
import { Quote } from "@/lib/store/types";
import { FlightRow, flightRowsToQuoteItems, QuoteItem } from "@/lib/types";
import { Send } from "lucide-react";

function extrasFromQuote(quote: Quote | undefined, defaults: QuoteExtras): QuoteExtras {
  if (!quote) return defaults;
  return {
    clientId: quote.clientId,
    responsavelId: quote.responsavelId,
    sellerName: quote.sellerName,
    sellerEmail: quote.sellerEmail,
    sellerPhone: quote.sellerPhone,
    destino: quote.destino,
    periodoInicio: quote.periodoInicio,
    periodoFim: quote.periodoFim,
    paymentMethod: quote.paymentMethod,
    validityDays: quote.validityDays,
    mensagemDestaque: quote.mensagemDestaque,
    observacoes: quote.observacoes,
  };
}

export function QuoteEditor({ existingQuote }: { existingQuote?: Quote }) {
  const router = useRouter();
  const { agency, createQuote, updateQuote } = useAppData();

  const defaults: QuoteExtras = {
    clientId: null,
    responsavelId: null,
    sellerName: agency.sellerName,
    sellerEmail: agency.email,
    sellerPhone: agency.phone,
    destino: "",
    periodoInicio: "",
    periodoFim: "",
    paymentMethod: "",
    validityDays: 3,
    mensagemDestaque: "Agradecemos a preferência! Seguem as opções de voo selecionadas para sua viagem.",
    observacoes: "Valores sujeitos a disponibilidade e alteração sem aviso prévio até a confirmação da reserva.",
  };

  const [quoteId, setQuoteId] = useState<string | null>(existingQuote?.id || null);
  const [numero, setNumero] = useState<string>(existingQuote?.numero || "");
  const [items, setItems] = useState<QuoteItem[]>(existingQuote?.flightItems || []);
  const [extras, setExtras] = useState<QuoteExtras>(extrasFromQuote(existingQuote, defaults));
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [extractLoading, setExtractLoading] = useState(false);
  const [extractError, setExtractError] = useState<string | null>(null);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [pdfError, setPdfError] = useState<string | null>(null);

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
    const selected = items.filter((i) => i.selected);
    const valorTotal = selected.length ? Math.min(...selected.map((i) => i.price)) : 0;
    const payload = {
      type: "VOO" as const,
      clientId: extras.clientId,
      responsavelId: extras.responsavelId,
      sellerName: extras.sellerName,
      sellerEmail: extras.sellerEmail,
      sellerPhone: extras.sellerPhone,
      destino: extras.destino,
      periodoInicio: extras.periodoInicio,
      periodoFim: extras.periodoFim,
      paymentMethod: extras.paymentMethod,
      validityDays: extras.validityDays,
      mensagemDestaque: extras.mensagemDestaque,
      observacoes: extras.observacoes,
      valorTotal,
      flightItems: items,
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

  const handleDownloadPdf = async () => {
    setPdfLoading(true);
    setPdfError(null);
    try {
      const { numero: numeroOrcamento } = persist();
      const agencyInfo = buildAgencyInfoForQuote(agency, extras);
      const res = await fetch("/api/pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items,
          agency: agencyInfo,
          numeroOrcamento,
          corPrimaria: agency.pdfCorPrimaria,
          corSecundaria: agency.pdfCorSecundaria,
          corTexto: agency.pdfCorTexto,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Falha ao gerar PDF.");
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${numeroOrcamento || "orcamento"}.pdf`;
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
    const { id } = persist("ENVIADA");
    toast.success("Cotação marcada como enviada.");
    router.push(`/cotacoes/${id}`);
  };

  const agencyInfoPreview = buildAgencyInfoForQuote(agency, extras);

  return (
    <div className="mx-auto grid max-w-6xl grid-cols-1 gap-6 px-4 py-6 sm:px-6 lg:grid-cols-2">
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <QuoteTypeSelector value="VOO" />
          {numero ? <span className="font-mono text-xs text-slate-400">{numero}</span> : null}
        </div>

        <UploadCard onExtract={handleExtract} loading={extractLoading} error={extractError} previewUrl={imagePreview} />
        {items.length > 0 && <FlightList items={items} onToggle={handleToggle} />}

        <QuoteExtrasForm extras={extras} onChange={setExtras} />

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={handleSaveDraft}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50"
          >
            Salvar rascunho
          </button>
          {quoteId ? (
            <button
              type="button"
              onClick={handleMarkSent}
              className="flex items-center gap-1.5 rounded-lg bg-slate-800 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-900"
            >
              <Send className="h-4 w-4" /> Marcar como enviada
            </button>
          ) : null}
        </div>
      </div>

      <div className="lg:sticky lg:top-6 lg:self-start">
        <PreviewPanel
          items={items}
          agency={agencyInfoPreview}
          onDownloadPdf={handleDownloadPdf}
          pdfLoading={pdfLoading}
          pdfError={pdfError}
        />
      </div>
    </div>
  );
}
