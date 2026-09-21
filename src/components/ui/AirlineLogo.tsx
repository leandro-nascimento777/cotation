"use client";

import { useState } from "react";
import { Plane } from "lucide-react";
import {
  getGoogleAirlineLogoUrl,
  getKiwiAirlineLogoUrl,
  resolveAirlineIata,
} from "@/lib/airlineLogo";

interface AirlineLogoProps {
  airline?: string | null;
  flightNumber?: string | null;
  className?: string;
  size?: 64 | 128;
  alt?: string;
}

export const AirlineLogo = ({
  airline,
  flightNumber,
  className = "h-6 w-6",
  size = 64,
  alt,
}: AirlineLogoProps) => {
  const [errorStage, setErrorStage] = useState<number>(0);
  const iata = resolveAirlineIata(airline, flightNumber);

  if (!iata || errorStage >= 2) {
    return (
      <div
        className={`flex items-center justify-center rounded-full bg-indigo-500/10 text-indigo-600 shrink-0 ${className}`}
        title={airline || flightNumber || "Companhia Aérea"}
      >
        <Plane className="h-3.5 w-3.5" />
      </div>
    );
  }

  // Tenta primeiro o CDN Kiwi; se falhar, tenta o Favicon Google; se falhar, exibe o ícone
  const src =
    errorStage === 0
      ? getKiwiAirlineLogoUrl(iata, size)
      : getGoogleAirlineLogoUrl(iata, 128);

  if (!src) {
    return (
      <div
        className={`flex items-center justify-center rounded-full bg-indigo-500/10 text-indigo-600 shrink-0 ${className}`}
        title={airline || flightNumber || "Companhia Aérea"}
      >
        <Plane className="h-3.5 w-3.5" />
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt || airline || `Logo ${iata}`}
      onError={() => setErrorStage((prev) => prev + 1)}
      className={`rounded-full bg-white object-contain p-0.5 border border-slate-200 shadow-2xs shrink-0 ${className}`}
      loading="lazy"
    />
  );
};
