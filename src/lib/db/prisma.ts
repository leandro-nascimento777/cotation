import { PrismaClient } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";

// Singleton do PrismaClient — evita abrir uma conexão nova a cada hot-reload
// do dev (Next.js recarrega módulos, mas o objeto global persiste). Usa a
// conexão pooled (DATABASE_URL) via adapter Neon — migrations/db push usam
// a direta (DATABASE_URL_UNPOOLED), ver prisma.config.ts.
function createPrismaClient() {
  const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL! });
  return new PrismaClient({ adapter });
}

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
