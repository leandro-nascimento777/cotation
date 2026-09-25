"use server";

import { randomUUID } from "crypto";
import { put } from "@vercel/blob";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import { proposalResponseSchema } from "@/lib/validation/apiSchemas";
import { logger } from "@/lib/logger";
import { ClosedFlightSelection, ClientPassenger } from "@/lib/store/types";
import { QuoteItem } from "@/lib/types";

const TEMP_LINK_TTL_MS = 24 * 60 * 60 * 1000;
const MAX_COVER_BYTES = 5 * 1024 * 1024;

export interface ProposalAgencySnapshot {
  agencyName: string;
  logoDataUrl: string;
  phone: string;
  email: string;
  cnpj: string;
  cadastur: string;
  pdfCorPrimaria: string;
  pdfCorSecundaria: string;
}

export interface ProposalClientSnapshot {
  clientId?: string;
  nomeCompleto: string;
  cpf?: string;
  passageirosNomes?: string;
  telefone: string;
  email: string;
  savedPassengers?: ClientPassenger[];
}

export interface SaveProposalShareInput {
  quoteLocalId: string;
  numero: string;
  destino: string;
  periodoInicio: string;
  periodoFim: string;
  adults: number;
  children: number;
  infants: number;
  paymentMethod: string;
  validityHours: number;
  mensagemDestaque: string;
  observacoes: string;
  flightItems: QuoteItem[];
  agency: ProposalAgencySnapshot;
  client: ProposalClientSnapshot | null;
  themeId: string;
  coverImageUrl: string | null;
  coverTitle: string;
  coverSubtitle: string;
  nextSteps: string;
}

/** Cria (ou atualiza, se a cotação já tinha uma) o snapshot público da
 * cotação. Reabrir "Montar Proposta Comercial" e confirmar de novo sempre
 * sobrescreve o snapshot e reseta a resposta do cliente (a proposta mudou,
 * ele precisa reavaliar). */
export async function saveProposalShare(input: SaveProposalShareInput) {
  const data = {
    numero: input.numero,
    destino: input.destino || null,
    periodoInicio: input.periodoInicio || null,
    periodoFim: input.periodoFim || null,
    adults: input.adults,
    children: input.children,
    infants: input.infants,
    paymentMethod: input.paymentMethod || null,
    validityHours: input.validityHours,
    mensagemDestaque: input.mensagemDestaque || null,
    observacoes: input.observacoes || null,
    flightItems: input.flightItems as unknown as Prisma.InputJsonValue,
    agencySnapshot: input.agency as unknown as Prisma.InputJsonValue,
    clientSnapshot: (input.client as unknown as Prisma.InputJsonValue) ?? Prisma.JsonNull,
    themeId: input.themeId,
    coverImageUrl: input.coverImageUrl,
    coverTitle: input.coverTitle,
    coverSubtitle: input.coverSubtitle || null,
    nextSteps: input.nextSteps || null,
    selectedIdaRowId: null,
    selectedIdaFareId: null,
    selectedVoltaRowId: null,
    selectedVoltaFareId: null,
    clientObservation: null,
    clientDecision: null,
    decidedAt: null,
    checkoutPayment: Prisma.JsonNull,
  };

  const result = await prisma.proposalShare.upsert({
    where: { quoteLocalId: input.quoteLocalId },
    create: { quoteLocalId: input.quoteLocalId, ...data },
    update: data,
    include: { temporaryLinks: { orderBy: { createdAt: "desc" } } },
  });

  logger.info("Snapshot de proposta comercial salvo no banco", {
    quoteLocalId: input.quoteLocalId,
    shareId: result.id,
    numero: input.numero,
  });

  return result;
}

export async function getProposalShareByQuote(quoteLocalId: string) {
  return prisma.proposalShare.findUnique({
    where: { quoteLocalId },
    include: { temporaryLinks: { orderBy: { createdAt: "desc" } } },
  });
}

