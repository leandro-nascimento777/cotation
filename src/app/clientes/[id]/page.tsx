"use client";

import { useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { useAppData } from "@/lib/store/AppDataContext";
import { ClientForm, ClientFormErrors } from "@/components/clientes/ClientForm";
import { ClientPassengersSection } from "@/components/clientes/ClientPassengersSection";
import { PageHeader } from "@/components/shell/PageHeader";
import { StatusBadge } from "@/components/shell/StatusBadge";
import { EmptyState } from "@/components/shell/EmptyState";
import { LoadingState } from "@/components/shell/LoadingState";
import { NewQuoteButton } from "@/components/shell/NewQuoteButton";
import { clientSchema } from "@/lib/validation/schemas";
import { formatCurrencyBRL } from "@/lib/format";
import { ClientDraft, PAYMENT_METHOD_LABEL } from "@/lib/store/types";
import { ArrowLeft, Pencil, Receipt, Trash2 } from "lucide-react";

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
      <div>
        <PageHeader title="Cliente não encontrado" />
        <div className="mx-auto max-w-2xl px-4 py-6 sm:px-6">
          <Link href="/clientes" className="text-sm font-medium text-teal-700 hover:underline">
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
    <div>
      <PageHeader
        title={client.nomeCompleto}
        description="Perfil do cliente e histórico de cotações."
        action={
          <Link href="/clientes" className="flex items-center gap-1 text-sm font-medium text-slate-500 hover:text-slate-700">
            <ArrowLeft className="h-4 w-4" /> Voltar
          </Link>
        }
      />

      <div className="mx-auto flex max-w-3xl flex-col gap-6 px-4 py-6 sm:px-6">
        <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-700">Dados cadastrais</h2>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => (editing ? setEditing(false) : startEdit())}
                className="flex items-center gap-1 rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50"
              >
                <Pencil className="h-3.5 w-3.5" /> {editing ? "Cancelar" : "Editar"}
              </button>
              <button
                type="button"
                onClick={handleDelete}
                className="flex items-center gap-1 rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs font-medium text-slate-500 hover:border-red-300 hover:bg-red-50 hover:text-red-600"
              >
                <Trash2 className="h-3.5 w-3.5" /> Excluir
              </button>
            </div>
          </div>

          {editing && editDraft ? (
            <>
              <ClientForm draft={editDraft} onChange={setEditDraft} errors={errors} />
              <div className="mt-4 flex justify-end">
                <button
                  type="button"
                  onClick={handleSaveEdit}
                  className="rounded-lg bg-teal-600 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-700"
                >
                  Salvar alterações
                </button>
              </div>
            </>
          ) : (
            <dl className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-xs text-slate-400">E-mail</dt>
                <dd className="text-slate-700">{client.email || "—"}</dd>
              </div>
              <div>
                <dt className="text-xs text-slate-400">Telefone / WhatsApp</dt>
                <dd className="text-slate-700">{client.telefone || "—"}</dd>
              </div>
              <div>
                <dt className="text-xs text-slate-400">CPF</dt>
                <dd className="text-slate-700">{client.cpf || "—"}</dd>
              </div>
              <div>
                <dt className="text-xs text-slate-400">Cidade</dt>
                <dd className="text-slate-700">{client.cidade || "—"}</dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-xs text-slate-400">Endereço</dt>
                <dd className="text-slate-700">{client.endereco || "—"}</dd>
              </div>
              {client.observacoes ? (
                <div className="sm:col-span-2">
                  <dt className="text-xs text-slate-400">Observações</dt>
                  <dd className="whitespace-pre-wrap text-slate-700">{client.observacoes}</dd>
                </div>
              ) : null}
            </dl>
          )}
        </section>
        <ClientPassengersSection
          clientId={client.id}
          passengers={client.passageiros || []}
          onAddPassenger={addClientPassenger}
        />


        <section>
          <h2 className="mb-3 text-sm font-semibold text-slate-700">Histórico de cotações</h2>
          {clientQuotes.length === 0 ? (
            <EmptyState
              icon={Receipt}
              title="Nenhuma cotação ainda"
              description="Cotações vinculadas a este cliente vão aparecer aqui."
              action={<NewQuoteButton className="mt-2" />}
            />
          ) : (
            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-4 py-2.5">Nº / Destino</th>
                    <th className="hidden px-4 py-2.5 sm:table-cell">Pagamento</th>
                    <th className="px-4 py-2.5 text-right">Valor</th>
                    <th className="px-4 py-2.5 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {clientQuotes.map((quote) => (
                    <tr key={quote.id} className="hover:bg-slate-50">
                      <td className="px-4 py-2.5">
                        <Link href={`/cotacoes/${quote.id}`} className="font-medium text-slate-800 hover:text-teal-700">
                          {quote.numero}
                        </Link>
                        <p className="text-xs text-slate-400">{quote.destino || "—"}</p>
                      </td>
                      <td className="hidden px-4 py-2.5 text-slate-500 sm:table-cell">
                        {quote.paymentMethod ? PAYMENT_METHOD_LABEL[quote.paymentMethod] : "—"}
                      </td>
                      <td className="px-4 py-2.5 text-right text-slate-700">
                        {quote.valorTotal ? formatCurrencyBRL(quote.valorTotal) : "—"}
                      </td>
                      <td className="px-4 py-2.5 text-right">
                        <StatusBadge status={quote.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
