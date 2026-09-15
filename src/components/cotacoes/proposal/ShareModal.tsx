"use client";

import { useState } from "react";
import { toast } from "sonner";
import { createTemporaryLink, getProposalShareByQuote, revokeTemporaryLink } from "@/lib/proposal/actions";
import { ProposalShareRecord } from "@/lib/proposal/types";
import { AlertCircle, Check, Clock, Copy, Globe, Link2, Loader2, Plus, Trash2, X } from "lucide-react";

interface ShareModalProps {
  share: ProposalShareRecord;
  onClose: () => void;
  onUpdated: (share: ProposalShareRecord) => void;
}

function publicOrigin() {
  return typeof window !== "undefined" ? window.location.origin : "";
}

function formatTimeLeft(expiresAt: Date, now: number): string {
  const ms = new Date(expiresAt).getTime() - now;
  if (ms <= 0) return "Expirado";
  const hours = Math.floor(ms / (60 * 60 * 1000));
  const minutes = Math.floor((ms % (60 * 60 * 1000)) / (60 * 1000));
  return `${hours}h ${minutes}min restantes`;
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }}
      className="flex shrink-0 items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
    >
      {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
      {copied ? "Copiado!" : "Copiar"}
    </button>
  );
}

export function ShareModal({ share: initialShare, onClose, onUpdated }: ShareModalProps) {
  const [share, setShare] = useState(initialShare);
  const [creating, setCreating] = useState(false);
  const [revokingId, setRevokingId] = useState<string | null>(null);
  const [now] = useState(() => Date.now());

  const permanentUrl = `${publicOrigin()}/proposta/${share.id}`;
  const activeTemporaryLinks = share.temporaryLinks.filter(
    (link) => !link.revokedAt && new Date(link.expiresAt).getTime() > now
  );

  const refresh = async () => {
    const refreshed = await getProposalShareByQuote(share.quoteLocalId);
    if (refreshed) {
      setShare(refreshed);
      onUpdated(refreshed);
    }
  };

  const handleCreateTemporary = async () => {
    setCreating(true);
    try {
      await createTemporaryLink(share.id);
      await refresh();
    } catch {
      toast.error("Falha ao gerar link temporário.");
    } finally {
      setCreating(false);
    }
  };

  const handleRevoke = async (id: string) => {
    setRevokingId(id);
    try {
      await revokeTemporaryLink(id);
      await refresh();
    } catch {
      toast.error("Falha ao revogar o link.");
    } finally {
      setRevokingId(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4" onClick={onClose}>
      <div
        onClick={(e) => e.stopPropagation()}
        className="flex max-h-[90vh] w-full max-w-xl flex-col overflow-hidden rounded-2xl bg-white shadow-xl"
      >
        <div className="flex items-start justify-between px-6 pt-6">
          <div>
            <h2 className="flex items-center gap-2 text-xl font-bold text-slate-900">
              <Link2 className="h-5 w-5 text-lime-500" /> Compartilhar Proposta
            </h2>
            <p className="mt-1.5 text-sm text-slate-500">
              Compartilhe o acesso à proposta comercial {share.numero} via link permanente ou temporário.
            </p>
          </div>
          <button type="button" onClick={onClose} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5">
          <div className="mb-6 rounded-xl border border-slate-200 bg-slate-50 p-4">
            <h3 className="flex items-center gap-2 text-sm font-bold text-slate-900">
              <Globe className="h-4 w-4 text-lime-500" /> Link Permanente
            </h3>
            <p className="mt-1 mb-3 text-sm text-slate-500">
              Link fixo de acesso à proposta. Sempre acessível enquanto a cotação existir.
            </p>
            <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white p-2">
              <span className="min-w-0 flex-1 truncate px-1 font-mono text-sm text-slate-700">{permanentUrl}</span>
              <CopyButton text={permanentUrl} />
            </div>
          </div>

          <div>
            <h3 className="flex items-center gap-2 text-sm font-bold text-slate-900">
              <Clock className="h-4 w-4 text-amber-500" /> Links Temporários
            </h3>
            <p className="mt-1 mb-3 text-sm text-slate-500">
              Gere links com expiração de 24h que podem ser revogados a qualquer momento.
            </p>

            <button
              type="button"
              onClick={handleCreateTemporary}
              disabled={creating}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#1e1b4b] px-4 py-3 text-sm font-bold text-white hover:bg-[#28234f] disabled:opacity-60"
            >
              {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
              Gerar Link Temporário
            </button>

            {activeTemporaryLinks.length === 0 ? (
              <div className="flex flex-col items-center gap-2 py-8 text-center">
                <AlertCircle className="h-6 w-6 text-slate-300" />
                <p className="text-sm text-slate-400">Nenhum link temporário ativo.</p>
              </div>
            ) : (
              <div className="mt-3 flex flex-col gap-2">
                {activeTemporaryLinks.map((link) => {
                  const url = `${publicOrigin()}/proposta/h/${link.token}`;
                  return (
                    <div key={link.id} className="rounded-lg border border-slate-200 bg-white p-2">
                      <div className="flex items-center gap-2">
                        <span className="min-w-0 flex-1 truncate px-1 font-mono text-xs text-slate-700">{url}</span>
                        <CopyButton text={url} />
                        <button
                          type="button"
                          onClick={() => handleRevoke(link.id)}
                          disabled={revokingId === link.id}
                          title="Revogar"
                          className="shrink-0 rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600"
                        >
                          {revokingId === link.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                        </button>
                      </div>
                      <p className="mt-1 px-1 text-[11px] text-slate-400">{formatTimeLeft(link.expiresAt, now)}</p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end border-t border-slate-100 px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}
