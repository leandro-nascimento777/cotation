import { QuoteItem } from "./types";

interface AirportInfo {
  iata: string;
  location: string;
}

const AIRPORT_DATABASE: Record<string, string> = {
  GRU: "GUARULHOS - BRASIL",
  CGH: "SÃO PAULO - BRASIL",
  VCP: "CAMPINAS - BRASIL",
  GIG: "RIO DE JANEIRO - BRASIL",
  SDU: "RIO DE JANEIRO - BRASIL",
  BSB: "BRASÍLIA - BRASIL",
  CNF: "BELO HORIZONTE - BRASIL",
  SSA: "SALVADOR - BRASIL",
  REC: "RECIFE - BRASIL",
  FOR: "FORTALEZA - BRASIL",
  CWB: "CURITIBA - BRASIL",
  POA: "PORTO ALEGRE - BRASIL",
  FLN: "FLORIANÓPOLIS - BRASIL",
  MCZ: "MACEIÓ - BRASIL",
  NAT: "NATAL - BRASIL",
  IGU: "FOZ DO IGUAÇU - BRASIL",
  MAO: "MANAUS - BRASIL",
  BEL: "BELÉM - BRASIL",
  GYN: "GOIÂNIA - BRASIL",
  CGB: "CUIABÁ - BRASIL",
  VIX: "VITÓRIA - BRASIL",
  NVT: "NAVEGANTES - BRASIL",
  JOI: "JOINVILLE - BRASIL",
  JPA: "JOÃO PESSOA - BRASIL",
  AJU: "ARACAJU - BRASIL",
  SLZ: "SÃO LUÍS - BRASIL",
  THE: "TERESINA - BRASIL",
  BPS: "PORTO SEGURO - BRASIL",
  IOS: "ILHÉUS - BRASIL",
  UDI: "UBERLÂNDIA - BRASIL",
  RAO: "RIBEIRÃO PRETO - BRASIL",
  SJP: "SÃO JOSÉ DO RIO PRETO - BRASIL",
  PMW: "PALMAS - BRASIL",
  PVH: "PORTO VELHO - BRASIL",
  RBR: "RIO BRANCO - BRASIL",
  BVB: "BOA VISTA - BRASIL",
  MCP: "MACAPÁ - BRASIL",
  AMS: "AMSTERDÃ - HOLANDA",
  CDG: "PARIS - FRANÇA",
  ORY: "PARIS - FRANÇA",
  LHR: "LONDRES - REINO UNIDO",
  LGW: "LONDRES - REINO UNIDO",
  MAD: "MADRI - ESPANHA",
  BCN: "BARCELONA - ESPANHA",
  LIS: "LISBOA - PORTUGAL",
  OPO: "PORTO - PORTUGAL",
  FCO: "ROMA - ITÁLIA",
  MXP: "MILÃO - ITÁLIA",
  FRA: "FRANKFURT - ALEMANHA",
  MUC: "MUNIQUE - ALEMANHA",
  MIA: "MIAMI - ESTADOS UNIDOS",
  MCO: "ORLANDO - ESTADOS UNIDOS",
  JFK: "NOVA YORK - ESTADOS UNIDOS",
  EWR: "NOVA YORK - ESTADOS UNIDOS",
  LAX: "LOS ANGELES - ESTADOS UNIDOS",
  SFO: "SÃO FRANCISCO - ESTADOS UNIDOS",
  BOS: "BOSTON - ESTADOS UNIDOS",
  ORD: "CHICAGO - ESTADOS UNIDOS",
  ATL: "ATLANTA - ESTADOS UNIDOS",
  EZE: "BUENOS AIRES - ARGENTINA",
  AEP: "BUENOS AIRES - ARGENTINA",
  SCL: "SANTIAGO - CHILE",
  MVD: "MONTEVIDÉU - URUGUAI",
  BOG: "BOGOTÁ - COLÔMBIA",
  LIM: "LIMA - PERU",
  DXB: "DUBAI - EMIRADOS ÁRABES",
  DOH: "DOHA - CATAR",
  NRT: "TÓQUIO - JAPÃO",
  HND: "TÓQUIO - JAPÃO",
};

/** Extrai código IATA e Localização (Cidade - País) de strings brutas como "GRU", "GRU - São Paulo", etc. */
export const parseAirportInfo = (raw: string | undefined | null, fallbackIata = "AER"): AirportInfo => {
  if (!raw || !raw.trim()) {
    return { iata: fallbackIata, location: "A CONFIRMAR" };
  }

  const cleaned = raw.trim();
  // Se contiver 3 letras seguidas no início ou em parênteses: ex "GRU" ou "GRU - Guarulhos"
  const match = cleaned.match(/\b([A-Za-z]{3})\b/);
  const code = match ? match[1].toUpperCase() : cleaned.slice(0, 3).toUpperCase();

  if (AIRPORT_DATABASE[code]) {
    return { iata: code, location: AIRPORT_DATABASE[code] };
  }

  // Tenta extrair a cidade se informada após traço
  if (cleaned.includes("-")) {
    const parts = cleaned.split("-").map((p) => p.trim());
    const city = parts[1] || parts[0];
    return { iata: code, location: `${city.toUpperCase()} - DESTINO` };
  }

  return { iata: code, location: `${cleaned.toUpperCase()} - AEROPORTO` };
};

