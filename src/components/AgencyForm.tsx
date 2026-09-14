"use client";

import { useRef } from "react";
import { AgencyInfo } from "@/lib/types";
import { ImagePlus, X } from "lucide-react";

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

  const handleLogoFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => set("logoDataUrl", reader.result as string);
    reader.readAsDataURL(file);
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
        {agency.logoDataUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={agency.logoDataUrl}
            alt="Logo da agência"
            className="h-14 w-28 rounded-lg border border-slate-200 object-contain p-1"
          />
        ) : (
          <div className="flex h-14 w-28 items-center justify-center rounded-lg border border-dashed border-slate-300 text-[10px] font-semibold text-slate-400">
            LOGO
          </div>
        )}
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

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Field label="Nome da agência" value={agency.agencyName} onChange={(v) => set("agencyName", v)} />
        <Field label="Filial / Endereço" value={agency.branch} onChange={(v) => set("branch", v)} />
        <Field label="Vendedor(a)" value={agency.sellerName} onChange={(v) => set("sellerName", v)} />
        <Field label="Telefone" value={agency.phone} onChange={(v) => set("phone", v)} />
        <Field label="E-mail" value={agency.email} onChange={(v) => set("email", v)} />
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
