import Link from "next/link";
import { Plus } from "lucide-react";

interface NewQuoteButtonProps {
  className?: string;
}

/** Botão padrão "Nova cotação" — usar sempre que precisarmos desse botão
 * em qualquer tela (dashboard, cotações, clientes, etc.), pra manter o
 * mesmo rótulo/ícone/estilo em todo o app. */
export const NewQuoteButton = ({ className = "" }: NewQuoteButtonProps) => (
  <Link
    href="/cotacoes/nova"
    className={`flex items-center gap-1.5 rounded-lg bg-teal-600 px-3 py-2 text-sm font-semibold text-white hover:bg-teal-700 ${className}`}
  >
    <Plus className="h-4 w-4" /> Nova cotação
  </Link>
);
