import { NextRequest, NextResponse } from "next/server";
import { generateObject } from "ai";
import { google } from "@ai-sdk/google";
import { extractionResultSchema } from "@/lib/schema";
import { FlightRow } from "@/lib/types";

export const runtime = "nodejs";
export const maxDuration = 60;

const MODEL = process.env.GEMINI_MODEL || "gemini-3.6-flash";

const EXTRACTION_PROMPT = `Você é um extrator de dados especializado em telas de sistemas de emissão de \
passagens aéreas usadas por agências de viagem no Brasil.

A imagem em anexo é um print de uma tabela comparativa de voos (colunas comuns: Cia, Voo, Saída, \
Chegada, Dur. Total., Origem, Destino, Dur. Con., Esc., Equip., Tipo, e duas seções de preço lado a \
lado — "Sem Bagagem" e "Com Bagagem" — cada uma com uma tag de tarifa (ex: LIG, AZU, CLA, STA) e um \
valor em reais).

Extraia CADA LINHA da tabela como um item em "rows", com máxima fidelidade ao que está escrito — \
não traduza, não arredonde, não invente valores nem preencha campos que não conseguir ler. Se uma \
linha tiver as duas colunas de preço (sem e com bagagem), gere duas entradas em "fares" para essa \
linha. Converta valores como "R$ 1.917,15" para o número 1917.15.`;

export async function POST(req: NextRequest) {
  try {
    if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
      return NextResponse.json(
        {
          error:
            "GOOGLE_GENERATIVE_AI_API_KEY não configurada no servidor. Crie uma chave gratuita em https://aistudio.google.com/apikey e adicione em .env.local.",
        },
        { status: 500 }
      );
    }

    const body = await req.json();
    const imageDataUrl: string | undefined = body?.image;
    if (!imageDataUrl || typeof imageDataUrl !== "string") {
      return NextResponse.json({ error: "Imagem não enviada." }, { status: 400 });
    }

    const result = await generateObject({
      model: google(MODEL),
      schema: extractionResultSchema,
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: EXTRACTION_PROMPT },
            { type: "image", image: imageDataUrl },
          ],
        },
      ],
    });

    const rows: FlightRow[] = result.object.rows.map((row, rIdx) => ({
      id: `row-${rIdx}`,
      airline: row.airline,
      flightNumber: row.flightNumber,
      date: row.date,
      departureTime: row.departureTime,
      arrivalTime: row.arrivalTime,
      duration: row.duration,
      origin: row.origin,
      destination: row.destination,
      stops: row.stops,
      aircraft: row.aircraft,
      fares: row.fares.map((fare, fIdx) => ({
        id: `row-${rIdx}-fare-${fIdx}`,
        baggage: fare.baggage,
        fareLabel: fare.fareLabel,
        fareClass: fare.fareClass,
        price: fare.price,
        currency: fare.currency || "BRL",
      })),
    }));

    return NextResponse.json({ rows });
  } catch (err) {
    console.error("Erro na extração:", err);
    const message = err instanceof Error ? err.message : "Erro desconhecido na extração.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
