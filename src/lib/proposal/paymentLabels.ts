import { ProposalPaymentSummary } from "./actions";

export const PAYMENT_METHOD_KIND_LABEL: Record<ProposalPaymentSummary["method"], string> = {
  CARTAO: "Cartão de crédito",
  PIX: "Pix",
  NUPAY: "NuPay",
  AGENCIA: "A combinar com a agência",
};
