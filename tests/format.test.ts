import { describe, expect, it } from "vitest";
import {
  formatCnpjMask,
  formatCurrencyBRL,
  formatMoneyMaskFromDigits,
  formatWhatsAppLink,
  moneyMaskToNumber,
  numberToMoneyMask,
  parseExtractedDateToISO,
  sanitizePercentInput,
  percentInputToNumber,
  formatCpf,
  formatPassport,
  formatPhoneWithDdi,
} from "@/lib/format";

describe("format (Utilitários de Formatação e Máscaras)", () => {
  describe("formatCurrencyBRL", () => {
    it("deve formatar número em padrão brasileiro de moeda R$", () => {
      const formatted = formatCurrencyBRL(1250.5);
      // Espaço sem quebra \u00a0 é padrão do Intl no Node/V8
      expect(formatted.replace(/\u00a0/g, " ")).toBe("R$ 1.250,50");
    });
  });

  describe("formatCnpjMask", () => {
    it("deve formatar CNPJ com pontuação correta", () => {
      expect(formatCnpjMask("12345678000195")).toBe("12.345.678/0001-95");
      expect(formatCnpjMask("123456")).toBe("12.345.6");
    });

    it("deve aceitar entradas com pontuação existente e limpar caracteres inválidos", () => {
      expect(formatCnpjMask("12.345.678/0001-95")).toBe("12.345.678/0001-95");
    });
  });

  describe("formatWhatsAppLink", () => {
    it("deve gerar link wa.me com DDI 55 para números de 10 ou 11 dígitos", () => {
      expect(formatWhatsAppLink("(11) 98765-4321")).toBe("https://wa.me/5511987654321");
      expect(formatWhatsAppLink("1187654321")).toBe("https://wa.me/551187654321");
    });

    it("deve preservar código de país se já tiver mais de 11 dígitos", () => {
      expect(formatWhatsAppLink("+55 11 98765-4321")).toBe("https://wa.me/5511987654321");
    });

    it("deve retornar null se número for inválido ou muito curto", () => {
      expect(formatWhatsAppLink("123")).toBeNull();
    });
  });

  describe("Máscaras Monetárias (Money Mask)", () => {
    it("deve formatar dígitos em centavos reais", () => {
      expect(formatMoneyMaskFromDigits("150000")).toBe("1.500,00");
      expect(formatMoneyMaskFromDigits("50")).toBe("0,50");
      expect(formatMoneyMaskFromDigits("9")).toBe("0,09");
    });

    it("deve converter máscara de volta para número puro", () => {
      expect(moneyMaskToNumber("1.500,00")).toBe(1500);
      expect(moneyMaskToNumber("0,50")).toBe(0.5);
    });

    it("deve formatar número já salvo para texto de máscara", () => {
      expect(numberToMoneyMask(1500)).toBe("1.500,00");
      expect(numberToMoneyMask(25.9)).toBe("25,90");
    });
  });

  describe("Sanitização e Parse de Percentual", () => {
    it("deve manter apenas dígitos e uma única vírgula", () => {
      expect(sanitizePercentInput("12,50%")).toBe("12,50");
      expect(sanitizePercentInput("12,5,3")).toBe("12,53");
    });

    it("deve converter percentual com vírgula para número decimal", () => {
      expect(percentInputToNumber("12,5")).toBe(12.5);
    });
  });

  describe("parseExtractedDateToISO", () => {
    it("deve converter formato barra DD/MM/AAAA para AAAA-MM-DD", () => {
      expect(parseExtractedDateToISO("25/09/2026")).toBe("2026-09-25");
      expect(parseExtractedDateToISO("05/10/26")).toBe("2026-10-05");
    });

    it("deve converter formato abreviado por extenso ex: '18 Set'", () => {
      const fixedDate = new Date(2026, 0, 1);
      expect(parseExtractedDateToISO("18 Set", fixedDate)).toBe("2026-09-18");
      expect(parseExtractedDateToISO("05 out", fixedDate)).toBe("2026-10-05");
    });
  });

  describe("formatCpf", () => {
    it("deve formatar CPF com pontuação correta 000.000.000-00", () => {
      expect(formatCpf("02007159171")).toBe("020.071.591-71");
      expect(formatCpf("50395621813")).toBe("503.956.218-13");
    });

    it("deve lidar com entradas vazias ou nulas", () => {
      expect(formatCpf("")).toBe("");
      expect(formatCpf(null)).toBe("");
    });
  });

  describe("formatPassport", () => {
    it("deve formatar passaporte em maiúsculo sem espaços", () => {
      expect(formatPassport("n02978256")).toBe("N02978256");
      expect(formatPassport(" ab 123456 ")).toBe("AB123456");
    });
  });

  describe("formatPhoneWithDdi", () => {
    it("deve formatar telefone de 11 dígitos com DDI +55 (11) 9NNNN-NNNN", () => {
      expect(formatPhoneWithDdi("11987238273")).toBe("+55 (11) 98723-8273");
    });

    it("deve formatar telefone que já possui DDI 55", () => {
      expect(formatPhoneWithDdi("5511987238273")).toBe("+55 (11) 98723-8273");
    });

    it("deve formatar telefone fixo de 10 dígitos com DDI +55", () => {
      expect(formatPhoneWithDdi("1133334444")).toBe("+55 (11) 3333-4444");
    });
  });
});
