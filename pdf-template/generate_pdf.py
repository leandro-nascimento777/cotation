#!/usr/bin/env python3
"""
generate_pdf.py — injeta um JSON de dados no template.html (Jinja2) e
exporta o resultado em PDF (WeasyPrint).

Uso:
    python generate_pdf.py
    python generate_pdf.py --data data_schema.json --output orcamento.pdf
    python generate_pdf.py --data meu_orcamento.json --logo logo-agencia.png

--logo aceita um arquivo local de imagem (PNG/JPG/SVG) e sobrescreve o
"logo_url" do JSON, convertendo o arquivo em base64 (data URI) para o
WeasyPrint conseguir embutir a imagem sem depender de caminho relativo.
Se "logo_url" no JSON já for uma URL http(s) ou um data URI, é usado como
está; se for um caminho de arquivo local, também é convertido automaticamente.
"""

import argparse
import base64
import json
import mimetypes
import sys
from pathlib import Path

from jinja2 import Environment, FileSystemLoader
from markupsafe import Markup, escape
from weasyprint import HTML

BASE_DIR = Path(__file__).resolve().parent


def nl2br(value: str) -> Markup:
    """Filtro Jinja2: transforma um texto com quebras de linha em parágrafos
    <p>, permitindo que campos de texto livre (ex: informacoes_importantes)
    tenham múltiplos parágrafos no PDF. O texto de cada parágrafo é escapado
    individualmente antes de virar HTML seguro (Markup), então o template
    continua protegido contra HTML acidental/malicioso vindo dos dados."""
    if not value:
        return Markup("")
    paragraphs = [p.strip() for p in value.replace("\r\n", "\n").split("\n\n") if p.strip()]
    html = "".join(f"<p>{escape(p).replace(chr(10), Markup('<br>'))}</p>" for p in paragraphs)
    return Markup(html)


def resolve_logo(path_or_url: str) -> str:
    """Converte um caminho de arquivo local em data URI base64. Deixa URLs
    http(s) e data URIs já prontos como estão."""
    if not path_or_url:
        return ""
    if path_or_url.startswith("http://") or path_or_url.startswith("https://") or path_or_url.startswith("data:"):
        return path_or_url

    logo_path = Path(path_or_url)
    if not logo_path.is_absolute():
        # tenta relativo ao diretório atual e, se não existir, relativo à
        # pasta do template
        if not logo_path.exists():
            logo_path = BASE_DIR / path_or_url

    if not logo_path.exists():
        print(f"[aviso] logo_url '{path_or_url}' não encontrado — usando placeholder.", file=sys.stderr)
        return ""

    mime, _ = mimetypes.guess_type(str(logo_path))
    mime = mime or "image/png"
    encoded = base64.b64encode(logo_path.read_bytes()).decode("ascii")
    return f"data:{mime};base64,{encoded}"


def render_pdf(data_path: Path, output_path: Path, logo_override: str | None = None) -> None:
    data = json.loads(data_path.read_text(encoding="utf-8"))

    if logo_override:
        data["logo_url"] = logo_override
    data["logo_url"] = resolve_logo(data.get("logo_url", ""))

    env = Environment(loader=FileSystemLoader(str(BASE_DIR)), autoescape=True)
    env.filters["nl2br"] = nl2br
    template = env.get_template("template.html")

    html_content = template.render(**data)

    HTML(string=html_content, base_url=str(BASE_DIR)).write_pdf(str(output_path))
    print(f"PDF gerado em: {output_path}")


def main():
    parser = argparse.ArgumentParser(description="Gera o PDF de orçamento a partir de um JSON de dados.")
    parser.add_argument("--data", default="data_schema.json", help="Caminho do JSON com os dados (padrão: data_schema.json)")
    parser.add_argument("--output", default="orcamento.pdf", help="Caminho do PDF de saída (padrão: orcamento.pdf)")
    parser.add_argument("--logo", default=None, help="Caminho de um arquivo de logo local para sobrescrever o logo_url do JSON")
    args = parser.parse_args()

    data_path = Path(args.data)
    if not data_path.is_absolute() and not data_path.exists():
        data_path = BASE_DIR / args.data

    output_path = Path(args.output)

    render_pdf(data_path, output_path, args.logo)


if __name__ == "__main__":
    main()
