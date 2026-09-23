"use client";

import Link from "next/link";
import { Client } from "@/lib/store/types";
import { formatCpf, formatPassport, formatPhoneWithDdi, formatWhatsAppLink } from "@/lib/format";
import { MessageCircle, Plus, ArrowRight, MapPin } from "lucide-react";

interface ClientListTableProps {
  clients: Client[];
  quoteCount: (clientId: string) => number;
  getInitials: (name: string) => string;
}

export function ClientListTable({ clients, quoteCount, getInitials }: ClientListTableProps) {
  return (
    <div className="rounded-3xl border border-slate-200/80 bg-white shadow-sm overflow-hidden">
      <div className="w-full overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[650px]">
          <thead>
            <tr className="border-b border-slate-100 text-xs font-bold uppercase tracking-wider text-slate-400 bg-slate-50/50">
              <th className="px-6 py-4">Cliente</th>
              <th className="px-6 py-4">Documentos</th>
              <th className="px-6 py-4">Contato</th>
              <th className="px-6 py-4">Cidade</th>
              <th className="px-6 py-4 text-center">Cotações</th>
              <th className="px-6 py-4 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {clients.map((client) => {
              const initials = getInitials(client.nomeCompleto);
              const formattedCpf = formatCpf(client.cpf);
              const formattedPassport = formatPassport(client.passaporte);
              const formattedPhone = formatPhoneWithDdi(client.telefone);
              const waLink = client.telefone ? formatWhatsAppLink(client.telefone) : null;
              const totalQuotes = quoteCount(client.id);

              return (
                <tr key={client.id} className="hover:bg-slate-50/70 transition group">
                  <td className="px-6 py-3.5">
                    <Link href={`/clientes/${client.id}`} className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full border border-white shadow-xs overflow-hidden shrink-0 flex items-center justify-center bg-gradient-to-tr from-[#bfdbfe] to-[#eff6ff]">
                        {client.avatarUrl ? (
                          /* eslint-disable-next-line @next/next/no-img-element */
                          <img src={client.avatarUrl} alt="" className="h-full w-full object-cover" />
                        ) : (
                          <span className="text-xs font-black text-[#1d4ed8]">{initials}</span>
                        )}
                      </div>
                      <div className="min-w-0">
                        <span className="font-bold text-slate-900 group-hover:text-[#1d82f5] transition block truncate">
                          {client.nomeCompleto}
                        </span>
                        {client.passageiros && client.passageiros.length > 0 && (
                          <span className="text-[10px] text-indigo-600 font-semibold">
                            {client.passageiros.length} passageiro{client.passageiros.length === 1 ? "" : "s"}
                          </span>
                        )}
                      </div>
                    </Link>
                  </td>

                  <td className="px-6 py-3.5 text-xs text-slate-600 font-medium space-y-0.5">
                    <p><span className="text-slate-400">CPF:</span> <span className="font-mono">{formattedCpf || "—"}</span></p>
                    {client.passaporte && (
                      <p><span className="text-slate-400">Pass.:</span> <span className="font-mono">{formattedPassport}</span></p>
                    )}
                  </td>

                  <td className="px-6 py-3.5 text-xs text-slate-600 space-y-0.5">
                    <p className="truncate max-w-[180px]">{client.email || "—"}</p>
                    <div className="flex items-center gap-1.5 font-medium">
                      <span>{formattedPhone || "—"}</span>
                      {waLink && (
                        <a href={waLink} target="_blank" rel="noopener noreferrer" className="text-emerald-500 hover:text-emerald-600">
                          <MessageCircle className="h-3.5 w-3.5" />
                        </a>
                      )}
                    </div>
                  </td>

                  <td className="px-6 py-3.5 text-xs text-slate-600">
                    {client.cidade ? (
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="h-3 w-3 text-slate-400" /> {client.cidade}
                      </span>
                    ) : "—"}
                  </td>

                  <td className="px-6 py-3.5 text-center">
                    <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-bold ${totalQuotes > 0 ? "bg-blue-50 text-[#1d82f5] border border-blue-200/60" : "bg-slate-100 text-slate-500"}`}>
                      {totalQuotes}
                    </span>
                  </td>

                  <td className="px-6 py-3.5 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/cotacoes/nova?clientId=${client.id}`}
                        title="Nova cotação"
                        className="rounded-xl border border-slate-200 bg-white p-1.5 text-slate-600 hover:bg-blue-50 hover:text-[#1d82f5]"
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </Link>
                      <Link
                        href={`/clientes/${client.id}`}
                        className="inline-flex items-center gap-1 rounded-xl bg-slate-900 px-3 py-1.5 text-xs font-bold text-white hover:bg-slate-800"
                      >
                        Perfil <ArrowRight className="h-3 w-3" />
                      </Link>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}