/** Decisões do cliente pras cotações informadas — usado pelo Kanban
 * (/cotacoes) pra mover automaticamente pra "Aprovada" e pré-preencher a
 * escolha de voo assim que o agente reabrir a tela. */
export async function getProposalDecisions(quoteLocalIds: string[]) {
  if (quoteLocalIds.length === 0) return [];
  return prisma.proposalShare.findMany({
    where: { quoteLocalId: { in: quoteLocalIds }, clientDecision: { not: null } },
    select: {
      quoteLocalId: true,
      clientDecision: true,
      selectedIdaRowId: true,
      selectedIdaFareId: true,
      selectedVoltaRowId: true,
      selectedVoltaFareId: true,
    },
  });
}

export async function createTemporaryLink(shareId: string) {
  return prisma.proposalTemporaryLink.create({
    data: {
      shareId,
      token: randomUUID(),
      expiresAt: new Date(Date.now() + TEMP_LINK_TTL_MS),
    },
  });
}

export async function revokeTemporaryLink(id: string) {
  await prisma.proposalTemporaryLink.update({
    where: { id },
    data: { revokedAt: new Date() },
  });
}

/** Upload da imagem de capa customizada (aba Link → Montar Proposta →
 * "Enviar imagem"). Limite de 5MB, só imagens. */
export async function uploadCoverImage(file: File): Promise<{ url: string } | { error: string }> {
  if (!file || file.size === 0) return { error: "Nenhum arquivo enviado." };
  if (file.size > MAX_COVER_BYTES) return { error: "Imagem maior que 5MB." };
  if (!file.type.startsWith("image/")) return { error: "Envie um arquivo de imagem." };

  const blob = await put(`proposal-covers/${randomUUID()}-${file.name}`, file, {
    access: "public",
  });
  return { url: blob.url };
}

type PublicShareResult =
  | { ok: true; share: Awaited<ReturnType<typeof prisma.proposalShare.findUniqueOrThrow>> }
  | { ok: false; reason: "not_found" | "expired" | "revoked" };

export async function getPublicProposal(shareId: string): Promise<PublicShareResult> {
  const share = await prisma.proposalShare.findUnique({ where: { id: shareId } });
  if (!share) return { ok: false, reason: "not_found" };
  return { ok: true, share };
}

export async function getPublicProposalByToken(token: string): Promise<PublicShareResult> {
  const link = await prisma.proposalTemporaryLink.findUnique({
    where: { token },
    include: { share: true },
  });
  if (!link) return { ok: false, reason: "not_found" };
  if (link.revokedAt) return { ok: false, reason: "revoked" };
  if (link.expiresAt.getTime() < Date.now()) return { ok: false, reason: "expired" };
  return { ok: true, share: link.share };
}

export interface SubmitProposalResponseInput {
  shareId: string;
  selectedIda: ClosedFlightSelection | null;
  selectedVolta: ClosedFlightSelection | null;
  observation: string;
  decision: "APROVADO" | "REVISAO";
}

export async function submitProposalResponse(input: SubmitProposalResponseInput) {
  const validated = proposalResponseSchema.safeParse(input);
  if (!validated.success) {
    logger.warn("Tentativa de resposta de proposta com dados inválidos", {
      errors: validated.error.flatten(),
    });
    throw new Error("Dados de resposta inválidos.");
  }

  const { shareId, selectedIda, selectedVolta, observation, decision } = validated.data;

  const existing = await prisma.proposalShare.findUnique({ where: { id: shareId }, select: { clientDecision: true } });
  if (existing?.clientDecision) {
    logger.warn("Tentativa de decidir uma proposta que já foi decidida", { shareId, existingDecision: existing.clientDecision });
    throw new Error("Esta proposta já foi decidida.");
  }

  const updated = await prisma.proposalShare.update({
    where: { id: shareId },
    data: {
      selectedIdaRowId: selectedIda?.rowId ?? null,
      selectedIdaFareId: selectedIda?.fareId ?? null,
      selectedVoltaRowId: selectedVolta?.rowId ?? null,
      selectedVoltaFareId: selectedVolta?.fareId ?? null,
      clientObservation: observation || null,
      clientDecision: decision,
      decidedAt: new Date(),
    },
  });

  logger.info("Decisão do cliente registrada na proposta", {
    shareId,
    decision,
    hasSelection: Boolean(selectedIda || selectedVolta),
  });

  return updated;
}

