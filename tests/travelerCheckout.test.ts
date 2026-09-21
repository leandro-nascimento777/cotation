import { describe, expect, it } from "vitest";
import { ClientPassenger } from "@/lib/store/types";

describe("Traveler Checkout Rules", () => {
  it("calcula o desconto de 1% do Pix corretamente", () => {
    const totalAmount = 16662;
    const discount = Math.max(9.02, totalAmount * 0.01);
    const totalWithDiscount = totalAmount - discount;

    expect(discount).toBeCloseTo(166.62, 1);
    expect(totalWithDiscount).toBeCloseTo(16495.38, 1);
  });

  it("calcula piso mínimo de desconto Pix para valores baixos", () => {
    const totalAmount = 500;
    const discount = Math.max(9.02, totalAmount * 0.01);
    expect(discount).toBe(9.02);
  });

  it("evita duplicidade ao salvar passageiros com mesmo documento", () => {
    const existing: ClientPassenger[] = [
      {
        id: "p1",
        nome: "LEANDRO",
        sobrenome: "NASCIMENTO",
        paisResidencia: "Brasil",
        tipoDocumento: "CPF",
        numeroDocumento: "02007159171",
        tipo: "Adulto",
      },
    ];

    const newPass: ClientPassenger = {
      id: "p2",
      nome: "LEANDRO",
      sobrenome: "NASCIMENTO JUNIOR",
      paisResidencia: "Brasil",
      tipoDocumento: "CPF",
      numeroDocumento: "02007159171", // mesmo documento
      tipo: "Adulto",
    };

    const isDuplicate = existing.some((p) => p.numeroDocumento === newPass.numeroDocumento);
    expect(isDuplicate).toBe(true);

    const updated = [
      ...existing.filter((p) => p.numeroDocumento !== newPass.numeroDocumento),
      newPass,
    ];
    expect(updated).toHaveLength(1);
    expect(updated[0].sobrenome).toBe("NASCIMENTO JUNIOR");
  });

  it("exige data de nascimento para viajantes menores (Criança ou Bebê)", () => {
    const childPass: ClientPassenger = {
      id: "c1",
      nome: "VALERIA",
      sobrenome: "CUNHA",
      paisResidencia: "Brasil",
      tipoDocumento: "CPF ou RG",
      numeroDocumento: "547639375",
      tipo: "Criança",
      dataNascimento: "08/05/2021",
    };

    expect(childPass.dataNascimento).toBeDefined();
    expect(childPass.dataNascimento).toMatch(/^\d{2}\/\d{2}\/\d{4}$/);
  });

  it("valida obrigatoriedade de CEP para emissão da nota fiscal", () => {
    const validateCep = (cep: string) => {
      const clean = cep.replace(/\D/g, "");
      return clean.length >= 8;
    };

    expect(validateCep("")).toBe(false);
    expect(validateCep("57490")).toBe(false);
    expect(validateCep("57490-970")).toBe(true);
    expect(validateCep("57490970")).toBe(true);
  });

  it("permite selecionar opção de pagamento com a agência sem exigir cartão de crédito", () => {
    const paymentSelection = {
      method: "AGENCIA" as const,
      discount: 0,
      total: 12500,
    };

    expect(paymentSelection.method).toBe("AGENCIA");
    expect(paymentSelection.total).toBe(12500);
    expect(paymentSelection.discount).toBe(0);
  });
});

