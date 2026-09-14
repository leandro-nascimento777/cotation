# Gerador de Orçamento — Agências de Viagem

App simples para agências de viagem: o agente tira um **print de uma tela de\
comparação de voos**, a IA (Gemini) extrai os dados da tabela com fidelidade,\
o agente escolhe (checkbox) quais opções entram no orçamento — com preview ao\
vivo — e o app gera a saída em dois formatos:

- **Texto Markdown para WhatsApp** (copiar e colar)
- **PDF** formatado para envio ao cliente (logo da agência substituível, com\
  drag-and-drop; CNPJ auto-preenchível; Cadastur)

## Stack

- Next.js (App Router) + TypeScript + Tailwind CSS
- [AI SDK](https://ai-sdk.dev) + Gemini (`@ai-sdk/google`) para extração fiel dos dados do print (`generateObject` com schema Zod)
- **Puppeteer (Chromium headless)** para gerar o PDF, reaproveitando o HTML/CSS do template em [`pdf-template/`](pdf-template/) — roda 100% em Node, compatível com Vercel Functions
- Consulta pública de CNPJ via [BrasilAPI](https://brasilapi.com.br) (gratuita, sem chave)

## Como rodar

1. Instale as dependências:

   ```bash
   npm install
   ```

2. Copie `.env.local.example` para `.env.local` e adicione sua chave gratuita\
   do Gemini (gere em https://aistudio.google.com/apikey):

   ```bash
   cp .env.local.example .env.local
   ```

3. Rode o servidor de desenvolvimento:

   ```bash
   npm run dev
   ```

4. Abra http://localhost:3000

## Fluxo

1. **Upload do print** — arraste ou selecione a imagem da tela de voos.
2. **Extração automática** — a IA lê a imagem e devolve cada linha de voo com\
   suas tarifas (sem/com bagagem).
3. **Seleção** — marque quais opções (voo + tipo de tarifa) entram no orçamento;\
   o preview à direita atualiza em tempo real.
4. **Dados da agência** — logo (arraste ou clique), CNPJ (busca automática de\
   nome/endereço/telefone), Cadastur, vendedor, contato, validade da cotação,\
   mensagem de destaque e observações — tudo entra automaticamente no texto e\
   no PDF.
5. **Gerar saída** — copie o texto formatado para WhatsApp ou baixe o PDF.
6. **Limpar orçamento** — o botão no topo apaga o print e os dados extraídos\
   para começar uma nova cotação (mantém os dados da agência preenchidos).

## Estrutura

```
src/
  app/
    api/extract/route.ts        # extração via IA (Gemini + generateObject)
    api/pdf/route.ts            # gera o PDF via Puppeteer
    api/cnpj/route.ts           # consulta CNPJ (proxy pra BrasilAPI)
    page.tsx                    # UI principal
  components/
    UploadCard.tsx
    FlightList.tsx
    AgencyForm.tsx               # logo (drag-and-drop), CNPJ, Cadastur, validade
    PreviewPanel.tsx
  lib/
    types.ts                    # tipos compartilhados
    schema.ts                    # schema Zod da extração
    format.ts                    # formatação de moeda/data/CNPJ
    whatsapp.ts                   # geração do texto para WhatsApp
    pdf/
      buildFlightQuoteData.ts     # mapeia QuoteItem[]+AgencyInfo -> dados do PDF
      renderFlightQuoteHtml.ts    # monta o HTML (reaproveita style.css/flight-quote.css)
      renderPdf.ts                 # HTML -> PDF via Puppeteer/Chromium

pdf-template/                   # deliverable standalone (Python/Jinja2/WeasyPrint)
  template.html                  # layout genérico de pacote (referência CVC)
  flight-quote.html              # mesmo design, versão de referência em Jinja2
  style.css / flight-quote.css   # fonte única de verdade do design (usada pelos 2 pipelines)
  generate_pdf.py
```

## Como o PDF é gerado

A API `/api/pdf`:

1. Mapeia os itens selecionados + dados da agência (`buildFlightQuoteData.ts`).
2. Monta o HTML da cotação em JS (`renderFlightQuoteHtml.ts`), injetando os
   dados nas mesmas folhas de estilo (`pdf-template/style.css` +
   `flight-quote.css`) usadas pelo template Jinja2 — um único design
   compartilhado pelos dois pipelines.
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

O campo CNPJ tem um botão "Buscar" que consulta a
[BrasilAPI](https://brasilapi.com.br/api/cnpj/v1/) (gratuita, sem chave) via
`/api/cnpj` e preenche automaticamente nome, endereço e telefone da agência.
O campo Cadastur é só um texto livre (número de registro no Ministério do
Turismo) — não existe uma API pública estável para consultá-lo, então é
preenchido manualmente. Ambos aparecem no cabeçalho do PDF quando informados.

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

## Deploy

Projeto pronto para deploy na Vercel. Configure `GOOGLE_GENERATIVE_AI_API_KEY`
(e opcionalmente `GEMINI_MODEL`) no projeto Vercel antes do deploy.
