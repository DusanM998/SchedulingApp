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

    const [kreirajRezervaciju] = useKreirajRezervacijuMutation();

    const potvrdiRezervaciju = async () => {
        setIsProcessing(true);

        let ukupnoCena = 0;
        let kolicina = 0;

        const rezervacijaDetaljiDTO: any = [];

        data.stavkaKorpe?.forEach((stavka: stavkaKorpeModel) => {
            const tempRezervacijaDetalji: any = {};
            //tempRezervacijaDetalji["sportskiObjekatId"] = stavka.sportskiObjekat?.sportskiObjekatId;
            tempRezervacijaDetalji["kolicina"] = stavka.kolicina;
            tempRezervacijaDetalji["naziv"] = stavka.sportskiObjekat?.naziv;
            tempRezervacijaDetalji["cenaPoSatu"] = stavka.sportskiObjekat?.cenaPoSatu;
            rezervacijaDetaljiDTO.push(tempRezervacijaDetalji);
            kolicina += stavka.kolicina!;
        });

        const response: apiResponse = await kreirajRezervaciju({
            imeKorisnika: userInput.name,
            brojKorisnika: userInput.phoneNumber,
            emailKorisnika: userInput.email,
            kolicina: kolicina,
            rezervacijaDetaljiDTO: rezervacijaDetaljiDTO,
            stripePaymentIntentId: data.stripePaymentIntentId,
            applicationUserId: data.userId,
            status: SD_Status.Potvrdjena,
        });

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
        // We don't want to let default form submission happen here,
        // which would refresh the page.
        event.preventDefault();

        if (!stripe || !elements) {
        // Stripe.js hasn't yet loaded.
        // Make sure to disable form submission until Stripe.js has loaded.
        return;
        }

        setIsProcessing(true);

        const rezervacijaDetaljiDTO: any = [];

        const result = await stripe.confirmPayment({
            elements,
            confirmParams: {
                return_url: "https://example.com/rezervacija/123/complete",
            },
            redirect: "if_required",
        });

        if (result.error) {
            toastNotify("Došlo je do greške!", "error");
            setIsProcessing(false);
        } else {
            //Slanje podataka ka backendu
            const response: apiResponse = await kreirajRezervaciju({
                
                imeKorisnika: userInput.name,
                brojKorisnika: userInput.phoneNumber,
                emailKorisnika: userInput.email,
                stripePaymentIntentId: data.stripePaymentIntentId,
                applicationUserId: data.userId,
                ukupnoCena: ukupnoCena,
                rezervacijaDetaljiDTO: rezervacijaDetaljiDTO,
                status: result.paymentIntent?.status === "succeeded"
                    ? SD_Status.Potvrdjena
                    : SD_Status.Cekanje,
            });

            if (response && response.data?.result.status === SD_Status.Potvrdjena) {
                navigate(`/`);
            } else {
                navigate("/failed");
            }
        }

        setIsProcessing(false);
    }

  return (
    <form onSubmit={handleSubmit}>
        <PaymentElement />
        <button 
            className='btn mt-5 w-100' 
            style={{backgroundColor:"#51285f", color:"white"}}
            disabled={!stripe || isProcessing}
        >
            <span id='button-text'> {isProcessing ? "Obrada..." : "Potvrdi"}</span>
        </button>
        <button 
            className='btn mt-5 w-100' 
            style={{backgroundColor:"#ffeed3", color:"#51285f"}}
            type="button"
            onClick={potvrdiRezervaciju}
            disabled={isProcessing}
        >
            <span id='button-text'> {isProcessing ? "Obrada..." : "Plaćanje pouzećem"}</span>
        </button>
    </form>
  )
}

export default PlacanjeForma
