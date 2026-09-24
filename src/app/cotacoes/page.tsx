"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useAppData } from "@/lib/store/AppDataContext";
import { useQuoteBoard } from "@/hooks/useQuoteBoard";
import { PageHeader } from "@/components/shell/PageHeader";
import { EmptyState } from "@/components/shell/EmptyState";
import { LoadingState } from "@/components/shell/LoadingState";
import { StatTile } from "@/components/dashboard/StatTile";
import { NewQuoteButton } from "@/components/shell/NewQuoteButton";
import { QuoteDetailModal } from "@/components/cotacoes/QuoteDetailModal";
import { IssueReservationModal } from "@/components/reservas/IssueReservationModal";
import { formatCurrencyBRL, formatWhatsAppLink } from "@/lib/format";
import {
  QUOTE_PRIORITY_LABEL,
  QUOTE_STATUS_COLUMN_LABEL,
  QUOTE_STATUS_ORDER,
  QuotePriorityType,
  QuoteStatusType,
  Quote,
} from "@/lib/store/types";
import { BadgeCheck, CheckCircle2, Clock, Filter, MessageCircle, Receipt, Search, TrendingUp, Sparkles } from "lucide-react";

const COLUMN_COLOR: Record<QuoteStatusType, { bar: string; dot: string }> = {
  RASCUNHO: { bar: "border-t-slate-400", dot: "bg-slate-400" },
  ENVIADA: { bar: "border-t-blue-500", dot: "bg-blue-500" },
  AGUARDANDO: { bar: "border-t-amber-500", dot: "bg-amber-500" },
  APROVADA: { bar: "border-t-green-500", dot: "bg-green-500" },
};

const PRIORITY_STYLE: Record<QuotePriorityType, string> = {
  BAIXA: "bg-slate-100 text-slate-500",
  NORMAL: "bg-slate-100 text-slate-600",
  ALTA: "bg-red-50 text-red-600",
};

