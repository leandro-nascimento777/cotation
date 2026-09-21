"use server";

import { prisma } from "@/lib/db/prisma";
import { getOrCreateDefaultAgencyId } from "./clients";
import { logger } from "@/lib/logger";

export async function getAgencyAction() {
  try {
    const agencyId = await getOrCreateDefaultAgencyId();
    const agency = await prisma.agency.findUnique({
      where: { id: agencyId },
    });
    return { ok: true, data: agency };
  } catch (err) {
    logger.error("Falha ao obter configurações da agência no banco", err);
    return { ok: false, error: "Não foi possível carregar as configurações da agência." };
  }
}

export async function updateAgencyAction(patch: {
  razaoSocial?: string;
  nomeFantasia?: string;
  cnpj?: string;
  cadastur?: string;
  site?: string;
  logoUrl?: string;
  endereco?: string;
  telefone?: string;
  email?: string;
  vendedorPadraoNome?: string;
  vendedorPadraoEmail?: string;
  vendedorPadraoTelefone?: string;
  orcamentoPrefixo?: string;
  proximoOrcamentoNumero?: number;
  pdfCorPrimaria?: string;
  pdfCorSecundaria?: string;
  pdfCorTexto?: string;
  pdfUsarLogoAgencia?: boolean;
}) {
  try {
    const agencyId = await getOrCreateDefaultAgencyId();
    const updated = await prisma.agency.update({
      where: { id: agencyId },
      data: patch,
    });
    logger.info("Configurações da agência salvas no banco", { agencyId });
    return { ok: true, data: updated };
  } catch (err) {
    logger.error("Falha ao atualizar configurações da agência no banco", err);
    return { ok: false, error: "Erro ao salvar configurações." };
  }
}
