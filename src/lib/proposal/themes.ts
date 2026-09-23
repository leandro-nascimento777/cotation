const BLOB_BASE = "https://jm8pb1vuovom8tcf.public.blob.vercel-storage.com/proposal-theme-presets";

export interface ProposalTheme {
  id: string;
  label: string;
  imageUrl: string;
}

/** Presets de capa da proposta pública — fotos de destinos, hospedadas no
 * Vercel Blob (ver ThemeModal). "aereo" é o padrão do sistema. */
export const PROPOSAL_THEMES: ProposalTheme[] = [
  { id: "aereo", label: "Aéreo", imageUrl: `${BLOB_BASE}/aereo.jpg` },
  { id: "cataratas-iguacu", label: "Cataratas do Iguaçu", imageUrl: `${BLOB_BASE}/cataratas-iguacu.jpg` },
  { id: "coliseu-roma", label: "Coliseu (Roma)", imageUrl: `${BLOB_BASE}/coliseu-roma.jpg` },
  { id: "cristo-redentor", label: "Cristo Redentor", imageUrl: `${BLOB_BASE}/cristo-redentor.jpg` },
  { id: "disney", label: "Disney", imageUrl: `${BLOB_BASE}/disney.jpg` },
  { id: "estatua-liberdade", label: "Estátua da Liberdade", imageUrl: `${BLOB_BASE}/estatua-liberdade.jpg` },
  { id: "fernando-de-noronha", label: "Fernando de Noronha", imageUrl: `${BLOB_BASE}/fernando-de-noronha.jpg` },
  { id: "gramado", label: "Gramado", imageUrl: `${BLOB_BASE}/gramado.jpg` },
  { id: "muralha-china", label: "Muralha da China", imageUrl: `${BLOB_BASE}/muralha-china.jpg` },
  { id: "paris", label: "Paris", imageUrl: `${BLOB_BASE}/paris.jpg` },
  { id: "pelourinho", label: "Pelourinho", imageUrl: `${BLOB_BASE}/pelourinho.jpg` },
];

export const DEFAULT_THEME_ID = "aereo";

export const DEFAULT_NEXT_STEPS = [
  "Escolha a opção final (com ou sem extras).",
  "Envie os dados dos passageiros: nome completo, nascimento, documento.",
  "Informe a forma de pagamento escolhida.",
  "Após a aprovação, nossa equipe emitirá os bilhetes e enviará o voucher de confirmação.",
].join("\n");

export function getProposalTheme(themeId: string): ProposalTheme {
  return PROPOSAL_THEMES.find((t) => t.id === themeId) ?? PROPOSAL_THEMES[0];
}
