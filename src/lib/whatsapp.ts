import { AgencyInfo, QuoteItem } from "./types";
import { formatCurrencyBRL, validityDateTimePtBR } from "./format";
import { groupQuoteItems } from "./groupQuoteItems";

/** Gera o texto formatado (Markdown do WhatsApp: *negrito*, _itálico_) a
 * partir dos itens selecionados e dos dados da agência. Quando há mais de
 * um tipo de trecho selecionado (ex: voos de ida separados de voos de
 * volta), separa em seções "Ida"/"Volta", cada uma com seu próprio "a
 * partir de". */
export function buildWhatsAppText(items: QuoteItem[], agency: AgencyInfo): string {
  const selected = items.filter((i) => i.selected);
  if (selected.length === 0) {
    return "_Selecione ao menos uma opção de voo para gerar o texto._";
  }

  const groups = groupQuoteItems(selected);
  const showGroupHeaders = groups.length > 1;

  const lines: string[] = [];

  lines.push(`*✈️ Cotação de Voo${selected.length > 1 ? "s" : ""}*`);
  if (agency.agencyName) lines.push(`_${agency.agencyName}_`);
  lines.push("");

  if (agency.message.trim()) {
    lines.push(agency.message.trim());
    lines.push("");
  }

  for (const group of groups) {
    if (showGroupHeaders) {
      lines.push(`*━━ ${group.label.toUpperCase()} ━━*`);
      lines.push("");
    }

    group.items.forEach((item, idx) => {
      lines.push("——————————————");
      lines.push(
        `*Opção ${idx + 1}${item.volta && item.ida ? " — Ida e volta" : ""} — ${
          (item.ida ?? item.volta)!.airline
        } ${(item.ida ?? item.volta)!.flightNumber}* (${(item.ida ?? item.volta)!.date})`
      );
      if (item.ida) {
        lines.push(`🛫 ${item.volta ? "IDA: " : ""}${item.ida.origin} ${item.ida.departureTime}  →  🛬 ${item.ida.destination} ${item.ida.arrivalTime}`);
        lines.push(
          `⏱️ Duração: ${item.ida.duration}  |  ${item.ida.stops === 0 ? "Voo direto" : `${item.ida.stops} conexão(ões)`}`
        );
      }
      if (item.volta) {
        lines.push(
          `🛫 ${item.ida ? "VOLTA: " : ""}${item.volta.origin} ${item.volta.departureTime}  →  🛬 ${item.volta.destination} ${item.volta.arrivalTime}${item.ida ? ` (${item.volta.date})` : ""}`
        );
        lines.push(
          `⏱️ Duração: ${item.volta.duration}  |  ${item.volta.stops === 0 ? "Voo direto" : `${item.volta.stops} conexão(ões)`}`
        );
      }
      lines.push(`🧳 ${item.baggage} (${item.fareLabel})`);
      lines.push(`💰 *${formatCurrencyBRL(item.price)}*`);
    });
    lines.push("——————————————");

    if (group.items.length > 1) {
      const min = Math.min(...group.items.map((i) => i.price));
      lines.push(`💡 ${group.label} a partir de *${formatCurrencyBRL(min)}*`);
    }
    lines.push("");
  }

  lines.push(`🗓️ Cotação válida até *${validityDateTimePtBR(agency.validityHours)}*`);
  lines.push("");

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
