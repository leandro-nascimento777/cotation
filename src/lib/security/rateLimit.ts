import { NextRequest } from "next/server";

interface RateLimitRecord {
  count: number;
  resetTime: number;
}

// Armazenamento em memória para requisições por IP.
// Em ambientes multi-instância serverless, funciona como proteção de rajada por nó;
// para escala horizontal distribuída avançada, pode plugar Upstash Redis com a mesma interface.
const tracker = new Map<string, RateLimitRecord>();

// Limpa registros expirados a cada 5 minutos para evitar vazamento de memória
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [key, record] of tracker.entries()) {
      if (now > record.resetTime) {
        tracker.delete(key);
      }
    }
  }, 5 * 60 * 1000).unref?.();
}

/** Obtém o endereço IP do cliente a partir dos headers da requisição. */
export const getClientIp = (req: NextRequest): string => {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  const realIp = req.headers.get("x-real-ip");
  if (realIp) {
    return realIp.trim();
  }
  return "127.0.0.1";
};

export interface RateLimitOptions {
  /** Máximo de requisições permitidas na janela. */
  limit: number;
  /** Tamanho da janela em segundos. */
  windowSeconds: number;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetInSeconds: number;
}

/** Aplica rate limiting deslizante por IP para proteger endpoints custosos (IA, Puppeteer). */
export const checkRateLimit = (
  key: string,
  options: RateLimitOptions
): RateLimitResult => {
  const now = Date.now();
  const windowMs = options.windowSeconds * 1000;
  const existing = tracker.get(key);

  if (!existing || now > existing.resetTime) {
    tracker.set(key, { count: 1, resetTime: now + windowMs });
    return {
      allowed: true,
      remaining: options.limit - 1,
      resetInSeconds: options.windowSeconds,
    };
  }

  if (existing.count >= options.limit) {
    const resetInSeconds = Math.ceil((existing.resetTime - now) / 1000);
    return {
      allowed: false,
      remaining: 0,
      resetInSeconds: Math.max(1, resetInSeconds),
    };
  }

  existing.count += 1;
  const resetInSeconds = Math.ceil((existing.resetTime - now) / 1000);
  return {
    allowed: true,
    remaining: options.limit - existing.count,
    resetInSeconds: Math.max(1, resetInSeconds),
  };
};
