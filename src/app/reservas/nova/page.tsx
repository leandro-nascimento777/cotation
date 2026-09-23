"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAppData } from "@/lib/store/AppDataContext";
import { PageHeader } from "@/components/shell/PageHeader";
import { LoadingState } from "@/components/shell/LoadingState";
import { ReservationDraft, ReservationStatus } from "@/lib/store/types";
import {
  UploadCloud,
  Sparkles,
  Loader2,
  CheckCircle2,
  ArrowRight,
  Plane,
  Plus,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";

interface ExtractedPassenger {
  nome: string;
  tipo?: string;
  documento?: string;
  bilheteNumero?: string;
}

interface ExtractedFlight {
  trechoTipo?: "IDA" | "VOLTA" | "INTERNO";
  ciaAerea: string;
  numeroVoo: string;
  origemCodigo: string;
  origemNome: string;
  origemTerminal?: string;
  destinoCodigo: string;
  destinoNome: string;
  destinoTerminal?: string;
  dataPartida: string;
  horaPartida: string;
  dataChegada: string;
  horaChegada: string;
  classe?: string;
  escalas?: number;
  aeronave?: string;
  localizadorCia?: string;
  baseTarifaria?: string;
  bagagem?: string;
  assento?: string;
}

interface ExtractedTicketData {
  localizador?: string;
  numeroBilhete?: string;
  clienteNome?: string;
  clienteEmail?: string;
  clienteTelefone?: string;
  emissor?: string;
  dataEmissao?: string;
  passageiros?: ExtractedPassenger[];
  voos?: ExtractedFlight[];
  valorTarifa?: number;
  valorTaxas?: number;
  valorTotal?: number;
  instrucoesEmbarque?: string;
  observacoes?: string;
}

export default function NewReservationPage() {
  const router = useRouter();
  const { createReservation, clients, hydrated } = useAppData();

  const [inputMode, setInputMode] = useState<"file" | "text">("file");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [ticketText, setTicketText] = useState("");
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractionSuccess, setExtractionSuccess] = useState(false);

  const [draft, setDraft] = useState<ReservationDraft>({
    localizador: "",
    numeroBilhete: "",
    status: "CONFIRMADA",
    clientId: null,
    clienteNome: "",
    clienteEmail: "",
    clienteTelefone: "",
    emissor: "",
    dataEmissao: new Date().toLocaleDateString("pt-BR"),
    passageiros: [
      {
        id: "pax-1",
        nome: "",
        tipo: "Adulto",
      },
    ],
    voos: [
      {
        id: "flight-1",
        trechoTipo: "IDA",
        ciaAerea: "",
        numeroVoo: "",
        origemCodigo: "",
        origemNome: "",
        destinoCodigo: "",
        destinoNome: "",
        dataPartida: "",
        horaPartida: "",
        dataChegada: "",
        horaChegada: "",
        classe: "Econômica",
        escalas: 0,
        bagagem: "1 bagagem de mão + mochila",
      },
    ],
    valorTarifa: 0,
    valorTaxas: 0,
    valorTotal: 0,
    moeda: "BRL",
    instrucoesEmbarque:
      "Apresente-se com antecedência de 2 horas para voos nacionais e 3 horas para voos internacionais. Leve documento original válido.",
    observacoes: "",
  });

  if (!hydrated) {
    return <LoadingState />;
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      setExtractionSuccess(false);
    }
  };

  const handleExtract = async () => {
    if (inputMode === "file" && !selectedFile) {
      toast.error("Selecione um arquivo PDF ou imagem do bilhete.");
      return;
    }
    if (inputMode === "text" && !ticketText.trim()) {
      toast.error("Cole o texto do e-ticket para extrair.");
      return;
    }

    setIsExtracting(true);
    try {
      let payload: { fileBase64?: string; mimeType?: string; text?: string } = {};

      if (inputMode === "file" && selectedFile) {
        const arrayBuffer = await selectedFile.arrayBuffer();
        const base64 = Buffer.from(arrayBuffer).toString("base64");
        payload = {
          fileBase64: base64,
          mimeType: selectedFile.type || "application/pdf",
        };
      } else {
        payload = { text: ticketText };
      }

      const res = await fetch("/api/extract-ticket", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!res.ok || !json.ok) {
        throw new Error(json.error || "Falha na extração.");
      }

      const data: ExtractedTicketData = json.data;

      // Mapeia passageiros
      const mappedPax = (data.passageiros || []).map((p, i) => ({
        id: `pax-${Date.now()}-${i}`,
        nome: p.nome,
        tipo: p.tipo,
        documento: p.documento,
        bilheteNumero: p.bilheteNumero || data.numeroBilhete,
      }));

      // Mapeia voos
      const mappedFlights = (data.voos || []).map((v, i) => ({
        id: `fl-${Date.now()}-${i}`,
        trechoTipo: v.trechoTipo || (i === 0 ? "IDA" : i === (data.voos?.length || 1) - 1 ? "VOLTA" : "INTERNO"),
        ciaAerea: v.ciaAerea,
        numeroVoo: v.numeroVoo,
        origemCodigo: v.origemCodigo,
        origemNome: v.origemNome,
        origemTerminal: v.origemTerminal,
        destinoCodigo: v.destinoCodigo,
        destinoNome: v.destinoNome,
        destinoTerminal: v.destinoTerminal,
        dataPartida: v.dataPartida,
        horaPartida: v.horaPartida,
        dataChegada: v.dataChegada,
        horaChegada: v.horaChegada,
        classe: v.classe,
        escalas: v.escalas || 0,
        aeronave: v.aeronave,
        localizadorCia: v.localizadorCia,
        baseTarifaria: v.baseTarifaria,
        bagagem: v.bagagem,
        assento: v.assento,
      }));

      setDraft((prev) => ({
        ...prev,
        localizador: data.localizador || prev.localizador,
        numeroBilhete: data.numeroBilhete || prev.numeroBilhete,
        clienteNome: data.clienteNome || prev.clienteNome,
        clienteEmail: data.clienteEmail || prev.clienteEmail,
        clienteTelefone: data.clienteTelefone || prev.clienteTelefone,
        emissor: data.emissor || prev.emissor,
        dataEmissao: data.dataEmissao || prev.dataEmissao,
        passageiros: mappedPax.length > 0 ? mappedPax : prev.passageiros,
        voos: mappedFlights.length > 0 ? mappedFlights : prev.voos,
        valorTarifa: data.valorTarifa ?? prev.valorTarifa,
        valorTaxas: data.valorTaxas ?? prev.valorTaxas,
        valorTotal: data.valorTotal ?? prev.valorTotal,
        instrucoesEmbarque: data.instrucoesEmbarque || prev.instrucoesEmbarque,
        observacoes: data.observacoes || prev.observacoes,
      }));

      setExtractionSuccess(true);
      toast.success("E-ticket extraído com sucesso! Revise os dados abaixo.");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Erro ao extrair bilhete.";
      toast.error(msg);
    } finally {
      setIsExtracting(false);
    }
  };

  const handleSave = () => {
    if (!draft.localizador.trim()) {
      toast.error("Informe o localizador da reserva (PNR).");
      return;
    }
    if (!draft.clienteNome.trim()) {
      toast.error("Informe o nome do passageiro.");
      return;
    }

    const created = createReservation(draft);
    toast.success("Reserva salva com sucesso!");
    router.push(`/reservas/${created.id}`);
  };

  return (
    <div className="space-y-6 pb-16">
      <PageHeader
        title="Nova Reserva"
        description="Envie o PDF do e-ticket (da consolidadora ou cia aérea) para extrair os dados e gerar o voucher oficial da agência."
      />

      <div className="w-full px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Card de Importação e Extração Inteligente */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-50 text-teal-700">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Extração Automática com IA</h2>
              <p className="text-xs text-slate-500">
                Suporta e-tickets em PDF da Sakura, Confiança, RexturAdvance, Ancoradouro ou cias aéreas
              </p>
            </div>
          </div>

          <div className="flex rounded-lg border border-slate-200 bg-slate-50 p-1 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setInputMode("file")}
              className={`rounded-md px-3 py-1 transition cursor-pointer ${
                inputMode === "file" ? "bg-white text-teal-700 shadow-sm" : "text-slate-500 hover:text-slate-800"
              }`}
            >
              Arquivo PDF / Imagem
            </button>
            <button
              type="button"
              onClick={() => setInputMode("text")}
              className={`rounded-md px-3 py-1 transition cursor-pointer ${
                inputMode === "text" ? "bg-white text-teal-700 shadow-sm" : "text-slate-500 hover:text-slate-800"
              }`}
            >
              Colar Texto
            </button>
          </div>
        </div>

        {inputMode === "file" ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50/50 p-8 text-center transition hover:bg-slate-50">
            <UploadCloud className="h-12 w-12 text-slate-400 mb-2 stroke-[1.5]" />
            <p className="text-sm font-bold text-slate-800 mb-1">
              {selectedFile ? selectedFile.name : "Arraste o PDF do e-ticket aqui"}
            </p>
            <p className="text-xs text-slate-500 mb-4">
              {selectedFile
                ? `${(selectedFile.size / 1024).toFixed(1)} KB pronto para extrair`
                : "Formatos suportados: PDF, PNG, JPG de até 15MB"}
            </p>

            <label className="cursor-pointer rounded-full bg-slate-900 px-6 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-slate-800 transition">
              {selectedFile ? "Trocar arquivo" : "Selecionar arquivo PDF"}
              <input
                type="file"
                accept=".pdf,image/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
          </div>
        ) : (
          <div>
            <textarea
              rows={6}
              value={ticketText}
              onChange={(e) => setTicketText(e.target.value)}
              placeholder="Cole aqui o texto copiado do e-mail do e-ticket da consolidadora..."
              className="w-full rounded-2xl border border-slate-300 p-4 text-xs font-mono text-slate-800 placeholder-slate-400 focus:border-teal-500 focus:outline-none"
            />
          </div>
        )}

        <div className="flex items-center justify-between pt-2">
          <button
            type="button"
            onClick={handleExtract}
            disabled={isExtracting || (inputMode === "file" && !selectedFile) || (inputMode === "text" && !ticketText.trim())}
            className="flex items-center gap-2 rounded-full bg-teal-600 px-7 py-3 text-sm font-bold text-white shadow-md hover:bg-teal-700 transition disabled:opacity-50 cursor-pointer"
          >
            {isExtracting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Extraindo dados do bilhete...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" /> Extrair dados do e-ticket com IA
              </>
            )}
          </button>

          {extractionSuccess && (
            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-200">
              <CheckCircle2 className="h-4 w-4" /> Dados extraídos com sucesso!
            </div>
          )}
        </div>
      </div>

      {/* Formulário de Detalhes da Reserva */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm space-y-6">
        <div className="border-b border-slate-100 pb-3">
          <h2 className="text-base font-bold text-slate-900">Dados da Reserva e Bilhete</h2>
          <p className="text-xs text-slate-500">Revise ou edite as informações que irão constar no voucher do cliente.</p>
        </div>

        {/* Localizador, Bilhete, Status e Emissor */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Localizador (PNR) *
            </label>
            <input
              type="text"
              value={draft.localizador}
              onChange={(e) => setDraft((p) => ({ ...p, localizador: e.target.value.toUpperCase() }))}
              placeholder="Ex: ANRXK4"
              className="w-full rounded-xl border border-slate-300 p-2.5 font-mono text-sm font-black text-[#5E17EB] uppercase focus:border-teal-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Número do Bilhete
            </label>
            <input
              type="text"
              value={draft.numeroBilhete || ""}
              onChange={(e) => setDraft((p) => ({ ...p, numeroBilhete: e.target.value }))}
              placeholder="Ex: 001 4894551527 /28"
              className="w-full rounded-xl border border-slate-300 p-2.5 text-sm font-semibold text-slate-800 focus:border-teal-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Status da Reserva
            </label>
            <select
              value={draft.status}
              onChange={(e) => setDraft((p) => ({ ...p, status: e.target.value as ReservationStatus }))}
              className="w-full rounded-xl border border-slate-300 p-2.5 text-sm font-semibold text-slate-800 focus:border-teal-500 focus:outline-none bg-white"
            >
              <option value="CONFIRMADA">CONFIRMADA</option>
              <option value="EMITIDA">EMITIDA</option>
              <option value="CANCELADA">CANCELADA</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Emissor / Consolidadora
            </label>
            <input
              type="text"
              value={draft.emissor || ""}
              onChange={(e) => setDraft((p) => ({ ...p, emissor: e.target.value }))}
              placeholder="Ex: SAKURA CONSOLIDADORA"
              className="w-full rounded-xl border border-slate-300 p-2.5 text-sm text-slate-800 focus:border-teal-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Cliente / Passageiro */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-slate-100">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Passageiro Principal *
            </label>
            <input
              type="text"
              value={draft.clienteNome}
              onChange={(e) => setDraft((p) => ({ ...p, clienteNome: e.target.value }))}
              placeholder="Ex: HUGO CORDEIRO"
              className="w-full rounded-xl border border-slate-300 p-2.5 text-sm font-bold text-slate-900 focus:border-teal-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Vincular a Cliente Cadastrado
            </label>
            <select
              value={draft.clientId || ""}
              onChange={(e) => {
                const val = e.target.value || null;
                const found = clients.find((c) => c.id === val);
                setDraft((p) => ({
                  ...p,
                  clientId: val,
                  clienteNome: found ? found.nomeCompleto : p.clienteNome,
                  clienteEmail: found?.email || p.clienteEmail,
                  clienteTelefone: found?.telefone || p.clienteTelefone,
                }));
              }}
              className="w-full rounded-xl border border-slate-300 p-2.5 text-sm text-slate-800 focus:border-teal-500 focus:outline-none bg-white"
            >
              <option value="">Nenhum (usar nome avulso)</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nomeCompleto} {c.cpf ? `(${c.cpf})` : ""}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Data de Emissão
            </label>
            <input
              type="text"
              value={draft.dataEmissao || ""}
              onChange={(e) => setDraft((p) => ({ ...p, dataEmissao: e.target.value }))}
              placeholder="Ex: 21/09/2026"
              className="w-full rounded-xl border border-slate-300 p-2.5 text-sm text-slate-800 focus:border-teal-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Itinerário de Voos */}
        <div className="pt-2 border-t border-slate-100 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <Plane className="h-4 w-4 text-teal-600" /> Itinerário de Voos ({draft.voos.length})
            </h3>
            <button
              type="button"
              onClick={() => {
                setDraft((p) => ({
                  ...p,
                  voos: [
                    ...p.voos,
                    {
                      id: `flight-${Date.now()}`,
                      trechoTipo: "INTERNO",
                      ciaAerea: "",
                      numeroVoo: "",
                      origemCodigo: "",
                      origemNome: "",
                      destinoCodigo: "",
                      destinoNome: "",
                      dataPartida: "",
                      horaPartida: "",
                      dataChegada: "",
                      horaChegada: "",
                      classe: "Econômica",
                      escalas: 0,
                      bagagem: "1 bagagem despachada",
                    },
                  ],
                }));
              }}
              className="text-xs font-bold text-teal-700 hover:text-teal-800 flex items-center gap-1 cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5" /> Adicionar trecho
            </button>
          </div>

          <div className="space-y-3">
            {draft.voos.map((voo, idx) => (
              <div key={voo.id} className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4 space-y-3">
                <div className="flex items-center justify-between text-xs border-b border-slate-200/80 pb-2">
                  <span className="font-bold text-slate-700 uppercase">Trecho {idx + 1} ({voo.trechoTipo})</span>
                  {draft.voos.length > 1 && (
                    <button
                      type="button"
                      onClick={() => setDraft((p) => ({ ...p, voos: p.voos.filter((_, i) => i !== idx) }))}
                      className="text-slate-400 hover:text-rose-600 transition cursor-pointer"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-6 gap-3 text-xs">
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Cia Aérea</label>
                    <input
                      type="text"
                      value={voo.ciaAerea}
                      onChange={(e) => {
                        const val = e.target.value;
                        setDraft((p) => ({
                          ...p,
                          voos: p.voos.map((v, i) => (i === idx ? { ...v, ciaAerea: val } : v)),
                        }));
                      }}
                      placeholder="Ex: American Airlines"
                      className="w-full rounded-lg border border-slate-300 p-2 text-xs bg-white focus:border-teal-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Nº Voo</label>
                    <input
                      type="text"
                      value={voo.numeroVoo}
                      onChange={(e) => {
                        const val = e.target.value;
                        setDraft((p) => ({
                          ...p,
                          voos: p.voos.map((v, i) => (i === idx ? { ...v, numeroVoo: val } : v)),
                        }));
                      }}
                      placeholder="Ex: AA 974"
                      className="w-full rounded-lg border border-slate-300 p-2 text-xs font-mono font-bold bg-white focus:border-teal-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Origem (IATA)</label>
                    <input
                      type="text"
                      value={voo.origemCodigo}
                      onChange={(e) => {
                        const val = e.target.value.toUpperCase();
                        setDraft((p) => ({
                          ...p,
                          voos: p.voos.map((v, i) => (i === idx ? { ...v, origemCodigo: val } : v)),
                        }));
                      }}
                      placeholder="GIG"
                      className="w-full rounded-lg border border-slate-300 p-2 text-xs font-bold bg-white focus:border-teal-500 focus:outline-none uppercase"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Partida</label>
                    <input
                      type="text"
                      value={`${voo.dataPartida} ${voo.horaPartida}`.trim()}
                      onChange={(e) => {
                        const [d, ...rest] = e.target.value.split(" ");
                        setDraft((p) => ({
                          ...p,
                          voos: p.voos.map((v, i) => (i === idx ? { ...v, dataPartida: d, horaPartida: rest.join(" ") } : v)),
                        }));
                      }}
                      placeholder="02 FEV 2027 23:00"
                      className="w-full rounded-lg border border-slate-300 p-2 text-xs bg-white focus:border-teal-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Destino (IATA)</label>
                    <input
                      type="text"
                      value={voo.destinoCodigo}
                      onChange={(e) => {
                        const val = e.target.value.toUpperCase();
                        setDraft((p) => ({
                          ...p,
                          voos: p.voos.map((v, i) => (i === idx ? { ...v, destinoCodigo: val } : v)),
                        }));
                      }}
                      placeholder="JFK"
                      className="w-full rounded-lg border border-slate-300 p-2 text-xs font-bold bg-white focus:border-teal-500 focus:outline-none uppercase"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Assento</label>
                    <input
                      type="text"
                      value={voo.assento || ""}
                      onChange={(e) => {
                        const val = e.target.value.toUpperCase();
                        setDraft((p) => ({
                          ...p,
                          voos: p.voos.map((v, i) => (i === idx ? { ...v, assento: val } : v)),
                        }));
                      }}
                      placeholder="Ex: 23B"
                      className="w-full rounded-lg border border-slate-300 p-2 text-xs font-bold text-[#5E17EB] bg-white focus:border-teal-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Botão Salvar */}
        <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={handleSave}
            className="flex items-center gap-2 rounded-full bg-teal-600 px-8 py-3 text-sm font-bold text-white shadow-md hover:bg-teal-700 transition cursor-pointer"
          >
            Salvar Reserva e Gerar Voucher da Agência <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
      </div>
    </div>
  );
}
