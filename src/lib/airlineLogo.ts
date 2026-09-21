/**
 * Utilitários para detecção e obtenção de logos oficiais das companhias aéreas.
 * Baseado na arquitetura de CDN da Kiwi.com e fallback com favicons oficiais via Google S2.
 */

const AIRLINE_IATA_BY_NAME: Array<[RegExp, string]> = [
  // Brasil
  [/latam|tam linhas|tam\b/i, "LA"],
  [/\bazul\b/i, "AD"],
  [/\bgol\b|vrg linhas/i, "G3"],
  [/\bvoepass\b|passaredo/i, "2Z"],

  // América do Norte
  [/american airlines|\bamerican\b/i, "AA"],
  [/\bunited\b/i, "UA"],
  [/\bdelta\b/i, "DL"],
  [/air canada/i, "AC"],
  [/\bjetblue\b/i, "B6"],
  [/\bsouthwest\b/i, "WN"],
  [/\balaska\b/i, "AS"],
  [/\bspirit\b/i, "NK"],

  // Europa
  [/\btap\b|air portugal/i, "TP"],
  [/air france/i, "AF"],
  [/\bklm\b/i, "KL"],
  [/\biberia\b/i, "IB"],
  [/british airways/i, "BA"],
  [/lufthansa/i, "LH"],
  [/\bswiss\b/i, "LX"],
  [/ita airways|alitalia/i, "AZ"],
  [/air europa/i, "UX"],
  [/turkish/i, "TK"],
  [/\bplus ultra\b/i, "PU"],

  // Oriente Médio / Ásia / Oceania
  [/\bemirates\b/i, "EK"],
  [/qatar/i, "QR"],
  [/etihad/i, "EY"],
  [/singapore/i, "SQ"],
  [/japan airlines|\bjal\b/i, "JL"],
  [/korean air/i, "KE"],
  [/\bqantas\b/i, "QF"],

  // América do Sul e Central
  [/\bcopa\b/i, "CM"],
  [/\bavianca\b/i, "AV"],
  [/aerolineas|aerolíneas/i, "AR"],
  [/\baeromexico\b|aeroméxico/i, "AM"],
  [/\bsky\b|sky airline/i, "H2"],
  [/jetsmart/i, "JA"],
  [/\bwingo\b/i, "P5"],
  [/boliviana|\bboa\b/i, "OB"],
  [/\bparanair\b/i, "ZP"],

  // África
  [/ethiopian/i, "ET"],
  [/south african|\bsaa\b/i, "SA"],
];

const DOMINIOS_POR_IATA: Record<string, string> = {
  LA: "latamairlines.com",
  AD: "voeazul.com.br",
  G3: "voegol.com.br",
  "2Z": "voepass.com.br",
  AA: "aa.com",
  UA: "united.com",
  DL: "delta.com",
  AC: "aircanada.com",
  B6: "jetblue.com",
  WN: "southwest.com",
  AS: "alaskaair.com",
  NK: "spirit.com",
  TP: "flytap.com",
  AF: "airfrance.com.br",
  KL: "klm.com.br",
  IB: "iberia.com",
  BA: "britishairways.com",
  LH: "lufthansa.com",
  LX: "swiss.com",
  AZ: "itaspa.com",
  UX: "aireuropa.com",
  TK: "turkishairlines.com",
  PU: "plusultra.com",
  EK: "emirates.com",
  QR: "qatarairways.com",
  EY: "etihad.com",
  SQ: "singaporeair.com",
  JL: "jal.co.jp",
  KE: "koreanair.com",
  QF: "qantas.com",
  CM: "copaair.com",
  AV: "avianca.com",
  AR: "aerolineas.com.ar",
  AM: "aeromexico.com",
  H2: "skyairline.com",
  JA: "jetsmart.com",
  P5: "wingo.com",
  OB: "boa.bo",
  ZP: "paranair.com",
  ET: "ethiopianairlines.com",
  SA: "flysaa.com",
};

/**
 * Resolve o código IATA (2 letras/dígitos) da companhia aérea.
 * Verifica o nome da cia, o número do voo e siglas diretas.
 */
export function resolveAirlineIata(
  airline?: string | null,
  flightNumber?: string | null
): string | null {
  const cleanAirline = (airline ?? "").trim();
  const cleanFlightNumber = (flightNumber ?? "").trim();

  // 1. Sigla de 2 caracteres informada diretamente no nome da companhia (ex: "LA", "G3", "AD")
  if (/^[A-Za-z0-9]{2}$/.test(cleanAirline) && !/^\d{2}$/.test(cleanAirline)) {
    return cleanAirline.toUpperCase();
  }

  // 2. Extração do código IATA a partir do número do voo (ex: "LA 3450", "G31420", "AD-4050", "TP 123")
  const flightMatch = cleanFlightNumber.match(/^([A-Za-z0-9]{2})\s*[-]?\s*\d{1,4}/);
  if (flightMatch && !/^\d{2}$/.test(flightMatch[1])) {
    return flightMatch[1].toUpperCase();
  }

  // 3. Mapeamento inteligente por nome/expressão regular
  for (const [re, code] of AIRLINE_IATA_BY_NAME) {
    if (re.test(cleanAirline)) return code;
  }

  // 4. Teste secundário no flightNumber caso tenha apenas a sigla
  if (/^[A-Za-z0-9]{2}$/.test(cleanFlightNumber) && !/^\d{2}$/.test(cleanFlightNumber)) {
    return cleanFlightNumber.toUpperCase();
  }

  return null;
}

/**
 * Retorna a URL do logo oficial via Kiwi CDN (formato PNG transparente).
 */
export function getKiwiAirlineLogoUrl(iata: string, size: 64 | 128 = 64): string {
  const code = iata.trim().toUpperCase().split(/\s+/)[0];
  return `https://images.kiwi.com/airlines/${size}/${code}.png`;
}

/**
 * Retorna a URL do favicon oficial de alta resolução via Google S2.
 */
export function getGoogleAirlineLogoUrl(iata: string, size = 128): string | null {
  const domain = DOMINIOS_POR_IATA[iata.toUpperCase()];
  if (!domain) return null;
  return `https://www.google.com/s2/favicons?domain=${domain}&sz=${size}`;
}

/**
 * Retorna a melhor URL de logo disponível para a companhia informada.
 */
export function getAirlineLogoUrl(
  airline?: string | null,
  flightNumber?: string | null,
  size: 64 | 128 = 64
): string | null {
  const iata = resolveAirlineIata(airline, flightNumber);
  if (!iata) return null;
  return getKiwiAirlineLogoUrl(iata, size);
}
