"use client";

import { MessageCircle, Plane, Mail, Phone } from "lucide-react";
import { TravelerFormData } from "./TravelersCard";
import { formatWhatsAppLink } from "@/lib/format";

interface SendToAgencyModalProps {
  open: boolean;
  bookingRef: string;
  travelers: TravelerFormData[];
  destination: string;
  contactEmail?: string;
  contactPhone?: string;
  agencyName?: string;
  agencyPhone?: string;
  proposalNumero?: string;
  onClose: () => void;
}

export function SendToAgencyModal({
  open,
  bookingRef,
  travelers,
  destination,
  contactEmail,
  contactPhone,
  agencyName,
  agencyPhone,
  proposalNumero,
  onClose,
}: SendToAgencyModalProps) {
  if (!open) return null;

  const validTravelers = travelers.filter((t) => t.nome && t.sobrenome);

  const defaultMessage = `Olá! Acabei de enviar a cotação ${
    proposalNumero ? `#${proposalNumero}` : ""
  } (Protocolo: ${bookingRef}) para ${destination || "minha viagem"}. Gostaria de combinar o pagamento e a emissão com a agência!`;

  const waLink = agencyPhone ? formatWhatsAppLink(agencyPhone, defaultMessage) : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 p-4 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="relative w-full max-w-md rounded-3xl border border-slate-200 bg-white p-7 text-center shadow-2xl space-y-6">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-indigo-100 text-[#5E17EB]">
          <Plane className="h-9 w-9 stroke-[2.2] -rotate-45" />
        </div>

        <div className="space-y-1">
          <h2 className="text-2xl font-black tracking-tight text-slate-900">
            Cotação enviada para a agência!
          </h2>
          <p className="text-xs text-slate-500">
            Sua seleção para <strong>{destination || "sua viagem"}</strong> foi recebida com sucesso pela equipe {agencyName ? `da ${agencyName}` : "da agência"}.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 space-y-3 text-left text-xs">
          <div className="flex items-center justify-between border-b border-slate-200/80 pb-2.5">
            <span className="text-slate-500 font-medium">Protocolo da solicitação</span>
            <span className="rounded bg-indigo-50 px-2.5 py-0.5 font-mono text-sm font-black text-indigo-700">
              {bookingRef}
            </span>
          </div>

          {validTravelers.length > 0 && (
            <div>
              <span className="block text-slate-500 font-medium mb-1">Passageiros incluídos:</span>
              <ul className="space-y-1">
                {validTravelers.map((t, idx) => (
                  <li key={idx} className="font-bold text-slate-800 flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#5E17EB]" />
                    {t.nome} {t.sobrenome} ({t.tipo})
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="border-t border-slate-200/80 pt-2 space-y-1.5 text-slate-600">
            <p className="font-medium text-slate-700">
              💬 Nosso consultor entrará em contato para:
            </p>
            <ul className="list-disc list-inside space-y-0.5 text-[11px] text-slate-500">
              <li>Confirmar a disponibilidade dos voos e tarifas</li>
              <li>Combinar a forma de pagamento (transferência, faturamento ou link)</li>
              <li>Emitir os bilhetes e enviar os vouchers</li>
            </ul>
          </div>

          {(contactEmail || contactPhone) && (
            <div className="border-t border-slate-200/80 pt-2 flex flex-col gap-1 text-[11px] text-slate-500">
              {contactEmail && (
                <div className="flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                  <span>Retorno no e-mail: <strong className="text-slate-700">{contactEmail}</strong></span>
                </div>
              )}
              {contactPhone && (
                <div className="flex items-center gap-1.5">
                  <Phone className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                  <span>WhatsApp/Telefone: <strong className="text-slate-700">{contactPhone}</strong></span>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="space-y-2.5">
          {waLink ? (
            <a
              href={waLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex w-full items-center justify-center gap-2 rounded-full bg-[#25D366] py-3 text-sm font-bold text-white shadow-md hover:bg-[#20ba59] transition cursor-pointer"
            >
              <MessageCircle className="h-4.5 w-4.5" /> Falar com a agência no WhatsApp
            </a>
          ) : null}

          <button
            type="button"
            onClick={onClose}
            className="flex w-full items-center justify-center gap-2 rounded-full border border-slate-200 bg-white py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
          >
            Voltar para a cotação
          </button>
        </div>
      </div>
    </div>
  );
}
