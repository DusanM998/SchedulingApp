import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import React from 'react'
import { useLocation } from 'react-router-dom'
import { RezervacijaSummary } from '../Rezervacija';
import PlacanjeForma from './PlacanjeForma';

function Placanje() {

    const {
        state: { apiResult, userInput }
    } = useLocation();

    console.log("Logujem rezervaciju:", apiResult);

    const stripePromise = loadStripe(
        'sk_test_51R5lAR2fGxhVJd5WEve988OSEvwRojUgdj9yYwJugB7cQwDsPKx89lLbwdya4igXqnh30eIPft8isrTShDM9LFQf00JSCtq4Qg'
    );

    const options = {
        clientSecret: apiResult.clientSecret,
    };

  return (
    <Elements stripe={stripePromise} options={options}>
        <div className='container m-5 p-5'>
            <div className='row'>
                <div className='col-md-7'>
                    
                </div>
                <div className='col-md-4 offset-md-1'>
                    <h3 style={{color:"#8d3d5b"}}>Plaćanje</h3>
                    <div className='mt-5'>
                        <PlacanjeForma data={apiResult} userInput={userInput}/>
                    </div>
                </div>
            </div>
        </div>
    </Elements>
  )
}

export default Placanje
