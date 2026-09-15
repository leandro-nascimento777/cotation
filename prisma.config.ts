import { defineConfig } from "prisma/config";

// A CLI do Prisma não carrega .env.local automaticamente (convenção do
// Next.js) — pra rodar migrate/db push localmente, use:
//   npx dotenv -e .env.local -- npx prisma db push
// `prisma generate` não precisa de conexão nenhuma, por isso usamos
// process.env direto (undefined) em vez de env() (que lança erro se a
// variável não existir) — assim `generate` funciona mesmo sem .env
// carregado, e só os comandos que precisam de fato conectar (db push,
// migrate, studio) exigem a env var na hora de rodar.
export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: process.env.DATABASE_URL_UNPOOLED,
  },
});
