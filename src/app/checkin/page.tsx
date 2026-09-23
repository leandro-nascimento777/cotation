"use client";

import { useAppData } from "@/lib/store/AppDataContext";
import { PageHeader } from "@/components/shell/PageHeader";
import { LoadingState } from "@/components/shell/LoadingState";
import { CheckinBoard } from "@/components/reservas/CheckinBoard";

export default function CheckinPage() {
  const { reservations, hydrated } = useAppData();

  if (!hydrated) {
    return <LoadingState />;
  }

  return (
    <div className="space-y-6 pb-16">
      <PageHeader
        title="Controle de Check-in"
        description="Acompanhe os próximos embarques, monitore voos de hoje e acione passageiros no WhatsApp com os localizadores da cia aérea."
      />

      <div className="px-4 sm:px-6 lg:px-8">
        <CheckinBoard reservations={reservations} />
      </div>
    </div>
  );
}
