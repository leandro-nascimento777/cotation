// Gráfico simples de barras agrupadas (gerados x fechados, últimos 6 meses).
// Paleta categórica validada com scripts/validate_palette.js da skill
// dataviz (slots 1 e 3 do tema padrão — blue/aqua, todos os pares no piso
// de segurança CVD). O contraste do aqua contra fundo branco fica abaixo de
// 3:1 (WARN da skill) — por isso os valores vêm sempre com rótulo numérico
// visível, nunca só a cor.
const COLOR_GERADOS = "#2a78d6";
const COLOR_FECHADOS = "#1baf7a";

export interface MonthlyPoint {
  label: string; // ex: "Mar"
  gerados: number;
  fechados: number;
}

export function MonthlyQuotesChart({ data }: { data: MonthlyPoint[] }) {
  const max = Math.max(1, ...data.map((d) => Math.max(d.gerados, d.fechados)));

  return (
    <div>
      <div className="mb-3 flex items-center gap-4 text-xs text-slate-500">
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: COLOR_GERADOS }} />
          Gerados
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: COLOR_FECHADOS }} />
          Fechados
        </span>
      </div>

      <div className="flex h-40 items-end gap-3 border-b border-slate-200 sm:gap-6">
        {data.map((point) => (
          <div key={point.label} className="flex flex-1 flex-col items-center gap-1">
            <div className="flex h-32 items-end gap-1">
              <div className="flex flex-col items-center justify-end gap-1">
                {point.gerados > 0 && <span className="text-[10px] font-semibold text-slate-500">{point.gerados}</span>}
                <div
                  className="w-3 rounded-t-sm sm:w-4"
                  style={{
                    height: `${(point.gerados / max) * 100}%`,
                    backgroundColor: COLOR_GERADOS,
                    minHeight: point.gerados > 0 ? 3 : 0,
                  }}
                />
              </div>
              <div className="flex flex-col items-center justify-end gap-1">
                {point.fechados > 0 && <span className="text-[10px] font-semibold text-slate-500">{point.fechados}</span>}
                <div
                  className="w-3 rounded-t-sm sm:w-4"
                  style={{
                    height: `${(point.fechados / max) * 100}%`,
                    backgroundColor: COLOR_FECHADOS,
                    minHeight: point.fechados > 0 ? 3 : 0,
                  }}
                />
              </div>
            </div>
            <span className="text-[11px] text-slate-500">{point.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
