"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { useAppData } from "@/lib/store/AppDataContext";
import { PageHeader } from "@/components/shell/PageHeader";
import { EmptyState } from "@/components/shell/EmptyState";
import { StatusBadge } from "@/components/shell/StatusBadge";
import { formatCurrencyBRL } from "@/lib/format";
import { QUOTE_STATUS_LABEL, QuoteStatusType } from "@/lib/store/types";
import { Copy, Plus, Receipt, Search } from "lucide-react";

export default function CotacoesPage() {
  const { quotes, clients, duplicateQuote, hydrated } = useAppData();
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<QuoteStatusType | "">("");

  const clientNameById = useMemo(
    () => new Map(clients.map((c) => [c.id, c.nomeCompleto])),
    [clients]
  );
  const clientName = (id: string | null) => (id ? clientNameById.get(id) : undefined);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return quotes
      .filter((quote) => !statusFilter || quote.status === statusFilter)
      .filter((quote) => {
        if (!q) return true;
        return [quote.numero, quote.destino, clientNameById.get(quote.clientId || "")]
          .filter(Boolean)
          .some((f) => f!.toLowerCase().includes(q));
      })
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }, [quotes, query, statusFilter, clientNameById]);

  const handleDuplicate = (id: string) => {
    const copy = duplicateQuote(id);
    if (copy) toast.success(`Cotação duplicada como ${copy.numero}.`);
  };

  if (!hydrated) {
    return <div className="flex h-full items-center justify-center py-24 text-sm text-slate-400">Carregando…</div>;
  }

  return (
    <div>
      <PageHeader
        title="Cotações"
        description="Todas as cotações geradas pela agência."
        action={
          <Link
            href="/cotacoes/nova"
            className="flex items-center gap-1.5 rounded-lg bg-teal-600 px-3 py-2 text-sm font-semibold text-white hover:bg-teal-700"
          >
            <Plus className="h-4 w-4" /> Nova cotação
          </Link>
        }
      />

      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
        {quotes.length === 0 ? (
          <EmptyState
            icon={Receipt}
            title="Nenhuma cotação ainda"
            description="Crie sua primeira cotação a partir de um print da tela de voos."
            action={
              <Link
                href="/cotacoes/nova"
                className="mt-2 flex items-center gap-1.5 rounded-lg bg-teal-600 px-3 py-2 text-sm font-semibold text-white hover:bg-teal-700"
              >
                <Plus className="h-4 w-4" /> Nova cotação
              </Link>
            }
          />
        ) : (
          <>
            <div className="mb-4 flex flex-wrap gap-2">
              <div className="relative flex-1 sm:flex-none sm:min-w-[280px]">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Buscar por número, destino ou cliente…"
                  className="w-full rounded-lg border border-slate-300 bg-white py-2 pl-9 pr-3 text-sm text-slate-800 focus:border-teal-500 focus:outline-none"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as QuoteStatusType | "")}
                className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 focus:border-teal-500 focus:outline-none"
              >
                <option value="">Todos os status</option>
                {Object.entries(QUOTE_STATUS_LABEL).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-4 py-2.5">Número</th>
                    <th className="hidden px-4 py-2.5 sm:table-cell">Cliente</th>
                    <th className="hidden px-4 py-2.5 md:table-cell">Destino</th>
                    <th className="px-4 py-2.5 text-right">Valor</th>
                    <th className="px-4 py-2.5 text-right">Status</th>
                    <th className="px-4 py-2.5" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filtered.map((quote) => (
                    <tr key={quote.id} className="hover:bg-slate-50">
                      <td className="px-4 py-2.5">
                        <Link href={`/cotacoes/${quote.id}`} className="font-mono text-xs font-semibold text-slate-800 hover:text-teal-700">
                          {quote.numero}
                        </Link>
                        <p className="text-xs text-slate-400">
                          {new Date(quote.createdAt).toLocaleDateString("pt-BR")}
                        </p>
                      </td>
                      <td className="hidden px-4 py-2.5 text-slate-600 sm:table-cell">
                        {clientName(quote.clientId) || "—"}
                      </td>
                      <td className="hidden px-4 py-2.5 text-slate-600 md:table-cell">{quote.destino || "—"}</td>
                      <td className="px-4 py-2.5 text-right text-slate-700">
                        {quote.valorTotal ? formatCurrencyBRL(quote.valorTotal) : "—"}
                      </td>
                      <td className="px-4 py-2.5 text-right">
                        <StatusBadge status={quote.status} />
                      </td>
                      <td className="px-4 py-2.5 text-right">
                        <button
                          type="button"
                          onClick={() => handleDuplicate(quote.id)}
                          title="Duplicar cotação"
                          className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                        >
                          <Copy className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-6 text-center text-sm text-slate-400">
                        Nenhuma cotação encontrada.
                      </td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
