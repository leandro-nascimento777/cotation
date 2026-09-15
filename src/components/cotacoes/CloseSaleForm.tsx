"use client";

import { useState } from "react";
import { LegLine } from "@/components/FlightList";
import { formatCurrencyBRL } from "@/lib/format";
import { ClosedFlightSelection, Quote } from "@/lib/store/types";
import { legKind, QuoteItem } from "@/lib/types";
import { CheckCircle2, Luggage, PlaneLanding, PlaneTakeoff } from "lucide-react";

interface RowGroup {
  rowId: string;
  fares: QuoteItem[];
}

function groupByRow(items: QuoteItem[]): RowGroup[] {
  const rowIds = Array.from(new Set(items.map((i) => i.rowId)));
  return rowIds.map((rowId) => ({ rowId, fares: items.filter((i) => i.rowId === rowId) }));
}

function OptionCard({
  fare,
  name,
  checked,
  onSelect,
  locked,
}: {
  fare: QuoteItem;
  name: string;
  checked: boolean;
  onSelect: () => void;
  locked: boolean;
}) {
  if (locked) {
    return (
      <div
        className={`flex flex-col gap-2 rounded-xl border p-3 text-sm transition-colors ${
          checked ? "border-teal-500 bg-teal-50" : "border-slate-200 opacity-50 grayscale-[30%]"
        }`}
      >
        <div className="flex items-start gap-2">
          {checked ? (
            <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-teal-600" />
          ) : (
            <span className="mt-1 h-4 w-4 shrink-0" />
          )}
          <div className="flex flex-1 flex-col gap-1.5">
            {fare.ida ? <LegLine leg={fare.ida} icon={PlaneTakeoff} /> : null}
            {fare.volta ? <LegLine leg={fare.volta} icon={PlaneLanding} /> : null}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
              <span className="flex items-center gap-1 text-xs text-slate-600">
                <Luggage className="h-3.5 w-3.5 text-slate-400" />
                {fare.baggage} <span className="text-slate-400">({fare.fareLabel})</span>
              </span>
              <span className="font-semibold text-slate-900">{formatCurrencyBRL(fare.price)}</span>
            </div>
            {!checked ? <span className="text-[11px] font-medium text-slate-400">Não escolhida pelo cliente</span> : null}
          </div>
        </div>
      </div>
    );
  }

  return (
    <label
      className={`flex cursor-pointer flex-col gap-2 rounded-xl border p-3 text-sm transition-colors ${
        checked ? "border-teal-500 bg-teal-50" : "border-slate-200 hover:border-slate-300"
      }`}
    >
      <div className="flex items-start gap-2">
        <input type="radio" name={name} checked={checked} onChange={onSelect} className="mt-1 h-4 w-4 accent-teal-600" />
        <div className="flex flex-1 flex-col gap-1.5">
          {fare.ida ? <LegLine leg={fare.ida} icon={PlaneTakeoff} /> : null}
          {fare.volta ? <LegLine leg={fare.volta} icon={PlaneLanding} /> : null}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
            <span className="flex items-center gap-1 text-xs text-slate-600">
              <Luggage className="h-3.5 w-3.5 text-slate-400" />
              {fare.baggage} <span className="text-slate-400">({fare.fareLabel})</span>
            </span>
            <span className="font-semibold text-slate-900">{formatCurrencyBRL(fare.price)}</span>
          </div>
        </div>
      </div>
    </label>
  );
}

interface CloseSaleFormProps {
  quote: Quote;
  /** true quando o cliente já aprovou e escolheu pela proposta pública —
   * trava a seleção em modo leitura (o agente não escolhe outro trecho,
   * só confirma o localizador). */
  lockedByClient: boolean;
  onCancel: () => void;
  onConfirm: (data: { closedIda: ClosedFlightSelection | null; closedVolta: ClosedFlightSelection | null; bookingRef: string }) => void;
}

/** Fluxo de "fechar venda": entre as opções que foram enviadas ao cliente
 * (flightItems selecionados), o agente escolhe por rádio qual foi
 * efetivamente comprada — um voo (se for pacote ida+volta combinado) ou um
 * de ida + um de volta (se forem tabelas separadas) — e informa o
 * localizador da reserva. Quando o cliente já aprovou pela proposta
 * pública, a escolha vem travada (só leitura) e os outros trechos ficam
 * inativos. */
