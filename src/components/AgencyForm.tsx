"use client";

import { useRef, useState } from "react";
import { AgencyInfo } from "@/lib/types";
import { formatCnpjMask } from "@/lib/format";
import { Check, ImagePlus, Loader2, Search, X } from "lucide-react";

interface AgencyFormProps {
  agency: AgencyInfo;
  onChange: (agency: AgencyInfo) => void;
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  textarea,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
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
          value={value}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-800 focus:border-teal-500 focus:outline-none"
        />
      )}
    </label>
  );
}

export function AgencyForm({ agency, onChange }: AgencyFormProps) {
  const set = <K extends keyof AgencyInfo>(key: K, value: AgencyInfo[K]) =>
    onChange({ ...agency, [key]: value });
  const logoInputRef = useRef<HTMLInputElement>(null);
  const [logoDragOver, setLogoDragOver] = useState(false);
  const [cnpjLoading, setCnpjLoading] = useState(false);
  const [cnpjError, setCnpjError] = useState<string | null>(null);
  const [cnpjFound, setCnpjFound] = useState(false);

  const handleLogoFile = (file: File) => {
    if (!file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = () => set("logoDataUrl", reader.result as string);
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
      onChange({
        ...agency,
        agencyName: data.agencyName || agency.agencyName,
        branch: data.branch || agency.branch,
        phone: data.phone || agency.phone,
      });
      setCnpjFound(true);
    } catch (err) {
      setCnpjError(err instanceof Error ? err.message : "Erro desconhecido.");
    } finally {
      setCnpjLoading(false);
    }
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <h2 className="mb-3 text-sm font-semibold text-slate-700">Dados da agência</h2>

      <div className="mb-3 flex items-center gap-3">
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
            logoDragOver
              ? "border-teal-500 bg-teal-50"
              : "border-dashed border-slate-300 hover:border-slate-400"
          }`}
          title="Clique ou arraste uma imagem para usar como logo"
        >
          {agency.logoDataUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={agency.logoDataUrl}
              alt="Logo da agência"
              className="h-full w-full object-contain p-1"
            />
          ) : (
            <span className="px-1 text-center text-[10px] font-semibold text-slate-400">
              Arraste ou clique
            </span>
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
          {cnpjFound && !cnpjError ? (
            <span className="text-[11px] font-normal text-teal-600">Dados encontrados e preenchidos abaixo.</span>
          ) : null}
        </div>
        <Field label="Cadastur" value={agency.cadastur} onChange={(v) => set("cadastur", v)} placeholder="00.000000.00-0" />
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Field label="Nome da agência" value={agency.agencyName} onChange={(v) => set("agencyName", v)} />
        <Field label="Filial / Endereço" value={agency.branch} onChange={(v) => set("branch", v)} />
        <Field label="Vendedor(a)" value={agency.sellerName} onChange={(v) => set("sellerName", v)} />
        <Field label="Telefone" value={agency.phone} onChange={(v) => set("phone", v)} />
        <Field label="E-mail" value={agency.email} onChange={(v) => set("email", v)} />
        <label className="flex flex-col gap-1 text-xs font-medium text-slate-600">
          Validade da cotação (dias)
          <input
            type="number"
            min={1}
            max={30}
            value={agency.validityDays}
            onChange={(e) => set("validityDays", Math.max(1, Number(e.target.value) || 1))}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-800 focus:border-teal-500 focus:outline-none"
          />
        </label>
      </div>
      <div className="mt-3 grid grid-cols-1 gap-3">
        <Field
          label="Mensagem de destaque"
          value={agency.message}
          onChange={(v) => set("message", v)}
          textarea
        />
        <Field
          label="Observações importantes"
          value={agency.notes}
          onChange={(v) => set("notes", v)}
          textarea
        />
      </div>
    </div>
  );
}
