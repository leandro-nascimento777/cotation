"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import {
  AgencySettings,
  Client,
  ClientDraft,
  defaultAgencySettings,
  Quote,
  QuoteDraft,
  TeamMember,
  TeamMemberDraft,
} from "./types";

// "Banco local": Context + localStorage. Mesma forma de uma API real
// (list/get/create/update/remove), pra trocar por fetch() depois ser
// mecânico — ver prisma/schema.prisma pro desenho do banco de verdade.

const STORAGE_KEYS = {
  agency: "cotation:agency",
  clients: "cotation:clients",
  quotes: "cotation:quotes",
  team: "cotation:team",
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
  deleteClient: (id: string) => void;

  teamMembers: TeamMember[];
  getTeamMember: (id: string) => TeamMember | undefined;
  createTeamMember: (draft: TeamMemberDraft) => TeamMember;
  updateTeamMember: (id: string, patch: Partial<TeamMemberDraft>) => void;
  deleteTeamMember: (id: string) => void;

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
  const [quotes, setQuotes] = useState<Quote[]>([]);

  // Hidrata do localStorage só no client, depois do primeiro render, pra
  // não dar mismatch de SSR (o servidor sempre renderiza os defaults).
  // localStorage não é um estado derivado de props/state — é a única forma
  // de trazer esse valor externo pro React nesse momento, por isso o
  // set-state aqui é intencional (eslint-plugin-react-hooks trata isso como
  // suspeito de cascata de renders, mas não há alternativa sem essa leitura
  // síncrona pontual no mount).
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setAgency(readStorage(STORAGE_KEYS.agency, defaultAgencySettings));
    setClients(readStorage(STORAGE_KEYS.clients, []));
    setTeamMembers(readStorage(STORAGE_KEYS.team, []));
    setQuotes(readStorage(STORAGE_KEYS.quotes, []));
    setHydrated(true);
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
    return client;
  }, []);

  const updateClient = useCallback((id: string, patch: Partial<ClientDraft>) => {
    setClients((prev) => prev.map((c) => (c.id === id ? { ...c, ...patch } : c)));
  }, []);

  const deleteClient = useCallback((id: string) => {
    setClients((prev) => prev.filter((c) => c.id !== id));
  }, []);

  const getTeamMember = useCallback(
    (id: string) => teamMembers.find((m) => m.id === id),
    [teamMembers]
  );

  const createTeamMember = useCallback((draft: TeamMemberDraft) => {
    const member: TeamMember = { id: genId(), createdAt: new Date().toISOString(), ...draft };
    setTeamMembers((prev) => [member, ...prev]);
    return member;
  }, []);

  const updateTeamMember = useCallback((id: string, patch: Partial<TeamMemberDraft>) => {
    setTeamMembers((prev) => prev.map((m) => (m.id === id ? { ...m, ...patch } : m)));
  }, []);

  const deleteTeamMember = useCallback((id: string) => {
    setTeamMembers((prev) => prev.filter((m) => m.id !== id));
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
      deleteClient,
      teamMembers,
      getTeamMember,
      createTeamMember,
      updateTeamMember,
      deleteTeamMember,
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
      deleteClient,
      teamMembers,
      getTeamMember,
      createTeamMember,
      updateTeamMember,
      deleteTeamMember,
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
