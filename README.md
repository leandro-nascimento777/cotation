# Gerador de Orçamento — Agências de Viagem

App simples para agências de viagem: o agente tira um **print de uma tela de\
comparação de voos**, a IA (Gemini) extrai os dados da tabela com fidelidade,\
o agente escolhe (checkbox) quais opções entram no orçamento — com preview ao\
vivo — e o app gera a saída em dois formatos:

- **Texto Markdown para WhatsApp** (copiar e colar)
- **PDF** formatado para envio ao cliente (logo da agência substituível)

## Stack

- Next.js (App Router) + TypeScript + Tailwind CSS
- [AI SDK](https://ai-sdk.dev) + Gemini (`@ai-sdk/google`) para extração fiel dos dados do print (`generateObject` com schema Zod)
- **Python + Jinja2 + WeasyPrint** para gerar o PDF (template em [`pdf-template/`](pdf-template/)), chamado pela API do Next.js via `child_process`

## Como rodar

1. Instale as dependências do Next.js:

   ```bash
   npm install
   ```

2. Configure o ambiente Python que gera o PDF (uma vez só) — siga
   [`pdf-template/README.md`](pdf-template/README.md) (instala WeasyPrint +
   libs de sistema e cria o venv em `pdf-template/.venv`).

3. Copie `.env.local.example` para `.env.local` e preencha:

   ```bash
   cp .env.local.example .env.local
   ```

   - `GOOGLE_GENERATIVE_AI_API_KEY` — chave gratuita do Gemini (gere em https://aistudio.google.com/apikey)
   - `PDF_PYTHON_BIN` — caminho do python do venv criado no passo 2 (ex: `./pdf-template/.venv/bin/python3`)

4. Rode o servidor de desenvolvimento:

   ```bash
   npm run dev
   ```

5. Abra http://localhost:3000

## Fluxo

1. **Upload do print** — arraste ou selecione a imagem da tela de voos.
2. **Extração automática** — a IA lê a imagem e devolve cada linha de voo com\
   suas tarifas (sem/com bagagem).
3. **Seleção** — marque quais opções (voo + tipo de tarifa) entram no orçamento;\
   o preview à direita atualiza em tempo real.
4. **Dados da agência** — logo (opcional), nome, vendedor, contato, mensagem de\
   destaque e observações — tudo entra automaticamente no texto e no PDF.
5. **Gerar saída** — copie o texto formatado para WhatsApp ou baixe o PDF.

## Estrutura

```
src/
  app/
    api/extract/route.ts     # extração via IA (Gemini + generateObject)
    api/pdf/route.ts         # chama o Python (pdf-template/generate_pdf.py)
    page.tsx                 # UI principal
  components/
    UploadCard.tsx
    FlightList.tsx
    AgencyForm.tsx            # inclui upload de logo
    PreviewPanel.tsx
  lib/
    types.ts                 # tipos compartilhados
    schema.ts                 # schema Zod da extração
    format.ts                 # formatação de moeda/data
    whatsapp.ts                # geração do texto para WhatsApp
    pdf/buildFlightQuoteData.ts # mapeia QuoteItem[]+AgencyInfo -> dados do template Jinja2

pdf-template/                # template HTML/CSS + script Python (ver README próprio)
  template.html               # layout genérico de pacote (referência CVC)
  flight-quote.html           # layout usado pelo app (cotação de voos)
  style.css / flight-quote.css
  generate_pdf.py
```

## Como o PDF é gerado

A API `/api/pdf` não usa mais `@react-pdf/renderer`. Ela:

1. Mapeia os itens selecionados + dados da agência para o formato esperado
   pelo template (`src/lib/pdf/buildFlightQuoteData.ts`).
2. Grava esse JSON num arquivo temporário.
3. Executa `pdf-template/generate_pdf.py --template flight-quote.html` via
   `child_process.execFile`, usando o python indicado em `PDF_PYTHON_BIN`.
4. Lê o PDF gerado e devolve na resposta.

Isso reaproveita o mesmo template/estilo entregável em `pdf-template/`
(veja aquele README para trocar cores, adicionar campos, etc.).

⚠️ **Limitação de deploy**: isso funciona em qualquer servidor Node "normal"
(ex: `next start` numa VM/container com Python instalado). Em uma função
serverless da Vercel **não** funciona out-of-the-box, porque o WeasyPrint
precisa de bibliotecas nativas (Pango, cairo, gdk-pixbuf) que não estão
disponíveis no runtime padrão. Para produção na Vercel, considere: (a) rodar
a geração de PDF num pequeno serviço à parte (ex: um container em outra
plataforma) chamado via HTTP pela API do Next.js, ou (b) empacotar essas
libs num runtime customizado. Para uso local/self-hosted, funciona direto.

## Deploy

Projeto pronto para deploy na Vercel **considerando a limitação acima**.
Configure `GOOGLE_GENERATIVE_AI_API_KEY` (e opcionalmente `GEMINI_MODEL`) no
projeto Vercel antes do deploy.
