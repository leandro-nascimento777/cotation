"use client";

import { Plus } from "lucide-react";

interface ContactEditFormProps {
  email: string;
  setEmail: (val: string) => void;
  countryCode: string;
  setCountryCode: (val: string) => void;
  areaCode: string;
  setAreaCode: (val: string) => void;
  phone: string;
  setPhone: (val: string) => void;
  showAlt: boolean;
  setShowAlt: (val: boolean) => void;
  altPhone: string;
  setAltPhone: (val: string) => void;
  acceptOffers: boolean;
  setAcceptOffers: (val: boolean) => void;
  acceptAlerts: boolean;
  setAcceptAlerts: (val: boolean) => void;
  onSave: () => void;
}

export function ContactEditForm({
  email,
  setEmail,
  countryCode,
  setCountryCode,
  areaCode,
  setAreaCode,
  phone,
  setPhone,
  showAlt,
  setShowAlt,
  altPhone,
  setAltPhone,
  acceptOffers,
  setAcceptOffers,
  acceptAlerts,
  setAcceptAlerts,
  onSave,
}: ContactEditFormProps) {
  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <h3 className="text-sm sm:text-base font-bold text-slate-900">Para qual e-mail enviamos os vouchers?</h3>
        <p className="text-xs text-slate-500">Esse dado é essencial para enviarmos seus vouchers e informações.</p>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="seuemail@exemplo.com"
          className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:border-[#5E17EB] focus:outline-none"
        />
        <label className="flex items-start gap-2.5 text-xs text-slate-600 cursor-pointer">
          <input
            type="checkbox"
            checked={acceptOffers}
            onChange={(e) => setAcceptOffers(e.target.checked)}
            className="mt-0.5 h-4 w-4 rounded text-[#5E17EB] accent-[#5E17EB]"
          />
          <span>Quero receber as melhores ofertas e promoções para a minha viagem por e-mail.</span>
        </label>
      </div>

      <div className="border-t border-slate-100 pt-5 space-y-3">
        <h3 className="text-sm sm:text-base font-bold text-slate-900">Em que número de celular podemos falar com você?</h3>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <div className="sm:col-span-1">
            <label className="block text-[11px] font-medium text-slate-500 mb-1">Código do país</label>
            <select
              value={countryCode}
              onChange={(e) => setCountryCode(e.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-800 focus:border-[#5E17EB] focus:outline-none"
            >
              <option value="+55">🇧🇷 Brasil (55)</option>
              <option value="+1">🇺🇸 EUA (1)</option>
              <option value="+351">🇵🇹 Portugal (351)</option>
            </select>
          </div>
          <div className="sm:col-span-1">
            <label className="block text-[11px] font-medium text-slate-500 mb-1">Área</label>
            <input
              type="text"
              value={areaCode}
              maxLength={3}
              onChange={(e) => setAreaCode(e.target.value.replace(/\D/g, ""))}
              placeholder="11"
              className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-800 focus:border-[#5E17EB] focus:outline-none"
            />
            <p className="mt-1 text-[10px] text-slate-400">DDD. Exemplo: 11.</p>
          </div>
          <div className="sm:col-span-2">
            <label className="block text-[11px] font-medium text-slate-500 mb-1">Celular</label>
            <input
              type="tel"
              value={phone}
              maxLength={11}
              onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
              placeholder="900000000"
              className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-800 focus:border-[#5E17EB] focus:outline-none"
            />
            <p className="mt-1 text-[10px] text-slate-400">Sem DDD. Exemplo: 900000000</p>
          </div>
        </div>

        {!showAlt ? (
          <button
            type="button"
            onClick={() => setShowAlt(true)}
            className="flex items-center gap-1.5 text-xs font-bold text-[#5E17EB] hover:underline cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5" /> Incluir outro celular
          </button>
        ) : (
          <div className="pt-2 max-w-sm">
            <input
              type="tel"
              value={altPhone}
              onChange={(e) => setAltPhone(e.target.value)}
              placeholder="Celular secundário (opcional)"
              className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-800 focus:border-[#5E17EB] focus:outline-none"
            />
          </div>
        )}

        <label className="flex items-start gap-2.5 text-xs text-slate-600 cursor-pointer pt-1">
          <input
            type="checkbox"
            checked={acceptAlerts}
            onChange={(e) => setAcceptAlerts(e.target.checked)}
            className="mt-0.5 h-4 w-4 rounded text-[#5E17EB] accent-[#5E17EB]"
          />
          <span>Quero receber detalhes da minha compra, estado do voo e avisos por WhatsApp ou SMS.</span>
        </label>
      </div>

      <div className="flex justify-start pt-2">
        <button
          type="button"
          onClick={onSave}
          className="rounded-full bg-[#5E17EB] px-8 py-2.5 text-sm font-bold text-white shadow-md transition-all hover:bg-[#4d13c7] hover:shadow-lg cursor-pointer"
        >
          Salvar
        </button>
      </div>
    </div>
  );
}
