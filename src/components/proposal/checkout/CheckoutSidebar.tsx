"use client";

import { QuoteItem } from "@/lib/types";
import { CheckoutSidebarPaymentBox } from "./CheckoutSidebarPaymentBox";
import { CheckoutSidebarTripBox } from "./CheckoutSidebarTripBox";

interface CheckoutSidebarProps {
  totalPassengers: number;
  totalPrice: number;
  selectedIdaItem: QuoteItem | null;
  selectedVoltaItem: QuoteItem | null;
  originCity: string;
  destinationCity: string;
  idaDateLabel: string;
  voltaDateLabel: string;
  isPixSelected: boolean;
  pixDiscount: number;
  onOpenFlightDetails: () => void;
  onOpenPoliciesModal: () => void;
}

export function CheckoutSidebar({
  totalPassengers,
  totalPrice,
  selectedIdaItem,
  selectedVoltaItem,
  originCity,
  destinationCity,
  idaDateLabel,
  voltaDateLabel,
  isPixSelected,
  pixDiscount,
  onOpenFlightDetails,
  onOpenPoliciesModal,
}: CheckoutSidebarProps) {
  const effectivePassengers = Math.max(1, totalPassengers);
  const taxesAmount = Math.round(totalPrice * 0.12);
  const assistanceAmount = Math.min(301, Math.round(effectivePassengers * 150));
  const flightAmount = Math.max(0, totalPrice - taxesAmount - assistanceAmount);
  const subtotal = totalPrice;
  const totalPix = Math.max(0, subtotal - pixDiscount);

  const idaTime = selectedIdaItem?.ida?.departureTime || "21:45";
  const voltaTime = selectedVoltaItem?.volta?.departureTime || selectedIdaItem?.volta?.departureTime || "13:00";

  return (
    <div className="space-y-4">
      <CheckoutSidebarPaymentBox
        effectivePassengers={effectivePassengers}
        flightAmount={flightAmount}
        assistanceAmount={assistanceAmount}
        taxesAmount={taxesAmount}
        subtotal={subtotal}
        totalPix={totalPix}
        isPixSelected={isPixSelected}
      />

      <CheckoutSidebarTripBox
        originCity={originCity}
        destinationCity={destinationCity}
        idaDateLabel={idaDateLabel}
        voltaDateLabel={voltaDateLabel}
        idaTime={idaTime}
        voltaTime={voltaTime}
        onOpenFlightDetails={onOpenFlightDetails}
        onOpenPoliciesModal={onOpenPoliciesModal}
      />
    </div>
  );
}
