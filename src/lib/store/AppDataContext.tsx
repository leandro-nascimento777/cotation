"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import {
  AgencySettings,
  Client,
  ClientDraft,
  ClientPassenger,
  defaultAgencySettings,
  PricingProfile,
  PricingProfileDraft,
  Quote,
  QuoteDraft,
  TeamMember,
  TeamMemberDraft,
} from "./types";
import {
  createClientAction,
  deleteClientAction,
  listClientsAction,
  updateClientAction,
} from "@/lib/actions/clients";
import {
  createTeamMemberAction,
  deleteTeamMemberAction,
  listTeamMembersAction,
  updateTeamMemberAction,
} from "@/lib/actions/team";
import { createQuoteAction, deleteQuoteAction } from "@/lib/actions/quotes";
import { logger } from "@/lib/logger";

// "Banco local": Context + localStorage. Mesma forma de uma API real
// (list/get/create/update/remove), pra trocar por fetch() depois ser
// mecânico — ver prisma/schema.prisma pro desenho do banco de verdade.

const STORAGE_KEYS = {
  agency: "cotation:agency",
  clients: "cotation:clients",
  quotes: "cotation:quotes",
  team: "cotation:team",
  pricingProfiles: "cotation:pricingProfiles",
} as const;

function readStorage<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeStorage<T>(key: string, value: T) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // localStorage indisponível (modo privado, storage cheio, etc.) —
    // degrada silenciosamente, os dados só não persistem entre sessões.
  }
}

