"use client";

import { useAppData } from "@/lib/store/AppDataContext";
import { FormField, FormSelect, FormTextarea } from "@/components/ui/FormField";
import { PricingBreakdownList } from "@/components/ui/PricingBreakdownList";
import { computeQuoteValorTotal } from "@/lib/pricing";
import {
  Client,
  PAYMENT_METHOD_LABEL,
  PaymentMethodType,
  QUOTE_PRIORITY_LABEL,
  QuotePriorityType,
  Quote,
} from "@/lib/store/types";
import { TeamMemberPicker } from "./TeamMemberPicker";

export interface QuoteExtras {
  clientId: string | null;
  clientName: string;
  passengerNames?: string;
  clientPhone: string;
  clientEmail: string;
  responsavelId: string | null;
  sellerName: string;
  sellerEmail: string;
  sellerPhone: string;
  origem: string;
  destino: string;
  periodoInicio: string;
  periodoFim: string;
  paymentMethod: PaymentMethodType | "";
  validityHours: number;
  priority: QuotePriorityType;
  pricingProfileId: string | null;
  internacional: boolean;
  pagamentoCartaoAgencia: boolean;
  adults: number;
  children: number;
  infants: number;
  mensagemDestaque: string;
  observacoes: string;
}

/** Cria ou preenche QuoteExtras a partir de uma Quote existente ou com valores padrão da agência. */
export const quoteToExtras = (
  quote?: Quote | null,
  client?: Client | { nomeCompleto?: string; telefone?: string; email?: string } | null,
  fallbackAgency?: { sellerName?: string; email?: string; phone?: string }
): QuoteExtras => ({
  clientId: quote?.clientId ?? null,
  clientName: client?.nomeCompleto ?? "",
  passengerNames: "",
  clientPhone: client?.telefone ?? "",
  clientEmail: client?.email ?? "",
  responsavelId: quote?.responsavelId ?? null,
  sellerName: quote?.sellerName ?? fallbackAgency?.sellerName ?? "",
  sellerEmail: quote?.sellerEmail ?? fallbackAgency?.email ?? "",
  sellerPhone: quote?.sellerPhone ?? fallbackAgency?.phone ?? "",
  origem: quote?.origem ?? "",
  destino: quote?.destino ?? "",
  periodoInicio: quote?.periodoInicio ?? "",
  periodoFim: quote?.periodoFim ?? "",
  paymentMethod: quote?.paymentMethod ?? "",
  validityHours: quote?.validityHours ?? 24,
  priority: quote?.priority ?? "NORMAL",
  pricingProfileId: quote?.pricingProfileId ?? null,
  internacional: quote?.internacional ?? false,
  pagamentoCartaoAgencia: quote?.pagamentoCartaoAgencia ?? false,
  adults: quote?.adults ?? 1,
  children: quote?.children ?? 0,
  infants: quote?.infants ?? 0,
  mensagemDestaque:
    quote?.mensagemDestaque ??
    "Agradecemos a preferência! Seguem as opções de voo selecionadas para sua viagem.",
  observacoes:
    quote?.observacoes ??
    "Valores sujeitos a disponibilidade e alteração sem aviso prévio até a confirmação da reserva.",
});

interface QuoteExtrasFormProps {
  extras: QuoteExtras;
  onChange: (extras: QuoteExtras) => void;
  /** Menor preço entre os itens de voo selecionados — base pro preview do
   * breakdown do perfil de cobrança. */
  tarifaLiquida?: number;
}