export function CloseSaleForm({ quote, lockedByClient, onCancel, onConfirm }: CloseSaleFormProps) {
  const offered = quote.flightItems.filter((i) => i.selected);
  const groups = groupByRow(offered);
  const comboGroups = groups.filter((g) => legKind(g.fares[0]) === "combo");
  const idaGroups = groups.filter((g) => legKind(g.fares[0]) === "ida");
  const voltaGroups = groups.filter((g) => legKind(g.fares[0]) === "volta");

  const [selectedIda, setSelectedIda] = useState<ClosedFlightSelection | null>(quote.closedIda);
  const [selectedVolta, setSelectedVolta] = useState<ClosedFlightSelection | null>(quote.closedVolta);
  const [bookingRef, setBookingRef] = useState(quote.bookingRef);

  const isCombo = (rowId: string, fareId: string) => selectedIda?.rowId === rowId && selectedIda?.fareId === fareId;

  const handleSelectCombo = (fare: QuoteItem) => {
    if (lockedByClient) return;
    setSelectedIda({ rowId: fare.rowId, fareId: fare.fareId });
    setSelectedVolta({ rowId: fare.rowId, fareId: fare.fareId });
  };

  const needIda = comboGroups.length === 0 && idaGroups.length > 0;
  const needVolta = comboGroups.length === 0 && voltaGroups.length > 0;
  const needCombo = comboGroups.length > 0;
  const flightsChosen = needCombo ? Boolean(selectedIda) : (!needIda || Boolean(selectedIda)) && (!needVolta || Boolean(selectedVolta));
  const canConfirm = flightsChosen && bookingRef.trim().length > 0;

  return (
    <div className="flex flex-col gap-4">
      {lockedByClient ? (
        <p className="rounded-lg bg-teal-50 px-3 py-2 text-xs font-medium text-teal-700">
          O cliente já escolheu essa opção pela proposta pública — os outros trechos ficam inativos. Só falta
          confirmar o localizador.
        </p>
      ) : null}

      {offered.length === 0 ? (
        <p className="text-sm text-slate-500">Nenhuma opção foi enviada nessa cotação pra escolher.</p>
      ) : null}

      {comboGroups.length > 0 ? (
        <div className="flex flex-col gap-2">
          <h3 className="text-xs font-bold uppercase tracking-wide text-slate-500">Voo comprado (ida e volta)</h3>
          <div className="flex flex-col gap-2">
            {comboGroups.flatMap((g) =>
              g.fares.map((fare) => (
                <OptionCard
                  key={fare.fareId}
                  fare={fare}
                  name="closed-combo"
                  checked={isCombo(fare.rowId, fare.fareId)}
                  onSelect={() => handleSelectCombo(fare)}
                  locked={lockedByClient}
                />
              ))
            )}
          </div>
        </div>
      ) : (
        <>
          {idaGroups.length > 0 ? (
            <div className="flex flex-col gap-2">
              <h3 className="text-xs font-bold uppercase tracking-wide text-slate-500">Voo de ida comprado</h3>
              <div className="flex flex-col gap-2">
                {idaGroups.flatMap((g) =>
                  g.fares.map((fare) => (
                    <OptionCard
                      key={fare.fareId}
                      fare={fare}
                      name="closed-ida"
                      checked={selectedIda?.rowId === fare.rowId && selectedIda?.fareId === fare.fareId}
                      onSelect={() => !lockedByClient && setSelectedIda({ rowId: fare.rowId, fareId: fare.fareId })}
                      locked={lockedByClient}
                    />
                  ))
                )}
              </div>
            </div>
          ) : null}

          {voltaGroups.length > 0 ? (
            <div className="flex flex-col gap-2">
              <h3 className="text-xs font-bold uppercase tracking-wide text-slate-500">Voo de volta comprado</h3>
              <div className="flex flex-col gap-2">
                {voltaGroups.flatMap((g) =>
                  g.fares.map((fare) => (
                    <OptionCard
                      key={fare.fareId}
                      fare={fare}
                      name="closed-volta"
                      checked={selectedVolta?.rowId === fare.rowId && selectedVolta?.fareId === fare.fareId}
                      onSelect={() => !lockedByClient && setSelectedVolta({ rowId: fare.rowId, fareId: fare.fareId })}
                      locked={lockedByClient}
                    />
                  ))
                )}
              </div>
            </div>
          ) : null}
        </>
      )}

      <label className="flex flex-col gap-1 text-xs font-medium text-slate-600">
        Localizador (código de reserva)
        <input
          value={bookingRef}
          onChange={(e) => setBookingRef(e.target.value)}
          placeholder="Ex: ABC123"
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-800 focus:border-teal-500 focus:outline-none"
        />
      </label>

      <div className="flex justify-end gap-2 border-t border-slate-100 pt-3">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50"
        >
          Cancelar
        </button>
        <button
          type="button"
          disabled={!canConfirm}
          onClick={() => onConfirm({ closedIda: selectedIda, closedVolta: selectedVolta, bookingRef: bookingRef.trim() })}
          className="rounded-lg bg-teal-600 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Confirmar fechamento
        </button>
      </div>
    </div>
  );
}
