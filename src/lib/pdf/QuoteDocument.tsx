import React from "react";
import { Document, Page, View, Text, StyleSheet } from "@react-pdf/renderer";
import { AgencyInfo, QuoteItem } from "../types";
import { baggageLabel, formatCurrencyBRL, formatDatePtBR, quoteNumber } from "../format";

const PRIMARY = "#0f4c5c"; // azul petróleo — neutro, elegante, não associado a nenhuma marca
const ACCENT = "#e8b923"; // amarelo do banner
const ROW_ALT = "#f2f6f7";
const BORDER = "#d8e2e4";

const styles = StyleSheet.create({
  page: {
    padding: 32,
    fontSize: 9,
    fontFamily: "Helvetica",
    color: "#1f2937",
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 10,
  },
  agencyName: {
    fontSize: 18,
    fontFamily: "Helvetica-Bold",
    color: PRIMARY,
  },
  branch: {
    fontSize: 9,
    color: "#6b7280",
    marginTop: 2,
  },
  headerRight: {
    alignItems: "flex-end",
  },
  quoteLabel: {
    fontSize: 8,
    color: "#6b7280",
  },
  quoteNumber: {
    fontSize: 12,
    fontFamily: "Helvetica-Bold",
    color: PRIMARY,
  },
  contactRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 10,
    marginTop: 4,
  },
  contactItem: {
    fontSize: 8,
    color: "#6b7280",
  },
  divider: {
    borderBottomWidth: 2,
    borderBottomColor: PRIMARY,
    marginBottom: 12,
  },
  banner: {
    backgroundColor: ACCENT,
    padding: 10,
    borderRadius: 3,
    marginBottom: 16,
  },
  bannerText: {
    fontSize: 10,
    color: "#3f2f00",
    textAlign: "center",
    fontFamily: "Helvetica-Bold",
  },
  sectionTitle: {
    fontSize: 12,
    fontFamily: "Helvetica-Bold",
    color: PRIMARY,
    marginBottom: 8,
    marginTop: 4,
  },
  card: {
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 4,
    marginBottom: 10,
    overflow: "hidden",
  },
  cardHeader: {
    backgroundColor: PRIMARY,
    color: "#ffffff",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  cardHeaderTitle: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    color: "#ffffff",
  },
  cardHeaderPrice: {
    fontSize: 12,
    fontFamily: "Helvetica-Bold",
    color: "#ffffff",
  },
  cardBody: {
    padding: 10,
  },
  routeRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  routePoint: {
    flex: 1,
  },
  routeAirport: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    color: "#1f2937",
  },
  routeTime: {
    fontSize: 9,
    color: "#374151",
  },
  routeArrow: {
    fontSize: 9,
    color: "#9ca3af",
    marginHorizontal: 8,
  },
  metaRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 14,
    marginTop: 4,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: BORDER,
  },
  metaItem: {
    flexDirection: "row",
  },
  metaLabel: {
    fontSize: 8,
    color: "#6b7280",
    marginRight: 3,
  },
  metaValue: {
    fontSize: 8,
    color: "#1f2937",
    fontFamily: "Helvetica-Bold",
  },
  minPriceBox: {
    backgroundColor: ROW_ALT,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 4,
    padding: 10,
    marginTop: 4,
    marginBottom: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  minPriceLabel: {
    fontSize: 10,
    color: "#374151",
  },
  minPriceValue: {
    fontSize: 14,
    fontFamily: "Helvetica-Bold",
    color: PRIMARY,
  },
  notesBox: {
    marginTop: "auto",
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: BORDER,
  },
  notesTitle: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    color: "#374151",
    marginBottom: 3,
  },
  notesText: {
    fontSize: 8,
    color: "#6b7280",
    lineHeight: 1.4,
  },
  footer: {
    position: "absolute",
    bottom: 24,
    left: 32,
    right: 32,
    flexDirection: "row",
    justifyContent: "space-between",
    fontSize: 7,
    color: "#9ca3af",
    borderTopWidth: 1,
    borderTopColor: BORDER,
    paddingTop: 6,
  },
});

export interface QuoteDocumentProps {
  items: QuoteItem[];
  agency: AgencyInfo;
}

