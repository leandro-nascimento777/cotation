import { describe, expect, it } from "vitest";
import { buildIssuedQuoteRows } from "@/lib/store/issuedQuotes";
import { Client, Quote, Reservation } from "@/lib/store/types";

const baseQuote = (overrides: Partial<Quote>): Quote => ({
  id: "q1",
  createdAt: "2026-09-01T10:00:00Z",
  updatedAt: "2026-09-01T10:00:00Z",
  numero: "ORC-2026-000001",
  status: "APROVADA",
  type: "VOO",
  clientId: null,
  responsavelId: null,
  sellerName: "",
  sellerEmail: "",
  sellerPhone: "",
  origem: "",
  destino: "",
  periodoInicio: "",
  periodoFim: "",
  paymentMethod: "",
  validityHours: 24,
  priority: "NORMAL",
  pricingProfileId: null,
  internacional: false,
  pagamentoCartaoAgencia: false,
  adults: 1,
  children: 0,
  infants: 0,
  mensagemDestaque: "",
  observacoes: "",
  valorTotal: 0,
  flightItems: [],
  saleClosed: true,
  closedIda: null,
  closedVolta: null,
  bookingRef: "",
  finalizedAt: "2026-09-10T12:00:00Z",
  ...overrides,
});

const reservation: Reservation = {
  id: "r1",
  createdAt: "2026-09-09T10:00:00Z",
  updatedAt: "2026-09-09T10:00:00Z",
  localizador: "ANRXK4",
  numeroBilhete: "957-1234567890",
  status: "EMITIDA",
  quoteId: "q1",
  clienteNome: "HUGO CORDEIRO",
  formaPagamento: "Pix",
  passageiros: [
    { id: "p1", nome: "HUGO" },
    { id: "p2", nome: "ANA" },
  ],
  voos: [
    {
      id: "v1",
      ciaAerea: "LATAM",
      numeroVoo: "LA3000",
      origemCodigo: "GRU",
      origemNome: "São Paulo",
      destinoCodigo: "LIS",
      destinoNome: "Lisboa",
      dataPartida: "",
      horaPartida: "",
      dataChegada: "",
      horaChegada: "",
    },
  ],
  valorTotal: 5230.5,
};

describe("buildIssuedQuoteRows", () => {
  it("ignora cotações não finalizadas", () => {
    const rows = buildIssuedQuoteRows([baseQuote({ finalizedAt: null })], [reservation], []);
    expect(rows).toEqual([]);
  });

  it("prioriza os dados da reserva vinculada", () => {
    const client: Client = { id: "c1", nomeCompleto: "Hugo Cordeiro" } as Client;
    const [row] = buildIssuedQuoteRows(
      [baseQuote({ clientId: "c1", valorTotal: 4000, paymentMethod: "AVISTA", bookingRef: "OLD123" })],
      [reservation],
      [client]
    );
    expect(row).toMatchObject({
      reservationId: "r1",
      clienteNome: "Hugo Cordeiro",
      destino: "Lisboa",
      viajantes: 2,
      valor: 5230.5,
      formaPagamento: "Pix",
      pnr: "ANRXK4",
      bilhete: "957-1234567890",
    });
  });

  it("usa os dados da cotação quando não há reserva vinculada", () => {
    const [row] = buildIssuedQuoteRows(
      [baseQuote({ destino: "Roma", adults: 2, children: 1, valorTotal: 3000, paymentMethod: "AVISTA", bookingRef: "XYZ999" })],
      [],
      []
    );
    expect(row).toMatchObject({
      reservationId: null,
      clienteNome: "",
      destino: "Roma",
      viajantes: 3,
      valor: 3000,
      formaPagamento: "À vista",
      pnr: "XYZ999",
      bilhete: "",
    });
  });

  it("junta bilhetes por passageiro quando a reserva não tem bilhete único", () => {
    const res: Reservation = {
      ...reservation,
      numeroBilhete: "",
      passageiros: [
        { id: "p1", nome: "A", bilheteNumero: "111" },
        { id: "p2", nome: "B", bilheteNumero: "222" },
      ],
    };
    const [row] = buildIssuedQuoteRows([baseQuote({})], [res], []);
    expect(row.bilhete).toBe("111, 222");
  });

  it("ordena da finalização mais recente para a mais antiga", () => {
    const rows = buildIssuedQuoteRows(
      [
        baseQuote({ id: "a", finalizedAt: "2026-09-01T00:00:00Z" }),
        baseQuote({ id: "b", finalizedAt: "2026-09-05T00:00:00Z" }),
      ],
      [],
      []
    );
    expect(rows.map((r) => r.quoteId)).toEqual(["b", "a"]);
  });
});
