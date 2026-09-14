import { AgencyInfo, QuoteItem } from "./types";
import { baggageLabel, formatCurrencyBRL } from "./format";

/** Gera o texto formatado (Markdown do WhatsApp: *negrito*, _itálico_) a
 * partir dos itens selecionados e dos dados da agência. */
export function buildWhatsAppText(items: QuoteItem[], agency: AgencyInfo): string {
  const selected = items.filter((i) => i.selected);
  if (selected.length === 0) {
    return "_Selecione ao menos uma opção de voo para gerar o texto._";
  }

  const lines: string[] = [];

  lines.push(`*✈️ Cotação de Voo${selected.length > 1 ? "s" : ""}*`);
  if (agency.agencyName) lines.push(`_${agency.agencyName}_`);
  lines.push("");

  if (agency.message.trim()) {
    lines.push(agency.message.trim());
    lines.push("");
  }

  selected.forEach((item, idx) => {
    lines.push("——————————————");
    lines.push(`*Opção ${idx + 1} — ${item.airline} ${item.flightNumber}* (${item.date})`);
    lines.push(`🛫 ${item.origin} ${item.departureTime}  →  🛬 ${item.destination} ${item.arrivalTime}`);
    lines.push(
      `⏱️ Duração: ${item.duration}  |  ${item.stops === 0 ? "Voo direto" : `${item.stops} conexão(ões)`}`
    );
    lines.push(`🧳 ${baggageLabel(item.baggage)} (${item.fareLabel})`);
    lines.push(`💰 *${formatCurrencyBRL(item.price)}*`);
  });
  lines.push("——————————————");
  lines.push("");

  if (selected.length > 1) {
    const min = Math.min(...selected.map((i) => i.price));
    lines.push(`💡 A partir de *${formatCurrencyBRL(min)}*`);
    lines.push("");
  }

  if (agency.notes.trim()) {
    lines.push(`_${agency.notes.trim()}_`);
    lines.push("");
  }

  const contact: string[] = [];
  if (agency.sellerName) contact.push(agency.sellerName);
  if (agency.phone) contact.push(agency.phone);
  if (agency.email) contact.push(agency.email);
  if (contact.length) {
    lines.push(`📞 ${contact.join(" | ")}`);
  }

  return lines.join("\n");
}
