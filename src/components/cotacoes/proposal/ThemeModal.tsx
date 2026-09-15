"use client";

import { useRef, useState } from "react";
import { toast } from "sonner";
import { saveProposalShare, uploadCoverImage } from "@/lib/proposal/actions";
import { ProposalShareRecord } from "@/lib/proposal/types";
import { DEFAULT_THEME_ID, PROPOSAL_THEMES } from "@/lib/proposal/themes";
import { QuoteExtras } from "@/components/cotacoes/QuoteExtrasForm";
import { AgencySettings } from "@/lib/store/types";
import { QuoteItem } from "@/lib/types";
import { Check, ImageUp, Loader2, X } from "lucide-react";

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
  const [coverTitle, setCoverTitle] = useState(existingShare?.coverTitle ?? "Proposta de Viagem");
  const [coverSubtitle, setCoverSubtitle] = useState(
    existingShare?.coverSubtitle ?? (extras.destino ? `Destino: ${extras.destino}` : "")
  );
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
        coverTitle: coverTitle.trim() || "Proposta de Viagem",
        coverSubtitle: coverSubtitle.trim(),
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
        className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-xl bg-white shadow-xl"
      >
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <h2 className="text-sm font-semibold text-slate-800">Montar Proposta Comercial</h2>
          <button type="button" onClick={onClose} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          <p className="mb-2 text-xs font-semibold text-slate-500">Tema da capa</p>
          <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {PROPOSAL_THEMES.map((theme) => (
              <button
                key={theme.id}
                type="button"
                onClick={() => handleSelectPreset(theme.id)}
                className={`relative flex h-16 items-end overflow-hidden rounded-lg p-2 text-xs font-semibold text-white ring-2 transition-shadow ${
                  themeId === theme.id && coverImageUrl === null ? "ring-teal-500" : "ring-transparent hover:ring-slate-300"
                }`}
                style={{ background: theme.gradient }}
              >
                {theme.label}
                {themeId === theme.id && coverImageUrl === null ? (
                  <Check className="absolute top-1.5 right-1.5 h-3.5 w-3.5" />
                ) : null}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className={`mb-4 flex h-20 w-full flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed text-xs font-medium transition-colors ${
              coverImageUrl ? "border-teal-400 bg-teal-50 text-teal-700" : "border-slate-300 text-slate-500 hover:border-slate-400"
            }`}
          >
            {uploading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : coverImageUrl ? (
              <>
                <Check className="h-4 w-4" /> Imagem enviada — usar como capa
              </>
            ) : (
              <>
                <ImageUp className="h-4 w-4" /> Enviar imagem própria (até 5MB)
              </>
            )}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => handleUpload(e.target.files?.[0])}
          />

          <div className="grid grid-cols-1 gap-3">
            <label className="flex flex-col gap-1 text-xs font-medium text-slate-600">
              Título da capa
              <input
                value={coverTitle}
                onChange={(e) => setCoverTitle(e.target.value)}
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-800 focus:border-teal-500 focus:outline-none"
              />
            </label>
            <label className="flex flex-col gap-1 text-xs font-medium text-slate-600">
              Subtítulo da capa
              <input
                value={coverSubtitle}
                onChange={(e) => setCoverSubtitle(e.target.value)}
                placeholder="Ex: Destino: Belo Horizonte"
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-800 focus:border-teal-500 focus:outline-none"
              />
            </label>
          </div>
        </div>

        <div className="flex justify-end gap-2 border-t border-slate-100 px-5 py-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={saving || uploading}
            className="flex items-center gap-1.5 rounded-lg bg-teal-600 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            Confirmar e Gerar Link
          </button>
        </div>
      </div>
    </div>
  );
}
