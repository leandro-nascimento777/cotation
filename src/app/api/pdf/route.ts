import { NextRequest, NextResponse } from "next/server";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { randomUUID } from "node:crypto";
import { existsSync } from "node:fs";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { AgencyInfo, QuoteItem } from "@/lib/types";
import { buildFlightQuoteData } from "@/lib/pdf/buildFlightQuoteData";

export const runtime = "nodejs";
export const maxDuration = 30;

const execFileAsync = promisify(execFile);

// O PDF é gerado pelo script Python em pdf-template/ (Jinja2 + WeasyPrint),
// não mais pelo @react-pdf/renderer — ver pdf-template/README.md.
const PDF_TEMPLATE_DIR = path.join(process.cwd(), "pdf-template");
const GENERATE_SCRIPT = path.join(PDF_TEMPLATE_DIR, "generate_pdf.py");

// O binário do Python vem de uma env var (PDF_PYTHON_BIN), nunca de um
// caminho literal montado em código: o bundler (Turbopack) tenta rastrear
// estaticamente caminhos como ".venv/bin/python3" para incluir no build, e
// o symlink do venv (que aponta pro Python do sistema, fora do projeto)
// derruba esse rastreamento com "Symlink ... points out of the filesystem
// root". Configure PDF_PYTHON_BIN em .env.local apontando pro python do seu
// venv (ex: pdf-template/.venv/bin/python3) — ver README.
function resolvePython(): string {
  return process.env.PDF_PYTHON_BIN || (process.platform === "win32" ? "python" : "python3");
}

export async function POST(req: NextRequest) {
  let workDir: string | null = null;
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

    if (!existsSync(GENERATE_SCRIPT)) {
      return NextResponse.json(
        { error: `Template de PDF não encontrado em ${GENERATE_SCRIPT}.` },
        { status: 500 }
      );
    }

    const data = buildFlightQuoteData(items, agency);

    workDir = await mkdtemp(path.join(tmpdir(), "cotation-pdf-"));
    const dataPath = path.join(workDir, `data-${randomUUID()}.json`);
    const outputPath = path.join(workDir, `orcamento-${randomUUID()}.pdf`);

    await writeFile(dataPath, JSON.stringify(data), "utf8");

    const python = resolvePython();
    try {
      await execFileAsync(
        python,
        [GENERATE_SCRIPT, "--data", dataPath, "--output", outputPath, "--template", "flight-quote.html"],
        { cwd: PDF_TEMPLATE_DIR, timeout: 25_000 }
      );
    } catch (err) {
      const stderr = (err as { stderr?: string })?.stderr;
      console.error("Erro ao rodar generate_pdf.py:", stderr || err);
      const hint = stderr?.includes("ModuleNotFoundError")
        ? " Dependências Python ausentes — rode: cd pdf-template && pip install -r requirements.txt"
        : "";
      return NextResponse.json(
        { error: `Falha ao gerar PDF (Python).${hint}` },
        { status: 500 }
      );
    }

    const pdfBuffer = await readFile(outputPath);

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
  } finally {
    if (workDir) {
      await rm(workDir, { recursive: true, force: true }).catch(() => {});
    }
  }
}
