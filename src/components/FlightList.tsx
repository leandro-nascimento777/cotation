"use client";

import { FlightLeg, QuoteItem } from "@/lib/types";
import { formatCurrencyBRL } from "@/lib/format";
import { Luggage, PlaneLanding, PlaneTakeoff } from "lucide-react";

interface FlightListProps {
  items: QuoteItem[];
  onToggle: (rowId: string, fareId: string) => void;
}

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

export function FlightList({ items, onToggle }: FlightListProps) {
  if (items.length === 0) return null;

  // Agrupa por linha de voo (rowId) para mostrar as tarifas juntas.
  const rowIds = Array.from(new Set(items.map((i) => i.rowId)));

  return (
    <div className="flex flex-col gap-3">
      <h2 className="text-sm font-semibold text-slate-700">
        Selecione as opções que deseja incluir no orçamento
      </h2>
      {rowIds.map((rowId) => {
        const fares = items.filter((i) => i.rowId === rowId);
        const base = fares[0];
        return (
          <div key={rowId} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="mb-3 flex flex-col gap-1.5">
              <div className="flex items-center gap-2">
                {base.volta ? (
                  <span className="rounded-full bg-teal-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-teal-700">
                    Ida e volta
                  </span>
                ) : null}
              </div>
              <LegLine leg={base.ida} icon={PlaneTakeoff} />
              {base.volta ? <LegLine leg={base.volta} icon={PlaneLanding} /> : null}
            </div>
            <div className="flex flex-col gap-2 sm:flex-row">
              {fares.map((fare) => (
                <label
                  key={fare.fareId}
                  className={`flex flex-1 cursor-pointer items-center justify-between gap-3 rounded-lg border px-3 py-2 text-sm transition-colors ${
                    fare.selected
                      ? "border-teal-500 bg-teal-50"
                      : "border-slate-200 hover:border-slate-300"
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
                  <span className="font-semibold text-slate-900">
                    {formatCurrencyBRL(fare.price)}
                  </span>
                </label>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
