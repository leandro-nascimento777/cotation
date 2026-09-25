"use client";

import { useEffect, useState } from "react";
import { groupByRow } from "@/lib/groupQuoteItems";
import { ClosedFlightSelection } from "@/lib/store/types";
import { legKind, QuoteItem } from "@/lib/types";
import { ComboRouteCard, FlightSegmentCard } from "./FlightSegmentCard";

interface FlightSelectorProps {
  items: QuoteItem[];
  onChange: (state: {
    selectedIda: ClosedFlightSelection | null;
    selectedVolta: ClosedFlightSelection | null;
    complete: boolean;
    total: number;
  }) => void;
  /** Modo consulta (proposta já decidida): nenhuma opção é clicável, e
   * `initialSelection` — a escolha real já registrada pelo cliente — é o
   * que define o que aparece marcado, em vez do heurístico de pré-seleção
   * usado numa proposta ainda em aberto. */
  locked?: boolean;
  initialSelection?: {
    selectedIda: ClosedFlightSelection | null;
    selectedVolta: ClosedFlightSelection | null;
  };
}

/**
 * Seletor de voos interativo da proposta pública seguindo fielmente os Anexos 1 a 5:
 * - Cards de Trecho (IDA / VOLTA) com cabeçalho tabular e aeroportos
 * - Linhas com escolha única (rádio roxo), logo, horários, paradas sublinhadas, duração
 * - Ícones de bagagem com popover no hover (Anexo 4)
 * - Botão chevron que abre o modal completo de detalhes e flexibilidade (Anexo 3 e 5)
 */
export function FlightSelector({ items, onChange, locked = false, initialSelection }: FlightSelectorProps) {
  const groups = groupByRow(items);
  const comboGroups = groups.filter((g) => legKind(g.fares[0]) === "combo");
  const idaGroups = groups.filter((g) => legKind(g.fares[0]) === "ida");
  const voltaGroups = groups.filter((g) => legKind(g.fares[0]) === "volta");

  const comboFares = comboGroups.flatMap((g) => g.fares);
  const idaFares = idaGroups.flatMap((g) => g.fares);
  const voltaFares = voltaGroups.flatMap((g) => g.fares);

  const needCombo = comboFares.length > 0;
  const needIda = !needCombo && idaFares.length > 0;
  const needVolta = !needCombo && voltaFares.length > 0;

  // Em modo consulta, o que aparece marcado é a escolha real do cliente —
  // nunca um heurístico. Numa proposta ainda em aberto, pré-seleciona a
  // primeira opção marcada pelo agente ou a primeira disponível (Anexo 2).
  const [selectedIda, setSelectedIda] = useState<ClosedFlightSelection | null>(() => {
    if (locked) return initialSelection?.selectedIda ?? null;
    if (needCombo) {
      const firstCombo = comboFares.find((i) => i.selected) ?? comboFares[0];
      return firstCombo ? { rowId: firstCombo.rowId, fareId: firstCombo.fareId } : null;
    }
    const firstIda = idaFares.find((i) => i.selected) ?? idaFares[0];
    return firstIda ? { rowId: firstIda.rowId, fareId: firstIda.fareId } : null;
  });

  const [selectedVolta, setSelectedVolta] = useState<ClosedFlightSelection | null>(() => {
    if (locked) return initialSelection?.selectedVolta ?? null;
    if (needCombo) {
      const firstCombo = comboFares.find((i) => i.selected) ?? comboFares[0];
      return firstCombo ? { rowId: firstCombo.rowId, fareId: firstCombo.fareId } : null;
    }
    const firstVolta = voltaFares.find((i) => i.selected) ?? voltaFares[0];
    return firstVolta ? { rowId: firstVolta.rowId, fareId: firstVolta.fareId } : null;
  });

  const idaItem = items.find(
    (i) => selectedIda && i.rowId === selectedIda.rowId && i.fareId === selectedIda.fareId
  );
  const voltaItem = items.find(
    (i) => selectedVolta && i.rowId === selectedVolta.rowId && i.fareId === selectedVolta.fareId
  );

  useEffect(() => {
    const total = needCombo
      ? idaItem?.price ?? 0
      : (idaItem?.price ?? 0) + (voltaItem?.price ?? 0);
    const complete = needCombo
      ? Boolean(selectedIda)
      : (!needIda || Boolean(selectedIda)) && (!needVolta || Boolean(selectedVolta));

    onChange({ selectedIda, selectedVolta, complete, total });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedIda, selectedVolta]);

  const handleSelectCombo = (fare: QuoteItem) => {
    if (locked) return;
    setSelectedIda({ rowId: fare.rowId, fareId: fare.fareId });
    setSelectedVolta({ rowId: fare.rowId, fareId: fare.fareId });
  };

  if (items.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-slate-500">
        Nenhuma opção de voo disponível nesta proposta.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {needCombo ? (
        <>
          {/* Um card por rota combo (ida+volta juntos, preço único) — nunca
           * dois cards separados pra não parecer duas decisões distintas. */}
          {comboGroups.map((group) => (
            <ComboRouteCard
              key={group.rowId}
              fares={group.fares}
              selectedFareId={selectedIda?.fareId || null}
              onSelectFare={handleSelectCombo}
              name={`proposal-combo-${group.rowId}`}
              locked={locked}
            />
          ))}
        </>
      ) : (
        <>
          {/* Card Trecho de IDA separado */}
          {idaFares.length > 0 && (
            <FlightSegmentCard
              type="ida"
              fares={idaFares}
              selectedFareId={selectedIda?.fareId || null}
              onSelectFare={(fare) =>
                !locked && setSelectedIda({ rowId: fare.rowId, fareId: fare.fareId })
              }
              name="proposal-ida"
              locked={locked}
            />
          )}

          {/* Card Trecho de VOLTA separado */}
          {voltaFares.length > 0 && (
            <FlightSegmentCard
              type="volta"
              fares={voltaFares}
              selectedFareId={selectedVolta?.fareId || null}
              onSelectFare={(fare) =>
                !locked && setSelectedVolta({ rowId: fare.rowId, fareId: fare.fareId })
              }
              name="proposal-volta"
              locked={locked}
            />
          )}
        </>
      )}
    </div>
  );
}
