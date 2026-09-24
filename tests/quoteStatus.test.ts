import { describe, expect, it } from "vitest";
import { normalizeQuoteStatus, statusFromClientDecision } from "@/lib/store/quoteStatus";

describe("normalizeQuoteStatus", () => {
  it("mantém status atuais", () => {
    expect(normalizeQuoteStatus("RASCUNHO")).toBe("RASCUNHO");
    expect(normalizeQuoteStatus("ENVIADA")).toBe("ENVIADA");
    expect(normalizeQuoteStatus("AGUARDANDO")).toBe("AGUARDANDO");
    expect(normalizeQuoteStatus("APROVADA")).toBe("APROVADA");
  });

  it("migra status legados do funil de 5 colunas", () => {
    expect(normalizeQuoteStatus("NOVA")).toBe("RASCUNHO");
    expect(normalizeQuoteStatus("EM_ATENDIMENTO")).toBe("RASCUNHO");
    expect(normalizeQuoteStatus("PROPOSTA_ENVIADA")).toBe("ENVIADA");
    expect(normalizeQuoteStatus("AGUARDANDO_CLIENTE")).toBe("AGUARDANDO");
  });

  it("cai em RASCUNHO para valores ausentes ou desconhecidos", () => {
    expect(normalizeQuoteStatus(undefined)).toBe("RASCUNHO");
    expect(normalizeQuoteStatus("")).toBe("RASCUNHO");
    expect(normalizeQuoteStatus("XPTO")).toBe("RASCUNHO");
  });
});

describe("statusFromClientDecision", () => {
  it("aprovação leva a APROVADA de qualquer etapa", () => {
    expect(statusFromClientDecision("RASCUNHO", "APROVADO")).toBe("APROVADA");
    expect(statusFromClientDecision("ENVIADA", "APROVADO")).toBe("APROVADA");
    expect(statusFromClientDecision("AGUARDANDO", "APROVADO")).toBe("APROVADA");
    expect(statusFromClientDecision("APROVADA", "APROVADO")).toBeNull();
  });

  it("pedido de revisão move para AGUARDANDO só a partir de Rascunhos/Enviadas", () => {
    expect(statusFromClientDecision("RASCUNHO", "REVISAO")).toBe("AGUARDANDO");
    expect(statusFromClientDecision("ENVIADA", "REVISAO")).toBe("AGUARDANDO");
    expect(statusFromClientDecision("AGUARDANDO", "REVISAO")).toBeNull();
    expect(statusFromClientDecision("APROVADA", "REVISAO")).toBeNull();
  });

  it("sem decisão não muda nada", () => {
    expect(statusFromClientDecision("ENVIADA", null)).toBeNull();
  });
});
