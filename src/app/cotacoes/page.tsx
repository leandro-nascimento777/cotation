"use client";

import { useMemo, useState } from "react";
import { useAppData } from "@/lib/store/AppDataContext";
import { PageHeader } from "@/components/shell/PageHeader";
import { EmptyState } from "@/components/shell/EmptyState";
import { StatTile } from "@/components/dashboard/StatTile";
import { NewQuoteButton } from "@/components/shell/NewQuoteButton";
import { QuoteDetailModal } from "@/components/cotacoes/QuoteDetailModal";
import { formatCurrencyBRL } from "@/lib/format";
import {
  QUOTE_PRIORITY_LABEL,
  QUOTE_STATUS_LABEL,
  QUOTE_STATUS_ORDER,
  Quote,
  QuotePriorityType,
  QuoteStatusType,
} from "@/lib/store/types";
import { Clock, Filter, MessageCircle, Receipt, Search, TrendingUp } from "lucide-react";

const COLUMN_COLOR: Record<QuoteStatusType, { bar: string; dot: string }> = {
  NOVA: { bar: "border-t-indigo-500", dot: "bg-indigo-500" },
  EM_ATENDIMENTO: { bar: "border-t-amber-500", dot: "bg-amber-500" },
  PROPOSTA_ENVIADA: { bar: "border-t-blue-500", dot: "bg-blue-500" },
  AGUARDANDO_CLIENTE: { bar: "border-t-purple-500", dot: "bg-purple-500" },
  APROVADA: { bar: "border-t-green-500", dot: "bg-green-500" },
};

const PRIORITY_STYLE: Record<QuotePriorityType, string> = {
  BAIXA: "bg-slate-100 text-slate-500",
  NORMAL: "bg-slate-100 text-slate-600",
  ALTA: "bg-red-50 text-red-600",
};

/** Link "wa.me" a partir de um telefone livremente formatado (assume DDI 55
 * quando o número não já inclui um código de país). */
function whatsappLink(phone: string): string | null {
  const digits = phone.replace(/\D/g, "");
  if (digits.length < 10) return null;
  const withCountryCode = digits.length <= 11 ? `55${digits}` : digits;
  return `https://wa.me/${withCountryCode}`;
}

export default function CotacoesPage() {
  const { quotes, clients, updateQuote, hydrated } = useAppData();
  const [query, setQuery] = useState("");
  const [priorityFilter, setPriorityFilter] = useState<QuotePriorityType | "">("");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [dragId, setDragId] = useState<string | null>(null);
  const [dragOverStatus, setDragOverStatus] = useState<QuoteStatusType | null>(null);
  const [selectedQuoteId, setSelectedQuoteId] = useState<string | null>(null);

  const clientNameById = useMemo(() => new Map(clients.map((c) => [c.id, c.nomeCompleto])), [clients]);
  const clientPhoneById = useMemo(() => new Map(clients.map((c) => [c.id, c.telefone])), [clients]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return quotes
      .filter((quote) => !priorityFilter || quote.priority === priorityFilter)
      .filter((quote) => {
        if (!q) return true;
        return [quote.numero, quote.destino, clientNameById.get(quote.clientId || "")]
          .filter(Boolean)
          .some((f) => f!.toLowerCase().includes(q));
      });
  }, [quotes, query, priorityFilter, clientNameById]);

  const byStatus = useMemo(() => {
    const map = new Map<QuoteStatusType, Quote[]>();
    for (const status of QUOTE_STATUS_ORDER) map.set(status, []);
    for (const quote of [...filtered].sort((a, b) => b.createdAt.localeCompare(a.createdAt))) {
      map.get(quote.status)?.push(quote);
    }
    return map;
  }, [filtered]);

  const stats = useMemo(
    () => ({
      total: quotes.length,
      aguardandoResposta: quotes.filter((q) => q.status === "AGUARDANDO_CLIENTE").length,
      valorTotal: quotes.reduce((sum, q) => sum + (q.valorTotal || 0), 0),
    }),
    [quotes]
  );

  const handleDrop = (status: QuoteStatusType) => {
    setDragOverStatus(null);
    if (dragId) updateQuote(dragId, { status });
    setDragId(null);
  };

  if (!hydrated) {
    return <div className="flex h-full items-center justify-center py-24 text-sm text-slate-400">Carregando…</div>;
  }

  return (
    <div>
      <PageHeader title="Cotações" description="Acompanhe o funil de cotações da agência." />

      <div className="mx-auto max-w-[1600px] px-4 py-6 sm:px-6">
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
                          {QUOTE_STATUS_LABEL[status]}
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
                            const waLink = phone ? whatsappLink(phone) : null;
                            return (
                              <div
                                key={quote.id}
                                draggable
                                onDragStart={() => setDragId(quote.id)}
                                onDragEnd={() => {
                                  setDragId(null);
                                  setDragOverStatus(null);
                                }}
                                onClick={() => setSelectedQuoteId(quote.id)}
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
        <QuoteDetailModal quoteId={selectedQuoteId} onClose={() => setSelectedQuoteId(null)} />
      ) : null}
    </div>
  );
}
