import { ProposalPdfData } from "./buildProposalPdfData";
import { escapeHtml, nl2brSimple as nl2br } from "./htmlUtils";
import { getAirlineLogoUrl } from "../airlineLogo";

const PLANE_ICON = `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z"/></svg>`;

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Oswald:wght@500;700;800;900&display=swap');
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
.cover-glass { display: inline-block; background: linear-gradient(135deg, rgba(0, 0, 0, 0.04), rgba(94, 23, 235, 0.03) 50%, rgba(255, 255, 255, 0.02)); border: 1px solid rgba(255,255,255,0.15); border-radius: 14px; padding: 10px 22px; -webkit-backdrop-filter: blur(8px); backdrop-filter: blur(8px); box-shadow: 0 4px 15px rgba(0,0,0,0.10); }
.cover-title { font-size: 24px; font-weight: 900; text-transform: uppercase; letter-spacing: -0.5px; line-height: 1; margin: 0; white-space: nowrap; color: #fff; text-shadow: 0 2px 4px rgba(0,0,0,0.85); }

.band { background: #5E17EB; border-radius: 0 0 18px 18px; margin-top: -18px; padding: 36px 18px 18px; }
.ticket-card { position: relative; background: #fff; border-radius: 24px; box-shadow: 0 10px 30px rgba(0,0,0,0.15); padding: 22px 26px; overflow: hidden; border: 1.5px solid rgba(110,68,255,0.3); display: flex; align-items: center; gap: 20px; }
.ticket-watermark { position: absolute; top: 0; left: 0; right: 0; bottom: 0; display: flex; align-items: center; justify-content: center; opacity: 0.45; pointer-events: none; }
.ticket-barcode-wrap { display: flex; align-items: center; gap: 10px; flex-shrink: 0; z-index: 2; }
.ticket-barcode-num { font-family: 'Oswald', sans-serif; font-size: 9px; font-weight: 700; color: #6E44FF; letter-spacing: 0.28em; writing-mode: vertical-rl; transform: rotate(180deg); }
.ticket-content { flex: 1; position: relative; z-index: 2; display: flex; flex-direction: column; justify-content: space-between; gap: 16px; }
.ticket-top { display: flex; justify-content: space-between; }
.ticket-col-title { font-family: 'Oswald', sans-serif; font-size: 10px; font-weight: 500; text-transform: uppercase; letter-spacing: 0.05em; color: #000; margin: 0 0 4px; }
.ticket-col-val { font-family: 'Oswald', sans-serif; font-size: 14px; font-weight: 700; color: #6E44FF; margin: 0; }
.ticket-mid { display: flex; align-items: center; justify-content: space-between; margin: 6px 0; }
.ticket-iata { font-family: 'Oswald', sans-serif; font-size: 54px; font-weight: 700; color: #6E44FF; line-height: 1; margin: 0; }
.ticket-loc { font-size: 9px; font-weight: 700; color: #1e1b4b; text-transform: uppercase; letter-spacing: 0.08em; margin: 4px 0 0; text-align: center; }
.ticket-center { text-align: center; flex: 1; display: flex; align-items: center; justify-content: center; }
.ticket-plane-svg { width: 96px; height: 42px; color: #6E44FF; fill: #6E44FF; }
.ticket-bot { display: flex; align-items: center; justify-content: space-between; position: relative; margin-top: 8px; }
.ticket-cotacao { font-family: 'Oswald', sans-serif; font-size: 16px; font-weight: 700; letter-spacing: 0.22em; color: #6E44FF; text-transform: uppercase; margin: 0; }
.ticket-subtext { font-family: 'Oswald', sans-serif; font-size: 8px; font-weight: 600; color: #6E44FF; text-transform: uppercase; max-width: 280px; margin: 3px auto 0; line-height: 1.2; }
.ticket-class-label { font-family: 'Oswald', sans-serif; font-size: 9px; font-weight: 500; color: #000; text-transform: uppercase; margin-bottom: 2px; }
.ticket-class-val { font-family: 'Oswald', sans-serif; font-size: 18px; font-weight: 700; color: #6E44FF; text-transform: uppercase; }

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
  const logo = getAirlineLogoUrl(leg.airline, leg.flightNumber);
  const logoHtml = logo
    ? `<img src="${escapeHtml(logo)}" alt="" style="width:14px;height:14px;border-radius:999px;vertical-align:middle;margin-right:5px;object-fit:contain;background:#fff;border:1px solid #cbd5e1;padding:1px;display:inline-block;" />`
    : "";
  return `<div class="detail-grid">
    <div class="detail-box"><span class="l">Companhia</span><span class="v" style="display:inline-flex;align-items:center;">${logoHtml}<span>${escapeHtml(`${leg.airline} ${leg.flightNumber}`.trim())}</span></span></div>
    <div class="detail-box"><span class="l">Data de embarque</span><span class="v">${escapeHtml(leg.date)}</span></div>
    <div class="detail-box"><span class="l">Horário</span><span class="v">${escapeHtml(leg.departureTime)}–${escapeHtml(leg.arrivalTime)}</span></div>
    <div class="detail-box"><span class="l">Duração</span><span class="v">${escapeHtml(leg.duration)} · ${escapeHtml(leg.stops)}</span></div>
  </div>`;
}

function renderOption(option: ProposalPdfData["options"][number]): string {
  const primary = option.ida || option.volta;
  const logo = primary ? getAirlineLogoUrl(primary.airline, primary.flightNumber) : null;
  const headerLogoHtml = logo
    ? `<img src="${escapeHtml(logo)}" alt="" style="width:18px;height:18px;border-radius:999px;object-fit:contain;background:#fff;border:1px solid #cbd5e1;padding:1px;margin-right:6px;" />`
    : "";
  return `<div class="option-card">
    <div class="option-header">
      <span class="icon">${PLANE_ICON}</span>
      ${headerLogoHtml}
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
  const passengersHtml = data.passengersList
    .map((p, idx) => `<p class="ticket-col-val">${escapeHtml(p)}${idx < data.passengersList.length - 1 ? "," : ""}</p>`)
    .join("");

  const barPattern = [
    3, 2, 2, 4, 1, 3, 4, 2, 2, 3, 5, 2, 3, 2, 2, 4, 3, 2, 2, 5, 2, 3, 2, 4,
    2, 3, 5, 2, 3, 2, 4, 2, 2, 3, 4, 2, 3, 5, 2, 3, 2, 4, 3, 2, 3, 5, 2, 3,
    2, 4, 2, 3, 5, 3, 2, 2, 4, 2, 3, 2, 5, 2, 2, 3,
  ];
  let curX = 0;
  const barcodeRects = barPattern
    .map((w, idx) => {
      const isBar = idx % 2 === 0;
      const x = curX;
      curX += w;
      return isBar ? `<rect x="${x}" y="0" width="${w}" height="155" fill="#000000" />` : "";
    })
    .join("");

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<title>Proposta ${escapeHtml(data.numero)}</title>
<style>${CSS}</style>
</head>
<body>
  <div class="doc">
    <div class="cover" style="background-image: linear-gradient(to top, rgba(0,0,0,.25), rgba(0,0,0,0) 55%), url('${escapeHtml(data.coverImageUrl)}')">
      <div class="cover-glass">
        <p class="cover-title">${escapeHtml(data.coverTitle)}</p>
      </div>
    </div>

    <div class="band">
      <div class="ticket-card">
        <div class="ticket-watermark">
          <svg viewBox="0 0 1000 500" width="100%" height="100%" fill="#fce7e7">
            <path d="M120,60 Q170,40 230,50 Q280,30 330,60 Q340,110 300,140 Q320,190 280,220 Q240,240 210,210 Q180,240 140,210 Q90,170 100,120 Z" />
            <path d="M260,300 Q310,290 350,330 Q380,390 340,470 Q310,510 290,470 Q270,400 250,350 Q240,310 260,300 Z" />
            <path d="M470,70 Q520,50 560,70 Q580,110 540,140 Q510,160 480,140 Q460,110 470,70 Z" />
            <path d="M460,170 Q530,160 570,200 Q610,260 590,340 Q560,420 510,430 Q460,380 440,300 Q430,220 460,170 Z" />
            <path d="M570,70 Q660,40 760,60 Q860,80 910,130 Q890,210 830,240 Q770,270 700,240 Q660,200 620,180 Q590,130 570,70 Z" />
            <path d="M780,360 Q860,340 910,380 Q930,440 880,470 Q810,480 770,430 Q750,380 780,360 Z" />
          </svg>
        </div>

        <div class="ticket-barcode-wrap">
          <svg width="48" height="155" viewBox="0 0 ${curX} 155" preserveAspectRatio="none">
            ${barcodeRects}
          </svg>
          <span class="ticket-barcode-num">123 456 789 10 11 12</span>
        </div>

        <div class="ticket-content">
          <div class="ticket-top">
            <div>
              <p class="ticket-col-title">${data.passengersList.length > 1 ? "NAMES OF PASSENGERS" : "NAME OF PASSENGER"}</p>
              ${passengersHtml}
            </div>
            <div>
              <p class="ticket-col-title">DATA DE IDA</p>
              <p class="ticket-col-val">${escapeHtml(data.ticketIdaDate)}</p>
            </div>
            <div>
              <p class="ticket-col-title">DATA DE VOLTA</p>
              <p class="ticket-col-val">${escapeHtml(data.ticketVoltaDate)}</p>
            </div>
            <div style="text-align: right;">
              <p class="ticket-col-title">DESTINO</p>
              <p class="ticket-col-val">${escapeHtml(data.ticketDestinoCode)}</p>
            </div>
          </div>

          <div class="ticket-mid">
            <div style="text-align: center;">
              <p class="ticket-iata">${escapeHtml(data.ticketOriginIata)}</p>
              <p class="ticket-loc">${escapeHtml(data.ticketOriginLocation)}</p>
            </div>
            <div class="ticket-center">
              <svg viewBox="0 0 116 84" class="ticket-plane-svg">
                <path d="M 93.0 18.0 L 96.0 18.0 L 97.0 19.0 L 104.0 19.0 L 105.0 20.0 L 105.0 24.0 L 100.0 29.0 L 99.0 29.0 L 94.0 33.0 L 78.0 41.0 L 78.0 43.0 L 77.0 44.0 L 77.0 49.0 L 76.0 50.0 L 76.0 55.0 L 75.0 56.0 L 75.0 62.0 L 74.0 63.0 L 74.0 66.0 L 73.0 67.0 L 71.0 67.0 L 69.0 68.0 L 65.0 54.0 L 58.0 50.0 L 56.0 50.0 L 55.0 51.0 L 53.0 51.0 L 52.0 52.0 L 50.0 52.0 L 46.0 54.0 L 43.0 54.0 L 42.0 55.0 L 35.0 56.0 L 32.0 58.0 L 32.0 62.0 L 31.0 63.0 L 28.0 63.0 L 24.0 59.0 L 22.0 58.0 L 20.0 59.0 L 18.0 55.0 L 6.0 49.0 L 8.0 47.0 L 11.0 47.0 L 12.0 48.0 L 16.0 48.0 L 17.0 49.0 L 20.0 49.0 L 21.0 47.0 L 20.0 46.0 L 19.0 41.0 L 21.0 40.0 L 22.0 41.0 L 24.0 41.0 L 26.0 42.0 L 28.0 44.0 L 31.0 45.0 L 33.0 47.0 L 42.0 43.0 L 44.0 41.0 L 42.0 39.0 L 36.0 36.0 L 34.0 36.0 L 33.0 35.0 L 30.0 35.0 L 29.0 34.0 L 27.0 34.0 L 26.0 33.0 L 24.0 33.0 L 20.0 31.0 L 17.0 31.0 L 16.0 30.0 L 14.0 30.0 L 10.0 28.0 L 7.0 28.0 L 7.0 26.0 L 9.0 24.0 L 17.0 24.0 L 18.0 25.0 L 26.0 25.0 L 27.0 26.0 L 36.0 26.0 L 37.0 27.0 L 45.0 27.0 L 46.0 28.0 L 54.0 28.0 L 55.0 29.0 L 64.0 29.0 L 65.0 30.0 L 70.0 30.0 L 86.0 22.0 L 88.0 20.0 L 90.0 19.0 L 92.0 19.0 L 93.0 18.0 Z" />
              </svg>
            </div>
            <div style="text-align: center;">
              <p class="ticket-iata">${escapeHtml(data.ticketDestIata)}</p>
              <p class="ticket-loc">${escapeHtml(data.ticketDestLocation)}</p>
            </div>
          </div>

          <div class="ticket-bot">
            <div style="width: 80px;"></div>
            <div style="text-align: center; flex: 1;">
              <p class="ticket-cotacao">COTAÇÃO</p>
              <p class="ticket-subtext">PRÓXIMO PASSO: CONFIRME A PROPOSTA E ENVIE OS DADOS DOS PASSAGEIROS PARA RESERVA/EMISSÃO.</p>
            </div>
            <div style="text-align: right; width: 80px;">
              <div class="ticket-class-label">CLASS</div>
              <div class="ticket-class-val">${escapeHtml(data.ticketClass)}</div>
            </div>
          </div>
        </div>
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
