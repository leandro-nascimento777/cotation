"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useAppData } from "@/lib/store/AppDataContext";
import { PageHeader } from "@/components/shell/PageHeader";
import { EmptyState } from "@/components/shell/EmptyState";
import { LoadingState } from "@/components/shell/LoadingState";
import { FormField } from "@/components/ui/FormField";
import { teamMemberSchema } from "@/lib/validation/schemas";
import { TeamMemberDraft } from "@/lib/store/types";
import { Pencil, Plus, Trash2, UserCog } from "lucide-react";

const EMPTY_DRAFT: TeamMemberDraft = {
  nome: "",
  cargo: "",
  email: "",
  telefone: "",
  ativo: true,
};

type MemberFormErrors = Partial<Record<keyof TeamMemberDraft, string>>;

interface MemberFormProps {
  draft: TeamMemberDraft;
  onChange: (draft: TeamMemberDraft) => void;
  onSave: () => void;
  onCancel: () => void;
  errors?: MemberFormErrors;
}

const MemberForm = ({ draft, onChange, onSave, onCancel, errors }: MemberFormProps) => {
  const set = <K extends keyof TeamMemberDraft>(key: K, value: TeamMemberDraft[K]) =>
    onChange({ ...draft, [key]: value });

  return (
    <div className="rounded-xl border border-teal-200 bg-teal-50/40 p-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <FormField
          label="Nome"
          required
          value={draft.nome}
          error={errors?.nome}
          onChange={(v) => set("nome", v)}
        />
        <FormField
          label="Cargo"
          value={draft.cargo}
          error={errors?.cargo}
          onChange={(v) => set("cargo", v)}
          placeholder="Ex: Vendedor(a), Gerente"
        />
        <FormField
          label="E-mail"
          type="email"
          value={draft.email}
          error={errors?.email}
          onChange={(v) => set("email", v)}
        />
        <FormField
          label="Telefone"
          type="tel"
          value={draft.telefone}
          error={errors?.telefone}
          onChange={(v) => set("telefone", v)}
        />
      </div>
      <div className="mt-3 flex gap-2">
        <button
          type="button"
          onClick={onSave}
          className="rounded-lg bg-teal-600 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-700"
        >
          Salvar
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
        >
          Cancelar
        </button>
      </div>
    </div>
  );
};

export default function EquipePage() {
  const { teamMembers, createTeamMember, updateTeamMember, deleteTeamMember, quotes, hydrated } = useAppData();
  const [adding, setAdding] = useState(false);
  const [addDraft, setAddDraft] = useState<TeamMemberDraft>(EMPTY_DRAFT);
  const [addErrors, setAddErrors] = useState<MemberFormErrors>({});
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState<TeamMemberDraft>(EMPTY_DRAFT);
  const [editErrors, setEditErrors] = useState<MemberFormErrors>({});

  const quoteCount = (memberId: string) => quotes.filter((q) => q.responsavelId === memberId).length;

  const handleAdd = () => {
    const result = teamMemberSchema.safeParse(addDraft);
    if (!result.success) {
      const fieldErrors: MemberFormErrors = {};
      for (const issue of result.error.issues) {
        const path = issue.path[0] as keyof TeamMemberDraft;
        if (path && !fieldErrors[path]) {
          fieldErrors[path] = issue.message;
        }
      }
      setAddErrors(fieldErrors);
      toast.error("Corrija os erros antes de adicionar.");
      return;
    }

    setAddErrors({});
    createTeamMember(addDraft);
    toast.success("Pessoa adicionada à equipe.");
    setAddDraft(EMPTY_DRAFT);
    setAdding(false);
  };

  const startEdit = (id: string, draft: TeamMemberDraft) => {
    setEditingId(id);
    setEditDraft(draft);
    setEditErrors({});
  };

  const handleSaveEdit = () => {
    if (!editingId) return;
    const result = teamMemberSchema.safeParse(editDraft);
    if (!result.success) {
      const fieldErrors: MemberFormErrors = {};
      for (const issue of result.error.issues) {
        const path = issue.path[0] as keyof TeamMemberDraft;
        if (path && !fieldErrors[path]) {
          fieldErrors[path] = issue.message;
        }
      }
      setEditErrors(fieldErrors);
      toast.error("Corrija os erros antes de salvar.");
      return;
    }

    setEditErrors({});
    updateTeamMember(editingId, editDraft);
    toast.success("Dados atualizados.");
    setEditingId(null);
  };

  const handleDelete = (id: string, nome: string) => {
    if (!confirm(`Remover "${nome}" da equipe? Isso não apaga as cotações já atribuídas a essa pessoa.`)) return;
    deleteTeamMember(id);
    toast.success("Pessoa removida da equipe.");
  };

  if (!hydrated) {
    return <LoadingState />;
  }

  return (
    <div>
      <PageHeader
        title="Equipe"
        description="Pessoas da agência que podem ficar responsáveis por cotações."
        action={
          !adding ? (
            <button
              type="button"
              onClick={() => setAdding(true)}
              className="flex items-center gap-1.5 rounded-lg bg-teal-600 px-3 py-2 text-sm font-semibold text-white hover:bg-teal-700"
            >
              <Plus className="h-4 w-4" /> Adicionar pessoa
            </button>
          ) : undefined
        }
      />

      <div className="w-full flex flex-col gap-4 px-4 py-6 sm:px-6 lg:px-8">
        {adding && (
          <MemberForm
            draft={addDraft}
            onChange={setAddDraft}
            onSave={handleAdd}
            errors={addErrors}
            onCancel={() => {
              setAdding(false);
              setAddDraft(EMPTY_DRAFT);
              setAddErrors({});
            }}
          />
        )}

        {teamMembers.length === 0 && !adding ? (
          <EmptyState
            icon={UserCog}
            title="Nenhuma pessoa cadastrada ainda"
            description="Adicione as pessoas da sua agência com seus cargos para poder atribuí-las como responsáveis pelas cotações."
            action={
              <button
                type="button"
                onClick={() => setAdding(true)}
                className="mt-2 flex items-center gap-1.5 rounded-lg bg-teal-600 px-3 py-2 text-sm font-semibold text-white hover:bg-teal-700"
              >
                <Plus className="h-4 w-4" /> Adicionar pessoa
              </button>
            }
          />
        ) : (
          <div className="flex flex-col gap-3">
            {teamMembers.map((member) =>
              editingId === member.id ? (
                <MemberForm
                  key={member.id}
                  draft={editDraft}
                  onChange={setEditDraft}
                  onSave={handleSaveEdit}
                  errors={editErrors}
                  onCancel={() => {
                    setEditingId(null);
                    setEditErrors({});
                  }}
                />
              ) : (
                <div
                  key={member.id}
                  className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
                >
                  <div>
                    <p className="text-sm font-semibold text-slate-800">{member.nome}</p>
                    <p className="text-xs text-slate-500">
                      {[member.cargo, member.email, member.telefone].filter(Boolean).join(" · ") || "—"}
                    </p>
                    <p className="mt-1 text-xs text-slate-400">
                      {quoteCount(member.id)} cotação(ões) como responsável
                    </p>
                  </div>
                  <div className="flex shrink-0 gap-1">
                    <button
                      type="button"
                      onClick={() => startEdit(member.id, { nome: member.nome, cargo: member.cargo, email: member.email, telefone: member.telefone, ativo: member.ativo })}
                      className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                      title="Editar"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(member.id, member.nome)}
                      className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600"
                      title="Remover"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )
            )}
          </div>
        )}
      </div>
    </div>
  );
}
