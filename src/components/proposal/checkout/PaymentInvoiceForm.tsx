"use client";

import { ShieldCheck } from "lucide-react";

export interface InvoiceData {
  fiscalType: "PF" | "PJ";
  isForeign: boolean;
  fullName: string;
  cpfCnpj: string;
  cep: string;
}

interface PaymentInvoiceFormProps {
  data: InvoiceData;
  onChange: (field: keyof InvoiceData, value: string | boolean) => void;
  cepError?: boolean;
}

export function PaymentInvoiceForm({ data, onChange, cepError }: PaymentInvoiceFormProps) {
  return (
    <div className="border-t border-slate-100 pt-6 space-y-4">
      <h3 className="text-base font-bold text-slate-900">Em nome de quem emitimos a nota fiscal?</h3>

      <div className="max-w-xs">
        <label className="block text-[11px] font-medium text-slate-500 mb-1">Situação fiscal</label>
        <select
          value={data.fiscalType}
          onChange={(e) => onChange("fiscalType", e.target.value as "PF" | "PJ")}
          className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm font-medium text-slate-800 focus:border-[#5E17EB] focus:outline-none"
        >
          <option value="PF">Pessoa física</option>
          <option value="PJ">Pessoa jurídica</option>
        </select>
      </div>

      <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
        <input
          type="checkbox"
          checked={data.isForeign}
          onChange={(e) => onChange("isForeign", e.target.checked)}
          className="h-4 w-4 rounded text-[#5E17EB] accent-[#5E17EB]"
        />
        <span>Contribuinte estrangeiro</span>
      </label>

      <div>
        <label className="block text-[11px] font-medium text-slate-500 mb-1">Nome completo</label>
        <input
          type="text"
          value={data.fullName}
          onChange={(e) => onChange("fullName", e.target.value)}
          placeholder="Nome completo"
          className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:border-[#5E17EB] focus:outline-none"
        />
        <p className="mt-1 text-[11px] text-slate-400">Como está no documento.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-[11px] font-medium text-slate-500 mb-1">
            {data.fiscalType === "PJ" ? "CNPJ" : "CPF"}
          </label>
          <input
            type="text"
            value={data.cpfCnpj}
            onChange={(e) => onChange("cpfCnpj", e.target.value)}
            placeholder="000.000.000-00"
            className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-800 focus:border-[#5E17EB] focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-[11px] font-medium text-slate-500 mb-1">CEP</label>
          <input
            type="text"
            value={data.cep}
            maxLength={9}
            onChange={(e) => onChange("cep", e.target.value)}
            placeholder="00000-000"
            className={`w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm text-slate-800 focus:outline-none ${
              cepError ? "border-red-500 focus:border-red-600 ring-1 ring-red-500" : "border-slate-300 focus:border-[#5E17EB]"
            }`}
          />
          {cepError ? (
            <p className="mt-1 text-[11px] font-semibold text-red-600 flex items-center gap-1">
              ▲ Insira o número do CEP.
            </p>
          ) : (
            <p className="mt-1 text-[11px] text-slate-400">Exemplo: 57490970.</p>
          )}
        </div>
      </div>

      {/* Selos de segurança */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-4 border-t border-slate-100 text-xs text-slate-500">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-emerald-600" />
          <span>
            <strong className="text-slate-700">Este é um site seguro</strong> — Protegemos as suas informações com redes seguras.
          </span>
        </div>
        <div className="flex items-center gap-2 select-none">
          <span className="rounded border border-slate-300 bg-slate-50 px-2 py-0.5 text-[10px] font-bold text-slate-600">
            VeriSign Secured
          </span>
          <span className="rounded border border-blue-200 bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-blue-700">
            CertiSur
          </span>
        </div>
      </div>
    </div>
  );
}
