"use client";

import { useState, useMemo } from "react";
import { Reservation } from "@/lib/store/types";
import { AirlineLogo } from "@/components/ui/AirlineLogo";
import { formatWhatsAppLink } from "@/lib/format";
import { CheckinCalendarView } from "./CheckinCalendarView";
import { CheckinFlightModal, FlightWithReservation } from "./CheckinFlightModal";
import {
  Calendar,
  Plane,
  Armchair,
  MessageCircle,
  Copy,
  Check,
  LayoutList,
  CalendarDays,
  Info,
} from "lucide-react";
import { toast } from "sonner";

interface CheckinBoardProps {
  reservations: Reservation[];
}

type CheckinFilter = "HOJE" | "SEMANA" | "MES" | "PASSADOS" | "PROXIMOS";

export function CheckinBoard({ reservations }: CheckinBoardProps) {
  const [viewMode, setViewMode] = useState<"list" | "calendar">("calendar");
  const [filter, setFilter] = useState<CheckinFilter>("SEMANA");
  const [selectedFlight, setSelectedFlight] = useState<FlightWithReservation | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Parseia datas de voo para objetos Date
  const allFlights = useMemo<FlightWithReservation[]>(() => {
    const list: FlightWithReservation[] = [];

    const monthMap: Record<string, number> = {
      jan: 0, fev: 1, mar: 2, abr: 3, mai: 4, jun: 5,
      jul: 6, ago: 7, set: 8, out: 9, nov: 10, dez: 11,
    };

    for (const res of reservations) {
      for (const f of res.voos) {
        let depDate: Date | null = null;
        if (f.dataPartida) {
          // Tenta formatos: "02 FEV 2027", "2027-02-02", "02/02/2027"
          const parts = f.dataPartida.split(" ");
          if (parts.length >= 3) {
            const day = parseInt(parts[0], 10);
            const mStr = parts[1].toLowerCase().slice(0, 3);
            const year = parseInt(parts[2], 10);
            const m = monthMap[mStr] ?? 0;
            const [h, min] = (f.horaPartida || "12:00").split(":").map(Number);
            depDate = new Date(year, m, day, h || 12, min || 0);
          } else {
            depDate = new Date(f.dataPartida);
          }
        }

        const paxNames = res.passageiros.map((p) => p.nome).join(", ") || res.clienteNome;

        list.push({
          flight: f,
          reservation: res,
          passengerNames: paxNames,
          assento: f.assento,
          departureDate: depDate && !isNaN(depDate.getTime()) ? depDate : null,
        });
      }
    }

    return list.sort((a, b) => {
      if (!a.departureDate) return 1;
      if (!b.departureDate) return -1;
      return a.departureDate.getTime() - b.departureDate.getTime();
    });
  }, [reservations]);

  const filteredFlights = useMemo(() => {
    const nowDate = new Date();
    const startToday = new Date(nowDate.getFullYear(), nowDate.getMonth(), nowDate.getDate());
    const endToday = new Date(nowDate.getFullYear(), nowDate.getMonth(), nowDate.getDate(), 23, 59, 59);
    const endWk = new Date(startToday.getTime() + 7 * 24 * 60 * 60 * 1000);
    const startPastWk = new Date(startToday.getTime() - 7 * 24 * 60 * 60 * 1000);

    return allFlights.filter((item) => {
      if (!item.departureDate) return filter === "PROXIMOS";
      const time = item.departureDate.getTime();

      if (filter === "HOJE") {
        return time >= startToday.getTime() && time <= endToday.getTime();
      }
      if (filter === "SEMANA") {
        return time >= startToday.getTime() && time <= endWk.getTime();
      }
      if (filter === "MES") {
        return (
          item.departureDate.getMonth() === nowDate.getMonth() &&
          item.departureDate.getFullYear() === nowDate.getFullYear() &&
          time >= startToday.getTime()
        );
      }
      if (filter === "PASSADOS") {
        return time < startToday.getTime() && time >= startPastWk.getTime();
      }
      if (filter === "PROXIMOS") {
        return time >= startToday.getTime();
      }
      return true;
    });
  }, [allFlights, filter]);

  // Contadores
  const counts = useMemo(() => {
    const nowDate = new Date();
    const startToday = new Date(nowDate.getFullYear(), nowDate.getMonth(), nowDate.getDate());
    const endToday = new Date(nowDate.getFullYear(), nowDate.getMonth(), nowDate.getDate(), 23, 59, 59);
    const endWk = new Date(startToday.getTime() + 7 * 24 * 60 * 60 * 1000);
    const startPastWk = new Date(startToday.getTime() - 7 * 24 * 60 * 60 * 1000);

    let hoje = 0;
    let semana = 0;
    let mes = 0;
    let passados = 0;
    let proximos = 0;

    for (const item of allFlights) {
      if (!item.departureDate) {
        proximos += 1;
        continue;
      }
      const time = item.departureDate.getTime();
      if (time >= startToday.getTime() && time <= endToday.getTime()) hoje += 1;
      if (time >= startToday.getTime() && time <= endWk.getTime()) semana += 1;
      if (
        item.departureDate.getMonth() === nowDate.getMonth() &&
        item.departureDate.getFullYear() === nowDate.getFullYear() &&
        time >= startToday.getTime()
      )
        mes += 1;
      if (time < startToday.getTime() && time >= startPastWk.getTime()) passados += 1;
      if (time >= startToday.getTime()) proximos += 1;
    }

    return { hoje, semana, mes, passados, proximos };
  }, [allFlights]);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    toast.success("Copiado com sucesso!");
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Alternador de Modo: Calendário vs Lista */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3.5 rounded-3xl border border-slate-200/80 shadow-xs">
        <div className="flex items-center gap-2 px-2 text-xs text-slate-500">
          <Info className="h-4 w-4 text-[#1d82f5] shrink-0" />
          <span>
            {viewMode === "calendar"
              ? "Cada embarque é exibido como badge no dia correspondente. Clique para ver detalhes e enviar lembrete no WhatsApp."
              : "Lista cronológica de voos organizada por janelas temporais com acionamento de check-in."}
          </span>
        </div>

        <div className="inline-flex rounded-2xl border border-slate-200 bg-slate-50 p-1 shrink-0 self-end sm:self-auto shadow-2xs">
          <button
            type="button"
            onClick={() => setViewMode("calendar")}
            className={`flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-bold transition cursor-pointer ${
              viewMode === "calendar"
                ? "bg-[#1d82f5] text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <CalendarDays className="h-3.5 w-3.5" /> Calendário
          </button>
          <button
            type="button"
            onClick={() => setViewMode("list")}
            className={`flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-bold transition cursor-pointer ${
              viewMode === "list"
                ? "bg-[#1d82f5] text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <LayoutList className="h-3.5 w-3.5" /> Lista de Embarques
          </button>
        </div>
      </div>

      {viewMode === "calendar" ? (
        <CheckinCalendarView
          flights={allFlights}
          onSelectFlight={(flight) => setSelectedFlight(flight)}
        />
      ) : (
        <>
          {/* Barra de Filtros Rápidos */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <button
          type="button"
          onClick={() => setFilter("HOJE")}
          className={`rounded-2xl p-4 text-left transition border cursor-pointer ${
            filter === "HOJE"
              ? "bg-emerald-500 text-white border-emerald-600 shadow-md"
              : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
          }`}
        >
          <span className="block text-[11px] font-bold uppercase tracking-wider opacity-80">
            Embarcando Hoje
          </span>
          <span className="text-2xl font-black mt-1 block">{counts.hoje}</span>
        </button>

        <button
          type="button"
          onClick={() => setFilter("SEMANA")}
          className={`rounded-2xl p-4 text-left transition border cursor-pointer ${
            filter === "SEMANA"
              ? "bg-amber-500 text-white border-amber-600 shadow-md"
              : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
          }`}
        >
          <span className="block text-[11px] font-bold uppercase tracking-wider opacity-80">
            Nesta Semana
          </span>
          <span className="text-2xl font-black mt-1 block">{counts.semana}</span>
        </button>

        <button
          type="button"
          onClick={() => setFilter("MES")}
          className={`rounded-2xl p-4 text-left transition border cursor-pointer ${
            filter === "MES"
              ? "bg-blue-600 text-white border-blue-700 shadow-md"
              : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
          }`}
        >
          <span className="block text-[11px] font-bold uppercase tracking-wider opacity-80">
            Neste Mês
          </span>
          <span className="text-2xl font-black mt-1 block">{counts.mes}</span>
        </button>

        <button
          type="button"
          onClick={() => setFilter("PROXIMOS")}
          className={`rounded-2xl p-4 text-left transition border cursor-pointer ${
            filter === "PROXIMOS"
              ? "bg-[#5E17EB] text-white border-purple-700 shadow-md"
              : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
          }`}
        >
          <span className="block text-[11px] font-bold uppercase tracking-wider opacity-80">
            Próximos Futuros
          </span>
          <span className="text-2xl font-black mt-1 block">{counts.proximos}</span>
        </button>

        <button
          type="button"
          onClick={() => setFilter("PASSADOS")}
          className={`rounded-2xl p-4 text-left transition border cursor-pointer col-span-2 sm:col-span-1 ${
            filter === "PASSADOS"
              ? "bg-slate-800 text-white border-slate-900 shadow-md"
              : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
          }`}
        >
          <span className="block text-[11px] font-bold uppercase tracking-wider opacity-80">
            Embarcaram Recentemente
          </span>
          <span className="text-2xl font-black mt-1 block">{counts.passados}</span>
        </button>
      </div>

      {/* Lista de Voos do Filtro Ativo */}
      {filteredFlights.length === 0 ? (
        <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center space-y-3">
          <Calendar className="h-10 w-10 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">Nenhum voo para o período selecionado</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Não há embarques registrados nesta janela de tempo. Mude o filtro para visualizar outros voos.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredFlights.map((item, idx) => {
            const f = item.flight;
            const r = item.reservation;
            const locCia = f.localizadorCia || r.localizadorCia;

            const reminderMsg = `✈️ *LEMBRETE DE CHECK-IN DE VOO*

Olá, *${item.passengerNames}*!
Passando para lembrar que o check-in do seu voo *${f.ciaAerea} (${f.numeroVoo})* já está disponível!

🛫 *Origem:* ${f.origemCodigo} (${f.origemNome}) ${f.origemTerminal ? `— ${f.origemTerminal}` : ""}
🛬 *Destino:* ${f.destinoCodigo} (${f.destinoNome})
📅 *Data e Horário:* ${f.dataPartida} às ${f.horaPartida}
${locCia ? `🔑 *Loc da Cia Aérea para Check-in:* ${locCia}\n` : ""}${f.assento ? `💺 *Assento Marcado:* ${f.assento}\n` : ""}
Lembre-se de comparecer com antecedência ao aeroporto e levar seu documento original!
Tenha uma excelente viagem! 🌍`;

            const waReminderLink = r.clienteTelefone
              ? formatWhatsAppLink(r.clienteTelefone, reminderMsg)
              : `https://wa.me/?text=${encodeURIComponent(reminderMsg)}`;

            return (
              <div
                key={`${f.id}-${idx}`}
                onClick={() => setSelectedFlight(item)}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4 hover:border-blue-300 transition cursor-pointer group"
              >
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-3">
                    <AirlineLogo airline={f.ciaAerea} className="h-6 w-6 object-contain" />
                    <div>
                      <span className="font-bold text-slate-900 text-sm group-hover:text-[#1d82f5] transition">{f.ciaAerea}</span>
                      <span className="ml-2 font-mono text-xs font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                        {f.numeroVoo}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {locCia ? (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCopy(locCia, `loc-${idx}`);
                        }}
                        className="flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-mono font-bold text-emerald-800 hover:bg-emerald-100 transition cursor-pointer"
                        title="Copiar Loc Cia para check-in"
                      >
                        {copiedKey === `loc-${idx}` ? (
                          <Check className="h-3.5 w-3.5 text-emerald-600" />
                        ) : (
                          <Copy className="h-3.5 w-3.5 text-emerald-600" />
                        )}
                        <span>Loc Cia: <strong>{locCia}</strong></span>
                      </button>
                    ) : null}

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCopy(r.localizador, `gds-${idx}`);
                      }}
                      className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-mono font-bold text-slate-700 hover:bg-slate-100 transition cursor-pointer"
                      title="Copiar Localizador GDS"
                    >
                      {copiedKey === `gds-${idx}` ? (
                        <Check className="h-3.5 w-3.5 text-slate-600" />
                      ) : (
                        <Copy className="h-3.5 w-3.5 text-slate-400" />
                      )}
                      <span>GDS: {r.localizador}</span>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                  <div className="md:col-span-4 space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                      Passageiro & Assento
                    </span>
                    <p className="font-bold text-slate-900 text-sm">{item.passengerNames}</p>
                    {f.assento && (
                      <span className="inline-flex items-center gap-1 rounded bg-purple-50 px-2 py-0.5 text-xs font-bold text-[#5E17EB]">
                        <Armchair className="h-3.5 w-3.5" /> Poltrona {f.assento}
                      </span>
                    )}
                  </div>

                  <div className="md:col-span-5 flex items-center gap-4 text-xs">
                    <div className="space-y-0.5">
                      <span className="font-mono text-xl font-black text-slate-900">{f.origemCodigo}</span>
                      <p className="text-[11px] text-slate-500 font-medium">{f.horaPartida} • {f.dataPartida}</p>
                    </div>

                    <div className="flex-1 flex flex-col items-center">
                      <span className="text-[10px] text-slate-400 font-medium">
                        {f.escalas === 0 ? "Direto" : `${f.escalas} conexão`}
                      </span>
                      <div className="w-full flex items-center gap-1 text-slate-300">
                        <div className="h-0.5 bg-slate-200 flex-1" />
                        <Plane className="h-3.5 w-3.5 text-teal-600" />
                        <div className="h-0.5 bg-slate-200 flex-1" />
                      </div>
                    </div>

                    <div className="space-y-0.5 text-right">
                      <span className="font-mono text-xl font-black text-slate-900">{f.destinoCodigo}</span>
                      <p className="text-[11px] text-slate-500 font-medium">{f.horaChegada} • {f.dataChegada}</p>
                    </div>
                  </div>

                  <div className="md:col-span-3 md:text-right">
                    {waReminderLink ? (
                      <a
                        href={waReminderLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="inline-flex items-center gap-1.5 rounded-full bg-[#25D366] px-3.5 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-[#20ba59] transition cursor-pointer"
                      >
                        <MessageCircle className="h-4 w-4" /> Lembrar Check-in
                      </a>
                    ) : null}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
        </>
      )}

      {/* Modal de Detalhes do Voo ao clicar na badge do calendário ou no card */}
      <CheckinFlightModal
        item={selectedFlight}
        onClose={() => setSelectedFlight(null)}
      />
    </div>
  );
}
