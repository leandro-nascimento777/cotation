export interface ProposalTheme {
  id: string;
  label: string;
  /** Gradiente CSS usado na capa da proposta pública quando não há imagem
   * de capa customizada (ver ThemeModal/coverImageUrl). */
  gradient: string;
  textClass: string;
}

export const PROPOSAL_THEMES: ProposalTheme[] = [
  {
    id: "padrao",
    label: "Padrão",
    gradient: "linear-gradient(135deg, #0f766e 0%, #134e4a 100%)",
    textClass: "text-white",
  },
  {
    id: "oceano",
    label: "Oceano",
    gradient: "linear-gradient(135deg, #0ea5e9 0%, #1e3a8a 100%)",
    textClass: "text-white",
  },
  {
    id: "por-do-sol",
    label: "Pôr do sol",
    gradient: "linear-gradient(135deg, #f97316 0%, #be123c 100%)",
    textClass: "text-white",
  },
  {
    id: "floresta",
    label: "Floresta",
    gradient: "linear-gradient(135deg, #65a30d 0%, #14532d 100%)",
    textClass: "text-white",
  },
];

export const DEFAULT_THEME_ID = "padrao";

export function getProposalTheme(themeId: string): ProposalTheme {
  return PROPOSAL_THEMES.find((t) => t.id === themeId) ?? PROPOSAL_THEMES[0];
}
