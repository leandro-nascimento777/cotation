/**
 * Estilos base e específicos para renderização de cotação de voos em PDF.
 * Consolidado a partir dos templates de design (sem dependência de I/O em disco).
 */

export const FLIGHT_QUOTE_BASE_CSS = `
:root {
  --cor-primaria: #1b4f8c;
  --cor-primaria-clara: #eaf0f8;
  --cor-destaque: #8a2be2;
  --cor-destaque-texto: #ffffff;
  --cor-borda: #cccccc;
  --cor-texto: #222222;
  --cor-texto-suave: #555555;
  --fonte: Arial, Helvetica, "Helvetica Neue", sans-serif;
}

* {
  box-sizing: border-box;
}

body {
  margin: 0;
  padding: 0;
  font-family: var(--fonte);
  color: var(--cor-texto);
  font-size: 10px;
  line-height: 1.4;
}

p {
  margin: 0 0 2px 0;
}

/* ---------- Cabeçalho ---------- */
.header {
  display: table;
  width: 100%;
  table-layout: fixed;
  border-bottom: 2px solid var(--cor-primaria);
  padding-bottom: 8px;
  margin-bottom: 8px;
}

.header-left {
  display: table-cell;
  width: 140px;
  vertical-align: top;
}

.logo {
  max-width: 130px;
  max-height: 60px;
  object-fit: contain;
}

.logo-placeholder {
  width: 130px;
  height: 60px;
  background: #e2e2e2;
  border: 1px dashed #9a9a9a;
  color: var(--cor-texto-suave);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 12px;
  letter-spacing: 1px;
}

.header-center {
  display: table-cell;
  vertical-align: top;
  padding: 0 12px;
  font-size: 9px;
  color: var(--cor-texto-suave);
}

.header-center .agencia-nome {
  font-size: 12px;
  font-weight: bold;
  color: var(--cor-texto);
  margin-bottom: 2px;
}

.header-right {
  display: table-cell;
  width: 230px;
  vertical-align: top;
  text-align: right;
  font-size: 9px;
  color: var(--cor-texto-suave);
  white-space: nowrap;
}

.header-right .label {
  font-weight: bold;
  color: var(--cor-texto);
}

/* ---------- Linha de data / número do orçamento ---------- */
.linha-data {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  font-size: 10px;
  margin-bottom: 10px;
}

.linha-data strong {
  color: var(--cor-primaria);
}

.linha-data-direita {
  text-align: right;
}

.linha-data .validade {
  font-size: 8.5px;
  color: var(--cor-texto-suave);
}

/* ---------- Banner de agradecimento ---------- */
.banner-destaque {
  background: var(--cor-destaque);
  color: var(--cor-destaque-texto);
  padding: 8px 12px;
  border-radius: 2px;
  text-align: center;
  margin-bottom: 12px;
}

.banner-destaque p {
  margin: 0;
  font-size: 11px;
  font-weight: bold;
}

/* ---------- Seções e Tabelas ---------- */
.secao {
  margin-bottom: 14px;
}

.titulo-secao {
  background: var(--cor-primaria);
  color: #ffffff;
  font-size: 12px;
  font-weight: bold;
  margin: 0 0 6px 0;
  padding: 5px 10px;
  display: flex;
  align-items: center;
  gap: 6px;
}

.tabela {
  width: 100%;
  border-collapse: collapse;
  font-size: 10px;
}

.tabela th,
.tabela td {
  border: 1px solid var(--cor-borda);
  padding: 5px 7px;
  text-align: left;
  vertical-align: top;
}

.tabela th {
  background: var(--cor-primaria-clara);
  font-weight: bold;
  color: var(--cor-texto);
}

.tabela td.num,
.tabela th.num {
  text-align: right;
}

.tabela .small {
  font-size: 9px;
  color: var(--cor-texto-suave);
}

.tabela tr.subtotal td {
  font-weight: bold;
}

.secao-final .texto-livre {
  font-size: 9.5px;
  color: var(--cor-texto-suave);
  text-align: justify;
}

.secao-final .texto-livre p {
  margin: 0 0 6px 0;
}

/* ---------- Estilos específicos de voos (flight-quote.css) ---------- */
.voo-grupo-titulo {
  margin: 0 0 6px 0;
  font-size: 10px;
  font-weight: bold;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: var(--cor-primaria);
}

.voo-card {
  border: 1px solid var(--cor-borda);
  border-radius: 3px;
  margin-bottom: 10px;
  overflow: hidden;
  page-break-inside: avoid;
}

.voo-card-header {
  background: var(--cor-primaria);
  color: #ffffff;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 6px 10px;
  font-size: 10px;
  font-weight: bold;
}

.voo-card-preco {
  font-size: 12px;
}

.voo-card-body {
  padding: 8px 10px;
}

.voo-leg-label {
  margin: 0 0 3px 0;
  font-size: 8px;
  font-weight: bold;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  color: var(--cor-primaria);
}

.voo-leg-divisor {
  height: 1px;
  background: var(--cor-borda);
  margin: 8px 0;
}

.voo-meta-final {
  margin-top: 6px;
}

.voo-rota {
  display: flex;
  align-items: center;
  margin-bottom: 6px;
}

.voo-rota-origem {
  flex: 1;
}

.voo-rota-destino {
  flex: 1;
  text-align: right;
}

.voo-seta {
  color: var(--cor-texto-suave);
  margin: 0 10px;
  font-size: 9px;
  white-space: nowrap;
}

.voo-aeroporto {
  font-size: 11px;
  font-weight: bold;
  margin: 0;
}

.voo-horario {
  font-size: 9px;
  color: var(--cor-texto-suave);
  margin: 0;
}

.voo-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  padding-top: 6px;
  border-top: 1px solid var(--cor-borda);
  font-size: 9px;
  color: var(--cor-texto-suave);
}

.voo-meta strong {
  color: var(--cor-texto);
}

.valor-a-partir-box {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: var(--cor-primaria-clara);
  border: 1px solid var(--cor-borda);
  border-radius: 3px;
  padding: 8px 12px;
  margin-top: 4px;
  margin-bottom: 14px;
}

.valor-a-partir-valor {
  font-size: 14px;
  font-weight: bold;
  color: var(--cor-primaria);
}

.rodape {
  display: flex;
  justify-content: space-between;
  font-size: 8px;
  color: var(--cor-texto-suave);
  border-top: 1px solid var(--cor-borda);
  padding-top: 6px;
  margin-top: 20px;
}
`;
