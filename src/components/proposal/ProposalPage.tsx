import { ProposalResponseForm } from "./ProposalResponseForm";
import { getProposalTheme } from "@/lib/proposal/themes";
import { validityDateTimePtBR } from "@/lib/format";
import { PAYMENT_METHOD_LABEL, PaymentMethodType } from "@/lib/store/types";
import { QuoteItem } from "@/lib/types";
import { ProposalAgencySnapshot, ProposalClientSnapshot } from "@/lib/proposal/actions";
import { Prisma } from "@prisma/client";
import { PlaneTakeoff } from "lucide-react";

type ProposalShareRow = Prisma.ProposalShareGetPayload<Record<string, never>>;

function InfoBlock({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-1">
      <span className="block text-xs font-bold tracking-wider text-slate-400 uppercase">{label}</span>
      <span className="block text-sm font-bold text-slate-900">{value}</span>
    </div>
  );
}

const WAVE_PATHS = [
  {
    d: "M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z",
    opacity: 0.25,
  },
  {
    d: "M0,0V15.81C13,36.92,27.64,56.86,47.69,72.05,99.41,111.27,165,111,224.58,91.58c31.15-10.15,60.09-26.07,89.67-39.8,40.92-19,84.73-46,130.83-49.67,36.26-2.85,70.9,9.42,98.6,31.56,31.77,25.39,62.32,62,103.63,73,40.44,10.79,81.35-6.69,119.13-24.28s75.16-39,116.92-43.05c59.73-5.85,113.28,22.88,168.9,38.84,30.2,8.66,59,6.17,87.09-7.5,22.43-10.89,48-26.93,60.65-49.24V0Z",
    opacity: 0.5,
  },
  {
    d: "M0,0V5.63C149.93,59,314.09,71.32,475.83,42.57c43-7.64,84.23-20.12,127.61-26.46,59-8.63,112.48,12.24,165.56,35.4C827.93,77.22,886,95.24,951.2,90c86.53-7,172.46-45.71,248.8-84.81V0Z",
    opacity: 1,
  },
];

