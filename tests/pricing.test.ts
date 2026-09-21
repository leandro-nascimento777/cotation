import { describe, expect, it } from "vitest";
import { calculatePricing } from "@/lib/pricing";
import { defaultPricingRules, PricingRules } from "@/lib/store/types";

describe("calculatePricing (Motor Financeiro de Precificação)", () => {
  it("deve retornar o valor puro quando todas as taxas forem zero", () => {
    const input = {
      tarifaLiquida: 1000,
      passageiros: 1,
      internacional: false,
      pagamentoCartaoAgencia: false,
    };
    const result = calculatePricing(input, defaultPricingRules);

    expect(result.tarifaLiquida).toBe(1000);
    expect(result.duRav).toBe(0);
    expect(result.feeServico).toBe(0);
    expect(result.markup).toBe(0);
    expect(result.taxasAgencia).toBe(0);
    expect(result.impostoRetido).toBe(0);
    expect(result.gateway).toBe(0);
    expect(result.precoVenda).toBe(1000);
  });

  it("deve calcular DU/RAV percentual corretamente", () => {
    const rules: PricingRules = {
      ...defaultPricingRules,
      duRavTipo: "PERCENTUAL",
      duRavValor: 10, // 10%
      duRavPisoMinimo: 0,
    };
    const result = calculatePricing(
      { tarifaLiquida: 1500, passageiros: 1, internacional: false, pagamentoCartaoAgencia: false },
      rules
    );

    expect(result.duRav).toBe(150); // 10% de 1500
    expect(result.precoVenda).toBe(1650);
  });

  it("deve aplicar piso mínimo de DU/RAV quando o percentual for menor que o piso", () => {
    const rules: PricingRules = {
      ...defaultPricingRules,
      duRavTipo: "PERCENTUAL",
      duRavValor: 5, // 5% de 200 = 10
      duRavPisoMinimo: 45, // piso é 45
    };
    const result = calculatePricing(
      { tarifaLiquida: 200, passageiros: 1, internacional: false, pagamentoCartaoAgencia: false },
      rules
    );

    expect(result.duRav).toBe(45);
  });

  it("deve calcular DU/RAV fixo", () => {
    const rules: PricingRules = {
      ...defaultPricingRules,
      duRavTipo: "FIXO",
      duRavValor: 80,
    };
    const result = calculatePricing(
      { tarifaLiquida: 500, passageiros: 1, internacional: false, pagamentoCartaoAgencia: false },
      rules
    );

    expect(result.duRav).toBe(80);
    expect(result.precoVenda).toBe(580);
  });

  it("deve diferenciar fee de serviço nacional e internacional por passageiro", () => {
    const rules: PricingRules = {
      ...defaultPricingRules,
      feeServicoModo: "POR_PASSAGEIRO",
      feeServicoNacional: 50,
      feeServicoInternacional: 120,
    };

    // Nacional com 3 passageiros
    const resultNacional = calculatePricing(
      { tarifaLiquida: 1000, passageiros: 3, internacional: false, pagamentoCartaoAgencia: false },
      rules
    );
    expect(resultNacional.feeServico).toBe(150); // 3 x 50

    // Internacional com 2 passageiros
    const resultInternacional = calculatePricing(
      { tarifaLiquida: 2000, passageiros: 2, internacional: true, pagamentoCartaoAgencia: false },
      rules
    );
    expect(resultInternacional.feeServico).toBe(240); // 2 x 120
  });

  it("deve cobrar taxa de gateway somente quando cliente paga no cartão da própria agência", () => {
    const rules: PricingRules = {
      ...defaultPricingRules,
      gatewayPercent: 3.5, // 3.5%
    };

    // Pagando no cartão da agência
    const resultComGateway = calculatePricing(
      { tarifaLiquida: 1000, passageiros: 1, internacional: false, pagamentoCartaoAgencia: true },
      rules
    );
    expect(resultComGateway.gateway).toBe(35); // 3.5% de 1000
    expect(resultComGateway.precoVenda).toBe(1035);

    // Cartão do cliente direto na cia aérea (sem repasse de gateway)
    const resultSemGateway = calculatePricing(
      { tarifaLiquida: 1000, passageiros: 1, internacional: false, pagamentoCartaoAgencia: false },
      rules
    );
    expect(resultSemGateway.gateway).toBe(0);
    expect(resultSemGateway.precoVenda).toBe(1000);
  });

  it("deve aplicar imposto retido apenas sobre a margem da agência e nunca sobre o bilhete", () => {
    const rules: PricingRules = {
      ...defaultPricingRules,
      duRavTipo: "FIXO",
      duRavValor: 100, // 100
      markupPercent: 5, // 5% de 1000 = 50
      feeServicoModo: "POR_BILHETE",
      feeServicoNacional: 50, // 50
      // Total de taxas da agência = 100 + 50 + 50 = 200
      impostoRetidoPercent: 10, // 10% sobre as taxas da agência = 20
    };

    const result = calculatePricing(
      { tarifaLiquida: 1000, passageiros: 1, internacional: false, pagamentoCartaoAgencia: false },
      rules
    );

    expect(result.taxasAgencia).toBe(200);
    expect(result.impostoRetido).toBe(20);
    // Venda = 1000 (bilhete) + 200 (taxas) + 20 (imposto retido) = 1220
    expect(result.precoVenda).toBe(1220);
  });
});
