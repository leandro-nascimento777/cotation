"use client";

import { AgencyInfo } from "@/lib/types";

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

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <h2 className="mb-3 text-sm font-semibold text-slate-700">Dados da agência</h2>
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
