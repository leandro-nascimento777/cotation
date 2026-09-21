"use client";

import { useState, useMemo } from "react";
import { ArrowLeft } from "lucide-react";
import { CheckoutProgressBar } from "./CheckoutProgressBar";
import { TravelersCard, TravelerFormData } from "./TravelersCard";
import { ContactDataCard, ContactData } from "./ContactDataCard";
import { PaymentMethodsCard, PaymentSaveData } from "./PaymentMethodsCard";
import { CheckoutSidebar } from "./CheckoutSidebar";
import { CheckoutTermsAndBuy } from "./CheckoutTermsAndBuy";
import { CancellationPoliciesModal } from "./CancellationPoliciesModal";
import { PurchaseSuccessModal } from "./PurchaseSuccessModal";
import { SendToAgencyModal } from "./SendToAgencyModal";
import { TripDetailsModal } from "./TripDetailsModal";
import {
  ProposalClientSnapshot,
  ProposalAgencySnapshot,
  submitProposalCheckoutAction,
  saveProposalPassengerAction,
} from "@/lib/proposal/actions";
import { QuoteItem } from "@/lib/types";
import { ClientPassenger, ClosedFlightSelection } from "@/lib/store/types";
import { getAirportDetails } from "@/lib/flightFormatters";
import { toast } from "sonner";

interface TravelerCheckoutViewProps {
  shareId: string;
  selectedIda: ClosedFlightSelection | null;
  selectedVolta: ClosedFlightSelection | null;
  selectedIdaItem: QuoteItem | null;
  selectedVoltaItem: QuoteItem | null;
  totalPrice: number;
  adultsCount: number;
  childrenCount: number;
  infantsCount: number;
  clientSnapshot: ProposalClientSnapshot | null;
  agencySnapshot?: ProposalAgencySnapshot | null;
  proposalNumero?: string;
  destino: string;
  periodoInicio: string | null;
  periodoFim: string | null;
  onBackToFlights: () => void;
  onSuccessOrder?: (bookingRef: string) => void;
}

