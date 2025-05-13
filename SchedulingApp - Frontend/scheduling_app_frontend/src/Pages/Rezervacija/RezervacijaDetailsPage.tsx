import React from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useGetRezervacijaDetaljiQuery } from '../../apis/rezervacijaApi';
import RezervacijaRezime from './RezervacijaRezime';
import getStatusColor from '../../Helper/getStatusColor';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';

function RezervacijaDetailsPage() {

    const { id } = useParams();
    const { data, isLoading } = useGetRezervacijaDetaljiQuery(id);
    const navigate = useNavigate();
    //const tipBoja = getStatusColor(data.result[0].status);
    
    //console.log("Logujem status: ", data.result[0].status);

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
          <>
            <div>
              <div className='d-flex justify-content-between align-items-center'>
                <h2 className="mb-4" style={{ color: "#51285f" }}>Detalji rezervacije</h2>
                <span className={`btn btn-outline-primary fs-6 mb-4`}>{rezervacijaDetalji.status}</span>
              </div>
            <div className="mb-3">
              <div className='border py-3 px-2'><strong>Korisnik:</strong> {userInput.name} <br /></div>
              <div className='border py-3 px-2'><strong>Email:</strong> {userInput.email} <br /></div>
              <div className='border py-3 px-2'><strong>Broj Telefona:</strong>
                <PhoneInput 
                  inputProps={{
                    name:"phoneNumber"
                  }}
                  value={userInput.phoneNumber}
                  disabled={true}
                  />
              </div>
            </div>
            <div className="mb-3">
              <strong>Status rezervacije:</strong> {rezervacijaDetalji.status} <br />
              <hr />
              <h5><strong>Ukupna cena:</strong> {rezervacijaDetalji.ukupnoCena} RSD</h5>
            </div>
  
            <div className='border rounded py-3 px-2'>
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
                    <div className='mb-3'>
                      <h5 style={{ color: "#51285f" }}><strong>Sportski objekat:</strong> {nazivObjekta}</h5>
                      <p><strong>Broj učesnika:</strong> {info.brojUcesnika}</p>
                    </div>
                    
    
                    <h6>Odabrani termini:</h6>
                    {info.termini.length > 0 ? (
                      <ul>
                        {info.termini.map((termin, index) => (
                          <li key={index}>
                            <strong>Datum:</strong> {new Date(termin.datumTermina).toLocaleDateString()} <br />
                            <strong>Početak:</strong> {termin.vremePocetka} | <strong>Kraj:</strong> {termin.vremeZavrsetka} <br />
                            
                          </li>
                        ))}
                      </ul>
                     
                    ) : (
                      <p>Nema termina</p>
                    )}
                    <hr />
                    <h5><strong>Cena:</strong> {info.cena} RSD</h5>
                  </div>
                ));
              })()}
            </div>
            </div>
            <div className='d-flex justify-content-between align-items-center mt-3'>
              <button className='btn btn-secondary' onClick={() => navigate(-1)}>Nazad</button>

            </div>
          </>
        )}
      </div>
    );
}

export default RezervacijaDetailsPage
