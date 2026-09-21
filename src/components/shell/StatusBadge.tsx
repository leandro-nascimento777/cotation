import { QUOTE_STATUS_LABEL, QuoteStatusType } from "@/lib/store/types";

const STATUS_STYLE: Record<QuoteStatusType, string> = {
  NOVA: "bg-indigo-50 text-indigo-700",
  EM_ATENDIMENTO: "bg-amber-50 text-amber-700",
  PROPOSTA_ENVIADA: "bg-blue-50 text-blue-700",
  AGUARDANDO_CLIENTE: "bg-purple-50 text-purple-700",
  APROVADA: "bg-green-50 text-green-700",
};

export const StatusBadge = ({ status }: { status: QuoteStatusType }) => (
  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_STYLE[status]}`}>
    {QUOTE_STATUS_LABEL[status]}
  </span>
);
