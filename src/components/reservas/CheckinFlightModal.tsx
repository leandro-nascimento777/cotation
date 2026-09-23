"use client";

import { useState } from "react";
import Link from "next/link";
import { Reservation, ReservationFlight } from "@/lib/store/types";
import { AirlineLogo } from "@/components/ui/AirlineLogo";
import { formatWhatsAppLink } from "@/lib/format";
import {
  X,
  Plane,
  Armchair,
  MessageCircle,
  Copy,
  Check,
  Calendar,
  Clock,
  Luggage,
  ExternalLink,
  ShieldCheck,
} from "lucide-react";
import { toast } from "sonner";

export interface FlightWithReservation {
  flight: ReservationFlight;
  reservation: Reservation;
  passengerNames: string;
  assento?: string;
  departureDate: Date | null;
}

interface CheckinFlightModalProps {
  item: FlightWithReservation | null;
  onClose: () => void;
}

export function CheckinFlightModal({ item, onClose }: CheckinFlightModalProps) {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  if (!item) return null;
  const f = item.flight;
  const r = item.reservation;
  const locCia = f.localizadorCia || r.localizadorCia;

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    toast.success("Copiado com sucesso!");
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const reminderMsg = `✈️ *LEMBRETE DE CHECK-IN DE VOO*

Olá, *${item.passengerNames}*!
Passando para lembrar que o check-in do seu voo *${f.ciaAerea} (${f.numeroVoo})* já está disponível!

🛫 *Origem:* ${f.origemCodigo} (${f.origemNome})
🛬 *Destino:* ${f.destinoCodigo} (${f.destinoNome})
📅 *Data e Horário:* ${f.dataPartida} às ${f.horaPartida}
${locCia ? `🔑 *Loc da Cia Aérea para Check-in:* ${locCia}\n` : ""}${f.assento ? `💺 *Assento:* ${f.assento}\n` : ""}
Tenha uma excelente viagem! 🌍`;

  const waReminderLink =
    (r.clienteTelefone ? formatWhatsAppLink(r.clienteTelefone, reminderMsg) : null) ||
    `https://wa.me/?text=${encodeURIComponent(reminderMsg)}`;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg overflow-hidden rounded-3xl bg-white shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-200"
      >
        {/* Cabeçalho */}
        <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/70 p-4 sm:p-5">
          <div className="flex items-center gap-3">
            <AirlineLogo airline={f.ciaAerea} className="h-8 w-8 object-contain" />
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900 text-sm">{f.ciaAerea}</span>
                <span className="font-mono text-xs font-bold text-slate-600 bg-white px-2 py-0.5 rounded border border-slate-200 shadow-2xs">
                  {f.numeroVoo}
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                {f.classe ? `Classe: ${f.classe}` : "Voo Regular"} {f.aeronave ? `• ${f.aeronave}` : ""}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-200/60 hover:text-slate-700 transition cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Conteúdo */}
        <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto text-xs text-slate-700">
          {/* Banner de Rota e Horário */}
          <div className="rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-[#5E17EB] p-4 text-white shadow-sm space-y-2">
            <div className="flex items-center justify-between text-[11px] text-blue-100 font-semibold uppercase tracking-wider">
              <span className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" /> {f.dataPartida}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" /> Partida {f.horaPartida}
              </span>
            </div>

            <div className="flex items-center justify-between pt-1">
              <div>
                <span className="font-black text-2xl tracking-tight block">{f.origemCodigo}</span>
                <span className="text-[11px] text-blue-100 block truncate max-w-[130px] sm:max-w-[160px] font-medium">
                  {f.origemNome}
                </span>
              </div>

              <div className="flex flex-col items-center px-2">
                <Plane className="h-5 w-5 text-white/90" />
                <span className="text-[9px] uppercase tracking-widest text-blue-200 font-semibold mt-0.5">
                  Voo Direto
                </span>
              </div>

              <div className="text-right">
                <span className="font-black text-2xl tracking-tight block">{f.destinoCodigo}</span>
                <span className="text-[11px] text-blue-100 block truncate max-w-[130px] sm:max-w-[160px] font-medium">
                  {f.destinoNome}
                </span>
              </div>
            </div>
          </div>

          {/* Localizadores GDS e Loc Cia */}
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-3 space-y-1">
              <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Localizador GDS
              </span>
              <div className="flex items-center justify-between">
                <span className="font-mono text-base font-black text-slate-900 tracking-wide">
                  {r.localizador}
                </span>
                <button
                  type="button"
                  onClick={() => handleCopy(r.localizador, "gds")}
                  title="Copiar PNR GDS"
                  className="rounded-lg p-1 text-slate-400 hover:bg-slate-200/60 hover:text-slate-700 transition cursor-pointer"
                >
                  {copiedKey === "gds" ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                </button>
              </div>
              <span className="block text-[10px] text-slate-500">{r.emissor || "Consolidadora"}</span>
            </div>

            <div className="rounded-2xl border-2 border-emerald-300 bg-emerald-50/50 p-3 space-y-1">
              <span className="block text-[10px] font-bold uppercase tracking-wider text-emerald-700">
                Loc Cia (Check-in)
              </span>
              <div className="flex items-center justify-between">
                <span className="font-mono text-base font-black text-emerald-800 tracking-wide">
                  {locCia || "—"}
                </span>
                {locCia && (
                  <button
                    type="button"
                    onClick={() => handleCopy(locCia, "cia")}
                    title="Copiar Loc Cia"
                    className="rounded-lg p-1 text-emerald-700 hover:bg-emerald-200/60 transition cursor-pointer"
                  >
                    {copiedKey === "cia" ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                  </button>
                )}
              </div>
              <span className="block text-[10px] text-emerald-600 font-medium">Usar no site/app da Cia</span>
            </div>
          </div>

          {/* Passageiro e Assento */}
          <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-3.5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Passageiro Titular
              </span>
              {f.assento && (
                <span className="inline-flex items-center gap-1 rounded-md bg-purple-50 px-2 py-0.5 text-xs font-bold text-[#5E17EB] border border-purple-200/60">
                  <Armchair className="h-3 w-3" /> Assento: <strong>{f.assento}</strong>
                </span>
              )}
            </div>

            <p className="font-bold text-slate-900 text-sm">{item.passengerNames}</p>
            {r.numeroBilhete && (
              <p className="text-[11px] text-slate-500 font-mono">Bilhete: {r.numeroBilhete}</p>
            )}

            {f.bagagem && (
              <p className="text-[11px] text-slate-600 flex items-center gap-1.5 pt-1 border-t border-slate-200/60">
                <Luggage className="h-3.5 w-3.5 text-slate-400" /> Bagagem: {f.bagagem}
              </p>
            )}
          </div>

          {/* Lembrete de antecedência */}
          <div className="flex items-center gap-2 rounded-xl bg-amber-50/80 p-2.5 border border-amber-200/70 text-[11px] text-amber-800">
            <ShieldCheck className="h-4 w-4 text-amber-600 shrink-0" />
            <span>
              Apresente-se com 2h (nacional) ou 3h (internacional) de antecedência no portão de embarque.
            </span>
          </div>
        </div>

        {/* Rodapé com Ações */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5 border-t border-slate-100 bg-slate-50/60 p-4">
          <Link
            href={`/reservas/${r.id}`}
            className="inline-flex items-center gap-1 text-xs font-bold text-slate-600 hover:text-slate-900 transition"
          >
            <ExternalLink className="h-3.5 w-3.5" /> Abrir Voucher Completo
          </Link>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <a
              href={waReminderLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex flex-1 sm:flex-initial items-center justify-center gap-1.5 rounded-xl bg-[#25D366] hover:bg-[#20ba59] px-4 py-2 text-xs font-bold text-white shadow-xs transition active:scale-95 cursor-pointer"
            >
              <MessageCircle className="h-3.5 w-3.5" /> Lembrete no WhatsApp
            </a>

            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 transition cursor-pointer"
            >
              Fechar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}