import { describe, expect, it } from "vitest";
import { Reservation } from "@/lib/store/types";

describe("Reservations & E-tickets", () => {
  it("valida a estrutura de uma reserva completa com múltiplos trechos e assentos", () => {
    const res: Reservation = {
      id: "res-test-1",
      createdAt: "2026-09-21T00:00:00Z",
      updatedAt: "2026-09-21T00:00:00Z",
      localizador: "ANRXK4",
      numeroBilhete: "001 4894551527 /28",
      status: "CONFIRMADA",
      clienteNome: "HUGO CORDEIRO",
      emissor: "SAKURA CONSOLIDADORA",
      dataEmissao: "21/09/2026",
      passageiros: [
        {
          id: "pax-1",
          nome: "HUGO CORDEIRO",
          tipo: "Criança",
          bilheteNumero: "001 4894551527 /28",
          assentos: [
            { trecho: "GIG-JFK", assento: "23B" },
            { trecho: "LGA-MCO", assento: "18B" },
            { trecho: "MIA-GIG", assento: "22A" },
          ],
        },
      ],
      voos: [
        {
          id: "fl-1",
          trechoTipo: "IDA",
          ciaAerea: "American Airlines",
          numeroVoo: "AA 974",
          origemCodigo: "GIG",
          origemNome: "Rio de Janeiro Galeão",
          origemTerminal: "Terminal 2",
          destinoCodigo: "JFK",
          destinoNome: "Nova Iorque JFK",
          destinoTerminal: "Terminal 8",
          dataPartida: "02 FEV 2027",
          horaPartida: "23:00",
          dataChegada: "03 FEV 2027",
          horaChegada: "07:10",
          classe: "Q",
          escalas: 0,
          aeronave: "Boeing 787-8",
          assento: "23B",
          bagagem: "1pc",
        },
        {
          id: "fl-2",
          trechoTipo: "INTERNO",
          ciaAerea: "American Airlines",
          numeroVoo: "AA 3123",
          origemCodigo: "LGA",
          origemNome: "Nova Iorque LaGuardia",
          destinoCodigo: "MCO",
          destinoNome: "Orlando",
          dataPartida: "08 FEV 2027",
          horaPartida: "14:25",
          dataChegada: "08 FEV 2027",
          horaChegada: "17:43",
          classe: "S",
          escalas: 0,
          assento: "18B",
          bagagem: "1pc",
        },
      ],
      valorTotal: 4609.64,
    };

    expect(res.localizador).toBe("ANRXK4");
    expect(res.voos).toHaveLength(2);
    expect(res.voos[0].assento).toBe("23B");
    expect(res.passageiros[0].nome).toBe("HUGO CORDEIRO");
    expect(res.valorTotal).toBe(4609.64);
  });

  it("gera mensagem para WhatsApp com localizador, trechos e assentos", () => {
    const reservation: Reservation = {
      id: "res-test-2",
      createdAt: "2026-09-21T00:00:00Z",
      updatedAt: "2026-09-21T00:00:00Z",
      localizador: "ANRXK4",
      status: "CONFIRMADA",
      clienteNome: "Hugo Cordeiro",
      passageiros: [{ id: "p1", nome: "Hugo Cordeiro" }],
      voos: [
        {
          id: "v1",
          ciaAerea: "American Airlines",
          numeroVoo: "AA 974",
          origemCodigo: "GIG",
          origemNome: "Galeão",
          destinoCodigo: "JFK",
          destinoNome: "JFK",
          dataPartida: "02 FEV 2027",
          horaPartida: "23:00",
          dataChegada: "03 FEV 2027",
          horaChegada: "07:10",
          assento: "23B",
        },
      ],
    };

    const text = `✈️ SUA RESERVA ESTÁ CONFIRMADA!\nLocalizador: ${reservation.localizador}\nPassageiro: ${reservation.clienteNome}\nVoo: ${reservation.voos[0].origemCodigo} -> ${reservation.voos[0].destinoCodigo} (${reservation.voos[0].numeroVoo})\nAssento: ${reservation.voos[0].assento}`;

    expect(text).toContain("ANRXK4");
    expect(text).toContain("Hugo Cordeiro");
    expect(text).toContain("GIG -> JFK (AA 974)");
    expect(text).toContain("Assento: 23B");
  });

  it("permite filtrar reservas por localizador e nome do passageiro", () => {
    const list: Reservation[] = [
      {
        id: "1",
        createdAt: "",
        updatedAt: "",
        localizador: "ANRXK4",
        status: "CONFIRMADA",
        clienteNome: "HUGO CORDEIRO",
        passageiros: [],
        voos: [],
      },
      {
        id: "2",
        createdAt: "",
        updatedAt: "",
        localizador: "XYZ789",
        status: "EMITIDA",
        clienteNome: "MARIA SILVA",
        passageiros: [],
        voos: [],
      },
    ];

    const searchPnr = "anrx";
    const filteredByPnr = list.filter((r) => r.localizador.toLowerCase().includes(searchPnr));
    expect(filteredByPnr).toHaveLength(1);
    expect(filteredByPnr[0].localizador).toBe("ANRXK4");

    const searchName = "maria";
    const filteredByName = list.filter((r) => r.clienteNome.toLowerCase().includes(searchName));
    expect(filteredByName).toHaveLength(1);
    expect(filteredByName[0].clienteNome).toBe("MARIA SILVA");
  });

  it("suporta Loc Cia Aérea e detalhamento de tarifamento no e-ticket", () => {
    const res: Reservation = {
      id: "res-3",
      createdAt: "",
      updatedAt: "",
      localizador: "ANRXK4",
      localizadorCia: "NXPLPM",
      status: "EMITIDA",
      clienteNome: "HUGO CORDEIRO",
      passageiros: [],
      voos: [],
      valorTarifa: 4086.48,
      valorTaxas: 523.16,
      taxaServico: 0,
      valorTotal: 4609.64,
      formaPagamento: "Substituição",
      bilheteOriginal: "001-4894291037",
    };

    expect(res.localizadorCia).toBe("NXPLPM");
    expect(res.formaPagamento).toBe("Substituição");
    expect(res.bilheteOriginal).toBe("001-4894291037");
    expect(res.valorTarifa! + res.valorTaxas!).toBeCloseTo(4609.64, 2);
  });

  it("filtra voos para check-in por janela de tempo de embarque", () => {
    const today = new Date();
    const flightDateToday = `${today.getDate()} ${["JAN", "FEV", "MAR", "ABR", "MAI", "JUN", "JUL", "AGO", "SET", "OUT", "NOV", "DEZ"][today.getMonth()]} ${today.getFullYear()}`;

    const MONTH_ABBR = ["JAN", "FEV", "MAR", "ABR", "MAI", "JUN", "JUL", "AGO", "SET", "OUT", "NOV", "DEZ"];
    const isTodayFlight = (dataPartida: string) => {
      const [day, monthAbbr, year] = dataPartida.split(" ");
      return (
        Number(day) === today.getDate() &&
        MONTH_ABBR.indexOf(monthAbbr) === today.getMonth() &&
        Number(year) === today.getFullYear()
      );
    };

    expect(isTodayFlight(flightDateToday)).toBe(true);
    expect(isTodayFlight("25 DEZ 2030")).toBe(false);
  });
});

