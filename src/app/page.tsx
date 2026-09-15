"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useAppData } from "@/lib/store/AppDataContext";
import { PageHeader } from "@/components/shell/PageHeader";
import { EmptyState } from "@/components/shell/EmptyState";
import { StatusBadge } from "@/components/shell/StatusBadge";
import { StatTile } from "@/components/dashboard/StatTile";
import { MonthlyQuotesChart, MonthlyPoint } from "@/components/dashboard/MonthlyQuotesChart";
import { NewQuoteButton } from "@/components/shell/NewQuoteButton";
import { formatCurrencyBRL } from "@/lib/format";
import { DollarSign, Percent, Receipt, Users } from "lucide-react";

const MONTH_LABEL = new Intl.DateTimeFormat("pt-BR", { month: "short" });

function monthKey(date: Date): string {
  return `${date.getFullYear()}-${date.getMonth()}`;
}

export default function DashboardPage() {
  const { quotes, clients, hydrated } = useAppData();

  const metrics = useMemo(() => {
    const now = new Date();
    const currentKey = monthKey(now);
    const prevDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const prevKey = monthKey(prevDate);

    const quotesThisMonth = quotes.filter((q) => monthKey(new Date(q.createdAt)) === currentKey);
    const quotesPrevMonth = quotes.filter((q) => monthKey(new Date(q.createdAt)) === prevKey);
    // Só conta como venda a partir do "Fechar venda" (ver QuoteDetailModal),
    // não só por chegar na coluna Aprovada do board.
    const approvedThisMonth = quotesThisMonth.filter((q) => q.saleClosed);
    const approvedPrevMonth = quotesPrevMonth.filter((q) => q.saleClosed);

    const vendasMes = approvedThisMonth.reduce((sum, q) => sum + (q.valorTotal || 0), 0);
    const conversionThisMonth = quotesThisMonth.length
      ? (approvedThisMonth.length / quotesThisMonth.length) * 100
      : 0;
    const conversionPrevMonth = quotesPrevMonth.length
      ? (approvedPrevMonth.length / quotesPrevMonth.length) * 100
      : 0;

    const chart: MonthlyPoint[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = monthKey(d);
      const gerados = quotes.filter((q) => monthKey(new Date(q.createdAt)) === key).length;
      const fechados = quotes.filter((q) => q.saleClosed && monthKey(new Date(q.updatedAt)) === key).length;
      chart.push({ label: MONTH_LABEL.format(d), gerados, fechados });
    }

    return {
      vendasMes,
      countMes: quotesThisMonth.length,
      conversionThisMonth,
      deltaConversion: conversionThisMonth - conversionPrevMonth,
      chart,
    };
  }, [quotes]);

  const recentQuotes = useMemo(
    () => [...quotes].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 5),
    [quotes]
  );
  const recentClients = useMemo(
    () => [...clients].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 5),
    [clients]
  );
  const clientName = (id: string | null) => (id ? clients.find((c) => c.id === id)?.nomeCompleto : undefined);

  if (!hydrated) {
    return <div className="flex h-full items-center justify-center py-24 text-sm text-slate-400">Carregando…</div>;
  }

  return (
    <div>
      <PageHeader
        title="Dashboard"
        description="Visão geral das cotações e vendas da agência."
        action={<NewQuoteButton />}
      />

      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
        {quotes.length === 0 ? (
          <EmptyState
            icon={Receipt}
            title="Ainda sem dados para mostrar"
            description="Assim que você criar cotações, as métricas de vendas e conversão aparecem aqui."
            action={<NewQuoteButton className="mt-2" />}
          />
        ) : (
          <>
            <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
              <StatTile label="Vendas no mês" value={formatCurrencyBRL(metrics.vendasMes)} icon={DollarSign} />
              <StatTile label="Orçamentos no mês" value={String(metrics.countMes)} icon={Receipt} />
              <StatTile
                label="Taxa de conversão"
                value={`${metrics.conversionThisMonth.toFixed(0)}%`}
                icon={Percent}
                delta={metrics.deltaConversion}
              />
            </div>

            <div className="mb-6 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <h2 className="mb-4 text-sm font-semibold text-slate-700">Últimos 6 meses</h2>
              <MonthlyQuotesChart data={metrics.chart} />
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <section>
                <div className="mb-2 flex items-center justify-between">
                  <h2 className="text-sm font-semibold text-slate-700">Últimas cotações</h2>
                  <Link href="/cotacoes" className="text-xs font-medium text-teal-700 hover:underline">
                    Ver todas
                  </Link>
                </div>
                <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                  {recentQuotes.map((quote) => (
                    <Link
                      key={quote.id}
                      href={`/cotacoes/${quote.id}`}
                      className="flex items-center justify-between border-b border-slate-100 px-4 py-2.5 text-sm last:border-0 hover:bg-slate-50"
                    >
                      <div>
                        <p className="font-mono text-xs font-semibold text-slate-800">{quote.numero}</p>
                        <p className="text-xs text-slate-400">{clientName(quote.clientId) || quote.destino || "—"}</p>
                      </div>
                      <StatusBadge status={quote.status} />
                    </Link>
                  ))}
                </div>
              </section>

              <section>
                <div className="mb-2 flex items-center justify-between">
                  <h2 className="text-sm font-semibold text-slate-700">Clientes recentes</h2>
                  <Link href="/clientes" className="text-xs font-medium text-teal-700 hover:underline">
                    Ver todos
                  </Link>
                </div>
                {recentClients.length === 0 ? (
                  <EmptyState icon={Users} title="Nenhum cliente ainda" description="Cadastre clientes para vinculá-los às cotações." />
                ) : (
                  <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                    {recentClients.map((client) => (
                      <Link
                        key={client.id}
                        href={`/clientes/${client.id}`}
                        className="flex items-center justify-between border-b border-slate-100 px-4 py-2.5 text-sm last:border-0 hover:bg-slate-50"
                      >
                        <span className="font-medium text-slate-800">{client.nomeCompleto}</span>
                        <span className="text-xs text-slate-400">{client.cidade || client.telefone || ""}</span>
                      </Link>
                    ))}
                  </div>
                )}
              </section>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
