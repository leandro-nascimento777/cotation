"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  AlertTriangle,
  Check,
  CheckCircle2,
  Clock,
  Copy,
  CreditCard,
  ExternalLink,
  Globe,
  User,
  Wallet,
} from "lucide-react";
import { ProposalShareRecord } from "@/lib/proposal/types";
import { ProposalClientSnapshot, ProposalPaymentSummary } from "@/lib/proposal/actions";
import { pricesMatch } from "@/lib/proposal/comparePrices";
import { PAYMENT_METHOD_KIND_LABEL } from "@/lib/proposal/paymentLabels";
import { formatCurrencyBRL } from "@/lib/format";
import { Quote, ClientPassenger } from "@/lib/store/types";
import { QuoteItem } from "@/lib/types";

const publicOrigin = (): string => (typeof window !== "undefined" ? window.location.origin : "");

const findItemInList = (items: QuoteItem[], sel: { rowId: string; fareId: string } | null): QuoteItem | undefined => {
  if (!sel) return undefined;
  return items.find((i) => i.rowId === sel.rowId && i.fareId === sel.fareId);
};

const CopyLinkRow = ({ label, url, openHref }: { label: string; url: string; openHref: string }) => {
  const [copied, setCopied] = useState(false);
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-2">
      <p className="px-1 text-[11px] font-semibold text-slate-500">{label}</p>
      <div className="mt-1 flex items-center gap-2">
        <span className="min-w-0 flex-1 truncate px-1 font-mono text-xs text-slate-700">{url}</span>
        <button
          type="button"
          onClick={async () => {
            await navigator.clipboard.writeText(url);
            setCopied(true);
            toast.success("Link copiado!");
            setTimeout(() => setCopied(false), 1500);
          }}
          className="flex shrink-0 items-center gap-1 rounded-lg border border-slate-300 bg-white px-2 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
        >
          {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
          {copied ? "Copiado" : "Copiar"}
        </button>
        <a
          href={openHref}
          target="_blank"
          rel="noreferrer"
          title="Abre um resumo somente leitura — sem opção de editar nada"
          className="flex shrink-0 items-center gap-1 rounded-lg border border-slate-300 bg-white px-2 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50"
        >
          <ExternalLink className="h-3.5 w-3.5" /> Abrir
        </a>
      </div>
    </div>
  );
};

const PriceComparisonRow = ({
  label,
  agentItem,
  clientItem,
}: {
  label: string;
  agentItem: QuoteItem | undefined;
  clientItem: QuoteItem | undefined;
}) => {
  if (!clientItem) return null;
  const match = agentItem ? pricesMatch(agentItem.price, clientItem.price) : false;

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-3">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-semibold text-slate-700">{label}</p>
        {match ? (
          <span className="flex items-center gap-1 rounded-full bg-green-50 px-2 py-0.5 text-[11px] font-medium text-green-700">
            <CheckCircle2 className="h-3 w-3" /> Valores conferem
          </span>
        ) : (
          <span className="flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-medium text-amber-700">
            <AlertTriangle className="h-3 w-3" /> Valor divergente
          </span>
        )}
      </div>
      <div className="mt-1.5 grid grid-cols-2 gap-2 text-xs">
        <div>
          <p className="text-slate-400">Mostrado ao cliente</p>
          <p className="font-semibold text-slate-800">{formatCurrencyBRL(clientItem.price)}</p>
        </div>
        <div>
          <p className="text-slate-400">Na cotação hoje</p>
          <p className={`font-semibold ${match ? "text-slate-800" : "text-amber-700"}`}>
            {agentItem ? formatCurrencyBRL(agentItem.price) : "—"}
          </p>
        </div>
      </div>
    </div>
  );
};

interface ApprovedProposalPanelProps {
  quote: Quote;
  proposalShare: ProposalShareRecord;
}

/** Painel de pré-emissão exibido no QuoteDetailModal quando a cotação está
 * Aprovada: reúne o link ativo (modo leitura), a conferência de valor entre
 * o que foi mostrado ao cliente e o que está na cotação hoje, os dados do
 * viajante e a forma de pagamento escolhida no checkout público — tudo que
 * o agente precisa consultar antes de emitir. */
