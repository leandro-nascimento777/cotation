"use client";

import { ClientDraft } from "@/lib/store/types";
import { formatCpf, formatPassport, formatPhoneWithDdi } from "@/lib/format";
import { FormField, FormTextarea } from "@/components/ui/FormField";

export type ClientFormErrors = Partial<Record<keyof ClientDraft, string>>;

interface ClientFormProps {
  draft: ClientDraft;
  onChange: (draft: ClientDraft) => void;
  errors?: ClientFormErrors;
}

export const ClientForm = ({ draft, onChange, errors }: ClientFormProps) => {
  const set = <K extends keyof ClientDraft>(key: K, value: ClientDraft[K]) =>
    onChange({ ...draft, [key]: value });

  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <FormField
          label="Nome completo"
          required
          value={draft.nomeCompleto}
          error={errors?.nomeCompleto}
          onChange={(v) => set("nomeCompleto", v)}
        />
        <FormField
          label="CPF (opcional)"
          value={draft.cpf}
          error={errors?.cpf}
          onChange={(v) => set("cpf", formatCpf(v))}
          placeholder="000.000.000-00"
        />
        <FormField
          label="Passaporte (opcional)"
          value={draft.passaporte || ""}
          error={errors?.passaporte}
          onChange={(v) => set("passaporte", formatPassport(v))}
          placeholder="Ex: N02978256"
        />
        <FormField
          label="E-mail"
          type="email"
          value={draft.email}
          error={errors?.email}
          onChange={(v) => set("email", v)}
        />
        <FormField
          label="Telefone / WhatsApp"
          type="tel"
          value={draft.telefone}
          error={errors?.telefone}
          onChange={(v) => set("telefone", formatPhoneWithDdi(v))}
          placeholder="+55 (11) 98723-8273"
        />
        <FormField
          label="Cidade"
          value={draft.cidade}
          error={errors?.cidade}
          onChange={(v) => set("cidade", v)}
        />
        <FormField
          label="Endereço"
          value={draft.endereco}
          error={errors?.endereco}
          onChange={(v) => set("endereco", v)}
        />
      </div>
      <FormTextarea
        label="Observações"
        value={draft.observacoes}
        error={errors?.observacoes}
        onChange={(v) => set("observacoes", v)}
        rows={3}
      />
    </div>
  );
};


