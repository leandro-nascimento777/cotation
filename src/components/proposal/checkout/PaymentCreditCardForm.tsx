"use client";

import { CreditCard } from "lucide-react";

export interface CardFormData {
  cardNumber: string;
  cardHolder: string;
  expiry: string;
  cvv: string;
  holderCpf: string;
  installments: number;
  saveCard: boolean;
}

interface PaymentCreditCardFormProps {
  cardData: CardFormData;
  onChange: (field: keyof CardFormData, value: string | number | boolean) => void;
  totalAmount: number;
}

export function PaymentCreditCardForm({ cardData, onChange, totalAmount }: PaymentCreditCardFormProps) {
  const installmentAmount4x = totalAmount > 0 ? (totalAmount / 4).toFixed(2) : "0,00";

  return (
    <div className="space-y-4 rounded-xl border border-slate-200 bg-slate-50/40 p-4 sm:p-5">
      <h3 className="text-sm sm:text-base font-bold text-slate-900">Complete com os dados do cartão</h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-[11px] font-medium text-slate-500 mb-1">Número do cartão</label>
          <div className="relative">
            <input
              type="text"
              maxLength={19}
              value={cardData.cardNumber}
              onChange={(e) => onChange("cardNumber", e.target.value)}
              placeholder="0000 0000 0000 0000"
              className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:border-[#5E17EB] focus:outline-none"
            />
            <CreditCard className="absolute right-3 top-3 h-4 w-4 text-slate-400 pointer-events-none" />
          </div>
          <p className="mt-1 text-[11px] text-slate-400">Informe o número do cartão</p>
        </div>

        <div>
          <label className="block text-[11px] font-medium text-slate-500 mb-1">Titular do cartão</label>
          <input
            type="text"
            value={cardData.cardHolder}
            onChange={(e) => onChange("cardHolder", e.target.value)}
            placeholder="Nome impresso no cartão"
            className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:border-[#5E17EB] focus:outline-none"
          />
          <p className="mt-1 text-[11px] text-slate-400">Como aparece no cartão</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="block text-[11px] font-medium text-slate-500 mb-1">Vencimento</label>
          <input
            type="text"
            maxLength={5}
            value={cardData.expiry}
            onChange={(e) => onChange("expiry", e.target.value)}
            placeholder="MM/AA"
            className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-800 focus:border-[#5E17EB] focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-[11px] font-medium text-slate-500 mb-1">Cód. Segurança</label>
          <input
            type="text"
            maxLength={4}
            value={cardData.cvv}
            onChange={(e) => onChange("cvv", e.target.value)}
            placeholder="CVV"
            className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-800 focus:border-[#5E17EB] focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-[11px] font-medium text-slate-500 mb-1">CPF do titular</label>
          <input
            type="text"
            value={cardData.holderCpf}
            onChange={(e) => onChange("holderCpf", e.target.value)}
            placeholder="000.000.000-00"
            className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-800 focus:border-[#5E17EB] focus:outline-none"
          />
          <p className="mt-1 text-[10px] text-slate-400">Exemplo: 12345678911</p>
        </div>
      </div>

      <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer pt-1">
        <input
          type="checkbox"
          checked={cardData.saveCard}
          onChange={(e) => onChange("saveCard", e.target.checked)}
          className="h-4 w-4 rounded text-[#5E17EB] accent-[#5E17EB]"
        />
        <span>Quero guardar este cartão para agilizar minhas próximas compras</span>
      </label>

      <div className="pt-2">
        <label className="block text-[11px] font-medium text-slate-500 mb-1">
          Em quantas parcelas você quer pagar?
        </label>
        <select
          value={cardData.installments}
          onChange={(e) => onChange("installments", Number(e.target.value))}
          className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm font-medium text-slate-800 focus:border-[#5E17EB] focus:outline-none"
        >
          <option value={1}>1x sem juros</option>
          <option value={2}>2x sem juros</option>
          <option value={3}>3x sem juros</option>
          <option value={4}>4x sem juros (4 parcelas de R$ {installmentAmount4x})</option>
        </select>
      </div>
    </div>
  );
}