export const QuoteExtrasForm = ({ extras, onChange, tarifaLiquida = 0 }: QuoteExtrasFormProps) => {
  const { clients, pricingProfiles, getPricingProfile } = useAppData();
  const set = <K extends keyof QuoteExtras>(key: K, value: QuoteExtras[K]) =>
    onChange({ ...extras, [key]: value });

  const selectedProfile = extras.pricingProfileId ? getPricingProfile(extras.pricingProfileId) : undefined;
  const breakdown = selectedProfile
    ? computeQuoteValorTotal({
        tarifaLiquida,
        passageiros: extras.adults + extras.children,
        internacional: extras.internacional,
        pagamentoCartaoAgencia: extras.pagamentoCartaoAgencia,
        profile: selectedProfile,
      }).breakdown
    : undefined;

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
        <FormField label="Telefone do cliente" value={extras.clientPhone} onChange={(v) => set("clientPhone", v)} />
        <FormField label="E-mail do cliente" value={extras.clientEmail} onChange={(v) => set("clientEmail", v)} />
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
        <FormField label="Vendedor(a)" value={extras.sellerName} onChange={(v) => set("sellerName", v)} />
        <FormField label="Telefone do responsável" value={extras.sellerPhone} onChange={(v) => set("sellerPhone", v)} />
        <FormField label="E-mail" value={extras.sellerEmail} onChange={(v) => set("sellerEmail", v)} />

        <FormSelect
          label="Forma de pagamento"
          value={extras.paymentMethod}
          onChange={(v) => set("paymentMethod", v as PaymentMethodType | "")}
        >
          <option value="">Selecione…</option>
          {Object.entries(PAYMENT_METHOD_LABEL).map(([val, label]) => (
            <option key={val} value={val}>
              {label}
            </option>
          ))}
        </FormSelect>

        <FormSelect
          label="Tipo de cobrança"
          value={extras.pricingProfileId ?? ""}
          onChange={(v) => set("pricingProfileId", v || null)}
          hint={pricingProfiles.length === 0 ? "Crie perfis em Configurações → Financeiro." : undefined}
        >
          <option value="">Nenhum</option>
          {pricingProfiles.map((p) => (
            <option key={p.id} value={p.id}>
              {p.nome}
            </option>
          ))}
        </FormSelect>

        <FormField
          label="Origem"
          value={extras.origem}
          onChange={(v) => set("origem", v)}
          placeholder="Preenchido automaticamente a partir do print"
        />
        <FormField
          label="Destino"
          value={extras.destino}
          onChange={(v) => set("destino", v)}
          placeholder="Preenchido automaticamente a partir do print"
        />
        <FormField
          label="Validade da cotação (horas)"
          type="number"
          value={extras.validityHours}
          onChange={(v) => set("validityHours", Math.max(1, Number(v) || 1))}
        />
        <FormSelect
          label="Prioridade"
          value={extras.priority}
          onChange={(v) => set("priority", v as QuotePriorityType)}
        >
          {Object.entries(QUOTE_PRIORITY_LABEL).map(([val, label]) => (
            <option key={val} value={val}>
              {label}
            </option>
          ))}
        </FormSelect>
        <FormField
          label="Período — ida"
          type="date"
          value={extras.periodoInicio}
          error={!extras.periodoInicio ? "Preenchimento necessário para o bilhete" : undefined}
          onChange={(v) => set("periodoInicio", v)}
        />
        <FormField
          label="Período — volta"
          type="date"
          value={extras.periodoFim}
          hint={!extras.periodoFim ? "Preencha para voos de ida e volta" : undefined}
          onChange={(v) => set("periodoFim", v)}
        />
      </div>

      {extras.pricingProfileId ? (
        <div className="mt-3 rounded-lg border border-teal-100 bg-teal-50/40 p-3">
          <p className="mb-2 text-xs font-semibold text-slate-600">
            Composição do valor de venda (só visível pra você, o cliente não vê essa discriminação)
          </p>
          <div className="mb-3 flex flex-wrap gap-4">
            <label className="flex items-center gap-1.5 text-xs font-medium text-slate-600">
              <input
                type="checkbox"
                checked={extras.internacional}
                onChange={(e) => set("internacional", e.target.checked)}
                className="h-4 w-4 accent-teal-600"
              />
              Destino internacional
            </label>
            <label className="flex items-center gap-1.5 text-xs font-medium text-slate-600">
              <input
                type="checkbox"
                checked={extras.pagamentoCartaoAgencia}
                onChange={(e) => set("pagamentoCartaoAgencia", e.target.checked)}
                className="h-4 w-4 accent-teal-600"
              />
              Cliente paga no cartão da agência
            </label>
          </div>
          {breakdown ? (
            <PricingBreakdownList breakdown={breakdown} pagamentoCartaoAgencia={extras.pagamentoCartaoAgencia} />
          ) : (
            <p className="text-xs text-slate-400">Adicione opções de voo pra ver a composição do valor.</p>
          )}
        </div>
      ) : null}

      <div className="mt-3 grid grid-cols-3 gap-3">
        <FormField
          label="Adultos"
          type="number"
          min={0}
          value={extras.adults}
          onChange={(v) => set("adults", Math.max(0, Number(v) || 0))}
        />
        <FormField
          label="Crianças"
          type="number"
          min={0}
          value={extras.children}
          onChange={(v) => set("children", Math.max(0, Number(v) || 0))}
        />
        <FormField
          label="Bebês"
          type="number"
          min={0}
          value={extras.infants}
          onChange={(v) => set("infants", Math.max(0, Number(v) || 0))}
        />
      </div>

      {extras.adults + extras.children > 1 ? (
        <div className="mt-3 rounded-lg border border-indigo-100 bg-indigo-50/50 p-3">
          <FormField
            label="Nomes dos passageiros (separados por vírgula)"
            value={extras.passengerNames || ""}
            onChange={(v) => set("passengerNames", v)}
            placeholder="Ex: DANIEL HADID, ANTONIO BRID, PRISCILA ALCANTARA"
            hint="Serão exibidos empilhados no Bilhete de Embarque (Anexo 3)"
          />
        </div>
      ) : null}

      <div className="mt-3 grid grid-cols-1 gap-3">
        <FormTextarea
          label="Mensagem de destaque"
          rows={2}
          value={extras.mensagemDestaque}
          onChange={(v) => set("mensagemDestaque", v)}
        />
        <FormTextarea
          label="Observações importantes"
          rows={2}
          value={extras.observacoes}
          onChange={(v) => set("observacoes", v)}
        />
      </div>
    </div>
  );
}
