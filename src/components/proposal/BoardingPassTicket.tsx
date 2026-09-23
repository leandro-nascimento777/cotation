"use client";

import { QuoteItem } from "@/lib/types";
import { formatPassengersList, formatTicketDate, getTicketClass, parseAirportInfo } from "@/lib/ticketUtils";
import { WorldMapWatermark } from "./WorldMapWatermark";
import { TicketBarcode } from "./TicketBarcode";
import { AirplaneTicketIcon } from "./AirplaneTicketIcon";

export interface BoardingPassTicketProps {
  numero: string;
  clientName: string;
  passengerNames?: string | null;
  totalPassengers?: number;
  periodoInicio?: string | null;
  periodoFim?: string | null;
  destino?: string | null;
  items: QuoteItem[];
  primaryColor?: string;
}

export const BoardingPassTicket = ({
  numero,
  clientName,
  passengerNames,
  totalPassengers = 1,
  periodoInicio,
  periodoFim,
  destino,
  items,
  primaryColor = "#6E44FF",
}: BoardingPassTicketProps) => {
  const activeItem = items.find((i) => i.selected) ?? items[0];
  const legIda = activeItem?.ida;
  const legVolta = activeItem?.volta;

  const originInfo = parseAirportInfo(legIda?.origin || "GRU", "GRU");
  const destInfo = parseAirportInfo(legIda?.destination || destino || legVolta?.origin || "AMS", "AMS");

  const flightClass = getTicketClass(activeItem);
  const passengers = formatPassengersList(clientName, passengerNames, totalPassengers);

  const formattedIda = formatTicketDate(periodoInicio || legIda?.date);
  const formattedVolta = formatTicketDate(periodoFim || legVolta?.date);

  // Exibe o voo / destino correspondente ao padrão do Anexo 1
  const destinoDisplay = legIda?.flightNumber || destino || destInfo.iata || "A1 234";

  return (
    <div
      className="relative w-full overflow-hidden rounded-[20px] bg-white p-5 shadow-2xl transition-all sm:rounded-[28px] md:rounded-[36px] sm:p-6 md:p-8 lg:px-12 lg:py-7 font-ticket min-h-[340px] sm:min-h-[370px] md:min-h-[400px] lg:min-h-[430px] flex flex-col justify-between"
      style={{ border: `1.5px solid ${primaryColor}40` }}
    >
      {/* Marca d'água geográfica do mapa-múndi em tom rosado suave */}
      <WorldMapWatermark />

      <div className="relative z-10 flex flex-row items-center gap-5 sm:gap-6 md:gap-10 lg:gap-12 h-full flex-1">
        {/* Código de barras vertical limpo e espaçoso à esquerda (Anexo 1) */}
        <TicketBarcode code={numero ? `COT ${numero} 001 02` : undefined} color={primaryColor} />

        {/* Corpo Principal do Bilhete de Embarque com proporção panorâmica retangular */}
        <div className="flex flex-1 flex-col justify-between gap-3 sm:gap-4 md:gap-5 min-w-0 h-full py-0.5">
          {/* Topo em 4 Colunas com Tipografia Condensada (Anexo 1) */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-5 md:gap-6">
            <div>
              <span className="block font-ticket text-[11px] font-normal tracking-[0.05em] text-black uppercase sm:text-[12px] md:text-[13px]">
                {passengers.length > 1 ? "NAMES OF PASSENGERS" : "NAME OF PASSENGER"}
              </span>
              <div className="mt-0.5 flex flex-col gap-0.5">
                {passengers.map((p, i) => (
                  <span
                    key={i}
                    className="font-ticket text-sm font-bold tracking-tight sm:text-base md:text-lg lg:text-xl"
                    style={{ color: primaryColor }}
                  >
                    {p}{i < passengers.length - 1 ? "," : ""}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <span className="block font-ticket text-[11px] font-normal tracking-[0.05em] text-black uppercase sm:text-[12px] md:text-[13px]">
                DATA DE IDA
              </span>
              <span
                className="mt-0.5 block font-ticket text-sm font-bold tracking-tight sm:text-base md:text-lg lg:text-xl"
                style={{ color: primaryColor }}
              >
                {formattedIda}
              </span>
            </div>

            <div>
              <span className="block font-ticket text-[11px] font-normal tracking-[0.05em] text-black uppercase sm:text-[12px] md:text-[13px]">
                DATA DE VOLTA
              </span>
              <span
                className="mt-0.5 block font-ticket text-sm font-bold tracking-tight sm:text-base md:text-lg lg:text-xl"
                style={{ color: primaryColor }}
              >
                {formattedVolta}
              </span>
            </div>

            <div className="sm:text-right">
              <span className="block font-ticket text-[11px] font-normal tracking-[0.05em] text-black uppercase sm:text-[12px] md:text-[13px]">
                DESTINO
              </span>
              <span
                className="mt-0.5 block font-ticket text-sm font-bold tracking-tight sm:text-base md:text-lg lg:text-xl truncate"
                style={{ color: primaryColor }}
              >
                {destinoDisplay}
              </span>
            </div>
          </div>

          {/* Centro: Códigos IATA e Avião inclinados em cor primária (Anexo 1) */}
          <div className="my-1 flex flex-col items-center justify-between gap-4 sm:flex-row">
            {/* Origem IATA com Cidade perfeitamente centralizada */}
            <div className="flex flex-col items-center text-center">
              <span
                className="font-ticket text-5xl font-bold tracking-tight sm:text-6xl md:text-7xl lg:text-8xl xl:text-[6.2rem] leading-none block"
                style={{ color: primaryColor }}
              >
                {originInfo.iata}
              </span>
              <p className="mt-1 font-sans text-[10px] font-bold tracking-wider text-[#1E1B4B] uppercase sm:text-[11px] md:text-xs text-center">
                {originInfo.location}
              </p>
            </div>

            {/* Avião oficial centralizado com a cor da marca */}
            <div className="flex flex-1 items-center justify-center px-2">
              <AirplaneTicketIcon
                className="h-12 w-28 sm:h-14 sm:w-36 md:h-18 md:w-44 lg:h-20 lg:w-48 transition-transform duration-300 hover:scale-105"
                style={{ color: primaryColor }}
              />
            </div>

            {/* Destino IATA com Cidade perfeitamente centralizada */}
            <div className="flex flex-col items-center text-center">
              <span
                className="font-ticket text-5xl font-bold tracking-tight sm:text-6xl md:text-7xl lg:text-8xl xl:text-[6.2rem] leading-none block"
                style={{ color: primaryColor }}
              >
                {destInfo.iata}
              </span>
              <p className="mt-1 font-sans text-[10px] font-bold tracking-wider text-[#1E1B4B] uppercase sm:text-[11px] md:text-xs text-center">
                {destInfo.location}
              </p>
            </div>
          </div>

          {/* Rodapé: Mensagem Centralizada e Classe à Direita (Anexo 1) */}
          <div className="relative flex flex-col items-center justify-between gap-3 sm:flex-row mt-1">
            {/* Mensagem COTAÇÃO centralizada no rodapé */}
            <div className="flex flex-col items-center justify-center text-center sm:absolute sm:left-1/2 sm:-translate-x-1/2 w-full sm:w-auto px-2">
              <span
                className="font-ticket text-xl font-bold tracking-[0.22em] uppercase sm:text-2xl md:text-3xl"
                style={{ color: primaryColor }}
              >
                COTAÇÃO
              </span>
              <p
                className="mt-0.5 max-w-sm font-ticket text-[9px] font-semibold tracking-wide uppercase sm:text-[10px] md:text-[11px] md:max-w-md lg:max-w-lg leading-tight"
                style={{ color: primaryColor }}
              >
                PRÓXIMO PASSO: CONFIRME A PROPOSTA E ENVIE OS DADOS DOS PASSAGEIROS PARA RESERVA/EMISSÃO.
              </p>
            </div>

            {/* Canto Inferior Direito: CLASS */}
            <div className="w-full flex items-center justify-end sm:ml-auto">
              <div className="text-right">
                <span className="block font-ticket text-[10px] font-normal tracking-widest text-black uppercase sm:text-[11px] md:text-xs">
                  CLASS
                </span>
                <span
                  className="font-ticket text-xl font-bold tracking-tight uppercase sm:text-2xl md:text-3xl lg:text-4xl"
                  style={{ color: primaryColor }}
                >
                  {flightClass}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
