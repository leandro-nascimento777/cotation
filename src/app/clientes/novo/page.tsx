"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useAppData } from "@/lib/store/AppDataContext";
import { ClientForm, ClientFormErrors } from "@/components/clientes/ClientForm";
import { clientSchema } from "@/lib/validation/schemas";
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
  const [errors, setErrors] = useState<ClientFormErrors>({});

  const handleSave = () => {
    const result = clientSchema.safeParse(draft);
    if (!result.success) {
      const fieldErrors: ClientFormErrors = {};
      for (const issue of result.error.issues) {
        const path = issue.path[0] as keyof ClientDraft;
        if (path && !fieldErrors[path]) {
          fieldErrors[path] = issue.message;
        }
      }
      setErrors(fieldErrors);
      toast.error("Corrija os campos com erro antes de salvar.");
      return;
    }

    setErrors({});
    const client = createClient(draft);
    toast.success("Cliente cadastrado com sucesso.");
    router.push(`/clientes/${client.id}`);
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:16px_16px] py-6 sm:py-8 px-4 sm:px-6 lg:px-8">
      <div className="w-full space-y-6">
        <div className="flex items-center justify-between">
          <Link
            href="/clientes"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition cursor-pointer"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Voltar para clientes
          </Link>
        </div>

        <div className="rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-sm space-y-5">
          <div className="border-b border-slate-100 pb-3">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Cadastrar Novo Cliente</h1>
            <p className="text-xs text-slate-500">Preencha os dados do titular para vincular às propostas e emitir vouchers.</p>
          </div>

          <ClientForm draft={draft} onChange={setDraft} errors={errors} />

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
            <Link
              href="/clientes"
              className="rounded-xl border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition"
            >
              Cancelar
            </Link>
            <button
              type="button"
              onClick={handleSave}
              className="rounded-xl bg-[#1d82f5] hover:bg-blue-600 px-5 py-2 text-xs font-bold text-white shadow-sm transition active:scale-95 cursor-pointer"
            >
              Salvar cliente
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

