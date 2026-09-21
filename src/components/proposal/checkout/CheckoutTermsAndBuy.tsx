"use client";

import { Loader2, Send, Building2 } from "lucide-react";

interface CheckoutTermsAndBuyProps {
  authData: boolean;
  setAuthData: (val: boolean) => void;
  acceptTerms: boolean;
  setAcceptTerms: (val: boolean) => void;
  onBuy: () => void;
  onSendToAgencyOnly?: () => void;
  isAgencyPayment?: boolean;
  submitting: boolean;
}

export function CheckoutTermsAndBuy({
  authData,
  setAuthData,
  acceptTerms,
  setAcceptTerms,
  onBuy,
  onSendToAgencyOnly,
  isAgencyPayment = false,
  submitting,
}: CheckoutTermsAndBuyProps) {
  return (
    <div className="space-y-4 pt-2">
      <label className="flex items-start gap-2.5 text-xs text-slate-700 cursor-pointer select-none">
        <input
          type="checkbox"
          checked={authData}
          onChange={(e) => setAuthData(e.target.checked)}
          className="mt-0.5 h-4 w-4 rounded border-slate-300 text-[#5E17EB] accent-[#5E17EB]"
        />
        <span>
          Eu autorizo a Empresa a <strong>realizar o tratamento e o compartilhamento dos meus dados.</strong>
        </span>
      </label>

      <label className="flex items-start gap-2.5 text-xs text-slate-700 cursor-pointer select-none">
        <input
          type="checkbox"
          checked={acceptTerms}
          onChange={(e) => setAcceptTerms(e.target.checked)}
          className="mt-0.5 h-4 w-4 rounded border-slate-300 text-[#5E17EB] accent-[#5E17EB]"
        />
        <span>
          Li e aceito as <strong>condições de compra</strong>, <strong>política de privacidade</strong> e <strong>política de alterações e cancelamentos</strong> e entendo que o seguro viagem inclui todos os destinos internacionais (exceto Cuba).
        </span>
      </label>

      <div className="flex flex-col sm:flex-row sm:items-center gap-3 pt-2">
        <button
          type="button"
          onClick={onBuy}
          disabled={submitting}
          className={`flex items-center justify-center gap-2 rounded-full px-10 py-3.5 text-base font-bold text-white shadow-lg transition-all active:scale-[0.99] disabled:opacity-50 cursor-pointer ${
            isAgencyPayment
              ? "bg-[#5E17EB] hover:bg-[#4d13c7] hover:shadow-xl"
              : "bg-[#E51D25] hover:bg-[#cc161e] hover:shadow-xl"
          }`}
        >
          {submitting ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : isAgencyPayment ? (
            <Send className="h-5 w-5" />
          ) : null}
          {isAgencyPayment ? "Enviar cotação para a agência" : "Comprar"}
        </button>

        {!isAgencyPayment && onSendToAgencyOnly && (
          <button
            type="button"
            onClick={onSendToAgencyOnly}
            disabled={submitting}
            className="flex items-center justify-center gap-2 rounded-full border border-indigo-200 bg-indigo-50/80 px-6 py-3.5 text-xs sm:text-sm font-bold text-indigo-700 transition-all hover:bg-indigo-100 active:scale-[0.99] disabled:opacity-50 cursor-pointer"
          >
            <Building2 className="h-4 w-4 text-[#5E17EB]" />
            Não quero pagar agora: enviar para a agência
          </button>
        )}
      </div>

      <div className="flex items-center gap-4 rounded-2xl bg-[#104746] p-4 text-white shadow-sm">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-purple-600/30 text-2xl">
          🎁
        </div>
        <p className="text-sm font-bold leading-snug">
          Finalize essa cotação e garanta suporte exclusivo de nossos consultores especializados
        </p>
      </div>
    </div>
  );
}

