"use client";

import { CheckCircle2, Mail, ArrowRight, X } from "lucide-react";
import { TravelerFormData } from "./TravelersCard";

interface PurchaseSuccessModalProps {
  open: boolean;
  bookingRef: string;
  travelers: TravelerFormData[];
  destination: string;
  contactEmail: string;
  onClose: () => void;
}

export function PurchaseSuccessModal({
  open,
  bookingRef,
  travelers,
  destination,
  contactEmail,
  onClose,
}: PurchaseSuccessModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 p-4 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="relative w-full max-w-md rounded-3xl border border-slate-200 bg-white p-7 text-center shadow-2xl space-y-6">
        <button
          type="button"
          onClick={onClose}
          aria-label="Fechar"
          className="absolute right-4 top-4 rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 cursor-pointer"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-[#00875A]">
          <CheckCircle2 className="h-10 w-10 stroke-[2.5]" />
        </div>

        <div className="space-y-1">
          <h2 className="text-2xl font-black tracking-tight text-slate-900">Compra confirmada!</h2>
          <p className="text-xs text-slate-500">
            Sua solicitação de reserva para <strong>{destination || "sua viagem"}</strong> foi realizada com sucesso.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 space-y-3 text-left text-xs">
          <div className="flex items-center justify-between border-b border-slate-200/80 pb-2.5">
            <span className="text-slate-500 font-medium">Código do pedido</span>
            <span className="rounded bg-indigo-50 px-2.5 py-0.5 font-mono text-sm font-black text-indigo-700">
              {bookingRef}
            </span>
          </div>

          <div>
            <span className="block text-slate-500 font-medium mb-1">Passageiros confirmados:</span>
            <ul className="space-y-1">
              {travelers.map((t, idx) => (
                <li key={idx} className="font-bold text-slate-800 flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  {t.nome} {t.sobrenome} ({t.tipo})
                </li>
              ))}
            </ul>
          </div>

          <div className="border-t border-slate-200/80 pt-2 flex items-center gap-2 text-slate-500">
            <Mail className="h-4 w-4 shrink-0 text-slate-400" />
            <span>Vouchers e bilhetes enviados para: <strong className="text-slate-700">{contactEmail}</strong></span>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="flex w-full items-center justify-center gap-2 rounded-full bg-[#5E17EB] py-3 text-sm font-bold text-white shadow-md hover:bg-[#4d13c7] transition cursor-pointer"
        >
          Visualizar detalhes da viagem <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
