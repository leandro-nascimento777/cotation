"use client";

import { use, useState } from "react";
import Link from "next/link";
import { useAppData } from "@/lib/store/AppDataContext";
import { LoadingState } from "@/components/shell/LoadingState";
import { AirlineLogo } from "@/components/ui/AirlineLogo";
import { WorldMapWatermark } from "@/components/proposal/WorldMapWatermark";
import { formatCurrencyBRL, formatWhatsAppLink } from "@/lib/format";
import {
  ArrowLeft,
  Printer,
  MessageCircle,
  Copy,
  Check,
  Luggage,
  ShieldCheck,
  AlertCircle,
  Armchair,
  Share2,
  Plane,
  Receipt,
} from "lucide-react";
import { toast } from "sonner";

interface ReservationDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function ReservationDetailPage({ params }: ReservationDetailPageProps) {
  const { id } = use(params);
  const { getReservation, agency, hydrated } = useAppData();
  const [copiedPnr, setCopiedPnr] = useState(false);
  const [copiedLocCia, setCopiedLocCia] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const reservation = getReservation(id);

  if (!hydrated) {
    return <LoadingState />;
  }

  if (!reservation) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-4">
        <AlertCircle className="h-12 w-12 text-slate-400" />
        <h2 className="text-xl font-bold text-slate-800">Reserva não encontrada</h2>
        <p className="text-xs text-slate-500 max-w-sm">
          A reserva solicitada não existe ou foi removida do sistema.
        </p>
        <Link
          href="/reservas"
          className="rounded-full bg-teal-600 px-6 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-teal-700"
        >
          Voltar para Reservas
        </Link>
      </div>
    );
  }

  const primaryFlight = reservation.voos[0];
  const lastFlight = reservation.voos[reservation.voos.length - 1];
  const locCia = reservation.localizadorCia || primaryFlight?.localizadorCia;

  const handleCopyPnr = () => {
    navigator.clipboard.writeText(reservation.localizador);
    setCopiedPnr(true);
    toast.success("Localizador da reserva copiado!");
    setTimeout(() => setCopiedPnr(false), 2000);
  };

  const handleCopyLocCia = () => {
    if (!locCia) return;
    navigator.clipboard.writeText(locCia);
    setCopiedLocCia(true);
    toast.success("Loc Cia Aérea copiado!");
    setTimeout(() => setCopiedLocCia(false), 2000);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    toast.success("Link do voucher copiado!");
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  // Monta texto formatado para envio no WhatsApp
  const whatsappText = `✈️ *SUA RESERVA ESTÁ CONFIRMADA!*

Olá, *${reservation.clienteNome}*!
Seu bilhete aéreo foi emitido com sucesso pela *${agency.agencyName || "nossa agência"}*.

📋 *Localizador Reserva (GDS):* ${reservation.localizador}
${locCia ? `🏢 *Loc Cia Aérea (Check-in):* ${locCia}\n` : ""}${reservation.numeroBilhete ? `🎫 *Nº do Bilhete:* ${reservation.numeroBilhete}\n` : ""}${reservation.emissor ? `🏢 *Emissor:* ${reservation.emissor}\n` : ""}
✈️ *ITINERÁRIO DOS VOOS:*
${reservation.voos
  .map(
    (v, i) =>
      `• *Trecho ${i + 1}:* ${v.origemCodigo} ➔ ${v.destinoCodigo} (${v.ciaAerea} ${v.numeroVoo})
  Data: ${v.dataPartida} às ${v.horaPartida} ${v.assento ? `| Assento: ${v.assento}` : ""}`
  )
  .join("\n\n")}

🎒 *Bagagem:* ${primaryFlight?.bagagem || "Consulte as regras da tarifa"}

⚠️ *Apresente-se com antecedência:*
• Voos nacionais: 2 horas antes
• Voos internacionais: 3 horas antes

Qualquer dúvida estamos à disposição!
*${agency.agencyName || "Sua Agência de Viagens"}*
${agency.phone ? `WhatsApp: ${agency.phone}` : ""}`;

  const waLink = reservation.clienteTelefone
    ? formatWhatsAppLink(reservation.clienteTelefone, whatsappText)
    : `https://wa.me/?text=${encodeURIComponent(whatsappText)}`;

  const primaryColor = agency.pdfCorPrimaria || "#5E17EB";
  const secondaryColor = agency.pdfCorSecundaria || "#00875A";

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 space-y-6 pb-20">
      {/* Barra de Ações Superior (Oculta na impressão) */}
      <div className="print:hidden flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <Link
          href="/reservas"
          className="flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 transition cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" /> Voltar para Reservas
        </Link>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleCopyLink}
            className="flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
          >
            {copiedLink ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Share2 className="h-3.5 w-3.5" />}
            Copiar Link
          </button>

          {waLink ? (
            <a
              href={waLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 rounded-full bg-[#25D366] px-4 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-[#20ba59] transition cursor-pointer"
            >
              <MessageCircle className="h-4 w-4" /> Enviar no WhatsApp
            </a>
          ) : null}

          <button
            type="button"
            onClick={handlePrint}
            className="flex items-center gap-1.5 rounded-full bg-slate-900 px-4 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-slate-800 transition cursor-pointer"
          >
            <Printer className="h-4 w-4" /> Imprimir / Salvar PDF
          </button>
        </div>
      </div>

      {/* DOCUMENTO DO VOUCHER DA AGÊNCIA (Área de Impressão) */}
      <div className="w-full bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden print:border-none print:shadow-none print:m-0 print:p-0">
        {/* Cabeçalho da Agência */}
        <div
          className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b-2 bg-white p-6 sm:p-8"
          style={{ borderBottomColor: primaryColor }}
        >
          <div className="flex items-center gap-4">
            {agency.logoDataUrl ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={agency.logoDataUrl}
                alt={agency.agencyName}
                className="max-h-14 max-w-[180px] object-contain"
              />
            ) : (
              <div
                className="flex h-12 w-12 items-center justify-center rounded-2xl text-white font-black text-xl shadow-md"
                style={{ backgroundColor: primaryColor }}
              >
                ✈
              </div>
            )}
            <div>
              <h1 className="text-lg sm:text-xl font-black tracking-tight text-slate-900 uppercase">
                {agency.agencyName || "Sua Agência de Viagens"}
              </h1>
              <p className="text-xs text-slate-500">
                {[agency.cnpj && `CNPJ: ${agency.cnpj}`, agency.cadastur && `Cadastur: ${agency.cadastur}`]
                  .filter(Boolean)
                  .join(" · ")}
              </p>
              <p className="text-xs text-slate-500">
                {[agency.phone, agency.email].filter(Boolean).join(" · ")}
              </p>
            </div>
          </div>

          <div className="text-center sm:text-right">
            <span
              className="inline-block rounded-full px-3 py-1 text-xs font-black uppercase tracking-wider border"
              style={{
                backgroundColor: `${secondaryColor}15`,
                color: secondaryColor,
                borderColor: `${secondaryColor}40`,
              }}
            >
              Voucher Eletrônico de Viagem
            </span>
            <p className="text-xs text-slate-400 mt-1">
              Emitido em: <strong className="text-slate-700">{reservation.dataEmissao || new Date().toLocaleDateString("pt-BR")}</strong>
            </p>
          </div>
        </div>

        {/* Banner de Bilhete Confirmado (Estilo Boarding Pass) */}
        <div
          className="relative p-6 sm:p-8 text-white space-y-6"
          style={{ backgroundColor: primaryColor }}
        >
          <WorldMapWatermark />

          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-1 text-center md:text-left">
              <span className="text-xs font-bold uppercase tracking-widest text-white/80">
                Reserva Confirmada • E-ticket
              </span>
              <p className="text-2xl sm:text-3xl font-black tracking-tight">
                {primaryFlight?.origemCodigo} ➔ {lastFlight?.destinoCodigo}
              </p>
              <p className="text-xs text-white/80">
                Passageiro: <strong>{reservation.clienteNome}</strong>
                {reservation.numeroBilhete && ` · Bilhete: ${reservation.numeroBilhete}`}
              </p>
            </div>

            {/* Caixas de Destaque: PNR e Loc Cia */}
            <div className="flex flex-wrap items-center justify-center md:justify-end gap-3">
              {/* Localizador da Reserva (GDS) */}
              <div className="rounded-2xl border-2 border-white/30 bg-white/10 p-3.5 text-center backdrop-blur-md min-w-[160px]">
                <span className="block text-[10px] font-bold uppercase tracking-widest text-white/80">
                  Localizador Reserva (GDS)
                </span>
                <div className="flex items-center justify-center gap-1.5 mt-1">
                  <span className="font-mono text-2xl font-black tracking-wider text-white">
                    {reservation.localizador}
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyPnr}
                    className="print:hidden rounded-lg bg-white/20 p-1 text-white hover:bg-white/30 transition cursor-pointer"
                    title="Copiar localizador GDS"
                  >
                    {copiedPnr ? <Check className="h-3.5 w-3.5 text-emerald-300" /> : <Copy className="h-3.5 w-3.5" />}
                  </button>
                </div>
                <span className="mt-0.5 block text-[9px] font-medium text-white/80">
                  {reservation.emissor || "Consolidadora"}
                </span>
              </div>

              {/* Loc Cia (Companhia Aérea para Check-in) */}
              {locCia && (
                <div
                  className="rounded-2xl border-2 p-3.5 text-center backdrop-blur-md min-w-[170px]"
                  style={{
                    borderColor: secondaryColor,
                    backgroundColor: "rgba(0,0,0,0.35)",
                  }}
                >
                  <span
                    className="block text-[10px] font-bold uppercase tracking-widest"
                    style={{ color: secondaryColor }}
                  >
                    Loc Cia Aérea (Check-in)
                  </span>
                  <div className="flex items-center justify-center gap-1.5 mt-1">
                    <span
                      className="font-mono text-2xl font-black tracking-wider"
                      style={{ color: secondaryColor }}
                    >
                      {locCia}
                    </span>
                    <button
                      type="button"
                      onClick={handleCopyLocCia}
                      className="print:hidden rounded-lg bg-white/20 p-1 text-white hover:bg-white/30 transition cursor-pointer"
                      title="Copiar Loc Cia"
                    >
                      {copiedLocCia ? <Check className="h-3.5 w-3.5 text-emerald-300" /> : <Copy className="h-3.5 w-3.5" />}
                    </button>
                  </div>
                  <span className="mt-0.5 block text-[9px] font-bold text-white/80 uppercase">
                    {primaryFlight?.ciaAerea || "Cia Aérea"}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="p-6 sm:p-8 space-y-8 bg-white">
          {/* Seção Passageiros e Assentos */}
          <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-5 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Passageiro(s) e Assentos Confirmados
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {reservation.passageiros.map((pax) => (
                <div key={pax.id} className="rounded-xl border border-slate-200 bg-white p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-bold text-slate-900 text-sm">{pax.nome}</p>
                      <span className="text-[11px] text-slate-500">{pax.tipo || "Adulto"}</span>
                    </div>
                    {pax.bilheteNumero && (
                      <span className="text-[10px] font-mono font-bold bg-slate-100 px-2 py-0.5 rounded text-slate-600">
                        {pax.bilheteNumero}
                      </span>
                    )}
                  </div>

                  {pax.assentos && pax.assentos.length > 0 && (
                    <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center gap-2">
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Assentos:</span>
                      {pax.assentos.map((ast, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center gap-1 rounded-md bg-purple-50 px-2 py-0.5 text-xs font-bold text-[#5E17EB] border border-purple-200/60"
                        >
                          <Armchair className="h-3 w-3" /> {ast.trecho}: <strong>{ast.assento}</strong>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Seção Itinerário Completo dos Voos */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide flex items-center gap-2">
                <Plane className="h-4 w-4 text-teal-600" /> Detalhes dos Voos
              </h3>
              <span className="text-xs text-slate-400 font-semibold">{reservation.voos.length} trecho(s)</span>
            </div>

            <div className="space-y-4">
              {reservation.voos.map((voo, idx) => (
                <div
                  key={voo.id}
                  className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4 hover:border-slate-300 transition"
                >
                  {/* Linha Cia e Voo */}
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2.5">
                      <AirlineLogo airline={voo.ciaAerea} className="h-6 w-6 object-contain" />
                      <div>
                        <span className="font-bold text-slate-900 text-sm">{voo.ciaAerea}</span>
                        <span className="ml-2 font-mono text-xs font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                          {voo.numeroVoo}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-xs">
                      {voo.classe && (
                        <span className="rounded bg-slate-100 px-2 py-0.5 font-medium text-slate-600">
                          Classe: <strong>{voo.classe}</strong>
                        </span>
                      )}
                      {voo.aeronave && (
                        <span className="rounded bg-slate-100 px-2 py-0.5 font-medium text-slate-600">
                          Aeronave: {voo.aeronave}
                        </span>
                      )}
                      {voo.assento && (
                        <span className="rounded bg-purple-50 px-2.5 py-0.5 font-bold text-[#5E17EB] border border-purple-200 flex items-center gap-1">
                          <Armchair className="h-3 w-3" /> Assento: {voo.assento}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Grid Horários e Trajeto */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                    <div className="space-y-1">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Embarque / Saída</span>
                      <p className="text-2xl font-black text-slate-900 leading-none">{voo.horaPartida}</p>
                      <p className="text-xs font-bold text-slate-800">{voo.dataPartida}</p>
                      <p className="text-xs text-slate-600 font-medium">
                        <strong>{voo.origemCodigo}</strong> — {voo.origemNome}
                      </p>
                      {voo.origemTerminal && (
                        <span className="inline-block text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                          {voo.origemTerminal}
                        </span>
                      )}
                    </div>

                    <div className="flex flex-col items-center justify-center text-center space-y-1 py-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        {voo.escalas === 0 ? "Voo Direto" : `${voo.escalas} Parada(s)`}
                      </span>
                      <div className="flex items-center gap-2 text-teal-600 w-full max-w-[140px]">
                        <div className="h-0.5 bg-teal-200 flex-1" />
                        <Plane className="h-4 w-4 shrink-0" />
                        <div className="h-0.5 bg-teal-200 flex-1" />
                      </div>
                      <span className="text-[11px] text-slate-500 font-medium">Trecho {idx + 1}</span>
                    </div>

                    <div className="space-y-1 md:text-right">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Desembarque</span>
                      <p className="text-2xl font-black text-slate-900 leading-none">{voo.horaChegada}</p>
                      <p className="text-xs font-bold text-slate-800">{voo.dataChegada}</p>
                      <p className="text-xs text-slate-600 font-medium">
                        <strong>{voo.destinoCodigo}</strong> — {voo.destinoNome}
                      </p>
                      {voo.destinoTerminal && (
                        <span className="inline-block text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                          {voo.destinoTerminal}
                        </span>
                      )}
                    </div>
                  </div>

                  {voo.bagagem && (
                    <div className="pt-2 border-t border-slate-100 flex items-center gap-2 text-xs text-teal-800 bg-teal-50/60 p-2.5 rounded-xl">
                      <Luggage className="h-4 w-4 shrink-0 text-teal-600" />
                      <span>
                        <strong>Franquia de Bagagem:</strong> {voo.bagagem}
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Regras e Instruções para Embarque */}
          <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-5 space-y-4 text-xs">
            <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-teal-600" /> Instruções Importantes para o Embarque
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-slate-600 leading-relaxed">
              <div className="space-y-2">
                <p>
                  <strong>⏰ Horário de Apresentação:</strong> Compareça ao balcão de check-in da companhia com <strong>2 horas de antecedência</strong> para voos nacionais e <strong>3 horas</strong> para voos internacionais.
                </p>
                <p>
                  <strong>🪪 Documentos Obrigatórios:</strong> Apresente documento oficial com foto (RG para voos nacionais; Passaporte válido e vistos exigidos para voos internacionais).
                </p>
              </div>

              <div className="space-y-2">
                <p>
                  <strong>🛂 Validade do Passaporte:</strong> Para destinos internacionais, certifique-se de que o passaporte possua validade mínima de 6 meses além da data prevista de retorno.
                </p>
                <p>
                  <strong>⚠️ No-show e Alterações:</strong> O não comparecimento para o primeiro trecho cancela automaticamente os voos subsequentes. Alterações estão sujeitas às regras da companhia aérea.
                </p>
              </div>
            </div>

            {reservation.observacoes && (
              <div className="pt-2 border-t border-slate-200 text-slate-500 text-[11px]">
                <strong>Observações adicionais:</strong> {reservation.observacoes}
              </div>
            )}
          </div>

          {/* Seção Tarifamento e Pagamento (como no e-ticket de referência) */}
          <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-5 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-200/80 pb-2">
              <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Receipt className="h-4 w-4 text-teal-600" /> Tarifamento e Pagamento do Bilhete
              </h4>
              <span className="text-[11px] font-bold text-slate-400 uppercase">Valores em Reais (BRL)</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
              <div>
                <span className="text-slate-400 block font-medium">Tarifa Base</span>
                <p className="font-bold text-slate-800 text-sm">
                  {reservation.valorTarifa ? formatCurrencyBRL(reservation.valorTarifa) : "—"}
                </p>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">Taxas de Embarque</span>
                <p className="font-bold text-slate-800 text-sm">
                  {reservation.valorTaxas ? formatCurrencyBRL(reservation.valorTaxas) : "—"}
                </p>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">Taxa de Serviço / DU</span>
                <p className="font-bold text-slate-800 text-sm">
                  {reservation.taxaServico !== undefined ? formatCurrencyBRL(reservation.taxaServico) : "R$ 0,00"}
                </p>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">Total Pago</span>
                <p className="font-black text-base text-teal-700">
                  {reservation.valorTotal ? formatCurrencyBRL(reservation.valorTotal) : "—"}
                </p>
              </div>
            </div>

            {(reservation.formaPagamento || reservation.bilheteOriginal) && (
              <div className="pt-2 border-t border-slate-200/80 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-600">
                {reservation.formaPagamento && (
                  <div>
                    Forma de Pagamento:{" "}
                    <strong className="text-slate-800">{reservation.formaPagamento}</strong>
                  </div>
                )}
                {reservation.bilheteOriginal && (
                  <div>
                    Bilhete Original:{" "}
                    <strong className="font-mono text-slate-800">{reservation.bilheteOriginal}</strong>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Rodapé Oficial da Agência */}
          <div className="text-center pt-4 border-t border-slate-200 text-xs text-slate-400 space-y-1">
            <p className="font-bold text-slate-600">
              {agency.agencyName || "Sua Agência de Viagens"} · Suporte e Atendimento
            </p>
            <p>
              {[agency.phone && `Telefone/WhatsApp: ${agency.phone}`, agency.email && `E-mail: ${agency.email}`, agency.site && `Site: ${agency.site}`]
                .filter(Boolean)
                .join(" · ")}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
