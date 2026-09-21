import { NextRequest, NextResponse } from "next/server";
import { generatePdfSchema } from "@/lib/validation/apiSchemas";
import { checkRateLimit, getClientIp } from "@/lib/security/rateLimit";
import { logger } from "@/lib/logger";
import { buildFlightQuoteData } from "@/lib/pdf/buildFlightQuoteData";
import { renderFlightQuoteHtml } from "@/lib/pdf/renderFlightQuoteHtml";
import { renderHtmlToPdf } from "@/lib/pdf/renderPdf";

export const runtime = "nodejs";
export const maxDuration = 30;

export async function POST(req: NextRequest) {
  const clientIp = getClientIp(req);

  // Rate limit: máx 15 PDFs por minuto por IP para proteger Chromium
  const rateLimit = checkRateLimit(`pdf:${clientIp}`, { limit: 15, windowSeconds: 60 });
  if (!rateLimit.allowed) {
    logger.warn("Rate limit excedido na geração de PDF", { clientIp });
    return NextResponse.json(
      { error: "Muitas requisições de geração de PDF. Aguarde alguns instantes." },
      {
        status: 429,
        headers: { "Retry-After": String(rateLimit.resetInSeconds) },
      }
    );
  }

  try {
    const body = await req.json().catch(() => null);
    const parsed = generatePdfSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Dados inválidos para geração de PDF." },
        { status: 400 }
      );
    }

    const { items, agency, numeroOrcamento, corPrimaria, corSecundaria, corTexto } = parsed.data;

    const selected = items.filter((i) => i.selected);
    if (selected.length === 0) {
      return NextResponse.json(
        { error: "Selecione ao menos uma opção de voo para incluir no PDF." },
        { status: 400 }
      );
    }

    const data = buildFlightQuoteData(items, agency, {
      numeroOrcamento,
      corPrimaria,
      corSecundaria,
      corTexto,
    });
    const html = await renderFlightQuoteHtml(data);
    const pdfBuffer = await renderHtmlToPdf(html);

    logger.info("PDF de cotação gerado com sucesso", {
      clientIp,
      numero: numeroOrcamento,
      bytes: pdfBuffer.length,
    });

    return new NextResponse(new Uint8Array(pdfBuffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": 'attachment; filename="orcamento.pdf"',
      },
    });
  } catch (err) {
    logger.error("Erro ao gerar PDF de cotação", err, { clientIp });
    const message = err instanceof Error ? err.message : "Erro desconhecido ao gerar PDF.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

