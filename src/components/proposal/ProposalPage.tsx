import { ProposalResponseForm } from "./ProposalResponseForm";
import { getProposalTheme } from "@/lib/proposal/themes";
import { validityDateTimePtBR } from "@/lib/format";
import { PAYMENT_METHOD_LABEL, PaymentMethodType } from "@/lib/store/types";
import { QuoteItem } from "@/lib/types";
import { ProposalAgencySnapshot, ProposalClientSnapshot } from "@/lib/proposal/actions";
import { Prisma } from "@prisma/client";

type ProposalShareRow = Prisma.ProposalShareGetPayload<Record<string, never>>;

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] font-semibold tracking-wide text-slate-400 uppercase">{label}</p>
      <p className="text-slate-800">{value}</p>
    </div>
  );
}

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

  return (
    <div className="min-h-screen bg-slate-100 pb-16">
      <div
        className="relative flex flex-col justify-end px-6 py-14 sm:px-10"
        style={{
          backgroundImage: `url(${share.coverImageUrl || theme.imageUrl})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-black/45" />
        <div className="relative mx-auto w-full max-w-3xl text-white">
          <p className="text-xs font-semibold tracking-wide text-white/80 uppercase">
            {agencySnap.agencyName || "Proposta Comercial"}
          </p>
          <h1 className="mt-1 text-2xl font-bold sm:text-3xl">{share.coverTitle}</h1>
          {share.coverSubtitle ? <p className="mt-1 text-sm text-white/90">{share.coverSubtitle}</p> : null}
          <p className="mt-4 font-mono text-xs text-white/70">#{share.numero}</p>
        </div>
      </div>

      <div className="mx-auto -mt-6 flex w-full max-w-3xl flex-col gap-4 px-4 sm:px-6">
        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="mb-3 text-sm font-semibold text-slate-700">Resumo da Viagem</h2>
          <div className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
            <Info label="Cliente" value={clientSnap?.nomeCompleto || "—"} />
            <Info label="Destino" value={share.destino || "—"} />
            <Info label="Ida" value={share.periodoInicio || "—"} />
            <Info label="Volta" value={share.periodoFim || "—"} />
            <Info label="Passageiros" value={passengerParts.join(", ") || "—"} />
            <Info label="Proposta válida até" value={validityDateTimePtBR(share.validityHours, share.createdAt)} />
          </div>
        </section>

        {share.mensagemDestaque ? (
          <div className="rounded-xl bg-teal-600 px-4 py-3 text-center text-sm font-semibold text-white">
            {share.mensagemDestaque}
          </div>
        ) : null}

        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="mb-3 text-sm font-semibold text-slate-700">Serviços Selecionados</h2>
          <ProposalResponseForm shareId={share.id} flightItems={flightItems} alreadyDecided={alreadyDecided} />
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="mb-3 text-sm font-semibold text-slate-700">Condições / Formas de Pagamento</h2>
          <p className="text-sm text-slate-600">
            {share.paymentMethod ? PAYMENT_METHOD_LABEL[share.paymentMethod as PaymentMethodType] : "A combinar com a agência."}
          </p>
          {share.observacoes ? <p className="mt-2 text-xs text-slate-500">{share.observacoes}</p> : null}
        </section>

        {share.nextSteps ? (
          <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="mb-3 text-sm font-semibold text-slate-700">Próximos Passos</h2>
            <ol className="flex flex-col gap-2 text-sm text-slate-600">
              {share.nextSteps
                .split("\n")
                .map((step) => step.trim())
                .filter(Boolean)
                .map((step, idx) => (
                  <li key={idx}>
                    <b className="text-slate-800">{idx + 1}.</b> {step}
                  </li>
                ))}
            </ol>
          </section>
        ) : null}

        <footer className="pt-4 text-center text-xs text-slate-400">
          {[agencySnap.agencyName, agencySnap.phone, agencySnap.email].filter(Boolean).join(" · ")}
        </footer>
      </div>
    </div>
  );
}
