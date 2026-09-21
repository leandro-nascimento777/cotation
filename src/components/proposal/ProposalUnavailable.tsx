import { Clock, Link2Off, SearchX } from "lucide-react";

const MESSAGES = {
  not_found: {
    icon: SearchX,
    title: "Proposta não encontrada",
    description: "Esse link não existe ou a proposta foi removida.",
  },
  expired: {
    icon: Clock,
    title: "Link expirado",
    description: "Esse link temporário passou das 24h de validade. Peça um novo à agência.",
  },
  revoked: {
    icon: Link2Off,
    title: "Link desativado",
    description: "A agência desativou esse link. Peça um novo se ainda precisar da proposta.",
  },
} as const;

export const ProposalUnavailable = ({ reason }: { reason: keyof typeof MESSAGES }) => {
  const { icon: Icon, title, description } = MESSAGES[reason];
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-slate-50 px-6 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-100">
        <Icon className="h-7 w-7 text-slate-400" />
      </div>
      <p className="text-base font-semibold text-slate-700">{title}</p>
      <p className="max-w-xs text-sm text-slate-500">{description}</p>
    </div>
  );
};
