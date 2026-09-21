import Link from "next/link";
import { Compass, Home, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-teal-50 text-teal-600 shadow-inner">
        <Compass className="h-8 w-8" />
      </div>

      <h1 className="mt-4 text-2xl font-extrabold text-slate-900">404 - Página não encontrada</h1>
      <p className="mt-2 max-w-md text-sm text-slate-500">
        A página que você está procurando pode ter sido movida, excluída ou nunca existiu.
      </p>

      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/"
          className="flex items-center gap-1.5 rounded-lg bg-teal-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-teal-700"
        >
          <Home className="h-4 w-4" /> Ir para Dashboard
        </Link>
        <Link
          href="/cotacoes"
          className="flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
        >
          <ArrowLeft className="h-4 w-4" /> Ver Cotações
        </Link>
      </div>
    </div>
  );
}
