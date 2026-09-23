"use client";

import { useRef, useState } from "react";
import { toast } from "sonner";
import { useAppData } from "@/lib/store/AppDataContext";
import { formatCnpjMask, formatCurrencyBRL } from "@/lib/format";
import { calculatePricing } from "@/lib/pricing";
import { PageHeader } from "@/components/shell/PageHeader";
import { LoadingState } from "@/components/shell/LoadingState";
import { FormField as Field, MoneyField, PercentField } from "@/components/ui/FormField";
import { IdentidadeVisualSection } from "@/components/configuracoes/IdentidadeVisualSection";
import {
  defaultPricingRules,
  DU_RAV_TIPO_LABEL,
  DuRavTipo,
  FEE_SERVICO_MODO_LABEL,
  FeeServicoModo,
  PricingProfile,
  PricingProfileDraft,
  PricingRules,
} from "@/lib/store/types";
import {
  Banknote,
  Building2,
  Check,
  ImagePlus,
  Loader2,
  Palette,
  Plus,
  Save,
  Search,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";

interface ToggleGroupProps<T extends string> {
  value: T;
  options: { value: T; label: string }[];
  onChange: (v: T) => void;
}

const ToggleGroup = <T extends string>({ value, options, onChange }: ToggleGroupProps<T>) => (
  <div className="inline-flex rounded-lg border border-slate-300 bg-slate-50 p-0.5">
    {options.map((opt) => (
      <button
        key={opt.value}
        type="button"
        onClick={() => onChange(opt.value)}
        className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-colors ${
          value === opt.value ? "bg-white text-teal-700 shadow-sm" : "text-slate-500 hover:text-slate-700"
        }`}
      >
        {opt.label}
      </button>
    ))}
  </div>
);

function FinanceiroSection({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <h2 className="mb-1 text-sm font-semibold text-slate-700">{title}</h2>
      <p className="mb-3 text-xs text-slate-500">{description}</p>
      {children}
    </section>
  );
}

function BreakdownRow({ label, value, bold, muted }: { label: string; value: string; bold?: boolean; muted?: boolean }) {
  return (
    <div className={`flex items-center justify-between py-1.5 text-sm ${bold ? "font-bold text-slate-900" : "text-slate-700"}`}>
      <span className={muted ? "text-slate-400" : ""}>{label}</span>
      <span className={bold ? "text-base text-teal-700" : ""}>{value}</span>
    </div>
  );
}

function FinanceiroSimulador({ rules }: { rules: PricingRules }) {
  const [tarifa, setTarifa] = useState(1000);
  const [passageiros, setPassageiros] = useState(1);
  const [internacional, setInternacional] = useState(false);
  const [cartaoAgencia, setCartaoAgencia] = useState(false);

  const breakdown = calculatePricing(
    { tarifaLiquida: tarifa, passageiros, internacional, pagamentoCartaoAgencia: cartaoAgencia },
    rules
  );

  return (
    <section className="rounded-xl border border-teal-200 bg-teal-50/40 p-4 shadow-sm">
      <h2 className="mb-1 text-sm font-semibold text-slate-700">Simulador</h2>
      <p className="mb-3 text-xs text-slate-500">
        Veja como as regras acima (incluindo alterações ainda não salvas) se somam em cima de uma tarifa de exemplo —
        o valor extraído do print + os itens financeiros até chegar no preço de venda.
      </p>

      <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <MoneyField label="Tarifa líquida" value={tarifa} onChange={setTarifa} />
        <Field
          label="Passageiros"
          type="number"
          value={passageiros}
          onChange={(v) => setPassageiros(Math.max(1, Number(v) || 1))}
        />
        <label className="flex flex-col gap-1 text-xs font-medium text-slate-600">
          Voo
          <select
            value={internacional ? "INTL" : "NAC"}
            onChange={(e) => setInternacional(e.target.value === "INTL")}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-800 focus:border-teal-500 focus:outline-none"
          >
            <option value="NAC">Nacional</option>
            <option value="INTL">Internacional</option>
          </select>
        </label>
        <label className="flex flex-col gap-1 text-xs font-medium text-slate-600">
          Pagamento
          <select
            value={cartaoAgencia ? "AGENCIA" : "CLIENTE"}
            onChange={(e) => setCartaoAgencia(e.target.value === "AGENCIA")}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-800 focus:border-teal-500 focus:outline-none"
          >
            <option value="CLIENTE">Cartão do cliente (direto na cia)</option>
            <option value="AGENCIA">Cartão da agência</option>
          </select>
        </label>
      </div>

      <div className="divide-y divide-teal-100 rounded-lg bg-white px-4">
        <BreakdownRow label="Tarifa líquida (extraída)" value={formatCurrencyBRL(breakdown.tarifaLiquida)} />
        <BreakdownRow label="+ Taxa DU / RAV" value={formatCurrencyBRL(breakdown.duRav)} />
        <BreakdownRow label="+ Fee de serviço" value={formatCurrencyBRL(breakdown.feeServico)} />
        <BreakdownRow label="+ Markup de lucro" value={formatCurrencyBRL(breakdown.markup)} />
        <BreakdownRow
          label="+ Imposto retido (sobre DU + Fee + Markup)"
          value={formatCurrencyBRL(breakdown.impostoRetido)}
        />
        <BreakdownRow
          label={cartaoAgencia ? "+ Repasse de gateway/parcelamento" : "Repasse de gateway (cliente paga direto na cia)"}
          value={formatCurrencyBRL(breakdown.gateway)}
          muted={!cartaoAgencia}
        />
        <BreakdownRow label="= Preço de venda" value={formatCurrencyBRL(breakdown.precoVenda)} bold />
      </div>
    </section>
  );
}

const PERFIL_RULE_FIELDS = [
  "duRavTipo",
  "duRavValor",
  "duRavPisoMinimo",
  "feeServicoModo",
  "feeServicoNacional",
  "feeServicoInternacional",
  "markupPercent",
  "gatewayPercent",
  "impostoRetidoPercent",
] as const satisfies readonly (keyof PricingRules)[];

function profileToDraft(profile: PricingProfile): PricingProfileDraft {
  return {
    nome: profile.nome,
    duRavTipo: profile.duRavTipo,
    duRavValor: profile.duRavValor,
    duRavPisoMinimo: profile.duRavPisoMinimo,
    feeServicoModo: profile.feeServicoModo,
    feeServicoNacional: profile.feeServicoNacional,
    feeServicoInternacional: profile.feeServicoInternacional,
    markupPercent: profile.markupPercent,
    gatewayPercent: profile.gatewayPercent,
    impostoRetidoPercent: profile.impostoRetidoPercent,
  };
}

/** Edita um perfil de cobrança específico num rascunho local (não salva a
 * cada tecla, só quando clicar em "Salvar alterações"). Recebe `key={profile.id}`
 * do chamador pra remontar (e descartar o rascunho) ao trocar de perfil. */
function PerfilEditor({
  profile,
  onSave,
  onDelete,
}: {
  profile: PricingProfile;
  onSave: (patch: PricingProfileDraft) => void;
  onDelete: () => void;
}) {
  const [draft, setDraft] = useState<PricingProfileDraft>(() => profileToDraft(profile));

  const set = <K extends keyof PricingProfileDraft>(key: K, value: PricingProfileDraft[K]) =>
    setDraft((prev) => ({ ...prev, [key]: value }));

  const baseline = profileToDraft(profile);
  const isDirty = draft.nome !== baseline.nome || PERFIL_RULE_FIELDS.some((field) => draft[field] !== baseline[field]);

  const handleSave = () => {
    onSave(draft);
    toast.success("Perfil de cobrança salvo.");
  };

  return (
    <>
      <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex items-end justify-between gap-3">
          <label className="flex flex-1 flex-col gap-1 text-xs font-medium text-slate-600">
            Nome do perfil
            <input
              value={draft.nome}
              onChange={(e) => set("nome", e.target.value)}
              placeholder="Ex: Nacional, Internacional, Corporativo"
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-800 focus:border-teal-500 focus:outline-none"
            />
          </label>
          <button
            type="button"
            onClick={onDelete}
            title="Excluir perfil"
            className="flex shrink-0 items-center gap-1 rounded-lg border border-slate-300 px-2.5 py-2 text-xs font-medium text-slate-500 hover:border-red-300 hover:bg-red-50 hover:text-red-600"
          >
            <Trash2 className="h-3.5 w-3.5" /> Excluir
          </button>
        </div>
      </section>

      <p className="-mb-2 text-xs text-slate-500">
        Essas regras compõem o <b>preço de venda</b> em cima da tarifa líquida extraída do print — o valor extraído
        mais os itens abaixo chegam no valor final cobrado do cliente.
      </p>

      <FinanceiroSection
        title="1. Taxa DU / RAV (Remuneração de Agência de Viagens)"
        description="Aplicada sobre a tarifa líquida (sem taxa de embarque). Se o percentual for muito baixo, use o piso mínimo."
      >
        <div className="mb-3">
          <ToggleGroup<DuRavTipo>
            value={draft.duRavTipo}
            options={Object.entries(DU_RAV_TIPO_LABEL).map(([value, label]) => ({ value: value as DuRavTipo, label }))}
            onChange={(v) => set("duRavTipo", v)}
          />
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {draft.duRavTipo === "PERCENTUAL" ? (
            <>
              <PercentField label="Percentual" value={draft.duRavValor} onChange={(n) => set("duRavValor", n)} />
              <MoneyField label="Piso mínimo" value={draft.duRavPisoMinimo} onChange={(n) => set("duRavPisoMinimo", n)} />
            </>
          ) : (
            <MoneyField label="Valor fixo" value={draft.duRavValor} onChange={(n) => set("duRavValor", n)} />
          )}
        </div>
      </FinanceiroSection>

      <FinanceiroSection
        title="2. Fee de Serviço / Taxa de Agenciamento (Consultoria)"
        description="Valor fixo pra cobrir o custo operacional do atendimento — diferencia voo nacional de internacional."
      >
        <div className="mb-3">
          <ToggleGroup<FeeServicoModo>
            value={draft.feeServicoModo}
            options={Object.entries(FEE_SERVICO_MODO_LABEL).map(([value, label]) => ({
              value: value as FeeServicoModo,
              label,
            }))}
            onChange={(v) => set("feeServicoModo", v)}
          />
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <MoneyField label="Voo nacional" value={draft.feeServicoNacional} onChange={(n) => set("feeServicoNacional", n)} />
          <MoneyField
            label="Voo internacional"
            value={draft.feeServicoInternacional}
            onChange={(n) => set("feeServicoInternacional", n)}
          />
        </div>
      </FinanceiroSection>

      <FinanceiroSection
        title="3. Markup Adicional de Lucro"
        description="Percentual sobre a tarifa líquida pra embutir a margem de lucro líquida da agência."
      >
        <PercentField label="Markup" value={draft.markupPercent} onChange={(n) => set("markupPercent", n)} />
      </FinanceiroSection>

      <FinanceiroSection
        title="4. Repasse de Custo de Parcelamento / Gateway"
        description="Percentual sobre o valor total da venda — cobrado só quando o cliente paga no cartão da própria agência (em vez do cartão dele direto na cia aérea), pra cobrir a taxa de antecipação/split."
      >
        <PercentField label="Repasse" value={draft.gatewayPercent} onChange={(n) => set("gatewayPercent", n)} />
      </FinanceiroSection>

      <FinanceiroSection
        title="5. Margem de Imposto Retido (Simples Nacional / Lucro Presumido)"
        description="Percentual aplicado só sobre a soma das taxas da agência (Markup + DU/RAV + Fee) — nunca sobre o valor total do bilhete aéreo, já que a agência tributa só a intermediação."
      >
        <PercentField label="Imposto retido" value={draft.impostoRetidoPercent} onChange={(n) => set("impostoRetidoPercent", n)} />
      </FinanceiroSection>

      <FinanceiroSimulador rules={draft} />

      <div className="sticky bottom-4 flex justify-end">
        <button
          type="button"
          onClick={handleSave}
          disabled={!isDirty}
          className="flex items-center gap-1.5 rounded-lg bg-teal-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg hover:bg-teal-700 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none"
        >
          <Save className="h-4 w-4" /> {isDirty ? "Salvar alterações do perfil" : "Tudo salvo"}
        </button>
      </div>
    </>
  );
}

/** Aba Financeiro — lista de perfis de cobrança (ex: "Nacional",
 * "Internacional"), cada um com seu próprio conjunto de regras. A cotação
 * escolhe qual perfil usar (ver QuoteExtrasForm > Tipo de cobrança). */
function FinanceiroTab() {
  const { pricingProfiles, createPricingProfile, updatePricingProfile, deletePricingProfile } = useAppData();
  const [selectedId, setSelectedId] = useState<string | null>(pricingProfiles[0]?.id ?? null);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");

  const selected = pricingProfiles.find((p) => p.id === selectedId) ?? pricingProfiles[0] ?? null;

  const handleCreate = () => {
    const nome = newName.trim();
    if (!nome) return;
    const profile = createPricingProfile({ nome, ...defaultPricingRules });
    setSelectedId(profile.id);
    setNewName("");
    setCreating(false);
    toast.success(`Perfil "${nome}" criado.`);
  };

  const handleDelete = (id: string) => {
    const profile = pricingProfiles.find((p) => p.id === id);
    if (!profile) return;
    if (!window.confirm(`Excluir o perfil "${profile.nome}"? Cotações que usam esse perfil ficarão sem perfil.`)) return;
    deletePricingProfile(id);
    setSelectedId((prev) => (prev === id ? null : prev));
    toast.success("Perfil excluído.");
  };

  return (
    <>
      <div className="flex flex-wrap items-center gap-2">
        {pricingProfiles.map((profile) => (
          <button
            key={profile.id}
            type="button"
            onClick={() => setSelectedId(profile.id)}
            className={`rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-colors ${
              selected?.id === profile.id
                ? "border-teal-600 bg-teal-600 text-white"
                : "border-slate-300 bg-white text-slate-600 hover:border-slate-400"
            }`}
          >
            {profile.nome}
          </button>
        ))}

        {creating ? (
          <div className="flex items-center gap-1.5 rounded-full border border-teal-300 bg-teal-50/60 py-1 pl-3 pr-1">
            <input
              autoFocus
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleCreate();
                if (e.key === "Escape") {
                  setCreating(false);
                  setNewName("");
                }
              }}
              placeholder="Nome do perfil"
              className="w-32 bg-transparent text-xs font-medium text-slate-800 outline-none placeholder:text-slate-400"
            />
            <button
              type="button"
              onClick={handleCreate}
              disabled={!newName.trim()}
              className="rounded-full bg-teal-600 p-1 text-white disabled:opacity-40"
            >
              <Check className="h-3 w-3" />
            </button>
            <button
              type="button"
              onClick={() => {
                setCreating(false);
                setNewName("");
              }}
              className="rounded-full p-1 text-slate-400 hover:text-slate-600"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setCreating(true)}
            className="flex items-center gap-1 rounded-full border border-dashed border-slate-300 px-3.5 py-1.5 text-xs font-semibold text-slate-500 hover:border-teal-400 hover:text-teal-700"
          >
            <Plus className="h-3.5 w-3.5" /> Novo perfil
          </button>
        )}
      </div>

      {selected ? (
        <PerfilEditor
          key={selected.id}
          profile={selected}
          onSave={(patch) => updatePricingProfile(selected.id, patch)}
          onDelete={() => handleDelete(selected.id)}
        />
      ) : (
        <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-sm text-slate-500">
          Nenhum perfil de cobrança ainda. Crie um perfil (ex: &quot;Nacional&quot;, &quot;Internacional&quot;) pra
          definir as taxas, o markup e os impostos aplicados nas cotações.
        </div>
      )}
    </>
  );
}

export default function ConfiguracoesPage() {
  const { agency, updateAgency, resetAgencyPdfColors, hydrated } = useAppData();
  const [tab, setTab] = useState<"agencia" | "identidade" | "financeiro">("agencia");
  const logoInputRef = useRef<HTMLInputElement>(null);
  const [logoDragOver, setLogoDragOver] = useState(false);
  const [cnpjLoading, setCnpjLoading] = useState(false);
  const [cnpjError, setCnpjError] = useState<string | null>(null);
  const [cnpjFound, setCnpjFound] = useState(false);
  const [isExtractingColors, setIsExtractingColors] = useState(false);

  const set = <K extends keyof typeof agency>(key: K, value: (typeof agency)[K]) =>
    updateAgency({ [key]: value });

  const extractColorsFromLogo = async (logoBase64: string) => {
    if (!logoBase64) {
      toast.error("Adicione uma logo antes de extrair as cores.");
      return;
    }
    setIsExtractingColors(true);
    try {
      const res = await fetch("/api/extract-colors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: logoBase64 }),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) {
        throw new Error(json.error || "Falha ao extrair cores.");
      }

      const { corPrimaria, corSecundaria, corTerciaria } = json.data;

      // Atualiza automaticamente as cores do PDF e página
      updateAgency({
        pdfCorPrimaria: corPrimaria,
        pdfCorSecundaria: corSecundaria,
        pdfCorTexto: corTerciaria,
      });

      toast.success("Cores da marca extraídas da logo com sucesso! 🎨");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erro ao analisar cores da logo.";
      toast.error(msg);
    } finally {
      setIsExtractingColors(false);
    }
  };

  const handleLogoFile = (file: File) => {
    if (!file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      set("logoDataUrl", base64);
      toast.success("Logo carregada.");
      // Aciona a IA para extrair as cores da logo automaticamente
      extractColorsFromLogo(base64);
    };
    reader.readAsDataURL(file);
  };

  const handleCnpjSearch = async () => {
    const digits = agency.cnpj.replace(/\D/g, "");
    if (digits.length !== 14) {
      setCnpjError("Informe os 14 dígitos do CNPJ.");
      setCnpjFound(false);
      return;
    }
    setCnpjLoading(true);
    setCnpjError(null);
    setCnpjFound(false);
    try {
      const res = await fetch(`/api/cnpj?cnpj=${digits}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Falha ao consultar CNPJ.");
      updateAgency({
        agencyName: data.agencyName || agency.agencyName,
        branch: data.branch || agency.branch,
        phone: data.phone || agency.phone,
      });
      setCnpjFound(true);
      toast.success("Dados do CNPJ encontrados e preenchidos.");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erro desconhecido.";
      setCnpjError(message);
      toast.error(message);
    } finally {
      setCnpjLoading(false);
    }
  };

  if (!hydrated) {
    return <LoadingState />;
  }

  return (
    <div>
      <PageHeader
        title="Configurações"
        description="Dados da agência, vendedor padrão, numeração de orçamento, identidade visual do PDF e regras financeiras."
      />

      <div className="w-full px-4 pt-6 sm:px-6 lg:px-8">
        <div className="mb-6 inline-flex gap-1 rounded-xl bg-slate-100 p-1 shadow-xs">
          <button
            type="button"
            onClick={() => setTab("agencia")}
            className={`flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-xs font-semibold transition-colors cursor-pointer ${
              tab === "agencia" ? "bg-white text-teal-700 shadow-sm" : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <Building2 className="h-3.5 w-3.5" /> Agência
          </button>
          <button
            type="button"
            onClick={() => setTab("identidade")}
            className={`flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-xs font-semibold transition-colors cursor-pointer ${
              tab === "identidade" ? "bg-white text-[#5E17EB] shadow-sm" : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <Palette className="h-3.5 w-3.5" /> Identidade Visual & Prévia
          </button>
          <button
            type="button"
            onClick={() => setTab("financeiro")}
            className={`flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-xs font-semibold transition-colors cursor-pointer ${
              tab === "financeiro" ? "bg-white text-teal-700 shadow-sm" : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <Banknote className="h-3.5 w-3.5" /> Financeiro
          </button>
        </div>
      </div>

      <div className="w-full flex flex-col gap-6 px-4 pb-12 sm:px-6 lg:px-8">
        {tab === "agencia" ? (
          <>
            {/* Identificação da agência */}
            <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <h2 className="mb-3 text-sm font-semibold text-slate-700">Dados da agência</h2>

              <div className="mb-4 flex items-center gap-3">
                <input
                  ref={logoInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleLogoFile(file);
                  }}
                />
                <div
                  onClick={() => logoInputRef.current?.click()}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setLogoDragOver(true);
                  }}
                  onDragLeave={() => setLogoDragOver(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setLogoDragOver(false);
                    const file = e.dataTransfer.files?.[0];
                    if (file) handleLogoFile(file);
                  }}
                  className={`flex h-14 w-28 cursor-pointer items-center justify-center overflow-hidden rounded-lg border transition-colors ${
                    logoDragOver ? "border-teal-500 bg-teal-50" : "border-dashed border-slate-300 hover:border-slate-400"
                  }`}
                  title="Clique ou arraste uma imagem para usar como logo"
                >
                  {agency.logoDataUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={agency.logoDataUrl} alt="Logo da agência" className="h-full w-full object-contain p-1" />
                  ) : (
                    <span className="px-1 text-center text-[10px] font-semibold text-slate-400">Arraste ou clique</span>
                  )}
                </div>
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => logoInputRef.current?.click()}
                      className="flex items-center gap-1 rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 transition cursor-pointer"
                    >
                      <ImagePlus className="h-3.5 w-3.5" /> {agency.logoDataUrl ? "Trocar logo" : "Adicionar logo"}
                    </button>

                    {agency.logoDataUrl ? (
                      <button
                        type="button"
                        onClick={() => extractColorsFromLogo(agency.logoDataUrl)}
                        disabled={isExtractingColors}
                        className="flex items-center gap-1 rounded-lg border border-purple-200 bg-purple-50 px-2.5 py-1.5 text-xs font-semibold text-[#5E17EB] hover:bg-purple-100 transition cursor-pointer disabled:opacity-50"
                        title="Reanalisar a logo e extrair até 3 cores automaticamente com IA"
                      >
                        {isExtractingColors ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Sparkles className="h-3.5 w-3.5" />
                        )}
                        Extrair cores com IA
                      </button>
                    ) : null}

                    {agency.logoDataUrl ? (
                      <button
                        type="button"
                        onClick={() => set("logoDataUrl", "")}
                        className="flex items-center gap-1 text-xs text-slate-400 hover:text-red-600 transition cursor-pointer"
                      >
                        <X className="h-3 w-3" /> Remover
                      </button>
                    ) : null}
                  </div>

                  {isExtractingColors && (
                    <div className="flex items-center gap-1.5 text-[11px] font-semibold text-purple-700 bg-purple-50 px-2.5 py-1 rounded-lg border border-purple-200 animate-pulse">
                      <Sparkles className="h-3.5 w-3.5 text-[#5E17EB]" />
                      IA analisando a logo e extraindo até 3 cores da marca...
                    </div>
                  )}
                </div>
              </div>

              <div className="mb-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="flex flex-col gap-1 text-xs font-medium text-slate-600">
                  CNPJ
                  <div className="flex gap-1.5">
                    <input
                      value={agency.cnpj}
                      placeholder="00.000.000/0000-00"
                      onChange={(e) => {
                        set("cnpj", formatCnpjMask(e.target.value));
                        setCnpjFound(false);
                        setCnpjError(null);
                      }}
                      onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleCnpjSearch())}
                      className="min-w-0 flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-800 focus:border-teal-500 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={handleCnpjSearch}
                      disabled={cnpjLoading}
                      title="Buscar dados pelo CNPJ"
                      className="flex shrink-0 items-center gap-1 rounded-lg border border-slate-300 px-2.5 text-xs font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50"
                    >
                      {cnpjLoading ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : cnpjFound ? (
                        <Check className="h-3.5 w-3.5 text-teal-600" />
                      ) : (
                        <Search className="h-3.5 w-3.5" />
                      )}
                      Buscar
                    </button>
                  </div>
                  {cnpjError ? <span className="text-[11px] font-normal text-red-600">{cnpjError}</span> : null}
                </div>
                <Field label="Cadastur" value={agency.cadastur} onChange={(v) => set("cadastur", v)} placeholder="00.000000.00-0" />
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <Field label="Nome da agência" value={agency.agencyName} onChange={(v) => set("agencyName", v)} />
                <Field label="Filial / Endereço" value={agency.branch} onChange={(v) => set("branch", v)} />
                <Field label="Site" value={agency.site} onChange={(v) => set("site", v)} placeholder="https://" />
              </div>
            </section>

            {/* Vendedor padrão */}
            <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <h2 className="mb-1 text-sm font-semibold text-slate-700">Vendedor(a) padrão</h2>
              <p className="mb-3 text-xs text-slate-500">Pré-preenche cotações novas — pode ser ajustado por cotação.</p>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <Field label="Nome" value={agency.sellerName} onChange={(v) => set("sellerName", v)} />
                <Field label="E-mail" value={agency.email} onChange={(v) => set("email", v)} />
                <Field label="Telefone" value={agency.phone} onChange={(v) => set("phone", v)} />
              </div>
            </section>

            {/* Numeração */}
            <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <h2 className="mb-3 text-sm font-semibold text-slate-700">Numeração de orçamento</h2>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <Field label="Prefixo" value={agency.orcamentoPrefixo} onChange={(v) => set("orcamentoPrefixo", v || "ORC")} />
                <Field
                  label="Próximo número"
                  type="number"
                  value={agency.proximoOrcamentoNumero}
                  onChange={(v) => set("proximoOrcamentoNumero", Math.max(1, Number(v) || 1))}
                />
              </div>
              <p className="mt-2 text-[11px] text-slate-400">
                Próxima cotação sairá como{" "}
                <span className="font-mono font-semibold text-slate-600">
                  {agency.orcamentoPrefixo}-{new Date().getFullYear()}-
                  {String(agency.proximoOrcamentoNumero).padStart(6, "0")}
                </span>
              </p>
            </section>

            {/* Atalho para Identidade Visual e Prévia */}
            <section className="rounded-2xl border border-purple-200 bg-gradient-to-r from-purple-50 via-indigo-50/60 to-white p-5 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Palette className="h-5 w-5 text-[#5E17EB]" />
                    <h2 className="text-sm font-bold text-slate-900">Identidade Visual & Modo de Visualização</h2>
                  </div>
                  <p className="text-xs text-slate-600">
                    Personalize as cores do PDF, da proposta comercial e do voucher de reserva em tempo real.
                  </p>
                  <div className="flex items-center gap-2 pt-1">
                    <span className="text-[11px] font-semibold text-slate-500">Cores ativas:</span>
                    <span
                      className="h-3.5 w-3.5 rounded-full border border-white shadow-xs"
                      style={{ backgroundColor: agency.pdfCorPrimaria || "#5E17EB" }}
                      title="Cor Primária"
                    />
                    <span
                      className="h-3.5 w-3.5 rounded-full border border-white shadow-xs"
                      style={{ backgroundColor: agency.pdfCorSecundaria || "#00875A" }}
                      title="Cor Secundária"
                    />
                    <span
                      className="h-3.5 w-3.5 rounded-full border border-white shadow-xs"
                      style={{ backgroundColor: agency.pdfCorTexto || "#1E1B4B" }}
                      title="Cor do Texto"
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setTab("identidade")}
                  className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#5E17EB] px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-[#4d12c4] transition cursor-pointer shrink-0"
                >
                  <Sparkles className="h-4 w-4" /> Personalizar Cores & Prévia ➔
                </button>
              </div>
            </section>
          </>
        ) : tab === "identidade" ? (
          <IdentidadeVisualSection
            agencyName={agency.agencyName}
            logoDataUrl={agency.logoDataUrl}
            primaryColor={agency.pdfCorPrimaria}
            secondaryColor={agency.pdfCorSecundaria}
            textColor={agency.pdfCorTexto}
            useAgencyLogo={agency.pdfUsarLogoAgencia}
            onUpdateColors={(colors) => updateAgency(colors)}
            onResetColors={() => {
              resetAgencyPdfColors();
              toast.success("Cores restauradas para o padrão.");
            }}
            isExtractingColors={isExtractingColors}
            onExtractColors={() => extractColorsFromLogo(agency.logoDataUrl)}
          />
        ) : (
          <FinanceiroTab />
        )}
      </div>
    </div>
  );
}