function genId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return `id-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

interface AppDataContextValue {
  hydrated: boolean;

  agency: AgencySettings;
  updateAgency: (patch: Partial<AgencySettings>) => void;
  resetAgencyPdfColors: () => void;

  clients: Client[];
  getClient: (id: string) => Client | undefined;
  createClient: (draft: ClientDraft) => Client;
  updateClient: (id: string, patch: Partial<ClientDraft>) => void;
  addClientPassenger: (clientId: string, passenger: ClientPassenger) => void;
  deleteClient: (id: string) => void;

  teamMembers: TeamMember[];
  getTeamMember: (id: string) => TeamMember | undefined;
  createTeamMember: (draft: TeamMemberDraft) => TeamMember;
  updateTeamMember: (id: string, patch: Partial<TeamMemberDraft>) => void;
  deleteTeamMember: (id: string) => void;

  pricingProfiles: PricingProfile[];
  getPricingProfile: (id: string) => PricingProfile | undefined;
  createPricingProfile: (draft: PricingProfileDraft) => PricingProfile;
  updatePricingProfile: (id: string, patch: Partial<PricingProfileDraft>) => void;
  deletePricingProfile: (id: string) => void;

  quotes: Quote[];
  getQuote: (id: string) => Quote | undefined;
  /** Cria a cotação já atribuindo o número (prefixo + próximo número da
   * agência) e incrementando o contador. */
  createQuote: (draft: QuoteDraft) => Quote;
  updateQuote: (id: string, patch: Partial<Quote>) => void;
  deleteQuote: (id: string) => void;
  duplicateQuote: (id: string) => Quote | undefined;
}

const AppDataContext = createContext<AppDataContextValue | null>(null);

export function AppDataProvider({ children }: { children: React.ReactNode }) {
  const [hydrated, setHydrated] = useState(false);
  const [agency, setAgency] = useState<AgencySettings>(defaultAgencySettings);
  const [clients, setClients] = useState<Client[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [pricingProfiles, setPricingProfiles] = useState<PricingProfile[]>([]);
  const [quotes, setQuotes] = useState<Quote[]>([]);

  // Hidrata do localStorage só no client, depois do primeiro render, pra
  // não dar mismatch de SSR (o servidor sempre renderiza os defaults).
  // localStorage não é um estado derivado de props/state — é a única forma
  // de trazer esse valor externo pro React nesse momento, por isso o
  // set-state aqui é intencional (eslint-plugin-react-hooks trata isso como
  // suspeito de cascata de renders, mas não há alternativa sem essa leitura
  // síncrona pontual no mount).
  useEffect(() => {
    // Mescla com os defaults em vez de confiar cegamente no que já está
    // salvo — agency.ts evolui com novos campos (ex: regras financeiras),
    // e um registro salvo antes dessas mudanças não os teria, quebrando
    // qualquer código que espera esses campos presentes.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setAgency({ ...defaultAgencySettings, ...readStorage(STORAGE_KEYS.agency, defaultAgencySettings) });
    setClients(readStorage(STORAGE_KEYS.clients, []));
    setTeamMembers(readStorage(STORAGE_KEYS.team, []));
    setPricingProfiles(readStorage(STORAGE_KEYS.pricingProfiles, []));
    setQuotes(readStorage(STORAGE_KEYS.quotes, []));
    setHydrated(true);

    // Sincronização em background com o PostgreSQL (Neon via Prisma)
    Promise.all([listClientsAction(), listTeamMembersAction()])
      .then(([clientsRes, teamRes]) => {
        if (clientsRes.ok && clientsRes.data && clientsRes.data.length > 0) {
          const dbClients: Client[] = clientsRes.data.map((c) => ({
            id: c.id,
            createdAt: c.createdAt.toISOString(),
            nomeCompleto: c.nomeCompleto,
            cpf: c.cpf || "",
            email: c.email || "",
            telefone: c.telefone || "",
            endereco: c.endereco || "",
            cidade: c.cidade || "",
            observacoes: c.observacoes || "",
          }));
          setClients((prev) => {
            const ids = new Set(prev.map((p) => p.id));
            const newFromDb = dbClients.filter((d) => !ids.has(d.id));
            return [...prev, ...newFromDb];
          });
        }
        if (teamRes.ok && teamRes.data && teamRes.data.length > 0) {
          const dbMembers: TeamMember[] = teamRes.data.map((m) => ({
            id: m.id,
            createdAt: m.createdAt.toISOString(),
            nome: m.nome,
            cargo: m.cargo || "",
            email: m.email || "",
            telefone: m.telefone || "",
            ativo: m.ativo,
          }));
          setTeamMembers((prev) => {
            const ids = new Set(prev.map((p) => p.id));
            const newFromDb = dbMembers.filter((d) => !ids.has(d.id));
            return [...prev, ...newFromDb];
          });
        }
      })
      .catch((err) => {
        logger.warn("Sincronização com o banco em background falhou (usando cache local)", { error: String(err) });
      });
  }, []);

  useEffect(() => {
    if (hydrated) writeStorage(STORAGE_KEYS.agency, agency);
  }, [agency, hydrated]);

  useEffect(() => {
    if (hydrated) writeStorage(STORAGE_KEYS.clients, clients);
  }, [clients, hydrated]);

  useEffect(() => {
    if (hydrated) writeStorage(STORAGE_KEYS.team, teamMembers);
  }, [teamMembers, hydrated]);

  useEffect(() => {
    if (hydrated) writeStorage(STORAGE_KEYS.pricingProfiles, pricingProfiles);
  }, [pricingProfiles, hydrated]);

  useEffect(() => {
    if (hydrated) writeStorage(STORAGE_KEYS.quotes, quotes);
  }, [quotes, hydrated]);

  const updateAgency = useCallback((patch: Partial<AgencySettings>) => {
    setAgency((prev) => ({ ...prev, ...patch }));
  }, []);

  const resetAgencyPdfColors = useCallback(() => {
    setAgency((prev) => ({
      ...prev,
      pdfCorPrimaria: "",
      pdfCorSecundaria: "",
      pdfCorTexto: "",
    }));
  }, []);

  const getClient = useCallback((id: string) => clients.find((c) => c.id === id), [clients]);

  const createClient = useCallback((draft: ClientDraft) => {
    const client: Client = { id: genId(), createdAt: new Date().toISOString(), ...draft };
    setClients((prev) => [client, ...prev]);
    createClientAction(draft).catch((err) => logger.warn("Persistência de cliente em background falhou", { error: String(err) }));
    return client;
  }, []);

  const updateClient = useCallback((id: string, patch: Partial<ClientDraft>) => {
    setClients((prev) => prev.map((c) => (c.id === id ? { ...c, ...patch } : c)));
    updateClientAction(id, patch).catch((err) => logger.warn("Atualização de cliente em background falhou", { error: String(err) }));
  }, []);

  const addClientPassenger = useCallback((clientId: string, passenger: ClientPassenger) => {
    setClients((prev) =>
      prev.map((c) => {
        if (c.id !== clientId) return c;
        const currentPassengers = c.passageiros || [];
        const exists = currentPassengers.some(
          (p) => p.id === passenger.id || (p.numeroDocumento && p.numeroDocumento === passenger.numeroDocumento)
        );
        if (exists) {
          return {
            ...c,
            passageiros: currentPassengers.map((p) =>
              p.id === passenger.id || (p.numeroDocumento && p.numeroDocumento === passenger.numeroDocumento)
                ? passenger
                : p
            ),
          };
        }
        return {
          ...c,
          passageiros: [...currentPassengers, passenger],
        };
      })
    );
  }, []);

  const deleteClient = useCallback((id: string) => {
    setClients((prev) => prev.filter((c) => c.id !== id));
    deleteClientAction(id).catch((err) => logger.warn("Exclusão de cliente em background falhou", { error: String(err) }));
  }, []);

  const getTeamMember = useCallback(
    (id: string) => teamMembers.find((m) => m.id === id),
    [teamMembers]
  );

  const createTeamMember = useCallback((draft: TeamMemberDraft) => {
    const member: TeamMember = { id: genId(), createdAt: new Date().toISOString(), ...draft };
    setTeamMembers((prev) => [member, ...prev]);
    createTeamMemberAction(draft).catch((err) => logger.warn("Persistência de equipe em background falhou", { error: String(err) }));
    return member;
  }, []);

  const updateTeamMember = useCallback((id: string, patch: Partial<TeamMemberDraft>) => {
    setTeamMembers((prev) => prev.map((m) => (m.id === id ? { ...m, ...patch } : m)));
    updateTeamMemberAction(id, patch).catch((err) => logger.warn("Atualização de equipe em background falhou", { error: String(err) }));
  }, []);

  const deleteTeamMember = useCallback((id: string) => {
    setTeamMembers((prev) => prev.filter((m) => m.id !== id));
    deleteTeamMemberAction(id).catch((err) => logger.warn("Remoção de equipe em background falhou", { error: String(err) }));
  }, []);

  const getPricingProfile = useCallback(
    (id: string) => pricingProfiles.find((p) => p.id === id),
    [pricingProfiles]
  );

  const createPricingProfile = useCallback((draft: PricingProfileDraft) => {
    const profile: PricingProfile = { id: genId(), createdAt: new Date().toISOString(), ...draft };
    setPricingProfiles((prev) => [profile, ...prev]);
    return profile;
  }, []);

  const updatePricingProfile = useCallback((id: string, patch: Partial<PricingProfileDraft>) => {
    setPricingProfiles((prev) => prev.map((p) => (p.id === id ? { ...p, ...patch } : p)));
  }, []);

  const deletePricingProfile = useCallback((id: string) => {
    setPricingProfiles((prev) => prev.filter((p) => p.id !== id));
  }, []);

  const getQuote = useCallback((id: string) => quotes.find((q) => q.id === id), [quotes]);

  const createQuote = useCallback(
    (draft: QuoteDraft) => {
      const now = new Date();
      let numero = "";
      setAgency((prevAgency) => {
        const seq = String(prevAgency.proximoOrcamentoNumero).padStart(6, "0");
        numero = `${prevAgency.orcamentoPrefixo}-${now.getFullYear()}-${seq}`;
        return { ...prevAgency, proximoOrcamentoNumero: prevAgency.proximoOrcamentoNumero + 1 };
      });
      const quote: Quote = {
        id: genId(),
        createdAt: now.toISOString(),
        updatedAt: now.toISOString(),
        numero,
        status: draft.status || "NOVA",
        ...draft,
      };
      setQuotes((prev) => [quote, ...prev]);

      // Despacha persistência para PostgreSQL
      createQuoteAction({
        numero,
        clientId: draft.clientId,
        responsavelId: draft.responsavelId,
        sellerName: draft.sellerName,
        sellerEmail: draft.sellerEmail,
        sellerPhone: draft.sellerPhone,
        destino: draft.destino,
        periodoInicio: draft.periodoInicio,
        periodoFim: draft.periodoFim,
        paymentMethod: draft.paymentMethod,
        mensagemDestaque: draft.mensagemDestaque,
        observacoes: draft.observacoes,
        valorTotal: draft.valorTotal,
        flightItems: draft.flightItems || [],
      }).catch((err) => logger.warn("Persistência de cotação em background falhou", { error: String(err) }));

      return quote;
    },
    []
  );

  const updateQuote = useCallback((id: string, patch: Partial<Quote>) => {
    setQuotes((prev) =>
      prev.map((q) => (q.id === id ? { ...q, ...patch, updatedAt: new Date().toISOString() } : q))
    );
  }, []);

  const deleteQuote = useCallback((id: string) => {
    setQuotes((prev) => prev.filter((q) => q.id !== id));
    deleteQuoteAction(id).catch((err) => logger.warn("Exclusão de cotação em background falhou", { error: String(err) }));
  }, []);

  const duplicateQuote = useCallback(
    (id: string) => {
      const original = quotes.find((q) => q.id === id);
      if (!original) return undefined;
      return createQuote({
        type: original.type,
        clientId: original.clientId,
        responsavelId: original.responsavelId,
        sellerName: original.sellerName,
        sellerEmail: original.sellerEmail,
        sellerPhone: original.sellerPhone,
        destino: original.destino,
        periodoInicio: original.periodoInicio,
        periodoFim: original.periodoFim,
        paymentMethod: original.paymentMethod,
        validityHours: original.validityHours,
        priority: original.priority,
        adults: original.adults,
        children: original.children,
        infants: original.infants,
        mensagemDestaque: original.mensagemDestaque,
        observacoes: original.observacoes,
        valorTotal: original.valorTotal,
        flightItems: original.flightItems,
        status: "NOVA",
        pricingProfileId: original.pricingProfileId,
        saleClosed: false,
        closedIda: null,
        closedVolta: null,
        bookingRef: "",
      });
    },
    [quotes, createQuote]
  );

  const value = useMemo<AppDataContextValue>(
    () => ({
      hydrated,
      agency,
      updateAgency,
      resetAgencyPdfColors,
      clients,
      getClient,
      createClient,
      updateClient,
      addClientPassenger,
      deleteClient,
      teamMembers,
      getTeamMember,
      createTeamMember,
      updateTeamMember,
      deleteTeamMember,
      pricingProfiles,
      getPricingProfile,
      createPricingProfile,
      updatePricingProfile,
      deletePricingProfile,
      quotes,
      getQuote,
      createQuote,
      updateQuote,
      deleteQuote,
      duplicateQuote,
    }),
    [
      hydrated,
      agency,
      updateAgency,
      resetAgencyPdfColors,
      clients,
      getClient,
      createClient,
      updateClient,
      addClientPassenger,
      deleteClient,
      teamMembers,
      getTeamMember,
      createTeamMember,
      updateTeamMember,
      deleteTeamMember,
      pricingProfiles,
      getPricingProfile,
      createPricingProfile,
      updatePricingProfile,
      deletePricingProfile,
      quotes,
      getQuote,
      createQuote,
      updateQuote,
      deleteQuote,
      duplicateQuote,
    ]
  );

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>;
}

export function useAppData(): AppDataContextValue {
  const ctx = useContext(AppDataContext);
  if (!ctx) throw new Error("useAppData precisa ser usado dentro de <AppDataProvider>");
  return ctx;
}
