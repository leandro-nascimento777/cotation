import { z } from "zod";

/** Schema de validação para cadastro e edição de Clientes. */
export const clientSchema = z.object({
  nomeCompleto: z
    .string()
    .trim()
    .min(2, "Informe ao menos 2 caracteres para o nome do cliente.")
    .max(120, "Nome muito longo (máximo 120 caracteres)."),
  cpf: z
    .string()
    .trim()
    .refine(
      (val) => {
        if (!val) return true;
        const digits = val.replace(/\D/g, "");
        return digits.length === 11;
      },
      { message: "CPF deve conter 11 dígitos." }
    ),
  email: z
    .string()
    .trim()
    .refine(
      (val) => {
        if (!val) return true;
        return z.string().email().safeParse(val).success;
      },
      { message: "Informe um e-mail válido." }
    ),
  telefone: z
    .string()
    .trim()
    .refine(
      (val) => {
        if (!val) return true;
        const digits = val.replace(/\D/g, "");
        return digits.length >= 10 && digits.length <= 15;
      },
      { message: "Telefone deve conter DDD e de 8 a 9 dígitos." }
    ),
  cidade: z.string().trim().max(80, "Máximo de 80 caracteres.").optional().default(""),
  endereco: z.string().trim().max(200, "Máximo de 200 caracteres.").optional().default(""),
  passaporte: z.string().trim().max(30, "Máximo de 30 caracteres.").optional().default(""),
  avatarUrl: z.string().trim().optional().default(""),
  observacoes: z.string().trim().max(1000, "Máximo de 1000 caracteres.").optional().default(""),
  passageiros: z.array(z.any()).optional(),
});

/** Schema de validação para Membros da Equipe. */
export const teamMemberSchema = z.object({
  nome: z
    .string()
    .trim()
    .min(2, "Informe ao menos 2 caracteres para o nome.")
    .max(100, "Nome muito longo."),
  cargo: z.string().trim().max(80, "Cargo muito longo.").optional().default(""),
  email: z
    .string()
    .trim()
    .refine(
      (val) => {
        if (!val) return true;
        return z.string().email().safeParse(val).success;
      },
      { message: "Informe um e-mail válido." }
    ),
  telefone: z.string().trim().max(30, "Telefone muito longo.").optional().default(""),
  ativo: z.boolean().default(true),
});
