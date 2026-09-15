import { ProposalPdfData } from "./buildProposalPdfData";

export function escapeHtml(value: string | number | undefined | null): string {
  if (value === undefined || value === null) return "";
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function nl2br(value: string): string {
  if (!value) return "";
  return escapeHtml(value).replace(/\n/g, "<br>");
}

const PLANE_ICON = `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z"/></svg>`;

const CSS = `
* { box-sizing: border-box; }
body { margin: 0; font-family: "Helvetica Neue", Arial, sans-serif; color: #1e293b; background: #fff; font-size: 12px; }
.doc { max-width: 100%; }
.cover {
  position: relative;
  min-height: 300px;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  padding: 28px 32px;
  color: #fff;
  background-size: cover;
  background-position: center;
  border-radius: 18px;
  overflow: hidden;
}
.cover-title { font-size: 30px; font-weight: 900; text-transform: uppercase; letter-spacing: -0.5px; line-height: 1; margin: 0 0 6px; }
.cover-subtitle { font-size: 13px; color: rgba(255,255,255,0.88); margin: 0; font-weight: 500; }
.cover-meta { border-top: 1px solid rgba(255,255,255,0.2); margin-top: 16px; padding-top: 12px; }
.cover-meta .numero { font-size: 15px; font-weight: 700; letter-spacing: 0.3px; margin: 0; }
.cover-meta .agencia { font-size: 11px; color: rgba(255,255,255,0.7); font-weight: 600; margin: 4px 0 0; }

.band { background: #6366f1; border-radius: 0 0 18px 18px; margin-top: -18px; padding: 40px 24px 24px; }
.resumo-card { background: #fff; border-radius: 18px; box-shadow: 0 10px 30px rgba(0,0,0,0.15); padding: 20px 24px; }
.resumo-card h2 { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: #0f172a; border-bottom: 1px solid #e2e8f0; padding-bottom: 10px; margin: 0 0 14px; }
.resumo-grid { display: flex; flex-wrap: wrap; gap: 18px; }
.resumo-grid > div { min-width: 120px; }
.resumo-label { display: block; font-size: 9px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; color: #94a3b8; }
.resumo-value { display: block; font-size: 12px; font-weight: 700; color: #0f172a; margin-top: 2px; }
.badge { display: inline-flex; align-items: center; gap: 5px; background: rgba(99,102,241,0.1); color: #4f46e5; border-radius: 999px; padding: 5px 12px; font-size: 10px; font-weight: 700; margin-top: 14px; }

.brand-bar { display: flex; align-items: center; justify-content: space-between; background: #fff; border: 1px solid #e2e8f0; border-radius: 14px; padding: 12px 18px; margin: 18px 0; box-shadow: 0 4px 14px rgba(0,0,0,0.06); }
.brand-bar .agencia { font-size: 11px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.06em; color: #4338ca; }
.brand-bar .meta { text-align: right; font-size: 10px; color: #64748b; }
.brand-bar .meta strong { color: #1e293b; }
.brand-bar .num { background: rgba(99,102,241,0.06); border-radius: 4px; padding: 1px 6px; font-family: monospace; font-weight: 700; color: #1e293b; }

.section { margin-top: 22px; }
.section-title { border-bottom: 1px solid #e2e8f0; padding-bottom: 8px; margin-bottom: 14px; }
.section-title h2 { font-size: 15px; font-weight: 700; color: #0f172a; margin: 0 0 2px; }
.section-title p { font-size: 10px; color: #64748b; margin: 0; }

.option-card { border: 1px solid rgba(99,102,241,0.25); border-radius: 18px; overflow: hidden; margin-bottom: 14px; page-break-inside: avoid; }
.option-header { display: flex; align-items: center; gap: 8px; background: rgba(99,102,241,0.08); padding: 10px 16px; }
.option-header .icon { width: 26px; height: 26px; border-radius: 999px; background: rgba(99,102,241,0.18); color: #4f46e5; display: flex; align-items: center; justify-content: center; }
.option-header span.label { font-size: 10px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.08em; color: #4f46e5; }
.option-body { padding: 14px 16px; }
.leg-title { font-size: 9px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; color: #94a3b8; margin: 10px 0 6px; }
.leg-title:first-child { margin-top: 0; }
.detail-grid { display: flex; flex-wrap: wrap; gap: 8px; }
.detail-box { flex: 1 1 110px; background: rgba(99,102,241,0.03); border: 1px solid #e2e8f0; border-radius: 10px; padding: 8px 10px; }
.detail-box .l { display: block; font-size: 8px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: #94a3b8; }
.detail-box .v { display: block; font-size: 11px; font-weight: 700; color: #1e293b; margin-top: 2px; }
.option-footer { display: flex; align-items: center; justify-content: space-between; border-top: 1px solid #e2e8f0; margin-top: 12px; padding-top: 10px; }
.option-footer .bag { font-size: 10px; color: #64748b; }
.option-footer .price { font-size: 15px; font-weight: 800; color: #059669; }

.steps-card { border: 1px solid #e2e8f0; border-radius: 18px; padding: 18px 20px; }
.steps-grid { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 12px; }
.step { flex: 1 1 45%; display: flex; gap: 10px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 10px 12px; }
.step .n { flex-shrink: 0; width: 24px; height: 24px; border-radius: 999px; background: #0f172a; color: #fff; font-size: 11px; font-weight: 700; display: flex; align-items: center; justify-content: center; }
.step .txt-label { display: block; font-size: 9px; font-weight: 700; color: #94a3b8; }
.step .txt { font-size: 10px; font-weight: 600; color: #1e293b; margin: 2px 0 0; }

.info-grid { display: flex; gap: 16px; margin-top: 14px; }
.info-col { flex: 1; display: flex; flex-direction: column; gap: 14px; }
.info-card { border: 1px solid #e2e8f0; border-radius: 16px; padding: 14px 16px; box-shadow: 0 4px 14px rgba(0,0,0,0.05); }
.info-card h3 { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; color: #94a3b8; margin: 0 0 6px; }
.info-card p { font-size: 11px; font-weight: 500; color: #334155; line-height: 1.5; margin: 0; }

.footer { text-align: center; font-size: 9px; color: #94a3b8; margin-top: 24px; }
`;

function renderLegDetailGrid(leg: NonNullable<ProposalPdfData["options"][number]["ida"]>): string {
  return `<div class="detail-grid">
    <div class="detail-box"><span class="l">Companhia</span><span class="v">${escapeHtml(`${leg.airline} ${leg.flightNumber}`.trim())}</span></div>
    <div class="detail-box"><span class="l">Data de embarque</span><span class="v">${escapeHtml(leg.date)}</span></div>
    <div class="detail-box"><span class="l">Horário</span><span class="v">${escapeHtml(leg.departureTime)}–${escapeHtml(leg.arrivalTime)}</span></div>
    <div class="detail-box"><span class="l">Duração</span><span class="v">${escapeHtml(leg.duration)} · ${escapeHtml(leg.stops)}</span></div>
  </div>`;
}

function renderOption(option: ProposalPdfData["options"][number]): string {
  return `<div class="option-card">
    <div class="option-header">
      <span class="icon">${PLANE_ICON}</span>
      <span class="label">${escapeHtml(option.label)}</span>
    </div>
    <div class="option-body">
      ${option.ida ? `${option.volta ? '<p class="leg-title">Ida</p>' : ""}${renderLegDetailGrid(option.ida)}` : ""}
      ${option.volta ? `${option.ida ? '<p class="leg-title">Volta</p>' : ""}${renderLegDetailGrid(option.volta)}` : ""}
      <div class="option-footer">
        <span class="bag">${escapeHtml(option.baggage)} (${escapeHtml(option.fareLabel)})</span>
        <span class="price">${escapeHtml(option.price)}</span>
      </div>
    </div>
  </div>`;
}

/** Monta o HTML do PDF da proposta — mesmo layout visual da página pública
 * (/proposta), porém estático: sem seleção por rádio e sem somatório, só os
 * voos ofertados com seus detalhes completos. Usado pela aba PDF, que
 * reaproveita o seletor de tema da aba Link só pra escolher a capa. */
export function renderProposalHtml(data: ProposalPdfData): string {
  const resumoFields: [string, string][] = [
    ["Cliente", data.clientName || "—"],
    ["Destino", data.destino || "—"],
    ["Ida", data.periodoInicio || "—"],
    ["Volta", data.periodoFim || "—"],
    ["Passageiros", data.passageiros || "—"],
  ];

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<title>Proposta ${escapeHtml(data.numero)}</title>
<style>${CSS}</style>
</head>
<body>
  <div class="doc">
    <div class="cover" style="background-image: linear-gradient(to right, rgba(0,0,0,.85), rgba(0,0,0,.5) 55%, rgba(0,0,0,.15)), linear-gradient(to top, rgba(0,0,0,.55), rgba(0,0,0,0) 55%), url('${escapeHtml(data.coverImageUrl)}')">
      <p class="cover-title">${escapeHtml(data.coverTitle)}</p>
      ${data.coverSubtitle ? `<p class="cover-subtitle">${escapeHtml(data.coverSubtitle)}</p>` : ""}
      <div class="cover-meta">
        <p class="numero">${escapeHtml(data.numero)}</p>
        <p class="agencia">${escapeHtml(data.agencyName)}</p>
      </div>
    </div>

    <div class="band">
      <div class="resumo-card">
        <h2>Resumo da Viagem</h2>
        <div class="resumo-grid">
          ${resumoFields
            .map(([label, value]) => `<div><span class="resumo-label">${escapeHtml(label)}</span><span class="resumo-value">${escapeHtml(value)}</span></div>`)
            .join("")}
        </div>
        <span class="badge">${PLANE_ICON} Aéreo</span>
      </div>
    </div>

    <div class="brand-bar">
      <span class="agencia">${escapeHtml(data.agencyName)}</span>
      <div class="meta">
        <div><strong>Proposta Comercial:</strong> <span class="num">#${escapeHtml(data.numero)}</span></div>
        <div>Emissão: <strong>${escapeHtml(data.emissao)}</strong></div>
      </div>
    </div>

    <div class="section">
      <div class="section-title">
        <h2>Serviços Selecionados</h2>
        <p>Revise os detalhes dos serviços inclusos nesta proposta.</p>
      </div>
      ${data.options.length === 0 ? `<p style="font-size:11px;color:#94a3b8;">Nenhuma opção selecionada.</p>` : data.options.map(renderOption).join("")}
    </div>

    ${
      data.nextSteps.length > 0
        ? `<div class="section">
      <div class="steps-card">
        <div class="section-title" style="border:0;padding:0;margin:0;">
          <h2>Próximos Passos</h2>
          <p>Instruções para finalização da sua reserva</p>
        </div>
        <div class="steps-grid">
          ${data.nextSteps
            .map(
              (step, idx) =>
                `<div class="step"><span class="n">${idx + 1}</span><div><span class="txt-label">Passo ${idx + 1}</span><p class="txt">${escapeHtml(step)}</p></div></div>`
            )
            .join("")}
        </div>
      </div>
    </div>`
        : ""
    }

    <div class="section">
      <div class="section-title">
        <h2>Condições / Informações</h2>
        <p>Formas de pagamento e observações importantes.</p>
      </div>
      <div class="info-grid">
        <div class="info-col">
          <div class="info-card">
            <h3>Condições / Formas de Pagamento</h3>
            <p>${nl2br(data.paymentMethodLabel)}</p>
          </div>
        </div>
        <div class="info-col">
          ${
            data.observacoes
              ? `<div class="info-card"><h3>Observações Importantes</h3><p>${nl2br(data.observacoes)}</p></div>`
              : ""
          }
        </div>
      </div>
    </div>

    <p class="footer">${escapeHtml([data.agencyName, data.agencyPhone, data.agencyEmail].filter(Boolean).join(" · "))}</p>
  </div>
</body>
</html>`;
}
