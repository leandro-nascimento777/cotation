import { describe, expect, it } from "vitest";
import { groupByRow, groupQuoteItems } from "@/lib/groupQuoteItems";
import { legKind, QuoteItem } from "@/lib/types";

const mockLeg = {
  airline: "Gol",
  flightNumber: "G3 1234",
  date: "18 Set",
  departureTime: "10:00",
  arrivalTime: "12:00",
  duration: "2h00",
  origin: "GRU",
  destination: "SDU",
  stops: 0,
  aircraft: "B737",
};

const mockItem = (overrides: Partial<QuoteItem> = {}): QuoteItem => ({
  rowId: "row-1",
  fareId: "fare-1",
  ida: mockLeg,
  volta: undefined,
  baggage: "Sem bagagem",
  fareLabel: "LIG",
  fareClass: "OW",
  price: 500,
  currency: "BRL",
  selected: true,
  ...overrides,
});

describe("groupQuoteItems (Agrupamento e Classificação de Voos)", () => {
  it("deve classificar corretamente trechos 'ida', 'volta' e 'combo'", () => {
    expect(legKind({ ida: mockLeg })).toBe("ida");
    expect(legKind({ volta: mockLeg })).toBe("volta");
    expect(legKind({ ida: mockLeg, volta: mockLeg })).toBe("combo");
  });

  it("deve agrupar itens por rowId mantendo as tarifas juntas", () => {
    const items = [
      mockItem({ rowId: "row-1", fareId: "f1", price: 400 }),
      mockItem({ rowId: "row-1", fareId: "f2", price: 550 }),
      mockItem({ rowId: "row-2", fareId: "f3", price: 700 }),
    ];

    const groups = groupByRow(items);
    expect(groups).toHaveLength(2);
    expect(groups[0].rowId).toBe("row-1");
    expect(groups[0].fares).toHaveLength(2);
    expect(groups[1].rowId).toBe("row-2");
    expect(groups[1].fares).toHaveLength(1);
  });

  it("deve agrupar por kind na ordem combo -> ida -> volta", () => {
    const items = [
      mockItem({ rowId: "r1", fareId: "f1", ida: mockLeg, volta: mockLeg }), // combo
      mockItem({ rowId: "r2", fareId: "f2", ida: mockLeg, volta: undefined }), // ida
      mockItem({ rowId: "r3", fareId: "f3", ida: undefined, volta: mockLeg }), // volta
    ];

    const groups = groupQuoteItems(items);
    expect(groups).toHaveLength(3);
    expect(groups[0].kind).toBe("combo");
    expect(groups[1].kind).toBe("ida");
    expect(groups[2].kind).toBe("volta");
  });
});
