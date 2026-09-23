import { NextRequest, NextResponse } from "next/server";
import { generateObject } from "ai";
import { google } from "@ai-sdk/google";
import { z } from "zod";
import { checkRateLimit, getClientIp } from "@/lib/security/rateLimit";
import { logger } from "@/lib/logger";

export const runtime = "nodejs";
export const maxDuration = 60;

const MODEL = process.env.GEMINI_MODEL || "gemini-3.8-flash";

const ticketExtractionSchema = z.object({
  localizador: z.string().describe("Código localizador da reserva / PNR (ex: ANRXK4)"),
  numeroBilhete: z.string().describe("Número do bilhete eletrônico (ex: 001 4894551527/28)"),
  clienteNome: z.string().describe("Nome do passageiro principal (ex: Hugo Cordeiro)"),
  clienteEmail: z.string().describe("E-mail de contato que aparece no bilhete, ou vazio"),
  clienteTelefone: z.string().describe("Telefone de contato que aparece no bilhete, ou vazio"),
  emissor: z.string().describe("Agência, consolidadora ou sistema emissor (ex: SAKURA CONSOLIDADORA)"),
  dataEmissao: z.string().describe("Data da emissão do bilhete (ex: 21/09/2026)"),
  passageiros: z.array(
    z.object({
      nome: z.string().describe("Nome completo do passageiro"),
      tipo: z.string().describe("Tipo: Adulto, Criança (CHD) ou Bebê (INF)"),
      documento: z.string().describe("Documento se disponível, ou vazio"),
      bilheteNumero: z.string().describe("Número individual do e-ticket do passageiro, se houver"),
    })
  ),
  voos: z.array(
    z.object({
      ciaAerea: z.string().describe("Nome da companhia aérea (ex: American Airlines, Gol, Latam)"),
      numeroVoo: z.string().describe("Código e número do voo (ex: AA 974, G3 1420)"),
      trechoTipo: z.enum(["IDA", "VOLTA", "INTERNO"]).describe("Tipo de trecho"),
      origemCodigo: z.string().describe("Código IATA da origem (ex: GIG, GRU)"),
      origemNome: z.string().describe("Cidade ou aeroporto de origem"),
      origemTerminal: z.string().describe("Terminal de embarque se disponível"),
      destinoCodigo: z.string().describe("Código IATA do destino (ex: JFK, MIA, MCO)"),
      destinoNome: z.string().describe("Cidade ou aeroporto de destino"),
      destinoTerminal: z.string().describe("Terminal de desembarque se disponível"),
      dataPartida: z.string().describe("Data da partida (ex: 02 FEV 2027)"),
      horaPartida: z.string().describe("Horário de partida (ex: 23:00)"),
      dataChegada: z.string().describe("Data de chegada (ex: 03 FEV 2027)"),
      horaChegada: z.string().describe("Horário de chegada (ex: 07:10)"),
      classe: z.string().describe("Classe tarifária ou de cabine (ex: Q, S, Econômica)"),
      escalas: z.number().int().describe("Número de escalas (0 para voo direto)"),
      aeronave: z.string().describe("Modelo do avião (ex: Boeing 787-8, Airbus A321)"),
      localizadorCia: z.string().describe("Localizador na cia aérea se houver"),
      baseTarifaria: z.string().describe("Base tarifária se houver (ex: ONN8NHM1C)"),
      bagagem: z.string().describe("Regra de bagagem (ex: 1 peça despachada, mala de mão)"),
      assento: z.string().describe("Assento marcado se houver (ex: 23B)"),
    })
  ),
  valorTarifa: z.number().optional().describe("Valor da tarifa em reais"),
  valorTaxas: z.number().optional().describe("Valor das taxas em reais"),
  valorTotal: z.number().optional().describe("Valor total em reais"),
  moeda: z.string().default("BRL"),
  instrucoesEmbarque: z.string().describe("Instruções de check-in e embarque"),
  observacoes: z.string().describe("Observações sobre alterações ou cancelamentos"),
});

const PROMPT_EXTRACTION = `Você é um especialista em bilhetes aéreos eletrônicos (e-tickets) de companhias aéreas e consolidadoras de viagens no Brasil (ex: Sakura, Confiança, RexturAdvance, Ancoradouro, CVC, Flytour, etc.).

Extraia de forma precisa, sem inventar dados:
1. Localizador da reserva (PNR de 6 caracteres alfanuméricos)
2. Número do bilhete eletrônico (ex: 001 4894551527)
3. Passageiro(s) com nomes e assentos marcados em cada voo
4. Todos os voos em ordem cronológica com Cia, Número do voo, Origem e Destino com código IATA e terminais, datas e horários de partida e chegada, aeronave, classe, bagagem e assento.
5. Regras de apresentação no check-in (ex: 2 horas antes voos nacionais, 3 horas internacionais) e documentação necessária.`;

export async function POST(req: NextRequest) {
  const clientIp = getClientIp(req);
  const rateLimit = checkRateLimit(`extract-ticket:${clientIp}`, { limit: 12, windowSeconds: 60 });
  if (!rateLimit.allowed) {
    logger.warn("Rate limit excedido na extração de e-ticket", { clientIp });
    return NextResponse.json(
      { error: "Muitas requisições de extração. Aguarde alguns instantes." },
      { status: 429, headers: { "Retry-After": String(rateLimit.resetInSeconds) } }
    );
  }

  try {
    if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
      return NextResponse.json(
        { error: "GOOGLE_GENERATIVE_AI_API_KEY não configurada no servidor." },
        { status: 500 }
      );
    }

    const body = await req.json().catch(() => null);
    if (!body || (!body.fileBase64 && !body.text)) {
      return NextResponse.json(
        { error: "Forneça o arquivo do e-ticket (PDF/imagem) ou o texto do bilhete." },
        { status: 400 }
      );
    }

    const userContent: Array<
      | { type: "text"; text: string }
      | { type: "file"; data: Buffer; mediaType: string }
      | { type: "image"; image: string }
    > = [{ type: "text", text: PROMPT_EXTRACTION }];

    if (body.fileBase64) {
      const mimeType = body.mimeType || "application/pdf";
      const cleanBase64 = body.fileBase64.replace(/^data:[^;]+;base64,/, "");
      const buffer = Buffer.from(cleanBase64, "base64");

      if (mimeType.startsWith("image/")) {
        userContent.push({
          type: "image",
          image: cleanBase64,
        });
      } else {
        userContent.push({
          type: "file",
          data: buffer,
          mediaType: mimeType,
        });
      }
    } else if (body.text) {
      userContent.push({
        type: "text",
        text: `Texto do e-ticket:\n\n${body.text}`,
      });
    }

    const result = await generateObject({
      model: google(MODEL),
      schema: ticketExtractionSchema,
      messages: [{ role: "user", content: userContent }],
    });

    logger.info("E-ticket extraído com sucesso", {
      localizador: result.object.localizador,
      voosCount: result.object.voos.length,
      passageirosCount: result.object.passageiros.length,
    });

    return NextResponse.json({ ok: true, data: result.object });
  } catch (err) {
    logger.error("Falha ao extrair dados do e-ticket", err);
    return NextResponse.json(
      { error: "Não foi possível extrair os dados do bilhete. Verifique o arquivo e tente novamente." },
      { status: 500 }
    );
  }
}

