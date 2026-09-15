"use client";

import { useEffect, useState } from "react";
import { formatCurrencyBRL } from "@/lib/format";
import { ClosedFlightSelection } from "@/lib/store/types";
import { FlightLeg, legKind, QuoteItem } from "@/lib/types";
import { Luggage, PlaneLanding, PlaneTakeoff } from "lucide-react";

interface RowGroup {
  rowId: string;
  fares: QuoteItem[];
}

function groupByRow(items: QuoteItem[]): RowGroup[] {
  const rowIds = Array.from(new Set(items.map((i) => i.rowId)));
  return rowIds.map((rowId) => ({ rowId, fares: items.filter((i) => i.rowId === rowId) }));
}

function DetailBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col rounded-2xl border border-slate-200 bg-indigo-500/[0.03] p-3.5">
      <span className="block text-[10px] font-bold tracking-wider text-slate-400 uppercase">{label}</span>
      <span className="mt-1 block flex-1 text-sm font-bold text-slate-800">{value}</span>
    </div>
  );
}

function legDetailBoxes(leg: FlightLeg) {
  return (
    <div className="mt-4 grid grid-cols-2 gap-3 border-t border-slate-200 pt-4 sm:grid-cols-4">
      <DetailBox label="Companhia" value={`${leg.airline} ${leg.flightNumber}`.trim()} />
      <DetailBox label="Data de embarque" value={leg.date} />
      <DetailBox label="Horário" value={`${leg.departureTime}–${leg.arrivalTime}`} />
      <DetailBox
        label="Duração"
        value={`${leg.duration} · ${leg.stops === 0 ? "direto" : `${leg.stops} conexão(ões)`}`}
      />
    </div>
  );
}

function OptionCard({
  fare,
  name,
  checked,
  onSelect,
}: {
  fare: QuoteItem;
  name: string;
  checked: boolean;
  onSelect: () => void;
}) {
  const kind = legKind(fare);
  const label = kind === "combo" ? "Pacote Ida e Volta" : kind === "ida" ? "Voo de Ida" : "Voo de Volta";
  const Icon = kind === "volta" ? PlaneLanding : PlaneTakeoff;

  return (
    <label
      className={`flex cursor-pointer flex-col overflow-hidden rounded-3xl border shadow-lg transition-all hover:shadow-xl ${
        checked ? "border-indigo-500/50 ring-2 ring-indigo-500" : "border-indigo-500/25"
      }`}
    >
      <div className="flex items-center justify-between gap-3 border-b border-indigo-500/15 bg-indigo-500/[0.08] px-5 py-3.5">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-500/[0.18] text-indigo-600">
            <Icon className="h-4 w-4" />
          </span>
          <span className="text-xs font-black tracking-wider text-indigo-600 uppercase">{label}</span>
        </div>
        <input type="radio" name={name} checked={checked} onChange={onSelect} className="h-5 w-5 accent-indigo-600" />
      </div>

      <div className="flex flex-1 flex-col justify-between gap-4 p-5">
        <div>
          {fare.ida ? legDetailBoxes(fare.ida) : null}
          {fare.volta ? legDetailBoxes(fare.volta) : null}
        </div>
        <div className="flex items-center justify-between gap-2 border-t border-slate-200 pt-4">
          <span className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
            <Luggage className="h-3.5 w-3.5" />
            {fare.baggage} <span className="text-slate-400">({fare.fareLabel})</span>
          </span>
          <span className="text-lg font-extrabold tracking-tight text-emerald-600">{formatCurrencyBRL(fare.price)}</span>
        </div>
      </div>
    </label>
  );
}

function ResumoLeg({ title, leg }: { title: string; leg: FlightLeg }) {
  return (
    <div className="flex-1">
      <p className="mb-2 text-[10px] font-bold tracking-wider text-slate-400 uppercase">{title}</p>
      {legDetailBoxes(leg)}
    </div>
  );
}

interface FlightSelectorProps {
  items: QuoteItem[];
  onChange: (state: {
    selectedIda: ClosedFlightSelection | null;
    selectedVolta: ClosedFlightSelection | null;
    complete: boolean;
    total: number;
  }) => void;
}

/** Widget de escolha do cliente na proposta pública: rádio único quando as
 * opções são pacotes ida+volta combinados, ou dois grupos de rádio
 * (ida/volta) independentes quando vêm de tabelas separadas. Ao completar a
 * escolha, mostra um resumo detalhado (companhia, data, horário, bagagem)
 * de ida e volta pro cliente conferir antes de aprovar. */
