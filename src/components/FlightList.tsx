"use client";

import { FlightLeg, legKind, LegKind, QuoteItem } from "@/lib/types";
import { formatCurrencyBRL } from "@/lib/format";
import { Luggage, PlaneLanding, PlaneTakeoff } from "lucide-react";

interface FlightListProps {
  items: QuoteItem[];
  onToggle: (rowId: string, fareId: string) => void;
}

const GROUP_LABEL: Record<LegKind, string> = {
  combo: "Ida e volta",
  ida: "Ida",
  volta: "Volta",
};

function LegLine({ leg, icon: Icon }: { leg: FlightLeg; icon: typeof PlaneTakeoff }) {
  return (
    <div className="flex items-center gap-2 text-xs text-slate-500">
      <Icon className="h-3.5 w-3.5 shrink-0 text-slate-400" />
      <span className="font-medium text-slate-700">
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
    </div>
  );
}

function FlightRowCard({
  rowId,
  fares,
  onToggle,
}: {
  rowId: string;
  fares: QuoteItem[];
  onToggle: (rowId: string, fareId: string) => void;
}) {
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
        {fares.map((fare) => (
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
                onChange={() => onToggle(fare.rowId, fare.fareId)}
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
        ))}
      </div>
    </div>
  );
}

export function FlightList({ items, onToggle }: FlightListProps) {
  if (items.length === 0) return null;

  // Agrupa por linha de voo (rowId) pra mostrar as tarifas juntas, depois
  // por tipo (combo/ida/volta) — títulos de seção só aparecem quando há
  // mais de um tipo presente (evita ruído visual no caso comum, que é só
  // uma tabela de ida).
  const rowIds = Array.from(new Set(items.map((i) => i.rowId)));
  const rowsByKind: Record<LegKind, string[]> = { combo: [], ida: [], volta: [] };
  for (const rowId of rowIds) {
    const first = items.find((i) => i.rowId === rowId)!;
    rowsByKind[legKind(first)].push(rowId);
  }
  const presentKinds = (["combo", "ida", "volta"] as const).filter((k) => rowsByKind[k].length > 0);
  const showSectionHeaders = presentKinds.length > 1;

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-sm font-semibold text-slate-700">
        Selecione as opções que deseja incluir no orçamento
      </h2>
      {presentKinds.map((kind) => (
        <div key={kind} className="flex flex-col gap-3">
          {showSectionHeaders ? (
            <h3 className="text-xs font-bold uppercase tracking-wide text-slate-500">{GROUP_LABEL[kind]}</h3>
          ) : null}
          {rowsByKind[kind].map((rowId) => {
            const fares = items.filter((i) => i.rowId === rowId);
            return <FlightRowCard key={rowId} rowId={rowId} fares={fares} onToggle={onToggle} />;
          })}
        </div>
      ))}
    </div>
  );
}
