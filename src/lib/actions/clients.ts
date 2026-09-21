"use server";

import { prisma } from "@/lib/db/prisma";
import { clientSchema } from "@/lib/validation/schemas";
import { logger } from "@/lib/logger";

export interface ActionResult<T> {
  ok: boolean;
  data?: T;
  error?: string;
}

/** Obtém o ID da agência padrão (single-tenant ou agência ativa). Cria se não existir. */
export async function getOrCreateDefaultAgencyId(): Promise<string> {
  const existing = await prisma.agency.findFirst({ select: { id: true } });
  if (existing) return existing.id;

  const created = await prisma.agency.create({
    data: {
      razaoSocial: "Sua Agência de Viagens",
      orcamentoPrefixo: "ORC",
      proximoOrcamentoNumero: 1,
    },
    select: { id: true },
  });
  return created.id;
}

export async function listClientsAction() {
  try {
    const agencyId = await getOrCreateDefaultAgencyId();
    const clients = await prisma.client.findMany({
      where: { agencyId },
      orderBy: { createdAt: "desc" },
    });
    return { ok: true, data: clients };
  } catch (err) {
    logger.error("Falha ao listar clientes no banco", err);
    return { ok: false, error: "Não foi possível carregar a lista de clientes." };
  }
}

export async function getClientAction(id: string) {
  try {
    const client = await prisma.client.findUnique({
      where: { id },
      include: { quotes: { orderBy: { createdAt: "desc" } } },
    });
    if (!client) return { ok: false, error: "Cliente não encontrado." };
    return { ok: true, data: client };
  } catch (err) {
    logger.error("Falha ao obter cliente", err, { id });
    return { ok: false, error: "Erro ao buscar dados do cliente." };
  }
}

export async function createClientAction(input: unknown) {
  try {
    const validated = clientSchema.safeParse(input);
    if (!validated.success) {
      return { ok: false, error: validated.error.issues[0]?.message || "Dados inválidos." };
    }

    const agencyId = await getOrCreateDefaultAgencyId();
    const client = await prisma.client.create({
      data: {
        agencyId,
        nomeCompleto: validated.data.nomeCompleto,
        cpf: validated.data.cpf || null,
        email: validated.data.email || null,
        telefone: validated.data.telefone || null,
        cidade: validated.data.cidade || null,
        endereco: validated.data.endereco || null,
        observacoes: validated.data.observacoes || null,
      },
    });

    logger.info("Cliente criado com sucesso no banco de dados", { clientId: client.id });
    return { ok: true, data: client };
  } catch (err) {
    logger.error("Erro ao criar cliente no banco", err);
    return { ok: false, error: "Falha ao cadastrar cliente." };
  }
}

export async function updateClientAction(id: string, input: unknown) {
  try {
    const validated = clientSchema.partial().safeParse(input);
    if (!validated.success) {
      return { ok: false, error: validated.error.issues[0]?.message || "Dados inválidos." };
    }

    const client = await prisma.client.update({
      where: { id },
      data: {
        ...(validated.data.nomeCompleto ? { nomeCompleto: validated.data.nomeCompleto } : {}),
        ...(validated.data.cpf !== undefined ? { cpf: validated.data.cpf || null } : {}),
        ...(validated.data.email !== undefined ? { email: validated.data.email || null } : {}),
        ...(validated.data.telefone !== undefined ? { telefone: validated.data.telefone || null } : {}),
        ...(validated.data.cidade !== undefined ? { cidade: validated.data.cidade || null } : {}),
        ...(validated.data.endereco !== undefined ? { endereco: validated.data.endereco || null } : {}),
        ...(validated.data.observacoes !== undefined ? { observacoes: validated.data.observacoes || null } : {}),
      },
    });

    logger.info("Cliente atualizado com sucesso no banco", { clientId: id });
    return { ok: true, data: client };
  } catch (err) {
    logger.error("Erro ao atualizar cliente no banco", err, { id });
    return { ok: false, error: "Falha ao atualizar dados do cliente." };
  }
}

export async function deleteClientAction(id: string) {
  try {
    await prisma.client.delete({ where: { id } });
    logger.info("Cliente excluído do banco", { clientId: id });
    return { ok: true };
  } catch (err) {
    logger.error("Erro ao excluir cliente do banco", err, { id });
    return { ok: false, error: "Falha ao excluir cliente." };
  }
}
