"use client";

import { useRef, useState } from "react";
import { toast } from "sonner";
import { saveProposalShare, uploadCoverImage } from "@/lib/proposal/actions";
import { ProposalShareRecord } from "@/lib/proposal/types";
import { DEFAULT_THEME_ID, PROPOSAL_THEMES } from "@/lib/proposal/themes";
import { QuoteExtras } from "@/components/cotacoes/QuoteExtrasForm";
import { AgencySettings } from "@/lib/store/types";
import { QuoteItem } from "@/lib/types";
import { Check, CloudUpload, Loader2, X } from "lucide-react";

const DEFAULT_NEXT_STEPS = [
  "Escolha a opção final (com ou sem extras).",
  "Envie os dados dos passageiros: nome completo, nascimento, documento.",
  "Confirme a forma de pagamento e efetue o pagamento para garantir a reserva.",
  "Receba confirmações e vouchers por e-mail/WhatsApp.",
].join("\n");

const TITLE_MAX = 40;
const SUBTITLE_MAX = 80;

interface ThemeModalProps {
  quoteId: string;
  numero: string;
  extras: QuoteExtras;
  items: QuoteItem[];
  agency: AgencySettings;
  existingShare: ProposalShareRecord | null;
  onClose: () => void;
  onGenerated: (share: ProposalShareRecord) => void;
}

