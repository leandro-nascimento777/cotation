export const formatCurrencyBRL = (value: number): string =>
  value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
  });

export const quoteNumber = (date = new Date()): string => {
  const y = date.getFullYear();
  const stamp = date.getTime().toString().slice(-6);
  return `ORC-${y}-${stamp}`;
};

export const formatDatePtBR = (date = new Date()): string => {
  const formatted = date.toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
  const commaIndex = formatted.indexOf(",");
  if (commaIndex === -1) return formatted;
  const weekday = formatted
    .slice(0, commaIndex)
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join("-");
  return weekday + formatted.slice(commaIndex);
};

/** Formata dígitos de CNPJ como "00.000.000/0000-00" enquanto o usuário digita. */
export const formatCnpjMask = (value: string): string => {
  const d = value.replace(/\D/g, "").slice(0, 14);
  if (d.length <= 2) return d;
  if (d.length <= 5) return `${d.slice(0, 2)}.${d.slice(2)}`;
  if (d.length <= 8) return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5)}`;
  if (d.length <= 12) return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5, 8)}/${d.slice(8)}`;
  return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5, 8)}/${d.slice(8, 12)}-${d.slice(12, 14)}`;
};

/** Gera link wa.me para WhatsApp a partir de um telefone brasileiro ou internacional com mensagem opcional. */
export const formatWhatsAppLink = (phone: string, text?: string): string | null => {
  const digits = phone.replace(/\D/g, "");
  if (digits.length < 10) return null;
  const withCountryCode = digits.length <= 11 ? `55${digits}` : digits;
  const base = `https://wa.me/${withCountryCode}`;
  return text ? `${base}?text=${encodeURIComponent(text)}` : base;
};

/** Máscara de valor monetário (BRL) em tempo real a partir dos dígitos. */
export const formatMoneyMaskFromDigits = (value: string): string => {
  const digits = value.replace(/\D/g, "").replace(/^0+(?=\d)/, "").slice(0, 13);
  const cents = digits.padStart(3, "0");
  const intPart = cents.slice(0, -2);
  const decPart = cents.slice(-2);
  const withThousands = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return `${withThousands},${decPart}`;
};

/** Converte texto mascarado ("1.500,00") para número (1500). */
export const moneyMaskToNumber = (masked: string): number => {
  const normalized = masked.replace(/\./g, "").replace(",", ".");
  return Number(normalized) || 0;
};

/** Formata número para texto mascarado de dinheiro. */
export const numberToMoneyMask = (value: number): string =>
  formatMoneyMaskFromDigits(Math.round(value * 100).toString());

/** Sanitiza input percentual mantendo dígitos e apenas uma vírgula. */
export const sanitizePercentInput = (value: string): string => {
  let cleaned = value.replace(/[^\d,]/g, "");
  const firstComma = cleaned.indexOf(",");
  if (firstComma !== -1) {
    cleaned = cleaned.slice(0, firstComma + 1) + cleaned.slice(firstComma + 1).replace(/,/g, "");
  }
  return cleaned;
};

/** Converte texto de percentual ("12,5") para número (12.5). */
export const percentInputToNumber = (text: string): number =>
  Number(text.replace(",", ".")) || 0;

/** Formata número para valor inicial de campo percentual. */
export const numberToPercentInput = (value: number): string =>
  value.toString().replace(".", ",");

