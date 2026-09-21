import { describe, expect, it } from "vitest";
import {
  getAirlineLogoUrl,
  getGoogleAirlineLogoUrl,
  getKiwiAirlineLogoUrl,
  resolveAirlineIata,
} from "@/lib/airlineLogo";

describe("airlineLogo", () => {
  describe("resolveAirlineIata", () => {
    it("resolve código informado diretamente", () => {
      expect(resolveAirlineIata("LA")).toBe("LA");
      expect(resolveAirlineIata("g3")).toBe("G3");
      expect(resolveAirlineIata("AD")).toBe("AD");
      expect(resolveAirlineIata("TP")).toBe("TP");
    });

    it("resolve por nome da companhia aérea", () => {
      expect(resolveAirlineIata("LATAM Airlines")).toBe("LA");
      expect(resolveAirlineIata("TAM Linhas Aéreas")).toBe("LA");
      expect(resolveAirlineIata("GOL Linhas Aéreas")).toBe("G3");
      expect(resolveAirlineIata("VRG Linhas Aereas")).toBe("G3");
      expect(resolveAirlineIata("Azul Linhas Aéreas")).toBe("AD");
      expect(resolveAirlineIata("American Airlines")).toBe("AA");
      expect(resolveAirlineIata("TAP Air Portugal")).toBe("TP");
      expect(resolveAirlineIata("Air France")).toBe("AF");
      expect(resolveAirlineIata("KLM Royal Dutch")).toBe("KL");
      expect(resolveAirlineIata("Copa Airlines")).toBe("CM");
      expect(resolveAirlineIata("Avianca")).toBe("AV");
      expect(resolveAirlineIata("Voepass")).toBe("2Z");
      expect(resolveAirlineIata("Passaredo")).toBe("2Z");
    });

    it("resolve a partir do prefixo do número do voo quando o nome for vago", () => {
      expect(resolveAirlineIata("Companhia", "LA 3450")).toBe("LA");
      expect(resolveAirlineIata(null, "G3-1420")).toBe("G3");
      expect(resolveAirlineIata("", "AD4050")).toBe("AD");
      expect(resolveAirlineIata(undefined, "TP 123")).toBe("TP");
      expect(resolveAirlineIata("Desconhecida", "AA905")).toBe("AA");
    });

    it("retorna null para companhias ou voos não identificados", () => {
      expect(resolveAirlineIata(null, null)).toBeNull();
      expect(resolveAirlineIata("", "")).toBeNull();
      expect(resolveAirlineIata("Voo Fretado Sem Nome", "1234")).toBeNull();
    });
  });

  describe("getKiwiAirlineLogoUrl", () => {
    it("monta a URL do CDN da Kiwi com o código IATA", () => {
      expect(getKiwiAirlineLogoUrl("LA")).toBe("https://images.kiwi.com/airlines/64/LA.png");
      expect(getKiwiAirlineLogoUrl("g3", 128)).toBe("https://images.kiwi.com/airlines/128/G3.png");
    });
  });

  describe("getGoogleAirlineLogoUrl", () => {
    it("monta a URL de favicon oficial via Google S2 para IATAs mapeados", () => {
      expect(getGoogleAirlineLogoUrl("LA")).toBe(
        "https://www.google.com/s2/favicons?domain=latamairlines.com&sz=128"
      );
      expect(getGoogleAirlineLogoUrl("G3")).toBe(
        "https://www.google.com/s2/favicons?domain=voegol.com.br&sz=128"
      );
    });

    it("retorna null para IATAs sem domínio conhecido", () => {
      expect(getGoogleAirlineLogoUrl("ZZ")).toBeNull();
    });
  });

  describe("getAirlineLogoUrl", () => {
    it("retorna a URL Kiwi direta a partir de nome ou voo", () => {
      expect(getAirlineLogoUrl("LATAM", "3200")).toBe("https://images.kiwi.com/airlines/64/LA.png");
      expect(getAirlineLogoUrl("Azul", "AD 4050")).toBe("https://images.kiwi.com/airlines/64/AD.png");
      expect(getAirlineLogoUrl(null, "G3 1420")).toBe("https://images.kiwi.com/airlines/64/G3.png");
      expect(getAirlineLogoUrl("Inexistente", "9999")).toBeNull();
    });
  });
});
