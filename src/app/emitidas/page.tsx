"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { useAppData } from "@/lib/store/AppDataContext";
import { buildIssuedQuoteRows } from "@/lib/store/issuedQuotes";
import { PageHeader } from "@/components/shell/PageHeader";
import { LoadingState } from "@/components/shell/LoadingState";
import { EmptyState } from "@/components/shell/EmptyState";
import { formatCurrencyBRL } from "@/lib/format";
import { BadgeCheck } from "lucide-react";

const EmitidasPage = () => {
  const router = useRouter();
  const { quotes, reservations, clients, hydrated } = useAppData();

  const rows = useMemo(() => buildIssuedQuoteRows(quotes, reservations, clients), [quotes, reservations, clients]);

  if (!hydrated) {
    return <LoadingState />;
  }

  return (
    <div>
      <PageHeader title="Emitidas" description="Reservas emitidas e finalizadas, fora do funil de cotações." />

      <div className="w-full px-4 py-6 sm:px-6 lg:px-8">
        {rows.length === 0 ? (
          <EmptyState
            icon={BadgeCheck}
            title="Nenhuma reserva finalizada"
            description="Em Cotações, use o botão Finalizar reserva num card da coluna Aprovadas depois de emitir a reserva."
          />
        ) : (
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="w-full overflow-x-auto">
              <table className="w-full min-w-[800px] border-collapse text-left">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/50 text-xs font-bold tracking-wider text-slate-400 uppercase">
                    <th className="px-5 py-3">Cliente</th>
                    <th className="px-5 py-3">Destino</th>
                    <th className="px-5 py-3 text-center">Viajantes</th>
                    <th className="px-5 py-3 text-right">Valor</th>
                    <th className="px-5 py-3">Forma de pagamento</th>
                    <th className="px-5 py-3">PNR</th>
                    <th className="px-5 py-3">Nº bilhete</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {rows.map((row) => (
                    <tr
                      key={row.quoteId}
                      onClick={() => router.push(row.reservationId ? `/reservas/${row.reservationId}` : `/cotacoes/${row.quoteId}`)}
                      className="cursor-pointer transition hover:bg-slate-50/70"
                    >
                      <td className="px-5 py-3 font-semibold text-slate-900">{row.clienteNome || "—"}</td>
                      <td className="px-5 py-3 text-slate-700">{row.destino || "—"}</td>
                      <td className="px-5 py-3 text-center text-slate-700">{row.viajantes}</td>
                      <td className="px-5 py-3 text-right font-semibold text-slate-900">
                        {row.valor ? formatCurrencyBRL(row.valor) : "—"}
                      </td>
                      <td className="px-5 py-3 text-slate-700">{row.formaPagamento || "—"}</td>
                      <td className="px-5 py-3 font-mono text-xs font-semibold text-slate-800">{row.pnr || "—"}</td>
                      <td className="px-5 py-3 font-mono text-xs text-slate-600">{row.bilhete || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmitidasPage;
