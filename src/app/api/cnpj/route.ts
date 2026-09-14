import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

// Consulta pública e gratuita de CNPJ (BrasilAPI, sem necessidade de chave)
// — dados da Receita Federal com cache. https://brasilapi.com.br
const BRASILAPI_URL = "https://brasilapi.com.br/api/cnpj/v1";

interface BrasilApiCnpjResponse {
  razao_social?: string;
  nome_fantasia?: string;
  logradouro?: string;
  numero?: string;
  complemento?: string;
  bairro?: string;
  municipio?: string;
  uf?: string;
  cep?: string;
  ddd_telefone_1?: string;
  descricao_situacao_cadastral?: string;
}

export async function GET(req: NextRequest) {
  const raw = req.nextUrl.searchParams.get("cnpj") || "";
  const digits = raw.replace(/\D/g, "");

  if (digits.length !== 14) {
    return NextResponse.json({ error: "CNPJ inválido — informe os 14 dígitos." }, { status: 400 });
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8_000);
    const res = await fetch(`${BRASILAPI_URL}/${digits}`, {
      signal: controller.signal,
      // Sem um User-Agent "de navegador", a BrasilAPI bloqueia a requisição
      // com 403 (o fetch padrão do Node/undici não define um UA como os
      // navegadores fazem).
      headers: { "User-Agent": "Mozilla/5.0 (compatible; CotationApp/1.0)" },
    });
    clearTimeout(timeout);

    if (res.status === 404) {
      return NextResponse.json({ error: "CNPJ não encontrado." }, { status: 404 });
    }
    if (!res.ok) {
      return NextResponse.json(
        { error: "Não foi possível consultar o CNPJ no momento. Tente novamente." },
        { status: 502 }
      );
    }

    const data: BrasilApiCnpjResponse = await res.json();

    const enderecoPartes = [
      data.logradouro,
      data.numero,
      data.complemento,
      data.bairro,
      data.municipio && data.uf ? `${data.municipio}/${data.uf}` : data.municipio || data.uf,
    ].filter(Boolean);

    return NextResponse.json({
      agencyName: data.nome_fantasia?.trim() || data.razao_social?.trim() || "",
      branch: enderecoPartes.join(" - "),
      phone: data.ddd_telefone_1 || "",
      situacao: data.descricao_situacao_cadastral || "",
    });
  } catch (err) {
    console.error("Erro ao consultar CNPJ:", err);
    const timedOut = err instanceof Error && err.name === "AbortError";
    return NextResponse.json(
      { error: timedOut ? "A consulta demorou demais. Tente novamente." : "Erro ao consultar o CNPJ." },
      { status: 500 }
    );
  }
}
