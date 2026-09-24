"use server";

import { prisma } from "@/lib/db/prisma";
import { getOrCreateDefaultAgencyId } from "./clients";
import { logger } from "@/lib/logger";
import { QuoteItem } from "@/lib/types";

export interface CreateQuoteActionInput {
  numero: string;
  clientId?: string | null;
  responsavelId?: string | null;
  sellerName?: string;
  sellerEmail?: string;
  sellerPhone?: string;
  destino?: string;
  periodoInicio?: string;
  periodoFim?: string;
  paymentMethod?: "AVISTA" | "CARTAO_PARCELADO" | "BOLETO" | "OUTRO" | "";
  mensagemDestaque?: string;
  observacoes?: string;
  valorTotal?: number;
  flightItems: QuoteItem[];
}

export async function createQuoteAction(input: CreateQuoteActionInput) {
  try {
    const agencyId = await getOrCreateDefaultAgencyId();

    // Executa em transação para garantir que cotação e opções de voo sejam salvas atomicamente
    const createdQuote = await prisma.$transaction(async (tx) => {
      const quote = await tx.quote.create({
        data: {
          agencyId,
          numero: input.numero,
          clientId: input.clientId || null,
          responsavelId: input.responsavelId || null,
          sellerName: input.sellerName || null,
          sellerEmail: input.sellerEmail || null,
          sellerPhone: input.sellerPhone || null,
          destino: input.destino || null,
          periodoInicio: input.periodoInicio ? new Date(input.periodoInicio) : null,
          periodoFim: input.periodoFim ? new Date(input.periodoFim) : null,
          paymentMethod: input.paymentMethod || null,
          mensagemDestaque: input.mensagemDestaque || null,
          observacoes: input.observacoes || null,
          valorTotal: input.valorTotal !== undefined ? input.valorTotal : null,
        },
      });

      if (input.flightItems.length > 0) {
        await tx.flightOption.createMany({
          data: input.flightItems.map((item) => {
            const leg = item.ida ?? item.volta;
            return {
              quoteId: quote.id,
              airline: leg?.airline || "",
              flightNumber: leg?.flightNumber || "",
              date: leg?.date || "",
              departureTime: leg?.departureTime || "",
              arrivalTime: leg?.arrivalTime || "",
              duration: leg?.duration || "",
              origin: leg?.origin || "",
              destination: leg?.destination || "",
              stops: leg?.stops || 0,
              aircraft: leg?.aircraft || null,
              baggage: item.baggage,
              fareLabel: item.fareLabel,
              fareClass: item.fareClass || null,
              price: item.price,
              currency: item.currency || "BRL",
              selected: item.selected,
            };
          }),
        });
      }

      return quote;
    });

    logger.info("Cotação e opções salvas com sucesso no banco", {
      quoteId: createdQuote.id,
      numero: input.numero,
      itemsCount: input.flightItems.length,
    });

    return { ok: true, data: createdQuote };
  } catch (err) {
    logger.error("Erro ao criar cotação no banco", err);
    return { ok: false, error: "Falha ao salvar cotação." };
  }
}

export async function deleteQuoteAction(id: string) {
  try {
    await prisma.quote.delete({ where: { id } });
    logger.info("Cotação excluída do banco", { quoteId: id });
    return { ok: true };
  } catch (err) {
    logger.error("Erro ao excluir cotação do banco", err, { id });
    return { ok: false, error: "Falha ao excluir cotação." };
  }
}