export function ProposalPage({ share }: { share: ProposalShareRow }) {
  const theme = getProposalTheme(share.themeId);
  const flightItems = share.flightItems as unknown as QuoteItem[];
  const agencySnap = share.agencySnapshot as unknown as ProposalAgencySnapshot;
  const clientSnap = share.clientSnapshot as unknown as ProposalClientSnapshot | null;
  const alreadyDecided = share.clientDecision
    ? { decision: share.clientDecision, observation: share.clientObservation }
    : null;

  const passengerParts = [
    `${share.adults} adulto${share.adults === 1 ? "" : "s"}`,
    share.children ? `${share.children} criança${share.children === 1 ? "" : "s"}` : null,
    share.infants ? `${share.infants} bebê${share.infants === 1 ? "" : "s"}` : null,
  ].filter(Boolean);

  const paymentMethodLabel = share.paymentMethod
    ? PAYMENT_METHOD_LABEL[share.paymentMethod as PaymentMethodType]
    : "A combinar com a agência.";

  return (
    <div className="min-h-screen bg-slate-100 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl space-y-8 pb-16">
        <div className="w-full overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_20px_50px_rgba(0,0,0,0.15)]">
          {/* Capa */}
          <div
            className="relative flex min-h-[360px] flex-col justify-end bg-cover bg-center px-6 py-10 text-white sm:min-h-[400px] sm:px-10 sm:py-14"
            style={{ backgroundImage: `url(${share.coverImageUrl || theme.imageUrl})` }}
          >
            {/* Vinheta bem sutil só pra suavizar a transição com a onda —
                o texto em si fica legível pelo painel "vidro" abaixo, não
                por escurecer a foto inteira. */}
            <div className="absolute inset-0 z-0 bg-gradient-to-t from-black/25 via-transparent to-transparent" />
            <div
              className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-16 select-none"
              style={{ transform: "scaleY(-1)" }}
            >
              <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="h-full w-full">
                {WAVE_PATHS.map((wave, i) => (
                  <path key={i} d={wave.d} fill="#6366f1" opacity={wave.opacity} />
                ))}
              </svg>
            </div>

            <div className="relative z-10 flex flex-col justify-end pb-8">
              <div className="max-w-xl space-y-4 rounded-2xl border border-white/15 bg-black/15 p-5 shadow-lg backdrop-blur-md sm:p-6">
                <div className="space-y-2">
                  <h1 className="text-3xl leading-none font-black tracking-tight uppercase sm:text-4xl md:text-5xl">
                    {share.coverTitle}
                  </h1>
                  {share.coverSubtitle ? (
                    <p className="text-sm leading-relaxed font-medium text-white/85 sm:text-base">{share.coverSubtitle}</p>
                  ) : null}
                </div>
                <div className="border-t border-white/15 pt-4">
                  <p className="text-base font-bold tracking-wide sm:text-lg">{share.numero}</p>
                  <p className="text-xs font-semibold text-white/70 sm:text-sm">{agencySnap.agencyName}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Faixa índigo + resumo flutuante */}
          <div className="relative flex flex-col items-center bg-indigo-500 px-6 pt-12 pb-8 sm:px-10">
            <div className="relative z-20 -mt-20 w-full rounded-3xl border border-slate-200 bg-white p-6 shadow-xl sm:p-8">
              <h2 className="mb-5 border-b border-slate-200 pb-3 text-sm font-bold tracking-wider text-slate-900 uppercase">
                Resumo da Viagem
              </h2>
              <div className="grid grid-cols-1 gap-6 text-sm sm:grid-cols-2 md:grid-cols-3">
                <InfoBlock label="Cliente" value={clientSnap?.nomeCompleto || "—"} />
                <InfoBlock label="Destino" value={share.destino || "—"} />
                <InfoBlock label="Ida" value={share.periodoInicio || "—"} />
                <InfoBlock label="Volta" value={share.periodoFim || "—"} />
                <InfoBlock label="Passageiros" value={passengerParts.join(", ") || "—"} />
              </div>
              <div className="mt-6 flex flex-wrap gap-2 border-t border-slate-200 pt-4">
                <span className="flex items-center gap-1.5 rounded-full bg-indigo-500/10 px-3.5 py-1.5 text-xs font-bold text-indigo-600">
                  <PlaneTakeoff className="h-3 w-3" /> Aéreo
                </span>
              </div>
            </div>
            <p className="relative z-20 mt-6 max-w-lg text-center text-xs font-medium text-white/90 italic">
              Próximo passo: confirme a proposta e envie os dados dos passageiros para reserva/emissão.
            </p>
          </div>
        </div>

        {/* Barra da marca */}
        <div className="flex w-full flex-col items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white px-6 py-4 shadow-lg sm:flex-row">
          <span className="text-sm font-black tracking-wider text-indigo-700 uppercase">{agencySnap.agencyName}</span>
          <div className="flex w-full items-center justify-between gap-2 border-t border-slate-200 pt-2 text-xs text-slate-500 sm:w-auto sm:flex-col sm:items-end sm:border-t-0 sm:pt-0">
            <div className="flex items-center gap-1">
              <span className="font-bold text-slate-800">Proposta Comercial:</span>
              <span className="rounded bg-indigo-500/5 px-2 py-0.5 font-mono font-bold text-slate-800">#{share.numero}</span>
            </div>
            <div>
              <span className="font-medium">Emissão: </span>
              <span className="font-semibold text-slate-700">
                {share.createdAt.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" })}
              </span>
            </div>
          </div>
        </div>

        {/* Serviços Selecionados */}
        <div className="space-y-6">
          <div className="border-b border-slate-200 pb-3">
            <h2 className="text-xl font-bold text-slate-900">Serviços Selecionados</h2>
            <p className="text-xs text-slate-500">Revise os detalhes dos serviços inclusos nesta proposta.</p>
          </div>

          <ProposalResponseForm
            shareId={share.id}
            flightItems={flightItems}
            alreadyDecided={alreadyDecided}
            nextSteps={share.nextSteps}
            paymentMethodLabel={paymentMethodLabel}
            agencyObservations={share.observacoes || ""}
            validityLabel={validityDateTimePtBR(share.validityHours, share.createdAt)}
          />
        </div>

        <footer className="pt-4 text-center text-xs text-slate-400">
          {[agencySnap.agencyName, agencySnap.phone, agencySnap.email].filter(Boolean).join(" · ")}
        </footer>
      </div>
    </div>
  );
}
