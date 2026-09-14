import { z } from "zod";

// Schema usado no generateObject (IA) para extrair, de forma fiel, os voos
// de um print de tela. Mantemos os textos exatamente como aparecem na
// imagem (não traduzir, não arredondar, não inventar valores).
//
// Suporta dois formatos de print:
// 1) Tabela plana só de ida (uma linha por voo, com colunas De/Para/Cia/
//    Voo/Data/Partida/Chegada) — cada linha vira um "row" com só "ida".
// 2) Cards de pacote ida+volta (seção "Ida" com opções de voo + seção
//    "Volta" com opções de voo + um preço total combinado por card) — cada
//    card com uma combinação selecionada (rádio preenchido) vira um "row"
//    com "ida" E "volta" preenchidos.

export const flightLegSchema = z.object({
  airline: z.string().describe('Companhia aérea, ex: "GOL", "Azul", "LATAM"'),
  flightNumber: z.string().describe('Número do voo, ou "" se não estiver visível'),
  date: z.string().describe('Data do voo como exibida, ex: "18 Set" ou "25/09/26"'),
  departureTime: z.string().describe("Horário de saída, ex: 10:15"),
  arrivalTime: z.string().describe("Horário de chegada, ex: 11:30"),
  duration: z.string().describe('Duração do voo como exibida, ex: "01:15" ou "1h5m"'),
  origin: z.string().describe('Origem (código, e cidade se visível), ex: "GRU - São Paulo" ou só "CNF"'),
  destination: z.string().describe('Destino (código, e cidade se visível), ex: "CNF - Belo Horizonte" ou só "GIG"'),
  stops: z.number().int().describe('Número de escalas/conexões (0 se "Direto")'),
  aircraft: z.string().describe('Equipamento/aeronave, ou "" se não estiver visível'),
});

export const fareOptionSchema = z.object({
  baggage: z
    .string()
    .describe(
      'Descrição da bagagem já formatada e pronta pra exibir ao cliente, ex: "Sem bagagem despachada", "Com bagagem despachada", "Até 12kg de bagagem despachada" — baseado na coluna/tag de bagagem do print (ex: "Sem Bagagem", "Com Bagagem", "Até 12kg")'
    ),
  fareLabel: z
    .string()
    .describe('Rótulo/tag da tarifa ou classe como aparece, ex: "LIG", "AZU", "CLA", "STA", "Econômica"'),
  fareClass: z
    .string()
    .describe('Código curto próximo à tarifa (tipo/classe), ex: "OW", letra da cabine (E, H, P, M...), ou ""'),
  price: z
    .number()
    .describe(
      'Valor TOTAL dessa opção em reais, sem "R$" e com ponto decimal, ex: 1917.15 para "R$ 1.917,15". Se o card tiver um preço "Valor total" separado de um preço com desconto de forma de pagamento (ex: "No Pix"), use o "Valor total".'
    ),
  currency: z.string().default("BRL"),
});

export const flightRowSchema = z.object({
  ida: flightLegSchema.describe("Trecho de ida — sempre presente"),
  volta: flightLegSchema
    .optional()
    .describe(
      'Trecho de volta — preencha SÓ se o print mostrar um pacote de ida e volta com uma combinação selecionada (rádio/checkbox marcado) e um preço combinado. Se o print for só uma tabela de voos de ida, deixe "volta" ausente.'
    ),
  fares: z
    .array(fareOptionSchema)
    .describe(
      "Opções de tarifa/preço para esta combinação de ida (+volta, se houver). Numa tabela plana, normalmente 2 (sem/com bagagem). Num card de pacote ida+volta, normalmente 1 (o preço total exibido no painel daquele card)."
    ),
});

export const extractionResultSchema = z.object({
  rows: z.array(flightRowSchema),
});

export type ExtractionResult = z.infer<typeof extractionResultSchema>;
