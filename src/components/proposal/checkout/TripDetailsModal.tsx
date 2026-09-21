"use client";

import { useState } from "react";
import {
  X,
  ChevronDown,
  ChevronUp,
  Plane,
  Luggage,
  Check,
  X as XIcon,
  Info,
} from "lucide-react";
import { QuoteItem } from "@/lib/types";
import { AirlineLogo } from "@/components/ui/AirlineLogo";
import {
  formatDurationLabel,
  formatHeaderDate,
  getAirportDetails,
  checkNextDayArrival,
  parseBaggageRules,
} from "@/lib/flightFormatters";

interface TripDetailsModalProps {
  open: boolean;
  onClose: () => void;
  selectedIdaItem: QuoteItem | null;
  selectedVoltaItem: QuoteItem | null;
  originCity: string;
  destinationCity: string;
  adultsCount: number;
  childrenCount: number;
  infantsCount: number;
  onOpenPoliciesModal?: () => void;
}

export function TripDetailsModal({
  open,
  onClose,
  selectedIdaItem,
  selectedVoltaItem,
  originCity,
  destinationCity,
  adultsCount,
  childrenCount,
  infantsCount,
  onOpenPoliciesModal,
}: TripDetailsModalProps) {
  const [isBaggageAccordionOpen, setIsBaggageAccordionOpen] = useState(true);

  if (!open) return null;

  const idaLeg = selectedIdaItem?.ida ?? selectedIdaItem?.volta;
  const voltaLeg = selectedVoltaItem?.volta ?? selectedIdaItem?.volta;

  const idaOrigin = getAirportDetails(idaLeg?.origin, "GRU");
  const idaDest = getAirportDetails(idaLeg?.destination, "AMS");

  const voltaOrigin = getAirportDetails(voltaLeg?.origin || idaDest.iata, "AMS");
  const voltaDest = getAirportDetails(voltaLeg?.destination || idaOrigin.iata, "GRU");

  const idaBaggageRules = parseBaggageRules(selectedIdaItem?.baggage);
  const voltaBaggageRules = parseBaggageRules(selectedVoltaItem?.baggage || selectedIdaItem?.baggage);

  const idaIsNextDay = checkNextDayArrival(idaLeg?.departureTime, idaLeg?.arrivalTime, idaLeg?.duration);
  const voltaIsNextDay = checkNextDayArrival(voltaLeg?.departureTime, voltaLeg?.arrivalTime, voltaLeg?.duration);

  const passengerParts: string[] = [];
  if (adultsCount > 0) passengerParts.push(`${adultsCount} ${adultsCount > 1 ? "adultos" : "adulto"}`);
  if (childrenCount > 0) passengerParts.push(`${childrenCount} ${childrenCount > 1 ? "crianças" : "criança"}`);
  if (infantsCount > 0) passengerParts.push(`${infantsCount} ${infantsCount > 1 ? "bebês" : "bebê"}`);
  const passengersLabel = passengerParts.join(", ") || "1 adulto";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 p-3 sm:p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative flex max-h-[92vh] w-full max-w-2xl flex-col rounded-3xl border border-slate-200 bg-slate-50 shadow-2xl overflow-hidden">
        {/* Header do modal */}
        <div className="flex items-center justify-between border-b border-slate-200/80 bg-white px-6 py-4">
          <h2 className="text-lg sm:text-xl font-bold text-slate-900">Detalhes da sua viagem</h2>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full text-slate-500 hover:bg-slate-100 transition cursor-pointer"
            aria-label="Fechar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Corpo scrollável */}
        <div className="overflow-y-auto p-4 sm:p-6 space-y-4">
          {/* Card Sanfona: Seus voos incluem bagagem */}
          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
            <button
              type="button"
              onClick={() => setIsBaggageAccordionOpen((prev) => !prev)}
              className="flex w-full items-center justify-between p-4 hover:bg-slate-50/70 transition cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-purple-50 text-[#5E17EB]">
                  <Luggage className="h-5 w-5 stroke-[2.2]" />
                </div>
                <span className="text-sm font-bold text-slate-900">Seus voos incluem bagagem</span>
              </div>
              {isBaggageAccordionOpen ? (
                <ChevronUp className="h-5 w-5 text-slate-500" />
              ) : (
                <ChevronDown className="h-5 w-5 text-slate-500" />
              )}
            </button>

            {isBaggageAccordionOpen && (
              <div className="border-t border-slate-100 p-4 sm:p-5 pt-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Bagagem IDA */}
                  <div className="space-y-3">
                    <div className="space-y-0.5">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">IDA</span>
                      <p className="text-xs font-bold text-slate-800">
                        {idaOrigin.iata} ({idaOrigin.cidade}) → {idaDest.iata} ({idaDest.cidade})
                      </p>
                    </div>

                    <div className="space-y-2.5 text-xs">
                      <div className="flex items-start gap-2.5">
                        <span className="text-sm leading-none shrink-0 text-[#00875A]">🎒</span>
                        <div>
                          <p className="font-bold text-[#00875A]">Inclui uma mochila ou bolsa</p>
                          <p className="text-[11px] text-slate-500 leading-tight">
                            Deve caber embaixo do assento dianteiro.
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-2.5">
                        <span className="text-sm leading-none shrink-0 text-[#00875A]">🧳</span>
                        <div>
                          <p className="font-bold text-[#00875A]">Inclui bagagem de mão</p>
                          <p className="text-[11px] text-slate-500 leading-tight">
                            Deve caber no compartimento superior do avião.
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-2.5">
                        <span className="text-sm leading-none shrink-0 text-[#00875A]">🧳</span>
                        <div>
                          <p className="font-bold text-[#00875A]">
                            {idaBaggageRules.hasCheckedBag
                              ? "Inclui bagagem para despachar"
                              : "Bagagem para despachar não inclusa"}
                          </p>
                          <p className="text-[11px] text-slate-500 leading-tight">
                            {idaBaggageRules.hasCheckedBag
                              ? "1 mala por adulto. O despache é feito durante o Check-in no aeroporto."
                              : "Pode ser adquirida separadamente com a agência ou cia aérea."}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Bagagem VOLTA */}
                  <div className="space-y-3 md:border-l md:border-slate-100 md:pl-6">
                    <div className="space-y-0.5">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">VOLTA</span>
                      <p className="text-xs font-bold text-slate-800">
                        {voltaOrigin.iata} ({voltaOrigin.cidade}) → {voltaDest.iata} ({voltaDest.cidade})
                      </p>
                    </div>

                    <div className="space-y-2.5 text-xs">
                      <div className="flex items-start gap-2.5">
                        <span className="text-sm leading-none shrink-0 text-[#00875A]">🎒</span>
                        <div>
                          <p className="font-bold text-[#00875A]">Inclui uma mochila ou bolsa</p>
                          <p className="text-[11px] text-slate-500 leading-tight">
                            Deve caber embaixo do assento dianteiro.
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-2.5">
                        <span className="text-sm leading-none shrink-0 text-[#00875A]">🧳</span>
                        <div>
                          <p className="font-bold text-[#00875A]">Inclui bagagem de mão</p>
                          <p className="text-[11px] text-slate-500 leading-tight">
                            Deve caber no compartimento superior do avião.
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-2.5">
                        <span className="text-sm leading-none shrink-0 text-[#00875A]">🧳</span>
                        <div>
                          <p className="font-bold text-[#00875A]">
                            {voltaBaggageRules.hasCheckedBag
                              ? "Inclui bagagem para despachar"
                              : "Bagagem para despachar não inclusa"}
                          </p>
                          <p className="text-[11px] text-slate-500 leading-tight">
                            {voltaBaggageRules.hasCheckedBag
                              ? "1 mala por adulto. O despache é feito durante o Check-in no aeroporto."
                              : "Pode ser adquirida separadamente com a agência ou cia aérea."}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Card Principal: São Paulo - Amsterdã e voos de ida e volta */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm space-y-5">
            {/* Topo do card: Ícone de avião, Cidades e passageiros */}
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Plane className="h-5 w-5 text-slate-700" />
                <h3 className="text-base sm:text-lg font-bold text-slate-900">
                  {originCity} - {destinationCity}
                </h3>
              </div>
              <p className="text-xs text-slate-500">
                Ida e volta, {passengersLabel}
              </p>
            </div>

            {/* Trecho IDA */}
            {idaLeg && (
              <div className="space-y-3 pt-1">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">IDA</span>
                  <p className="text-sm font-bold text-slate-800">{formatHeaderDate(idaLeg.date)}</p>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AirlineLogo airline={idaLeg.airline} flightNumber={idaLeg.flightNumber} className="h-5 w-5 object-contain" />
                    <span className="text-xs font-semibold text-slate-800">{idaLeg.airline || "Companhia aérea"}</span>
                  </div>
                  <Info className="h-4 w-4 text-[#5E17EB] cursor-pointer" />
                </div>

                <div className="grid grid-cols-4 items-center gap-2 text-center sm:text-left">
                  <div>
                    <span className="block text-[11px] font-bold text-slate-400">{idaOrigin.iata}</span>
                    <span className="text-xl font-black text-slate-900">{idaLeg.departureTime || "21:45"}</span>
                  </div>

                  <div className="text-center">
                    <span className="inline-block border-b border-teal-600 text-xs font-semibold text-teal-700">
                      {idaLeg.stops === 0 || !idaLeg.stops ? "Direto" : `${idaLeg.stops} parada${idaLeg.stops > 1 ? "s" : ""}`}
                    </span>
                  </div>

                  <div>
                    <span className="block text-[11px] font-bold text-slate-400">{idaDest.iata}</span>
                    <span className="text-xl font-black text-slate-900">
                      {idaLeg.arrivalTime || "14:20"}
                      {idaIsNextDay && <sup className="ml-0.5 text-xs font-bold text-red-500">+1</sup>}
                    </span>
                  </div>

                  <div className="text-right">
                    <span className="block text-[11px] text-slate-400">Duração</span>
                    <span className="text-xs font-bold text-slate-800">{formatDurationLabel(idaLeg.duration)}</span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 pt-1 text-teal-700 text-base">
                  <span>🎒</span>
                  <span>🧳</span>
                  {idaBaggageRules.hasCheckedBag && <span>🧳</span>}
                </div>
              </div>
            )}

            <hr className="border-slate-100" />

            {/* Trecho VOLTA */}
            {voltaLeg && (
              <div className="space-y-3">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">VOLTA</span>
                  <p className="text-sm font-bold text-slate-800">{formatHeaderDate(voltaLeg.date)}</p>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AirlineLogo airline={voltaLeg.airline} flightNumber={voltaLeg.flightNumber} className="h-5 w-5 object-contain" />
                    <span className="text-xs font-semibold text-slate-800">{voltaLeg.airline || "Companhia aérea"}</span>
                  </div>
                  <Info className="h-4 w-4 text-[#5E17EB] cursor-pointer" />
                </div>

                <div className="grid grid-cols-4 items-center gap-2 text-center sm:text-left">
                  <div>
                    <span className="block text-[11px] font-bold text-slate-400">{voltaOrigin.iata}</span>
                    <span className="text-xl font-black text-slate-900">{voltaLeg.departureTime || "13:00"}</span>
                  </div>

                  <div className="text-center">
                    <span className="inline-block border-b border-teal-600 text-xs font-semibold text-teal-700">
                      {voltaLeg.stops === 0 || !voltaLeg.stops ? "Direto" : `${voltaLeg.stops} parada${voltaLeg.stops > 1 ? "s" : ""}`}
                    </span>
                  </div>

                  <div>
                    <span className="block text-[11px] font-bold text-slate-400">{voltaDest.iata}</span>
                    <span className="text-xl font-black text-slate-900">
                      {voltaLeg.arrivalTime || "19:50"}
                      {voltaIsNextDay && <sup className="ml-0.5 text-xs font-bold text-red-500">+1</sup>}
                    </span>
                  </div>

                  <div className="text-right">
                    <span className="block text-[11px] text-slate-400">Duração</span>
                    <span className="text-xs font-bold text-slate-800">{formatDurationLabel(voltaLeg.duration)}</span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 pt-1 text-teal-700 text-base">
                  <span>🎒</span>
                  <span>🧳</span>
                  {voltaBaggageRules.hasCheckedBag && <span>🧳</span>}
                </div>
              </div>
            )}

            <hr className="border-slate-100" />

            {/* Seção: Política de alterações e cancelamentos */}
            <div className="space-y-3 pt-1 text-xs">
              <h4 className="font-bold text-slate-900 text-sm">Política de alterações e cancelamentos</h4>

              <div className="space-y-1">
                <span className="font-semibold text-slate-700 block">Alterações</span>
                <p className="flex items-center gap-1.5 font-bold text-[#00875A]">
                  <Check className="h-4 w-4 stroke-[2.5]" />
                  Permite (com custo)
                </p>
              </div>

              <div className="space-y-1">
                <span className="font-semibold text-slate-700 block">Cancelamento</span>
                <p className="flex items-center gap-1.5 font-bold text-slate-800">
                  <XIcon className="h-4 w-4 stroke-[2.5] text-slate-700" />
                  Não reembolsável *
                </p>
              </div>

              <p className="text-[11px] leading-relaxed text-slate-500 pt-1">
                *Caso o cancelamento seja solicitado 24h após a realização da compra e ao menos 7 dias antes da data do embarque, o reembolso será integral conforme Resoluções da ANAC.
              </p>

              {onOpenPoliciesModal && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenPoliciesModal();
                  }}
                  className="pt-1 text-xs font-bold text-[#5E17EB] hover:underline cursor-pointer block text-left"
                >
                  Ver políticas de alterações e cancelamentos
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