export function TravelerCheckoutView({
  shareId,
  selectedIda,
  selectedVolta,
  selectedIdaItem,
  selectedVoltaItem,
  totalPrice,
  adultsCount,
  childrenCount,
  infantsCount,
  clientSnapshot,
  agencySnapshot,
  proposalNumero,
  destino,
  periodoInicio,
  periodoFim,
  onBackToFlights,
  onSuccessOrder,
}: TravelerCheckoutViewProps) {
  const [savedPassengers, setSavedPassengers] = useState<ClientPassenger[]>(clientSnapshot?.savedPassengers || []);
  const [travelers, setTravelers] = useState<TravelerFormData[]>([]);
  const [hasTravelersSaved, setHasTravelersSaved] = useState(false);

  const [contact, setContact] = useState<ContactData>({
    email: clientSnapshot?.email || "",
    countryCode: "+55",
    areaCode: "11",
    phone: clientSnapshot?.telefone?.replace(/\D/g, "") || "",
    acceptOffers: true,
    acceptAlerts: true,
  });
  const [hasContactSaved, setHasContactSaved] = useState(Boolean(clientSnapshot?.email && clientSnapshot?.telefone));

  const [paymentData, setPaymentData] = useState<PaymentSaveData | null>(null);
  const [hasPaymentSaved, setHasPaymentSaved] = useState(false);

  const [authDataProcessing, setAuthDataProcessing] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);

  const [isFlightModalOpen, setIsFlightModalOpen] = useState(false);
  const [isPoliciesModalOpen, setIsPoliciesModalOpen] = useState(false);
  const [successBookingRef, setSuccessBookingRef] = useState<string | null>(null);
  const [agencySuccessBookingRef, setAgencySuccessBookingRef] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const completedSteps = useMemo(() => {
    let count = 0;
    if (hasTravelersSaved) count += 1;
    if (hasContactSaved) count += 1;
    if (hasPaymentSaved) count += 1;
    if (authDataProcessing && acceptTerms) count += 1;
    return count;
  }, [hasTravelersSaved, hasContactSaved, hasPaymentSaved, authDataProcessing, acceptTerms]);

  const primaryLeg = selectedIdaItem?.ida ?? selectedIdaItem?.volta;
  const originInfo = getAirportDetails(primaryLeg?.origin, "GRU");
  const destInfo = getAirportDetails(primaryLeg?.destination || destino, "AMS");
  const idaDateLabel = primaryLeg?.date || periodoInicio || "Seg. 21 set. 2026";
  const voltaDateLabel = selectedVoltaItem?.volta?.date || selectedIdaItem?.volta?.date || periodoFim || "Sex. 25 set. 2026";

  const handleAddNewPassenger = async (p: ClientPassenger) => {
    setSavedPassengers((prev) => [...prev, p]);
    await saveProposalPassengerAction(shareId, p);
  };

  const handleSendToAgencyOnly = async () => {
    if (!contact.email && !contact.phone) {
      toast.error("Por favor, preencha seus dados de contato (e-mail ou WhatsApp) para a agência poder retornar.");
      return;
    }

    setSubmitting(true);
    try {
      const clientPassengersToSave: ClientPassenger[] = travelers
        .filter((t) => t.nome || t.sobrenome)
        .map((t) => ({
          id: t.id,
          nome: t.nome,
          sobrenome: t.sobrenome,
          paisResidencia: t.paisResidencia,
          tipoDocumento: t.tipoDocumento,
          numeroDocumento: t.numeroDocumento,
          dataNascimento: t.dataNascimento,
          tipo: t.tipo,
        }));

      const res = await submitProposalCheckoutAction({
        shareId,
        selectedIda,
        selectedVolta,
        checkoutData: {
          travelers: clientPassengersToSave,
          contact: {
            email: contact.email,
            ddi: contact.countryCode,
            ddd: contact.areaCode,
            phone: contact.phone,
            alternativePhone: contact.alternativePhone,
            acceptOffers: contact.acceptOffers,
            acceptAlerts: contact.acceptAlerts,
          },
          payment: {
            method: "AGENCIA",
            discount: 0,
            total: totalPrice,
          },
        },
      });

      if (res.ok && res.bookingRef) {
        setAgencySuccessBookingRef(res.bookingRef);
        onSuccessOrder?.(res.bookingRef);
        toast.success("Cotação enviada para a agência com sucesso!");
      } else {
        toast.error(res.error || "Não foi possível enviar para a agência.");
      }
    } catch {
      toast.error("Erro ao enviar para a agência. Tente novamente.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleFinalBuy = async () => {
    if (!hasTravelersSaved) return toast.error("Complete os dados de quem vai viajar.");
    if (!hasContactSaved) return toast.error("Complete os dados de contato.");
    if (!hasPaymentSaved || !paymentData) return toast.error("Selecione e confirme a forma de pagamento.");
    if (!authDataProcessing || !acceptTerms) return toast.error("Aceite os termos e condições para prosseguir.");

    setSubmitting(true);
    try {
      const clientPassengersToSave: ClientPassenger[] = travelers.map((t) => ({
        id: t.id,
        nome: t.nome,
        sobrenome: t.sobrenome,
        paisResidencia: t.paisResidencia,
        tipoDocumento: t.tipoDocumento,
        numeroDocumento: t.numeroDocumento,
        dataNascimento: t.dataNascimento,
        tipo: t.tipo,
      }));

      const res = await submitProposalCheckoutAction({
        shareId,
        selectedIda,
        selectedVolta,
        checkoutData: {
          travelers: clientPassengersToSave,
          contact: {
            email: contact.email,
            ddi: contact.countryCode,
            ddd: contact.areaCode,
            phone: contact.phone,
            alternativePhone: contact.alternativePhone,
            acceptOffers: contact.acceptOffers,
            acceptAlerts: contact.acceptAlerts,
          },
          payment: {
            method: paymentData.method,
            cardData: paymentData.cardData
              ? {
                  cardNumber: paymentData.cardData.cardNumber,
                  cardHolder: paymentData.cardData.cardHolder,
                  expiry: paymentData.cardData.expiry,
                  installments: paymentData.cardData.installments,
                }
              : undefined,
            invoice: {
              fiscalType: paymentData.invoice.fiscalType,
              foreignTaxpayer: paymentData.invoice.isForeign,
              fullName: paymentData.invoice.fullName,
              cpfCnpj: paymentData.invoice.cpfCnpj,
              cep: paymentData.invoice.cep,
            },
            discount: paymentData.discount,
            total: paymentData.total,
          },
        },
      });

      if (res.ok && res.bookingRef) {
        if (paymentData.method === "AGENCIA") {
          setAgencySuccessBookingRef(res.bookingRef);
        } else {
          setSuccessBookingRef(res.bookingRef);
        }
        onSuccessOrder?.(res.bookingRef);
      } else {
        toast.error(res.error || "Não foi possível concluir a compra.");
      }
    } catch {
      toast.error("Erro ao enviar pedido. Tente novamente.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <button
          type="button"
          onClick={onBackToFlights}
          className="flex items-center gap-1.5 text-sm font-bold text-[#5E17EB] hover:underline cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" /> Voltar para a página anterior
        </button>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
          Agora só falta completar os dados e finalizar a compra!
        </h1>
      </div>

      <CheckoutProgressBar completedSteps={completedSteps} totalSteps={4} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        <div className="lg:col-span-2 space-y-6">
          <TravelersCard
            adultsCount={adultsCount}
            childrenCount={childrenCount}
            infantsCount={infantsCount}
            savedPassengers={savedPassengers}
            onSaveTravelers={(data) => {
              setTravelers(data);
              setHasTravelersSaved(true);
            }}
            onAddNewPassengerToClient={handleAddNewPassenger}
          />

          <ContactDataCard
            initialContact={{ email: clientSnapshot?.email, phone: clientSnapshot?.telefone }}
            onSaveContact={(data) => {
              setContact(data);
              setHasContactSaved(true);
            }}
          />

          <PaymentMethodsCard
            totalAmount={totalPrice}
            clientName={clientSnapshot?.nomeCompleto}
            onSavePayment={(data) => {
              setPaymentData(data);
              setHasPaymentSaved(true);
            }}
          />

          <CheckoutTermsAndBuy
            authData={authDataProcessing}
            setAuthData={setAuthDataProcessing}
            acceptTerms={acceptTerms}
            setAcceptTerms={setAcceptTerms}
            onBuy={handleFinalBuy}
            onSendToAgencyOnly={handleSendToAgencyOnly}
            isAgencyPayment={paymentData?.method === "AGENCIA"}
            submitting={submitting}
          />
        </div>

        <div className="lg:col-span-1">
          <div className="sticky top-6">
            <CheckoutSidebar
              totalPassengers={adultsCount + childrenCount + infantsCount}
              totalPrice={totalPrice}
              selectedIdaItem={selectedIdaItem}
              selectedVoltaItem={selectedVoltaItem}
              originCity={originInfo.cidade}
              destinationCity={destInfo.cidade}
              idaDateLabel={idaDateLabel}
              voltaDateLabel={voltaDateLabel}
              isPixSelected={paymentData?.method === "PIX"}
              pixDiscount={paymentData?.discount || 0}
              onOpenFlightDetails={() => setIsFlightModalOpen(true)}
              onOpenPoliciesModal={() => setIsPoliciesModalOpen(true)}
            />
          </div>
        </div>
      </div>

      <TripDetailsModal
        open={isFlightModalOpen}
        onClose={() => setIsFlightModalOpen(false)}
        selectedIdaItem={selectedIdaItem}
        selectedVoltaItem={selectedVoltaItem}
        originCity={originInfo.cidade}
        destinationCity={destInfo.cidade}
        adultsCount={adultsCount}
        childrenCount={childrenCount}
        infantsCount={infantsCount}
        onOpenPoliciesModal={() => setIsPoliciesModalOpen(true)}
      />

      <CancellationPoliciesModal open={isPoliciesModalOpen} onClose={() => setIsPoliciesModalOpen(false)} />

      {successBookingRef && (
        <PurchaseSuccessModal
          open={Boolean(successBookingRef)}
          bookingRef={successBookingRef}
          travelers={travelers}
          destination={destInfo?.cidade || destino || "Sua Viagem"}
          contactEmail={contact.email}
          onClose={() => {
            setSuccessBookingRef(null);
            onBackToFlights();
          }}
        />
      )}

      {agencySuccessBookingRef && (
        <SendToAgencyModal
          open={Boolean(agencySuccessBookingRef)}
          bookingRef={agencySuccessBookingRef}
          travelers={travelers}
          destination={destInfo?.cidade || destino || "Sua Viagem"}
          contactEmail={contact.email}
          contactPhone={
            contact.phone ? `${contact.countryCode} (${contact.areaCode}) ${contact.phone}` : undefined
          }
          agencyName={agencySnapshot?.agencyName}
          agencyPhone={agencySnapshot?.phone}
          proposalNumero={proposalNumero}
          onClose={() => {
            setAgencySuccessBookingRef(null);
            onBackToFlights();
          }}
        />
      )}
    </div>
  );
}
