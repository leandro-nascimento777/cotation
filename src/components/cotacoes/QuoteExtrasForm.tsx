"use client";

import { PAYMENT_METHOD_LABEL, PaymentMethodType } from "@/lib/store/types";
import { ClientPicker } from "./ClientPicker";
import { TeamMemberPicker } from "./TeamMemberPicker";

export interface QuoteExtras {
  clientId: string | null;
  responsavelId: string | null;
  sellerName: string;
  sellerEmail: string;
  sellerPhone: string;
  destino: string;
  periodoInicio: string;
  periodoFim: string;
  paymentMethod: PaymentMethodType | "";
  validityDays: number;
  mensagemDestaque: string;
  observacoes: string;
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  textarea,
}: {
  label: string;
  value: string | number;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  textarea?: boolean;
}) {
  return (
    <label className="flex flex-col gap-1 text-xs font-medium text-slate-600">
      {label}
      {textarea ? (
        <textarea
          value={value}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          rows={2}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-800 focus:border-teal-500 focus:outline-none"
        />
      ) : (
        <input
          type={type}
          value={value}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-800 focus:border-teal-500 focus:outline-none"
        />
      )}
    </label>
  );
}

interface QuoteExtrasFormProps {
  extras: QuoteExtras;
  onChange: (extras: QuoteExtras) => void;
}

export function QuoteExtrasForm({ extras, onChange }: QuoteExtrasFormProps) {
  const set = <K extends keyof QuoteExtras>(key: K, value: QuoteExtras[K]) =>
    onChange({ ...extras, [key]: value });

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <h2 className="mb-3 text-sm font-semibold text-slate-700">Dados da cotação</h2>

      <div className="mb-3">
        <label className="mb-1 block text-xs font-medium text-slate-600">Cliente</label>
        <ClientPicker clientId={extras.clientId} onChange={(clientId) => set("clientId", clientId)} />
      </div>

      <div className="mb-3">
        <label className="mb-1 block text-xs font-medium text-slate-600">Responsável (equipe)</label>
        <TeamMemberPicker
          memberId={extras.responsavelId}
          onSelect={(member) =>
            onChange({
              ...extras,
              responsavelId: member?.id || null,
              sellerName: member?.nome ?? extras.sellerName,
              sellerEmail: member?.email ?? extras.sellerEmail,
              sellerPhone: member?.telefone ?? extras.sellerPhone,
            })
          }
        />
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Field label="Vendedor(a)" value={extras.sellerName} onChange={(v) => set("sellerName", v)} />
        <Field label="Telefone" value={extras.sellerPhone} onChange={(v) => set("sellerPhone", v)} />
        <Field label="E-mail" value={extras.sellerEmail} onChange={(v) => set("sellerEmail", v)} />
        <label className="flex flex-col gap-1 text-xs font-medium text-slate-600">
          Forma de pagamento
          <select
            value={extras.paymentMethod}
            onChange={(e) => set("paymentMethod", e.target.value as PaymentMethodType | "")}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-800 focus:border-teal-500 focus:outline-none"
          >
            <option value="">Selecione…</option>
            {Object.entries(PAYMENT_METHOD_LABEL).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>
        <Field label="Destino" value={extras.destino} onChange={(v) => set("destino", v)} placeholder="Ex: Belo Horizonte" />
        <Field
          label="Validade da cotação (dias)"
          type="number"
          value={extras.validityDays}
          onChange={(v) => set("validityDays", Math.max(1, Number(v) || 1))}
        />
        <Field label="Período — ida" type="date" value={extras.periodoInicio} onChange={(v) => set("periodoInicio", v)} />
        <Field label="Período — volta" type="date" value={extras.periodoFim} onChange={(v) => set("periodoFim", v)} />
      </div>

      <div className="mt-3 grid grid-cols-1 gap-3">
        <Field
          label="Mensagem de destaque"
          value={extras.mensagemDestaque}
          onChange={(v) => set("mensagemDestaque", v)}
          textarea
        />
        <Field label="Observações importantes" value={extras.observacoes} onChange={(v) => set("observacoes", v)} textarea />
      </div>
    </div>
  );
}
