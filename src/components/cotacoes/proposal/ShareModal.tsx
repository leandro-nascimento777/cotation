"use client";

import { useState } from "react";
import { toast } from "sonner";
import { createTemporaryLink, getProposalShareByQuote, revokeTemporaryLink } from "@/lib/proposal/actions";
import { ProposalShareRecord } from "@/lib/proposal/types";
import { Check, Copy, Loader2, Trash2, X } from "lucide-react";

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
      className="flex shrink-0 items-center gap-1 rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50"
    >
      {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
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
        className="flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-xl bg-white shadow-xl"
      >
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <div>
            <h2 className="text-sm font-semibold text-slate-800">Compartilhar Proposta</h2>
            <p className="text-xs text-slate-500">Cotação {share.numero}</p>
          </div>
          <button type="button" onClick={onClose} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          <div className="mb-5">
            <p className="text-xs font-semibold text-slate-700">Link Permanente</p>
            <p className="mb-2 text-xs text-slate-500">Link fixo de acesso à proposta. Sempre acessível enquanto a cotação existir.</p>
            <div className="flex items-center gap-2 rounded-lg bg-slate-50 p-2">
              <span className="min-w-0 flex-1 truncate font-mono text-xs text-slate-700">{permanentUrl}</span>
              <CopyButton text={permanentUrl} />
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold text-slate-700">Links Temporários</p>
            <p className="mb-2 text-xs text-slate-500">
              Gere links com expiração de 24h que podem ser revogados a qualquer momento.
            </p>

            {activeTemporaryLinks.length === 0 ? (
              <p className="mb-2 text-xs text-slate-400">Nenhum link temporário ativo.</p>
            ) : (
              <div className="mb-2 flex flex-col gap-2">
                {activeTemporaryLinks.map((link) => {
                  const url = `${publicOrigin()}/proposta/h/${link.token}`;
                  return (
                    <div key={link.id} className="rounded-lg bg-slate-50 p-2">
                      <div className="flex items-center gap-2">
                        <span className="min-w-0 flex-1 truncate font-mono text-xs text-slate-700">{url}</span>
                        <CopyButton text={url} />
                        <button
                          type="button"
                          onClick={() => handleRevoke(link.id)}
                          disabled={revokingId === link.id}
                          title="Revogar"
                          className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600"
                        >
                          {revokingId === link.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                        </button>
                      </div>
                      <p className="mt-1 text-[11px] text-slate-400">{formatTimeLeft(link.expiresAt, now)}</p>
                    </div>
                  );
                })}
              </div>
            )}

            <button
              type="button"
              onClick={handleCreateTemporary}
              disabled={creating}
              className="flex items-center gap-1.5 rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-50"
            >
              {creating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
              Gerar Link Temporário
            </button>
          </div>
        </div>

        <div className="flex justify-end border-t border-slate-100 px-5 py-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}
