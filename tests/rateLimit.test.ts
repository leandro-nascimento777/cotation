import { describe, expect, it } from "vitest";
import { checkRateLimit } from "@/lib/security/rateLimit";

describe("checkRateLimit (Rate Limiter Deslizante)", () => {
  it("deve permitir requisições dentro do limite", () => {
    const key = `test-ip-${Date.now()}-1`;
    const res1 = checkRateLimit(key, { limit: 3, windowSeconds: 60 });
    expect(res1.allowed).toBe(true);
    expect(res1.remaining).toBe(2);

    const res2 = checkRateLimit(key, { limit: 3, windowSeconds: 60 });
    expect(res2.allowed).toBe(true);
    expect(res2.remaining).toBe(1);

    const res3 = checkRateLimit(key, { limit: 3, windowSeconds: 60 });
    expect(res3.allowed).toBe(true);
    expect(res3.remaining).toBe(0);
  });

  it("deve bloquear requisições quando o limite for excedido", () => {
    const key = `test-ip-${Date.now()}-2`;
    // Consome todas as 2 tentativas
    checkRateLimit(key, { limit: 2, windowSeconds: 60 });
    checkRateLimit(key, { limit: 2, windowSeconds: 60 });

    // 3a tentativa deve ser barrada
    const blocked = checkRateLimit(key, { limit: 2, windowSeconds: 60 });
    expect(blocked.allowed).toBe(false);
    expect(blocked.remaining).toBe(0);
    expect(blocked.resetInSeconds).toBeGreaterThan(0);
  });
});
