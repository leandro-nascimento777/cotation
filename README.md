# Cotation — Plataforma de Cotação e Gestão para Agências de Viagens

Uma plataforma completa de engenharia moderna para agências de viagens: do upload de print de voos com extração por IA até a gestão de clientes, funil de vendas (Kanban), propostas comerciais públicas interativas e geração profissional de PDFs.

---

## Tecnologias e Arquitetura

- **Framework**: [Next.js 16 (App Router)](https://nextjs.org) + [React 19](https://react.dev)
- **Linguagem & Tipagem**: [TypeScript](https://www.typescriptlang.org) (Modo Estrito, 100% tipado)
- **Estilização & UI**: [Tailwind CSS 4](https://tailwindcss.com) + [shadcn/ui](https://ui.shadcn.com) + [Lucide Icons](https://lucide.dev)
- **Banco de Dados & ORM**: [PostgreSQL (Neon Serverless)](https://neon.tech) via [Prisma ORM](https://www.prisma.io)
- **Inteligência Artificial**: [Vercel AI SDK](https://ai-sdk.dev) + Google Gemini (`@ai-sdk/google`) com extração estruturada de dados via Zod
- **Geração de PDF**: [Puppeteer](https://pptr.dev) + `@sparticuz/chromium` (chaveamento dinâmico local vs. serverless Vercel Functions)
- **Validação de Dados**: [Zod](https://zod.dev) para validação em runtime no client, server actions e endpoints de API
- **Testes Automatizados**: [Vitest](https://vitest.dev) com suíte unitária para regras financeiras, máscaras e utilitários
- **Segurança & Resiliência**: Rate Limiting deslizante por IP, Error Boundaries (`error.tsx`, `global-error.tsx`, `not-found.tsx`)
- **Observabilidade**: Logger estruturado em JSON com timestamps ISO e metadados contextuais
- **CI/CD**: Pipeline automatizado no GitHub Actions (`.github/workflows/ci.yml`)

---

## Como Instalar e Rodar Localmente

### 1. Pré-requisitos
- Node.js 24 (runtime do Next.js)
- Bun 1.3+ (gerenciador de pacotes)

### 2. Instalação de Dependências
```bash
bun install
```

### 3. Configuração de Variáveis de Ambiente
Copie o arquivo de exemplo para `.env.local`:
```bash
cp .env.local.example .env.local
```

Preencha as variáveis necessárias no `.env.local`:
- `GOOGLE_GENERATIVE_AI_API_KEY`: Chave gratuita da API do Gemini (gere em https://aistudio.google.com/apikey).
- `DATABASE_URL` e `DATABASE_URL_UNPOOLED`: Connection strings do PostgreSQL (Neon).
- `BLOB_READ_WRITE_TOKEN`: Token do Vercel Blob (para upload de imagens de capa).

### 4. Scripts Principais

- **Desenvolvimento:** `bun run dev` (abre em http://localhost:3000)
- **Testes Automatizados:** `bun run test`
- **Checagem de Tipos:** `bunx tsc --noEmit`
- **Linter:** `bun run lint`
- **Build de Produção:** `bun run build`
- **Sincronizar Banco de Dados:** `bunx dotenv -e .env.local -- bunx prisma db push`

---

## Módulos da Aplicação

- **Dashboard (`/`)** — Métricas em tempo real (vendas do mês em R$, volume de orçamentos, taxa de conversão com delta vs. mês anterior), gráfico interativo dos últimos 6 meses (cotações geradas vs. vendas fechadas), últimas cotações e clientes recentes.
- **Cotações (`/cotacoes`)** — Kanban interativo completo com colunas por status (`NOVA`, `EM_ATENDIMENTO`, `PROPOSTA_ENVIADA`, `AGUARDANDO_CLIENTE`, `APROVADA`).
  - Arraste de cards (*Drag-and-Drop*) para movimentação instantânea de status.
  - Sincronização automática com respostas da proposta pública web.
  - Busca textual e filtros por prioridade (Baixa, Normal, Alta).
  - Modal de detalhes com fluxo dedicado de **"Fechar Venda"** com registro de localizador e opções compradas.
- **Nova Cotação (`/cotacoes/nova`)** — Fluxo principal:
  - Upload de print com drag-and-drop e visualização prévia.
  - Extração inteligente via IA Gemini reconhecendo 3 formatos de tela de consolidadoras brasileiras (tabela plana só ida, tabelas separadas ida/volta, cards de pacote combinado).
  - Seleção de tarifas por checkbox, bagagem e classe.
  - Dados completos da cotação (cliente, responsável da equipe, formas de pagamento, validade, observações).
  - Painel de saída multicanal (`PreviewPanel`): texto formatado para WhatsApp, geração de PDF profissional e criação de proposta pública interativa.
- **Proposta Comercial Pública (`/proposta/[shareId]` e `/proposta/h/[token]`)** — Proposta web de alta fidelidade visual acessível pelo cliente final sem login:
  - Temas de capa pré-configurados ou upload de imagem própria via Vercel Blob.
  - Seleção interativa de voos pelo cliente com recálculo do total em tempo real.
  - Envio de decisão: **"Aprovar e Confirmar Viagem"** ou **"Pedir Revisão"** com observações.
  - Suporte a links temporários com token único e expiração de 24 horas (revogáveis a qualquer momento).
- **Clientes (`/clientes`)** — Carteira de clientes com busca instantânea, histórico de cotações vinculadas, cadastro e edição com validação estrita via Zod (CPF, e-mail e telefone).
- **Equipe (`/equipe`)** — Cadastro dos consultores e vendedores da agência para atribuição direta como responsáveis pelas cotações.
- **Configurações & Motor Financeiro (`/configuracoes`)** — Gestão da agência (nome, filial, CNPJ com auto-busca via BrasilAPI, Cadastur, logo, site), numeração sequencial de orçamentos, identidade visual customizada do PDF (cores primárias, secundárias e texto) e perfis financeiros:
  - DU / RAV (% ou fixo com piso mínimo).
  - Fee de serviço nacional e internacional (por passageiro ou bilhete).
  - Markup adicional de lucro.
  - Repasse de taxa de gateway de parcelamento.
  - Margem de imposto retido sobre o lucro da agência.
  - Simulador financeiro em tempo real.

## Estrutura do Projeto

```
src/
  app/
    page.tsx                    # Dashboard principal com métricas e gráficos
    error.tsx                   # Error Boundary da aplicação
    global-error.tsx            # Error Boundary crítico do layout raiz
    not-found.tsx               # Página 404 personalizada
    cotacoes/                   # Board Kanban, detalhe e /nova (fluxo principal)
    clientes/                   # Carteira de clientes (lista, perfil, /novo)
    equipe/                     # Gestão de consultores/vendedores
    configuracoes/              # Configurações da agência + regras financeiras
    proposta/                   # Página pública da proposta ([shareId] e /h/[token])
    api/
      extract/                  # POST: extração de voos via Gemini com rate limit
      pdf/                      # POST: geração de PDF com Puppeteer e rate limit
      pdf/proposal/             # POST: geração de PDF da proposta comercial
      cnpj/                     # GET: consulta pública BrasilAPI com timeout
  components/
    ui/                         # Design System (FormField, Button, Input, Sheet, etc.)
    shell/                      # AppShell, Sidebar retrátil, PageHeader, LoadingState, etc.
    cotacoes/                   # QuoteEditor, QuoteExtrasForm, CloseSaleForm, TeamMemberPicker...
    clientes/                   # ClientForm com validação visual de erros
    dashboard/                  # StatTile, MonthlyQuotesChart
    proposal/                   # FlightSelector, ProposalResponseForm, etc.
  hooks/
    useQuoteBoard.ts            # Hook desacoplado para regras do funil/Kanban
  lib/
    types.ts                    # Tipos centrais de voo, tarifa e agência
    pricing.ts                  # Motor financeiro puro (calculatePricing)
    format.ts                   # Formatação de moeda BRL, datas e máscaras
    groupQuoteItems.ts          # Agrupamento de voos (combo / ida / volta) e groupByRow
    whatsapp.ts                 # Geração de texto em Markdown para WhatsApp
    logger.ts                   # Logger estruturado em JSON com timestamps ISO
    security/
      rateLimit.ts              # Rate limiter por IP com janela deslizante
    validation/
      schemas.ts                # Schemas Zod de clientes e equipe
      apiSchemas.ts             # Schemas Zod de payloads de API
    actions/                    # Server Actions com transações atômicas no Prisma
    pdf/
      htmlUtils.ts              # Funções de escape e sanitização de HTML
      buildFlightQuoteData.ts   # Mapeamento de dados do PDF
      renderFlightQuoteHtml.ts  # Renderização do template HTML de cotação
      renderProposalHtml.ts     # Renderização do template HTML de proposta
      renderPdf.ts              # Puppeteer: HTML -> PDF (local vs serverless)
    store/                      # Context com persistência híbrida e sync
prisma/
  schema.prisma                 # Schema do banco PostgreSQL (Neon)
tests/                          # Testes unitários automatizados (Vitest)
  pricing.test.ts
  format.test.ts
  groupQuoteItems.test.ts
  rateLimit.test.ts
.github/workflows/
  ci.yml                        # Pipeline de CI/CD automatizado no GitHub Actions
```

## Persistência Híbrida de Dados (Offline-First + PostgreSQL)

A aplicação adota um padrão de persistência de alta performance:
1. **Carregamento Instantâneo (Offline-First)**: Os dados de clientes, equipe e cotações são lidos de imediato do cache local no primeiro render, eliminando tempo de espera ou telas de carregamento para o usuário.
2. **Persistência em Nuvem (PostgreSQL Neon via Prisma)**: Em background, a aplicação sincroniza com o banco de dados. Todas as operações de criação, edição e exclusão disparam **Server Actions** (`src/lib/actions/`) que realizam mutações duráveis no banco.
3. **Transações Atômicas (`prisma.$transaction`)**: A criação de orçamentos salva a cotação e todas as suas opções de voo dentro de uma mesma transação no Postgres. Caso ocorra qualquer falha, o banco sofre *rollback* automático, garantindo integridade referencial.

## Como o PDF é gerado

A API `/api/pdf`:

1. Mapeia os itens selecionados + dados da agência/cotação (`buildFlightQuoteData.ts`).
2. Monta o HTML da cotação em JS (`renderFlightQuoteHtml.ts`), com estilização
   otimizada e modular (`flightQuoteCss.ts`). Cores customizadas (Configurações)
   entram como um `<style>` de override no final.
3. Renderiza esse HTML em PDF com Chromium headless via Puppeteer
   (`renderPdf.ts`):
   - **Local (dev)**: usa o pacote `puppeteer` (baixa um Chromium compatível
     com seu SO na instalação).
   - **Produção/serverless (Vercel, Lambda)**: usa `puppeteer-core` +
     `@sparticuz/chromium`, um build de Chromium enxuto com as libs nativas
     já vinculadas estaticamente, feito pra rodar dentro dos limites de uma
     function serverless — por isso funciona na Vercel sem infra extra.

## CNPJ e Cadastur

O campo CNPJ (em Configurações) tem um botão "Buscar" que consulta a
[BrasilAPI](https://brasilapi.com.br/api/cnpj/v1/) (gratuita, sem chave) via
`/api/cnpj` e preenche automaticamente nome, endereço e telefone da agência.
O campo Cadastur é só um texto livre (número de registro no Ministério do
Turismo) — não existe uma API pública estável para consultá-lo. Ambos
aparecem no cabeçalho do PDF quando informados.

## Segurança e Resiliência

- **Rate Limiting Ativo (`src/lib/security/rateLimit.ts`)**: Proteção por IP contra abuso de consumo da API do Gemini (`/api/extract` limitada a 10 req/min/IP) e sobrecarga de CPU do Chromium (`/api/pdf` e `/api/pdf/proposal` limitadas a 15 req/min/IP), retornando HTTP `429 Too Many Requests` com cabeçalho `Retry-After`.
- **Proteção de Segredos**: `GOOGLE_GENERATIVE_AI_API_KEY` e credenciais do banco Neon nunca são expostas ao client (sem prefixo `NEXT_PUBLIC_`), sendo consumidas estritamente no runtime Node.js do servidor.
- **Validação com Schemas Zod**: Todo payload de formulário e de requisição de API é validado estritamente em tempo de execução antes do processamento.
- **Error Boundaries**: `error.tsx` e `global-error.tsx` fornecem recuperação instantânea com `reset()` e evitam travamentos da interface.
- **Logger Estruturado (`src/lib/logger.ts`)**: Emissão padronizada de logs em JSON com timestamps ISO e metadados contextuais para observabilidade em produção.

## Testes Automatizados (Vitest)

O projeto possui suíte completa de testes unitários para as regras mais sensíveis de negócio:

```bash
bun run test
```

- `tests/pricing.test.ts`: Cálculos de DU/RAV percentual/fixo, piso mínimo, fee por passageiro/bilhete, markup, repasse condicional de gateway e retenção de imposto calculada exclusivamente sobre o lucro da agência.
- `tests/format.test.ts`: Máscaras financeiras BRL, sanitização de CNPJ, formatação de links wa.me e conversão inteligente de datas extraídas para padrão ISO.
- `tests/groupQuoteItems.test.ts`: Classificação de trechos (`combo`, `ida`, `volta`) e particionamento por linhas de orçamento.
- `tests/rateLimit.test.ts`: Comportamento de bloqueio e liberação de requisições na janela deslizante por IP.

## CI/CD Automatizado

Pipeline configurado no GitHub Actions (`.github/workflows/ci.yml`) que valida a cada `push` ou `pull_request`:
1. `bun install --frozen-lockfile`
2. `bunx prisma generate`
3. `bun run lint`
4. `bunx tsc --noEmit`
5. `bun run test`
6. `bun run build`

## Deploy na Vercel

O projeto está pronto para deploy na Vercel:
1. Conecte o repositório à Vercel.
2. Configure as variáveis de ambiente:
   - `GOOGLE_GENERATIVE_AI_API_KEY`: Chave da API Google Gemini.
   - `DATABASE_URL`: Connection string pooled do PostgreSQL (Neon).
   - `DATABASE_URL_UNPOOLED`: Connection string direta do PostgreSQL (Neon).
   - `BLOB_READ_WRITE_TOKEN`: Token do Vercel Blob (para upload de capas personalizadas).
3. O build utilizará automaticamente o `@sparticuz/chromium` para geração de PDFs dentro dos limites das Vercel Serverless Functions.
