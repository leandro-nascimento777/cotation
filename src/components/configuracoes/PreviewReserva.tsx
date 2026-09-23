"use client";

import { WorldMapWatermark } from "@/components/proposal/WorldMapWatermark";
import { Armchair, MessageCircle, Plane, Printer, Sparkles } from "lucide-react";

interface PreviewReservaProps {
  agencyName: string;
  logoDataUrl?: string;
  primaryColor: string;
  secondaryColor: string;
  textColor: string;
}

export function PreviewReserva({
  agencyName,
  logoDataUrl,
  primaryColor,
  secondaryColor,
  textColor,
}: PreviewReservaProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between rounded-xl bg-teal-50/80 px-4 py-2 border border-teal-200/70 text-xs text-teal-900">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-teal-600" />
          <span><strong>Modo de Visualização:</strong> Veja o Voucher Eletrônico de Reserva oficial.</span>
        </div>
        <span className="text-[11px] font-mono bg-teal-100/80 px-2 py-0.5 rounded text-teal-800">
          Secundária: {secondaryColor}
        </span>
      </div>

      <div className="w-full bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden">
        <div
          className="flex items-center justify-between gap-4 border-b-2 bg-white p-4"
          style={{ borderBottomColor: primaryColor }}
        >
          <div className="flex items-center gap-3">
            {logoDataUrl ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img src={logoDataUrl} alt={agencyName} className="max-h-10 max-w-[140px] object-contain" />
            ) : (
              <div
                className="flex h-9 w-9 items-center justify-center rounded-xl text-white font-black text-base"
                style={{ backgroundColor: primaryColor }}
              >
                ✈
              </div>
            )}
            <div>
              <h3 className="text-sm font-black text-slate-900 uppercase">{agencyName || "SUA AGÊNCIA"}</h3>
              <p className="text-[10px] text-slate-500">Voucher Oficial Emitido</p>
            </div>
          </div>

          <span
            className="rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider border"
            style={{ backgroundColor: `${secondaryColor}15`, color: secondaryColor, borderColor: `${secondaryColor}40` }}
          >
            Voucher Eletrônico
          </span>
        </div>

        <div className="relative p-5 text-white space-y-4" style={{ backgroundColor: primaryColor }}>
          <WorldMapWatermark />
          <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <span className="text-[10px] uppercase tracking-widest text-white/80">Reserva Confirmada</span>
              <p className="text-xl sm:text-2xl font-black">GRU ➔ MIA</p>
              <p className="text-[11px] text-white/80">Passageiro: <strong>RICARDO ALVES</strong> · Bilhete: 001-2489455152</p>
            </div>

            <div className="flex items-center gap-2">
              <div className="rounded-xl border border-white/30 bg-white/10 px-3 py-1.5 text-center">
                <span className="block text-[8px] uppercase text-white/80">Loc GDS</span>
                <span className="font-mono text-base font-black text-white">ANRXK4</span>
              </div>
              <div
                className="rounded-xl border-2 px-3 py-1.5 text-center"
                style={{ borderColor: secondaryColor, backgroundColor: "rgba(0,0,0,0.3)" }}
              >
                <span className="block text-[8px] uppercase" style={{ color: secondaryColor }}>Loc Cia</span>
                <span className="font-mono text-base font-black" style={{ color: secondaryColor }}>NXPLPM</span>
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 space-y-3 bg-white text-xs" style={{ color: textColor }}>
          <div className="rounded-xl bg-slate-50 p-2.5 border border-slate-100 flex items-center justify-between">
            <div>
              <p className="font-bold text-slate-900">RICARDO ALVES</p>
              <p className="text-[11px] text-slate-500">American Airlines • AA 930</p>
            </div>
            <span
              className="inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-bold border"
              style={{ backgroundColor: `${primaryColor}10`, color: primaryColor, borderColor: `${primaryColor}30` }}
            >
              <Armchair className="h-3 w-3" /> Assento: <strong>14A</strong>
            </span>
          </div>

          <div className="rounded-xl border border-slate-200 p-2.5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Plane className="h-4 w-4 text-slate-400" />
              <div>
                <p className="font-bold text-slate-800">GRU ➔ MIA • 22:45</p>
                <p className="text-[11px] text-slate-500">Bagagem 1x 23kg inclusa</p>
              </div>
            </div>
            <span className="font-mono font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded text-[11px]">AA 930</span>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-slate-100">
            <span className="text-[11px] text-slate-400">Apresente-se com 3h de antecedência.</span>
            <div className="flex items-center gap-1.5">
              <button type="button" className="flex items-center gap-1 rounded-md bg-[#25D366] px-2.5 py-1 text-[11px] font-bold text-white">
                <MessageCircle className="h-3 w-3" /> WhatsApp
              </button>
              <button type="button" className="flex items-center gap-1 rounded-md bg-slate-800 px-2.5 py-1 text-[11px] font-bold text-white">
                <Printer className="h-3 w-3" /> Imprimir
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}