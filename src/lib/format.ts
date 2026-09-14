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
  return date.toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}
