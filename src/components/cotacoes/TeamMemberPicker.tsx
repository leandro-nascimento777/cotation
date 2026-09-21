"use client";

import { useState } from "react";
import { useAppData } from "@/lib/store/AppDataContext";
import { FormField } from "@/components/ui/FormField";
import { TeamMemberDraft } from "@/lib/store/types";
import { Plus, X } from "lucide-react";

const EMPTY_DRAFT: TeamMemberDraft = { nome: "", cargo: "", email: "", telefone: "", ativo: true };

interface TeamMemberPickerProps {
  memberId: string | null;
  onSelect: (member: { id: string; nome: string; email: string; telefone: string } | null) => void;
}

export const TeamMemberPicker = ({ memberId, onSelect }: TeamMemberPickerProps) => {
  const { teamMembers, createTeamMember } = useAppData();
  const [creating, setCreating] = useState(false);
  const [draft, setDraft] = useState<TeamMemberDraft>(EMPTY_DRAFT);

  const handleCreate = () => {
    if (!draft.nome.trim()) return;
    const member = createTeamMember(draft);
    onSelect(member);
    setDraft(EMPTY_DRAFT);
    setCreating(false);
  };

  if (creating) {
    return (
      <div className="rounded-lg border border-teal-200 bg-teal-50/40 p-3">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-xs font-semibold text-teal-700">Nova pessoa na equipe</span>
          <button type="button" onClick={() => setCreating(false)} className="text-slate-400 hover:text-slate-600">
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          <FormField
            label="Nome"
            value={draft.nome}
            onChange={(v) => setDraft({ ...draft, nome: v })}
            placeholder="Nome"
          />
          <FormField
            label="Cargo"
            value={draft.cargo}
            onChange={(v) => setDraft({ ...draft, cargo: v })}
            placeholder="Cargo"
          />
        </div>
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
        value={memberId || ""}
        onChange={(e) => {
          const member = teamMembers.find((m) => m.id === e.target.value);
          onSelect(member || null);
        }}
        className="min-w-0 flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-800 focus:border-teal-500 focus:outline-none"
      >
        <option value="">Sem responsável definido</option>
        {teamMembers.map((m) => (
          <option key={m.id} value={m.id}>
            {m.nome}
            {m.cargo ? ` — ${m.cargo}` : ""}
          </option>
        ))}
      </select>
      <button
        type="button"
        onClick={() => setCreating(true)}
        className="flex shrink-0 items-center gap-1 rounded-lg border border-slate-300 px-2.5 text-xs font-medium text-slate-600 hover:bg-slate-50"
      >
        <Plus className="h-3.5 w-3.5" /> Nova
      </button>
    </div>
  );
};