const MONTHS_TICKET = [
  "JAN", "FEV", "MAR", "ABR", "MAI", "JUN",
  "JUL", "AGO", "SET", "OUT", "NOV", "DEZ",
];

const MONTH_PT_MAP: Record<string, string> = {
  jan: "JAN", fev: "FEV", feb: "FEV", mar: "MAR", abr: "ABR", apr: "ABR",
  mai: "MAI", may: "MAI", jun: "JUN", jul: "JUL", ago: "AGO", aug: "AGO",
  set: "SET", sep: "SET", out: "OUT", oct: "OUT", nov: "NOV", dez: "DEZ", dec: "DEZ",
};

/** Formata datas como "08 OUT 26" / "21 NOV 26" para exibição no bilhete de embarque. */
export const formatTicketDate = (raw: string | undefined | null): string => {
  if (!raw || !raw.trim()) return "—";
  let s = raw.trim();

  // Remove dias da semana se presentes: ex "Sáb. 21 nov. 2026", "Sábado, 21 de nov"
  s = s.replace(/^(dom|seg|ter|qua|qui|sex|s[áa]b)[a-zà-ú]*[.,]?\s+/i, "");

  // Se já estiver no formato ISO "AAAA-MM-DD"
  const isoMatch = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (isoMatch) {
    const [, y, m, d] = isoMatch;
    const monthIndex = Math.max(0, Math.min(11, Number(m) - 1));
    const yearShort = y.slice(-2);
    return `${d.padStart(2, "0")} ${MONTHS_TICKET[monthIndex]} ${yearShort}`;
  }

  // Se estiver no formato "DD/MM/AAAA" ou "DD/MM/AA"
  const slashMatch = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2,4})$/);
  if (slashMatch) {
    const [, d, m, y] = slashMatch;
    const monthIndex = Math.max(0, Math.min(11, Number(m) - 1));
    const yearShort = y.slice(-2);
    return `${d.padStart(2, "0")} ${MONTHS_TICKET[monthIndex]} ${yearShort}`;
  }

  // Se vier com formato textual "21 nov. 2026" ou "18 Set" ou "18 Set 26"
  const textMatch = s.match(/(\d{1,2})\s+([A-Za-zç]{3,})\.?\s*(?:de\s+)?(\d{2,4})?/i);
  if (textMatch) {
    const [, d, mon, y] = textMatch;
    const cleanMon = mon.slice(0, 3).toLowerCase();
    const resolvedMon = MONTH_PT_MAP[cleanMon] || mon.slice(0, 3).toUpperCase();
    const yearShort = y ? y.slice(-2) : new Date().getFullYear().toString().slice(-2);
    return `${d.padStart(2, "0")} ${resolvedMon} ${yearShort}`;
  }

  return s.toUpperCase();
};

/** Determina a classe de viagem para exibição no ticket. */
export const getTicketClass = (item?: QuoteItem | null): string => {
  if (!item) return "ECONOMY";
  const raw = `${item.fareClass || ""} ${item.fareLabel || ""}`.toUpperCase();

  if (raw.includes("FIRST") || raw.includes("PRIMEIRA")) return "FIRST CLASS";
  if (raw.includes("BUS") || raw.includes("EXEC") || raw.includes("BUSINESS")) return "BUSINESS";
  if (raw.includes("PREMIUM") || raw.includes("CONFORT") || raw.includes("PLUS")) return "PREMIUM ECONOMY";
  return "ECONOMY";
};

/** Formata a lista de passageiros para o bilhete aéreo (Anexos 2 e 3). */
export const formatPassengersList = (
  primaryName: string,
  passengerNames?: string | null,
  totalCount = 1
): string[] => {
  const cleanPrimary = primaryName.trim().toUpperCase();

  if (passengerNames && passengerNames.trim()) {
    const names = passengerNames
      .split(/[\n,;]+/)
      .map((n) => n.trim().toUpperCase())
      .filter(Boolean);
    if (names.length > 0) return names;
  }

  if (cleanPrimary) {
    if (totalCount > 1) {
      return [cleanPrimary, `+ ${totalCount - 1} PASSAGEIRO(S)`];
    }
    return [cleanPrimary];
  }

  return ["PASSAGEIRO NÃO INFORMADO"];
};
