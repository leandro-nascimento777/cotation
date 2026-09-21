import { FlightQuoteTemplateData } from "./buildFlightQuoteData";
import { escapeHtml, nl2br } from "./htmlUtils";
import { getAirlineLogoUrl } from "../airlineLogo";
import { FLIGHT_QUOTE_BASE_CSS } from "./flightQuoteCss";

export { escapeHtml };

type TemplateGrupo = FlightQuoteTemplateData["grupos"][number];
type TemplateOpcao = TemplateGrupo["opcoes"][number];
type TemplateLeg = NonNullable<TemplateOpcao["ida"]>;

function loadCss(): string {
  return FLIGHT_QUOTE_BASE_CSS;
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
  const logo = getAirlineLogoUrl(leg.cia_aerea, leg.numero_voo);
  const logoHtml = logo
    ? `<img src="${escapeHtml(logo)}" alt="" style="width:13px;height:13px;border-radius:999px;vertical-align:middle;margin-right:4px;object-fit:contain;background:#fff;border:1px solid #cbd5e1;padding:1px;display:inline-block;" />`
    : "";
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
            <span style="display:inline-flex;align-items:center;">${logoHtml}${escapeHtml(leg.cia_aerea)} ${escapeHtml(leg.numero_voo)} · ${escapeHtml(leg.data)}</span>
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
      const logoPrincipal = getAirlineLogoUrl(principal.cia_aerea, principal.numero_voo);
      const logoPrincipalImg = logoPrincipal
        ? `<img src="${escapeHtml(logoPrincipal)}" alt="" style="width:16px;height:16px;border-radius:999px;vertical-align:middle;margin-right:6px;object-fit:contain;background:#fff;border:1px solid #cbd5e1;padding:1px;display:inline-block;" />`
        : "";
      const titulo =
        o.ida && o.volta
          ? `Opção ${idx + 1} · Ida e volta · ${escapeHtml(principal.cia_aerea)}`
          : `Opção ${idx + 1} · ${escapeHtml(principal.cia_aerea)} ${escapeHtml(principal.numero_voo)} · ${escapeHtml(principal.data)}`;
      return `
    <div class="voo-card">
      <div class="voo-card-header">
        <span style="display:inline-flex;align-items:center;">${logoPrincipalImg}${titulo}</span>
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
  const css = loadCss();
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
