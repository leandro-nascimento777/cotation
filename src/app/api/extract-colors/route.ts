import { NextRequest, NextResponse } from "next/server";
import { generateObject } from "ai";
import { google } from "@ai-sdk/google";
import { z } from "zod";
import { checkRateLimit, getClientIp } from "@/lib/security/rateLimit";
import { logger } from "@/lib/logger";

export const runtime = "nodejs";
export const maxDuration = 30;

const MODEL = process.env.GEMINI_MODEL || "gemini-3.8-flash";

const extractColorsRequestSchema = z.object({
  image: z.string().min(1, "Imagem da logo obrigatória em base64"),
});

const logoColorsSchema = z.object({
  corPrimaria: z
    .string()
    .regex(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/, "Deve ser um código hexadecimal válido")
    .describe("Cor primária e mais dominante da logo em formato HEX, ex: #1B4F8C"),
  corSecundaria: z
    .string()
    .regex(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/, "Deve ser um código hexadecimal válido")
    .describe("Cor secundária de destaque da logo em formato HEX, ex: #8A2BE2 ou #FFD400"),
  corTerciaria: z
    .string()
    .regex(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/, "Deve ser um código hexadecimal válido")
    .describe("Terceira cor da logo ou tom escuro para texto/contraste em formato HEX, ex: #1E293B"),
  paletaNomes: z
    .array(z.string())
    .describe("Nomes descritivos das cores identificadas, ex: ['Azul Real', 'Roxo Violeta', 'Grafite Escuro']"),
});

const PROMPT_COLOR_EXTRACTION = `Você é um diretor de arte e designer especialista em identidades visuais e paletas de cores para marcas.

Analise cuidadosamente a imagem da logo da empresa em anexo e extraia exatamente até 3 cores fundamentais:
1. Cor Primária: a cor predominante e de maior peso visual na marca.
2. Cor Secundária: a cor de apoio ou detalhe que complementa a primária. Se a logo for monocromática, sugira uma cor complementar equilibrada.
3. Cor Terciária: a terceira cor presente na logo ou um tom escuro/harmônico ideal para legibilidade e texto.

Certifique-se de retornar os códigos em formato hexadecimal maiúsculo ou minúsculo (#RRGGBB) fiel aos pixels da imagem.`;

export async function POST(req: NextRequest) {
  const clientIp = getClientIp(req);
  const rateLimit = checkRateLimit(`extract-colors:${clientIp}`, { limit: 15, windowSeconds: 60 });
  if (!rateLimit.allowed) {
    logger.warn("Rate limit excedido na extração de cores da logo", { clientIp });
    return NextResponse.json(
      { error: "Muitas requisições. Aguarde um instante antes de analisar novamente." },
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
    const parsed = extractColorsRequestSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Payload de imagem inválido." },
        { status: 400 }
      );
    }

    const cleanBase64 = parsed.data.image.replace(/^data:[^;]+;base64,/, "");

    const result = await generateObject({
      model: google(MODEL),
      schema: logoColorsSchema,
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: PROMPT_COLOR_EXTRACTION },
            { type: "image", image: cleanBase64 },
          ],
        },
      ],
    });

    logger.info("Cores da logo extraídas com sucesso", {
      primaria: result.object.corPrimaria,
      secundaria: result.object.corSecundaria,
      terciaria: result.object.corTerciaria,
    });

    return NextResponse.json({ ok: true, data: result.object });
  } catch (err) {
    logger.error("Falha ao analisar cores da logo", err);
    return NextResponse.json(
      { error: "Não foi possível extrair as cores da imagem da logo. Tente novamente." },
      { status: 500 }
    );
  }
}
