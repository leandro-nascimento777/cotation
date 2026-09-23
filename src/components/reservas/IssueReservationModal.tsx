"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAppData } from "@/lib/store/AppDataContext";
import { Quote, ReservationDraft } from "@/lib/store/types";
import {
  X,
  UploadCloud,
  Sparkles,
  Loader2,
  CheckCircle2,
  ArrowRight,
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
  formaPagamento?: string;
  bilheteOriginal?: string;
  instrucoesEmbarque?: string;
  observacoes?: string;
}

interface IssueReservationModalProps {
  open: boolean;
  onClose: () => void;
  quote?: Quote;
  pendingIssuanceId?: string;
  initialCustomerName?: string;
  initialDestination?: string;
}

export function IssueReservationModal({
  open,
  onClose,
  quote,
  pendingIssuanceId,
  initialCustomerName = "",
  initialDestination = "",
}: IssueReservationModalProps) {
  const router = useRouter();
  const { createReservation, updateQuote, markIssuanceAsCompleted } = useAppData();

  const [inputMode, setInputMode] = useState<"file" | "text">("file");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [ticketText, setTicketText] = useState("");
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractionSuccess, setExtractionSuccess] = useState(false);

  const [draft, setDraft] = useState<ReservationDraft>({
    localizador: quote?.bookingRef || "",
    localizadorCia: "",
    numeroBilhete: "",
    status: "EMITIDA",
    clientId: quote?.clientId || null,
    quoteId: quote?.id || null,
    clienteNome: initialCustomerName || quote?.sellerName || "",
    clienteEmail: "",
    clienteTelefone: "",
    emissor: "Consolidadora",
    dataEmissao: new Date().toLocaleDateString("pt-BR"),
    formaPagamento: "Cartão / Faturamento",
    passageiros: [
      {
        id: "pax-1",
        nome: initialCustomerName || "Passageiro",
        tipo: "Adulto",
      },
    ],
    voos: [
      {
        id: "fl-1",
        trechoTipo: "IDA",
        ciaAerea: "",
        numeroVoo: "",
        origemCodigo: "",
        origemNome: "",
        destinoCodigo: "",
        destinoNome: initialDestination,
        dataPartida: "",
        horaPartida: "",
        dataChegada: "",
        horaChegada: "",
        classe: "Econômica",
        escalas: 0,
        bagagem: "1 bagagem despachada",
      },
    ],
    valorTarifa: quote?.valorTotal ? Math.round(quote.valorTotal * 0.85) : 0,
    valorTaxas: quote?.valorTotal ? Math.round(quote.valorTotal * 0.15) : 0,
    valorTotal: quote?.valorTotal || 0,
    moeda: "BRL",
    instrucoesEmbarque:
      "Apresente-se com 2h de antecedência em voos nacionais e 3h em internacionais. Apresente documento oficial com foto e visto se exigido.",
    observacoes: quote?.observacoes || "",
  });

  if (!open) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      setExtractionSuccess(false);
    }
  };

  const handleExtract = async () => {
    if (inputMode === "file" && !selectedFile) {
      toast.error("Selecione o arquivo PDF ou imagem do bilhete emitido.");
      return;
    }
    if (inputMode === "text" && !ticketText.trim()) {
      toast.error("Cole o texto do e-ticket emitido para extrair.");
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

      const mappedPax = (data.passageiros || []).map((p, i) => ({
        id: `pax-${Date.now()}-${i}`,
        nome: p.nome,
        tipo: p.tipo,
        documento: p.documento,
        bilheteNumero: p.bilheteNumero || data.numeroBilhete,
      }));

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
        localizadorCia: data.voos?.[0]?.localizadorCia || prev.localizadorCia,
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
        formaPagamento: data.formaPagamento || prev.formaPagamento,
        bilheteOriginal: data.bilheteOriginal || prev.bilheteOriginal,
        instrucoesEmbarque: data.instrucoesEmbarque || prev.instrucoesEmbarque,
        observacoes: data.observacoes || prev.observacoes,
      }));

      setExtractionSuccess(true);
      toast.success("E-ticket extraído com sucesso!");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Erro ao extrair bilhete.";
      toast.error(msg);
    } finally {
      setIsExtracting(false);
    }
  };

  const handleConfirmIssue = () => {
    if (!draft.localizador.trim()) {
      toast.error("Informe o localizador da reserva (PNR).");
      return;
    }
    if (!draft.clienteNome.trim()) {
      toast.error("Informe o nome do passageiro.");
      return;
    }

    const created = createReservation({
      ...draft,
      status: "EMITIDA",
    });

    if (quote) {
      updateQuote(quote.id, {
        saleClosed: true,
        bookingRef: draft.localizador,
      });
    }

    if (pendingIssuanceId) {
      markIssuanceAsCompleted(pendingIssuanceId);
    }

    toast.success("Reserva emitida e voucher gerado!");
    onClose();
    router.push(`/reservas/${created.id}`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 p-3 sm:p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative flex max-h-[92vh] w-full max-w-2xl flex-col rounded-3xl border border-slate-200 bg-white shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Emitir Reserva e Gerar Voucher</h2>
            <p className="text-xs text-slate-500">
              {quote ? `Vinculado à Cotação #${quote.numero}` : "Envie o e-ticket para gerar o voucher oficial"}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Corpo Scrollável */}
        <div className="overflow-y-auto p-6 space-y-6">
          {/* Card de Importação */}
          <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Sparkles className="h-4 w-4 text-teal-600" /> Upload do E-ticket (PDF / Print / Texto)
              </span>
              <div className="flex rounded-lg border border-slate-200 bg-white p-0.5 text-[11px] font-semibold">
                <button
                  type="button"
                  onClick={() => setInputMode("file")}
                  className={`rounded-md px-2.5 py-0.5 transition cursor-pointer ${
                    inputMode === "file" ? "bg-teal-50 text-teal-700 font-bold" : "text-slate-500"
                  }`}
                >
                  Arquivo
                </button>
                <button
                  type="button"
                  onClick={() => setInputMode("text")}
                  className={`rounded-md px-2.5 py-0.5 transition cursor-pointer ${
                    inputMode === "text" ? "bg-teal-50 text-teal-700 font-bold" : "text-slate-500"
                  }`}
                >
                  Texto
                </button>
              </div>
            </div>

            {inputMode === "file" ? (
              <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white p-5 text-center">
                <UploadCloud className="h-8 w-8 text-slate-400 mb-1" />
                <p className="text-xs font-bold text-slate-800">
                  {selectedFile ? selectedFile.name : "Selecione o PDF ou imagem do e-ticket"}
                </p>
                <label className="mt-2 cursor-pointer rounded-full bg-slate-900 px-4 py-1.5 text-xs font-bold text-white hover:bg-slate-800 transition">
                  {selectedFile ? "Trocar arquivo" : "Procurar PDF"}
                  <input type="file" accept=".pdf,image/*" onChange={handleFileChange} className="hidden" />
                </label>
              </div>
            ) : (
              <textarea
                rows={4}
                value={ticketText}
                onChange={(e) => setTicketText(e.target.value)}
                placeholder="Cole o texto do e-ticket da consolidadora..."
                className="w-full rounded-xl border border-slate-300 p-3 text-xs font-mono bg-white focus:border-teal-500 focus:outline-none"
              />
            )}

            <button
              type="button"
              onClick={handleExtract}
              disabled={isExtracting || (inputMode === "file" && !selectedFile) || (inputMode === "text" && !ticketText.trim())}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-teal-600 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-teal-700 transition disabled:opacity-50 cursor-pointer"
            >
              {isExtracting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Extraindo dados com IA...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" /> Extrair e Preencher Dados Automaticamente
                </>
              )}
            </button>

            {extractionSuccess && (
              <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 py-1.5 rounded-lg border border-emerald-200">
                <CheckCircle2 className="h-4 w-4" /> Dados extraídos com sucesso! Revise os campos abaixo.
              </div>
            )}
          </div>

          {/* Campos Principais */}
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-[11px] font-bold text-slate-700 uppercase block mb-1">
                  Localizador PNR (GDS) *
                </label>
                <input
                  type="text"
                  value={draft.localizador}
                  onChange={(e) => setDraft((p) => ({ ...p, localizador: e.target.value.toUpperCase() }))}
                  placeholder="ANRXK4"
                  className="w-full rounded-xl border border-slate-300 p-2 font-mono text-sm font-black text-[#5E17EB] uppercase focus:border-teal-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 uppercase block mb-1">
                  Loc Cia (Check-in)
                </label>
                <input
                  type="text"
                  value={draft.localizadorCia || ""}
                  onChange={(e) => setDraft((p) => ({ ...p, localizadorCia: e.target.value.toUpperCase() }))}
                  placeholder="NXPLPM"
                  className="w-full rounded-xl border border-slate-300 p-2 font-mono text-sm font-black text-emerald-700 uppercase focus:border-teal-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 uppercase block mb-1">
                  Nº do Bilhete
                </label>
                <input
                  type="text"
                  value={draft.numeroBilhete || ""}
                  onChange={(e) => setDraft((p) => ({ ...p, numeroBilhete: e.target.value }))}
                  placeholder="001 4894551527 /28"
                  className="w-full rounded-xl border border-slate-300 p-2 text-xs font-semibold text-slate-800 focus:border-teal-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-bold text-slate-700 uppercase block mb-1">
                  Passageiro Principal *
                </label>
                <input
                  type="text"
                  value={draft.clienteNome}
                  onChange={(e) => setDraft((p) => ({ ...p, clienteNome: e.target.value }))}
                  placeholder="HUGO CORDEIRO"
                  className="w-full rounded-xl border border-slate-300 p-2 text-xs font-bold text-slate-900 focus:border-teal-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 uppercase block mb-1">
                  Emissor / Consolidadora
                </label>
                <input
                  type="text"
                  value={draft.emissor || ""}
                  onChange={(e) => setDraft((p) => ({ ...p, emissor: e.target.value }))}
                  placeholder="SAKURA CONSOLIDADORA"
                  className="w-full rounded-xl border border-slate-300 p-2 text-xs text-slate-800 focus:border-teal-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Resumo dos Voos */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <span className="text-xs font-bold text-slate-700 uppercase block">
                Trechos de Voo ({draft.voos.length})
              </span>
              <div className="space-y-2">
                {draft.voos.map((voo, idx) => (
                  <div key={idx} className="flex items-center justify-between bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-800">{voo.origemCodigo} ➔ {voo.destinoCodigo}</span>
                      <span className="text-slate-500 font-mono">({voo.numeroVoo})</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-slate-600 font-medium">{voo.dataPartida} {voo.horaPartida}</span>
                      {voo.assento && (
                        <span className="rounded bg-purple-100 px-2 py-0.5 font-bold text-[#5E17EB]">
                          Assento {voo.assento}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Footer com botão de ação */}
        <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50 px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="text-xs font-semibold text-slate-500 hover:text-slate-800 transition cursor-pointer"
          >
            Cancelar
          </button>

          <button
            type="button"
            onClick={handleConfirmIssue}
            className="flex items-center gap-2 rounded-full bg-teal-600 px-6 py-2.5 text-xs font-bold text-white shadow-md hover:bg-teal-700 transition cursor-pointer"
          >
            Salvar Reserva e Gerar Voucher <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
