import { QUOTE_STATUS_ORDER, QuoteStatusType } from "./types";

/** Status das versões anteriores do funil (5 colunas), ainda presentes em
 * cotações salvas no localStorage. */
const LEGACY_STATUS: Record<string, QuoteStatusType> = {
  NOVA: "RASCUNHO",
  EM_ATENDIMENTO: "RASCUNHO",
  PROPOSTA_ENVIADA: "ENVIADA",
  AGUARDANDO_CLIENTE: "AGUARDANDO",
};

/** Converte um status salvo (atual ou legado) para uma etapa válida do funil. */
export const normalizeQuoteStatus = (status: string | null | undefined): QuoteStatusType => {
  if (status && (QUOTE_STATUS_ORDER as string[]).includes(status)) return status as QuoteStatusType;
  return (status && LEGACY_STATUS[status]) || "RASCUNHO";
};

/** Próximo status a partir da resposta do cliente na proposta pública, ou
 * null se a cotação deve ficar onde está. Aprovação sempre leva a
 * Aprovadas; pedido de revisão tira de Rascunhos/Enviadas para Aguardando. */
export const statusFromClientDecision = (
  current: QuoteStatusType,
  decision: string | null | undefined
): QuoteStatusType | null => {
  if (decision === "APROVADO") return current === "APROVADA" ? null : "APROVADA";
  if (decision === "REVISAO") return current === "RASCUNHO" || current === "ENVIADA" ? "AGUARDANDO" : null;
  return null;
};
