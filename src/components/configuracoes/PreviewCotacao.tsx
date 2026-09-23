"use client";

import { BoardingPassTicket } from "@/components/proposal/BoardingPassTicket";
import { QuoteItem } from "@/lib/types";
import { CheckCircle2, Sparkles } from "lucide-react";

interface PreviewCotacaoProps {
  agencyName: string;
  logoDataUrl?: string;
  primaryColor: string;
  secondaryColor: string;
  textColor: string;
}

export function PreviewCotacao({
  agencyName,
  logoDataUrl,
  primaryColor,
  secondaryColor,
  textColor,
}: PreviewCotacaoProps) {
  const mockItem: QuoteItem = {
    rowId: "row-1",
    fareId: "fare-1",
    baggage: "1x 23kg",
    fareLabel: "Executiva Standard",
    fareClass: "Executiva",
    price: 11450,
    currency: "BRL",
    selected: true,
    ida: {
      origin: "GRU",
      destination: "AMS",
      departureTime: "20:30",
      arrivalTime: "13:15",
      stops: 0,
      flightNumber: "KL 792",
      airline: "KLM",
      date: "2026-11-15",
      duration: "11h 45m",
      aircraft: "Boeing 777-300ER",
    },
    volta: {
      origin: "AMS",
      destination: "GRU",
      departureTime: "10:40",
      arrivalTime: "18:20",
      stops: 0,
      flightNumber: "KL 791",
      airline: "KLM",
      date: "2026-11-28",
      duration: "11h 40m",
      aircraft: "Boeing 777-300ER",
    },
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between rounded-xl bg-purple-50/80 px-4 py-2 border border-purple-200/70 text-xs text-purple-900">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-[#5E17EB]" />
          <span><strong>Modo de Visualização:</strong> Veja a Proposta Comercial e o Bilhete ao vivo.</span>
        </div>
        <span className="text-[11px] font-mono bg-purple-100/80 px-2 py-0.5 rounded text-purple-800">
          Primária: {primaryColor}
        </span>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-300 bg-slate-100 shadow-xl">
        <div className="p-4 space-y-4 bg-slate-50 max-h-[580px] overflow-y-auto">
          <div className="relative overflow-hidden rounded-2xl shadow-md">
            <div className="h-32 w-full flex flex-col justify-between p-4 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900">
              <div className="flex items-center justify-between">
                {logoDataUrl ? (
                  <div className="h-8 w-24 bg-white/95 rounded-lg p-1">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={logoDataUrl} alt={agencyName} className="h-full w-full object-contain" />
                  </div>
                ) : (
                  <span className="text-xs font-black uppercase text-white">{agencyName || "SUA AGÊNCIA"}</span>
                )}
                <span className="rounded-full bg-white/20 px-2 py-0.5 text-[9px] font-bold text-white">#2026-0042</span>
              </div>
              <h2 className="text-base font-black text-white uppercase">Viagem para Amsterdã</h2>
            </div>

            <div className="px-3 pt-5 pb-5" style={{ backgroundColor: primaryColor }}>
              <div className="-mt-8 w-full">
                <BoardingPassTicket
                  numero="2026-0042"
                  clientName="EDUARDO MENDONÇA"
                  passengerNames="MARIANA MENDONÇA"
                  totalPassengers={2}
                  periodoInicio="2026-11-15"
                  periodoFim="2026-11-28"
                  destino="Amsterdã (AMS)"
                  items={[mockItem]}
                  primaryColor={primaryColor}
                />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <div className="flex gap-2">
                <span className="rounded-full px-2 py-0.5 text-[11px] font-black text-white" style={{ backgroundColor: primaryColor }}>
                  Opção Selecionada
                </span>
                <span className="rounded-full px-2 py-0.5 text-[11px] font-black" style={{ backgroundColor: `${secondaryColor}20`, color: secondaryColor }}>
                  Melhor Custo
                </span>
              </div>
              <span className="text-base font-black" style={{ color: primaryColor }}>R$ 11.450,00</span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs" style={{ color: textColor }}>
              <div className="rounded-lg bg-slate-50 p-2 border border-slate-100">
                <span className="font-bold text-[10px] text-slate-400 block">Ida • 15/11</span>
                <p className="font-bold text-slate-800">GRU ➔ AMS (20:30)</p>
              </div>
              <div className="rounded-lg bg-slate-50 p-2 border border-slate-100">
                <span className="font-bold text-[10px] text-slate-400 block">Volta • 28/11</span>
                <p className="font-bold text-slate-800">AMS ➔ GRU (10:40)</p>
              </div>
            </div>

            <div className="flex items-center justify-end pt-1">
              <button type="button" className="rounded-lg px-3 py-1.5 text-xs font-bold text-white" style={{ backgroundColor: primaryColor }}>
                <CheckCircle2 className="h-3.5 w-3.5 inline mr-1" /> Aprovar Proposta
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}