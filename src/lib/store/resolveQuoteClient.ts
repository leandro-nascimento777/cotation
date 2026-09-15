import { Client, ClientDraft } from "./types";

export interface QuoteClientFields {
  clientId: string | null;
  clientName: string;
  clientPhone: string;
  clientEmail: string;
}

interface QuoteClientActions {
  getClient: (id: string) => Client | undefined;
  createClient: (draft: ClientDraft) => Client;
  updateClient: (id: string, patch: Partial<ClientDraft>) => void;
}

/** Resolve o clientId final a partir dos campos de cliente da ficha de
 * cotação (ver QuoteExtrasForm): se o nome digitado já bate com um cliente
 * salvo, sincroniza telefone/e-mail nele; senão cria um novo contato na
 * hora — é assim que "salva automaticamente ao finalizar a cotação". */
export function resolveQuoteClientId(fields: QuoteClientFields, actions: QuoteClientActions): string | null {
  const name = fields.clientName.trim();
  if (!name) return null;

  if (fields.clientId && actions.getClient(fields.clientId)) {
    actions.updateClient(fields.clientId, {
      nomeCompleto: name,
      telefone: fields.clientPhone,
      email: fields.clientEmail,
    });
    return fields.clientId;
  }

  const created = actions.createClient({
    nomeCompleto: name,
    telefone: fields.clientPhone,
    email: fields.clientEmail,
    cpf: "",
    endereco: "",
    cidade: "",
    observacoes: "",
  });
  return created.id;
}
