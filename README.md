# Gerador de Orçamento — Agências de Viagem

App simples para agências de viagem: o agente tira um **print de uma tela de\
comparação de voos**, a IA (Gemini) extrai os dados da tabela com fidelidade,\
o agente escolhe (checkbox) quais opções entram no orçamento — com preview ao\
vivo — e o app gera a saída em dois formatos:

- **Texto Markdown para WhatsApp** (copiar e colar)
- **PDF** formatado para envio ao cliente

## Stack

- Next.js (App Router) + TypeScript + Tailwind CSS
- [AI SDK](https://ai-sdk.dev) + Gemini (`@ai-sdk/google`) para extração fiel dos dados do print (`generateObject` com schema Zod)
- [`@react-pdf/renderer`](https://react-pdf.org) para gerar o PDF no servidor

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
4. **Dados da agência** — preencha nome, vendedor, contato, mensagem de destaque\
   e observações — tudo entra automaticamente no texto e no PDF.
5. **Gerar saída** — copie o texto formatado para WhatsApp ou baixe o PDF.

## Estrutura

```
src/
  app/
    api/extract/route.ts   # extração via IA (Gemini + generateObject)
    api/pdf/route.ts       # geração do PDF (@react-pdf/renderer)
    page.tsx               # UI principal
  components/
    UploadCard.tsx
    FlightList.tsx
    AgencyForm.tsx
    PreviewPanel.tsx
  lib/
    types.ts               # tipos compartilhados
    schema.ts               # schema Zod da extração
    format.ts               # formatação de moeda/data
    whatsapp.ts             # geração do texto para WhatsApp
    pdf/QuoteDocument.tsx    # template do PDF
```

## Deploy

Projeto pronto para deploy na Vercel. Configure a variável de ambiente\
`GOOGLE_GENERATIVE_AI_API_KEY` (e opcionalmente `GEMINI_MODEL`) no projeto\
Vercel antes do deploy.
