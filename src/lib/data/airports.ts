
export interface Airport {
  iata: string;
  nome: string;
  cidade: string;
  pais: string;
  isMetro?: boolean;
  aeroportos?: string[];
}

export const metroAirports: Airport[] = [
  // BRASIL - Cidades com múltiplos aeroportos
  { iata: "SAO", nome: "São Paulo (todos os aeroportos)", cidade: "São Paulo", pais: "Brasil", isMetro: true, aeroportos: ["GRU", "CGH", "VCP"] },
  { iata: "GRU", nome: "Aeroporto Internacional Guarulhos", cidade: "São Paulo", pais: "Brasil" },
  { iata: "CGH", nome: "Aeroporto de Congonhas", cidade: "São Paulo", pais: "Brasil" },
  { iata: "VCP", nome: "Aeroporto Internacional de Viracopos", cidade: "Campinas / São Paulo", pais: "Brasil" },

  { iata: "BHZ", nome: "Belo Horizonte (todos os aeroportos)", cidade: "Belo Horizonte", pais: "Brasil", isMetro: true, aeroportos: ["CNF", "PLU"] },
  { iata: "CNF", nome: "Aeroporto Internacional Tancredo Neves/Confins", cidade: "Belo Horizonte", pais: "Brasil" },
  { iata: "PLU", nome: "Aeroporto da Pampulha", cidade: "Belo Horizonte", pais: "Brasil" },

  { iata: "RIO", nome: "Rio de Janeiro (todos os aeroportos)", cidade: "Rio de Janeiro", pais: "Brasil", isMetro: true, aeroportos: ["GIG", "SDU"] },
  { iata: "GIG", nome: "Aeroporto Internacional Tom Jobim/Galeão", cidade: "Rio de Janeiro", pais: "Brasil" },
  { iata: "SDU", nome: "Aeroporto Santos Dumont", cidade: "Rio de Janeiro", pais: "Brasil" },

  // BRASIL - Principais
  { iata: "BSB", nome: "Presidente Juscelino Kubitschek", cidade: "Brasília", pais: "Brasil" },
  { iata: "SSA", nome: "Dep. Luís Eduardo Magalhães", cidade: "Salvador", pais: "Brasil" },
  { iata: "FOR", nome: "Pinto Martins", cidade: "Fortaleza", pais: "Brasil" },
  { iata: "REC", nome: "Guararapes - Intl do Recife", cidade: "Recife", pais: "Brasil" },
  { iata: "CWB", nome: "Afonso Pena", cidade: "Curitiba", pais: "Brasil" },
  { iata: "POA", nome: "Salgado Filho", cidade: "Porto Alegre", pais: "Brasil" },
  { iata: "BEL", nome: "Val de Cans", cidade: "Belém", pais: "Brasil" },
  { iata: "MAO", nome: "Eduardo Gomes", cidade: "Manaus", pais: "Brasil" },
  { iata: "FLN", nome: "Hercílio Luz", cidade: "Florianópolis", pais: "Brasil" },
  { iata: "NAT", nome: "São Gonçalo do Amarante", cidade: "Natal", pais: "Brasil" },
  { iata: "MCZ", nome: "Zumbi dos Palmares", cidade: "Maceió", pais: "Brasil" },
  { iata: "AJU", nome: "Santa Maria", cidade: "Aracaju", pais: "Brasil" },
  { iata: "THE", nome: "Senador Petrônio Portella", cidade: "Teresina", pais: "Brasil" },
  { iata: "SLZ", nome: "Marechal Cunha Machado", cidade: "São Luís", pais: "Brasil" },
  { iata: "PMW", nome: "Brigadeiro Lysias Rodrigues", cidade: "Palmas", pais: "Brasil" },
  { iata: "CGR", nome: "Campo Grande", cidade: "Campo Grande", pais: "Brasil" },
  { iata: "CGB", nome: "Marechal Rondon", cidade: "Cuiabá", pais: "Brasil" },
  { iata: "PVH", nome: "Governador Jorge Teixeira", cidade: "Porto Velho", pais: "Brasil" },
  { iata: "GYN", nome: "Santa Genoveva", cidade: "Goiânia", pais: "Brasil" },
  { iata: "VIX", nome: "Eurico de Aguiar Salles", cidade: "Vitória", pais: "Brasil" },
  { iata: "JPA", nome: "Castro Pinto", cidade: "João Pessoa", pais: "Brasil" },
  { iata: "IGU", nome: "Cataratas do Iguaçu", cidade: "Foz do Iguaçu", pais: "Brasil" },

  // ESTADOS UNIDOS
  { iata: "NYC", nome: "Nova York (todos os aeroportos)", cidade: "Nova York", pais: "EUA", isMetro: true, aeroportos: ["JFK", "LGA", "EWR"] },
  { iata: "JFK", nome: "John F. Kennedy", cidade: "Nova York", pais: "EUA" },
  { iata: "LGA", nome: "LaGuardia", cidade: "Nova York", pais: "EUA" },
  { iata: "EWR", nome: "Newark Liberty", cidade: "Nova York", pais: "EUA" },
  { iata: "MIA", nome: "Miami International", cidade: "Miami", pais: "EUA" },
  { iata: "MCO", nome: "Orlando International", cidade: "Orlando", pais: "EUA" },
  { iata: "LAX", nome: "Los Angeles International", cidade: "Los Angeles", pais: "EUA" },
  { iata: "CHI", nome: "Chicago (todos os aeroportos)", cidade: "Chicago", pais: "EUA", isMetro: true, aeroportos: ["ORD", "MDW"] },
  { iata: "ORD", nome: "O'Hare International", cidade: "Chicago", pais: "EUA" },
  { iata: "MDW", nome: "Midway", cidade: "Chicago", pais: "EUA" },
  { iata: "ATL", nome: "Hartsfield-Jackson", cidade: "Atlanta", pais: "EUA" },
  { iata: "DFW", nome: "Dallas/Fort Worth", cidade: "Dallas", pais: "EUA" },
  { iata: "IAH", nome: "George Bush Intercontinental", cidade: "Houston", pais: "EUA" },
  { iata: "BOS", nome: "Logan International", cidade: "Boston", pais: "EUA" },
  { iata: "LAS", nome: "Harry Reid International", cidade: "Las Vegas", pais: "EUA" },
  { iata: "SEA", nome: "Seattle-Tacoma", cidade: "Seattle", pais: "EUA" },
  { iata: "SFO", nome: "San Francisco International", cidade: "São Francisco", pais: "EUA" },
  { iata: "WAS", nome: "Washington (todos os aeroportos)", cidade: "Washington DC", pais: "EUA", isMetro: true, aeroportos: ["IAD", "DCA", "BWI"] },
  { iata: "IAD", nome: "Washington Dulles", cidade: "Washington DC", pais: "EUA" },
  { iata: "DCA", nome: "Ronald Reagan Washington", cidade: "Washington DC", pais: "EUA" },
  { iata: "BWI", nome: "Baltimore/Washington", cidade: "Washington DC", pais: "EUA" },
  { iata: "MSP", nome: "Minneapolis-Saint Paul", cidade: "Minneapolis", pais: "EUA" },

  // EUROPA
  { iata: "LON", nome: "Londres (todos os aeroportos)", cidade: "Londres", pais: "Reino Unido", isMetro: true, aeroportos: ["LHR", "LGW", "STN"] },
  { iata: "LHR", nome: "Heathrow", cidade: "Londres", pais: "Reino Unido" },
  { iata: "LGW", nome: "Gatwick", cidade: "Londres", pais: "Reino Unido" },
  { iata: "STN", nome: "Stansted", cidade: "Londres", pais: "Reino Unido" },
  { iata: "PAR", nome: "Paris (todos os aeroportos)", cidade: "Paris", pais: "França", isMetro: true, aeroportos: ["CDG", "ORY"] },
  { iata: "CDG", nome: "Charles de Gaulle", cidade: "Paris", pais: "França" },
  { iata: "ORY", nome: "Orly", cidade: "Paris", pais: "França" },
  { iata: "MAD", nome: "Barajas - Adolfo Suárez", cidade: "Madri", pais: "Espanha" },
  { iata: "BCN", nome: "El Prat", cidade: "Barcelona", pais: "Espanha" },
  { iata: "LIS", nome: "Humberto Delgado", cidade: "Lisboa", pais: "Portugal" },
  { iata: "FCO", nome: "Leonardo da Vinci", cidade: "Roma", pais: "Itália" },
  { iata: "AMS", nome: "Schiphol", cidade: "Amsterdã", pais: "Holanda" },
  { iata: "FRA", nome: "Frankfurt am Main", cidade: "Frankfurt", pais: "Alemanha" },
  { iata: "ZRH", nome: "Zurique", cidade: "Zurique", pais: "Suíça" },

  // AMÉRICA LATINA
  { iata: "BUE", nome: "Buenos Aires (todos os aeroportos)", cidade: "Buenos Aires", pais: "Argentina", isMetro: true, aeroportos: ["EZE", "AEP"] },
  { iata: "EZE", nome: "Ministro Pistarini", cidade: "Buenos Aires", pais: "Argentina" },
  { iata: "AEP", nome: "Jorge Newbery", cidade: "Buenos Aires", pais: "Argentina" },
  { iata: "SCL", nome: "Arturo Merino Benítez", cidade: "Santiago", pais: "Chile" },
  { iata: "BOG", nome: "El Dorado", cidade: "Bogotá", pais: "Colômbia" },
  { iata: "LIM", nome: "Jorge Chávez", cidade: "Lima", pais: "Peru" },
  { iata: "CUN", nome: "Cancún Internacional", cidade: "Cancún", pais: "México" },
  { iata: "MEX", nome: "Benito Juárez", cidade: "Cidade do México", pais: "México" },

  // ÁSIA / OCEANIA
  { iata: "DXB", nome: "Dubai International", cidade: "Dubai", pais: "EAU" },
  { iata: "DOH", nome: "Hamad International", cidade: "Doha", pais: "Qatar" },
  { iata: "TYO", nome: "Tóquio (todos os aeroportos)", cidade: "Tóquio", pais: "Japão", isMetro: true, aeroportos: ["NRT", "HND"] },
  { iata: "NRT", nome: "Narita", cidade: "Tóquio", pais: "Japão" },
  { iata: "HND", nome: "Haneda", cidade: "Tóquio", pais: "Japão" },
  { iata: "SYD", nome: "Kingsford Smith", cidade: "Sydney", pais: "Austrália" },
  { iata: "SIN", nome: "Changi", cidade: "Singapura", pais: "Singapura" },
];

