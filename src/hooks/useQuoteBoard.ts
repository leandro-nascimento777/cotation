"use client";

import { useEffect, useMemo, useState } from "react";
import { getProposalDecisions } from "@/lib/proposal/actions";
import { statusFromClientDecision } from "@/lib/store/quoteStatus";
import {
  QUOTE_STATUS_ORDER,
  Quote,
  QuotePriorityType,
  QuoteStatusType,
  Client,
} from "@/lib/store/types";

interface UseQuoteBoardOptions {
  quotes: Quote[];
  clients: Client[];
  updateQuote: (id: string, patch: Partial<Quote>) => void;
  hydrated: boolean;
}

export const useQuoteBoard = ({
  quotes,
  clients,
  updateQuote,
  hydrated,
}: UseQuoteBoardOptions) => {
  const [query, setQuery] = useState("");
  const [priorityFilter, setPriorityFilter] = useState<QuotePriorityType | "">("");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [dragId, setDragId] = useState<string | null>(null);
  const [dragOverStatus, setDragOverStatus] = useState<QuoteStatusType | null>(null);
  const [selectedQuoteId, setSelectedQuoteId] = useState<string | null>(null);
  const [modalInitialMode, setModalInitialMode] = useState<"view" | "close">("view");

  const clientNameById = useMemo(
    () => new Map(clients.map((c) => [c.id, c.nomeCompleto])),
    [clients]
  );
  const clientPhoneById = useMemo(
    () => new Map(clients.map((c) => [c.id, c.telefone])),
    [clients]
  );

  // Sincroniza as respostas que o cliente deu na proposta pública
  useEffect(() => {
    if (!hydrated || quotes.length === 0) return;
    getProposalDecisions(quotes.map((q) => q.id)).then((decisions) => {
      for (const decision of decisions) {
        const quote = quotes.find((q) => q.id === decision.quoteLocalId);
        if (!quote) continue;
        const nextStatus = statusFromClientDecision(quote.status, decision.clientDecision);
        if (!nextStatus) continue;

        const patch: Partial<Quote> = { status: nextStatus };
        if (nextStatus !== "APROVADA") {
          updateQuote(quote.id, patch);
          continue;
        }
        const canPrefill = !quote.saleClosed && !quote.closedIda && !quote.closedVolta;
        if (canPrefill && decision.selectedIdaRowId && decision.selectedIdaFareId) {
          patch.closedIda = { rowId: decision.selectedIdaRowId, fareId: decision.selectedIdaFareId };
        }
        if (canPrefill && decision.selectedVoltaRowId && decision.selectedVoltaFareId) {
          patch.closedVolta = { rowId: decision.selectedVoltaRowId, fareId: decision.selectedVoltaFareId };
        }
        updateQuote(quote.id, patch);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return quotes
      .filter((quote) => !quote.finalizedAt)
      .filter((quote) => !priorityFilter || quote.priority === priorityFilter)
      .filter((quote) => {
        if (!q) return true;
        return [quote.numero, quote.destino, clientNameById.get(quote.clientId || "")]
          .filter(Boolean)
          .some((f) => f!.toLowerCase().includes(q));
      });
  }, [quotes, query, priorityFilter, clientNameById]);

  const byStatus = useMemo(() => {
    const map = new Map<QuoteStatusType, Quote[]>();
    for (const status of QUOTE_STATUS_ORDER) map.set(status, []);
    for (const quote of [...filtered].sort((a, b) => b.createdAt.localeCompare(a.createdAt))) {
      map.get(quote.status)?.push(quote);
    }
    return map;
  }, [filtered]);

  const stats = useMemo(
    () => ({
      total: quotes.length,
      aguardandoResposta: quotes.filter((q) => q.status === "ENVIADA" || q.status === "AGUARDANDO").length,
      valorTotal: quotes.reduce((sum, q) => sum + (q.valorTotal || 0), 0),
    }),
    [quotes]
  );

  const handleDrop = (status: QuoteStatusType) => {
    setDragOverStatus(null);
    if (dragId) updateQuote(dragId, { status });
    setDragId(null);
  };

  const clearFilters = () => {
    setQuery("");
    setPriorityFilter("");
  };

  const activeFilterCount = (query ? 1 : 0) + (priorityFilter ? 1 : 0);

  return {
    query,
    setQuery,
    priorityFilter,
    setPriorityFilter,
    filtersOpen,
    setFiltersOpen,
    dragId,
    setDragId,
    dragOverStatus,
    setDragOverStatus,
    selectedQuoteId,
    setSelectedQuoteId,
    modalInitialMode,
    setModalInitialMode,
    clientNameById,
    clientPhoneById,
    byStatus,
    stats,
    handleDrop,
    clearFilters,
    activeFilterCount,
  };
};
