/** Compara o valor atual de uma opção na cotação com o valor congelado no
 * snapshot mostrado ao cliente no momento do envio. Tolerância de 1 centavo
 * pra evitar falso-positivo de arredondamento de ponto flutuante. */
export const pricesMatch = (a: number, b: number): boolean => Math.abs(a - b) < 0.01;
