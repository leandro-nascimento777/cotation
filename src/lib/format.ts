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
