"use client";

import { useRef, useState } from "react";
import { toast } from "sonner";
import { useAppData } from "@/lib/store/AppDataContext";
import { formatCnpjMask } from "@/lib/format";
import { PageHeader } from "@/components/shell/PageHeader";
import {
  Check,
  ImagePlus,
  Loader2,
  Palette,
  RotateCcw,
  Search,
  X,
} from "lucide-react";

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string;
  value: string | number;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <label className="flex flex-col gap-1 text-xs font-medium text-slate-600">
      {label}
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-800 focus:border-teal-500 focus:outline-none"
      />
    </label>
  );
}

function ColorField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="flex flex-col gap-1 text-xs font-medium text-slate-600">
      {label}
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={value || "#ffffff"}
          onChange={(e) => onChange(e.target.value)}
          className="h-9 w-9 shrink-0 cursor-pointer rounded border border-slate-300 bg-white p-0.5"
        />
        <input
          value={value}
          placeholder="padrão do sistema"
          onChange={(e) => onChange(e.target.value)}
          className="min-w-0 flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-800 focus:border-teal-500 focus:outline-none"
        />
      </div>
    </label>
  );
}

export default function ConfiguracoesPage() {
  const { agency, updateAgency, resetAgencyPdfColors, hydrated } = useAppData();
  const logoInputRef = useRef<HTMLInputElement>(null);
  const [logoDragOver, setLogoDragOver] = useState(false);
  const [cnpjLoading, setCnpjLoading] = useState(false);
  const [cnpjError, setCnpjError] = useState<string | null>(null);
  const [cnpjFound, setCnpjFound] = useState(false);

  const set = <K extends keyof typeof agency>(key: K, value: (typeof agency)[K]) =>
    updateAgency({ [key]: value });

  const handleLogoFile = (file: File) => {
    if (!file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = () => {
      set("logoDataUrl", reader.result as string);
      toast.success("Logo atualizada.");
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
    return (
      <div className="flex h-full items-center justify-center py-24 text-sm text-slate-400">
        Carregando…
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Configurações"
        description="Dados da agência, vendedor padrão, numeração de orçamento e identidade visual do PDF."
      />

      <div className="mx-auto flex max-w-3xl flex-col gap-6 px-4 py-6 sm:px-6">
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
            <div className="flex flex-col gap-1">
              <button
                type="button"
                onClick={() => logoInputRef.current?.click()}
                className="flex items-center gap-1 rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50"
              >
                <ImagePlus className="h-3.5 w-3.5" /> {agency.logoDataUrl ? "Trocar logo" : "Adicionar logo"}
              </button>
              {agency.logoDataUrl ? (
                <button
                  type="button"
                  onClick={() => set("logoDataUrl", "")}
                  className="flex items-center gap-1 text-xs text-slate-400 hover:text-red-600"
                >
                  <X className="h-3 w-3" /> Remover
                </button>
              ) : null}
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

        {/* Identidade visual do PDF */}
        <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Palette className="h-4 w-4 text-slate-500" />
              <h2 className="text-sm font-semibold text-slate-700">Identidade visual do PDF</h2>
            </div>
            <button
              type="button"
              onClick={() => {
                resetAgencyPdfColors();
                toast.success("Cores restauradas para o padrão do sistema.");
              }}
              className="flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-slate-700"
            >
              <RotateCcw className="h-3.5 w-3.5" /> Usar padrão do sistema
            </button>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <ColorField label="Cor primária (títulos)" value={agency.pdfCorPrimaria} onChange={(v) => set("pdfCorPrimaria", v)} />
            <ColorField label="Cor secundária (destaque)" value={agency.pdfCorSecundaria} onChange={(v) => set("pdfCorSecundaria", v)} />
            <ColorField label="Cor do texto" value={agency.pdfCorTexto} onChange={(v) => set("pdfCorTexto", v)} />
          </div>
          <label className="mt-3 flex items-center gap-2 text-xs font-medium text-slate-600">
            <input
              type="checkbox"
              checked={agency.pdfUsarLogoAgencia}
              onChange={(e) => set("pdfUsarLogoAgencia", e.target.checked)}
              className="h-4 w-4 accent-teal-600"
            />
            Usar a logo da agência no PDF (desmarque para usar o placeholder padrão)
          </label>
        </section>
      </div>
    </div>
  );
}
