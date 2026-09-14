import { AgencyInfo, QuoteItem } from "../types";
import { baggageLabel, formatCurrencyBRL, formatDatePtBR, quoteNumber, validityDatePtBR } from "../format";

/** Formato esperado pelo template Jinja2 `flight-quote.html`
 * (ver pdf-template/flight-quote.html e pdf-template/README.md). */
export interface FlightQuoteTemplateData {
  logo_url: string;
  agencia_nome: string;
  agencia_endereco_linha1: string;
  agencia_endereco_linha2: string;
  agencia_endereco_linha3: string;
  agencia_cep: string;
  filial_numero: string;
  vendedor_nome: string;
  vendedor_email: string;
  telefone: string;
  cnpj: string;
  cadastur: string;
  data_emissao: string;
  numero_orcamento: string;
  data_validade: string;
  empresa_nome_banner: string;
  opcoes: Array<{
    cia_aerea: string;
    numero_voo: string;
    data: string;
    origem: string;
    destino: string;
    hora_partida: string;
    hora_chegada: string;
    duracao: string;
    conexoes: string;
    equipamento: string;
    bagagem_label: string;
    tarifa_label: string;
    valor: string;
  }>;
  valor_a_partir: string;
  informacoes_importantes: string;
}

/** Converte os itens selecionados pelo agente + os dados da agência no
 * formato de dados que o template Jinja2 (pdf-template/flight-quote.html)
 * espera receber. */
export function buildFlightQuoteData(
  items: QuoteItem[],
  agency: AgencyInfo
): FlightQuoteTemplateData {
  const selected = items.filter((i) => i.selected);
  const minPrice = selected.length ? Math.min(...selected.map((i) => i.price)) : 0;

  return {
    logo_url: agency.logoDataUrl || "",
    agencia_nome: agency.agencyName,
    agencia_endereco_linha1: agency.branch,
    agencia_endereco_linha2: "",
    agencia_endereco_linha3: "",
    agencia_cep: "",
    filial_numero: "",
    vendedor_nome: agency.sellerName,
    vendedor_email: agency.email,
    telefone: agency.phone,
    cnpj: agency.cnpj,
    cadastur: agency.cadastur,
    data_emissao: formatDatePtBR(),
    numero_orcamento: quoteNumber(),
    data_validade: validityDatePtBR(agency.validityDays),
    empresa_nome_banner: agency.message,
    opcoes: selected.map((item) => ({
      cia_aerea: item.airline,
      numero_voo: item.flightNumber,
      data: item.date,
      origem: item.origin,
      destino: item.destination,
      hora_partida: item.departureTime,
      hora_chegada: item.arrivalTime,
      duracao: item.duration,
      conexoes: item.stops === 0 ? "Voo direto" : `${item.stops} conexão(ões)`,
      equipamento: item.aircraft,
      bagagem_label: baggageLabel(item.baggage),
      tarifa_label: item.fareLabel,
      valor: formatCurrencyBRL(item.price),
    })),
    valor_a_partir: selected.length > 1 ? formatCurrencyBRL(minPrice) : "",
    informacoes_importantes: agency.notes,
  };
}