export function ThemeModal({
  quoteId,
  numero,
  extras,
  items,
  agency,
  existingShare,
  onClose,
  onGenerated,
}: ThemeModalProps) {
  const [themeId, setThemeId] = useState(existingShare?.themeId ?? DEFAULT_THEME_ID);
  const [coverImageUrl, setCoverImageUrl] = useState<string | null>(existingShare?.coverImageUrl ?? null);
  const [coverTitle, setCoverTitle] = useState(existingShare?.coverTitle ?? "PROPOSTA DE VIAGEM");
  const [coverSubtitle, setCoverSubtitle] = useState(
    existingShare?.coverSubtitle ?? "Sua viagem, do planejamento ao embarque."
  );
  const [nextSteps, setNextSteps] = useState(existingShare?.nextSteps ?? DEFAULT_NEXT_STEPS);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (file: File | undefined) => {
    if (!file) return;
    setUploading(true);
    try {
      const result = await uploadCoverImage(file);
      if ("error" in result) {
        toast.error(result.error);
        return;
      }
      setCoverImageUrl(result.url);
      setThemeId("custom");
    } catch {
      toast.error("Falha ao enviar a imagem.");
    } finally {
      setUploading(false);
    }
  };

  const handleSelectPreset = (id: string) => {
    setThemeId(id);
    setCoverImageUrl(null);
  };

  const handleConfirm = async () => {
    setSaving(true);
    try {
      const selected = items.filter((i) => i.selected);
      const share = await saveProposalShare({
        quoteLocalId: quoteId,
        numero,
        destino: extras.destino,
        periodoInicio: extras.periodoInicio,
        periodoFim: extras.periodoFim,
        adults: extras.adults,
        children: extras.children,
        infants: extras.infants,
        paymentMethod: extras.paymentMethod,
        validityHours: extras.validityHours,
        mensagemDestaque: extras.mensagemDestaque,
        observacoes: extras.observacoes,
        flightItems: selected,
        agency: {
          agencyName: agency.agencyName,
          logoDataUrl: agency.pdfUsarLogoAgencia ? agency.logoDataUrl : "",
          phone: extras.sellerPhone || agency.phone,
          email: extras.sellerEmail || agency.email,
          cnpj: agency.cnpj,
          cadastur: agency.cadastur,
          pdfCorPrimaria: agency.pdfCorPrimaria,
          pdfCorSecundaria: agency.pdfCorSecundaria,
        },
        client: extras.clientName.trim()
          ? { nomeCompleto: extras.clientName, telefone: extras.clientPhone, email: extras.clientEmail }
          : null,
        themeId,
        coverImageUrl,
        coverTitle: coverTitle.trim() || "PROPOSTA DE VIAGEM",
        coverSubtitle: coverSubtitle.trim(),
        nextSteps: nextSteps.trim(),
      });
      toast.success("Proposta gerada.");
      onGenerated(share as ProposalShareRecord);
    } catch {
      toast.error("Falha ao gerar o link da proposta.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4" onClick={onClose}>
      <div
        onClick={(e) => e.stopPropagation()}
        className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-white shadow-xl"
      >
        <div className="flex items-start justify-between border-b border-slate-100 px-6 py-5">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Configurar Proposta</h2>
            <p className="mt-0.5 text-sm text-slate-500">Personalize a capa e os próximos passos da proposta web</p>
          </div>
          <button type="button" onClick={onClose} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5">
          <p className="mb-3 text-xs font-bold tracking-wide text-slate-500 uppercase">Imagem de Capa</p>
          <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="flex aspect-4/3 flex-col items-center justify-center gap-1.5 rounded-xl border-2 border-dashed border-slate-300 text-slate-500 transition-colors hover:border-slate-400 hover:text-slate-600"
            >
              {uploading ? <Loader2 className="h-6 w-6 animate-spin" /> : <CloudUpload className="h-6 w-6" />}
              <span className="text-sm font-semibold">Upload Capa</span>
              <span className="text-xs">Até 5MB</span>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => handleUpload(e.target.files?.[0])}
            />

            {coverImageUrl ? (
              <div className="relative aspect-4/3 overflow-hidden rounded-xl ring-2 ring-slate-900">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={coverImageUrl} alt="Capa enviada" className="h-full w-full object-cover" />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent px-2.5 py-2">
                  <span className="text-xs font-semibold text-white">Sua imagem</span>
                </div>
                <span className="absolute top-1.5 right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-slate-900 text-white">
                  <Check className="h-3 w-3" />
                </span>
              </div>
            ) : null}

            {PROPOSAL_THEMES.map((theme) => {
              const selected = themeId === theme.id && !coverImageUrl;
              return (
                <button
                  key={theme.id}
                  type="button"
                  onClick={() => handleSelectPreset(theme.id)}
                  className={`relative aspect-4/3 overflow-hidden rounded-xl ring-2 transition-shadow ${
                    selected ? "ring-slate-900" : "ring-slate-200 hover:ring-slate-300"
                  }`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={theme.imageUrl} alt={theme.label} className="h-full w-full object-cover" loading="lazy" />
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent px-2.5 py-2 text-left">
                    <span className="text-xs font-semibold text-white">{theme.label}</span>
                  </div>
                  {selected ? (
                    <span className="absolute top-1.5 right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-slate-900 text-white">
                      <Check className="h-3 w-3" />
                    </span>
                  ) : null}
                </button>
              );
            })}
          </div>

          <div className="mb-4">
            <label className="mb-1 block text-sm font-semibold text-slate-800">Título da Capa</label>
            <input
              value={coverTitle}
              maxLength={TITLE_MAX}
              onChange={(e) => setCoverTitle(e.target.value)}
              className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm text-slate-800 focus:border-slate-500 focus:outline-none"
            />
            <p className="mt-1 text-xs text-slate-400">
              {coverTitle.length}/{TITLE_MAX} caracteres
            </p>
          </div>

          <div className="mb-6">
            <label className="mb-1 block text-sm font-semibold text-slate-800">Subtítulo da Capa</label>
            <input
              value={coverSubtitle}
              maxLength={SUBTITLE_MAX}
              onChange={(e) => setCoverSubtitle(e.target.value)}
              className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm text-slate-800 focus:border-slate-500 focus:outline-none"
            />
            <p className="mt-1 text-xs text-slate-400">
              {coverSubtitle.length}/{SUBTITLE_MAX} caracteres
            </p>
          </div>

          <div>
            <label className="mb-1 block text-sm font-semibold text-slate-800">Próximos Passos</label>
            <p className="mb-2 text-xs text-slate-500">
              Instruções exibidas no rodapé da proposta web indicando ao cliente o que fazer após receber a cotação.
            </p>
            <textarea
              value={nextSteps}
              onChange={(e) => setNextSteps(e.target.value)}
              rows={4}
              className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm text-slate-800 focus:border-slate-500 focus:outline-none"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 border-t border-slate-100 px-6 py-4">
          <button type="button" onClick={onClose} className="px-3 py-2 text-sm font-semibold text-slate-600 hover:text-slate-800">
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={saving || uploading}
            className="flex items-center gap-1.5 rounded-xl bg-lime-400 px-4 py-2.5 text-sm font-bold text-slate-900 hover:bg-lime-300 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
            Confirmar e Gerar Link
          </button>
        </div>
      </div>
    </div>
  );
}
