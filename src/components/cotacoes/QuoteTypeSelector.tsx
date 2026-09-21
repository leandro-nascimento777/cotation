import { QuoteType } from "@/lib/store/types";
import { Building2, PlaneTakeoff, Package } from "lucide-react";

const OPTIONS: { type: QuoteType; label: string; icon: typeof PlaneTakeoff; disabled?: boolean }[] = [
  { type: "VOO", label: "Voo", icon: PlaneTakeoff },
  { type: "HOTEL", label: "Hotel", icon: Building2, disabled: true },
  { type: "PACOTE", label: "Pacote", icon: Package, disabled: true },
];

export const QuoteTypeSelector = ({ value }: { value: QuoteType }) => (
  <div className="inline-flex rounded-lg border border-slate-200 bg-slate-50 p-1">
    {OPTIONS.map(({ type, label, icon: Icon, disabled }) => (
      <button
        key={type}
        type="button"
        disabled={disabled}
        title={disabled ? "Em breve" : undefined}
        className={`relative flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition-colors ${
          value === type && !disabled
            ? "bg-white text-teal-700 shadow-sm"
            : disabled
              ? "cursor-not-allowed text-slate-300"
              : "text-slate-500 hover:text-slate-700"
        }`}
      >
        <Icon className="h-3.5 w-3.5" />
        {label}
        {disabled ? (
          <span className="absolute -top-2 -right-2 rounded-full bg-slate-200 px-1.5 py-0.5 text-[8px] font-bold text-slate-500">
            em breve
          </span>
        ) : null}
      </button>
    ))}
  </div>
);
