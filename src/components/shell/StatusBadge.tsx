import { QUOTE_STATUS_LABEL, QuoteStatusType } from "@/lib/store/types";

const STATUS_STYLE: Record<QuoteStatusType, string> = {
  RASCUNHO: "bg-slate-100 text-slate-600",
  ENVIADA: "bg-blue-50 text-blue-700",
  APROVADA: "bg-green-50 text-green-700",
  RECUSADA: "bg-red-50 text-red-700",
  EXPIRADA: "bg-amber-50 text-amber-700",
};

export function StatusBadge({ status }: { status: QuoteStatusType }) {
  return (
    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_STYLE[status]}`}>
      {QUOTE_STATUS_LABEL[status]}
    </span>
  );
}
