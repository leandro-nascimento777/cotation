import { z } from "zod";

// Schema usado no generateObject (IA) para extrair, de forma fiel, a tabela
// de voos de um print de tela. Mantemos os textos exatamente como aparecem
// na imagem (não traduzir, não arredondar, não inventar valores).

export const fareOptionSchema = z.object({
  baggage: z
    .enum(["sem", "com"])
    .describe('"sem" para a coluna "Sem Bagagem", "com" para "Com Bagagem"'),
  fareLabel: z
    .string()
    .describe('Rótulo/tag da tarifa como aparece, ex: "LIG", "AZU", "CLA", "STA", "+AZ"'),
  fareClass: z
    .string()
    .describe('Código curto próximo à tarifa (tipo/classe), ex: "OW", letra da cabine (E, H, P, M...)'),
  price: z
    .number()
    .describe('Valor numérico em reais, sem "R$" e com ponto decimal, ex: 1917.15 para "R$ 1.917,15"'),
  currency: z.string().default("BRL"),
});

export const flightRowSchema = z.object({
  airline: z.string().describe('Companhia aérea, ex: "GOL", "Azul", "LATAM"'),
  flightNumber: z.string().describe("Número do voo"),
  date: z.string().describe('Data de saída como exibida, ex: "18 Set"'),
  departureTime: z.string().describe("Horário de saída, ex: 10:15"),
  arrivalTime: z.string().describe("Horário de chegada, ex: 11:30"),
  duration: z.string().describe('Duração total do voo, ex: "01:15"'),
  origin: z.string().describe('Origem (código + cidade), ex: "GRU - São Paulo"'),
  destination: z.string().describe('Destino (código + cidade), ex: "CNF - Belo Horizonte"'),
  stops: z.number().int().describe('Número de escalas/conexões (coluna "Esc.")'),
  aircraft: z.string().describe('Equipamento/aeronave (coluna "Equip.")'),
  fares: z.array(fareOptionSchema).describe("Opções de tarifa desta linha (sem/com bagagem)"),
});

export const extractionResultSchema = z.object({
  rows: z.array(flightRowSchema),
});

export type ExtractionResult = z.infer<typeof extractionResultSchema>;
