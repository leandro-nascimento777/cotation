"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useAppData } from "@/lib/store/AppDataContext";
import { ClientForm } from "@/components/clientes/ClientForm";
import { PageHeader } from "@/components/shell/PageHeader";
import { ClientDraft } from "@/lib/store/types";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

const EMPTY_DRAFT: ClientDraft = {
  nomeCompleto: "",
  cpf: "",
  email: "",
  telefone: "",
  endereco: "",
  cidade: "",
  observacoes: "",
};

export default function NovoClientePage() {
  const { createClient } = useAppData();
  const router = useRouter();
  const [draft, setDraft] = useState<ClientDraft>(EMPTY_DRAFT);

  const handleSave = () => {
    if (!draft.nomeCompleto.trim()) {
      toast.error("Informe o nome do cliente.");
      return;
    }
    const client = createClient(draft);
    toast.success("Cliente cadastrado.");
    router.push(`/clientes/${client.id}`);
  };

  return (
    <div>
      <PageHeader
        title="Novo cliente"
        action={
          <Link href="/clientes" className="flex items-center gap-1 text-sm font-medium text-slate-500 hover:text-slate-700">
            <ArrowLeft className="h-4 w-4" /> Voltar
          </Link>
        }
      />
      <div className="mx-auto max-w-2xl px-4 py-6 sm:px-6">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <ClientForm draft={draft} onChange={setDraft} />
          <div className="mt-4 flex justify-end">
            <button
              type="button"
              onClick={handleSave}
              className="rounded-lg bg-teal-600 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-700"
            >
              Salvar cliente
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
