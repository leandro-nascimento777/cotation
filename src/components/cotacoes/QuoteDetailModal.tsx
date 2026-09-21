"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useAppData } from "@/lib/store/AppDataContext";
import { StatusBadge } from "@/components/shell/StatusBadge";
import { FlightList, LegLine } from "@/components/FlightList";
import { QuoteExtrasForm, QuoteExtras, quoteToExtras } from "./QuoteExtrasForm";
import { CloseSaleForm } from "./CloseSaleForm";
import { resolveQuoteClientId } from "@/lib/store/resolveQuoteClient";
import { getProposalShareByQuote } from "@/lib/proposal/actions";
import { ProposalShareRecord } from "@/lib/proposal/types";
import { formatCurrencyBRL, validityDateTimePtBR } from "@/lib/format";
import { PAYMENT_METHOD_LABEL, QUOTE_PRIORITY_LABEL, Quote } from "@/lib/store/types";
import { QuoteItem } from "@/lib/types";
import { CheckCircle2, Luggage, PlaneLanding, PlaneTakeoff, Pencil, X } from "lucide-react";

const InfoField = ({ label, value }: { label: string; value: string }) => (
  <div>
    <p className="text-xs font-semibold text-slate-500">{label}</p>
    <p className="text-slate-800">{value}</p>
  </div>
);

const findItem = (quote: Quote, sel: { rowId: string; fareId: string } | null): QuoteItem | undefined => {
  if (!sel) return undefined;
  return quote.flightItems.find((i) => i.rowId === sel.rowId && i.fareId === sel.fareId);
};