export default function CotacoesPage() {
  const { quotes, clients, updateQuote, hydrated } = useAppData();

  const {
    query,
    setQuery,
    priorityFilter,
    setPriorityFilter,
    filtersOpen,
    setFiltersOpen,
    setDragId,
    dragOverStatus,
    setDragOverStatus,
    selectedQuoteId,
    setSelectedQuoteId,
    modalInitialMode,
    setModalInitialMode,
    clientNameById,
    clientPhoneById,
    byStatus,
    stats,
    handleDrop,
  } = useQuoteBoard({ quotes, clients, updateQuote, hydrated });

  const [issuingQuote, setIssuingQuote] = useState<Quote | null>(null);

  /** Tira a cotação do board e a leva para /emitidas (com desfazer). */
  const handleFinalize = (quote: Quote) => {
    updateQuote(quote.id, { finalizedAt: new Date().toISOString() });
    toast.success(`Reserva ${quote.bookingRef || quote.numero} finalizada — movida para Emitidas.`, {
      action: { label: "Desfazer", onClick: () => updateQuote(quote.id, { finalizedAt: null }) },
    });
  };

  if (!hydrated) {
    return <LoadingState />;
  }

  return (
    <div>
      <PageHeader title="Cotações" description="Acompanhe o funil de cotações da agência." />

      <div className="w-full px-4 py-6 sm:px-6 lg:px-8 space-y-6">
        {quotes.length === 0 ? (
          <EmptyState
            icon={Receipt}
            title="Nenhuma cotação ainda"
            description="Crie sua primeira cotação a partir de um print da tela de voos."
            action={<NewQuoteButton className="mt-2" />}
          />
        ) : (
          <>
            <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
              <StatTile label="Total de cotações" value={String(stats.total)} icon={Receipt} />
              <StatTile label="Aguardando resposta" value={String(stats.aguardandoResposta)} icon={Clock} />
              <StatTile label="Valor total" value={formatCurrencyBRL(stats.valorTotal)} icon={TrendingUp} />
            </div>

            <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
              <div className="relative flex flex-1 flex-wrap gap-2">
                <div className="relative flex-1 sm:flex-none sm:min-w-[320px]">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Buscar por cliente, destino…"
                    className="w-full rounded-lg border border-slate-300 bg-white py-2 pl-9 pr-3 text-sm text-slate-800 focus:border-teal-500 focus:outline-none"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setFiltersOpen((v) => !v)}
                  className="flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
                >
                  <Filter className="h-4 w-4" /> Filtros
                </button>
                {filtersOpen ? (
                  <div className="absolute top-full right-0 z-10 mt-1 w-56 rounded-lg border border-slate-200 bg-white p-3 shadow-lg">
                    <label className="flex flex-col gap-1 text-xs font-medium text-slate-600">
                      Prioridade
                      <select
                        value={priorityFilter}
                        onChange={(e) => setPriorityFilter(e.target.value as QuotePriorityType | "")}
                        className="rounded-lg border border-slate-300 px-2 py-1.5 text-sm text-slate-800 focus:border-teal-500 focus:outline-none"
                      >
                        <option value="">Todas</option>
                        {Object.entries(QUOTE_PRIORITY_LABEL).map(([value, label]) => (
                          <option key={value} value={value}>
                            {label}
                          </option>
                        ))}
                      </select>
                    </label>
                    {priorityFilter ? (
                      <button
                        type="button"
                        onClick={() => setPriorityFilter("")}
                        className="mt-2 text-xs font-medium text-teal-700 hover:underline"
                      >
                        Limpar filtro
                      </button>
                    ) : null}
                  </div>
                ) : null}
              </div>
              <NewQuoteButton />
            </div>

            <div className="-mx-4 overflow-x-auto px-4 pb-2 sm:-mx-6 sm:px-6">
              <div className="grid grid-flow-col auto-cols-[minmax(260px,1fr)] gap-4">
                {QUOTE_STATUS_ORDER.map((status) => {
                  const columnQuotes = byStatus.get(status) || [];
                  const color = COLUMN_COLOR[status];
                  return (
                    <div
                      key={status}
                      onDragOver={(e) => {
                        e.preventDefault();
                        setDragOverStatus(status);
                      }}
                      onDragLeave={() => setDragOverStatus((s) => (s === status ? null : s))}
                      onDrop={(e) => {
                        e.preventDefault();
                        handleDrop(status);
                      }}
                      className={`flex flex-col rounded-xl border border-t-4 bg-white shadow-sm ${color.bar} ${
                        dragOverStatus === status ? "ring-2 ring-teal-400" : ""
                      }`}
                    >
                      <div className="flex items-center justify-between border-b border-slate-100 px-3 py-2.5">
                        <span className="flex items-center gap-1.5 text-xs font-bold tracking-wide text-slate-700 uppercase">
                          <span className={`h-1.5 w-1.5 rounded-full ${color.dot}`} />
                          {QUOTE_STATUS_COLUMN_LABEL[status]}
                        </span>
                        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-500">
                          {columnQuotes.length}
                        </span>
                      </div>

                      <div className="flex min-h-[120px] flex-1 flex-col gap-2 p-2.5">
                        {columnQuotes.length === 0 ? (
                          <p className="py-6 text-center text-xs text-slate-400">Arraste cotações aqui</p>
                        ) : (
                          columnQuotes.map((quote) => {
                            const phone = quote.clientId ? clientPhoneById.get(quote.clientId) : undefined;
                            const waLink = phone ? formatWhatsAppLink(phone) : null;
                            return (
                              <div
                                key={quote.id}
                                draggable
                                onDragStart={() => setDragId(quote.id)}
                                onDragEnd={() => {
                                  setDragId(null);
                                  setDragOverStatus(null);
                                }}
                                onClick={() => {
                                  setModalInitialMode("view");
                                  setSelectedQuoteId(quote.id);
                                }}
                                className="cursor-grab rounded-lg border border-slate-200 bg-white p-3 shadow-sm hover:border-teal-300 active:cursor-grabbing"
                              >
                                <div className="mb-2 flex items-center justify-between gap-2">
                                  <span className="rounded bg-slate-50 px-1.5 py-0.5 font-mono text-[11px] font-semibold text-slate-600">
                                    {quote.numero}
                                  </span>
                                  <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${PRIORITY_STYLE[quote.priority]}`}>
                                    — {QUOTE_PRIORITY_LABEL[quote.priority]}
                                  </span>
                                </div>
                                <p className="mb-2 truncate text-sm font-bold text-slate-800">
                                  {(quote.clientId ? clientNameById.get(quote.clientId) : undefined)?.toUpperCase() ||
                                    quote.destino?.toUpperCase() ||
                                    "SEM CLIENTE"}
                                </p>
                                <div className="flex items-center justify-between gap-2 border-t border-slate-100 pt-2">
                                  <div>
                                    <p className="text-[10px] font-semibold tracking-wide text-slate-400 uppercase">Valor</p>
                                    <p className="text-sm font-bold text-slate-800">
                                      {quote.valorTotal ? formatCurrencyBRL(quote.valorTotal) : "—"}
                                    </p>
                                  </div>
                                  {waLink ? (
                                    <a
                                      href={waLink}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      onClick={(e) => e.stopPropagation()}
                                      className="flex items-center gap-1 rounded-full bg-green-50 px-2 py-1 text-[11px] font-medium text-green-700 hover:bg-green-100"
                                    >
                                      <MessageCircle className="h-3 w-3" /> {phone}
                                    </a>
                                  ) : null}
                                </div>
                                {status === "APROVADA" ? (
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setIssuingQuote(quote);
                                    }}
                                    className={`mt-2 flex w-full items-center justify-center gap-1.5 rounded-lg px-2 py-1.5 text-xs font-bold transition shadow-sm cursor-pointer ${
                                      quote.saleClosed
                                        ? "bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100"
                                        : "bg-teal-600 text-white hover:bg-teal-700"
                                    }`}
                                  >
                                    {quote.saleClosed ? (
                                      <>
                                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                                        Reserva emitida {quote.bookingRef ? `(${quote.bookingRef})` : ""}
                                      </>
                                    ) : (
                                      <>
                                        <Sparkles className="h-3.5 w-3.5" /> Emitir reserva
                                      </>
                                    )}
                                  </button>
                                ) : null}
                                {status === "APROVADA" && quote.saleClosed ? (
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleFinalize(quote);
                                    }}
                                    className="mt-1.5 flex w-full items-center justify-center gap-1.5 rounded-lg bg-slate-800 px-2 py-1.5 text-xs font-bold text-white shadow-sm transition hover:bg-slate-900 cursor-pointer"
                                  >
                                    <BadgeCheck className="h-3.5 w-3.5" /> Finalizar reserva
                                  </button>
                                ) : null}
                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </div>

      {selectedQuoteId ? (
        <QuoteDetailModal
          key={selectedQuoteId}
          quoteId={selectedQuoteId}
          initialMode={modalInitialMode}
          onClose={() => setSelectedQuoteId(null)}
        />
      ) : null}

      {issuingQuote ? (
        <IssueReservationModal
          open={Boolean(issuingQuote)}
          onClose={() => setIssuingQuote(null)}
          quote={issuingQuote}
          initialCustomerName={
            (issuingQuote.clientId ? clientNameById.get(issuingQuote.clientId) : undefined) ||
            issuingQuote.sellerName
          }
          initialDestination={issuingQuote.destino}
        />
      ) : null}
    </div>
  );
}
