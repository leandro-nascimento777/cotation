"use client";

import { useState } from "react";
import { BaggageRules } from "@/lib/flightFormatters";

interface FlightBaggageHoverProps {
  rules: BaggageRules;
  className?: string;
}

export const FlightBaggageHover = ({ rules, className = "" }: FlightBaggageHoverProps) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div
      className={`relative inline-flex items-center ${className}`}
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
      onClick={(e) => {
        e.stopPropagation();
        setIsOpen((prev) => !prev);
      }}
    >
      {/* Grupo de 3 ícones alinhados lado a lado (Anexo 1 e 2) */}
      <div className="flex items-center gap-1.5 cursor-pointer select-none py-1 px-1.5 rounded-lg hover:bg-slate-100/80 transition-colors">
        {/* 1. Mochila ou bolsa */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/icons/baggage/bolsa.png"
          alt="Mochila ou bolsa"
          className="h-5 w-5 object-contain"
        />

        {/* 2. Mala de mão */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/icons/baggage/mala-mao.png"
          alt="Bagagem de mão"
          className={`h-5 w-5 object-contain transition-opacity ${
            rules.hasHandbag ? "opacity-100" : "opacity-30 grayscale"
          }`}
        />

        {/* 3. Mala despachada */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/icons/baggage/mala-despachada.png"
          alt="Bagagem despachada"
          className={`h-5 w-5 object-contain transition-opacity ${
            rules.hasCheckedBag ? "opacity-100" : "opacity-35 grayscale"
          }`}
        />
      </div>

      {/* Popover / Tooltip Flutuante com Seta (Anexo 4) */}
      {isOpen && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-72 sm:w-80 rounded-2xl border border-slate-200 bg-white p-4 shadow-2xl z-40 text-left animate-in fade-in zoom-in-95 duration-150 pointer-events-none sm:pointer-events-auto">
          {/* Setinha apontando para baixo */}
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white border-b border-r border-slate-200 rotate-45" />

          <div className="space-y-3.5 relative z-10">
            {/* Item 1: Mochila */}
            <div className="flex items-start gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/icons/baggage/bolsa.png"
                alt="Mochila"
                className="h-5 w-5 shrink-0 mt-0.5 object-contain"
              />
              <div className="min-w-0">
                <p className="text-xs font-bold text-[#008269] leading-tight">
                  Inclui uma mochila ou bolsa
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5 leading-snug font-medium">
                  Deve caber embaixo do assento dianteiro.
                </p>
              </div>
            </div>

            <div className="border-t border-slate-100" />

            {/* Item 2: Bagagem de mão */}
            <div className="flex items-start gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/icons/baggage/mala-mao.png"
                alt="Bagagem de mão"
                className={`h-5 w-5 shrink-0 mt-0.5 object-contain ${
                  rules.hasHandbag ? "opacity-100" : "opacity-30 grayscale"
                }`}
              />
              <div className="min-w-0">
                <p
                  className={`text-xs font-bold leading-tight ${
                    rules.hasHandbag ? "text-[#008269]" : "text-slate-500 line-through"
                  }`}
                >
                  {rules.hasHandbag ? "Inclui bagagem de mão" : "Não inclui bagagem de mão"}
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5 leading-snug font-medium">
                  {rules.hasHandbag
                    ? "Deve caber no compartimento superior do avião."
                    : "Opção disponível para compra separada ou em outras tarifas."}
                </p>
              </div>
            </div>

            <div className="border-t border-slate-100" />

            {/* Item 3: Bagagem despachada */}
            <div className="flex items-start gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/icons/baggage/mala-despachada.png"
                alt="Bagagem despachada"
                className={`h-5 w-5 shrink-0 mt-0.5 object-contain ${
                  rules.hasCheckedBag ? "opacity-100" : "opacity-35 grayscale"
                }`}
              />
              <div className="min-w-0">
                <p
                  className={`text-xs font-bold leading-tight ${
                    rules.hasCheckedBag ? "text-[#008269]" : "text-slate-800"
                  }`}
                >
                  {rules.hasCheckedBag
                    ? "Inclui bagagem para despachar (23kg)"
                    : "Não inclui bagagem para despachar"}
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5 leading-snug font-medium">
                  {rules.hasCheckedBag
                    ? "1 mala de até 23kg inclusa para despachar."
                    : "Você poderá comprar malas online por um preço exclusivo."}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