const ClosedFlightCard = ({ item }: { item: QuoteItem }) => (
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

interface QuoteDetailModalProps {
  quoteId: string;
  onClose: () => void;
  initialMode?: "view" | "close";
}

/** Modal de detalhes/edição de uma cotação, aberto a partir do card no
 * board (/cotacoes). Igual ao QuoteEditor em conteúdo, mas sem o campo de
 * upload/extração de print — aqui só se edita os dados já existentes. Na
 * coluna Aprovada também é usado pro fluxo de "Fechar venda". */
export function QuoteDetailModal({ quoteId, onClose, initialMode = "view" }: QuoteDetailModalProps) {
  const { getQuote, getClient, createClient, updateClient, updateQuote } = useAppData();
  const quote = getQuote(quoteId);
  const client = quote?.clientId ? getClient(quote.clientId) : undefined;

  const [mode, setMode] = useState<"view" | "edit" | "close">(initialMode);
  const [extras, setExtras] = useState<QuoteExtras | null>(quote ? quoteToExtras(quote, client) : null);
  const [items, setItems] = useState<QuoteItem[]>(quote?.flightItems || []);
  const [proposalShare, setProposalShare] = useState<ProposalShareRecord | null>(null);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  useEffect(() => {
    getProposalShareByQuote(quoteId).then(setProposalShare);
  }, [quoteId]);

  if (!quote || !extras) return null;

  const selectedItems = quote.flightItems.filter((i) => i.selected);
  const closedIdaItem = findItem(quote, quote.closedIda);
  const closedVoltaItem = findItem(quote, quote.closedVolta);

  const handleToggle = (rowId: string, fareId: string) => {
    setItems((prev) =>
      prev.map((item) =>
        item.rowId === rowId && item.fareId === fareId ? { ...item, selected: !item.selected } : item
      )
    );
  };

  const handleEdit = () => {
    setExtras(quoteToExtras(quote, client));
    setItems(quote.flightItems);
    setMode("edit");
  };

  const handleCancel = () => {
    setExtras(quoteToExtras(quote, client));
    setItems(quote.flightItems);
    setMode("view");
  };

  const handleSave = () => {
    const clientId = resolveQuoteClientId(extras, { getClient, createClient, updateClient });
    const selected = items.filter((i) => i.selected);
    const valorTotal = selected.length ? Math.min(...selected.map((i) => i.price)) : 0;
    updateQuote(quote.id, {
      clientId,
      responsavelId: extras.responsavelId,
      sellerName: extras.sellerName,
      sellerEmail: extras.sellerEmail,
      sellerPhone: extras.sellerPhone,
      destino: extras.destino,
      periodoInicio: extras.periodoInicio,
      periodoFim: extras.periodoFim,
      paymentMethod: extras.paymentMethod,
      validityHours: extras.validityHours,
      priority: extras.priority,
      pricingProfileId: extras.pricingProfileId,
      adults: extras.adults,
      children: extras.children,
      infants: extras.infants,
      mensagemDestaque: extras.mensagemDestaque,
      observacoes: extras.observacoes,
      valorTotal,
      flightItems: items,
    });
    toast.success("Cotação atualizada.");
    setMode("view");
  };

  const handleConfirmClose = (data: { closedIda: Quote["closedIda"]; closedVolta: Quote["closedVolta"]; bookingRef: string }) => {
    updateQuote(quote.id, { ...data, saleClosed: true });
    toast.success("Venda fechada — já conta nas métricas do dashboard.");
    setMode("view");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4" onClick={onClose}>
      <div
        onClick={(e) => e.stopPropagation()}
        className="flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-xl bg-white shadow-xl"
      >
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <div className="flex items-center gap-2">
            <span className="font-mono text-sm font-semibold text-slate-800">{quote.numero}</span>
            <StatusBadge status={quote.status} />
            {quote.saleClosed ? (
              <span className="flex items-center gap-1 rounded-full bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700">
                <CheckCircle2 className="h-3.5 w-3.5" /> Venda fechada
              </span>
            ) : null}
          </div>
          <div className="flex items-center gap-1">
            {mode === "view" ? (
              <>
                {quote.status === "APROVADA" ? (
                  <button
                    type="button"
                    onClick={() => setMode("close")}
                    className="flex items-center gap-1.5 rounded-lg border border-teal-300 bg-teal-50 px-2.5 py-1.5 text-xs font-semibold text-teal-700 hover:bg-teal-100"
                  >
                    {quote.saleClosed ? "Editar venda fechada" : "Fechar venda"}
                  </button>
                ) : null}
                <button
                  type="button"
                  onClick={handleEdit}
                  className="flex items-center gap-1.5 rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  <Pencil className="h-3.5 w-3.5" /> Editar
                </button>
              </>
            ) : null}
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          {mode === "edit" ? (
            <div className="flex flex-col gap-4">
              <QuoteExtrasForm extras={extras} onChange={setExtras} />
              {items.length > 0 && <FlightList items={items} onToggle={handleToggle} />}
            </div>
          ) : mode === "close" ? (
            <CloseSaleForm
              quote={quote}
              lockedByClient={proposalShare?.clientDecision === "APROVADO"}
              onCancel={() => setMode("view")}
              onConfirm={handleConfirmClose}
            />
          ) : (
            <div className="flex flex-col gap-4 text-sm">
              {proposalShare?.clientDecision ? (
                <div
                  className={`rounded-lg px-3 py-2 text-xs font-medium ${
                    proposalShare.clientDecision === "APROVADO" ? "bg-green-50 text-green-700" : "bg-amber-50 text-amber-700"
                  }`}
                >
                  {proposalShare.clientDecision === "APROVADO" ? "✓ Cliente aprovou a proposta." : "Cliente pediu revisão."}
                  {proposalShare.clientObservation ? (
                    <p className="mt-1 italic text-slate-600">&ldquo;{proposalShare.clientObservation}&rdquo;</p>
                  ) : null}
                </div>
              ) : null}

              {quote.saleClosed && (closedIdaItem || closedVoltaItem) ? (
                <div>
                  <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-green-700">
                    <CheckCircle2 className="h-3.5 w-3.5" /> Voo comprado — localizador {quote.bookingRef || "—"}
                  </p>
                  <div className="flex flex-col gap-2">
                    {closedIdaItem ? <ClosedFlightCard item={closedIdaItem} /> : null}
                    {closedVoltaItem && closedVoltaItem !== closedIdaItem ? <ClosedFlightCard item={closedVoltaItem} /> : null}
                  </div>
                </div>
              ) : null}

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <InfoField label="Cliente" value={client?.nomeCompleto || "—"} />
                <InfoField label="Telefone do cliente" value={client?.telefone || "—"} />
                <InfoField label="Vendedor(a)" value={quote.sellerName || "—"} />
                <InfoField label="Prioridade" value={QUOTE_PRIORITY_LABEL[quote.priority]} />
                <InfoField label="Destino" value={quote.destino || "—"} />
                <InfoField
                  label="Forma de pagamento"
                  value={quote.paymentMethod ? PAYMENT_METHOD_LABEL[quote.paymentMethod] : "—"}
                />
                <InfoField label="Período — ida" value={quote.periodoInicio || "—"} />
                <InfoField label="Período — volta" value={quote.periodoFim || "—"} />
                <InfoField label="Passageiros" value={`${quote.adults} adulto(s), ${quote.children} criança(s), ${quote.infants} bebê(s)`} />
                <InfoField label="Validade" value={validityDateTimePtBR(quote.validityHours)} />
                <InfoField label="Valor" value={quote.valorTotal ? formatCurrencyBRL(quote.valorTotal) : "—"} />
              </div>

              {quote.mensagemDestaque ? (
                <div>
                  <p className="mb-1 text-xs font-semibold text-slate-500">Mensagem de destaque</p>
                  <p className="rounded-lg bg-slate-50 p-3 text-slate-700">{quote.mensagemDestaque}</p>
                </div>
              ) : null}

              {quote.observacoes ? (
                <div>
                  <p className="mb-1 text-xs font-semibold text-slate-500">Observações</p>
                  <p className="rounded-lg bg-slate-50 p-3 text-slate-700">{quote.observacoes}</p>
                </div>
              ) : null}

              {selectedItems.length > 0 ? (
                <div>
                  <p className="mb-2 text-xs font-semibold text-slate-500">Opções enviadas ao cliente</p>
                  <FlightList items={quote.flightItems} readOnly />
                </div>
              ) : null}
            </div>
          )}
        </div>

        {mode === "edit" ? (
          <div className="flex justify-end gap-2 border-t border-slate-100 px-5 py-3">
            <button
              type="button"
              onClick={handleCancel}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="rounded-lg bg-teal-600 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-700"
            >
              Salvar alterações
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
