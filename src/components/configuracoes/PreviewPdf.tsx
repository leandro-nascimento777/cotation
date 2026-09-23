"use client";

import { FileText, Sparkles } from "lucide-react";

interface PreviewPdfProps {
  agencyName: string;
  logoDataUrl?: string;
  primaryColor: string;
  secondaryColor: string;
  textColor: string;
}

export function PreviewPdf({
  agencyName,
  logoDataUrl,
  primaryColor,
  secondaryColor,
  textColor,
}: PreviewPdfProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between rounded-xl bg-blue-50/80 px-4 py-2 border border-blue-200/70 text-xs text-blue-900">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-blue-600" />
          <span><strong>Modo de Visualização:</strong> Veja a folha do Orçamento Impresso / PDF A4.</span>
        </div>
        <span className="text-[11px] font-mono bg-blue-100/80 px-2 py-0.5 rounded text-blue-800">
          Cores no Documento
        </span>
      </div>

      {/* Folha A4 simulada */}
      <div className="w-full max-w-3xl mx-auto bg-white rounded-xl border border-slate-300 shadow-xl p-6 sm:p-8 space-y-6">
        {/* Topo do PDF */}
        <div className="flex items-center justify-between border-b pb-4" style={{ borderBottomColor: primaryColor }}>
          <div className="flex items-center gap-3">
            {logoDataUrl ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img src={logoDataUrl} alt={agencyName} className="max-h-12 max-w-[150px] object-contain" />
            ) : (
              <div
                className="flex h-10 w-10 items-center justify-center rounded-lg text-white font-black text-lg"
                style={{ backgroundColor: primaryColor }}
              >
                ✈
              </div>
            )}
            <div>
              <h2 className="text-base font-black uppercase text-slate-900">{agencyName || "SUA AGÊNCIA DE VIAGENS"}</h2>
              <p className="text-[10px] text-slate-500">Cotação Oficial de Viagem</p>
            </div>
          </div>

          <div className="text-right">
            <span
              className="inline-block rounded px-2.5 py-0.5 text-[10px] font-black text-white uppercase"
              style={{ backgroundColor: primaryColor }}
            >
              Cotação #2026-0042
            </span>
            <p className="text-[10px] text-slate-400 mt-1">Validade: 24 horas</p>
          </div>
        </div>

        {/* Título da Cotação */}
        <div className="space-y-1">
          <h3 className="text-lg font-black" style={{ color: primaryColor }}>
            Proposta de Voo: São Paulo (GRU) ➔ Amsterdã (AMS)
          </h3>
          <p className="text-xs text-slate-500">Passageiro: Eduardo Mendonça (2 adultos)</p>
        </div>

        {/* Tabela de Opções */}
        <div className="rounded-lg border border-slate-200 overflow-hidden">
          <div
            className="flex items-center justify-between px-3 py-2 text-white font-bold text-xs uppercase"
            style={{ backgroundColor: primaryColor }}
          >
            <span>Opção 1 — KLM Royal Dutch Airlines</span>
            <span
              className="rounded px-2 py-0.5 text-[9px] font-black"
              style={{ backgroundColor: secondaryColor, color: "#ffffff" }}
            >
              Melhor Opção
            </span>
          </div>

          <div className="p-3 text-xs space-y-2 bg-slate-50/50" style={{ color: textColor }}>
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="font-semibold text-slate-600">Trecho de Ida:</span>
              <span className="font-bold text-slate-800">GRU 20:30 ➔ AMS 13:15 (+1) • KL 792</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="font-semibold text-slate-600">Trecho de Volta:</span>
              <span className="font-bold text-slate-800">AMS 10:40 ➔ GRU 18:20 • KL 791</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="font-semibold text-slate-600">Bagagem:</span>
              <span className="font-bold text-slate-800">1x 23kg despachada por passageiro</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="font-bold text-slate-900">Total com Taxas e DU:</span>
              <span className="text-sm font-black" style={{ color: primaryColor }}>
                R$ 11.450,00
              </span>
            </div>
          </div>
        </div>

        {/* Rodapé A4 */}
        <div className="border-t border-slate-200 pt-3 flex items-center justify-between text-[10px] text-slate-400">
          <span className="flex items-center gap-1">
            <FileText className="h-3 w-3" /> Gerado pelo JetUp Cotation
          </span>
          <span>Valores sujeitos a alteração e disponibilidade de classe.</span>
        </div>
      </div>
    </div>
  );
}