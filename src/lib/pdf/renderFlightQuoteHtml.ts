import { readFile } from "node:fs/promises";
import path from "node:path";
import { FlightQuoteTemplateData } from "./buildFlightQuoteData";

type TemplateGrupo = FlightQuoteTemplateData["grupos"][number];
type TemplateOpcao = TemplateGrupo["opcoes"][number];
type TemplateLeg = NonNullable<TemplateOpcao["ida"]>;

// Reaproveita as MESMAS folhas de estilo do template Jinja2/WeasyPrint em
// pdf-template/ (style.css + flight-quote.css) — uma única fonte de verdade
// de design para os dois pipelines de geração de PDF (Python standalone e
// Node/Puppeteer usado pelo app). Só a "montagem" do HTML muda.
const PDF_TEMPLATE_DIR = path.join(process.cwd(), "pdf-template");

export function escapeHtml(value: string | number | undefined | null): string {
  if (value === undefined || value === null) return "";
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/** Equivalente ao filtro Jinja2 `nl2br` do generate_pdf.py: parágrafos
 * separados por linha em branco, com escape de segurança. */
function nl2br(value: string): string {
  if (!value) return "";
  return value
    .replace(/\r\n/g, "\n")
    .split(/\n\n+/)
    .map((p) => p.trim())
    .filter(Boolean)
    .map((p) => `<p>${escapeHtml(p).replace(/\n/g, "<br>")}</p>`)
    .join("");
}

let cachedCss: string | null = null;
async function loadCss(): Promise<string> {
  if (cachedCss) return cachedCss;
  const [base, flightQuote] = await Promise.all([
    readFile(path.join(PDF_TEMPLATE_DIR, "style.css"), "utf8"),
    readFile(path.join(PDF_TEMPLATE_DIR, "flight-quote.css"), "utf8"),
  ]);
  // O Puppeteer controla o tamanho/margem da página via page.pdf({ format,
  // margin }) — a regra @page do style.css (pensada pro WeasyPrint) é
  // removida aqui porque o Chromium a respeita de um jeito que ANULA a
  // opção `margin` do page.pdf() (testado: com "@page { margin: 0 }" no
  // CSS, a margem passada em page.pdf() é ignorada e o conteúdo cola nas
  // bordas). Sem nenhuma regra @page, page.pdf({ margin }) funciona normal.
  const stripPageRule = (css: string) => css.replace(/@page\s*{[^}]*}/g, "");
  cachedCss = `${stripPageRule(base)}\n${stripPageRule(flightQuote)}`;
  return cachedCss;
}

function renderHeader(data: FlightQuoteTemplateData): string {
  const logo = data.logo_url
    ? `<img src="${escapeHtml(data.logo_url)}" alt="Logo da agência" class="logo">`
    : `<div class="logo-placeholder">LOGO</div>`;

  const addressLines = [
    data.agencia_endereco_linha1,
    data.agencia_endereco_linha2,
    data.agencia_endereco_linha3,
    data.agencia_cep,
  ]
    .filter(Boolean)
    .map((l) => `<p>${escapeHtml(l)}</p>`)
    .join("");

  const rightLines = [
    data.filial_numero && `<p><span class="label">Filial:</span> ${escapeHtml(data.filial_numero)}</p>`,
    data.vendedor_nome && `<p><span class="label">Vendedor:</span> ${escapeHtml(data.vendedor_nome)}</p>`,
    data.vendedor_email && `<p><span class="label">Email:</span> ${escapeHtml(data.vendedor_email)}</p>`,
    data.telefone && `<p><span class="label">Fone:</span> ${escapeHtml(data.telefone)}</p>`,
    data.cnpj && `<p><span class="label">CNPJ:</span> ${escapeHtml(data.cnpj)}</p>`,
    data.cadastur && `<p><span class="label">Cadastur:</span> ${escapeHtml(data.cadastur)}</p>`,
  ]
    .filter(Boolean)
    .join("");

  return `
  <header class="header">
    <div class="header-left">${logo}</div>
    <div class="header-center">
      <p class="agencia-nome">${escapeHtml(data.agencia_nome)}</p>
      ${addressLines}
    </div>
    <div class="header-right">${rightLines}</div>
  </header>`;
}

