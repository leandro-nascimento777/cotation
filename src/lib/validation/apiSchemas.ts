import { z } from "zod";

/** Schema de validação para requisições de extração de print via IA. */
export const extractRequestSchema = z.object({
  image: z
    .string()
    .min(100, "A imagem enviada é inválida ou está corrompida.")
    .max(15 * 1024 * 1024, "A imagem excede o tamanho máximo permitido (15MB).")
    .refine(
      (val) => val.startsWith("data:image/"),
      "A imagem precisa estar no formato data URL (data:image/...)."
    ),
});

/** Schema de validação para trecho de voo (FlightLeg). */
export const flightLegSchema = z.object({
  airline: z.string().default(""),
  flightNumber: z.string().default(""),
  date: z.string().default(""),
  departureTime: z.string().default(""),
  arrivalTime: z.string().default(""),
  duration: z.string().default(""),
  origin: z.string().default(""),
  destination: z.string().default(""),
  stops: z.number().nonnegative().default(0),
  aircraft: z.string().default(""),
});

/** Schema de validação para item selecionável de cotação (QuoteItem). */
export const quoteItemSchema = z.object({
  rowId: z.string(),
  fareId: z.string(),
  ida: flightLegSchema.optional(),
  volta: flightLegSchema.optional(),
  baggage: z.string().default(""),
  fareLabel: z.string().default(""),
  fareClass: z.string().default(""),
  price: z.number().nonnegative("Preço inválido."),
  currency: z.string().default("BRL"),
  selected: z.boolean(),
});

/** Schema de dados da agência para geração de PDF de cotação. */
export const agencyInfoSchema = z.object({
  agencyName: z.string().min(1, "Nome da agência é obrigatório."),
  branch: z.string().default(""),
  sellerName: z.string().default(""),
  email: z.string().default(""),
  phone: z.string().default(""),
  message: z.string().default(""),
  notes: z.string().default(""),
  logoDataUrl: z.string().default(""),
  validityHours: z.number().positive().default(24),
  cnpj: z.string().default(""),
  cadastur: z.string().default(""),
});

/** Schema da rota /api/pdf */
export const generatePdfSchema = z.object({
  agency: agencyInfoSchema,
  items: z.array(quoteItemSchema).min(1, "Envie ao menos um voo."),
  numeroOrcamento: z.string().optional(),
  corPrimaria: z.string().optional(),
  corSecundaria: z.string().optional(),
  corTexto: z.string().optional(),
});

/** Schema para resposta do cliente na proposta pública. */
export const proposalResponseSchema = z.object({
  shareId: z.string().min(1, "Identificador da proposta inválido."),
  selectedIda: z
    .object({
      rowId: z.string(),
      fareId: z.string(),
    })
    .nullable()
    .optional(),
  selectedVolta: z
    .object({
      rowId: z.string(),
      fareId: z.string(),
    })
    .nullable()
    .optional(),
  observation: z.string().max(2000, "Observação excede o limite de 2000 caracteres.").default(""),
  decision: z.enum(["APROVADO", "REVISAO"]),
});
