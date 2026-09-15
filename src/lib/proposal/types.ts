import type { getProposalShareByQuote } from "./actions";

/** Registro completo de uma ProposalShare (com os links temporários
 * incluídos) — tipo inferido direto da Server Action pra não duplicar o
 * shape do Prisma manualmente. */
export type ProposalShareRecord = NonNullable<Awaited<ReturnType<typeof getProposalShareByQuote>>>;
