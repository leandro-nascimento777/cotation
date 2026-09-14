import { NextRequest, NextResponse } from "next/server";
import { renderToBuffer, DocumentProps } from "@react-pdf/renderer";
import React from "react";
import { QuoteDocument } from "@/lib/pdf/QuoteDocument";
import { AgencyInfo, QuoteItem } from "@/lib/types";

export const runtime = "nodejs";
export const maxDuration = 30;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const items: QuoteItem[] = body?.items || [];
    const agency: AgencyInfo = body?.agency;

    if (!agency) {
      return NextResponse.json({ error: "Dados da agência ausentes." }, { status: 400 });
    }
    if (!items.some((i) => i.selected)) {
      return NextResponse.json(
        { error: "Selecione ao menos uma opção de voo." },
        { status: 400 }
      );
    }

    const buffer = await renderToBuffer(
      React.createElement(QuoteDocument, { items, agency }) as React.ReactElement<DocumentProps>
    );

    return new NextResponse(new Uint8Array(buffer), {
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
