import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import React from 'react'
import { useLocation } from 'react-router-dom'
import { RezervacijaRezime, RezervacijaSummary } from '../Rezervacija';
import PlacanjeForma from './PlacanjeForma';

function Placanje() {
  const location = useLocation();
  const apiResult = location.state?.apiResult;
  const userInput = location.state?.userInput;

  if (!apiResult || !userInput) {
    return (
      <div className="text-center p-5">
        <h5 style={{ color: "#51285f" }}>Nema podataka o rezervaciji</h5>
        <p>Molimo vas da izaberete termine pre nego što nastavite na plaćanje.</p>
      </div>
    );
  }

  const stripePromise = loadStripe(
    'pk_test_51R5lAR2fGxhVJd5WWFl422d7CpDus1wFbbFI4jhfImzXCz9m97jhz9J4FaVoJ0VnVQpl55qb975UcZ57XNENswOi00vcTlhcSI'
  );

  const options = {
    clientSecret: apiResult.clientSecret,
  };

  return (
    <Elements stripe={stripePromise} options={options}>
      <div className='container m-5 p-5'>
        <div className='row'>
          <div className='col-md-7'>
            <RezervacijaRezime data={apiResult} userInput={userInput} />
          </div>
          <div className='col-md-4 offset-md-1'>
            <h3 style={{ color: "#51285f" }}>Plaćanje</h3>
            <div className='mt-5'>
              <PlacanjeForma data={apiResult} userInput={userInput} />
            </div>
          </div>
        </div>
      </div>
    </Elements>
  );
}


export default Placanje
