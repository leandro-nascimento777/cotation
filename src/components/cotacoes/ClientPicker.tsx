"use client";

import { useState } from "react";
import { useAppData } from "@/lib/store/AppDataContext";
import { ClientForm } from "@/components/clientes/ClientForm";
import { ClientDraft } from "@/lib/store/types";
import { Plus, X } from "lucide-react";

const EMPTY_DRAFT: ClientDraft = {
  nomeCompleto: "",
  cpf: "",
  email: "",
  telefone: "",
  endereco: "",
  cidade: "",
  observacoes: "",
};

interface ClientPickerProps {
  clientId: string | null;
  onChange: (clientId: string | null) => void;
}

export function ClientPicker({ clientId, onChange }: ClientPickerProps) {
  const { clients, createClient } = useAppData();
  const [creating, setCreating] = useState(false);
  const [draft, setDraft] = useState<ClientDraft>(EMPTY_DRAFT);

  const handleCreate = () => {
    if (!draft.nomeCompleto.trim()) return;
    const client = createClient(draft);
    onChange(client.id);
    setDraft(EMPTY_DRAFT);
    setCreating(false);
  };

  if (creating) {
    return (
      <div className="rounded-lg border border-teal-200 bg-teal-50/40 p-3">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-xs font-semibold text-teal-700">Novo cliente</span>
          <button type="button" onClick={() => setCreating(false)} className="text-slate-400 hover:text-slate-600">
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
        <ClientForm draft={draft} onChange={setDraft} />
        <button
          type="button"
          onClick={handleCreate}
          className="mt-2 rounded-lg bg-teal-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-teal-700"
        >
          Salvar e vincular
        </button>
      </div>
    );
  }

  return (
    <div className="flex gap-1.5">
      <select
        value={clientId || ""}
        onChange={(e) => onChange(e.target.value || null)}
        className="min-w-0 flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-800 focus:border-teal-500 focus:outline-none"
      >
        <option value="">Sem cliente vinculado</option>
        {clients.map((c) => (
          <option key={c.id} value={c.id}>
            {c.nomeCompleto}
          </option>
        ))}
      </select>
      <button
        type="button"
        onClick={() => setCreating(true)}
        className="flex shrink-0 items-center gap-1 rounded-lg border border-slate-300 px-2.5 text-xs font-medium text-slate-600 hover:bg-slate-50"
      >
        <Plus className="h-3.5 w-3.5" /> Novo
      </button>
    </div>
  );
}
