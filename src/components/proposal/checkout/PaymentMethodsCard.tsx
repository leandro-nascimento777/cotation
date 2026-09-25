"use client";

import { useState } from "react";
import { CreditCard, Check, Building2 } from "lucide-react";
import { PaymentInvoiceForm, InvoiceData } from "./PaymentInvoiceForm";
import { PaymentCreditCardForm, CardFormData } from "./PaymentCreditCardForm";
import { PaymentPixSelectedBox } from "./PaymentPixSelectedBox";
import { PaymentRadioGroup } from "./PaymentRadioGroup";
import { formatCurrencyBRL } from "@/lib/format";
import { toast } from "sonner";

export type PaymentMethodKind = "CARTAO" | "PIX" | "NUPAY" | "AGENCIA";

export interface PaymentSaveData {
  method: PaymentMethodKind;
  cardData?: CardFormData;
  invoice: InvoiceData;
  discount: number;
  total: number;
}

interface PaymentMethodsCardProps {
  totalAmount: number;
  clientName?: string;
  clientCpf?: string;
  onSavePayment: (data: PaymentSaveData) => void;
  onOpenPixModal?: () => void;
}

export function PaymentMethodsCard({
  totalAmount,
  clientName = "",
  clientCpf = "",
  onSavePayment,
  onOpenPixModal,
}: PaymentMethodsCardProps) {
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethodKind>("PIX");
  const [combinePayments, setCombinePayments] = useState(false);
  const [combineOption, setCombineOption] = useState<"2card" | "cardPix" | "3card">("cardPix");

  const [cardData, setCardData] = useState<CardFormData>({
    cardNumber: "",
    cardHolder: clientName || "",
    expiry: "",
    cvv: "",
    holderCpf: clientCpf || "",
    installments: 1,
    saveCard: true,
  });

  const [invoice, setInvoice] = useState<InvoiceData>({
    fiscalType: "PF",
    isForeign: false,
    fullName: clientName || "",
    cpfCnpj: clientCpf || "",
    cep: "",
  });

  const [cepError, setCepError] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isEditing, setIsEditing] = useState(true);

  const pixDiscount = selectedMethod === "PIX" ? Math.max(9.02, totalAmount * 0.01) : 0;
  const finalTotal = Math.max(0, totalAmount - pixDiscount);

  const handleUpdateCard = (field: keyof CardFormData, val: string | number | boolean) => {
    setCardData((prev) => ({ ...prev, [field]: val }));
  };

  const handleUpdateInvoice = (field: keyof InvoiceData, val: string | boolean) => {
    if (field === "cep") setCepError(false);
    setInvoice((prev) => ({ ...prev, [field]: val }));
  };

  const handleSave = () => {
    if (selectedMethod !== "AGENCIA" && (!invoice.cep.trim() || invoice.cep.replace(/\D/g, "").length < 5)) {
      setCepError(true);
      toast.error("Insira o número do CEP.");
      return;
    }
    if (selectedMethod === "CARTAO" && (!cardData.cardNumber || !cardData.cardHolder)) {
      toast.error("Preencha os dados do cartão de crédito.");
      return;
    }

    onSavePayment({
      method: selectedMethod,
      cardData: selectedMethod === "CARTAO" ? cardData : undefined,
      invoice,
      discount: pixDiscount,
      total: selectedMethod === "AGENCIA" ? totalAmount : finalTotal,
    });

    setIsSaved(true);
    setIsEditing(false);
    toast.success(
      selectedMethod === "AGENCIA"
        ? "Opção de pagamento com a agência confirmada."
        : "Forma de pagamento confirmada."
    );
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-7 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div className="flex items-center gap-3">
          <h2 className="text-lg sm:text-xl font-bold text-slate-900">Formas de pagamento</h2>
          <button
            type="button"
            onClick={() => toast.info("Condições de parcelamento e opções disponíveis com a agência.")}
            className="hidden md:flex items-center gap-1.5 rounded-full border border-[#5E17EB] px-3 py-1 text-xs font-semibold text-[#5E17EB] hover:bg-[#5E17EB]/5 transition cursor-pointer"
          >
            <CreditCard className="h-3.5 w-3.5" /> Opções de pagamento e faturamento
          </button>
        </div>

        {isSaved && !isEditing ? (
          <button type="button" onClick={() => setIsEditing(true)} className="text-sm font-semibold text-[#5E17EB] hover:underline cursor-pointer">
            Trocar
          </button>
        ) : !isEditing ? (
          <button type="button" onClick={() => setIsEditing(true)} className="text-sm font-semibold text-[#5E17EB] hover:underline cursor-pointer">
            Selecionar
          </button>
        ) : null}
      </div>

      {isSaved && !isEditing ? (
        <div className="flex items-center gap-4 rounded-xl border border-slate-100 bg-slate-50/50 p-4">
          <div className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-2 border-[#00875A] bg-emerald-50 text-[#00875A]">
            {selectedMethod === "AGENCIA" ? (
              <Building2 className="h-5 w-5 stroke-[2.5]" />
            ) : (
              <span className="font-bold text-base">❖</span>
            )}
            <span className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#00875A] text-white">
              <Check className="h-2.5 w-2.5 stroke-[3]" />
            </span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm text-slate-900">
                {selectedMethod === "PIX"
                  ? "Pix"
                  : selectedMethod === "CARTAO"
                  ? "Cartão de crédito"
                  : selectedMethod === "AGENCIA"
                  ? "Combinar com a agência"
                  : "NuPay"}
              </span>
              {selectedMethod === "PIX" && (
                <span className="rounded bg-teal-100 px-2 py-0.5 text-[10px] font-bold text-teal-700">pix</span>
              )}
              {selectedMethod === "AGENCIA" && (
                <span className="rounded bg-indigo-100 px-2 py-0.5 text-[10px] font-bold text-indigo-700">
                  pagar depois
                </span>
              )}
            </div>
            <p className="text-xs text-slate-600">
              {selectedMethod === "AGENCIA" ? (
                <span>
                  Valor da proposta: <strong>{formatCurrencyBRL(totalAmount)}</strong> (pagamento a combinar com consultor)
                </span>
              ) : (
                <>
                  1 parcela de: <strong>{formatCurrencyBRL(finalTotal)}</strong>
                  {pixDiscount > 0 && (
                    <span className="text-emerald-600 font-bold ml-2">
                      Desconto: -{formatCurrencyBRL(pixDiscount)}
                    </span>
                  )}
                </>
              )}
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs sm:text-sm font-bold text-slate-800">Combinar meios de pagamento</span>
              <input
                type="checkbox"
                checked={combinePayments}
                onChange={(e) => setCombinePayments(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-[#5E17EB] accent-[#5E17EB] cursor-pointer"
              />
            </div>
            {combinePayments && (
              <div className="flex flex-wrap gap-2 pt-1">
                {(["2card", "cardPix", "3card"] as const).map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => setCombineOption(opt)}
                    className={`rounded-full px-3.5 py-1 text-xs font-bold transition cursor-pointer ${
                      combineOption === opt
                        ? "border-2 border-[#5E17EB] bg-purple-50 text-[#5E17EB]"
                        : "border border-slate-300 bg-white text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    {opt === "2card" ? "2 cartões" : opt === "cardPix" ? "Cartão + PIX" : "3 cartões"}
                  </button>
                ))}
              </div>
            )}
          </div>

          <PaymentRadioGroup selectedMethod={selectedMethod} onSelectMethod={setSelectedMethod} />

          {selectedMethod === "AGENCIA" && (
            <div className="rounded-2xl border border-indigo-200 bg-indigo-50/70 p-5 space-y-2.5 animate-in fade-in duration-200">
              <div className="flex items-center gap-2 text-indigo-900 font-bold text-sm">
                <Building2 className="h-5 w-5 text-[#5E17EB]" />
                Não quer pagar online agora? Pague diretamente com a agência!
              </div>
              <p className="text-xs leading-relaxed text-slate-600">
                Você não precisa cadastrar cartão nem fazer Pix no site agora. Ao finalizar, nossa equipe receberá a sua seleção de voos e os dados dos passageiros para providenciar a emissão e combinar o pagamento:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
                <div className="rounded-xl bg-white p-3 border border-indigo-100 text-xs">
                  <strong className="block text-slate-800 mb-0.5">🏢 Faturamento</strong>
                  <span className="text-[11px] text-slate-500">Boleto ou fatura para empresas (PJ)</span>
                </div>
                <div className="rounded-xl bg-white p-3 border border-indigo-100 text-xs">
                  <strong className="block text-slate-800 mb-0.5">💳 Link da Agência</strong>
                  <span className="text-[11px] text-slate-500">Link direto ou parcelamento assistido</span>
                </div>
                <div className="rounded-xl bg-white p-3 border border-indigo-100 text-xs">
                  <strong className="block text-slate-800 mb-0.5">🏦 Pix / TED</strong>
                  <span className="text-[11px] text-slate-500">Transferência bancária direta</span>
                </div>
              </div>
            </div>
          )}

          {selectedMethod !== "AGENCIA" && (
            <p className="text-xs text-slate-500">
              Você tem um cupom?{" "}
              <span
                onClick={() => toast.info("Cupom aplicado automaticamente se elegível.")}
                className="font-bold text-[#5E17EB] hover:underline cursor-pointer"
              >
                Ative seu cupom aqui
              </span>
            </p>
          )}

          {selectedMethod === "CARTAO" && (
            <PaymentCreditCardForm cardData={cardData} onChange={handleUpdateCard} totalAmount={totalAmount} />
          )}

          {selectedMethod === "PIX" && (
            <PaymentPixSelectedBox
              totalWithDiscount={finalTotal}
              discountAmount={pixDiscount}
              onShowInstructions={() => {
                if (onOpenPixModal) onOpenPixModal();
                else toast.info("Instruções Pix: o QR Code será exibido após clicar em Comprar.");
              }}
            />
          )}

          <PaymentInvoiceForm
            data={invoice}
            onChange={handleUpdateInvoice}
            cepError={selectedMethod === "AGENCIA" ? false : cepError}
          />

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
  );
}
