# Cotation — Plataforma de Cotação e Gestão de Clientes para Agências de Viagem

Começou como um gerador de orçamento (print de voos → PDF/WhatsApp) e evoluiu
para uma plataforma completa: **Dashboard**, **Cotações**, **Clientes**,
**Equipe** e **Configurações**, com o mesmo motor de extração de voos e
geração de PDF de sempre.

## Stack

- Next.js (App Router) + TypeScript + Tailwind CSS
- [AI SDK](https://ai-sdk.dev) + Gemini (`@ai-sdk/google`) para extração fiel dos dados do print de voos (`generateObject` com schema Zod)
- **Puppeteer (Chromium headless)** para gerar o PDF, reaproveitando o HTML/CSS do template em [`pdf-template/`](pdf-template/) — roda 100% em Node, compatível com Vercel Functions
- Consulta pública de CNPJ via [BrasilAPI](https://brasilapi.com.br) (gratuita, sem chave)
- **Persistência**: Context React + `localStorage` (sem banco real ainda —
  ver `prisma/schema.prisma`, o desenho pronto pra quando isso for conectado)
- `sonner` para toasts

## Como rodar

1. Instale as dependências:

   ```bash
   npm install
   ```

2. Copie `.env.local.example` para `.env.local` e adicione sua chave gratuita
   do Gemini (gere em https://aistudio.google.com/apikey):

   ```bash
   cp .env.local.example .env.local
   ```

3. Rode o servidor de desenvolvimento:

   ```bash
   npm run dev
   ```

4. Abra http://localhost:3000

Os dados (agência, equipe, clientes, cotações) ficam salvos no
`localStorage` do navegador — sobrevivem a um refresh, mas são por
navegador/dispositivo (não sincronizam entre máquinas até um banco real ser
conectado).

## Módulos

- **Dashboard** (`/`) — vendas do mês, nº de orçamentos, taxa de conversão
  (vs. mês anterior), gráfico dos últimos 6 meses (gerados x fechados),
  últimas cotações e clientes recentes.
- **Cotações** (`/cotacoes`) — lista com busca/filtro por status, cliente e
  destino. `/cotacoes/nova` é o fluxo principal: upload do print de voos →
  extração automática → checkboxes → dados da cotação (cliente, responsável,
  pagamento, validade) → gera WhatsApp/PDF e salva. Ação de duplicar e de
  marcar como enviada. Seletor de tipo **Voo | Hotel | Pacote** — Hotel e
  Pacote aparecem na UI mas ficam desativados ("em breve"); o schema já
  reserva os campos (`HotelStay`) pra quando isso for ligado.
- **Clientes** (`/clientes`) — carteira de clientes com busca, cadastro e
  perfil mostrando o histórico de cotações daquele cliente.
- **Equipe** (`/equipe`) — pessoas da agência com nome/cargo/contato, que
  podem ser escolhidas como **responsável** de cada cotação (auto-preenche
  vendedor/telefone/e-mail; a página mostra quantas cotações cada pessoa tem).
- **Configurações** (`/configuracoes`) — dados da agência (nome, CNPJ com
  busca automática, Cadastur, logo com drag-and-drop, site), vendedor padrão,
  numeração de orçamento (prefixo + próximo número) e identidade visual do
  PDF (3 cores customizáveis + botão "usar padrão do sistema").

## Estrutura

```
src/
  app/
    page.tsx                    # Dashboard
    cotacoes/{page,nova,[id]}.tsx
    clientes/{page,novo,[id]}.tsx
    equipe/page.tsx
    configuracoes/page.tsx
    api/extract/route.ts        # extração via IA (Gemini + generateObject)
    api/pdf/route.ts            # gera o PDF via Puppeteer
    api/cnpj/route.ts           # consulta CNPJ (proxy pra BrasilAPI)
  components/
    shell/                      # Sidebar, AppShell, PageHeader, EmptyState, StatusBadge
    cotacoes/                   # QuoteEditor, QuoteExtrasForm, ClientPicker, TeamMemberPicker...
    clientes/ClientForm.tsx
    dashboard/                  # StatTile, MonthlyQuotesChart
    UploadCard.tsx / FlightList.tsx / PreviewPanel.tsx   # motor de extração/preview original
  lib/
    types.ts                    # tipos do motor de voo/PDF (QuoteItem, AgencyInfo)
    store/                      # "banco local": AppDataContext + types (AgencySettings, Client, Quote, TeamMember)
    schema.ts                   # schema Zod da extração
    format.ts                   # formatação de moeda/data/CNPJ
    whatsapp.ts                 # geração do texto para WhatsApp
    pdf/
      buildFlightQuoteData.ts   # mapeia QuoteItem[]+AgencyInfo -> dados do PDF
      renderFlightQuoteHtml.ts  # monta o HTML (reaproveita style.css/flight-quote.css)
      renderPdf.ts              # HTML -> PDF via Puppeteer/Chromium

prisma/schema.prisma            # desenho do banco (Agency, Client, TeamMember, Quote, FlightOption,
                                 # HotelStay) — NÃO conectado ainda, ver "Persistência" abaixo

pdf-template/                   # deliverable standalone (Python/Jinja2/WeasyPrint)
  template.html / flight-quote.html / style.css / flight-quote.css / generate_pdf.py
```

## Persistência: hoje local, schema pronto pra depois

Não há banco de dados conectado. `src/lib/store/AppDataContext.tsx` guarda
tudo em `localStorage`, com a mesma forma de uma API real
(`list/get/create/update/remove`) — trocar por `fetch()` depois é mecânico.

`prisma/schema.prisma` já tem o modelo relacional completo (Agency, Client,
TeamMember, Quote, FlightOption, HotelStay) pronto pra quando alguém for
conectar um banco de verdade (Postgres via Neon/Vercel Marketplace é o
caminho natural). É só o arquivo de schema — nada em `src/` importa
`@prisma/client`, e o pacote `prisma` não está instalado (adicionar como
devDependency só quando for de fato conectar, pra não carregar dependências
à toa).

## Como o PDF é gerado

A API `/api/pdf`:

1. Mapeia os itens selecionados + dados da agência/cotação (`buildFlightQuoteData.ts`).
2. Monta o HTML da cotação em JS (`renderFlightQuoteHtml.ts`), injetando os
   dados nas mesmas folhas de estilo (`pdf-template/style.css` +
   `flight-quote.css`) usadas pelo template Jinja2 — um único design
   compartilhado pelos dois pipelines. Cores customizadas (Configurações)
   entram como um `<style>` de override no final.
3. Renderiza esse HTML em PDF com Chromium headless via Puppeteer
   (`renderPdf.ts`):
   - **Local (dev)**: usa o pacote `puppeteer` (baixa um Chromium compatível
     com seu SO na instalação).
   - **Produção/serverless (Vercel, Lambda)**: usa `puppeteer-core` +
     `@sparticuz/chromium`, um build de Chromium enxuto com as libs nativas
     já vinculadas estaticamente, feito pra rodar dentro dos limites de uma
     function serverless — por isso funciona na Vercel sem infra extra.

O `pdf-template/` (Python + Jinja2 + WeasyPrint) continua existindo como
**entregável standalone** — útil se você quiser gerar orçamentos fora do
Next.js, por linha de comando, ou reaproveitar o design em outro projeto.
Veja o README daquela pasta para instruções.

## CNPJ e Cadastur

O campo CNPJ (em Configurações) tem um botão "Buscar" que consulta a
[BrasilAPI](https://brasilapi.com.br/api/cnpj/v1/) (gratuita, sem chave) via
`/api/cnpj` e preenche automaticamente nome, endereço e telefone da agência.
O campo Cadastur é só um texto livre (número de registro no Ministério do
Turismo) — não existe uma API pública estável para consultá-lo. Ambos
aparecem no cabeçalho do PDF quando informados.

## Segurança

- `GOOGLE_GENERATIVE_AI_API_KEY` nunca é exposta ao navegador: é lida só no
  servidor (rotas em `src/app/api/*`), nunca prefixada com `NEXT_PUBLIC_`, e
  nunca aparece nas respostas JSON. O DevTools do navegador (Network,
  Sources, Application) não tem como revelá-la — o cliente só fala com as
  rotas do próprio app, nunca direto com a API do Gemini.
- Hoje as rotas `/api/extract`, `/api/pdf` e `/api/cnpj` são públicas e sem
  limite de uso — qualquer um com a URL do app publicado pode chamá-las
  diretamente (não só pela UI), o que pode gerar custo/consumo de quota da
  IA por terceiros. Isso não expõe a chave, mas é um vetor de abuso de custo.
  Antes de publicar o app para além de uso pessoal/local, vale adicionar
  rate limiting e/ou uma autenticação simples nessas rotas.
- Os dados ficam só no `localStorage` do navegador de quem usa — não há
  compartilhamento entre usuários/dispositivos nem backup automático
  enquanto não houver um banco conectado.

## Deploy

Projeto pronto para deploy na Vercel. Configure `GOOGLE_GENERATIVE_AI_API_KEY`
(e opcionalmente `GEMINI_MODEL`) no projeto Vercel antes do deploy.
