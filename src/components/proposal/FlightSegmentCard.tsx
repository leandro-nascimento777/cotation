"use client";

import { useState } from "react";
import { CheckCircle2, ChevronDown, PlaneLanding, PlaneTakeoff, Repeat } from "lucide-react";
import { FlightLeg, QuoteItem } from "@/lib/types";
import { AirlineLogo } from "@/components/ui/AirlineLogo";
import { formatCurrencyBRL } from "@/lib/format";
import {
  checkNextDayArrival,
  formatDurationLabel,
  formatHeaderDate,
  getAirportDetails,
  parseBaggageRules,
} from "@/lib/flightFormatters";
import { FlightBaggageHover } from "./FlightBaggageHover";
import { FlightLegModal } from "./FlightLegModal";

interface FlightOptionRowProps {
  fare: QuoteItem;
  leg: FlightLeg;
  isSelected: boolean;
  onSelect: () => void;
  name: string;
  /** Modo consulta: nenhuma opção é clicável, e as não escolhidas pelo
   * cliente ficam em cinza/inativas — usado quando a proposta já foi
   * decidida, pra impedir que o agente altere a escolha do cliente. */
  locked?: boolean;
}

const FlightOptionRow = ({
  fare,
  leg,
  isSelected,
  onSelect,
  name,
  locked = false,
}: FlightOptionRowProps) => {
  const [modalOpen, setModalOpen] = useState(false);
  const isNextDay = checkNextDayArrival(leg.departureTime, leg.arrivalTime, leg.duration);
  const durationText = formatDurationLabel(leg.duration);
  const baggageRules = parseBaggageRules(fare.baggage);

  return (
    <>
      <div
        onClick={locked ? undefined : onSelect}
        className={`group relative flex flex-wrap items-center justify-between gap-3 sm:gap-4 py-2.5 px-3 sm:px-5 rounded-2xl md:rounded-full transition-all ${
          locked ? "cursor-default" : "cursor-pointer"
        } ${
          isSelected
            ? "border-2 border-[#6E44FF] bg-white shadow-xs"
            : locked
              ? "border border-slate-200 bg-slate-50 opacity-50 grayscale-[30%]"
              : "border border-slate-200/80 hover:border-slate-300 bg-white"
        }`}
      >
        {/* Lado Esquerdo: Rádio + Cia Aérea */}
        <div className="flex items-center gap-3 min-w-[140px]">
          {/* Radio Button Customizado Roxo (Anexo 2) — trocado por check fixo em modo consulta */}
          {locked ? (
            isSelected ? (
              <CheckCircle2 className="h-5 w-5 shrink-0 text-[#6E44FF]" />
            ) : (
              <span className="h-5 w-5 shrink-0" />
            )
          ) : (
            <div
              className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
                isSelected ? "border-[#6E44FF]" : "border-slate-300 group-hover:border-[#6E44FF]/50"
              }`}
            >
              {isSelected && <div className="h-2.5 w-2.5 rounded-full bg-[#6E44FF]" />}
            </div>
          )}
          {!locked ? (
            <input
              type="radio"
              name={name}
              checked={isSelected}
              onChange={onSelect}
              className="sr-only"
            />
          ) : null}

          {/* Logo e Nome da Companhia */}
          <div className="flex items-center gap-2">
            <AirlineLogo
              airline={leg.airline}
              flightNumber={leg.flightNumber}
              className="h-6 w-6"
            />
            <span className="text-xs sm:text-sm font-bold text-slate-900 truncate">
              {leg.airline}
            </span>
          </div>
        </div>

        {/* Centro: Horários, Paradas e Duração (Anexo 1 e 2) */}
        <div className="flex flex-1 items-center justify-center gap-3 sm:gap-6 md:gap-8 min-w-[240px]">
          {/* Partida */}
          <span className="font-bold text-slate-900 text-sm sm:text-base tabular-nums">
            {leg.departureTime || "18:00"}
          </span>

          {/* Escalas / Direto com sublinhado verde (Anexo 1 e 2) */}
          <div className="flex flex-col items-center">
            <span className="text-xs font-semibold text-slate-800 pb-0.5 border-b-2 border-[#008269] whitespace-nowrap">
              {leg.stops === 0 ? "Direto" : `${leg.stops} parada${leg.stops > 1 ? "s" : ""}`}
            </span>
          </div>

          {/* Chegada (+1 se dia seguinte) */}
          <div className="flex items-baseline">
            <span className="font-bold text-slate-900 text-sm sm:text-base tabular-nums">
              {leg.arrivalTime || "11:00"}
            </span>
            {isNextDay && (
              <span className="text-xs font-bold text-red-600 ml-1">+1</span>
            )}
          </div>

          {/* Duração total */}
          <span className="text-xs font-semibold text-slate-500 tabular-nums">
            {durationText}
          </span>
        </div>

        {/* Lado Direito: Bagagem + Preço + Botão Chevron Modal (Anexo 1 e 2) */}
        <div className="flex items-center gap-3 sm:gap-4 shrink-0">
          {/* Ícones de Bagagem com Tooltip no Hover (Anexo 4) */}
          <FlightBaggageHover rules={baggageRules} />

          {/* Preço da Opção */}
          <span className="text-sm sm:text-base font-extrabold text-emerald-600 tabular-nums">
            {formatCurrencyBRL(fare.price)}
          </span>

          {/* Seta Chevron que abre o Modal de Detalhes (Anexo 3 e 5) */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setModalOpen(true);
            }}
            className="p-1 rounded-full text-slate-500 hover:text-[#6E44FF] hover:bg-slate-100 transition-colors cursor-pointer"
            title="Ver detalhes do voo"
          >
            <ChevronDown className="h-4 w-4" />
          </button>
        </div>

        {locked && !isSelected ? (
          <span className="basis-full text-[11px] font-semibold text-slate-400">Não escolhida pelo cliente</span>
        ) : null}
      </div>

      {/* Modal de Detalhes Completo (Anexo 3 e 5) */}
      <FlightLegModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        leg={leg}
        flightClass={fare.fareClass || "Econômica"}
        baggageText={fare.baggage}
      />
    </>
  );
};

const ComboLegLine = ({ leg, icon: Icon, label }: { leg: FlightLeg; icon: typeof PlaneTakeoff; label: string }) => {
  const isNextDay = checkNextDayArrival(leg.departureTime, leg.arrivalTime, leg.duration);
  const durationText = formatDurationLabel(leg.duration);
  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
      <span className="flex w-14 shrink-0 items-center gap-1 text-[10px] font-black uppercase tracking-wide text-[#6E44FF]">
        <Icon className="h-3 w-3" /> {label}
      </span>
      <AirlineLogo airline={leg.airline} flightNumber={leg.flightNumber} className="h-6 w-6" />
      <span className="min-w-[70px] text-xs sm:text-sm font-bold text-slate-900 truncate">{leg.airline}</span>
      <span className="font-bold text-slate-900 text-sm tabular-nums">{leg.departureTime || "--:--"}</span>
      <span className="text-[11px] font-semibold text-slate-800 pb-0.5 border-b-2 border-[#008269] whitespace-nowrap">
        {leg.stops === 0 ? "Direto" : `${leg.stops} parada${leg.stops > 1 ? "s" : ""}`}
      </span>
      <span className="flex items-baseline font-bold text-slate-900 text-sm tabular-nums">
        {leg.arrivalTime || "--:--"}
        {isNextDay && <span className="text-xs font-bold text-red-600 ml-1">+1</span>}
      </span>
      <span className="text-xs font-semibold text-slate-500 tabular-nums">{durationText}</span>
    </div>
  );
};

interface ComboFareRowProps {
  fare: QuoteItem;
  isSelected: boolean;
  onSelect: () => void;
  name: string;
  locked?: boolean;
}

/** Uma opção de pacote combinado (ida + volta na mesma fare, preço único) —
 * mostra as duas pernas empilhadas dentro do mesmo card selecionável, ao
 * contrário de FlightOptionRow (que representa uma perna avulsa). */
export const ComboFareRow = ({ fare, isSelected, onSelect, name, locked = false }: ComboFareRowProps) => {
  const [detailLeg, setDetailLeg] = useState<"ida" | "volta" | null>(null);
  if (!fare.ida || !fare.volta) return null;
  const baggageRules = parseBaggageRules(fare.baggage);

  return (
    <>
      <div
        onClick={locked ? undefined : onSelect}
        className={`group relative flex flex-col gap-2.5 rounded-2xl border p-3 sm:p-4 transition-all ${
          locked ? "cursor-default" : "cursor-pointer"
        } ${
          isSelected
            ? "border-2 border-[#6E44FF] bg-white shadow-xs"
            : locked
              ? "border-slate-200 bg-slate-50 opacity-50 grayscale-[30%]"
              : "border-slate-200/80 hover:border-slate-300 bg-white"
        }`}
      >
        <div className="flex items-start gap-3">
          {locked ? (
            isSelected ? (
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-[#6E44FF]" />
            ) : (
              <span className="mt-0.5 h-5 w-5 shrink-0" />
            )
          ) : (
            <div
              className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
                isSelected ? "border-[#6E44FF]" : "border-slate-300 group-hover:border-[#6E44FF]/50"
              }`}
            >
              {isSelected && <div className="h-2.5 w-2.5 rounded-full bg-[#6E44FF]" />}
            </div>
          )}
          {!locked ? (
            <input type="radio" name={name} checked={isSelected} onChange={onSelect} className="sr-only" />
          ) : null}
          <div className="flex flex-1 flex-col gap-2">
            <ComboLegLine leg={fare.ida} icon={PlaneTakeoff} label="Ida" />
            <ComboLegLine leg={fare.volta} icon={PlaneLanding} label="Volta" />
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-2.5">
          <FlightBaggageHover rules={baggageRules} />
          <div className="flex items-center gap-3">
            <span className="text-sm sm:text-base font-extrabold text-emerald-600 tabular-nums">
              {formatCurrencyBRL(fare.price)}
            </span>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setDetailLeg("ida");
              }}
              className="p-1 rounded-full text-slate-500 hover:text-[#6E44FF] hover:bg-slate-100 transition-colors cursor-pointer"
              title="Ver detalhes do voo"
            >
              <ChevronDown className="h-4 w-4" />
            </button>
          </div>
        </div>

        {locked && !isSelected ? (
          <span className="text-[11px] font-semibold text-slate-400">Não escolhida pelo cliente</span>
        ) : null}
      </div>

      <FlightLegModal
        open={detailLeg !== null}
        onClose={() => setDetailLeg(null)}
        leg={detailLeg === "volta" ? fare.volta : fare.ida}
        flightClass={fare.fareClass || "Econômica"}
        baggageText={fare.baggage}
      />
    </>
  );
};

