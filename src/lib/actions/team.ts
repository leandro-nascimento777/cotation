"use server";

import { prisma } from "@/lib/db/prisma";
import { teamMemberSchema } from "@/lib/validation/schemas";
import { getOrCreateDefaultAgencyId } from "./clients";
import { logger } from "@/lib/logger";

export async function listTeamMembersAction() {
  try {
    const agencyId = await getOrCreateDefaultAgencyId();
    const members = await prisma.teamMember.findMany({
      where: { agencyId },
      orderBy: { createdAt: "desc" },
    });
    return { ok: true, data: members };
  } catch (err) {
    logger.error("Falha ao listar equipe no banco", err);
    return { ok: false, error: "Não foi possível carregar a lista da equipe." };
  }
}

export async function createTeamMemberAction(input: unknown) {
  try {
    const validated = teamMemberSchema.safeParse(input);
    if (!validated.success) {
      return { ok: false, error: validated.error.issues[0]?.message || "Dados inválidos." };
    }

    const agencyId = await getOrCreateDefaultAgencyId();
    const member = await prisma.teamMember.create({
      data: {
        agencyId,
        nome: validated.data.nome,
        cargo: validated.data.cargo || null,
        email: validated.data.email || null,
        telefone: validated.data.telefone || null,
        ativo: validated.data.ativo ?? true,
      },
    });

    logger.info("Membro da equipe criado no banco", { memberId: member.id });
    return { ok: true, data: member };
  } catch (err) {
    logger.error("Erro ao criar membro da equipe no banco", err);
    return { ok: false, error: "Falha ao cadastrar pessoa na equipe." };
  }
}

export async function updateTeamMemberAction(id: string, input: unknown) {
  try {
    const validated = teamMemberSchema.partial().safeParse(input);
    if (!validated.success) {
      return { ok: false, error: validated.error.issues[0]?.message || "Dados inválidos." };
    }

    const member = await prisma.teamMember.update({
      where: { id },
      data: {
        ...(validated.data.nome ? { nome: validated.data.nome } : {}),
        ...(validated.data.cargo !== undefined ? { cargo: validated.data.cargo || null } : {}),
        ...(validated.data.email !== undefined ? { email: validated.data.email || null } : {}),
        ...(validated.data.telefone !== undefined ? { telefone: validated.data.telefone || null } : {}),
        ...(validated.data.ativo !== undefined ? { ativo: validated.data.ativo } : {}),
      },
    });

    logger.info("Membro da equipe atualizado no banco", { memberId: id });
    return { ok: true, data: member };
  } catch (err) {
    logger.error("Erro ao atualizar membro da equipe no banco", err, { id });
    return { ok: false, error: "Falha ao atualizar dados da pessoa." };
  }
}

export async function deleteTeamMemberAction(id: string) {
  try {
    await prisma.teamMember.delete({ where: { id } });
    logger.info("Membro da equipe removido do banco", { memberId: id });
    return { ok: true };
  } catch (err) {
    logger.error("Erro ao remover membro da equipe do banco", err, { id });
    return { ok: false, error: "Falha ao remover pessoa da equipe." };
  }
}
