"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { useAppData } from "@/lib/store/AppDataContext";
import { PageHeader } from "@/components/shell/PageHeader";
import { LoadingState } from "@/components/shell/LoadingState";
import { StatusBadge } from "@/components/shell/StatusBadge";
import { QuoteEditor } from "@/components/cotacoes/QuoteEditor";
import { ArrowLeft } from "lucide-react";

export default function CotacaoDetailPage() {
  const params = useParams<{ id: string }>();
  const { getQuote, hydrated } = useAppData();

  if (!hydrated) {
    return <LoadingState />;
  }

  const quote = getQuote(params.id);

  if (!quote) {
    return (
      <div>
        <PageHeader title="Cotação não encontrada" />
        <div className="mx-auto max-w-2xl px-4 py-6 sm:px-6">
          <Link href="/cotacoes" className="text-sm font-medium text-teal-700 hover:underline">
            ← Voltar para cotações
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title={
          <span className="flex items-center gap-2">
            {quote.numero}
            <StatusBadge status={quote.status} />
          </span>
        }
        action={
          <Link href="/cotacoes" className="flex items-center gap-1 text-sm font-medium text-slate-500 hover:text-slate-700">
            <ArrowLeft className="h-4 w-4" /> Voltar
          </Link>
        }
      />
      <QuoteEditor key={quote.id} existingQuote={quote} />
    </div>
  );
}
