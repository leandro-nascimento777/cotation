export function formatCurrencyBRL(value: number): string {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
  });
}

export function quoteNumber(date = new Date()): string {
  const y = date.getFullYear();
  const stamp = date.getTime().toString().slice(-6);
  return `ORC-${y}-${stamp}`;
}

export function formatDatePtBR(date = new Date()): string {
  const formatted = date.toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
  // "segunda-feira, 30 de agosto..." -> "Segunda-Feira, 30 de agosto..."
  // (capitaliza só o dia da semana, como no modelo de referência; funciona
  // tanto para dias com hífen quanto "sábado"/"domingo")
  const commaIndex = formatted.indexOf(",");
  if (commaIndex === -1) return formatted;
  const weekday = formatted
    .slice(0, commaIndex)
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join("-");
  return weekday + formatted.slice(commaIndex);
}

/** Formata dígitos de CNPJ como "00.000.000/0000-00" enquanto o usuário
 * digita (aceita colar com ou sem pontuação). */
export function formatCnpjMask(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 14);
  const parts = [
    [0, 2],
    [2, 5],
    [5, 8],
    [8, 12],
    [12, 14],
  ] as const;
  let out = "";
  for (const [start, end] of parts) {
    if (digits.length > start) out += digits.slice(start, end);
    if (end === 2 && digits.length > 2) out += ".";
    if (end === 5 && digits.length > 5) out += ".";
    if (end === 8 && digits.length > 8) out += "/";
    if (end === 12 && digits.length > 12) out += "-";
  }
  return out;
}

/** Data/hora de validade da cotação: agora + N horas, formato "DD/MM/AAAA HH:mm". */
export function validityDateTimePtBR(hours: number, from = new Date()): string {
  const date = new Date(from.getTime() + hours * 60 * 60 * 1000);
  return date.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

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

/** Converte uma data como veio do print extraído (ex: "18 Set" ou
 * "25/09/26") pro formato "AAAA-MM-DD" esperado por <input type="date">.
 * Retorna "" quando não reconhece o formato (o campo fica em branco pra
 * preenchimento manual em vez de quebrar). */
export function parseExtractedDateToISO(raw: string, now = new Date()): string {
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
}