export const ApprovedProposalPanel = ({ quote, proposalShare }: ApprovedProposalPanelProps) => {
  const [now] = useState(() => Date.now());
  const permanentUrl = `${publicOrigin()}/proposta/${proposalShare.id}`;
  const activeTemporaryLink = proposalShare.temporaryLinks.find(
    (link) => !link.revokedAt && new Date(link.expiresAt).getTime() > now
  );

  const clientFlightItems = (proposalShare.flightItems as unknown as QuoteItem[]) || [];
  const clientIdaItem = findItemInList(
    clientFlightItems,
    proposalShare.selectedIdaRowId && proposalShare.selectedIdaFareId
      ? { rowId: proposalShare.selectedIdaRowId, fareId: proposalShare.selectedIdaFareId }
      : null
  );
  const clientVoltaItem = findItemInList(
    clientFlightItems,
    proposalShare.selectedVoltaRowId && proposalShare.selectedVoltaFareId
      ? { rowId: proposalShare.selectedVoltaRowId, fareId: proposalShare.selectedVoltaFareId }
      : null
  );
  const agentIdaItem = clientIdaItem
    ? findItemInList(quote.flightItems, { rowId: clientIdaItem.rowId, fareId: clientIdaItem.fareId })
    : undefined;
  const agentVoltaItem = clientVoltaItem
    ? findItemInList(quote.flightItems, { rowId: clientVoltaItem.rowId, fareId: clientVoltaItem.fareId })
    : undefined;

  const clientSnapshot = proposalShare.clientSnapshot as unknown as ProposalClientSnapshot | null;
  const travelers: ClientPassenger[] = clientSnapshot?.savedPassengers || [];
  const payment = proposalShare.checkoutPayment as unknown as ProposalPaymentSummary | null;

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-slate-50/60 p-4">
      <div>
        <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-slate-600">
          <Globe className="h-3.5 w-3.5" /> Link ativo enviado ao cliente
        </p>
        <div className="flex flex-col gap-2">
          <CopyLinkRow label="Link permanente" url={permanentUrl} openHref={`${permanentUrl}/resumo`} />
          {activeTemporaryLink ? (
            <CopyLinkRow
              label="Link temporário (ainda válido)"
              url={`${publicOrigin()}/proposta/h/${activeTemporaryLink.token}`}
              openHref={`${publicOrigin()}/proposta/h/${activeTemporaryLink.token}/resumo`}
            />
          ) : null}
        </div>
      </div>

      {clientIdaItem || clientVoltaItem ? (
        <div>
          <p className="mb-2 text-xs font-semibold text-slate-600">Opção escolhida pelo cliente</p>
          <div className="flex flex-col gap-2">
            <PriceComparisonRow label="Ida" agentItem={agentIdaItem} clientItem={clientIdaItem} />
            <PriceComparisonRow label="Volta" agentItem={agentVoltaItem} clientItem={clientVoltaItem} />
          </div>
        </div>
      ) : null}

      <div>
        <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-slate-600">
          <User className="h-3.5 w-3.5" /> Dados do viajante
        </p>
        {travelers.length === 0 ? (
          <p className="rounded-lg bg-white px-3 py-2 text-xs text-slate-400">Nenhum viajante preenchido ainda.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {clientSnapshot ? (
              <div className="grid grid-cols-1 gap-2 rounded-lg bg-white p-3 text-xs sm:grid-cols-2">
                <div>
                  <p className="text-slate-400">Email</p>
                  <p className="font-semibold text-slate-800">{clientSnapshot.email || "—"}</p>
                </div>
                <div>
                  <p className="text-slate-400">Telefone</p>
                  <p className="font-semibold text-slate-800">{clientSnapshot.telefone || "—"}</p>
                </div>
              </div>
            ) : null}
            {travelers.map((t) => (
              <div key={t.id} className="rounded-lg border border-slate-200 bg-white p-3 text-xs">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-semibold text-slate-800">
                    {t.nome} {t.sobrenome}
                  </p>
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600">{t.tipo}</span>
                </div>
                <div className="mt-1 grid grid-cols-2 gap-1.5 text-slate-500 sm:grid-cols-3">
                  <span>
                    {t.tipoDocumento}: {t.numeroDocumento || "—"}
                  </span>
                  <span>Nascimento: {t.dataNascimento || "—"}</span>
                  <span>País: {t.paisResidencia || "—"}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-slate-600">
          <Wallet className="h-3.5 w-3.5" /> Forma de pagamento
        </p>
        {!payment ? (
          <p className="rounded-lg bg-white px-3 py-2 text-xs text-slate-400">
            Cliente aprovou mas ainda não concluiu o checkout — sem forma de pagamento registrada.
          </p>
        ) : (
          <div className="rounded-lg border border-slate-200 bg-white p-3 text-xs">
            <div className="flex items-center justify-between gap-2">
              <span className="flex items-center gap-1.5 font-semibold text-slate-800">
                <CreditCard className="h-3.5 w-3.5 text-slate-400" /> {PAYMENT_METHOD_KIND_LABEL[payment.method]}
              </span>
              <span className="flex items-center gap-1 text-[11px] text-slate-400">
                <Clock className="h-3 w-3" /> pedido #{payment.bookingRef}
              </span>
            </div>
            <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
              {payment.cardLast4 ? (
                <div>
                  <p className="text-slate-400">Cartão</p>
                  <p className="font-semibold text-slate-800">•••• {payment.cardLast4}</p>
                </div>
              ) : null}
              {payment.cardHolder ? (
                <div>
                  <p className="text-slate-400">Titular</p>
                  <p className="font-semibold text-slate-800">{payment.cardHolder}</p>
                </div>
              ) : null}
              {payment.installments ? (
                <div>
                  <p className="text-slate-400">Parcelas</p>
                  <p className="font-semibold text-slate-800">{payment.installments}x</p>
                </div>
              ) : null}
              {payment.invoice ? (
                <div className="col-span-2 sm:col-span-3">
                  <p className="text-slate-400">Nota fiscal</p>
                  <p className="font-semibold text-slate-800">
                    {payment.invoice.fiscalType} — {payment.invoice.fullName} ({payment.invoice.cpfCnpj})
                  </p>
                </div>
              ) : null}
              <div>
                <p className="text-slate-400">Desconto</p>
                <p className="font-semibold text-slate-800">{formatCurrencyBRL(payment.discount)}</p>
              </div>
              <div>
                <p className="text-slate-400">Total</p>
                <p className="font-semibold text-slate-800">{formatCurrencyBRL(payment.total)}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