/** Data/hora de validade da cotação: agora + N horas. */
export const validityDateTimePtBR = (hours: number, from = new Date()): string => {
  const date = new Date(from.getTime() + hours * 60 * 60 * 1000);
  return date.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const MONTH_ABBR_PT: Record<string, string> = {
  jan: "01",
  fev: "02",
  mar: "03",
  abr: "04",
  mai: "05",
  jun: "06",
  jul: "07",
  ago: "08",
  set: "09",
  out: "10",
  nov: "11",
  dez: "12",
};

const WEEKDAY_ABBR = ["dom", "seg", "ter", "qua", "qui", "sex", "sab", "sáb"];

/** Remove um prefixo de dia da semana solto no início ("qui, ", "seg. ",
 * "segunda-feira "), que prints reais de busca de voo costumam incluir e a
 * extração por IA preserva ao pé da letra (ver EXTRACTION_PROMPT). */
const stripWeekdayPrefix = (s: string): string => {
  const match = s.match(/^([a-zà-ú]+)[.,]?\s+/);
  if (!match) return s;
  const word = match[1].normalize("NFD").replace(/[̀-ͯ]/g, "");
  if (WEEKDAY_ABBR.includes(word.slice(0, 3))) return s.slice(match[0].length).trim();
  return s;
};

/** Quando a data extraída não traz ano, assume o ano corrente — a menos que
 * a data já tenha passado há mais de 30 dias, caso em que assume o próximo
 * ano (print escaneado perto da virada do ano pra uma viagem futura). */
const resolveImplicitYear = (day: number, month: number, now: Date): number => {
  const candidate = new Date(now.getFullYear(), month - 1, day);
  const cutoff = new Date(now);
  cutoff.setDate(cutoff.getDate() - 30);
  return candidate < cutoff ? now.getFullYear() + 1 : now.getFullYear();
};

/** Converte data extraída em texto pro formato "AAAA-MM-DD" aceito por
 * <input type="date">. Tolerante a variações comuns de print real: dia da
 * semana na frente, separador "/", "-" ou "." e ano opcional/abreviado. */
export const parseExtractedDateToISO = (raw: string, now = new Date()): string => {
  const normalized = raw.trim().toLowerCase().replace(/,/g, " ").replace(/\s+/g, " ").trim();
  if (!normalized) return "";
  const s = stripWeekdayPrefix(normalized);

  const numeric = s.match(/^(\d{1,2})[/\-.](\d{1,2})(?:[/\-.](\d{2,4}))?$/);
  if (numeric) {
    const [, dRaw, mRaw, yRaw] = numeric;
    const day = Number(dRaw);
    const month = Number(mRaw);
    if (month >= 1 && month <= 12 && day >= 1 && day <= 31) {
      const year = yRaw ? (yRaw.length === 2 ? `20${yRaw}` : yRaw) : String(resolveImplicitYear(day, month, now));
      return `${year}-${mRaw.padStart(2, "0")}-${dRaw.padStart(2, "0")}`;
    }
  }

  const sNamed = s.replace(/\./g, " ").replace(/\s+/g, " ").trim();
  const named = sNamed.match(/^(\d{1,2})\s+(?:de\s+)?([a-zç]{3,})(?:\s+(?:de\s+)?(\d{4}))?$/);
  if (named) {
    const [, dRaw, monthWord, yRaw] = named;
    const mm = MONTH_ABBR_PT[monthWord.slice(0, 3)];
    if (mm) {
      const day = Number(dRaw);
      const year = yRaw || String(resolveImplicitYear(day, Number(mm), now));
      return `${year}-${mm}-${dRaw.padStart(2, "0")}`;
    }
  }

  return "";
};

/** Formata dígitos de CPF como "000.000.000-00". */
export const formatCpf = (value?: string | null): string => {
  if (!value) return "";
  const d = value.replace(/\D/g, "").slice(0, 11);
  if (d.length <= 3) return d;
  if (d.length <= 6) return `${d.slice(0, 3)}.${d.slice(3)}`;
  if (d.length <= 9) return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6)}`;
  return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9, 11)}`;
};

/** Formata número de passaporte em caixa alta sem espaços. */
export const formatPassport = (value?: string | null): string => {
  if (!value) return "";
  return value.trim().toUpperCase().replace(/\s+/g, "");
};

/** Formata telefone no padrão "DDI DDD 9NNNN-NNNN" (ex: "+55 (11) 98723-8273"). */
export const formatPhoneWithDdi = (value?: string | null): string => {
  if (!value) return "";
  const raw = value.trim();
  const digits = raw.replace(/\D/g, "");
  if (!digits) return raw;

  // Se tiver 13 dígitos e começar com 55 (Brasil: 55 + 2 DDD + 9 dígitos)
  if (digits.length === 13 && digits.startsWith("55")) {
    const ddi = "+55";
    const ddd = digits.slice(2, 4);
    const p1 = digits.slice(4, 9);
    const p2 = digits.slice(9, 13);
    return `${ddi} (${ddd}) ${p1}-${p2}`;
  }

  // Se tiver 12 dígitos e começar com 55 (Brasil fixo: 55 + 2 DDD + 8 dígitos)
  if (digits.length === 12 && digits.startsWith("55")) {
    const ddi = "+55";
    const ddd = digits.slice(2, 4);
    const p1 = digits.slice(4, 8);
    const p2 = digits.slice(8, 12);
    return `${ddi} (${ddd}) ${p1}-${p2}`;
  }

  // Se tiver 11 dígitos (Brasil celular: 2 DDD + 9 dígitos, ex: 11987238273)
  if (digits.length === 11) {
    const ddi = "+55";
    const ddd = digits.slice(0, 2);
    const p1 = digits.slice(2, 7);
    const p2 = digits.slice(7, 11);
    return `${ddi} (${ddd}) ${p1}-${p2}`;
  }

  // Se tiver 10 dígitos (Brasil fixo: 2 DDD + 8 dígitos, ex: 1187238273)
  if (digits.length === 10) {
    const ddi = "+55";
    const ddd = digits.slice(0, 2);
    const p1 = digits.slice(2, 6);
    const p2 = digits.slice(6, 10);
    return `${ddi} (${ddd}) ${p1}-${p2}`;
  }

  // Formato progressivo durante digitação caso tenha menos de 10 dígitos
  if (digits.length <= 2) return digits;
  if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  if (digits.length <= 10) return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;

  return raw;
};

