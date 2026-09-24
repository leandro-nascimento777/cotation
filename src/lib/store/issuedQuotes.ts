import { Client, PAYMENT_METHOD_LABEL, Quote, Reservation } from "./types";

/** Linha da lista de Emitidas (/emitidas). */
export interface IssuedQuoteRow {
  quoteId: string;
  reservationId: string | null;
  finalizedAt: string;
  clienteNome: string;
  destino: string;
  viajantes: number;
  valor: number;
  formaPagamento: string;
  pnr: string;
  bilhete: string;
}

const firstFilled = (...values: (string | null | undefined)[]): string =>
  values.map((v) => v?.trim()).find((v) => v) || "";

/** Monta as linhas de Emitidas a partir das cotações finalizadas. Os dados
 * da reserva emitida (vinculada por quoteId) têm prioridade; na falta
 * deles, usa o que foi informado na cotação. */
export const buildIssuedQuoteRows = (
  quotes: Quote[],
  reservations: Reservation[],
  clients: Client[]
): IssuedQuoteRow[] =>
  quotes
    .filter((q): q is Quote & { finalizedAt: string } => Boolean(q.finalizedAt))
    .map((quote) => {
      const reservation = reservations.find((r) => r.quoteId === quote.id);
      const client = quote.clientId ? clients.find((c) => c.id === quote.clientId) : undefined;
      const passageiros = reservation?.passageiros ?? [];
      const bilhetesPax = passageiros.map((p) => p.bilheteNumero?.trim()).filter(Boolean).join(", ");
      const ultimoVoo = reservation?.voos[reservation.voos.length - 1];

      return {
        quoteId: quote.id,
        reservationId: reservation?.id ?? null,
        finalizedAt: quote.finalizedAt,
        clienteNome: firstFilled(client?.nomeCompleto, reservation?.clienteNome),
        destino: firstFilled(quote.destino, ultimoVoo?.destinoNome, ultimoVoo?.destinoCodigo),
        viajantes: passageiros.length || quote.adults + quote.children + quote.infants,
        valor: reservation?.valorTotal || quote.valorTotal || 0,
        formaPagamento: firstFilled(
          reservation?.formaPagamento,
          quote.paymentMethod ? PAYMENT_METHOD_LABEL[quote.paymentMethod] : ""
        ),
        pnr: firstFilled(reservation?.localizador, quote.bookingRef),
        bilhete: firstFilled(reservation?.numeroBilhete, bilhetesPax),
      };
    })
    .sort((a, b) => b.finalizedAt.localeCompare(a.finalizedAt));
