"use client";

import { FlightLeg, legKind, LegKind, QuoteItem } from "@/lib/types";
import { formatCurrencyBRL } from "@/lib/format";
import { groupByRow } from "@/lib/groupQuoteItems";
import { Luggage, PlaneLanding, PlaneTakeoff } from "lucide-react";
import { AirlineLogo } from "@/components/ui/AirlineLogo";

/** Card de um trecho já fechado/escolhido (cia, horários, duração, bagagem
 * e valor completo) — usado tanto no "Fechar venda" quanto no resumo de
 * consulta da proposta aprovada. */
export const ChosenFlightCard = ({ item }: { item: QuoteItem }) => (
  <div className="flex flex-col gap-1.5 rounded-lg border border-green-200 bg-green-50/60 p-3">
    {item.ida ? <LegLine leg={item.ida} icon={PlaneTakeoff} /> : null}
    {item.volta ? <LegLine leg={item.volta} icon={PlaneLanding} /> : null}
    <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs">
      <span className="flex items-center gap-1 text-slate-600">
        <Luggage className="h-3.5 w-3.5 text-slate-400" />
        {item.baggage} <span className="text-slate-400">({item.fareLabel})</span>
      </span>
      <span className="font-semibold text-slate-900">{formatCurrencyBRL(item.price)}</span>
    </div>
  </div>
);

interface FlightListProps {
  items: QuoteItem[];
  onToggle?: (rowId: string, fareId: string) => void;
  /** Modo somente-leitura: some com os checkboxes e só lista as tarifas já selecionadas. */
  readOnly?: boolean;
}

const GROUP_LABEL: Record<LegKind, string> = {
  combo: "Ida e volta",
  ida: "Ida",
  volta: "Volta",
};

export const LegLine = ({ leg, icon: Icon }: { leg: FlightLeg; icon?: typeof PlaneTakeoff }) => (
  <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs text-slate-500">
    {Icon ? <Icon className="h-3.5 w-3.5 shrink-0 text-slate-400" /> : null}
    <AirlineLogo airline={leg.airline} flightNumber={leg.flightNumber} className="h-5 w-5" />
    <span className="font-bold text-slate-800">
      {leg.airline} {leg.flightNumber}
    </span>
    <span>· {leg.date}</span>
    <span>
      · {leg.origin} → {leg.destination}
    </span>
    <span>
      · {leg.departureTime}–{leg.arrivalTime}
    </span>
    <span>· {leg.duration}</span>
    <span>· {leg.stops === 0 ? "direto" : `${leg.stops} conexão(ões)`}</span>
    {leg.aircraft ? <span>· {leg.aircraft}</span> : null}
  </div>
);

interface FlightRowCardProps {
  rowId: string;
  fares: QuoteItem[];
  onToggle?: (rowId: string, fareId: string) => void;
  readOnly?: boolean;
}

const FlightRowCard = ({ rowId, fares, onToggle, readOnly }: FlightRowCardProps) => {
  const base = fares[0];
  const kind = legKind(base);

  return (
    <div key={rowId} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex flex-col gap-1.5">
        {kind === "combo" ? (
          <span className="w-fit rounded-full bg-teal-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-teal-700">
            Ida e volta
          </span>
        ) : null}
        {base.ida ? <LegLine leg={base.ida} icon={PlaneTakeoff} /> : null}
        {base.volta ? <LegLine leg={base.volta} icon={PlaneLanding} /> : null}
      </div>
      <div className="flex flex-col gap-2 sm:flex-row">
        {fares.map((fare) =>
          readOnly ? (
            <div
              key={fare.fareId}
              className="flex flex-1 items-center justify-between gap-3 rounded-lg border border-teal-500 bg-teal-50 px-3 py-2 text-sm"
            >
              <span className="flex items-center gap-1 text-slate-700">
                <Luggage className="h-3.5 w-3.5 text-slate-400" />
                {fare.baggage}
                <span className="text-xs text-slate-400">({fare.fareLabel})</span>
              </span>
              <span className="font-semibold text-slate-900">{formatCurrencyBRL(fare.price)}</span>
            </div>
          ) : (
            <label
              key={fare.fareId}
              className={`flex flex-1 cursor-pointer items-center justify-between gap-3 rounded-lg border px-3 py-2 text-sm transition-colors ${
                fare.selected ? "border-teal-500 bg-teal-50" : "border-slate-200 hover:border-slate-300"
              }`}
            >
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={fare.selected}
                  onChange={() => onToggle?.(fare.rowId, fare.fareId)}
                  className="h-4 w-4 accent-teal-600"
                />
                <span className="flex items-center gap-1 text-slate-700">
                  <Luggage className="h-3.5 w-3.5 text-slate-400" />
                  {fare.baggage}
                  <span className="text-xs text-slate-400">({fare.fareLabel})</span>
                </span>
              </div>
              <span className="font-semibold text-slate-900">{formatCurrencyBRL(fare.price)}</span>
            </label>
          )
        )}
      </div>
    </div>
  );
};

export const FlightList = ({ items, onToggle, readOnly = false }: FlightListProps) => {
  const displayItems = readOnly ? items.filter((i) => i.selected) : items;
  if (displayItems.length === 0) return null;

  const rowGroups = groupByRow(displayItems);
  const rowsByKind: Record<LegKind, typeof rowGroups> = { combo: [], ida: [], volta: [] };
  for (const g of rowGroups) {
    rowsByKind[legKind(g.fares[0])].push(g);
  }
  const presentKinds = (["combo", "ida", "volta"] as const).filter((k) => rowsByKind[k].length > 0);
  const showSectionHeaders = presentKinds.length > 1;

  return (
    <div className="flex flex-col gap-4">
      {!readOnly ? (
        <h2 className="text-sm font-semibold text-slate-700">
          Selecione as opções que deseja incluir no orçamento
        </h2>
      ) : null}
      {presentKinds.map((kind) => (
        <div key={kind} className="flex flex-col gap-3">
          {showSectionHeaders ? (
            <h3 className="text-xs font-bold uppercase tracking-wide text-slate-500">{GROUP_LABEL[kind]}</h3>
          ) : null}
          {rowsByKind[kind].map((g) => (
            <FlightRowCard key={g.rowId} rowId={g.rowId} fares={g.fares} onToggle={onToggle} readOnly={readOnly} />
          ))}
        </div>
      ))}
    </div>
  );
};

