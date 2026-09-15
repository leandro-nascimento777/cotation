"use client";

import { useEffect, useState } from "react";
import { LegLine } from "@/components/FlightList";
import { formatCurrencyBRL } from "@/lib/format";
import { ClosedFlightSelection } from "@/lib/store/types";
import { legKind, QuoteItem } from "@/lib/types";
import { Luggage, PlaneLanding, PlaneTakeoff } from "lucide-react";

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
}: {
  fare: QuoteItem;
  name: string;
  checked: boolean;
  onSelect: () => void;
}) {
  return (
    <label
      className={`flex cursor-pointer flex-col gap-2 rounded-xl border p-3 text-sm transition-colors ${
        checked ? "border-teal-500 bg-teal-50" : "border-slate-200 bg-white hover:border-slate-300"
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
 * (ida/volta) independentes quando vêm de tabelas separadas — mesmo padrão
 * de agrupamento usado em CloseSaleForm.tsx pro fluxo interno de "Fechar
 * venda". Soma e reporta o valor total ao vivo pro componente pai. */
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

  useEffect(() => {
    const idaItem = items.find((i) => selectedIda && i.rowId === selectedIda.rowId && i.fareId === selectedIda.fareId);
    const voltaItem = items.find(
      (i) => selectedVolta && i.rowId === selectedVolta.rowId && i.fareId === selectedVolta.fareId
    );
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

  return (
    <div className="flex flex-col gap-4">
      {comboGroups.length > 0 ? (
        <div className="flex flex-col gap-2">
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
            <div className="flex flex-col gap-2">
              <h3 className="text-xs font-bold tracking-wide text-slate-500 uppercase">Voo de ida</h3>
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
            <div className="flex flex-col gap-2">
              <h3 className="text-xs font-bold tracking-wide text-slate-500 uppercase">Voo de volta</h3>
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
    </div>
  );
}
