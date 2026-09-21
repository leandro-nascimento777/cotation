/** Utilitários para escape e formatação de HTML usados na geração de PDFs. */

export const escapeHtml = (value: string | number | undefined | null): string => {
  if (value === undefined || value === null) return "";
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
};

/** Converte quebras de linha em tags <p> ou <br>, com escape seguro. */
export const nl2br = (value: string): string => {
  if (!value) return "";
  return value
    .replace(/\r\n/g, "\n")
    .split(/\n\n+/)
    .map((p) => p.trim())
    .filter(Boolean)
    .map((p) => `<p>${escapeHtml(p).replace(/\n/g, "<br>")}</p>`)
    .join("");
};

/** Converte quebras de linha simples em <br>, com escape seguro. */
export const nl2brSimple = (value: string): string => {
  if (!value) return "";
  return escapeHtml(value).replace(/\n/g, "<br>");
};
