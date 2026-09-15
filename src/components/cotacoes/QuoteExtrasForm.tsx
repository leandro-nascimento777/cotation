"use client";

import { useAppData } from "@/lib/store/AppDataContext";
import {
  PAYMENT_METHOD_LABEL,
  PaymentMethodType,
  QUOTE_PRIORITY_LABEL,
  QuotePriorityType,
} from "@/lib/store/types";
import { TeamMemberPicker } from "./TeamMemberPicker";

export interface QuoteExtras {
  clientId: string | null;
  clientName: string;
  clientPhone: string;
  clientEmail: string;
  responsavelId: string | null;
  sellerName: string;
  sellerEmail: string;
  sellerPhone: string;
  destino: string;
  periodoInicio: string;
  periodoFim: string;
  paymentMethod: PaymentMethodType | "";
  validityHours: number;
  priority: QuotePriorityType;
  pricingProfileId: string | null;
  adults: number;
  children: number;
  infants: number;
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
  min,
}: {
  label: string;
  value: string | number;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  textarea?: boolean;
  min?: number;
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
          min={min}
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
  const { clients, pricingProfiles } = useAppData();
  const set = <K extends keyof QuoteExtras>(key: K, value: QuoteExtras[K]) =>
    onChange({ ...extras, [key]: value });

  const handleClientNameChange = (name: string) => {
    const match = clients.find((c) => c.nomeCompleto.trim().toLowerCase() === name.trim().toLowerCase());
    if (match) {
      onChange({ ...extras, clientName: name, clientId: match.id, clientPhone: match.telefone, clientEmail: match.email });
    } else {
      onChange({ ...extras, clientName: name, clientId: null });
    }
  };

  return (
    <div className="@container rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <h2 className="mb-3 text-sm font-semibold text-slate-700">Dados da cotação</h2>

      <div className="mb-1 grid grid-cols-1 gap-3 @lg:grid-cols-2 @3xl:grid-cols-3">
        <label className="flex flex-col gap-1 text-xs font-medium text-slate-600">
          Nome do cliente
          <input
            list="quote-client-suggestions"
            value={extras.clientName}
            placeholder="Nome completo"
            onChange={(e) => handleClientNameChange(e.target.value)}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-800 focus:border-teal-500 focus:outline-none"
          />
          <datalist id="quote-client-suggestions">
            {clients.map((c) => (
              <option key={c.id} value={c.nomeCompleto} />
            ))}
          </datalist>
        </label>
        <Field label="Telefone do cliente" value={extras.clientPhone} onChange={(v) => set("clientPhone", v)} />
        <Field label="E-mail do cliente" value={extras.clientEmail} onChange={(v) => set("clientEmail", v)} />
      </div>
      {extras.clientId ? (
        <p className="mb-3 text-xs font-medium text-teal-700">✓ Cliente já cadastrado — dados preenchidos automaticamente.</p>
      ) : extras.clientName.trim() ? (
        <p className="mb-3 text-xs font-medium text-slate-500">Novo contato — será salvo automaticamente ao criar a cotação.</p>
      ) : (
        <div className="mb-3" />
      )}

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

      <div className="grid grid-cols-1 gap-3 @lg:grid-cols-2 @4xl:grid-cols-3">
        <Field label="Vendedor(a)" value={extras.sellerName} onChange={(v) => set("sellerName", v)} />
        <Field label="Telefone do responsável" value={extras.sellerPhone} onChange={(v) => set("sellerPhone", v)} />
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
        <label className="flex flex-col gap-1 text-xs font-medium text-slate-600">
          Tipo de cobrança
          <select
            value={extras.pricingProfileId ?? ""}
            onChange={(e) => set("pricingProfileId", e.target.value || null)}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-800 focus:border-teal-500 focus:outline-none"
          >
            <option value="">Nenhum</option>
            {pricingProfiles.map((profile) => (
              <option key={profile.id} value={profile.id}>
                {profile.nome}
              </option>
            ))}
          </select>
          {pricingProfiles.length === 0 ? (
            <span className="text-[11px] font-normal text-slate-400">
              Crie perfis em Configurações → Financeiro.
            </span>
          ) : null}
        </label>
        <Field
          label="Destino"
          value={extras.destino}
          onChange={(v) => set("destino", v)}
          placeholder="Preenchido automaticamente a partir do print"
        />
        <Field
          label="Validade da cotação (horas)"
          type="number"
          value={extras.validityHours}
          onChange={(v) => set("validityHours", Math.max(1, Number(v) || 1))}
        />
        <label className="flex flex-col gap-1 text-xs font-medium text-slate-600">
          Prioridade
          <select
            value={extras.priority}
            onChange={(e) => set("priority", e.target.value as QuotePriorityType)}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-800 focus:border-teal-500 focus:outline-none"
          >
            {Object.entries(QUOTE_PRIORITY_LABEL).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>
        <Field
          label="Período — ida"
          type="date"
          value={extras.periodoInicio}
          onChange={(v) => set("periodoInicio", v)}
        />
        <Field label="Período — volta" type="date" value={extras.periodoFim} onChange={(v) => set("periodoFim", v)} />
      </div>

      <div className="mt-3 grid grid-cols-3 gap-3">
        <Field
          label="Adultos"
          type="number"
          min={0}
          value={extras.adults}
          onChange={(v) => set("adults", Math.max(0, Number(v) || 0))}
        />
        <Field
          label="Crianças"
          type="number"
          min={0}
          value={extras.children}
          onChange={(v) => set("children", Math.max(0, Number(v) || 0))}
        />
        <Field
          label="Bebês"
          type="number"
          min={0}
          value={extras.infants}
          onChange={(v) => set("infants", Math.max(0, Number(v) || 0))}
        />
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
