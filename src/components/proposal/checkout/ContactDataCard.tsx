"use client";

import { useState } from "react";
import { Mail, Smartphone, Check } from "lucide-react";
import { ContactEditForm } from "./ContactEditForm";
import { toast } from "sonner";

export interface ContactData {
  email: string;
  countryCode: string;
  areaCode: string;
  phone: string;
  alternativePhone?: string;
  acceptOffers: boolean;
  acceptAlerts: boolean;
}

interface ContactDataCardProps {
  initialContact?: Partial<ContactData>;
  onSaveContact: (contact: ContactData) => void;
}

export function ContactDataCard({ initialContact, onSaveContact }: ContactDataCardProps) {
  const [email, setEmail] = useState(initialContact?.email || "");
  const [countryCode, setCountryCode] = useState(initialContact?.countryCode || "+55");
  const [areaCode, setAreaCode] = useState(initialContact?.areaCode || "11");
  const [phone, setPhone] = useState(initialContact?.phone || "");
  const [showAlt, setShowAlt] = useState(false);
  const [altPhone, setAltPhone] = useState(initialContact?.alternativePhone || "");
  const [acceptOffers, setAcceptOffers] = useState(initialContact?.acceptOffers ?? true);
  const [acceptAlerts, setAcceptAlerts] = useState(initialContact?.acceptAlerts ?? true);

  const [isSaved, setIsSaved] = useState<boolean>(() => Boolean(initialContact?.email && initialContact?.phone));
  const [isEditing, setIsEditing] = useState<boolean>(!isSaved);

  const handleSave = () => {
    if (!email.trim() || !email.includes("@")) {
      toast.error("Informe um e-mail válido.");
      return;
    }
    if (!areaCode.trim() || !phone.trim()) {
      toast.error("Informe o número de celular completo com DDD.");
      return;
    }

    onSaveContact({
      email: email.trim(),
      countryCode,
      areaCode: areaCode.trim(),
      phone: phone.trim(),
      alternativePhone: showAlt ? altPhone.trim() : undefined,
      acceptOffers,
      acceptAlerts,
    });
    setIsSaved(true);
    setIsEditing(false);
    toast.success("Dados de contato salvos com sucesso.");
  };

  const formattedPhone = `${countryCode} (${areaCode}) ${phone}`;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-7">
      <div className="flex items-start justify-between border-b border-slate-100 pb-4">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-slate-900">Dados de contato</h2>
          <p className="mt-0.5 text-xs text-slate-500">
            São essenciais para que você receba os vouchers e informações importantes da viagem.
          </p>
        </div>

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
        {!isEditing ? (
          <div className="flex flex-wrap items-center gap-6 sm:gap-10">
            <div className="flex items-center gap-3">
              <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-[#00875A] bg-emerald-50 text-[#00875A]">
                <Mail className="h-4.5 w-4.5" />
                <span className="absolute -bottom-1 -right-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-[#00875A] text-white">
                  <Check className="h-2 w-2 stroke-[3]" />
                </span>
              </div>
              <div>
                <p className="text-xs font-bold text-slate-800">E-mail</p>
                <p className="text-xs text-slate-500">{email || "—"}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {isSaved && phone ? (
                <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-[#00875A] bg-emerald-50 text-[#00875A]">
                  <Smartphone className="h-4.5 w-4.5" />
                  <span className="absolute -bottom-1 -right-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-[#00875A] text-white">
                    <Check className="h-2 w-2 stroke-[3]" />
                  </span>
                </div>
              ) : (
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-dashed border-slate-300 text-slate-400">
                  <Smartphone className="h-4.5 w-4.5" />
                </div>
              )}
              <div>
                <p className="text-xs font-bold text-slate-800">Celular</p>
                <p className="text-xs text-slate-500">{isSaved && phone ? formattedPhone : "Pendente"}</p>
              </div>
            </div>
          </div>
        ) : (
          <ContactEditForm
            email={email}
            setEmail={setEmail}
            countryCode={countryCode}
            setCountryCode={setCountryCode}
            areaCode={areaCode}
            setAreaCode={setAreaCode}
            phone={phone}
            setPhone={setPhone}
            showAlt={showAlt}
            setShowAlt={setShowAlt}
            altPhone={altPhone}
            setAltPhone={setAltPhone}
            acceptOffers={acceptOffers}
            setAcceptOffers={setAcceptOffers}
            acceptAlerts={acceptAlerts}
            setAcceptAlerts={setAcceptAlerts}
            onSave={handleSave}
          />
        )}
      </div>
    </div>
  );
}
