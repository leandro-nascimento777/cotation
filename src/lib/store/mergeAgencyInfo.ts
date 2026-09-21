import { AgencyInfo } from "@/lib/types";
import { AgencySettings } from "./types";

export interface QuoteOverrides {
  sellerName: string;
  sellerEmail: string;
  sellerPhone: string;
  mensagemDestaque: string;
  observacoes: string;
  validityHours: number;
}

/** Combina os dados persistentes da agência (Configurações) com os dados
 * que variam por cotação, no formato que o motor de PDF/WhatsApp
 * (AgencyInfo, ver src/lib/types.ts) já espera — assim
 * buildFlightQuoteData/buildWhatsAppText/PreviewPanel não precisam mudar. */
export const buildAgencyInfoForQuote = (
  settings: AgencySettings,
  overrides: QuoteOverrides
): AgencyInfo => ({
  agencyName: settings.agencyName,
  branch: settings.branch,
  sellerName: overrides.sellerName || settings.sellerName,
  email: overrides.sellerEmail || settings.email,
  phone: overrides.sellerPhone || settings.phone,
  message: overrides.mensagemDestaque,
  notes: overrides.observacoes,
  logoDataUrl: settings.pdfUsarLogoAgencia ? settings.logoDataUrl : "",
  validityHours: overrides.validityHours,
  cnpj: settings.cnpj,
  cadastur: settings.cadastur,
});
