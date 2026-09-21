"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { formatCurrencyBRL } from "@/lib/format";

interface PaymentPixSelectedBoxProps {
  totalWithDiscount: number;
  discountAmount: number;
  onRemove?: () => void;
  onShowInstructions?: () => void;
}

export function PaymentPixSelectedBox({
  totalWithDiscount,
  discountAmount,
  onRemove,
  onShowInstructions,
}: PaymentPixSelectedBoxProps) {
  const [splitEqual, setSplitEqual] = useState(false);

  return (
    <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-4 sm:p-5 shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <h3 className="text-sm sm:text-base font-bold text-slate-900">Meios de pagamento selecionados</h3>
        <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
          <span>Dividir em partes iguais</span>
          <input
            type="checkbox"
            checked={splitEqual}
            onChange={(e) => setSplitEqual(e.target.checked)}
            className="h-4 w-4 rounded border-slate-300 text-[#5E17EB] accent-[#5E17EB]"
          />
        </label>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-slate-200/80 bg-slate-50/50 p-3.5">
        <div className="flex items-center gap-3">
          {/* Ícone Pix estilizado com losango */}
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-teal-200 bg-teal-50 text-teal-600 font-bold text-sm shadow-sm">
            ❖
          </div>
          <div>
            <span className="text-sm font-bold text-slate-900">Pix 1</span>
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="font-semibold text-slate-700">
                1 parcela de: {formatCurrencyBRL(totalWithDiscount)}
              </span>
              {discountAmount > 0 && (
                <span className="font-bold text-emerald-600">
                  Desconto: -{formatCurrencyBRL(discountAmount)}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-center">
          <button
            type="button"
            onClick={onShowInstructions}
            className="rounded-full border border-[#5E17EB] px-4 py-1.5 text-xs font-bold text-[#5E17EB] hover:bg-[#5E17EB]/5 transition cursor-pointer"
          >
            Ver instruções
          </button>
          {onRemove && (
            <button
              type="button"
              onClick={onRemove}
              title="Remover meio de pagamento"
              className="p-1.5 text-slate-400 hover:text-red-600 transition cursor-pointer"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