export function FlightSelector({ items, onChange }: FlightSelectorProps) {
  const groups = groupByRow(items);
  const comboGroups = groups.filter((g) => legKind(g.fares[0]) === "combo");
  const idaGroups = groups.filter((g) => legKind(g.fares[0]) === "ida");
  const voltaGroups = groups.filter((g) => legKind(g.fares[0]) === "volta");

  const [selectedIda, setSelectedIda] = useState<ClosedFlightSelection | null>(null);
  const [selectedVolta, setSelectedVolta] = useState<ClosedFlightSelection | null>(null);

  const needIda = comboGroups.length === 0 && idaGroups.length > 0;
  const needVolta = comboGroups.length === 0 && voltaGroups.length > 0;
  const needCombo = comboGroups.length > 0;

  const idaItem = items.find((i) => selectedIda && i.rowId === selectedIda.rowId && i.fareId === selectedIda.fareId);
  const voltaItem = items.find(
    (i) => selectedVolta && i.rowId === selectedVolta.rowId && i.fareId === selectedVolta.fareId
  );

  useEffect(() => {
    const total = needCombo ? idaItem?.price ?? 0 : (idaItem?.price ?? 0) + (voltaItem?.price ?? 0);
    const complete = needCombo ? Boolean(selectedIda) : (!needIda || Boolean(selectedIda)) && (!needVolta || Boolean(selectedVolta));
    onChange({ selectedIda, selectedVolta, complete, total });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedIda, selectedVolta]);

  const handleSelectCombo = (fare: QuoteItem) => {
    setSelectedIda({ rowId: fare.rowId, fareId: fare.fareId });
    setSelectedVolta({ rowId: fare.rowId, fareId: fare.fareId });
  };

  if (items.length === 0) {
    return <p className="text-sm text-slate-500">Nenhuma opção disponível nesta proposta.</p>;
  }

  const selectionComplete = needCombo ? Boolean(idaItem) : (!needIda || Boolean(idaItem)) && (!needVolta || Boolean(voltaItem));

  return (
    <div className="flex flex-col gap-6">
      {comboGroups.length > 0 ? (
        <div className="flex flex-col gap-4">
          {comboGroups.flatMap((g) =>
            g.fares.map((fare) => (
              <OptionCard
                key={fare.fareId}
                fare={fare}
                name="proposal-combo"
                checked={selectedIda?.rowId === fare.rowId && selectedIda?.fareId === fare.fareId}
                onSelect={() => handleSelectCombo(fare)}
              />
            ))
          )}
        </div>
      ) : (
        <>
          {idaGroups.length > 0 ? (
            <div className="flex flex-col gap-4">
              {idaGroups.flatMap((g) =>
                g.fares.map((fare) => (
                  <OptionCard
                    key={fare.fareId}
                    fare={fare}
                    name="proposal-ida"
                    checked={selectedIda?.rowId === fare.rowId && selectedIda?.fareId === fare.fareId}
                    onSelect={() => setSelectedIda({ rowId: fare.rowId, fareId: fare.fareId })}
                  />
                ))
              )}
            </div>
          ) : null}

          {voltaGroups.length > 0 ? (
            <div className="flex flex-col gap-4">
              {voltaGroups.flatMap((g) =>
                g.fares.map((fare) => (
                  <OptionCard
                    key={fare.fareId}
                    fare={fare}
                    name="proposal-volta"
                    checked={selectedVolta?.rowId === fare.rowId && selectedVolta?.fareId === fare.fareId}
                    onSelect={() => setSelectedVolta({ rowId: fare.rowId, fareId: fare.fareId })}
                  />
                ))
              )}
            </div>
          ) : null}
        </>
      )}

      {selectionComplete && (idaItem?.ida || voltaItem?.volta || idaItem?.volta) ? (
        <div className="space-y-4 rounded-3xl border border-emerald-500/30 bg-emerald-500/[0.04] p-5 shadow-lg sm:p-6">
          <h3 className="text-sm font-black tracking-wider text-emerald-700 uppercase">
            Resumo da seleção — confira antes de aprovar
          </h3>
          <div className="flex flex-col gap-4 sm:flex-row">
            {idaItem?.ida ? <ResumoLeg title="Rota de ida" leg={idaItem.ida} /> : null}
            {(voltaItem?.volta || idaItem?.volta) ? (
              <ResumoLeg title="Rota de volta" leg={(voltaItem?.volta || idaItem?.volta)!} />
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}
