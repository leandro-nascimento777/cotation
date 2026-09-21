"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useAppData } from "@/lib/store/AppDataContext";
import { PageHeader } from "@/components/shell/PageHeader";
import { EmptyState } from "@/components/shell/EmptyState";
import { LoadingState } from "@/components/shell/LoadingState";
import { Plus, Search, Users } from "lucide-react";

export default function ClientesPage() {
  const { clients, quotes, hydrated } = useAppData();
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return clients;
    return clients.filter((c) =>
      [c.nomeCompleto, c.email, c.telefone, c.cidade].some((f) => f.toLowerCase().includes(q))
    );
  }, [clients, query]);

  const quoteCount = (clientId: string) => quotes.filter((q) => q.clientId === clientId).length;

  if (!hydrated) {
    return <LoadingState />;
  }

  return (
    <div>
      <PageHeader
        title="Clientes"
        description="Carteira de clientes da agência."
        action={
          <Link
            href="/clientes/novo"
            className="flex items-center gap-1.5 rounded-lg bg-teal-600 px-3 py-2 text-sm font-semibold text-white hover:bg-teal-700"
          >
            <Plus className="h-4 w-4" /> Novo cliente
          </Link>
        }
      />

      <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6">
        {clients.length === 0 ? (
          <EmptyState
            icon={Users}
            title="Nenhum cliente cadastrado ainda"
            description="Cadastre seu primeiro cliente para vincular às cotações e acompanhar o histórico de vendas."
            action={
              <Link
                href="/clientes/novo"
                className="mt-2 flex items-center gap-1.5 rounded-lg bg-teal-600 px-3 py-2 text-sm font-semibold text-white hover:bg-teal-700"
              >
                <Plus className="h-4 w-4" /> Novo cliente
              </Link>
            }
          />
        ) : (
          <>
            <div className="relative mb-4">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar por nome, e-mail, telefone ou cidade…"
                className="w-full rounded-lg border border-slate-300 bg-white py-2 pl-9 pr-3 text-sm text-slate-800 focus:border-teal-500 focus:outline-none"
              />
            </div>

            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-4 py-2.5">Nome</th>
                    <th className="hidden px-4 py-2.5 sm:table-cell">Contato</th>
                    <th className="hidden px-4 py-2.5 md:table-cell">Cidade</th>
                    <th className="px-4 py-2.5 text-right">Cotações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filtered.map((client) => (
                    <tr key={client.id} className="hover:bg-slate-50">
                      <td className="px-4 py-2.5">
                        <Link href={`/clientes/${client.id}`} className="font-medium text-slate-800 hover:text-teal-700">
                          {client.nomeCompleto}
                        </Link>
                      </td>
                      <td className="hidden px-4 py-2.5 text-slate-500 sm:table-cell">
                        {[client.email, client.telefone].filter(Boolean).join(" · ") || "—"}
                      </td>
                      <td className="hidden px-4 py-2.5 text-slate-500 md:table-cell">{client.cidade || "—"}</td>
                      <td className="px-4 py-2.5 text-right text-slate-600">{quoteCount(client.id)}</td>
                    </tr>
                  ))}
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-4 py-6 text-center text-sm text-slate-400">
                        Nenhum cliente encontrado para &quot;{query}&quot;.
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