function renderLinhaData(data: FlightQuoteTemplateData): string {
  const validade = data.data_validade
    ? `<br><span class="validade">Válido até ${escapeHtml(data.data_validade)}</span>`
    : "";
  return `
  <div class="linha-data">
    <span>${escapeHtml(data.data_emissao)}</span>
    <span class="linha-data-direita">Orçamento nº <strong>${escapeHtml(data.numero_orcamento)}</strong>${validade}</span>
  </div>`;
}

const AVIAO_SVG = `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M21 16v-2l-8-5V3.5a1.5 1.5 0 0 0-3 0V9l-8 5v2l8-2.5V19l-2.5 1.8V22l3.5-1 3.5 1v-1.2L12 19v-5.5l9 2.5z"/></svg>`;

function renderLeg(leg: TemplateLeg, label?: string): string {
  return `
        <div class="voo-leg">
          ${label ? `<p class="voo-leg-label">${escapeHtml(label)}</p>` : ""}
          <div class="voo-rota">
            <div class="voo-rota-origem">
              <p class="voo-aeroporto">${escapeHtml(leg.origem)}</p>
              <p class="voo-horario">Partida ${escapeHtml(leg.hora_partida)}</p>
            </div>
            <span class="voo-seta">&#9644;&#9644;&#9644;&#9644;&#9654;</span>
            <div class="voo-rota-destino">
              <p class="voo-aeroporto">${escapeHtml(leg.destino)}</p>
              <p class="voo-horario">Chegada ${escapeHtml(leg.hora_chegada)}</p>
            </div>
          </div>
          <div class="voo-meta">
            <span>${escapeHtml(leg.cia_aerea)} ${escapeHtml(leg.numero_voo)} · ${escapeHtml(leg.data)}</span>
            <span>Duração: <strong>${escapeHtml(leg.duracao)}</strong></span>
            <span>Conexões: <strong>${escapeHtml(leg.conexoes)}</strong></span>
            ${leg.equipamento ? `<span>Equip.: <strong>${escapeHtml(leg.equipamento)}</strong></span>` : ""}
          </div>
        </div>`;
}

function renderOpcoes(opcoes: TemplateOpcao[]): string {
  return opcoes
    .map((o, idx) => {
      const principal = o.ida ?? o.volta!;
      const titulo =
        o.ida && o.volta
          ? `Opção ${idx + 1} · Ida e volta · ${escapeHtml(principal.cia_aerea)}`
          : `Opção ${idx + 1} · ${escapeHtml(principal.cia_aerea)} ${escapeHtml(principal.numero_voo)} · ${escapeHtml(principal.data)}`;
      return `
    <div class="voo-card">
      <div class="voo-card-header">
        <span>${titulo}</span>
        <span class="voo-card-preco">${escapeHtml(o.valor)}</span>
      </div>
      <div class="voo-card-body">
        ${o.ida ? renderLeg(o.ida, o.volta ? "Ida" : undefined) : ""}
        ${o.volta ? `${o.ida ? '<div class="voo-leg-divisor"></div>' : ""}${renderLeg(o.volta, o.ida ? "Volta" : undefined)}` : ""}
        <div class="voo-meta voo-meta-final">
          <span>Bagagem: <strong>${escapeHtml(o.bagagem_label)} (${escapeHtml(o.tarifa_label)})</strong></span>
        </div>
      </div>
    </div>`;
    })
    .join("");
}

