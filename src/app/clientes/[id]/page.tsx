"use client";

import { useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { useAppData } from "@/lib/store/AppDataContext";
import { ClientForm, ClientFormErrors } from "@/components/clientes/ClientForm";
import { ClientPassengersSection } from "@/components/clientes/ClientPassengersSection";
import { ClientProfileHeader } from "@/components/clientes/ClientProfileHeader";
import { LoadingState } from "@/components/shell/LoadingState";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { clientSchema } from "@/lib/validation/schemas";
import { formatCurrencyBRL } from "@/lib/format";
import { ClientDraft, PAYMENT_METHOD_LABEL, QuoteStatusType } from "@/lib/store/types";
import { ArrowLeft } from "lucide-react";

function ClientQuoteStatusBadge({ status }: { status: QuoteStatusType }) {
  switch (status) {
    case "APROVADA":
      return (
        <span className="inline-block rounded-full bg-[#ecfdf5] px-3 py-0.5 text-xs font-semibold text-[#059669]">
          Aprovada
        </span>
      );
    case "PROPOSTA_ENVIADA":
      return (
        <span className="inline-block rounded-full bg-[#eff6ff] px-3 py-0.5 text-xs font-semibold text-[#2563eb]">
          Proposta Enviada
        </span>
      );
    case "AGUARDANDO_CLIENTE":
      return (
        <span className="inline-block rounded-full bg-[#faf5ff] px-3 py-0.5 text-xs font-semibold text-[#9333ea]">
          Aguardando Cliente
        </span>
      );
    case "EM_ATENDIMENTO":
      return (
        <span className="inline-block rounded-full bg-[#f0fdf4] px-3 py-0.5 text-xs font-semibold text-[#16a34a]">
          Em Atendimento
        </span>
      );
    case "NOVA":
    default:
      return (
        <span className="inline-block rounded-full bg-[#eef2ff] px-3 py-0.5 text-xs font-semibold text-[#4f46e5]">
          Cotações Criadas
        </span>
      );
  }
}

export default function ClientDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { getClient, updateClient, addClientPassenger, deleteClient, quotes, hydrated } = useAppData();
  const [editing, setEditing] = useState(false);
  const [editDraft, setEditDraft] = useState<ClientDraft | null>(null);
  const [errors, setErrors] = useState<ClientFormErrors>({});

  const client = getClient(params.id);
  const clientQuotes = useMemo(
    () => quotes.filter((q) => q.clientId === params.id).sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    [quotes, params.id]
  );

  if (!hydrated) {
    return <LoadingState />;
  }

  if (!client) {
    return (
      <div className="min-h-screen bg-[#f8fafc] p-6">
        <div className="mx-auto max-w-xl text-center space-y-4 pt-12">
          <h1 className="text-xl font-bold text-slate-800">Cliente não encontrado</h1>
          <Link href="/clientes" className="text-sm font-semibold text-blue-600 hover:underline">
            ← Voltar para clientes
          </Link>
        </div>
      </div>
    );
  }

  const startEdit = () => {
    setEditDraft({
      nomeCompleto: client.nomeCompleto,
      cpf: client.cpf,
      passaporte: client.passaporte || "",
      avatarUrl: client.avatarUrl || "",
      email: client.email,
      telefone: client.telefone,
      endereco: client.endereco,
      cidade: client.cidade,
      observacoes: client.observacoes,
    });
    setErrors({});
    setEditing(true);
  };

  const handleSaveEdit = () => {
    if (!editDraft) return;
    const result = clientSchema.safeParse(editDraft);
    if (!result.success) {
      const fieldErrors: ClientFormErrors = {};
      for (const issue of result.error.issues) {
        const path = issue.path[0] as keyof ClientDraft;
        if (path && !fieldErrors[path]) {
          fieldErrors[path] = issue.message;
        }
      }
      setErrors(fieldErrors);
      toast.error("Corrija os erros antes de salvar.");
      return;
    }

    updateClient(client.id, editDraft);
    setEditing(false);
    setErrors({});
    toast.success("Cliente atualizado com sucesso.");
  };

  const handleDelete = () => {
    if (!confirm(`Excluir o cliente "${client.nomeCompleto}"? Isso não apaga as cotações já feitas para ele.`)) return;
    deleteClient(client.id);
    toast.success("Cliente excluído.");
    router.push("/clientes");
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:16px_16px] py-6 sm:py-8 px-4 sm:px-6 lg:px-8">
      <div className="w-full space-y-6">
        {/* Barra superior de navegação com trigger do menu */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <SidebarTrigger
              title="Recolher / Expandir menu"
              className="text-slate-500 hover:bg-slate-200/60 hover:text-slate-900 transition shrink-0"
            />
            <Link
              href="/clientes"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition cursor-pointer"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Voltar para clientes
            </Link>
          </div>
        </div>

        {/* Card do Cabeçalho com o Design Oficial */}
        <ClientProfileHeader
          client={client}
          onEdit={() => (editing ? setEditing(false) : startEdit())}
          onDelete={handleDelete}
          onUpdateAvatar={(avatarUrl) => updateClient(client.id, { avatarUrl })}
        />

        {/* Formulário de Edição (Apenas se o usuário clicou em editar) */}
        {editing && editDraft && (
          <section className="rounded-3xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm space-y-4">
            <h2 className="text-sm font-bold text-slate-800">Editar dados cadastrais</h2>
            <ClientForm draft={editDraft} onChange={setEditDraft} errors={errors} />
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setEditing(false)}
                className="rounded-xl border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSaveEdit}
                className="rounded-xl bg-[#1d82f5] px-4 py-2 text-xs font-bold text-white hover:bg-blue-600 shadow-xs cursor-pointer transition"
              >
                Salvar alterações
              </button>
            </div>
          </section>
        )}

        {/* Seção Passageiros Cadastrados */}
        <ClientPassengersSection
          clientId={client.id}
          passengers={client.passageiros || []}
          onAddPassenger={addClientPassenger}
        />

        {/* Seção Histórico de Cotações com o Design Oficial */}
        <section className="space-y-3">
          <h2 className="text-sm sm:text-base font-bold text-slate-800">Histórico de cotações</h2>

          <div className="rounded-2xl sm:rounded-3xl border border-slate-200/80 bg-white shadow-sm overflow-hidden">
            {clientQuotes.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400 space-y-2">
                <p>Nenhuma cotação vinculada a este cliente ainda.</p>
              </div>
            ) : (
              <div className="w-full overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[500px]">
                  <thead>
                    <tr className="border-b border-slate-100 text-xs font-bold uppercase tracking-wider text-slate-400">
                      <th className="px-6 py-3.5 font-bold">Nº / DESTINO</th>
                      <th className="px-6 py-3.5 font-bold">PAGAMENTO</th>
                      <th className="px-6 py-3.5 font-bold text-right sm:text-left">VALOR</th>
                      <th className="px-6 py-3.5 font-bold text-right">STATUS</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100/80 text-sm">
                    {clientQuotes.map((quote) => (
                      <tr key={quote.id} className="hover:bg-slate-50/70 transition">
                        <td className="px-6 py-3.5">
                          <Link href={`/cotacoes/${quote.id}`} className="group block">
                            <span className="font-bold text-slate-800 group-hover:text-blue-600 transition block text-sm">
                              {quote.numero || quote.destino}
                            </span>
                            <span className="text-xs text-slate-400 block font-normal">
                              {quote.numero ? quote.destino || "—" : "Cotação Avulsa"}
                            </span>
                          </Link>
                        </td>
                        <td className="px-6 py-3.5 text-xs sm:text-sm text-slate-600 font-medium">
                          {quote.paymentMethod ? PAYMENT_METHOD_LABEL[quote.paymentMethod] : "—"}
                        </td>
                        <td className="px-6 py-3.5 text-xs sm:text-sm font-semibold text-slate-700 text-right sm:text-left">
                          {quote.valorTotal ? formatCurrencyBRL(quote.valorTotal) : "—"}
                        </td>
                        <td className="px-6 py-3.5 text-right">
                          <ClientQuoteStatusBadge status={quote.status} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
