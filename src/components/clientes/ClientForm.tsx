"use client";

import { ClientDraft } from "@/lib/store/types";

interface ClientFormProps {
  draft: ClientDraft;
  onChange: (draft: ClientDraft) => void;
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
          rows={3}
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

export function ClientForm({ draft, onChange }: ClientFormProps) {
  const set = <K extends keyof ClientDraft>(key: K, value: ClientDraft[K]) =>
    onChange({ ...draft, [key]: value });

  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Field label="Nome completo" value={draft.nomeCompleto} onChange={(v) => set("nomeCompleto", v)} />
        <Field label="CPF (opcional)" value={draft.cpf} onChange={(v) => set("cpf", v)} placeholder="000.000.000-00" />
        <Field label="E-mail" value={draft.email} onChange={(v) => set("email", v)} />
        <Field label="Telefone / WhatsApp" value={draft.telefone} onChange={(v) => set("telefone", v)} />
        <Field label="Cidade" value={draft.cidade} onChange={(v) => set("cidade", v)} />
        <Field label="Endereço" value={draft.endereco} onChange={(v) => set("endereco", v)} />
      </div>
      <Field label="Observações" value={draft.observacoes} onChange={(v) => set("observacoes", v)} textarea />
    </div>
  );
}
