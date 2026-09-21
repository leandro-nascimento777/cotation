"use client";

import { useState } from "react";
import { X, ChevronDown, ChevronUp, Check, X as XIcon } from "lucide-react";
import { FlightLeg } from "@/lib/types";
import { AirlineLogo } from "@/components/ui/AirlineLogo";
import {
  formatDurationLabel,
  formatModalDates,
  getAirportDetails,
  parseBaggageRules,
} from "@/lib/flightFormatters";

interface FlightLegModalProps {
  open: boolean;
  onClose: () => void;
  leg: FlightLeg;
  flightClass?: string;
  baggageText?: string;
}

export const FlightLegModal = ({
  open,
  onClose,
  leg,
  flightClass = "Econômica",
  baggageText,
}: FlightLegModalProps) => {
  const [showAccordion, setShowAccordion] = useState(false);

  if (!open) return null;

  const originInfo = getAirportDetails(leg.origin, "GRU");
  const destInfo = getAirportDetails(leg.destination, "AMS");
  const { depDate, arrDate } = formatModalDates(
    leg.date,
    leg.departureTime,
    leg.arrivalTime,
    leg.duration
  );
  const durationText = formatDurationLabel(leg.duration);
  const baggageRules = parseBaggageRules(baggageText);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-xl max-h-[92vh] overflow-y-auto rounded-3xl bg-white p-6 sm:p-8 shadow-2xl border border-slate-200 text-left animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Botão Fechar no canto superior direito */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          aria-label="Fechar"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Topo da Cia Aérea e Avaliação (Anexo 3 e 5) */}
        <div className="flex items-center justify-between gap-4 border-b border-slate-100 pb-4 pr-8">
          <div className="flex items-center gap-3">
            <AirlineLogo
              airline={leg.airline}
              flightNumber={leg.flightNumber}
              className="h-8 w-8"
              size={128}
            />
            <h3 className="text-lg sm:text-xl font-bold text-slate-900">
              {leg.airline}
            </h3>
          </div>
          <span className="inline-flex items-center gap-1 rounded-md bg-[#008269] px-2.5 py-1 text-xs font-bold text-white shadow-xs">
            <span>8.2</span>
            <span className="font-normal opacity-95">Muito bom</span>
          </span>
        </div>

        {/* Sub-informações: Classe, Operação e Voo */}
        <div className="mt-3.5 space-y-2 text-xs text-slate-600 font-medium">
          <p>
            Classe: <span className="font-semibold text-slate-900">{flightClass}</span>
          </p>
          <div className="rounded-lg border border-slate-200/80 px-3 py-1.5 text-slate-600 text-center text-xs">
            Operado por {leg.airline}
          </div>
          <p>
            Voo Nº: <span className="font-semibold text-slate-900">{leg.flightNumber || "LA8078"}</span>
          </p>
        </div>

        {/* Card do Itinerário / Trecho (Anexo 3 e 5) */}
        <div className="mt-5 rounded-2xl border border-slate-200 p-5 space-y-4">
          <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
            {/* Origem */}
            <div className="text-left">
              <span className="text-xs font-semibold text-slate-600 block">{depDate}</span>
              <span className="text-3xl sm:text-4xl font-black text-slate-900 leading-tight block">
                {leg.departureTime || "18:00"}
              </span>
              <div className="mt-1 text-sm font-bold text-slate-900">
                {originInfo.iata} <span className="font-normal text-slate-600">{originInfo.cidade}</span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium line-clamp-1">
                {originInfo.nome}
              </p>
            </div>

            {/* Duração central */}
            <div className="flex flex-col items-center px-2">
              <span className="text-xs text-slate-500 font-medium whitespace-nowrap">
                — Duração {durationText} —
              </span>
            </div>

            {/* Destino */}
            <div className="text-right">
              <span className="text-xs font-semibold text-red-600 block">{arrDate}</span>
              <span className="text-3xl sm:text-4xl font-black text-slate-900 leading-tight block">
                {leg.arrivalTime || "11:00"}
              </span>
              <div className="mt-1 text-sm font-bold text-slate-900">
                {destInfo.iata} <span className="font-normal text-slate-600">{destInfo.cidade}</span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium line-clamp-1">
                {destInfo.nome}
              </p>
            </div>
          </div>

          {/* Acordeon Mais detalhes / Menos detalhes (Anexo 3 e 5) */}
          <div className="border-t border-slate-100 pt-3">
            <button
              type="button"
              onClick={() => setShowAccordion((prev) => !prev)}
              className="w-full flex items-center justify-center gap-1 text-sm font-bold text-[#6E44FF] hover:text-[#5E17EB] transition-colors py-1 cursor-pointer"
            >
              <span>{showAccordion ? "Menos detalhes" : "Mais detalhes"}</span>
              {showAccordion ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>

            {/* Conteúdo do Acordeon aberto (Anexo 5) */}
            {showAccordion && (
              <div className="mt-3 pt-3 border-t border-slate-100 space-y-2.5 text-left animate-in fade-in duration-200">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                  Voo flexível
                </h4>
                <div className="space-y-1.5 text-xs text-slate-700">
                  <div className="flex items-center gap-2 text-slate-600">
                    <XIcon className="h-4 w-4 text-slate-500 shrink-0" />
                    <span>Não permite cancelamento</span>
                  </div>
                  <div className="flex items-center gap-2 text-[#008269] font-semibold">
                    <Check className="h-4 w-4 text-[#008269] shrink-0" />
                    <span>Permite alterações a partir de taxa administrativa da cia</span>
                  </div>
                </div>
                <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
                  Você poderá revisar mais detalhes sobre alterações e cancelamentos no passo seguinte.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Pill de Duração Cinza */}
        <div className="mt-4 rounded-xl bg-slate-100 py-2.5 text-center text-xs font-bold text-slate-800">
          Duração: {durationText}
        </div>
        <p className="text-center text-[11px] text-slate-500 font-medium mt-1">
          Horários em hora local de cada cidade
        </p>

        {/* Box de Bagagem no Rodapé (Anexo 3 e 5) */}
        <div className="mt-4 rounded-2xl border border-slate-200 p-4 sm:p-5">
          <div className="grid grid-cols-1 sm:grid-cols-[85px_1fr] gap-4 items-start">
            <div className="text-sm font-bold text-slate-800">Bagagem</div>

            <div className="sm:border-l sm:border-slate-200 sm:pl-5 space-y-3.5">
              {/* Mochila */}
              <div className="flex items-start gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/icons/baggage/bolsa.png"
                  alt="Mochila ou bolsa"
                  className="h-5 w-5 shrink-0 mt-0.5 object-contain"
                />
                <div>
                  <p className="text-xs font-bold text-[#008269]">Inclui uma mochila ou bolsa</p>
                  <p className="text-[11px] text-slate-500 font-medium">Deve caber embaixo do assento dianteiro.</p>
                </div>
              </div>

              {/* Bagagem de mão */}
              <div className="flex items-start gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/icons/baggage/mala-mao.png"
                  alt="Bagagem de mão"
                  className={`h-5 w-5 shrink-0 mt-0.5 object-contain ${
                    baggageRules.hasHandbag ? "opacity-100" : "opacity-30 grayscale"
                  }`}
                />
                <div>
                  <p className={`text-xs font-bold ${baggageRules.hasHandbag ? "text-[#008269]" : "text-slate-500 line-through"}`}>
                    {baggageRules.hasHandbag ? "Inclui bagagem de mão" : "Não inclui bagagem de mão"}
                  </p>
                  <p className="text-[11px] text-slate-500 font-medium">Deve caber no compartimento superior do avião.</p>
                </div>
              </div>

              {/* Mala despachada */}
              <div className="flex items-start gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/icons/baggage/mala-despachada.png"
                  alt="Bagagem despachada"
                  className={`h-5 w-5 shrink-0 mt-0.5 object-contain ${
                    baggageRules.hasCheckedBag ? "opacity-100" : "opacity-35 grayscale"
                  }`}
                />
                <div>
                  <p className={`text-xs font-bold ${baggageRules.hasCheckedBag ? "text-[#008269]" : "text-slate-800"}`}>
                    {baggageRules.hasCheckedBag
                      ? "Inclui bagagem para despachar (23kg)"
                      : "Não inclui bagagem para despachar"}
                  </p>
                  <p className="text-[11px] text-slate-500 font-medium">
                    {baggageRules.hasCheckedBag
                      ? "1 mala de até 23kg por adulto inclusa para despachar."
                      : "Você poderá comprar malas online por um preço exclusivo."}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
