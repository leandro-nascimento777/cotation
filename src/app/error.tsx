"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";

export default function RootError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Registra o erro no console ou serviço de observabilidade (ex: Sentry)
    console.error("Aplicação encontrou um erro:", error);
  }, [error]);

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 text-red-600 shadow-inner">
        <AlertTriangle className="h-8 w-8" />
      </div>

      <h1 className="mt-4 text-xl font-bold text-slate-900">Algo deu errado</h1>
      <p className="mt-2 max-w-md text-sm text-slate-500">
        Ocorreu um erro inesperado ao carregar esta página. Tente recarregar ou volte para o painel principal.
      </p>

      {error.digest && (
        <span className="mt-2 font-mono text-[11px] text-slate-400">
          Código do erro: {error.digest}
        </span>
      )}

      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={() => reset()}
          className="flex items-center gap-1.5 rounded-lg bg-teal-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-teal-700"
        >
          <RefreshCw className="h-4 w-4" /> Tentar novamente
        </button>
        <Link
          href="/"
          className="flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
        >
          <Home className="h-4 w-4" /> Ir para Dashboard
        </Link>
      </div>
    </div>
  );
}