export interface ProposalCheckoutData {
  travelers: ClientPassenger[];
  contact: {
    email: string;
    ddi: string;
    ddd: string;
    phone: string;
    alternativePhone?: string;
    acceptOffers: boolean;
    acceptAlerts: boolean;
  };
  payment: {
    method: "CARTAO" | "PIX" | "NUPAY" | "AGENCIA";
    cardData?: {
      cardNumber: string;
      cardHolder: string;
      expiry: string;
      installments: number;
    };
    invoice?: {
      fiscalType: "PF" | "PJ";
      foreignTaxpayer: boolean;
      fullName: string;
      cpfCnpj: string;
      cep: string;
    };
    discount: number;
    total: number;
  };
}

/** Resumo estruturado da forma de pagamento escolhida no checkout público,
 * exibido pro agente no painel de pré-emissão da cotação Aprovada. Nunca
 * guarda número de cartão completo nem CVV — só os últimos 4 dígitos. */
export interface ProposalPaymentSummary {
  method: ProposalCheckoutData["payment"]["method"];
  bookingRef: string;
  total: number;
  discount: number;
  cardLast4?: string;
  cardHolder?: string;
  installments?: number;
  invoice?: {
    fiscalType: "PF" | "PJ";
    fullName: string;
    cpfCnpj: string;
    cep: string;
  };
  decidedAt: string;
}

/** Salva um novo passageiro na proposta e o associa ao cliente da proposta */
export async function saveProposalPassengerAction(shareId: string, passenger: ClientPassenger) {
  try {
    const share = await prisma.proposalShare.findUnique({ where: { id: shareId } });
    if (!share) return { ok: false, error: "Proposta não encontrada." };

    const clientSnapshot = (share.clientSnapshot as unknown as ProposalClientSnapshot) || {
      nomeCompleto: "CLIENTE",
      email: "",
      telefone: "",
    };

    const existingList = clientSnapshot.savedPassengers || [];
    // Evita duplicar pelo mesmo documento ou nome completo
    const updatedList = [
      ...existingList.filter((p) => p.id !== passenger.id && p.numeroDocumento !== passenger.numeroDocumento),
      passenger,
    ];

    const updatedSnapshot: ProposalClientSnapshot = {
      ...clientSnapshot,
      savedPassengers: updatedList,
    };

    await prisma.proposalShare.update({
      where: { id: shareId },
      data: {
        clientSnapshot: updatedSnapshot as unknown as Prisma.InputJsonValue,
      },
    });

    return { ok: true, savedPassengers: updatedList };
  } catch (err) {
    logger.error("Falha ao salvar passageiro na proposta", err);
    return { ok: false, error: "Erro ao salvar passageiro." };
  }
}