interface FlightSegmentCardProps {
  type: "ida" | "volta";
  fares: QuoteItem[];
  selectedFareId: string | null;
  onSelectFare: (fare: QuoteItem) => void;
  name: string;
  locked?: boolean;
}

export const FlightSegmentCard = ({
  type,
  fares,
  selectedFareId,
  onSelectFare,
  name,
  locked = false,
}: FlightSegmentCardProps) => {
  if (fares.length === 0) return null;

  const baseFare = fares[0];
  const leg = type === "volta" ? baseFare.volta : baseFare.ida;
  if (!leg) return null;

  const isVolta = type === "volta";
  const Icon = isVolta ? PlaneLanding : PlaneTakeoff;
  const typeLabel = isVolta ? "VOLTA" : "IDA";
  const headerDate = formatHeaderDate(leg.date);

  const originInfo = getAirportDetails(leg.origin, "GRU");
  const destInfo = getAirportDetails(leg.destination, "AMS");

  return (
    <div className="overflow-visible rounded-3xl border border-slate-200 bg-white shadow-md">
      {/* Cabeçalho do Trecho (Anexo 1) */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 bg-slate-50/90 px-5 sm:px-8 py-3.5 rounded-t-3xl text-left">
        {/* Esquerda: Tipo do Trecho + Data */}
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#6E44FF]/10 text-[#6E44FF]">
            <Icon className="h-4 w-4" />
          </div>
          <div>
            <span className="text-xs sm:text-sm font-black text-slate-900 tracking-wider uppercase block">
              {typeLabel}
            </span>
            <span className="text-xs text-slate-500 font-semibold block">
              {headerDate}
            </span>
          </div>
        </div>

        {/* Colunas: Origem, Destino e Bagagem alinhadas com o grid (Anexo 1) */}
        <div className="hidden sm:flex items-center gap-8 md:gap-14 pr-10">
          {/* Origem */}
          <div className="text-left">
            <span className="text-xs font-black text-slate-900 uppercase block tracking-tight">
              {originInfo.iata}
            </span>
            <span className="text-[11px] text-slate-500 font-semibold block truncate max-w-[110px]">
              {originInfo.cidade}
            </span>
          </div>

          {/* Destino */}
          <div className="text-left">
            <span className="text-xs font-black text-slate-900 uppercase block tracking-tight">
              {destInfo.iata}
            </span>
            <span className="text-[11px] text-slate-500 font-semibold block truncate max-w-[110px]">
              {destInfo.cidade}
            </span>
          </div>

          {/* Bagagem */}
          <div className="text-left">
            <span className="text-xs text-slate-500 font-semibold block">
              Bagagem
            </span>
          </div>
        </div>
      </div>

      {/* Linhas de Opções de Voo (Anexo 1 e 2) */}
      <div className="p-3 sm:p-4 space-y-2.5">
        {fares.map((fare) => {
          const currentLeg = type === "volta" ? fare.volta : fare.ida;
          if (!currentLeg) return null;
          const isSelected = selectedFareId === fare.fareId;

          return (
            <FlightOptionRow
              key={fare.fareId}
              fare={fare}
              leg={currentLeg}
              isSelected={isSelected}
              onSelect={() => onSelectFare(fare)}
              name={name}
              locked={locked}
            />
          );
        })}
      </div>
    </div>
  );
};

interface ComboRouteCardProps {
  /** Fares de UMA rota combo (mesmo rowId) — todas com .ida e .volta preenchidos. */
  fares: QuoteItem[];
  selectedFareId: string | null;
  onSelectFare: (fare: QuoteItem) => void;
  name: string;
  locked?: boolean;
}

/** Card único de um pacote ida+volta combinado: um cabeçalho com as duas
 * rotas (ida e volta) e, abaixo, uma ComboFareRow por opção de tarifa —
 * cada uma já mostra as duas pernas e um preço só, então escolher uma
 * fatia aqui nunca parece uma decisão separada de ida e de volta. */
export const ComboRouteCard = ({ fares, selectedFareId, onSelectFare, name, locked = false }: ComboRouteCardProps) => {
  if (fares.length === 0) return null;
  const base = fares[0];
  if (!base.ida || !base.volta) return null;

  const idaInfo = { origin: getAirportDetails(base.ida.origin, "GRU"), dest: getAirportDetails(base.ida.destination, "AMS") };
  const voltaInfo = { origin: getAirportDetails(base.volta.origin, "AMS"), dest: getAirportDetails(base.volta.destination, "GRU") };

  return (
    <div className="overflow-visible rounded-3xl border border-slate-200 bg-white shadow-md">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 bg-slate-50/90 px-5 sm:px-8 py-3.5 rounded-t-3xl text-left">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#6E44FF]/10 text-[#6E44FF]">
            <Repeat className="h-4 w-4" />
          </div>
          <div>
            <span className="text-xs sm:text-sm font-black text-slate-900 tracking-wider uppercase block">
              Pacote ida e volta
            </span>
            <span className="text-xs text-slate-500 font-semibold block">
              {formatHeaderDate(base.ida.date)} · {formatHeaderDate(base.volta.date)}
            </span>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-6 md:gap-10 pr-10">
          <div className="text-left">
            <span className="text-[10px] font-black uppercase tracking-wide text-[#6E44FF] block">Ida</span>
            <span className="text-xs font-black text-slate-900 uppercase block tracking-tight">
              {idaInfo.origin.iata} → {idaInfo.dest.iata}
            </span>
          </div>
          <div className="text-left">
            <span className="text-[10px] font-black uppercase tracking-wide text-[#6E44FF] block">Volta</span>
            <span className="text-xs font-black text-slate-900 uppercase block tracking-tight">
              {voltaInfo.origin.iata} → {voltaInfo.dest.iata}
            </span>
          </div>
        </div>
      </div>

      <div className="p-3 sm:p-4 space-y-2.5">
        {fares.map((fare) => (
          <ComboFareRow
            key={fare.fareId}
            fare={fare}
            isSelected={selectedFareId === fare.fareId}
            onSelect={() => onSelectFare(fare)}
            name={name}
            locked={locked}
          />
        ))}
      </div>
    </div>
  );
};