function renderGrupo(grupo: TemplateGrupo, mostrarTitulo: boolean): string {
  const rotulo = mostrarTitulo ? grupo.titulo : "Valor a partir de";
  return `
    ${mostrarTitulo ? `<h3 class="voo-grupo-titulo">${escapeHtml(grupo.titulo)}</h3>` : ""}
    ${renderOpcoes(grupo.opcoes)}
    ${
      grupo.valor_a_partir
        ? `
    <div class="valor-a-partir-box">
      <span style="font-size: 10px; color: var(--cor-texto-suave);">${escapeHtml(mostrarTitulo ? `${rotulo} a partir de` : rotulo)}</span>
      <span class="valor-a-partir-valor">${escapeHtml(grupo.valor_a_partir)}</span>
    </div>`
        : ""
    }`;
}

/** Monta o HTML completo da cotação de voos (equivalente ao
 * pdf-template/flight-quote.html renderizado pelo Jinja2, mas em JS puro —
 * usado pelo Puppeteer no lugar do WeasyPrint). */
/** Bloco de override de cores (personalização do PDF em Configurações) —
 * injetado DEPOIS do CSS base, então só entra em vigor quando ao menos uma
 * cor for informada. Usa color-mix() (suportado pelo Chromium/Puppeteer)
 * pra derivar tons claros/de contraste sem precisar calcular manualmente. */
// Só aceita hex (#fff, #ffffff) — as cores vão para dentro de uma tag
// <style> interpolada em string, então validamos estritamente o formato
// antes de injetar (defesa contra CSS/HTML injection caso algo chame a
// API diretamente com um valor malicioso).
const HEX_COLOR = /^#[0-9a-fA-F]{3,8}$/;

function renderColorOverrides(data: FlightQuoteTemplateData): string {
  const primaria = HEX_COLOR.test(data.cor_primaria) ? data.cor_primaria : "";
  const secundaria = HEX_COLOR.test(data.cor_secundaria) ? data.cor_secundaria : "";
  const texto = HEX_COLOR.test(data.cor_texto) ? data.cor_texto : "";
  if (!primaria && !secundaria && !texto) return "";

  const rules: string[] = [];
  if (primaria) {
    rules.push(`--cor-primaria: ${primaria};`);
    rules.push(`--cor-primaria-clara: color-mix(in srgb, ${primaria} 12%, white);`);
  }
  if (secundaria) {
    rules.push(`--cor-destaque: ${secundaria};`);
    rules.push(`--cor-destaque-texto: color-mix(in srgb, ${secundaria} 75%, black);`);
  }
  if (texto) {
    rules.push(`--cor-texto: ${texto};`);
  }
  return `<style>:root { ${rules.join(" ")} }</style>`;
}

export async function renderFlightQuoteHtml(data: FlightQuoteTemplateData): Promise<string> {
  const css = await loadCss();
  const totalOpcoes = data.grupos.reduce((sum, g) => sum + g.opcoes.length, 0);
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<title>Orçamento ${escapeHtml(data.numero_orcamento)}</title>
<style>${css}</style>
${renderColorOverrides(data)}
</head>
<body>
  ${renderHeader(data)}
  ${renderLinhaData(data)}
  ${data.empresa_nome_banner ? `<div class="banner-destaque"><p>${escapeHtml(data.empresa_nome_banner)}</p></div>` : ""}
  <section class="secao">
    <h2 class="titulo-secao">
      <span class="icone">${AVIAO_SVG}</span>
      Opções de Voo${totalOpcoes > 1 ? ` (${totalOpcoes})` : ""}
    </h2>
    ${
      totalOpcoes === 0
        ? `<p style="font-size: 10px; color: var(--cor-texto-suave);">Nenhuma opção selecionada.</p>`
        : data.grupos.map((grupo) => renderGrupo(grupo, data.mostrar_titulos_grupo)).join("")
    }
  </section>
  ${
    data.informacoes_importantes
      ? `
  <section class="secao secao-final">
    <h2 class="titulo-secao">Informações importantes</h2>
    <div class="texto-livre">${nl2br(data.informacoes_importantes)}</div>
  </section>`
      : ""
  }
  <footer class="rodape">
    <span>${escapeHtml(data.agencia_nome)}</span>
    <span>${escapeHtml(data.data_emissao)}</span>
  </footer>
</body>
</html>`;
}
