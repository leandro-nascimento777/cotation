import { describe, expect, it } from "vitest";
import {
  checkNextDayArrival,
  formatDurationLabel,
  formatHeaderDate,
  formatModalDates,
  getAirportDetails,
  parseBaggageRules,
  parseFlightDate,
} from "@/lib/flightFormatters";

describe("flightFormatters", () => {
  describe("parseFlightDate e formatHeaderDate", () => {
    it("formata a data para o padrão do Anexo 1 (ex: seg. 21 set. 2026)", () => {
      expect(formatHeaderDate("2026-09-21")).toBe("seg. 21 set. 2026");
      expect(formatHeaderDate("21/09/2026")).toBe("seg. 21 set. 2026");
      expect(formatHeaderDate("21 Set 2026")).toBe("seg. 21 set. 2026");
    });

    it("converte strings de data para objeto Date válido via parseFlightDate", () => {
      const d = parseFlightDate("2026-09-21");
      expect(d).not.toBeNull();
      expect(d?.getUTCFullYear()).toBe(2026);
    });

    it("faz fallback amigável quando a data não puder ser parseada", () => {
      expect(formatHeaderDate("")).toBe("seg. 21 set. 2026");
      expect(formatHeaderDate("Data Especial")).toBe("Data Especial");
    });
  });

  describe("checkNextDayArrival", () => {
    it("detecta que o voo cruza a meia-noite e chega no dia seguinte (+1)", () => {
      // 18:00 saindo e 11:00 chegando no dia seguinte (Anexo 1 e 2)
      expect(checkNextDayArrival("18:00", "11:00", "12h")).toBe(true);
      expect(checkNextDayArrival("23:30", "01:15", "1h 45m")).toBe(true);
    });

    it("retorna false quando o voo sai e chega no mesmo dia", () => {
      expect(checkNextDayArrival("08:00", "10:30", "2h 30m")).toBe(false);
      expect(checkNextDayArrival("14:00", "18:00", "4h")).toBe(false);
    });
  });

  describe("formatModalDates", () => {
    it("formata partida e chegada para o modal com (+1) quando aplicável (Anexo 3 e 5)", () => {
      const dates = formatModalDates("2026-09-21", "18:00", "11:00", "12h");
      expect(dates.depDate).toBe("Seg. 21 Set.");
      expect(dates.arrDate).toBe("(+1) Ter. 22 Set.");
      expect(dates.isNextDay).toBe(true);
    });
  });

  describe("formatDurationLabel", () => {
    it("formata strings de duração para exibição concisa", () => {
      expect(formatDurationLabel("12h")).toBe("12h");
      expect(formatDurationLabel("12h 30m")).toBe("12h 30m");
      expect(formatDurationLabel("720")).toBe("12h");
    });
  });

  describe("getAirportDetails", () => {
    it("recupera cidade e nome do aeroporto via IATA", () => {
      const gru = getAirportDetails("GRU");
      expect(gru.iata).toBe("GRU");
      expect(gru.cidade).toBe("São Paulo");
      expect(gru.nome).toContain("Guarulhos");

      const ams = getAirportDetails("AMS");
      expect(ams.iata).toBe("AMS");
      expect(ams.cidade).toBe("Amsterdã");
      expect(ams.nome).toContain("Schiphol");
    });
  });

  describe("parseBaggageRules", () => {
    it("detecta regras de bagagem sem despacho", () => {
      const rules = parseBaggageRules("Sem bagagem despachada");
      expect(rules.hasPersonalItem).toBe(true);
      expect(rules.hasHandbag).toBe(true);
      expect(rules.hasCheckedBag).toBe(false);
    });

    it("detecta regras de bagagem com despacho de 23kg", () => {
      const rules = parseBaggageRules("1 bagagem despachada de até 23kg");
      expect(rules.hasPersonalItem).toBe(true);
      expect(rules.hasHandbag).toBe(true);
      expect(rules.hasCheckedBag).toBe(true);
    });
  });
});
