import { ComponentType } from "react";
import { ArrowDown, ArrowUp } from "lucide-react";

interface StatTileProps {
  label: string;
  value: string;
  icon: ComponentType<{ className?: string }>;
  delta?: number; // pontos percentuais vs. período anterior
}

export const StatTile = ({ label, value, icon: Icon, delta }: StatTileProps) => (
  <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
    <div className="mb-2 flex items-center justify-between">
      <span className="text-xs font-medium text-slate-500">{label}</span>
      <Icon className="h-4 w-4 text-slate-400" />
    </div>
    <p className="text-2xl font-bold text-slate-900">{value}</p>
    {typeof delta === "number" ? (
      <p className={`mt-1 flex items-center gap-1 text-xs font-medium ${delta >= 0 ? "text-green-600" : "text-red-600"}`}>
        {delta >= 0 ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
        {Math.abs(delta).toFixed(0)} p.p. vs. mês anterior
      </p>
    ) : null}
  </div>
);
