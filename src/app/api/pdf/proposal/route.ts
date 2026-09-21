import { NextRequest, NextResponse } from "next/server";
import { QuoteItem } from "@/lib/types";
import { AgencySettings } from "@/lib/store/types";
import { QuoteExtras } from "@/components/cotacoes/QuoteExtrasForm";
import { buildProposalPdfData, ProposalPdfThemeInput } from "@/lib/pdf/buildProposalPdfData";
import { renderProposalHtml } from "@/lib/pdf/renderProposalHtml";
import { renderHtmlToPdf } from "@/lib/pdf/renderPdf";
import { checkRateLimit, getClientIp } from "@/lib/security/rateLimit";
import { logger } from "@/lib/logger";

export const runtime = "nodejs";
export const maxDuration = 30;

/** PDF no mesmo layout visual da proposta pública (/proposta), porém
 * estático — sem seleção por rádio nem somatório, só os voos ofertados com
 * seus detalhes. A aba PDF reaproveita o seletor de tema da aba Link (ver
 * ThemeModal mode="pdf") só pra escolher a capa, sem gerar link nenhum. */
export async function POST(req: NextRequest) {
  const clientIp = getClientIp(req);

  // Rate limit: máx 15 PDFs por minuto por IP para proteger Chromium
  const rateLimit = checkRateLimit(`pdf-proposal:${clientIp}`, { limit: 15, windowSeconds: 60 });
  if (!rateLimit.allowed) {
    logger.warn("Rate limit excedido na geração de PDF de proposta", { clientIp });
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
    const items: QuoteItem[] = body?.items || [];
    const extras: QuoteExtras = body?.extras;
    const agency: AgencySettings = body?.agency;
    const numero: string = body?.numero || "";
    const theme: ProposalPdfThemeInput = body?.theme;

    if (!extras || !agency || !theme) {
      return NextResponse.json({ error: "Dados da cotação ausentes." }, { status: 400 });
    }
    if (!items.some((i) => i.selected)) {
      return NextResponse.json({ error: "Selecione ao menos uma opção de voo." }, { status: 400 });
    }

    const data = buildProposalPdfData(items, extras, agency, numero, theme);
    const html = renderProposalHtml(data);
    const pdfBuffer = await renderHtmlToPdf(html);

    logger.info("PDF de proposta comercial gerado com sucesso", {
      clientIp,
      numero,
      bytes: pdfBuffer.length,
    });

    return new NextResponse(new Uint8Array(pdfBuffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": 'attachment; filename="proposta.pdf"',
      },
    });
  } catch (err) {
    logger.error("Erro ao gerar PDF da proposta comercial", err, { clientIp });
    const message = err instanceof Error ? err.message : "Erro desconhecido ao gerar PDF.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
