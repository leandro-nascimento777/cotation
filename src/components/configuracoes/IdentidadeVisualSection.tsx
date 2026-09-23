"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Sparkles, RotateCcw, Eye, FileText, Ticket, Plane, Loader2 } from "lucide-react";
import { PreviewCotacao } from "./PreviewCotacao";
import { PreviewReserva } from "./PreviewReserva";
import { PreviewPdf } from "./PreviewPdf";

interface IdentidadeVisualSectionProps {
  agencyName: string;
  logoDataUrl?: string;
  primaryColor: string;
  secondaryColor: string;
  textColor: string;
  useAgencyLogo: boolean;
  onUpdateColors: (colors: {
    pdfCorPrimaria?: string;
    pdfCorSecundaria?: string;
    pdfCorTexto?: string;
    pdfUsarLogoAgencia?: boolean;
  }) => void;
  onResetColors: () => void;
  isExtractingColors: boolean;
  onExtractColors: () => void;
}

export function IdentidadeVisualSection(props: IdentidadeVisualSectionProps) {
  const [tab, setTab] = useState<"cotacao" | "reserva" | "pdf">("cotacao");
  const prim = props.primaryColor || "#5E17EB";
  const sec = props.secondaryColor || "#00875A";
  const txt = props.textColor || "#1E1B4B";

  return (
    <div className="space-y-6">
      {/* Gestão de Cores */}
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-base font-bold text-slate-900">Personalização de Cores</h2>
            <p className="text-xs text-slate-500">Usadas na Cotação Web, no Voucher de Reserva e no PDF.</p>
          </div>
          <div className="flex items-center gap-2">
            {props.logoDataUrl && (
              <button
                type="button"
                onClick={props.onExtractColors}
                disabled={props.isExtractingColors}
                className="flex items-center gap-1.5 rounded-lg border border-purple-200 bg-purple-50 px-3 py-1.5 text-xs font-semibold text-[#5E17EB] hover:bg-purple-100 disabled:opacity-50"
              >
                {props.isExtractingColors ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
                Extrair com IA
              </button>
            )}
            <button
              type="button"
              onClick={props.onResetColors}
              className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-700 px-2 py-1"
            >
              <RotateCcw className="h-3.5 w-3.5" /> Restaurar
            </button>
          </div>
        </div>

        <div className="space-y-1.5">
          <span className="text-[10px] font-bold uppercase text-slate-400">Paletas Prontas</span>
          <div className="flex flex-wrap gap-2">
            {[
              { name: "Roxo JetUp", primary: "#5E17EB", secondary: "#00D26A", text: "#1E1B4B" },
              { name: "Azul Marinho", primary: "#1B4F8C", secondary: "#FF9900", text: "#1E293B" },
              { name: "Esmeralda", primary: "#0F766E", secondary: "#F59E0B", text: "#134E4A" },
              { name: "Vinho Luxo", primary: "#881337", secondary: "#D97706", text: "#4C0519" },
              { name: "Grafite", primary: "#18181B", secondary: "#3B82F6", text: "#27272A" },
            ].map((p) => (
              <button
                key={p.name}
                type="button"
                onClick={() => {
                  props.onUpdateColors({ pdfCorPrimaria: p.primary, pdfCorSecundaria: p.secondary, pdfCorTexto: p.text });
                  toast.success(`Paleta "${p.name}" aplicada!`);
                }}
                className="flex items-center gap-1.5 rounded-xl border border-slate-200 px-2.5 py-1 text-xs font-semibold hover:border-slate-300"
              >
                <span className="h-3 w-3 rounded-full border border-white" style={{ backgroundColor: p.primary }} />
                <span>{p.name}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <label className="flex flex-col gap-1 text-xs font-medium text-slate-600">
            <span>Cor Primária (Títulos e Faixas)</span>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={prim}
                onChange={(e) => props.onUpdateColors({ pdfCorPrimaria: e.target.value })}
                className="h-9 w-9 rounded-lg border border-slate-300 p-0.5 cursor-pointer"
              />
              <input
                value={prim}
                onChange={(e) => props.onUpdateColors({ pdfCorPrimaria: e.target.value })}
                className="min-w-0 flex-1 rounded-lg border border-slate-300 px-3 py-2 font-mono text-sm uppercase"
              />
            </div>
          </label>
          <label className="flex flex-col gap-1 text-xs font-medium text-slate-600">
            <span>Cor Secundária (Loc Cia e Badges)</span>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={sec}
                onChange={(e) => props.onUpdateColors({ pdfCorSecundaria: e.target.value })}
                className="h-9 w-9 rounded-lg border border-slate-300 p-0.5 cursor-pointer"
              />
              <input
                value={sec}
                onChange={(e) => props.onUpdateColors({ pdfCorSecundaria: e.target.value })}
                className="min-w-0 flex-1 rounded-lg border border-slate-300 px-3 py-2 font-mono text-sm uppercase"
              />
            </div>
          </label>
          <label className="flex flex-col gap-1 text-xs font-medium text-slate-600">
            <span>Cor do Texto</span>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={txt}
                onChange={(e) => props.onUpdateColors({ pdfCorTexto: e.target.value })}
                className="h-9 w-9 rounded-lg border border-slate-300 p-0.5 cursor-pointer"
              />
              <input
                value={txt}
                onChange={(e) => props.onUpdateColors({ pdfCorTexto: e.target.value })}
                className="min-w-0 flex-1 rounded-lg border border-slate-300 px-3 py-2 font-mono text-sm uppercase"
              />
            </div>
          </label>
        </div>
      </section>
      {/* Modo de Visualização */}
      <section className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Eye className="h-5 w-5 text-indigo-600" />
            <div>
              <h2 className="text-base font-bold text-slate-900">Modo de Visualização em Tempo Real</h2>
              <p className="text-xs text-slate-500">Alterne entre Cotação, Reserva e PDF para ver as mudanças ao vivo.</p>
            </div>
          </div>
          <div className="inline-flex rounded-xl border border-slate-200 bg-white p-1 shadow-xs">
            <button
              type="button"
              onClick={() => setTab("cotacao")}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition cursor-pointer ${
                tab === "cotacao" ? "bg-[#5E17EB] text-white shadow-xs" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Plane className="h-3.5 w-3.5" /> Cotação / Proposta
            </button>
            <button
              type="button"
              onClick={() => setTab("reserva")}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition cursor-pointer ${
                tab === "reserva" ? "bg-teal-600 text-white shadow-xs" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Ticket className="h-3.5 w-3.5" /> Reserva / Voucher
            </button>
            <button
              type="button"
              onClick={() => setTab("pdf")}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition cursor-pointer ${
                tab === "pdf" ? "bg-slate-800 text-white shadow-xs" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <FileText className="h-3.5 w-3.5" /> PDF A4
            </button>
          </div>
        </div>

        {tab === "cotacao" && (
          <PreviewCotacao
            agencyName={props.agencyName}
            logoDataUrl={props.useAgencyLogo ? props.logoDataUrl : undefined}
            primaryColor={prim}
            secondaryColor={sec}
            textColor={txt}
          />
        )}
        {tab === "reserva" && (
          <PreviewReserva
            agencyName={props.agencyName}
            logoDataUrl={props.useAgencyLogo ? props.logoDataUrl : undefined}
            primaryColor={prim}
            secondaryColor={sec}
            textColor={txt}
          />
        )}
        {tab === "pdf" && (
          <PreviewPdf
            agencyName={props.agencyName}
            logoDataUrl={props.useAgencyLogo ? props.logoDataUrl : undefined}
            primaryColor={prim}
            secondaryColor={sec}
            textColor={txt}
          />
        )}
      </section>
    </div>
  );
}