import { describe, expect, it } from "vitest";
import {
  formatPassengersList,
  formatTicketDate,
  getTicketClass,
  parseAirportInfo,
} from "@/lib/ticketUtils";
import { QuoteItem } from "@/lib/types";

describe("ticketUtils (Bilhete de Embarque Aéreo)", () => {
  describe("parseAirportInfo", () => {
    it("deve resolver IATA conhecidos para Cidade e País", () => {
      expect(parseAirportInfo("GRU")).toEqual({
        iata: "GRU",
        location: "GUARULHOS - BRASIL",
      });
      expect(parseAirportInfo("AMS")).toEqual({
        iata: "AMS",
        location: "AMSTERDÃ - HOLANDA",
      });
      expect(parseAirportInfo("JFK")).toEqual({
        iata: "JFK",
        location: "NOVA YORK - ESTADOS UNIDOS",
      });
    });

    it("deve extrair IATA de strings compostas ex: 'GRU - São Paulo'", () => {
      expect(parseAirportInfo("GRU - São Paulo")).toEqual({
        iata: "GRU",
        location: "GUARULHOS - BRASIL",
      });
    });

    it("deve lidar com aeroportos não catalogados usando fallback inteligente", () => {
      const result = parseAirportInfo("MVD - Montevidéu");
      expect(result.iata).toBe("MVD");
      expect(result.location).toBe("MONTEVIDÉU - URUGUAI");
    });
  });

  describe("formatTicketDate", () => {
    it("deve formatar data ISO YYYY-MM-DD para DD MON YY", () => {
      expect(formatTicketDate("2026-10-08")).toBe("08 OUT 26");
      expect(formatTicketDate("2026-11-09")).toBe("09 NOV 26");
    });

    it("deve formatar data DD/MM/AAAA para DD MON YY", () => {
      expect(formatTicketDate("08/10/2026")).toBe("08 OUT 26");
    });

    it("deve formatar data textual '18 Set' para DD MON YY", () => {
      const formatted = formatTicketDate("18 Set");
      expect(formatted).toMatch(/^18 SET \d{2}$/);
    });

    it("deve remover prefixo de dia da semana como 'Sáb. 21 nov. 2026'", () => {
      expect(formatTicketDate("Sáb. 21 nov. 2026")).toBe("21 NOV 26");
      expect(formatTicketDate("Qui. 26 nov. 2026")).toBe("26 NOV 26");
    });
  });

  describe("getTicketClass", () => {
    it("deve identificar classe Economy", () => {
      const item: Partial<QuoteItem> = { fareLabel: "Econômica", fareClass: "Y" };
      expect(getTicketClass(item as QuoteItem)).toBe("ECONOMY");
    });

    it("deve identificar classe First Class", () => {
      const item: Partial<QuoteItem> = { fareLabel: "Primeira Classe", fareClass: "F" };
      expect(getTicketClass(item as QuoteItem)).toBe("FIRST CLASS");
    });

    it("deve identificar classe Business", () => {
      const item: Partial<QuoteItem> = { fareLabel: "Executiva", fareClass: "J" };
      expect(getTicketClass(item as QuoteItem)).toBe("BUSINESS");
    });
  });

  describe("formatPassengersList", () => {
    it("deve retornar 1 passageiro em array único", () => {
      expect(formatPassengersList("Daniel Hadid")).toEqual(["DANIEL HADID"]);
    });

    it("deve retornar lista empilhada quando múltiplos nomes forem fornecidos (Anexo 3)", () => {
      const names = "Daniel Hadid, Antonio Brid, Priscila Alcantara";
      expect(formatPassengersList("Daniel Hadid", names)).toEqual([
        "DANIEL HADID",
        "ANTONIO BRID",
        "PRISCILA ALCANTARA",
      ]);
    });

    it("deve indicar acompanhantes quando não houver nomes explícitos", () => {
      expect(formatPassengersList("Daniel Hadid", null, 3)).toEqual([
        "DANIEL HADID",
        "+ 2 PASSAGEIRO(S)",
      ]);
    });
  });
});