/** Finaliza a compra na proposta pública com os passageiros, contato e pagamento */
export async function submitProposalCheckoutAction({
  shareId,
  selectedIda,
  selectedVolta,
  checkoutData,
}: {
  shareId: string;
  selectedIda: ClosedFlightSelection | null;
  selectedVolta: ClosedFlightSelection | null;
  checkoutData: ProposalCheckoutData;
}) {
  try {
    const share = await prisma.proposalShare.findUnique({ where: { id: shareId } });
    if (!share) return { ok: false, error: "Proposta não encontrada." };
    if (share.clientDecision) {
      logger.warn("Tentativa de finalizar checkout de uma proposta que já foi decidida", {
        shareId,
        existingDecision: share.clientDecision,
      });
      return { ok: false, error: "Esta proposta já foi decidida." };
    }

    // Extrai nomes para exibição no bilhete / resumo
    const passengerNames = checkoutData.travelers
      .map((t) => `${t.nome} ${t.sobrenome}`.trim())
      .filter(Boolean)
      .join(", ");

    const clientSnapshot = (share.clientSnapshot as unknown as ProposalClientSnapshot) || {
      nomeCompleto: "CLIENTE",
      email: "",
      telefone: "",
    };

    const updatedSnapshot: ProposalClientSnapshot = {
      ...clientSnapshot,
      nomeCompleto: checkoutData.travelers[0]
        ? `${checkoutData.travelers[0].nome} ${checkoutData.travelers[0].sobrenome}`.trim()
        : clientSnapshot.nomeCompleto,
      passageirosNomes: passengerNames || clientSnapshot.passageirosNomes,
      email: checkoutData.contact.email || clientSnapshot.email,
      telefone: `${checkoutData.contact.ddi} ${checkoutData.contact.ddd} ${checkoutData.contact.phone}`.trim(),
      savedPassengers: [
        ...(clientSnapshot.savedPassengers || []),
        ...checkoutData.travelers.filter(
          (t) => !(clientSnapshot.savedPassengers || []).some((sp) => sp.numeroDocumento === t.numeroDocumento)
        ),
      ],
    };

    const isAgency = checkoutData.payment.method === "AGENCIA";
    const prefix = isAgency ? "COT" : "RES";
    const bookingRef = `${prefix}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    const observationText = isAgency
      ? `Solicitação enviada para a agência (#${bookingRef}) | Pagamento a combinar com consultor | Contato: ${checkoutData.contact.email} / ${checkoutData.contact.ddi} ${checkoutData.contact.ddd} ${checkoutData.contact.phone}`
      : `Pedido #${bookingRef} | Método: ${checkoutData.payment.method} | NF: ${checkoutData.payment.invoice?.fullName || ""} (${checkoutData.payment.invoice?.cpfCnpj || ""})`;

    const decidedAt = new Date();
    const paymentSummary: ProposalPaymentSummary = {
      method: checkoutData.payment.method,
      bookingRef,
      total: checkoutData.payment.total,
      discount: checkoutData.payment.discount,
      cardLast4: checkoutData.payment.cardData?.cardNumber.replace(/\D/g, "").slice(-4) || undefined,
      cardHolder: checkoutData.payment.cardData?.cardHolder || undefined,
      installments: checkoutData.payment.cardData?.installments,
      invoice: checkoutData.payment.invoice
        ? {
            fiscalType: checkoutData.payment.invoice.fiscalType,
            fullName: checkoutData.payment.invoice.fullName,
            cpfCnpj: checkoutData.payment.invoice.cpfCnpj,
            cep: checkoutData.payment.invoice.cep,
          }
        : undefined,
      decidedAt: decidedAt.toISOString(),
    };

    const updated = await prisma.proposalShare.update({
      where: { id: shareId },
      data: {
        selectedIdaRowId: selectedIda?.rowId ?? null,
        selectedIdaFareId: selectedIda?.fareId ?? null,
        selectedVoltaRowId: selectedVolta?.rowId ?? null,
        selectedVoltaFareId: selectedVolta?.fareId ?? null,
        clientDecision: "APROVADO",
        clientObservation: observationText,
        decidedAt,
        clientSnapshot: updatedSnapshot as unknown as Prisma.InputJsonValue,
        checkoutPayment: paymentSummary as unknown as Prisma.InputJsonValue,
      },
    });

    logger.info("Checkout registrado na proposta pública", {
      shareId,
      bookingRef,
      isAgency,
      travelersCount: checkoutData.travelers.length,
      method: checkoutData.payment.method,
    });

    return { ok: true, bookingRef, updated };
  } catch (err) {
    logger.error("Falha ao submeter checkout da proposta", err);
    return { ok: false, error: "Não foi possível finalizar o pedido. Tente novamente." };
  }
}

