"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useAppData } from "@/lib/store/AppDataContext";
import { StatusBadge } from "@/components/shell/StatusBadge";
import { FlightList } from "@/components/FlightList";
import { QuoteExtrasForm, QuoteExtras } from "./QuoteExtrasForm";
import { formatCurrencyBRL, validityDateTimePtBR } from "@/lib/format";
import { PAYMENT_METHOD_LABEL, QUOTE_PRIORITY_LABEL, Quote } from "@/lib/store/types";
import { QuoteItem } from "@/lib/types";
import { Pencil, X } from "lucide-react";

function toExtras(quote: Quote): QuoteExtras {
  return {
    clientId: quote.clientId,
    responsavelId: quote.responsavelId,
    sellerName: quote.sellerName,
    sellerEmail: quote.sellerEmail,
    sellerPhone: quote.sellerPhone,
    destino: quote.destino,
    periodoInicio: quote.periodoInicio,
    periodoFim: quote.periodoFim,
    paymentMethod: quote.paymentMethod,
    validityHours: quote.validityHours,
    priority: quote.priority,
    mensagemDestaque: quote.mensagemDestaque,
    observacoes: quote.observacoes,
  };
}

function InfoField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-semibold text-slate-500">{label}</p>
      <p className="text-slate-800">{value}</p>
    </div>
  );
}

interface QuoteDetailModalProps {
  quoteId: string;
  onClose: () => void;
}

/** Modal de detalhes/edição de uma cotação, aberto a partir do card no
 * board (/cotacoes). Igual ao QuoteEditor em conteúdo, mas sem o campo de
 * upload/extração de print — aqui só se edita os dados já existentes. */
export function QuoteDetailModal({ quoteId, onClose }: QuoteDetailModalProps) {
  const { getQuote, getClient, updateQuote } = useAppData();
  const quote = getQuote(quoteId);

  const [mode, setMode] = useState<"view" | "edit">("view");
  const [extras, setExtras] = useState<QuoteExtras | null>(quote ? toExtras(quote) : null);
  const [items, setItems] = useState<QuoteItem[]>(quote?.flightItems || []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  if (!quote || !extras) return null;

  const client = quote.clientId ? getClient(quote.clientId) : undefined;
  const selectedItems = quote.flightItems.filter((i) => i.selected);

  const handleToggle = (rowId: string, fareId: string) => {
    setItems((prev) =>
      prev.map((item) =>
        item.rowId === rowId && item.fareId === fareId ? { ...item, selected: !item.selected } : item
      )
    );
  };

  const handleEdit = () => {
    setExtras(toExtras(quote));
    setItems(quote.flightItems);
    setMode("edit");
  };

  const handleCancel = () => {
    setExtras(toExtras(quote));
    setItems(quote.flightItems);
    setMode("view");
  };

  const handleSave = () => {
    const selected = items.filter((i) => i.selected);
    const valorTotal = selected.length ? Math.min(...selected.map((i) => i.price)) : 0;
    updateQuote(quote.id, {
      clientId: extras.clientId,
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
      mensagemDestaque: extras.mensagemDestaque,
      observacoes: extras.observacoes,
      valorTotal,
      flightItems: items,
    });
    toast.success("Cotação atualizada.");
    setMode("view");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4" onClick={onClose}>
      <div
        onClick={(e) => e.stopPropagation()}
        className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-xl bg-white shadow-xl"
      >
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <div className="flex items-center gap-2">
            <span className="font-mono text-sm font-semibold text-slate-800">{quote.numero}</span>
            <StatusBadge status={quote.status} />
          </div>
          <div className="flex items-center gap-1">
            {mode === "view" ? (
              <button
                type="button"
                onClick={handleEdit}
                className="flex items-center gap-1.5 rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                <Pencil className="h-3.5 w-3.5" /> Editar
              </button>
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
          ) : (
            <div className="flex flex-col gap-4 text-sm">
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
                  <p className="mb-2 text-xs font-semibold text-slate-500">Opções selecionadas</p>
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
