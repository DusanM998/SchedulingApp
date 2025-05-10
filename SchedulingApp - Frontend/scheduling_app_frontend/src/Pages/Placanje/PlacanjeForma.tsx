import { PaymentElement, useElements, useStripe } from '@stripe/react-stripe-js';
import React, { useState } from 'react'
import { data, useLocation, useNavigate } from 'react-router-dom'
import { useKreirajRezervacijuMutation } from '../../apis/rezervacijaApi';
import { rezervacijaSummaryProps } from '../Rezervacija/rezervacijaSummaryProps';
import { apiResponse, stavkaKorpeModel } from '../../Interfaces';
import { SD_Status } from '../../Utility/SD';
import { toastNotify } from '../../Helper';

function PlacanjeForma({data, userInput}: rezervacijaSummaryProps) {

    const navigate = useNavigate();
    const stripe = useStripe();
    const elements = useElements();
    const [isProcessing, setIsProcessing] = useState(false);
    const location = useLocation();
    const ukupnoCena = location.state?.ukupnoCena || 0;
    const [paymentMethod, setPaymentMethod] = useState<'kartica' | 'gotovina'>('gotovina');

    const [kreirajRezervaciju] = useKreirajRezervacijuMutation();

    const potvrdiRezervaciju = async () => {
        setIsProcessing(true);

        if (paymentMethod === 'gotovina') {
            potvrdiRezervaciju();
            return;
        }

        let ukupnoCena = data.stavkaKorpe?.reduce((suma, stavka) => 
            suma + (stavka.cenaZaObjekat ?? 0), 0);
        let kolicina = 0;

        const rezervacijaDetalji = data.stavkaKorpe?.flatMap((stavka: stavkaKorpeModel) =>
            stavka.odabraniTermini?.map((termin) => ({
                terminId: termin.terminId,
                termin: {
                    terminId: termin.terminId,
                    sportskiObjekatId: termin.sportskiObjekatId,
                    datumTermina: termin.datumTermina,
                    vremePocetka: termin.vremePocetka,
                    vremeZavrsetka: termin.vremeZavrsetka,
                    status: termin.status
                },
                cena: ukupnoCena,
                brojUcesnika: stavka.kolicina ?? 0
            })) ?? []
        );
        

        /*data.stavkaKorpe?.forEach((stavka: stavkaKorpeModel) => {
            const tempRezervacijaDetalji: any = {};
            //tempRezervacijaDetalji["sportskiObjekatId"] = stavka.sportskiObjekat?.sportskiObjekatId;
            tempRezervacijaDetalji["kolicina"] = stavka.kolicina;
            tempRezervacijaDetalji["naziv"] = stavka.sportskiObjekat?.naziv;
            tempRezervacijaDetalji["cenaPoSatu"] = stavka.sportskiObjekat?.cenaPoSatu;
            rezervacijaDetaljiDTO.push(tempRezervacijaDetalji);
            kolicina += stavka.kolicina!;
        });*/

        const response: apiResponse = await kreirajRezervaciju({
            imeKorisnika: userInput.name,
            brojKorisnika: userInput.phoneNumber,
            emailKorisnika: userInput.email,
            applicationUserId: data.userId,
            status: SD_Status.Potvrdjena,
            ukupnoRezervacija: data.stavkaKorpe?.length,
            rezervacijaDetalji: rezervacijaDetalji,
            stripePaymentIntentId: data.stripePaymentIntentId,
        });

        console.log("Logujem response", response);

        if (response) {
            if (response.data?.result.status === SD_Status.Potvrdjena) {
                navigate(`/`);
            }
            else {
                navigate("/failed");
            }
        }

        setIsProcessing(false);
    }

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
    
        if (!stripe || !elements) return;
    
        setIsProcessing(true);
    
        const ukupnoCena = data.stavkaKorpe?.reduce(
            (suma: number, stavka: stavkaKorpeModel) => suma + (stavka.cenaZaObjekat ?? 0),
            0
        );
    
        const rezervacijaDetalji = data.stavkaKorpe?.flatMap((stavka: stavkaKorpeModel) =>
            (stavka.odabraniTermini ?? []).map((termin) => ({
                terminId: termin.terminId,
                cena: stavka.cenaZaObjekat,
                brojUcesnika: stavka.kolicina ?? 0
            }))
        ) ?? [];
    
        const rezervacijaPayload = {
            imeKorisnika: userInput.name,
            brojKorisnika: userInput.phoneNumber,
            emailKorisnika: userInput.email,
            stripePaymentIntentId: data.stripePaymentIntentId,
            applicationUserId: data.userId,
            ukupnoCena: ukupnoCena,
            ukupnoRezervacija: data.stavkaKorpe?.length,
            rezervacijaDetaljiCreateDTO: rezervacijaDetalji,
            status: SD_Status.Potvrdjena
        };
    
        try {
            // Ako je kartično plaćanje
            if (paymentMethod === "kartica") {
                const result = await stripe.confirmPayment({
                    elements,
                    confirmParams: {
                        return_url: "https://example.com/rezervacija/complete", 
                    },
                    redirect: "if_required"
                });
    
                console.log("Stripe Payment Result:", result);
    
                if (result.error) {
                    console.error("Stripe error:", result.error);
                    toastNotify("Greška: " + result.error.message, "error");
                    setIsProcessing(false);
                    return;
                }
    
                // Ako nije "succeeded", tretiraj kao neuspelo
                if (result.paymentIntent?.status !== "succeeded") {
                    throw new Error("Plaćanje nije uspelo. Status: " + result.paymentIntent?.status);
                }
            }
    
            // Kreiraj rezervaciju nakon uspešnog plaćanja ili ako je gotovina
            const response: apiResponse = await kreirajRezervaciju(rezervacijaPayload);

            const statusRezervacije = (response.data?.result as any)?.status;
    
            console.log("Rezervacija uspešna:", response);

            console.log("Status iz rezultata: ", response.data?.result.status);
            console.log("Status iz SD_Status: ", SD_Status.Potvrdjena);
    
            if (statusRezervacije === SD_Status.Potvrdjena) {
                navigate(`/rezervacija/rezervacijaPotvrdjena/${response.data?.result.rezervacijaHeaderId}`);
            } else {
                navigate("/failed");
            }
        } catch (err: any) {
            console.error("GREŠKA:", err?.data?.errorMessages ?? err.message ?? err);
            toastNotify("Greška: " + (err?.data?.errorMessages?.[0] ?? err.message ?? "Nepoznata greška"), "error");
        }
    
        setIsProcessing(false);
    };
    
    

  return (
    <form onSubmit={handleSubmit}>
        <hr />
        <div className="mb-4">
            <div className="d-flex flex-column gap-3">
            <label
                className={`border rounded p-3 d-flex align-items-center justify-content-between cursor-pointer 
                ${paymentMethod === 'kartica' ? 'border-primary bg-light' : 'border-secondary'}`}
                style={{ minHeight: '60px' }}
            >
                <div className="d-flex align-items-center">
                <input
                    type="radio"
                    className="form-check-input me-3"
                    checked={paymentMethod === 'kartica'}
                    onChange={() => setPaymentMethod('kartica')}
                    style={{ width: "20px", height: "20px" }}
                />
                <span className="fw-bold"><i className="bi bi-credit-card" />     Kartica - Platite Vaš termin online</span>
                </div>
            </label>

            <label
                className={`border rounded p-3 d-flex align-items-center justify-content-between cursor-pointer 
                ${paymentMethod === 'gotovina' ? 'border-success bg-light' : 'border-secondary'}`}
                style={{ minHeight: '60px' }}
            >
                <div className="d-flex align-items-center">
                <input
                    type="radio"
                    className="form-check-input me-3"
                    checked={paymentMethod === 'gotovina'}
                    onChange={() => setPaymentMethod('gotovina')}
                    style={{ width: "20px", height: "20px" }}
                />
                <span className="fw-bold"><i className="bi bi-cash-coin" />   Gotovina</span>
                </div>
            </label>
            </div>
        </div>

        {paymentMethod === 'kartica' && (
            <div className="mb-3">
            <PaymentElement />
            </div>
        )}

        <button
            className="btn w-100"
            style={{
            backgroundColor: paymentMethod === 'gotovina' ? "#4da172" : "#51285f",
            color: "white",
            fontWeight: "bold",
            fontSize: "18px",
            padding: "12px",
            }}
            type="submit"
            disabled={isProcessing || (paymentMethod === 'kartica' && (!stripe || !elements))}
        >
            {isProcessing ? "Obrada..." : (paymentMethod === 'gotovina' ? "💵 Plaćanje Gotovinom" : "💳 Plaćanje Karticom")}
        </button>
        <button
          type='button'
          style={{
            color:"white",
            backgroundColor:"red",
            fontWeight:"bold",
            fontSize:"18px",
            padding:"12px"
          }}
          className='btn w-100 mt-3'
          onClick={() => navigate("/rezervacija")}
        >
          Otkaži
        </button>
    </form>
  )
}

export default PlacanjeForma
