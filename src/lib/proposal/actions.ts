"use server";

import { randomUUID } from "crypto";
import { put } from "@vercel/blob";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import { ClosedFlightSelection } from "@/lib/store/types";
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
  nomeCompleto: string;
  telefone: string;
  email: string;
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
    selectedIdaRowId: null,
    selectedIdaFareId: null,
    selectedVoltaRowId: null,
    selectedVoltaFareId: null,
    clientObservation: null,
    clientDecision: null,
    decidedAt: null,
  };

  return prisma.proposalShare.upsert({
    where: { quoteLocalId: input.quoteLocalId },
    create: { quoteLocalId: input.quoteLocalId, ...data },
    update: data,
  });
}

export async function getProposalShareByQuote(quoteLocalId: string) {
  return prisma.proposalShare.findUnique({
    where: { quoteLocalId },
    include: { temporaryLinks: { orderBy: { createdAt: "desc" } } },
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
  await prisma.proposalShare.update({
    where: { id: input.shareId },
    data: {
      selectedIdaRowId: input.selectedIda?.rowId ?? null,
      selectedIdaFareId: input.selectedIda?.fareId ?? null,
      selectedVoltaRowId: input.selectedVolta?.rowId ?? null,
      selectedVoltaFareId: input.selectedVolta?.fareId ?? null,
      clientObservation: input.observation || null,
      clientDecision: input.decision,
      decidedAt: new Date(),
    },
  });
}
