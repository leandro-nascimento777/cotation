import { NextRequest, NextResponse } from "next/server";
import { generateObject } from "ai";
import { google } from "@ai-sdk/google";
import { extractionResultSchema } from "@/lib/schema";
import { extractRequestSchema } from "@/lib/validation/apiSchemas";
import { checkRateLimit, getClientIp } from "@/lib/security/rateLimit";
import { logger } from "@/lib/logger";
import { FlightRow } from "@/lib/types";

export const runtime = "nodejs";
export const maxDuration = 60;

const MODEL = process.env.GEMINI_MODEL || "gemini-3.8-flash";

const EXTRACTION_PROMPT = `Você é um extrator de dados especializado em telas de sistemas de emissão de \
passagens aéreas usadas por agências de viagem no Brasil.

A imagem em anexo pode vir em UM destes três formatos — identifique qual é antes de extrair:

FORMATO 1 — Tabela plana de voos de ida (colunas comuns: Cia, Voo, Saída, Chegada, Dur. Total., \
Origem, Destino, Dur. Con., Esc., Equip., Tipo, e duas seções de preço lado a lado — "Sem Bagagem" e \
"Com Bagagem" — cada uma com uma tag de tarifa, ex: LIG, AZU, CLA, STA, e um valor em reais). Extraia \
CADA LINHA da tabela como um item em "rows", preenchendo só "ida" (deixe "volta" ausente). Se a linha \
tiver as duas colunas de preço (sem e com bagagem), gere duas entradas em "fares" para essa linha.

FORMATO 2 — Duas tabelas SEPARADAS, uma pra cada trecho (geralmente com um título "Trecho Ida" acima \
de uma tabela e "Trecho Volta" acima de outra, cada uma com sua própria numeração/paginação) — cada \
tabela tem a MESMA estrutura de colunas do Formato 1, com preço PRÓPRIO por linha (não um preço \
combinado). Extraia cada linha da tabela de ida como um "row" preenchendo só "ida" (deixe "volta" \
ausente nessa linha), e cada linha da tabela de volta como um "row" separado preenchendo só "volta" \
(deixe "ida" ausente nessa linha) — NÃO tente combinar uma linha de ida com uma de volta nesse \
formato, elas são independentes. Extraia só as linhas visíveis (não invente as de outras páginas de \
paginação que não aparecem na imagem).

FORMATO 3 — Cards de pacote ida e volta: cada card tem uma seção "Ida" (data + lista de opções de \
voo com rádio/checkbox, uma delas marcada/selecionada) e uma seção "Volta" (mesma estrutura) DENTRO \
DO MESMO CARD, mais um painel de preço com o valor total daquele card (ex: "Valor total R$ 922,06"), \
tags de bagagem (ex: "Até 12kg") e classe (ex: "Econômica"). Para CADA CARD, gere UMA entrada em \
"rows" com "ida" = a opção de voo marcada/selecionada na seção Ida, "volta" = a opção marcada/\
selecionada na seção Volta, e UMA entrada em "fares" com o preço TOTAL do painel daquele card (prefira \
"Valor total" se houver também um preço promocional de forma de pagamento, ex: "No Pix"). NÃO gere \
combinações hipotéticas com as outras opções de rádio não selecionadas — elas não têm preço próprio \
visível.

Em todos os formatos: máxima fidelidade ao que está escrito — não traduza, não arredonde, não invente \
valores nem preencha campos que não conseguir ler (use "" para texto ou 0 para número quando não \
houver o dado). Converta valores como "R$ 1.917,15" para o número 1917.15.

Se a imagem mostrar, em algum resumo/filtro de busca (barra de pesquisa, cabeçalho da tela, etc.), a \
quantidade de passageiros (ex: "1 Adulto", "2 Adultos, 1 Criança, 1 Bebê"), preencha o campo \
"passengers" de acordo. Se essa informação não estiver visível em nenhum lugar da imagem, deixe \
"passengers" ausente — não invente uma quantidade.`;

export async function POST(req: NextRequest) {
  const clientIp = getClientIp(req);

  // Rate limit: máx 10 requisições por minuto por IP para proteger a cota da API
  const rateLimit = checkRateLimit(`extract:${clientIp}`, { limit: 10, windowSeconds: 60 });
  if (!rateLimit.allowed) {
    logger.warn("Rate limit excedido na extração de IA", { clientIp });
    return NextResponse.json(
      { error: "Muitas requisições de extração. Aguarde alguns instantes e tente novamente." },
      {
        status: 429,
        headers: { "Retry-After": String(rateLimit.resetInSeconds) },
      }
    );
  }

  try {
    if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
      logger.error("Chave GOOGLE_GENERATIVE_AI_API_KEY não configurada no servidor.");
      return NextResponse.json(
        {
          error:
            "GOOGLE_GENERATIVE_AI_API_KEY não configurada no servidor. Crie uma chave gratuita em https://aistudio.google.com/apikey e adicione em .env.local.",
        },
        { status: 500 }
      );
    }

    const body = await req.json().catch(() => null);
    const parsed = extractRequestSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Payload de imagem inválido." },
        { status: 400 }
      );
    }

    const result = await generateObject({
      model: google(MODEL),
      schema: extractionResultSchema,
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: EXTRACTION_PROMPT },
            { type: "image", image: parsed.data.image },
          ],
        },
      ],
    });

    const rows: FlightRow[] = result.object.rows.map((row, rIdx) => ({
      id: `row-${rIdx}`,
      ida: row.ida,
      volta: row.volta,
      fares: row.fares.map((fare, fIdx) => ({
        id: `row-${rIdx}-fare-${fIdx}`,
        baggage: fare.baggage,
        fareLabel: fare.fareLabel,
        fareClass: fare.fareClass,
        price: fare.price,
        currency: fare.currency || "BRL",
      })),
    }));

    logger.info("Extração de voos concluída com sucesso", {
      clientIp,
      rowsCount: rows.length,
    });

    return NextResponse.json({ rows, passengers: result.object.passengers ?? null });
  } catch (err) {
    logger.error("Erro na extração de voos via Gemini", err, { clientIp });
    const message = err instanceof Error ? err.message : "Erro desconhecido na extração.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
