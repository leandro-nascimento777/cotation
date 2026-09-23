import Link from "next/link";
import { Plus } from "lucide-react";

interface NewReservationButtonProps {
  className?: string;
}

/** Botão padrão "Nova reserva" no mesmo estilo de "Nova cotação" */
export const NewReservationButton = ({ className = "" }: NewReservationButtonProps) => (
  <Link
    href="/reservas/nova"
    className={`flex items-center gap-1.5 rounded-lg bg-teal-600 px-3.5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-teal-700 transition cursor-pointer ${className}`}
  >
    <Plus className="h-4 w-4" /> Nova reserva
  </Link>
);
