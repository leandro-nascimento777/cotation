"use client";

import { useState } from "react";
import { AgencyInfo, FlightLeg, QuoteItem } from "@/lib/types";
import { buildWhatsAppText } from "@/lib/whatsapp";
import { formatCurrencyBRL, validityDatePtBR } from "@/lib/format";
import { Check, Copy, Download, FileText, MessageCircle } from "lucide-react";

interface PreviewPanelProps {
  items: QuoteItem[];
  agency: AgencyInfo;
  onDownloadPdf: () => Promise<void>;
  pdfLoading: boolean;
  pdfError: string | null;
}

export function PreviewPanel({ items, agency, onDownloadPdf, pdfLoading, pdfError }: PreviewPanelProps) {
  const [tab, setTab] = useState<"whatsapp" | "pdf">("whatsapp");
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
            onClick={() => setTab("pdf")}
            className={`flex items-center gap-1 rounded-md px-3 py-1.5 text-xs font-semibold transition-colors ${
              tab === "pdf" ? "bg-white text-teal-700 shadow-sm" : "text-slate-500"
            }`}
          >
            <FileText className="h-3.5 w-3.5" /> PDF
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
        ) : (
          <button
            onClick={onDownloadPdf}
            disabled={selected.length === 0 || pdfLoading}
            className="flex items-center gap-1 rounded-lg bg-teal-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Download className="h-3.5 w-3.5" />
            {pdfLoading ? "Gerando…" : "Baixar PDF"}
          </button>
        )}
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
      ) : (
        <PdfMockPreview items={selected} agency={agency} />
      )}
    </div>
  );
}

function LegRow({ leg, label }: { leg: FlightLeg; label?: string }) {
  return (
    <div>
      {label ? <p className="mb-0.5 text-[7px] font-bold uppercase tracking-wide text-slate-400">{label}</p> : null}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[11px] font-bold">{leg.origin}</p>
          <p className="text-[9px] text-slate-500">Partida {leg.departureTime}</p>
        </div>
        <span className="text-slate-300">──────▶</span>
        <div className="text-right">
          <p className="text-[11px] font-bold">{leg.destination}</p>
          <p className="text-[9px] text-slate-500">Chegada {leg.arrivalTime}</p>
        </div>
      </div>
      <div className="mt-0.5 flex flex-wrap gap-x-3 text-[8px] text-slate-500">
        <span>Duração: <b className="text-slate-700">{leg.duration}</b></span>
        <span>Conexões: <b className="text-slate-700">{leg.stops === 0 ? "Voo direto" : leg.stops}</b></span>
      </div>
    </div>
  );
}

/** Renderiza um preview visual aproximado (HTML) do PDF — o layout real e
 * definitivo é gerado pelo template Jinja2 + WeasyPrint em pdf-template/
 * (ver src/lib/pdf/buildFlightQuoteData.ts e /api/pdf). As cores aqui
 * espelham as variáveis --cor-primaria/--cor-destaque do style.css. */
function PdfMockPreview({ items, agency }: { items: QuoteItem[]; agency: AgencyInfo }) {
  const minPrice = items.length ? Math.min(...items.map((i) => i.price)) : 0;
  return (
    <div className="max-h-[520px] overflow-y-auto rounded-lg border border-slate-200 bg-slate-50 p-3">
      <div className="mx-auto w-full max-w-[480px] bg-white p-5 text-[11px] shadow-sm">
        <div className="flex items-start justify-between border-b-2 border-[#1b4f8c] pb-2">
          <div className="flex items-start gap-2">
            {agency.logoDataUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={agency.logoDataUrl} alt="Logo" className="h-10 w-16 object-contain" />
            ) : (
              <div className="flex h-10 w-16 shrink-0 items-center justify-center rounded border border-dashed border-slate-300 text-[7px] font-bold text-slate-400">
                LOGO
              </div>
            )}
            <div>
              <p className="text-lg font-bold text-[#1b4f8c]">{agency.agencyName || "Agência de Viagens"}</p>
              {agency.branch ? <p className="text-[10px] text-slate-500">{agency.branch}</p> : null}
            </div>
          </div>
          <div className="text-right text-[9px] text-slate-500">
            <p>Orçamento nº</p>
            <p className="text-sm font-bold text-[#1b4f8c]">ORC-{new Date().getFullYear()}-XXXXXX</p>
            <p className="text-slate-400">Válido até {validityDatePtBR(agency.validityDays)}</p>
            <p>{[agency.sellerName, agency.phone, agency.email].filter(Boolean).join(" · ")}</p>
          </div>
        </div>

        {agency.message.trim() ? (
          <div className="mt-3 rounded bg-[#8a2be2] px-3 py-2 text-center text-[10px] font-bold text-white">
            {agency.message.trim()}
          </div>
        ) : null}

        <p className="mt-3 mb-2 text-[11px] font-bold text-[#1b4f8c]">
          Opções de Voo {items.length ? `(${items.length})` : ""}
        </p>

        {items.length === 0 ? (
          <p className="text-slate-400">Nenhuma opção selecionada.</p>
        ) : (
          items.map((item, idx) => (
            <div key={`${item.rowId}-${item.fareId}`} className="mb-2 overflow-hidden rounded border border-slate-200">
              <div className="flex items-center justify-between bg-[#1b4f8c] px-2 py-1 text-white">
                <span className="text-[9px] font-bold">
                  Opção {idx + 1}
                  {item.volta ? " · Ida e volta" : ""} · {item.ida.airline} {item.ida.flightNumber} · {item.ida.date}
                </span>
                <span className="text-[10px] font-bold">{formatCurrencyBRL(item.price)}</span>
              </div>
              <div className="px-2 py-1.5">
                <LegRow leg={item.ida} label={item.volta ? "IDA" : undefined} />
                {item.volta ? (
                  <div className="mt-1 border-t border-slate-100 pt-1">
                    <LegRow leg={item.volta} label="VOLTA" />
                  </div>
                ) : null}
                <div className="mt-1 flex flex-wrap gap-x-3 border-t border-slate-100 pt-1 text-[8px] text-slate-500">
                  <span>Bagagem: <b className="text-slate-700">{item.baggage} ({item.fareLabel})</b></span>
                </div>
              </div>
            </div>
          ))
        )}

        {items.length > 1 ? (
          <div className="mt-1 flex items-center justify-between rounded border border-slate-200 bg-slate-50 px-3 py-2">
            <span className="text-[10px] text-slate-600">Valor a partir de</span>
            <span className="text-[13px] font-bold text-[#1b4f8c]">{formatCurrencyBRL(minPrice)}</span>
          </div>
        ) : null}

        {agency.notes.trim() ? (
          <div className="mt-3 border-t border-slate-200 pt-2">
            <p className="text-[9px] font-bold text-slate-600">Informações importantes</p>
            <p className="text-[8px] leading-relaxed text-slate-500">{agency.notes.trim()}</p>
          </div>
        ) : null}
      </div>
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
