"use client";

import Link from "next/link";
import { Client } from "@/lib/store/types";
import { formatCpf, formatPassport, formatPhoneWithDdi, formatWhatsAppLink } from "@/lib/format";
import { Mail, Phone, MessageCircle, Plus, ArrowRight, MapPin } from "lucide-react";

interface ClientListGridProps {
  clients: Client[];
  quoteCount: (clientId: string) => number;
  getInitials: (name: string) => string;
}

export function ClientListGrid({ clients, quoteCount, getInitials }: ClientListGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      {clients.map((client) => {
        const initials = getInitials(client.nomeCompleto);
        const formattedCpf = formatCpf(client.cpf);
        const formattedPassport = formatPassport(client.passaporte);
        const formattedPhone = formatPhoneWithDdi(client.telefone);
        const waLink = client.telefone ? formatWhatsAppLink(client.telefone) : null;
        const totalQuotes = quoteCount(client.id);

        return (
          <div
            key={client.id}
            className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm hover:shadow-md hover:border-blue-200 transition flex flex-col justify-between gap-4 group"
          >
            {/* Topo do Card com Avatar e Nome */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="relative h-12 w-12 rounded-full border-2 border-white shadow-xs overflow-hidden shrink-0 flex items-center justify-center bg-gradient-to-tr from-[#bfdbfe] via-[#dbeafe] to-[#eff6ff]">
                  {client.avatarUrl ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={client.avatarUrl}
                      alt={client.nomeCompleto}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span className="text-sm font-black text-[#1d4ed8]">
                      {initials}
                    </span>
                  )}
                </div>

                <div className="min-w-0">
                  <Link
                    href={`/clientes/${client.id}`}
                    className="font-bold text-slate-900 group-hover:text-[#1d82f5] transition block truncate text-base leading-tight"
                  >
                    {client.nomeCompleto}
                  </Link>
                  {client.cidade && (
                    <span className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                      <MapPin className="h-3 w-3" /> {client.cidade}
                    </span>
                  )}
                </div>
              </div>

              <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-bold text-[#1d82f5] border border-blue-200/60 shrink-0">
                {totalQuotes} {totalQuotes === 1 ? "cotação" : "cotações"}
              </span>
            </div>

            {/* Documentos e Contatos */}
            <div className="rounded-2xl bg-[#f8fafc] border border-slate-100 p-3 space-y-2 text-xs text-slate-600">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200/50 pb-2">
                <p>
                  <span className="text-slate-400">CPF:</span>{" "}
                  <strong className="font-mono text-slate-800">{formattedCpf || "—"}</strong>
                </p>
                {formattedPassport && (
                  <p>
                    <span className="text-slate-400">Pass.:</span>{" "}
                    <strong className="font-mono text-slate-800">{formattedPassport}</strong>
                  </p>
                )}
              </div>

              <div className="space-y-1.5 pt-0.5">
                <div className="flex items-center gap-2 truncate">
                  <Mail className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                  <span className="truncate">{client.email || "—"}</span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Phone className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                    <span>{formattedPhone || "—"}</span>
                  </div>
                  {waLink && (
                    <a
                      href={waLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-600 border border-emerald-200 hover:bg-emerald-100 transition"
                    >
                      <MessageCircle className="h-3 w-3" /> WhatsApp
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* Ações do Rodapé */}
            <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-100">
              <Link
                href={`/cotacoes/nova?clientId=${client.id}`}
                className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-[#1d82f5] transition"
              >
                <Plus className="h-3.5 w-3.5" /> Nova cotação
              </Link>

              <Link
                href={`/clientes/${client.id}`}
                className="inline-flex items-center gap-1 rounded-xl bg-slate-900 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-slate-800 shadow-xs transition"
              >
                Ver perfil <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        );
      })}
    </div>
  );
}