export function QuoteDocument({ items, agency }: QuoteDocumentProps) {
  const selected = items.filter((i) => i.selected);
  const num = quoteNumber();
  const today = formatDatePtBR();
  const minPrice = selected.length ? Math.min(...selected.map((i) => i.price)) : 0;

  return (
    <Document
      title={`Orçamento ${num}`}
      author={agency.agencyName}
      subject="Orçamento de viagem"
    >
      <Page size="A4" style={styles.page}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.agencyName}>{agency.agencyName || "Agência de Viagens"}</Text>
            {agency.branch ? <Text style={styles.branch}>{agency.branch}</Text> : null}
          </View>
          <View style={styles.headerRight}>
            <Text style={styles.quoteLabel}>Orçamento nº</Text>
            <Text style={styles.quoteNumber}>{num}</Text>
            <View style={styles.contactRow}>
              {agency.sellerName ? <Text style={styles.contactItem}>{agency.sellerName}</Text> : null}
              {agency.phone ? <Text style={styles.contactItem}>{agency.phone}</Text> : null}
              {agency.email ? <Text style={styles.contactItem}>{agency.email}</Text> : null}
            </View>
          </View>
        </View>
        <View style={styles.divider} />

        {agency.message.trim() ? (
          <View style={styles.banner}>
            <Text style={styles.bannerText}>{agency.message.trim()}</Text>
          </View>
        ) : null}

        <Text style={styles.sectionTitle}>
          Opções de Voo {selected.length ? `(${selected.length})` : ""}
        </Text>

        {selected.length === 0 ? (
          <Text style={{ fontSize: 10, color: "#6b7280" }}>
            Nenhuma opção selecionada.
          </Text>
        ) : (
          selected.map((item, idx) => (
            <View key={`${item.rowId}-${item.fareId}`} style={styles.card} wrap={false}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardHeaderTitle}>
                  Opção {idx + 1} · {item.airline} {item.flightNumber} · {item.date}
                </Text>
                <Text style={styles.cardHeaderPrice}>{formatCurrencyBRL(item.price)}</Text>
              </View>
              <View style={styles.cardBody}>
                <View style={styles.routeRow}>
                  <View style={styles.routePoint}>
                    <Text style={styles.routeAirport}>{item.origin}</Text>
                    <Text style={styles.routeTime}>Partida {item.departureTime}</Text>
                  </View>
                  <Text style={styles.routeArrow}>{"—————>"}</Text>
                  <View style={styles.routePoint}>
                    <Text style={styles.routeAirport}>{item.destination}</Text>
                    <Text style={styles.routeTime}>Chegada {item.arrivalTime}</Text>
                  </View>
                </View>
                <View style={styles.metaRow}>
                  <View style={styles.metaItem}>
                    <Text style={styles.metaLabel}>Duração:</Text>
                    <Text style={styles.metaValue}>{item.duration}</Text>
                  </View>
                  <View style={styles.metaItem}>
                    <Text style={styles.metaLabel}>Conexões:</Text>
                    <Text style={styles.metaValue}>
                      {item.stops === 0 ? "Voo direto" : String(item.stops)}
                    </Text>
                  </View>
                  <View style={styles.metaItem}>
                    <Text style={styles.metaLabel}>Equip.:</Text>
                    <Text style={styles.metaValue}>{item.aircraft || "—"}</Text>
                  </View>
                  <View style={styles.metaItem}>
                    <Text style={styles.metaLabel}>Bagagem:</Text>
                    <Text style={styles.metaValue}>
                      {baggageLabel(item.baggage)} ({item.fareLabel})
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          ))
        )}

        {selected.length > 1 ? (
          <View style={styles.minPriceBox}>
            <Text style={styles.minPriceLabel}>Valor a partir de</Text>
            <Text style={styles.minPriceValue}>{formatCurrencyBRL(minPrice)}</Text>
          </View>
        ) : null}

        {agency.notes.trim() ? (
          <View style={styles.notesBox}>
            <Text style={styles.notesTitle}>Informações importantes</Text>
            <Text style={styles.notesText}>{agency.notes.trim()}</Text>
          </View>
        ) : null}

        <View style={styles.footer} fixed>
          <Text>{agency.agencyName || "Agência de Viagens"}</Text>
          <Text>{today}</Text>
        </View>
      </Page>
    </Document>
  );
}
