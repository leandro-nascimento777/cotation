import { describe, expect, it } from "vitest";
import { pricesMatch } from "@/lib/proposal/comparePrices";

describe("comparePrices", () => {
  describe("pricesMatch", () => {
    it("considera valores iguais como conferindo", () => {
      expect(pricesMatch(1234.56, 1234.56)).toBe(true);
    });

    it("tolera diferença de arredondamento de ponto flutuante", () => {
      expect(pricesMatch(0.1 + 0.2, 0.3)).toBe(true);
    });

    it("detecta divergência real de valor", () => {
      expect(pricesMatch(1200, 1250)).toBe(false);
      expect(pricesMatch(999.9, 1000)).toBe(false);
    });

    it("detecta divergência de poucos centavos como não conferindo", () => {
      expect(pricesMatch(100, 100.02)).toBe(false);
    });
  });
});
