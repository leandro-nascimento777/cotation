"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useAppData } from "@/lib/store/AppDataContext";
import { PageHeader } from "@/components/shell/PageHeader";
import { LoadingState } from "@/components/shell/LoadingState";
import { EmptyState } from "@/components/shell/EmptyState";
import { NewReservationButton } from "@/components/reservas/NewReservationButton";
import { IssueReservationModal } from "@/components/reservas/IssueReservationModal";
import { PendingIssuance } from "@/lib/store/types";
import { AirlineLogo } from "@/components/ui/AirlineLogo";
import { formatCurrencyBRL } from "@/lib/format";
import {
  Search,
  Copy,
  Check,
  Luggage,
  Calendar,
  Eye,
  Trash2,
  Armchair,
  TicketCheck,
  Sparkles,
  Clock,
  CalendarCheck,
} from "lucide-react";
import { toast } from "sonner";

export default function ReservationsPage() {
  const { reservations, deleteReservation, pendingIssuances, hydrated } = useAppData();
  const [activeTab, setActiveTab] = useState<"emitidas" | "a-emitir">("emitidas");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("TODOS");
  const [copiedPnr, setCopiedPnr] = useState<string | null>(null);

  // Controle de modal de emissão a partir de um item "A Emitir"
  const [issuingPending, setIssuingPending] = useState<PendingIssuance | null>(null);

  const pendingCount = pendingIssuances.filter((p) => p.status === "PENDENTE").length;

  const filteredReservations = useMemo(() => {
    return reservations.filter((res) => {
      const matchesStatus = statusFilter === "TODOS" || res.status === statusFilter;
      const q = search.toLowerCase().trim();
      if (!q) return matchesStatus;

      const matchesSearch =
        res.localizador.toLowerCase().includes(q) ||
        res.clienteNome.toLowerCase().includes(q) ||
        (res.numeroBilhete && res.numeroBilhete.toLowerCase().includes(q)) ||
        (res.emissor && res.emissor.toLowerCase().includes(q)) ||
        res.voos.some(
          (v) =>
            v.ciaAerea.toLowerCase().includes(q) ||
            v.numeroVoo.toLowerCase().includes(q) ||
            v.origemCodigo.toLowerCase().includes(q) ||
            v.destinoCodigo.toLowerCase().includes(q)
        );

      return matchesStatus && matchesSearch;
    });
  }, [reservations, search, statusFilter]);

  const handleCopyPnr = (pnr: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    navigator.clipboard.writeText(pnr);
    setCopiedPnr(pnr);
    toast.success(`Localizador ${pnr} copiado!`);
    setTimeout(() => setCopiedPnr(null), 2000);
  };

  const handleDelete = (id: string, pnr: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (confirm(`Tem certeza que deseja excluir a reserva #${pnr}?`)) {
      deleteReservation(id);
      toast.success("Reserva removida.");
    }
  };

  if (!hydrated) {
    return <LoadingState />;
  }

  return (
    <div className="space-y-6 pb-12">
      <PageHeader
        title="Reservas"
        description="E-tickets emitidos, localizadores de consolidadoras e vouchers para clientes."
        action={<NewReservationButton />}
      />

      <div className="px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Abas de Reservas com Link Direto para o Check-in */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-px">
        <div className="flex items-center gap-2 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab("emitidas")}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-bold border-b-2 transition cursor-pointer shrink-0 ${
              activeTab === "emitidas"
                ? "border-teal-600 text-teal-700 bg-teal-50/40 rounded-t-xl"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <TicketCheck className="h-4 w-4" />
            Reservas Emitidas
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600 font-semibold">
              {reservations.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("a-emitir")}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-bold border-b-2 transition cursor-pointer shrink-0 ${
              activeTab === "a-emitir"
                ? "border-amber-500 text-amber-700 bg-amber-50/40 rounded-t-xl"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <Clock className="h-4 w-4" />
            A Emitir
            {pendingCount > 0 && (
              <span className="rounded-full bg-amber-500 text-white px-2 py-0.5 text-xs font-black animate-pulse">
                {pendingCount}
              </span>
            )}
          </button>
        </div>

        <Link
          href="/checkin"
          className="flex items-center gap-1.5 self-start sm:self-auto rounded-xl bg-purple-50 px-3.5 py-1.5 text-xs font-bold text-[#5E17EB] border border-purple-200 hover:bg-purple-100 transition cursor-pointer"
        >
          <CalendarCheck className="h-4 w-4" /> Abrir Controle de Check-in ➔
        </Link>
      </div>

      {activeTab === "a-emitir" && (
        <div className="space-y-4">
          <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-4 text-xs text-amber-900 leading-relaxed flex items-center gap-3">
            <Clock className="h-5 w-5 text-amber-600 shrink-0" />
            <div>
              <strong>Leads com Pagamento Aprovado Online:</strong> Estes clientes já escolheram os voos, preencheram os passageiros e pagaram online (Pix ou Cartão). Clique em <strong>&quot;Emitir reserva&quot;</strong> para inserir o e-ticket da consolidadora e gerar o voucher final.
            </div>
          </div>

          {pendingIssuances.filter((p) => p.status === "PENDENTE").length === 0 ? (
            <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center space-y-3">
              <Check className="h-10 w-10 text-emerald-500 mx-auto" />
              <h3 className="text-base font-bold text-slate-800">Tudo em dia! Nenhum pedido aguardando emissão</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Quando novos clientes finalizarem compras online nas propostas públicas, os bilhetes a emitir aparecerão aqui.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3">
              {pendingIssuances
                .filter((p) => p.status === "PENDENTE")
                .map((item) => (
                  <div
                    key={item.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:border-amber-400 transition"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded">
                          {item.orderRef}
                        </span>
                        <span className="text-xs font-bold text-slate-900">{item.clienteNome}</span>
                        <span className="rounded bg-teal-100 px-2 py-0.5 text-[10px] font-bold text-teal-800">
                          {item.metodoPagamento} PAGO
                        </span>
                      </div>
                      <p className="text-xs text-slate-600">{item.trechosDescricao}</p>
                      <p className="text-[11px] text-slate-400">
                        {item.passageiros.length} passageiro(s) • Total: <strong>{formatCurrencyBRL(item.valorPago)}</strong>
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => setIssuingPending(item)}
                      className="flex items-center justify-center gap-2 rounded-full bg-amber-500 px-6 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-amber-600 transition cursor-pointer shrink-0"
                    >
                      <Sparkles className="h-4 w-4" /> Emitir Reserva
                    </button>
                  </div>
                ))}
            </div>
          )}
        </div>
      )}

      {activeTab === "emitidas" && (
        <div className="space-y-6">

      {/* Barra de filtros e busca */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por localizador, passageiro, voo ou bilhete..."
            className="w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 py-2 text-sm text-slate-800 placeholder-slate-400 shadow-sm focus:border-teal-500 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {(["TODOS", "CONFIRMADA", "EMITIDA", "CANCELADA"] as const).map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setStatusFilter(st)}
              className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition cursor-pointer shrink-0 ${
                statusFilter === st
                  ? "bg-teal-600 text-white shadow-sm"
                  : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
              }`}
            >
              {st === "TODOS" ? "Todas as reservas" : st}
            </button>
          ))}
        </div>
      </div>

      {/* Lista de Reservas */}
      {filteredReservations.length === 0 ? (
        <EmptyState
          icon={TicketCheck}
          title="Nenhuma reserva encontrada"
          description={
            search
              ? "Nenhuma reserva corresponde à busca. Tente buscar por outro termo."
              : "Você ainda não possui reservas cadastradas. Envie um e-ticket para gerar seu primeiro voucher."
          }
          action={<NewReservationButton />}
        />
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredReservations.map((res) => {
            const firstFlight = res.voos[0];
            const uniqueAirlines = Array.from(new Set(res.voos.map((v) => v.ciaAerea)));
            const primaryAirline = firstFlight?.ciaAerea || "Cia Aérea";

            return (
              <div
                key={res.id}
                className="group relative rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-teal-500/40 hover:shadow-md space-y-4"
              >
                {/* Topo do card: Localizador, status e data */}
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={(e) => handleCopyPnr(res.localizador, e)}
                      className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-mono font-black text-slate-900 hover:bg-slate-100 hover:border-slate-300 transition cursor-pointer"
                      title="Clique para copiar o localizador"
                    >
                      {copiedPnr === res.localizador ? (
                        <Check className="h-3.5 w-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="h-3.5 w-3.5 text-slate-400" />
                      )}
                      <span>{res.localizador}</span>
                    </button>

                    <span
                      className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider ${
                        res.status === "CANCELADA"
                          ? "bg-rose-50 text-rose-700 border border-rose-200"
                          : "bg-emerald-50 text-emerald-800 border border-emerald-200"
                      }`}
                    >
                      {res.status}
                    </span>

                    {res.numeroBilhete && (
                      <span className="hidden sm:inline-block text-xs text-slate-400">
                        Bilhete: <strong className="text-slate-600 font-mono">{res.numeroBilhete}</strong>
                      </span>
                    )}
                  </div>

                  <div className="text-xs text-slate-400 flex items-center gap-2">
                    {res.emissor && <span className="font-medium text-slate-600">{res.emissor}</span>}
                    {res.dataEmissao && <span>· Emitido em {res.dataEmissao}</span>}
                  </div>
                </div>

                {/* Linha Principal: Passageiro e Voos */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
                  <div className="lg:col-span-3 space-y-1">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                      Passageiro Principal
                    </span>
                    <p className="font-bold text-slate-900 text-sm">{res.clienteNome}</p>
                    <p className="text-xs text-slate-500">
                      {res.passageiros.length} passageiro{res.passageiros.length > 1 ? "s" : ""}
                    </p>
                  </div>

                  <div className="lg:col-span-6 space-y-2">
                    <div className="flex items-center gap-2">
                      <AirlineLogo airline={primaryAirline} className="h-5 w-5 object-contain" />
                      <span className="text-xs font-semibold text-slate-800">
                        {uniqueAirlines.join(", ")}
                      </span>
                      <span className="text-xs text-slate-400">({res.voos.length} trecho{res.voos.length > 1 ? "s" : ""})</span>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      {res.voos.map((voo, idx) => (
                        <div key={idx} className="flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded-md border border-slate-100">
                          <span className="font-bold text-slate-800">{voo.origemCodigo}</span>
                          <span className="text-slate-400">➔</span>
                          <span className="font-bold text-slate-800">{voo.destinoCodigo}</span>
                          <span className="text-[10px] text-slate-400 font-medium">({voo.dataPartida.split(" ")[0]} {voo.dataPartida.split(" ")[1]})</span>
                          {voo.assento && (
                            <span className="ml-1 text-[10px] font-bold text-[#5E17EB] bg-purple-50 px-1 rounded flex items-center gap-0.5">
                              <Armchair className="h-3 w-3" /> {voo.assento}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="lg:col-span-3 lg:text-right space-y-1">
                    {res.valorTotal ? (
                      <div>
                        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                          Valor do Bilhete
                        </span>
                        <p className="text-base font-black text-slate-900">
                          {formatCurrencyBRL(res.valorTotal)}
                        </p>
                      </div>
                    ) : (
                      <span className="text-xs font-medium text-slate-500">Tarifa corporativa</span>
                    )}

                    {firstFlight?.bagagem && (
                      <div className="inline-flex items-center gap-1 text-[11px] text-teal-700 bg-teal-50 px-2 py-0.5 rounded font-medium">
                        <Luggage className="h-3.5 w-3.5" />
                        <span>{firstFlight.bagagem}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Rodapé de Ações */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 text-xs">
                  <div className="flex items-center gap-2 text-slate-500">
                    <Calendar className="h-3.5 w-3.5 text-slate-400" />
                    <span>
                      Primeiro embarque: <strong>{firstFlight?.dataPartida || "A confirmar"} às {firstFlight?.horaPartida || ""}</strong>
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={(e) => handleDelete(res.id, res.localizador, e)}
                      className="p-2 text-slate-400 hover:text-rose-600 transition rounded-lg hover:bg-rose-50 cursor-pointer"
                      title="Excluir reserva"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>

                    <Link
                      href={`/reservas/${res.id}`}
                      className="flex items-center gap-1.5 rounded-lg bg-teal-50 px-3.5 py-1.5 font-bold text-teal-700 hover:bg-teal-100 transition cursor-pointer"
                    >
                      <Eye className="h-3.5 w-3.5" /> Visualizar Voucher da Agência
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
        </div>
      )}
      </div>

      {issuingPending && (
        <IssueReservationModal
          open={Boolean(issuingPending)}
          onClose={() => setIssuingPending(null)}
          pendingIssuanceId={issuingPending.id}
          initialCustomerName={issuingPending.clienteNome}
          initialDestination={issuingPending.trechosDescricao}
        />
      )}
    </div>
  );
}
