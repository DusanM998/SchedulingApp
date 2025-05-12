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

        console.log("Logujem res[0]", data.result[0]);
        
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
      <div className='container my-5 mx-auto p-5 w-100' style={{ maxWidth: '800px' }}>
        {!isLoading && rezervacijaDetalji && userInput && (
          <div>
            <h2 className="mb-4">Detalji rezervacije</h2>
  
            <div className="mb-3">
              <strong>Korisnik:</strong> {userInput.name} <br />
              <strong>Email:</strong> {userInput.email} <br />
              <strong>Telefon:</strong> {userInput.phoneNumber}
            </div>
  
            <div className="mb-3">
              <strong>Status rezervacije:</strong> {rezervacijaDetalji.status} <br />
              <strong>Ukupna cena:</strong> {rezervacijaDetalji.ukupnoCena} RSD
            </div>
  
            <hr />
  
            <h4>Stavke rezervacije:</h4>
            {/* Grupisanje termina po objektu */}
            {(() => {
              const groupedByObjekat: Record<
                string,
                { termini: any[]; cena: number; brojUcesnika: number }
              > = {};
  
              rezervacijaDetalji.stavkaKorpe.forEach((stavka: any) => {
                const naziv = stavka.nazivSportskogObjekta;
  
                if (!groupedByObjekat[naziv]) {
                  groupedByObjekat[naziv] = {
                    termini: [],
                    cena: stavka.cena,
                    brojUcesnika: stavka.brojUcesnika,
                  };
                }
  
                if (Array.isArray(stavka.odabraniTermini)) {
                  groupedByObjekat[naziv].termini.push(...stavka.odabraniTermini);
                }
              });
  
              return Object.entries(groupedByObjekat).map(([nazivObjekta, info], idx) => (
                <div key={idx} className="mb-4 p-3 border rounded shadow-sm">
                  <p><strong>Sportski objekat:</strong> {nazivObjekta}</p>
                  <p><strong>Broj učesnika:</strong> {info.brojUcesnika}</p>
                  <p><strong>Cena:</strong> {info.cena} RSD</p>
  
                  <h6>Odabrani termini:</h6>
                  {info.termini.length > 0 ? (
                    <ul>
                      {info.termini.map((termin, index) => (
                        <li key={index}>
                          <strong>Datum:</strong> {new Date(termin.datumTermina).toLocaleDateString()} <br />
                          <strong>Početak:</strong> {termin.vremePocetka} | <strong>Kraj:</strong> {termin.vremeZavrsetka} <br />
                          <strong>Status:</strong> {termin.status}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p>Nema termina</p>
                  )}
                </div>
              ));
            })()}
          </div>
        )}
      </div>
    );
}

export default RezervacijaDetailsPage
