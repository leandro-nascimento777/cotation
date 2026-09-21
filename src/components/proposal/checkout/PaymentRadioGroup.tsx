"use client";

import { Building2 } from "lucide-react";
import { PaymentMethodKind } from "./PaymentMethodsCard";

interface PaymentRadioGroupProps {
  selectedMethod: PaymentMethodKind;
  onSelectMethod: (method: PaymentMethodKind) => void;
}

export function PaymentRadioGroup({ selectedMethod, onSelectMethod }: PaymentRadioGroupProps) {
  return (
    <div className="space-y-2 rounded-xl border border-slate-200 divide-y divide-slate-100">
      <label className="flex items-center justify-between p-3.5 cursor-pointer hover:bg-slate-50">
        <div className="flex items-center gap-3">
          <input
            type="radio"
            name="payment-option"
            checked={selectedMethod === "CARTAO"}
            onChange={() => onSelectMethod("CARTAO")}
            className="h-4 w-4 text-[#5E17EB] accent-[#5E17EB]"
          />
          <span className="text-sm font-bold text-slate-800">Cartão de crédito</span>
        </div>
        <span className="text-xs text-slate-500">Até 4x sem juros</span>
      </label>

      <label className="flex items-center justify-between p-3.5 cursor-pointer hover:bg-slate-50">
        <div className="flex items-center gap-3">
          <input
            type="radio"
            name="payment-option"
            checked={selectedMethod === "PIX"}
            onChange={() => onSelectMethod("PIX")}
            className="h-4 w-4 text-[#5E17EB] accent-[#5E17EB]"
          />
          <span className="text-sm font-bold text-slate-800">Pix</span>
        </div>
        <span className="rounded bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-800">
          Até 1% OFF
        </span>
      </label>

      <label className="flex items-center justify-between p-3.5 cursor-pointer hover:bg-slate-50">
        <div className="flex items-center gap-3">
          <input
            type="radio"
            name="payment-option"
            checked={selectedMethod === "NUPAY"}
            onChange={() => onSelectMethod("NUPAY")}
            className="h-4 w-4 text-[#5E17EB] accent-[#5E17EB]"
          />
          <span className="text-sm font-bold text-slate-800">NuPay</span>
        </div>
        <span className="rounded bg-teal-100 px-2.5 py-0.5 text-xs font-bold text-teal-800">
          Pague em até 24x
        </span>
      </label>

      <label className="flex items-center justify-between p-3.5 cursor-pointer hover:bg-purple-50/40 bg-purple-50/20">
        <div className="flex items-center gap-3">
          <input
            type="radio"
            name="payment-option"
            checked={selectedMethod === "AGENCIA"}
            onChange={() => onSelectMethod("AGENCIA")}
            className="h-4 w-4 text-[#5E17EB] accent-[#5E17EB]"
          />
          <div>
            <span className="text-sm font-bold text-[#5E17EB] flex items-center gap-1.5">
              <Building2 className="h-4 w-4" /> Combinar com a agência
            </span>
            <p className="text-[11px] text-slate-500">
              Não quer pagar online agora? Pague via faturamento, transferência ou link da agência
            </p>
          </div>
        </div>
        <span className="rounded bg-indigo-100 px-2.5 py-0.5 text-xs font-bold text-indigo-800 shrink-0">
          Pagar depois
        </span>
      </label>
    </div>
  );
}

