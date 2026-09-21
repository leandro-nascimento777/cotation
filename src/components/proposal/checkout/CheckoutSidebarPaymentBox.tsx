"use client";

import { Info } from "lucide-react";
import { formatCurrencyBRL } from "@/lib/format";

interface CheckoutSidebarPaymentBoxProps {
  effectivePassengers: number;
  flightAmount: number;
  assistanceAmount: number;
  taxesAmount: number;
  subtotal: number;
  totalPix: number;
  isPixSelected: boolean;
}

export function CheckoutSidebarPaymentBox({
  effectivePassengers,
  flightAmount,
  assistanceAmount,
  taxesAmount,
  subtotal,
  totalPix,
  isPixSelected,
}: CheckoutSidebarPaymentBoxProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
      <h3 className="text-base font-bold text-slate-900">Detalhe do pagamento</h3>
      <div className="space-y-2.5 text-xs">
        <div className="flex justify-between text-slate-600">
          <span>Voo para {effectivePassengers} {effectivePassengers > 1 ? "pessoas" : "pessoa"}</span>
          <span className="font-semibold text-slate-800">{formatCurrencyBRL(flightAmount)}</span>
        </div>
        <div className="flex justify-between text-slate-600">
          <span>Assistência ao {effectivePassengers} {effectivePassengers > 1 ? "viajantes" : "viajante"}</span>
          <span className="font-semibold text-slate-800">{formatCurrencyBRL(assistanceAmount)}</span>
        </div>
        <div className="flex justify-between text-slate-600">
          <span className="flex items-center gap-1">Impostos e taxas <Info className="h-3 w-3 text-slate-400" /></span>
          <span className="font-semibold text-slate-800">{formatCurrencyBRL(taxesAmount)}</span>
        </div>

        <div className="border-t border-slate-200 pt-3 flex justify-between items-baseline">
          <span className="font-bold text-slate-800 uppercase text-xs">{isPixSelected ? "SUBTOTAL" : "TOTAL"}</span>
          <span className="font-black text-lg text-slate-900">{formatCurrencyBRL(subtotal)}</span>
        </div>

        {isPixSelected && (
          <div className="border-t border-slate-100 pt-3 space-y-2">
            <div className="flex justify-between text-slate-700">
              <span className="flex items-center gap-1 font-semibold">Pix 1 <Info className="h-3 w-3 text-slate-400" /></span>
              <span className="font-bold text-slate-900">{formatCurrencyBRL(totalPix)}</span>
            </div>
            <div className="flex justify-between text-slate-500 text-[11px]">
              <span>Saldo restante:</span>
              <span className="font-medium text-slate-700">R$ 0</span>
            </div>
            <div className="flex justify-between items-baseline pt-1 border-t border-slate-200">
              <span className="font-bold text-slate-900 text-xs">TOTAL:</span>
              <span className="font-black text-lg text-slate-900">{formatCurrencyBRL(totalPix)}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
