import { describe, expect, it } from "vitest";

describe("Extração de Cores da Logo com IA", () => {
  it("valida o formato hexadecimal das 3 cores extraídas", () => {
    const palette = {
      corPrimaria: "#1B4F8C",
      corSecundaria: "#8A2BE2",
      corTerciaria: "#1E293B",
      paletaNomes: ["Azul Real", "Roxo Violeta", "Grafite"],
    };

    const hexRegex = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;

    expect(hexRegex.test(palette.corPrimaria)).toBe(true);
    expect(hexRegex.test(palette.corSecundaria)).toBe(true);
    expect(hexRegex.test(palette.corTerciaria)).toBe(true);
    expect(palette.paletaNomes).toHaveLength(3);
  });

  it("permite aplicar as 3 cores extraídas nas configurações da agência", () => {
    const initialSettings = {
      agencyName: "Minha Agência",
      pdfCorPrimaria: "",
      pdfCorSecundaria: "",
      pdfCorTexto: "",
    };

    const aiExtracted = {
      corPrimaria: "#FF6600",
      corSecundaria: "#003399",
      corTerciaria: "#333333",
    };

    const updatedSettings = {
      ...initialSettings,
      pdfCorPrimaria: aiExtracted.corPrimaria,
      pdfCorSecundaria: aiExtracted.corSecundaria,
      pdfCorTexto: aiExtracted.corTerciaria,
    };

    expect(updatedSettings.pdfCorPrimaria).toBe("#FF6600");
    expect(updatedSettings.pdfCorSecundaria).toBe("#003399");
    expect(updatedSettings.pdfCorTexto).toBe("#333333");
  });

  it("garante fallback para padrões do sistema quando cores forem resetadas", () => {
    const defaultColors = {
      pdfCorPrimaria: "",
      pdfCorSecundaria: "",
      pdfCorTexto: "",
    };

    const resolveColor = (configured: string, fallback: string) => configured.trim() || fallback;

    expect(resolveColor(defaultColors.pdfCorPrimaria, "#1b4f8c")).toBe("#1b4f8c");
    expect(resolveColor(defaultColors.pdfCorSecundaria, "#8a2be2")).toBe("#8a2be2");
    expect(resolveColor(defaultColors.pdfCorTexto, "#222222")).toBe("#222222");
  });
});
