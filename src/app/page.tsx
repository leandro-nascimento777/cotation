"use client";

import { useState } from "react";
import { UploadCard } from "@/components/UploadCard";
import { FlightList } from "@/components/FlightList";
import { AgencyForm } from "@/components/AgencyForm";
import { PreviewPanel } from "@/components/PreviewPanel";
import { AgencyInfo, defaultAgencyInfo, FlightRow, flightRowsToQuoteItems, QuoteItem } from "@/lib/types";
import { PlaneTakeoff, Trash2 } from "lucide-react";

export default function Home() {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [items, setItems] = useState<QuoteItem[]>([]);
  const [agency, setAgency] = useState<AgencyInfo>(defaultAgencyInfo);
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
      setItems([]);
    } finally {
      setExtractLoading(false);
    }
  };

  const handleClear = () => {
    setImagePreview(null);
    setItems([]);
    setExtractError(null);
    setPdfError(null);
  };

  const handleToggle = (rowId: string, fareId: string) => {
    setItems((prev) =>
      prev.map((item) =>
        item.rowId === rowId && item.fareId === fareId
          ? { ...item, selected: !item.selected }
          : item
      )
    );
  };

  const handleDownloadPdf = async () => {
    setPdfLoading(true);
    setPdfError(null);
    try {
      const res = await fetch("/api/pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items, agency }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Falha ao gerar PDF.");
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "orcamento.pdf";
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      setPdfError(err instanceof Error ? err.message : "Erro desconhecido.");
    } finally {
      setPdfLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center gap-2 px-4 py-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-teal-600">
            <PlaneTakeoff className="h-5 w-5 text-white" />
          </div>
          <div className="flex-1">
            <h1 className="text-lg font-bold text-slate-900">Gerador de Orçamento</h1>
            <p className="text-xs text-slate-500">Print de voos → orçamento pronto para WhatsApp e PDF</p>
          </div>
          {imagePreview || items.length > 0 ? (
            <button
              type="button"
              onClick={handleClear}
              className="flex items-center gap-1.5 rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-600 hover:border-red-300 hover:bg-red-50 hover:text-red-600"
            >
              <Trash2 className="h-3.5 w-3.5" /> Limpar orçamento
            </button>
          ) : null}
        </div>
      </header>

      <main className="mx-auto grid max-w-6xl grid-cols-1 gap-6 px-4 py-6 lg:grid-cols-2">
        <div className="flex flex-col gap-6">
          <UploadCard
            onExtract={handleExtract}
            loading={extractLoading}
            error={extractError}
            previewUrl={imagePreview}
          />
          {items.length > 0 && <FlightList items={items} onToggle={handleToggle} />}
          <AgencyForm agency={agency} onChange={setAgency} />
        </div>

        <div className="lg:sticky lg:top-6 lg:self-start">
          <PreviewPanel
            items={items}
            agency={agency}
            onDownloadPdf={handleDownloadPdf}
            pdfLoading={pdfLoading}
            pdfError={pdfError}
          />
        </div>
      </main>
    </div>
  );
}