/**
 * A lista mundial de aeroportos (milhares de registros) é carregada sob demanda,
 * para não pesar no primeiro carregamento do sistema. As cidades principais ficam
 * disponíveis imediatamente.
 */
export let airports: Airport[] = [...metroAirports];

let carregamento: Promise<void> | null = null;

export function carregarAeroportos(): Promise<void> {
  if (!carregamento) {
    carregamento = import("./airports-global.json")
      .then((mod) => {
        const linhas = (mod.default ?? mod) as unknown as [string, string, string, string][];
        const jaTem = new Set(metroAirports.map((m) => m.iata));
        const globais: Airport[] = [];
        for (const [iata, nome, cidade, pais] of linhas) {
          if (jaTem.has(iata)) continue;
          jaTem.add(iata);
          globais.push({ iata, nome, cidade, pais });
        }
        airports = [...metroAirports, ...globais];
      })
      .catch(() => {
        // Sem a lista completa seguimos com as cidades principais.
      });
  }
  return carregamento;
}

const norm = (s: string) =>
  s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

export function buscarAeroporto(query: string): Airport[] {
  const q = norm(query.trim());
  if (q.length < 2) return [];
  const matches = airports.filter(
    (a) =>
      norm(a.iata).includes(q) ||
      norm(a.nome).includes(q) ||
      norm(a.cidade).includes(q) ||
      norm(a.pais).includes(q),
  );
  // Pontuação: código IATA exato primeiro, depois início do código, depois metros
  const score = (a: Airport) => {
    const iata = norm(a.iata);
    if (iata === q) return 0;
    if (iata.startsWith(q)) return 1;
    if (a.isMetro) return 2;
    if (norm(a.cidade).startsWith(q)) return 3;
    return 4;
  };
  matches.sort((a, b) => score(a) - score(b));
  return matches.slice(0, 8);
}


export function aeroportoPorIata(iata: string): Airport | undefined {
  const code = iata.split(",")[0].trim().toUpperCase();
  return airports.find((a) => a.iata === code);
}
