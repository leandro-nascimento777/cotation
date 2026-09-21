"use client";

import { useAppData } from "@/lib/store/AppDataContext";
import { PageHeader } from "@/components/shell/PageHeader";
import { LoadingState } from "@/components/shell/LoadingState";
import { QuoteEditor } from "@/components/cotacoes/QuoteEditor";

export default function NovaCotacaoPage() {
  const { hydrated } = useAppData();

  return (
    <div>
      <PageHeader title="Nova cotação" description="Print de voos → orçamento pronto para WhatsApp e PDF." />
      {hydrated ? <QuoteEditor /> : <LoadingState />}
    </div>
  );
}
