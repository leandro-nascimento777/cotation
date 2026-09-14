"use client";

import { useAppData } from "@/lib/store/AppDataContext";
import { PageHeader } from "@/components/shell/PageHeader";
import { QuoteEditor } from "@/components/cotacoes/QuoteEditor";

export default function NovaCotacaoPage() {
  const { hydrated } = useAppData();

  return (
    <div>
      <PageHeader title="Nova cotação" description="Print de voos → orçamento pronto para WhatsApp e PDF." />
      {hydrated ? (
        <QuoteEditor />
      ) : (
        <div className="flex h-full items-center justify-center py-24 text-sm text-slate-400">Carregando…</div>
      )}
    </div>
  );
}
