import React from 'react'
import { useParams } from 'react-router-dom'
import { useGetRezervacijaDetaljiQuery } from '../../apis/rezervacijaApi';
import RezervacijaRezime from './RezervacijaRezime';

function RezervacijaDetailsPage() {

    const { id } = useParams();
    const { data, isLoading } = useGetRezervacijaDetaljiQuery(id);

    let userInput, rezervacijaDetalji;

    if (!isLoading && data.result) {
        console.log("Logujem detalje rezervacije", data.result);
        userInput = {
            name: data.result[0].imeKorisnika,
            email: data.result[0].emailKorisnika,
            phoneNumber: data.result[0].brojKorisnika,
        };
        rezervacijaDetalji = {
            rezervacijaHeaderId: data.result[0].rezervacijaHeaderId,
            stavkaKorpe: data.result[0].rezervacijaDetalji.map((stavka: any) => ({
              ...stavka,
              odabraniTermini: Array.isArray(stavka.odabraniTermini)
                ? stavka.odabraniTermini
                : [stavka.odabraniTermini]
            })),
            ukupnoCena: data.result[0].ukupnoCena,
            status: data.result[0].status,
        };
    }

  return (
    <div className='container my-5 mx-auto p-5 w-100' style={{maxWidth:"800px"}}>
      {!isLoading && rezervacijaDetalji && userInput && (
        <RezervacijaRezime data={rezervacijaDetalji} userInput={userInput}/>
      )}
    </div>
  )
}

export default RezervacijaDetailsPage
