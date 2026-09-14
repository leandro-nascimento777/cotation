import { AgencyInfo, FlightLeg, QuoteItem } from "../types";
import { groupQuoteItems } from "../groupQuoteItems";
import { formatCurrencyBRL, formatDatePtBR, quoteNumber, validityDatePtBR } from "../format";

interface TemplateLeg {
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
}

interface TemplateOpcao {
  ida?: TemplateLeg;
  volta?: TemplateLeg;
  bagagem_label: string;
  tarifa_label: string;
  valor: string;
}

interface TemplateGrupo {
  titulo: string;
  opcoes: TemplateOpcao[];
  valor_a_partir: string;
}

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
  /** Um grupo por tipo de trecho presente entre os selecionados (ida+volta
   * combinado, só ida, só volta) — normalmente só 1 grupo (o caso comum de
   * uma tabela única de ida). `mostrar_titulos_grupo` só fica true quando
   * há mais de um grupo, pra não poluir visualmente o caso comum. */
  grupos: TemplateGrupo[];
  mostrar_titulos_grupo: boolean;
  informacoes_importantes: string;
  /** Sobrescreve as variáveis de cor do CSS quando preenchidas (usado pela
   * personalização de PDF em Configurações) — "" mantém o padrão do sistema. */
  cor_primaria: string;
  cor_secundaria: string;
  cor_texto: string;
}

export interface BuildFlightQuoteDataOptions {
  /** Número de orçamento já atribuído (ex: por uma cotação salva) — se
   * omitido, gera um novo número aleatório via quoteNumber(). */
  numeroOrcamento?: string;
  corPrimaria?: string;
  corSecundaria?: string;
  corTexto?: string;
}

function legToTemplate(leg: FlightLeg): TemplateLeg {
  return {
    cia_aerea: leg.airline,
    numero_voo: leg.flightNumber,
    data: leg.date,
    origem: leg.origin,
    destino: leg.destination,
    hora_partida: leg.departureTime,
    hora_chegada: leg.arrivalTime,
    duracao: leg.duration,
    conexoes: leg.stops === 0 ? "Voo direto" : `${leg.stops} conexão(ões)`,
    equipamento: leg.aircraft,
  };
}

/** Converte os itens selecionados pelo agente + os dados da agência no
 * formato de dados que o template Jinja2 (pdf-template/flight-quote.html)
 * espera receber. */
export function buildFlightQuoteData(
  items: QuoteItem[],
  agency: AgencyInfo,
  options: BuildFlightQuoteDataOptions = {}
): FlightQuoteTemplateData {
  const selected = items.filter((i) => i.selected);
  const groups = groupQuoteItems(selected);

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
    numero_orcamento: options.numeroOrcamento || quoteNumber(),
    data_validade: validityDatePtBR(agency.validityDays),
    empresa_nome_banner: agency.message,
    cor_primaria: options.corPrimaria || "",
    cor_secundaria: options.corSecundaria || "",
    cor_texto: options.corTexto || "",
    grupos: groups.map((group) => ({
      titulo: group.label,
      opcoes: group.items.map((item) => ({
        ida: item.ida ? legToTemplate(item.ida) : undefined,
        volta: item.volta ? legToTemplate(item.volta) : undefined,
        bagagem_label: item.baggage,
        tarifa_label: item.fareLabel,
        valor: formatCurrencyBRL(item.price),
      })),
      valor_a_partir:
        group.items.length > 1 ? formatCurrencyBRL(Math.min(...group.items.map((i) => i.price))) : "",
    })),
    mostrar_titulos_grupo: groups.length > 1,
    informacoes_importantes: agency.notes,
  };
}
