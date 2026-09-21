# Guia do Desenvolvedor & Diretrizes de Engenharia (Cotation)

Este arquivo define os comandos, arquitetura, convenções e regras de código para desenvolvimento nesta plataforma.

---

## 🛠️ Comandos Essenciais

```bash
# Servidor de desenvolvimento
npm run dev

# Execução de testes unitários (Vitest)
npm test

# Verificação estática de tipos (TypeScript)
npx tsc --noEmit

# Verificação de linter e formatação (ESLint)
npm run lint

# Compilação de build de produção (Next.js Turbopack)
npm run build

# Sincronização do schema Prisma com o banco PostgreSQL (Neon)
npx dotenv -e .env.local -- npx prisma db push
```

---

## 🏛️ Diretrizes e Padrões de Código

### 1. Padrão Funcional & Arrow Functions
- Todas as funções utilitárias, helpers de domínio e componentes React devem seguir a convenção de **arrow functions**:
  ```ts
  export const minhaFuncao = (param: Tipo): Retorno => { ... };
  export const MeuComponente = ({ prop }: Props) => { ... };
  ```

### 2. Validação Declarativa com Zod
- **Front-end**: Formulários devem validar com schemas de `src/lib/validation/schemas.ts` e repassar erros específicos de campo para o componente `FormField`.
- **Back-end & Server Actions**: Toda Server Action e Route Handler de API deve validar seu payload de entrada com schemas Zod (`src/lib/validation/apiSchemas.ts`) antes de executar mutações no banco ou chamar a IA.

### 3. Componentes de Formulário (`src/components/ui/FormField.tsx`)
- Nunca crie tags `<input>` ou `<textarea>` soltas com classes Tailwind duplicadas.
- Utilize sempre os componentes padronizados:
  - `<FormField label="..." value={...} onChange={...} error={...} />`
  - `<FormTextarea label="..." value={...} onChange={...} error={...} />`
  - `<FormSelect label="..." value={...} onChange={...} error={...} />`
  - `<MoneyField label="..." value={...} onChange={...} />` (máscara monetária BRL automática)
  - `<PercentField label="..." value={...} onChange={...} />` (sanitização de percentual automática)

### 4. Segurança e Rate Limiting
- Endpoints com processamento pesado (Puppeteer/Chromium) ou chamadas de IA pagas (Gemini) devem ser protegidos com o rate limiter por IP:
  ```ts
  const rateLimit = checkRateLimit(`chave:${clientIp}`, { limit: N, windowSeconds: 60 });
  if (!rateLimit.allowed) {
    return NextResponse.json({ error: "..." }, { status: 429, headers: { "Retry-After": ... } });
  }
  ```

### 5. Observabilidade & Logging
- Não utilize `console.log` disperso no backend.
- Utilize o módulo `logger` (`src/lib/logger.ts`), que emite logs estruturados em JSON com timestamps ISO e metadados contextuais:
  ```ts
  logger.info("Ação concluída", { quoteId, clientIp });
  logger.error("Falha na operação", err, { context });
  ```

### 6. Persistência e Transações de Banco
- Ao criar entidades relacionais dependentes (ex: cotação + opções de voo), utilize transações atômicas gerenciadas pelo Prisma:
  ```ts
  await prisma.$transaction(async (tx) => {
    const quote = await tx.quote.create({ ... });
    await tx.flightOption.createMany({ ... });
    return quote;
  });
  ```

### 7. Testes Automatizados
- Toda nova regra financeira, conversão de datas, manipulação de strings ou algoritmo de agrupamento deve ser acompanhada de testes unitários no diretório `tests/` executados com `npm test`.

---

@AGENTS.md

