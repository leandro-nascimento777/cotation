"use client";

import { X, ShieldAlert } from "lucide-react";

interface CancellationPoliciesModalProps {
  open: boolean;
  onClose: () => void;
}

export function CancellationPoliciesModal({ open, onClose }: CancellationPoliciesModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl space-y-5">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <ShieldAlert className="h-5 w-5 text-indigo-600" />
            <h3 className="text-base font-bold text-slate-900">Políticas de Alterações e Cancelamento</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-3.5 text-xs text-slate-600 leading-relaxed max-h-[60vh] overflow-y-auto pr-1">
          <div className="rounded-xl border border-slate-100 bg-slate-50 p-3.5 space-y-1.5">
            <p className="font-bold text-slate-900">1. Cancelamento com reembolso</p>
            <p>
              Cancelamentos solicitados em até 24 horas após a compra com antecedência mínima de 7 dias da data de embarque têm direito a reembolso integral conforme a Resolução nº 400 da ANAC.
            </p>
          </div>

          <div className="rounded-xl border border-slate-100 bg-slate-50 p-3.5 space-y-1.5">
            <p className="font-bold text-slate-900">2. Alteração de datas ou voo</p>
            <p>
              Alterações estão sujeitas à disponibilidade de classe tarifária e eventuais diferenças de preço e taxa de remarcação da companhia aérea responsável.
            </p>
          </div>

          <div className="rounded-xl border border-slate-100 bg-slate-50 p-3.5 space-y-1.5">
            <p className="font-bold text-slate-900">3. Não comparecimento (No-Show)</p>
            <p>
              Caso o passageiro não compareça ao portão de embarque no horário estabelecido, serão aplicadas as regras de no-show da tarifa contratada.
            </p>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-full bg-[#5E17EB] px-6 py-2 text-xs font-bold text-white shadow hover:bg-[#4d13c7] transition cursor-pointer"
          >
            Entendi
          </button>
        </div>
      </div>
    </div>
  );
}
