"use client";

import { useState } from "react";
import { User, Check } from "lucide-react";
import { TravelerSlotForm } from "./TravelerSlotForm";
import { ClientPassenger } from "@/lib/store/types";
import { toast } from "sonner";

export interface TravelerFormData {
  id: string;
  tipo: "Adulto" | "Criança" | "Bebê";
  nome: string;
  sobrenome: string;
  paisResidencia: string;
  tipoDocumento: string;
  numeroDocumento: string;
  dataNascimento?: string;
  isSaved?: boolean;
}

interface TravelersCardProps {
  adultsCount: number;
  childrenCount: number;
  infantsCount: number;
  savedPassengers: ClientPassenger[];
  onSaveTravelers: (travelers: TravelerFormData[]) => Promise<void> | void;
  onAddNewPassengerToClient?: (passenger: ClientPassenger) => Promise<void> | void;
  initialTravelers?: TravelerFormData[];
}

export function TravelersCard({
  adultsCount = 1,
  childrenCount = 0,
  infantsCount = 0,
  savedPassengers = [],
  onSaveTravelers,
  onAddNewPassengerToClient,
  initialTravelers,
}: TravelersCardProps) {
  const buildInitialSlots = (): TravelerFormData[] => {
    if (initialTravelers && initialTravelers.length > 0) return initialTravelers;
    const slots: TravelerFormData[] = [];
    const effectiveAdults = Math.max(1, adultsCount);

    for (let i = 0; i < effectiveAdults; i++) {
      slots.push({
        id: `adult-${i + 1}`,
        tipo: "Adulto",
        nome: "",
        sobrenome: "",
        paisResidencia: "Brasil",
        tipoDocumento: "CPF",
        numeroDocumento: "",
      });
    }
    for (let i = 0; i < childrenCount; i++) {
      slots.push({
        id: `child-${i + 1}`,
        tipo: "Criança",
        nome: "",
        sobrenome: "",
        paisResidencia: "Brasil",
        tipoDocumento: "CPF ou RG",
        numeroDocumento: "",
        dataNascimento: "",
      });
    }
    for (let i = 0; i < infantsCount; i++) {
      slots.push({
        id: `infant-${i + 1}`,
        tipo: "Bebê",
        nome: "",
        sobrenome: "",
        paisResidencia: "Brasil",
        tipoDocumento: "CPF ou RG",
        numeroDocumento: "",
        dataNascimento: "",
      });
    }

    if (savedPassengers.length > 0) {
      savedPassengers.forEach((sp, idx) => {
        if (slots[idx]) {
          slots[idx].nome = sp.nome;
          slots[idx].sobrenome = sp.sobrenome;
          slots[idx].paisResidencia = sp.paisResidencia || "Brasil";
          slots[idx].tipoDocumento = sp.tipoDocumento || "CPF";
          slots[idx].numeroDocumento = sp.numeroDocumento;
          slots[idx].dataNascimento = sp.dataNascimento || "";
          slots[idx].isSaved = true;
        }
      });
    }
    return slots;
  };

  const [travelers, setTravelers] = useState<TravelerFormData[]>(buildInitialSlots);
  const [isSaved, setIsSaved] = useState<boolean>(() => {
    return Boolean(initialTravelers && initialTravelers.every((t) => t.nome.trim() && t.sobrenome.trim()));
  });
  const [isEditing, setIsEditing] = useState<boolean>(!isSaved);

  const updateField = (index: number, field: keyof TravelerFormData, value: string) => {
    setTravelers((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  const handleSelectSavedPassenger = (slotIndex: number, sp: ClientPassenger) => {
    setTravelers((prev) => {
      const copy = [...prev];
      copy[slotIndex] = {
        ...copy[slotIndex],
        nome: sp.nome,
        sobrenome: sp.sobrenome,
        paisResidencia: sp.paisResidencia || "Brasil",
        tipoDocumento: sp.tipoDocumento || copy[slotIndex].tipoDocumento,
        numeroDocumento: sp.numeroDocumento,
        dataNascimento: sp.dataNascimento || copy[slotIndex].dataNascimento || "",
        isSaved: true,
      };
      return copy;
    });
    toast.success(`Dados de ${sp.nome} preenchidos.`);
  };

  const handleSave = async () => {
    for (let i = 0; i < travelers.length; i++) {
      const t = travelers[i];
      if (!t.nome.trim() || !t.sobrenome.trim() || !t.numeroDocumento.trim()) {
        toast.error(`Preencha os dados do viajante ${i + 1} (${t.tipo}).`);
        return;
      }
      if ((t.tipo === "Criança" || t.tipo === "Bebê") && !t.dataNascimento?.trim()) {
        toast.error(`Informe a data de nascimento do viajante ${i + 1}.`);
        return;
      }
    }

    for (const t of travelers) {
      const alreadySaved = savedPassengers.some((sp) => sp.numeroDocumento.trim() === t.numeroDocumento.trim());
      if (!alreadySaved && onAddNewPassengerToClient) {
        await onAddNewPassengerToClient({
          id: `pass-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          nome: t.nome.trim(),
          sobrenome: t.sobrenome.trim(),
          paisResidencia: t.paisResidencia,
          tipoDocumento: t.tipoDocumento,
          numeroDocumento: t.numeroDocumento.trim(),
          dataNascimento: t.dataNascimento?.trim(),
          tipo: t.tipo,
        });
      }
    }

    await onSaveTravelers(travelers);
    setIsSaved(true);
    setIsEditing(false);
    toast.success("Dados dos passageiros salvos com sucesso.");
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-7">
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <h2 className="text-lg sm:text-xl font-bold text-slate-900">Quem vai viajar</h2>
        {isSaved && !isEditing ? (
          <button type="button" onClick={() => setIsEditing(true)} className="text-sm font-semibold text-[#5E17EB] hover:underline cursor-pointer">
            Editar
          </button>
        ) : !isEditing ? (
          <button type="button" onClick={() => setIsEditing(true)} className="text-sm font-semibold text-[#5E17EB] hover:underline cursor-pointer">
            Completar
          </button>
        ) : null}
      </div>

      <div className="pt-5">
        {isSaved && !isEditing ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {travelers.map((t, idx) => (
              <div key={idx} className="flex items-start gap-3.5 rounded-xl border border-slate-100 bg-slate-50/60 p-4">
                <div className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-2 border-[#00875A] bg-emerald-50 text-[#00875A]">
                  <User className="h-5 w-5" />
                  <span className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#00875A] text-white">
                    <Check className="h-2.5 w-2.5 stroke-[3]" />
                  </span>
                </div>
                <div className="space-y-0.5 min-w-0 flex-1">
                  <p className="truncate text-sm font-bold text-slate-900">
                    {t.nome} {t.sobrenome}
                  </p>
                  <p className="text-xs text-slate-500">
                    {t.tipoDocumento || "CPF"}: {t.numeroDocumento}
                  </p>
                  {t.dataNascimento && (
                    <p className="text-xs text-slate-500">Data de nascimento: {t.dataNascimento}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : !isEditing ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {travelers.map((t, idx) => (
              <div key={idx} className="flex items-center gap-3.5">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-dashed border-slate-300 text-slate-400">
                  <User className="h-5 w-5" />
                </div>
                <span className="text-sm font-bold text-slate-700">{t.tipo}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-6">
            {travelers.map((t, slotIdx) => (
              <TravelerSlotForm
                key={t.id}
                traveler={t}
                slotIndex={slotIdx}
                totalOfType={travelers.filter((x) => x.tipo === t.tipo).length}
                savedPassengers={savedPassengers}
                onUpdateField={(field, val) => updateField(slotIdx, field, val)}
                onSelectSaved={(sp) => handleSelectSavedPassenger(slotIdx, sp)}
              />
            ))}

            <div className="flex justify-start pt-2">
              <button
                type="button"
                onClick={handleSave}
                className="rounded-full bg-[#5E17EB] px-8 py-2.5 text-sm font-bold text-white shadow-md transition-all hover:bg-[#4d13c7] hover:shadow-lg cursor-pointer"
              >
                Salvar
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
