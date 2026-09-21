"use client";

import { Plane, Briefcase, Info } from "lucide-react";

interface CheckoutSidebarTripBoxProps {
  originCity: string;
  destinationCity: string;
  idaDateLabel: string;
  voltaDateLabel: string;
  idaTime: string;
  voltaTime: string;
  onOpenFlightDetails: () => void;
  onOpenPoliciesModal: () => void;
}

export function CheckoutSidebarTripBox({
  originCity,
  destinationCity,
  idaDateLabel,
  voltaDateLabel,
  idaTime,
  voltaTime,
  onOpenFlightDetails,
  onOpenPoliciesModal,
}: CheckoutSidebarTripBoxProps) {
  return (
    <>
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-900">Sua viagem</h3>
          <button
            type="button"
            onClick={onOpenFlightDetails}
            className="text-xs font-semibold text-[#5E17EB] hover:underline cursor-pointer"
          >
            Ver mais detalhes
          </button>
        </div>

        <div className="flex items-start gap-3">
          <div className="mt-0.5 rounded-full bg-slate-100 p-2 text-slate-700">
            <Plane className="h-4 w-4" />
          </div>
          <div className="space-y-0.5 text-xs">
            <p className="font-bold text-slate-900">{originCity} - {destinationCity}</p>
            <p className="text-slate-500 font-medium">IDA: {idaDateLabel} - {idaTime}</p>
            <p className="text-slate-500 font-medium">VOLTA: {voltaDateLabel} - {voltaTime}</p>
          </div>
        </div>

        <div className="flex items-start gap-3 border-t border-slate-100 pt-3">
          <div className="mt-0.5 rounded-full bg-slate-100 p-2 text-slate-700">
            <Briefcase className="h-4 w-4" />
          </div>
          <div className="space-y-0.5 text-xs">
            <p className="font-bold text-slate-900">Assistência Ouro</p>
            <p className="text-slate-500 font-medium">Desde: {idaDateLabel}</p>
            <p className="text-slate-500 font-medium">ATÉ: {voltaDateLabel}</p>
          </div>
        </div>
      </div>

      <div className="rounded-2xl bg-slate-800 p-4 text-white shadow-sm flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <Info className="h-5 w-5 shrink-0 text-slate-300" />
          <p className="text-xs font-semibold leading-snug">Ver políticas de alterações e cancelamentos</p>
        </div>
        <button
          type="button"
          onClick={onOpenPoliciesModal}
          className="shrink-0 rounded-full border border-white/80 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-white/10 transition cursor-pointer"
        >
          Ver condições
        </button>
      </div>
    </>
  );
}
