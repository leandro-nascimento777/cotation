"use client";

import { QuoteItem } from "@/lib/types";
import { baggageLabel, formatCurrencyBRL } from "@/lib/format";
import { Luggage, PlaneTakeoff } from "lucide-react";

interface FlightListProps {
  items: QuoteItem[];
  onToggle: (rowId: string, fareId: string) => void;
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
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-800">
                <PlaneTakeoff className="h-4 w-4 text-teal-600" />
                {base.airline} {base.flightNumber} · {base.date}
              </div>
              <div className="text-xs text-slate-500">
                {base.origin} → {base.destination} · {base.departureTime}–{base.arrivalTime} ·{" "}
                {base.duration} ·{" "}
                {base.stops === 0 ? "direto" : `${base.stops} conexão(ões)`}
              </div>
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
                      {baggageLabel(fare.baggage)}
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
