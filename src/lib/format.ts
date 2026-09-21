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

/** Converte data extraída em texto pro formato "AAAA-MM-DD" aceito por <input type="date">. */
export const parseExtractedDateToISO = (raw: string, now = new Date()): string => {
  const s = raw.trim().toLowerCase();
  if (!s) return "";

  const slash = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2,4})$/);
  if (slash) {
    const [, d, m, y] = slash;
    const year = y.length === 2 ? `20${y}` : y;
    return `${year}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
  }

  const named = s.match(/^(\d{1,2})\s+([a-zç]{3,})\.?$/);
  if (named) {
    const [, d, monthWord] = named;
    const mm = MONTH_ABBR_PT[monthWord.slice(0, 3)];
    if (mm) return `${now.getFullYear()}-${mm}-${d.padStart(2, "0")}`;
  }

  return "";
};

