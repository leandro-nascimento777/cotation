import { NextRequest, NextResponse } from "next/server";
import { AgencyInfo, QuoteItem } from "@/lib/types";
import { buildFlightQuoteData } from "@/lib/pdf/buildFlightQuoteData";
import { renderFlightQuoteHtml } from "@/lib/pdf/renderFlightQuoteHtml";
import { renderHtmlToPdf } from "@/lib/pdf/renderPdf";

export const runtime = "nodejs";
export const maxDuration = 30;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const items: QuoteItem[] = body?.items || [];
    const agency: AgencyInfo = body?.agency;
    const numeroOrcamento: string | undefined = body?.numeroOrcamento || undefined;
    const corPrimaria: string | undefined = body?.corPrimaria || undefined;
    const corSecundaria: string | undefined = body?.corSecundaria || undefined;
    const corTexto: string | undefined = body?.corTexto || undefined;

    if (!agency) {
      return NextResponse.json({ error: "Dados da agência ausentes." }, { status: 400 });
    }
    if (!items.some((i) => i.selected)) {
      return NextResponse.json(
        { error: "Selecione ao menos uma opção de voo." },
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

    return new NextResponse(new Uint8Array(pdfBuffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": 'attachment; filename="orcamento.pdf"',
      },
    });
  } catch (err) {
    console.error("Erro ao gerar PDF:", err);
    const message = err instanceof Error ? err.message : "Erro desconhecido ao gerar PDF.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
