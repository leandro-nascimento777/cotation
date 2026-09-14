export function formatCurrencyBRL(value: number): string {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
  });
}

export function baggageLabel(baggage: "sem" | "com"): string {
  return baggage === "com" ? "Com bagagem despachada" : "Sem bagagem despachada";
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

/** Data de validade da cotação: hoje + N dias, formato curto (DD/MM/AAAA). */
export function validityDatePtBR(days: number, from = new Date()): string {
  const date = new Date(from);
  date.setDate(date.getDate() + days);
  return date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}
