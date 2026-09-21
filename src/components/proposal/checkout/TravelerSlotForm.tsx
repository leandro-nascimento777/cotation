"use client";

import { ClientPassenger } from "@/lib/store/types";
import { TravelerFormData } from "./TravelersCard";

interface TravelerSlotFormProps {
  traveler: TravelerFormData;
  slotIndex: number;
  totalOfType: number;
  savedPassengers: ClientPassenger[];
  onUpdateField: (field: keyof TravelerFormData, value: string) => void;
  onSelectSaved: (sp: ClientPassenger) => void;
}

export function TravelerSlotForm({
  traveler,
  slotIndex,
  totalOfType,
  savedPassengers,
  onUpdateField,
  onSelectSaved,
}: TravelerSlotFormProps) {
  const isMinor = traveler.tipo === "Criança" || traveler.tipo === "Bebê";

  return (
    <div className="space-y-4 rounded-xl border border-slate-100 bg-slate-50/40 p-4 sm:p-5">
      <div className="flex items-center justify-between border-b border-slate-200/80 pb-2.5">
        <h3 className="text-sm sm:text-base font-bold text-slate-900">
          {traveler.tipo} {totalOfType > 1 ? `#${slotIndex + 1}` : ""}
        </h3>
        {savedPassengers.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 hidden sm:inline">Passageiro cadastrado:</span>
            <select
              onChange={(e) => {
                const found = savedPassengers.find((p) => p.id === e.target.value);
                if (found) onSelectSaved(found);
              }}
              className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 shadow-sm focus:border-[#5E17EB] focus:outline-none"
              defaultValue=""
            >
              <option value="" disabled>Escolher cadastrado...</option>
              {savedPassengers.map((sp) => (
                <option key={sp.id} value={sp.id}>
                  {sp.nome} {sp.sobrenome} ({sp.tipoDocumento}: {sp.numeroDocumento})
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <input
            type="text"
            value={traveler.nome}
            onChange={(e) => onUpdateField("nome", e.target.value)}
            placeholder="Nome"
            className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:border-[#5E17EB] focus:outline-none"
          />
          <p className="mt-1 text-[11px] text-slate-500">Como está no documento.</p>
        </div>
        <div>
          <input
            type="text"
            value={traveler.sobrenome}
            onChange={(e) => onUpdateField("sobrenome", e.target.value)}
            placeholder="Último sobrenome"
            className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:border-[#5E17EB] focus:outline-none"
          />
          <p className="mt-1 text-[11px] text-slate-500">
            Se o último sobrenome for Filho, Junior ou Neto, insira os 2 últimos sobrenomes.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div>
          <label className="block text-[11px] font-medium text-slate-500 mb-1">País de residência</label>
          <select
            value={traveler.paisResidencia}
            onChange={(e) => onUpdateField("paisResidencia", e.target.value)}
            className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm font-medium text-slate-800 focus:border-[#5E17EB] focus:outline-none"
          >
            <option value="Brasil">🇧🇷 Brasil</option>
            <option value="Argentina">🇦🇷 Argentina</option>
            <option value="Estados Unidos">🇺🇸 Estados Unidos</option>
            <option value="Portugal">🇵🇹 Portugal</option>
            <option value="Outro">🌐 Outro</option>
          </select>
        </div>

        <div>
          <label className="block text-[11px] font-medium text-slate-500 mb-1">Tipo de documento</label>
          <select
            value={traveler.tipoDocumento}
            onChange={(e) => onUpdateField("tipoDocumento", e.target.value)}
            className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm font-medium text-slate-800 focus:border-[#5E17EB] focus:outline-none"
          >
            <option value="CPF">CPF</option>
            <option value="CPF ou RG">CPF ou RG</option>
            <option value="Passaporte">Passaporte</option>
          </select>
        </div>

        <div>
          <label className="block text-[11px] font-medium text-slate-500 mb-1">
            {traveler.tipoDocumento === "CPF" ? "Número do CPF" : "Número do documento"}
          </label>
          <input
            type="text"
            value={traveler.numeroDocumento}
            onChange={(e) => onUpdateField("numeroDocumento", e.target.value)}
            placeholder={traveler.tipoDocumento === "CPF" ? "000.000.000-00" : "Número"}
            className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:border-[#5E17EB] focus:outline-none"
          />
        </div>
      </div>

      {isMinor && (
        <div className="max-w-xs">
          <label className="block text-[11px] font-medium text-slate-500 mb-1">Data de nascimento</label>
          <input
            type="text"
            value={traveler.dataNascimento || ""}
            onChange={(e) => onUpdateField("dataNascimento", e.target.value)}
            placeholder="dd/mm/aaaa"
            className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:border-[#5E17EB] focus:outline-none"
          />
          <p className="mt-1 text-[11px] text-slate-400">dd/mm/aaaa</p>
        </div>
      )}
    </div>
  );
}
