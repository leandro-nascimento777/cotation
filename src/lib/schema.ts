import { z } from "zod";

// Schema usado no generateObject (IA) para extrair, de forma fiel, os voos
// de um print de tela. Mantemos os textos exatamente como aparecem na
// imagem (não traduzir, não arredondar, não inventar valores).
//
// Suporta três formatos de print:
// 1) Tabela plana só de ida (uma linha por voo) — cada linha vira um "row"
//    com só "ida" preenchido.
// 2) Duas tabelas independentes "Trecho Ida" / "Trecho Volta" (cada uma com
//    suas próprias linhas e preços próprios, ex: sistemas de consolidadora)
//    — linhas da tabela de ida viram "rows" só com "ida"; linhas da tabela
//    de volta viram "rows" só com "volta".
// 3) Cards de pacote ida+volta (seção "Ida" + seção "Volta" dentro do MESMO
//    card, com uma combinação selecionada e um preço TOTAL combinado) —
//    cada card vira um "row" com "ida" E "volta" preenchidos.

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

export const flightRowSchema = z
  .object({
    ida: flightLegSchema
      .optional()
      .describe(
        'Trecho de ida. Preencha quando a linha vier de uma tabela/seção de IDA, ou quando for a perna de ida de um card de pacote combinado (nesse caso "volta" também vem preenchido). Deixe ausente numa linha que representa só um trecho de VOLTA (tabela "Trecho Volta" separada).'
      ),
    volta: flightLegSchema
      .optional()
      .describe(
        'Trecho de volta. Preencha quando a linha vier de uma tabela/seção de VOLTA separada (nesse caso "ida" fica ausente NESSA linha — a tabela de ida já gerou linhas próprias), ou quando for a perna de volta de um card de pacote combinado (nesse caso "ida" também vem preenchido, representando a MESMA linha/preço).'
      ),
    fares: z
      .array(fareOptionSchema)
      .describe(
        "Opções de tarifa/preço para este trecho (ou para a combinação ida+volta, se ambos preenchidos). Numa tabela plana, normalmente 2 (sem/com bagagem). Num card de pacote ida+volta combinado, normalmente 1 (o preço total do card)."
      ),
  })
  .refine((row) => row.ida || row.volta, {
    message: "Cada linha precisa ter pelo menos um trecho (ida ou volta) preenchido.",
  });

export const passengersSchema = z.object({
  adults: z.number().int().describe('Número de adultos, se aparecer em algum resumo/filtro de busca visível na tela (ex: "1 Adulto"). Use 1 se não conseguir identificar.'),
  children: z.number().int().describe("Número de crianças, se visível. Use 0 se não conseguir identificar."),
  infants: z.number().int().describe("Número de bebês/colo, se visível. Use 0 se não conseguir identificar."),
});

export const extractionResultSchema = z.object({
  rows: z.array(flightRowSchema),
  passengers: passengersSchema
    .optional()
    .describe(
      'Contagem de passageiros, SÓ quando aparecer explicitamente em algum resumo/filtro de busca na tela (ex: "1 Adulto", "2 Adultos, 1 Criança"). Deixe ausente se essa informação não estiver visível na imagem — não invente.'
    ),
});

export type ExtractionResult = z.infer<typeof extractionResultSchema>;
