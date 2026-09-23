"use client";

import { useState, useMemo } from "react";
import { FlightWithReservation } from "./CheckinFlightModal";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Plane } from "lucide-react";

interface CheckinCalendarViewProps {
  flights: FlightWithReservation[];
  onSelectFlight: (flight: FlightWithReservation) => void;
}

const MONTH_NAMES = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
];

const WEEK_DAYS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

export function CheckinCalendarView({ flights, onSelectFlight }: CheckinCalendarViewProps) {
  const initialDate = useMemo(() => {
    const now = new Date();
    const futureFlight = flights.find(
      (f) => f.departureDate && f.departureDate.getTime() >= now.getTime()
    );
    return futureFlight?.departureDate ? new Date(futureFlight.departureDate) : now;
  }, [flights]);

  const [currentDate, setCurrentDate] = useState<Date>(initialDate);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const handlePrevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const handleNextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
  const handleToday = () => setCurrentDate(new Date());

  const flightsByDay = useMemo(() => {
    const map = new Map<string, FlightWithReservation[]>();
    for (const item of flights) {
      if (!item.departureDate) continue;
      const d = item.departureDate;
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
      const arr = map.get(key) || [];
      arr.push(item);
      map.set(key, arr);
    }
    return map;
  }, [flights]);

  const calendarCells = useMemo(() => {
    const firstDayIndex = new Date(year, month, 1).getDay();
    const totalDaysInMonth = new Date(year, month + 1, 0).getDate();
    const prevMonthDays = new Date(year, month, 0).getDate();
    const cells = [];
    const today = new Date();
    const isCurrentYearMonth = today.getFullYear() === year && today.getMonth() === month;

    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const d = prevMonthDays - i;
      const prevDate = new Date(year, month - 1, d);
      const key = `${prevDate.getFullYear()}-${String(prevDate.getMonth() + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      cells.push({ date: prevDate, dayNumber: d, isCurrentMonth: false, isToday: false, dateKey: key });
    }

    for (let d = 1; d <= totalDaysInMonth; d++) {
      const date = new Date(year, month, d);
      const isToday = isCurrentYearMonth && today.getDate() === d;
      const key = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      cells.push({ date, dayNumber: d, isCurrentMonth: true, isToday, dateKey: key });
    }

    const remaining = 7 - (cells.length % 7);
    if (remaining < 7) {
      for (let d = 1; d <= remaining; d++) {
        const nextDate = new Date(year, month + 1, d);
        const key = `${nextDate.getFullYear()}-${String(nextDate.getMonth() + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
        cells.push({ date: nextDate, dayNumber: d, isCurrentMonth: false, isToday: false, dateKey: key });
      }
    }
    return cells;
  }, [year, month]);

  return (
    <div className="rounded-3xl border border-slate-200/80 bg-white shadow-sm overflow-hidden p-4 sm:p-6 space-y-4">
      {/* Barra de Navegação do Mês */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-50 text-[#1d82f5] shadow-xs">
            <CalendarIcon className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
              {MONTH_NAMES[month]} de {year}
            </h2>
            <p className="text-xs text-slate-500">
              Visualização mensal de embarques e partidas.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <button
            type="button"
            onClick={handleToday}
            className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition cursor-pointer shadow-xs"
          >
            Hoje
          </button>

          <div className="inline-flex rounded-xl border border-slate-200 bg-white p-0.5 shadow-xs">
            <button
              type="button"
              onClick={handlePrevMonth}
              title="Mês anterior"
              className="rounded-lg p-1.5 text-slate-600 hover:bg-slate-100 transition cursor-pointer"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={handleNextMonth}
              title="Próximo mês"
              className="rounded-lg p-1.5 text-slate-600 hover:bg-slate-100 transition cursor-pointer"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Grid de Dias da Semana */}
      <div className="grid grid-cols-7 text-center text-xs font-bold uppercase tracking-wider text-slate-400 py-1">
        {WEEK_DAYS.map((d, i) => (
          <div key={d} className={`py-1 ${i === 0 || i === 6 ? "text-slate-400" : "text-slate-600"}`}>
            {d}
          </div>
        ))}
      </div>

      {/* Grid de Células dos Dias */}
      <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
        {calendarCells.map((cell) => {
          const dayFlights = flightsByDay.get(cell.dateKey) || [];
          const hasFlights = dayFlights.length > 0;

          return (
            <div
              key={cell.dateKey}
              className={`min-h-[90px] sm:min-h-[110px] rounded-2xl p-1.5 sm:p-2 border transition flex flex-col justify-between ${
                !cell.isCurrentMonth
                  ? "bg-slate-50/40 border-slate-100 text-slate-300"
                  : cell.isToday
                  ? "bg-blue-50/40 border-blue-200 text-slate-900"
                  : hasFlights
                  ? "bg-white border-slate-200/90 text-slate-800 hover:border-blue-200 shadow-2xs"
                  : "bg-white border-slate-100 text-slate-700"
              }`}
            >
              <div className="flex items-center justify-between">
                <span
                  className={`text-xs font-bold rounded-full flex items-center justify-center ${
                    cell.isToday
                      ? "h-6 w-6 bg-[#1d82f5] text-white shadow-xs"
                      : cell.isCurrentMonth
                      ? "text-slate-700"
                      : "text-slate-300"
                  }`}
                >
                  {cell.dayNumber}
                </span>

                {cell.isToday && (
                  <span className="hidden sm:inline-block text-[9px] font-black uppercase text-[#1d82f5] tracking-wider">
                    Hoje
                  </span>
                )}
              </div>

              {/* Badges de Voos */}
              <div className="space-y-1 my-1 overflow-y-auto max-h-[80px]">
                {dayFlights.slice(0, 3).map((item, idx) => {
                  const f = item.flight;
                  const isTodayFlight = cell.isToday;
                  const isPast = item.departureDate && item.departureDate.getTime() < new Date().setHours(0,0,0,0);

                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => onSelectFlight(item)}
                      title={`Clique para ver detalhes do voo ${f.numeroVoo} (${item.passengerNames})`}
                      className={`w-full text-left rounded-lg p-1 text-[10px] leading-tight transition transform hover:scale-[1.02] active:scale-95 cursor-pointer shadow-2xs block truncate ${
                        isTodayFlight
                          ? "bg-emerald-500 text-white font-black hover:bg-emerald-600"
                          : isPast
                          ? "bg-slate-100 text-slate-600 font-semibold hover:bg-slate-200 border border-slate-200/60"
                          : "bg-blue-50 text-[#1d82f5] font-bold hover:bg-blue-100 border border-blue-200/80"
                      }`}
                    >
                      <div className="flex items-center gap-1 truncate">
                        <Plane className="h-2.5 w-2.5 shrink-0" />
                        <span className="truncate">
                          {f.horaPartida} {f.origemCodigo}➔{f.destinoCodigo}
                        </span>
                      </div>
                      <div className="text-[9px] opacity-90 truncate mt-0.5 font-medium">
                        {item.passengerNames}
                      </div>
                    </button>
                  );
                })}

                {dayFlights.length > 3 && (
                  <div
                    onClick={() => onSelectFlight(dayFlights[0])}
                    className="text-[9px] font-bold text-center text-[#1d82f5] hover:underline cursor-pointer"
                  >
                    +{dayFlights.length - 3} mais...
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}