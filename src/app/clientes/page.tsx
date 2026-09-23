"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useAppData } from "@/lib/store/AppDataContext";
import { LoadingState } from "@/components/shell/LoadingState";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { ClientListTable } from "@/components/clientes/ClientListTable";
import { ClientListGrid } from "@/components/clientes/ClientListGrid";
import {
  Users,
  Search,
  UserPlus,
  FileText,
  LayoutGrid,
  List,
  X,
} from "lucide-react";

function getInitials(name: string): string {
  if (!name) return "CL";
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 1) {
    return parts[0].substring(0, 2).toUpperCase();
  }
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export default function ClientesPage() {
  const { clients, quotes, hydrated } = useAppData();
  const [query, setQuery] = useState("");
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return clients;
    return clients.filter((c) =>
      [
        c.nomeCompleto,
        c.cpf,
        c.passaporte,
        c.email,
        c.telefone,
        c.cidade,
      ].some((f) => f && f.toLowerCase().includes(q))
    );
  }, [clients, query]);

  const quoteCount = (clientId: string) => quotes.filter((q) => q.clientId === clientId).length;
  const totalPassengers = clients.reduce((acc, c) => acc + (c.passageiros?.length || 0), 0);

  if (!hydrated) {
    return <LoadingState />;
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:16px_16px] py-6 sm:py-8 px-4 sm:px-6 lg:px-8">
      <div className="w-full space-y-6">
        {/* Cabeçalho da Seção de Clientes */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <SidebarTrigger
                title="Recolher / Expandir menu"
                className="text-slate-500 hover:bg-slate-200/60 hover:text-slate-900 transition shrink-0"
              />
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                Carteira de Clientes
              </h1>
              <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-[#1d82f5] border border-blue-200/60 shadow-2xs">
                {clients.length} {clients.length === 1 ? "cliente" : "clientes"}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 sm:pl-9">
              Acesse perfis completos, documentos, passageiros cadastrados e histórico de viagens.
            </p>
          </div>

          <Link
            href="/clientes/novo"
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#1d82f5] hover:bg-blue-600 px-4 py-2.5 text-xs sm:text-sm font-bold text-white shadow-md shadow-blue-500/20 transition transform active:scale-95 cursor-pointer shrink-0"
          >
            <UserPlus className="h-4 w-4" /> Novo cliente
          </Link>
        </div>

        {/* Cards de Métricas / KPIs Rápidos */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm flex items-center gap-3.5">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-[#1d82f5] shrink-0 shadow-2xs">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                Total de Clientes
              </span>
              <p className="text-xl font-black text-slate-900 leading-tight">{clients.length}</p>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm flex items-center gap-3.5">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 shrink-0 shadow-2xs">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                Cotações Vinculadas
              </span>
              <p className="text-xl font-black text-slate-900 leading-tight">{quotes.length}</p>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm flex items-center gap-3.5">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-teal-50 text-teal-600 shrink-0 shadow-2xs">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                Passageiros na Ficha
              </span>
              <p className="text-xl font-black text-slate-900 leading-tight">{totalPassengers}</p>
            </div>
          </div>
        </div>

        {/* Barra de Busca e Alternador de Visualização */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar por nome, CPF, passaporte, e-mail, telefone ou cidade…"
              className="w-full rounded-2xl border border-slate-200/80 bg-white py-2.5 pl-10 pr-9 text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:border-[#1d82f5] focus:ring-2 focus:ring-blue-100 focus:outline-none shadow-xs transition"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          <div className="inline-flex rounded-xl border border-slate-200/80 bg-white p-1 shadow-xs shrink-0 self-end sm:self-auto">
            <button
              type="button"
              onClick={() => setViewMode("table")}
              title="Visualização em Lista / Tabela"
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition cursor-pointer ${
                viewMode === "table"
                  ? "bg-[#1d82f5] text-white shadow-xs"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <List className="h-3.5 w-3.5" /> Lista
            </button>
            <button
              type="button"
              onClick={() => setViewMode("grid")}
              title="Visualização em Cartões"
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition cursor-pointer ${
                viewMode === "grid"
                  ? "bg-[#1d82f5] text-white shadow-xs"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <LayoutGrid className="h-3.5 w-3.5" /> Cartões
            </button>
          </div>
        </div>

        {/* Conteúdo de Clientes */}
        {clients.length === 0 ? (
          <div className="rounded-3xl border border-slate-200/80 bg-white p-12 text-center shadow-sm space-y-4">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-50 text-[#1d82f5]">
              <Users className="h-8 w-8" />
            </div>
            <div className="space-y-1 max-w-sm mx-auto">
              <h2 className="text-base font-bold text-slate-800">Nenhum cliente cadastrado ainda</h2>
              <p className="text-xs text-slate-500">
                Cadastre o seu primeiro cliente para vincular às cotações, gerar vouchers e manter a carteira organizada.
              </p>
            </div>
            <Link
              href="/clientes/novo"
              className="inline-flex items-center gap-2 rounded-2xl bg-[#1d82f5] px-4 py-2.5 text-xs font-bold text-white shadow-md hover:bg-blue-600 transition"
            >
              <UserPlus className="h-4 w-4" /> Cadastrar cliente
            </Link>
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-3xl border border-slate-200/80 bg-white p-10 text-center shadow-sm space-y-3">
            <p className="text-sm font-semibold text-slate-700">
              Nenhum cliente encontrado para &quot;{query}&quot;.
            </p>
            <button
              type="button"
              onClick={() => setQuery("")}
              className="text-xs font-bold text-[#1d82f5] hover:underline cursor-pointer"
            >
              Limpar busca
            </button>
          </div>
        ) : viewMode === "table" ? (
          <ClientListTable
            clients={filtered}
            quoteCount={quoteCount}
            getInitials={getInitials}
          />
        ) : (
          <ClientListGrid
            clients={filtered}
            quoteCount={quoteCount}
            getInitials={getInitials}
          />
        )}
      </div>
    </div>
  );
}
