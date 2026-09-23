"use client";

import { useState } from "react";
import { Users, UserPlus } from "lucide-react";
import { ClientPassenger } from "@/lib/store/types";
import { formatCpf, formatPassport } from "@/lib/format";
import { toast } from "sonner";

interface ClientPassengersSectionProps {
  clientId: string;
  passengers: ClientPassenger[];
  onAddPassenger: (clientId: string, passenger: ClientPassenger) => void;
}

export function ClientPassengersSection({
  clientId,
  passengers,
  onAddPassenger,
}: ClientPassengersSectionProps) {
  const [adding, setAdding] = useState(false);
  const [nome, setNome] = useState("");
  const [sobrenome, setSobrenome] = useState("");
  const [tipoDoc, setTipoDoc] = useState("CPF");
  const [numDoc, setNumDoc] = useState("");
  const [nasc, setNasc] = useState("");
  const [tipo, setTipo] = useState<"Adulto" | "Criança" | "Bebê">("Adulto");

  const handleSave = () => {
    if (!nome.trim() || !sobrenome.trim() || !numDoc.trim()) {
      toast.error("Preencha nome, sobrenome e número do documento.");
      return;
    }

    onAddPassenger(clientId, {
      id: `pass-${Date.now()}`,
      nome: nome.trim(),
      sobrenome: sobrenome.trim(),
      paisResidencia: "Brasil",
      tipoDocumento: tipoDoc,
      numeroDocumento: numDoc.trim(),
      dataNascimento: nasc.trim(),
      tipo,
    });

    setAdding(false);
    setNome("");
    setSobrenome("");
    setNumDoc("");
    setNasc("");
    toast.success("Passageiro salvo na ficha do cliente.");
  };

  return (
    <section className="rounded-3xl border border-slate-200/80 bg-white p-5 sm:p-6 shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 sm:h-5 sm:w-5 text-indigo-600" />
          <h2 className="text-sm sm:text-base font-bold text-slate-800">Passageiros cadastrados</h2>
        </div>
        <button
          type="button"
          onClick={() => setAdding((p) => !p)}
          className="flex items-center gap-1.5 rounded-xl border border-indigo-200 bg-white px-3.5 py-1.5 text-xs font-bold text-indigo-600 hover:bg-indigo-50/80 shadow-xs transition cursor-pointer"
        >
          <UserPlus className="h-3.5 w-3.5" />
          {adding ? "Cancelar" : "Adicionar passageiro"}
        </button>
      </div>

      {adding && (
        <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input
              type="text"
              placeholder="Nome"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              className="rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs focus:outline-none focus:border-indigo-500"
            />
            <input
              type="text"
              placeholder="Sobrenome"
              value={sobrenome}
              onChange={(e) => setSobrenome(e.target.value)}
              className="rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs focus:outline-none focus:border-indigo-500"
            />
            <div className="flex gap-2">
              <select
                value={tipoDoc}
                onChange={(e) => setTipoDoc(e.target.value)}
                className="w-24 rounded-xl border border-slate-300 bg-white px-2 py-2 text-xs focus:outline-none"
              >
                <option value="CPF">CPF</option>
                <option value="Passaporte">Passaporte</option>
                <option value="RG">RG</option>
              </select>
              <input
                type="text"
                placeholder="Número do documento"
                value={numDoc}
                onChange={(e) => setNumDoc(e.target.value)}
                className="flex-1 rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div className="flex gap-2">
              <select
                value={tipo}
                onChange={(e) => setTipo(e.target.value as "Adulto" | "Criança" | "Bebê")}
                className="w-28 rounded-xl border border-slate-300 bg-white px-2 py-2 text-xs focus:outline-none"
              >
                <option value="Adulto">Adulto</option>
                <option value="Criança">Criança</option>
                <option value="Bebê">Bebê</option>
              </select>
              <input
                type="text"
                placeholder="Nascimento: DD/MM/AAAA"
                value={nasc}
                onChange={(e) => setNasc(e.target.value)}
                className="flex-1 rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>
          <div className="flex justify-end pt-1">
            <button
              type="button"
              onClick={handleSave}
              className="rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white hover:bg-indigo-700 shadow-xs cursor-pointer transition"
            >
              Salvar na ficha
            </button>
          </div>
        </div>
      )}

      {passengers.length === 0 ? (
        <p className="text-xs text-slate-400 py-3">
          Nenhum passageiro cadastrado ainda. Eles serão salvos automaticamente aqui quando preenchidos na proposta.
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {passengers.map((p) => (
            <div
              key={p.id}
              className="rounded-2xl border border-slate-100 bg-[#f8fafc] p-4 text-xs space-y-1 shadow-2xs"
            >
              <p className="text-sm font-bold text-slate-800">
                {p.nome} {p.sobrenome}
                <span className="ml-1 text-xs font-normal text-slate-400">
                  ({p.tipo || "Adulto"})
                </span>
              </p>
              <p className="text-xs font-medium text-slate-500 uppercase">
                {p.tipoDocumento || "CPF"}:{" "}
                {p.tipoDocumento === "CPF"
                  ? formatCpf(p.numeroDocumento)
                  : p.tipoDocumento === "Passaporte"
                  ? formatPassport(p.numeroDocumento)
                  : p.numeroDocumento}
              </p>
              {p.dataNascimento && (
                <p className="text-xs font-normal text-slate-400">
                  Nascimento: {p.dataNascimento}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
