"use client";

import { useEffect, useState } from "react";
import { Check, Clock } from "lucide-react";

interface CheckoutProgressBarProps {
  completedSteps: number;
  totalSteps?: number;
  initialSeconds?: number;
}

export function CheckoutProgressBar({
  completedSteps,
  totalSteps = 4,
  initialSeconds = 561, // 9 min 21 seg conforme o anexo
}: CheckoutProgressBarProps) {
  const [secondsLeft, setSecondsLeft] = useState(initialSeconds);

  useEffect(() => {
    if (secondsLeft <= 0) return;
    const interval = setInterval(() => {
      setSecondsLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [secondsLeft]);

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const timeFormatted = `${minutes}:${seconds.toString().padStart(2, "0")}`;

  const isAllDone = completedSteps >= totalSteps;

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-slate-200 bg-white px-5 py-3.5 shadow-sm">
      {/* Lado Esquerdo: Indicador de Progresso */}
      <div className="flex items-center gap-3">
        {isAllDone ? (
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#00875A] text-white shadow-sm transition-all duration-300">
            <Check className="h-5 w-5 stroke-[2.8]" />
          </div>
        ) : (
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 border-slate-300 bg-slate-50 text-xs font-bold text-slate-700 shadow-sm transition-all duration-300">
            {completedSteps}/{totalSteps}
          </div>
        )}

        <span className="text-sm font-semibold text-slate-800">
          {isAllDone ? "Tudo certo! Agora é só comprar" : "Preencha seus dados para comprar"}
        </span>
      </div>

      {/* Lado Direito: Urgência com cronômetro */}
      <div className="flex items-center gap-1.5 text-xs font-medium text-slate-600">
        <span>Aproveite antes que seja tarde!</span>
        <span className="flex items-center gap-1 font-semibold text-slate-900">
          <Clock className="h-3.5 w-3.5 text-slate-500" />
          <span className="font-mono">{timeFormatted}</span>
        </span>
      </div>
    </div>
  );
}
