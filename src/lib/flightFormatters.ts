import { aeroportoPorIata } from "./data/airports";

const DIAS_SEMANA_ABREV = ["dom.", "seg.", "ter.", "qua.", "qui.", "sex.", "sáb."];
const DIAS_SEMANA_CAP = ["Dom.", "Seg.", "Ter.", "Qua.", "Qui.", "Sex.", "Sáb."];
const MESES_ABREV = ["jan.", "fev.", "mar.", "abr.", "mai.", "jun.", "jul.", "ago.", "set.", "out.", "nov.", "dez."];
const MESES_CAP = ["Jan.", "Fev.", "Mar.", "Abr.", "Mai.", "Jun.", "Jul.", "Ago.", "Set.", "Out.", "Nov.", "Dez."];

const MESES_MAP: Record<string, number> = {
  jan: 0, fev: 1, feb: 1, mar: 2, abr: 3, apr: 3, mai: 4, may: 4,
  jun: 5, jul: 6, ago: 7, aug: 7, set: 8, sep: 8, out: 9, oct: 9,
  nov: 10, dez: 11, dec: 11,
};

export function parseFlightDate(dateStr?: string | null): Date | null {
  if (!dateStr || !dateStr.trim()) return null;
  const s = dateStr.trim();

  const iso = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (iso) return new Date(Number(iso[1]), Number(iso[2]) - 1, Number(iso[3]));

  const slash = s.match(/^(\d{1,2})\/(\d{1,2})(?:\/(\d{2,4}))?$/);
  if (slash) {
    const d = Number(slash[1]);
    const m = Number(slash[2]) - 1;
    const y = slash[3] ? (slash[3].length === 2 ? 2000 + Number(slash[3]) : Number(slash[3])) : new Date().getFullYear();
    return new Date(y, m, d);
  }

  const text = s.match(/(\d{1,2})\s+(?:de\s+)?([a-zçáéíóú]{3,})\.?\s*(?:de\s+)?(\d{2,4})?/i);
  if (text) {
    const d = Number(text[1]);
    const monKey = text[2].slice(0, 3).toLowerCase();
    const m = MESES_MAP[monKey] ?? 8;
    const y = text[3] ? (text[3].length === 2 ? 2000 + Number(text[3]) : Number(text[3])) : new Date().getFullYear();
    return new Date(y, m, d);
  }

  return null;
}

export function formatHeaderDate(dateStr?: string | null): string {
  const parsed = parseFlightDate(dateStr);
  if (!parsed) return dateStr ? String(dateStr).trim() : "seg. 21 set. 2026";
  const diaSemana = DIAS_SEMANA_ABREV[parsed.getDay()];
  const dia = parsed.getDate();
  const mes = MESES_ABREV[parsed.getMonth()];
  const ano = parsed.getFullYear();
  return `${diaSemana} ${dia} ${mes} ${ano}`;
}

export function checkNextDayArrival(
  departureTime?: string | null,
  arrivalTime?: string | null,
  durationStr?: string | null
): boolean {
  if (!departureTime || !arrivalTime) return false;
  const depMatch = departureTime.match(/(\d{1,2}):(\d{2})/);
  const arrMatch = arrivalTime.match(/(\d{1,2}):(\d{2})/);
  if (!depMatch || !arrMatch) return false;

  const depMin = Number(depMatch[1]) * 60 + Number(depMatch[2]);
  const arrMin = Number(arrMatch[1]) * 60 + Number(arrMatch[2]);
  if (arrMin < depMin) return true;

  if (durationStr) {
    const hMatch = durationStr.match(/(\d+)h/i);
    const mMatch = durationStr.match(/(\d+)m/i);
    const durMin = (hMatch ? Number(hMatch[1]) * 60 : 0) + (mMatch ? Number(mMatch[1]) : 0);
    if (durMin > 0 && depMin + durMin >= 24 * 60) return true;
  }
  return false;
}

export function formatModalDates(
  dateStr?: string | null,
  departureTime?: string | null,
  arrivalTime?: string | null,
  durationStr?: string | null
): { depDate: string; arrDate: string; isNextDay: boolean } {
  const parsed = parseFlightDate(dateStr) ?? new Date(2026, 8, 21);
  const isNextDay = checkNextDayArrival(departureTime, arrivalTime, durationStr);

  const depDayName = DIAS_SEMANA_CAP[parsed.getDay()];
  const depDay = parsed.getDate();
  const depMonth = MESES_CAP[parsed.getMonth()];
  const depDate = `${depDayName} ${depDay} ${depMonth}`;

  const arrivalDateObj = new Date(parsed.getTime());
  if (isNextDay) arrivalDateObj.setDate(arrivalDateObj.getDate() + 1);
  const arrDayName = DIAS_SEMANA_CAP[arrivalDateObj.getDay()];
  const arrDay = arrivalDateObj.getDate();
  const arrMonth = MESES_CAP[arrivalDateObj.getMonth()];
  const arrDate = `${isNextDay ? "(+1) " : ""}${arrDayName} ${arrDay} ${arrMonth}`;

  return { depDate, arrDate, isNextDay };
}

export function formatDurationLabel(raw?: string | null): string {
  if (!raw || !raw.trim()) return "12h";
  const s = raw.trim();
  if (/^\d+$/.test(s)) {
    const min = Number(s);
    const h = Math.floor(min / 60);
    const m = min % 60;
    return m > 0 ? `${h}h ${m}m` : `${h}h`;
  }
  return s.replace(/\s+/g, " ");
}

export interface ParsedAirportLocation {
  iata: string;
  cidade: string;
  nome: string;
  pais: string;
}

export function getAirportDetails(rawIata?: string | null, fallback = "GRU"): ParsedAirportLocation {
  const code = (rawIata ?? fallback).split(/[\s,-]+/)[0].trim().toUpperCase().slice(0, 3);
  const info = aeroportoPorIata(code);
  if (info) {
    return { iata: code, cidade: info.cidade, nome: info.nome, pais: info.pais };
  }
  return { iata: code, cidade: code, nome: `Aeroporto de ${code}`, pais: "Destino" };
}

export interface BaggageRules {
  hasPersonalItem: boolean;
  hasHandbag: boolean;
  hasCheckedBag: boolean;
}

export function parseBaggageRules(baggageText?: string | null): BaggageRules {
  const text = (baggageText ?? "").toLowerCase();
  const hasPersonalItem = true;
  const hasHandbag = !text.includes("apenas item pessoal") && !text.includes("sem bagagem de mão");
  const hasCheckedBag =
    (text.includes("despach") || text.includes("23kg") || text.includes("1 mala") || text.includes("peça")) &&
    !text.includes("sem bagagem despachada") &&
    !text.includes("não inclui");

  return { hasPersonalItem, hasHandbag, hasCheckedBag };
}
