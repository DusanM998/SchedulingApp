import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useCancelRezervacijaMutation, useGetRezervacijaDetaljiQuery, useUpdateRezervacijaHeaderMutation } from '../../apis/rezervacijaApi';
import RezervacijaRezime from './RezervacijaRezime';
import getStatusColor from '../../Helper/getStatusColor';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import { SD_Status } from '../../Utility/SD';
import { toastNotify } from '../../Helper';

function RezervacijaDetailsPage() {

    const { id } = useParams();
    const { data, isLoading } = useGetRezervacijaDetaljiQuery(id);
    const navigate = useNavigate();
    const [updateRezervacijaHeader] = useUpdateRezervacijaHeaderMutation();
    const [cancelRezervacija] = useCancelRezervacijaMutation();
    

    const [status, setStatus] = useState<SD_Status | null>(null);

    useEffect(() => {
      let intervalId: NodeJS.Timeout;

      const proveriStatus = () => {
        if (!isLoading && data?.result) {
          const rezervacija = data.result[0];
          const trenutniStatus = rezervacija.status as SD_Status;

          const danas = new Date();
          const danasnjiDatum = danas.toISOString().split('T')[0];
          const trenutnoVreme = danas.getHours() * 60 + danas.getMinutes();

          const sviTermini = rezervacija.rezervacijaDetalji.flatMap((stavka: any) =>
            Array.isArray(stavka.odabraniTermini) ? stavka.odabraniTermini : [stavka.odabraniTermini]
          );

          let postojiUToku = false;
          let postojiUBuducnosti = false;

          for (const termin of sviTermini) {
            const datumTermina = termin.datumTermina.split('T')[0];
            const [pocSat, pocMin] = termin.vremePocetka.split(':').map(Number);
            const [krajSat, krajMin] = termin.vremeZavrsetka.split(':').map(Number);
            const pocetak = pocSat * 60 + pocMin;
            const kraj = krajSat * 60 + krajMin;

            if (datumTermina === danasnjiDatum) {
              if (trenutnoVreme >= pocetak && trenutnoVreme <= kraj) {
                postojiUToku = true;
                break;
              } else if (trenutnoVreme < pocetak) {
                postojiUBuducnosti = true;
              }
            } else {
              const terminDatum = new Date(termin.datumTermina);
              if (terminDatum > danas) {
                postojiUBuducnosti = true;
              }
            }
          }

          let noviStatus: SD_Status | null = null;

          if (postojiUToku) {
            noviStatus = SD_Status.U_Toku;
          } else if (!postojiUBuducnosti) {
            noviStatus = SD_Status.Zavrsena;
          } else {
            noviStatus = trenutniStatus;
          }

          if (noviStatus && noviStatus !== trenutniStatus) {
            updateRezervacijaHeader({
              rezervacijaHeaderId: rezervacija.rezervacijaHeaderId,
              imeKorisnika: rezervacija.imeKorisnika,
              emailKorisnika: rezervacija.emailKorisnika,
              brojKorisnika: rezervacija.brojKorisnika,
              stripeIntentPaymentId: rezervacija.stripePaymentIntentId ?? "",
              status: noviStatus
            });
            setStatus(noviStatus);
          } else {
            setStatus(trenutniStatus);
          }
        }
      };

      proveriStatus(); // odmah pri mountu

      intervalId = setInterval(() => {
        proveriStatus();
      }, 60000); // proverava svakih 60 sekundi

      return () => {
        clearInterval(intervalId);
      };
    }, [data, isLoading]);


    
    //console.log("Logujem status: ", data.result[0].status);

    //let userInput, rezervacijaDetalji, tipBoja;
    //let status : SD_Status;
    const rezervacija = data?.result?.[0];
    const tipBoja = useMemo(() => getStatusColor(status ?? SD_Status.Cekanje), [status])

    if (!isLoading && !rezervacija || status === null) {
      return <div className='container my-5'>Učitavanje...</div>
    }

    const userInput = {
      name: rezervacija.imeKorisnika,
      email: rezervacija.emailKorisnika,
      phoneNumber: rezervacija.brojKorisnika
    }

    const rezervacijaDetalji = {
      rezervacijaHeaderId: rezervacija.rezervacijaHeaderId,
      stavkaKorpe: rezervacija.rezervacijaDetalji.map((stavka: any) => ({
        ...stavka,
        odabraniTermini: Array.isArray(stavka.odabraniTermini)
          ? stavka.odabraniTermini
          : [stavka.odabraniTermini]
      })),
      ukupnoCena: rezervacija.ukupnoCena,
      status: status
  }
  
  const handleCancelRezervacija = async () => {
    try {
      await cancelRezervacija(id).unwrap();
      toastNotify("Rezervacija uspešno otkazana!", "success");
    } catch (error) {
      console.error("Greska", error);
      toastNotify("Greska prilikom otkazivanja rezervacije!", 'error');
    }
  };
  
    return (
      <div className='container my-5 mx-auto p-5 w-100' style={{ maxWidth: '800px' }}>
        {!isLoading && rezervacijaDetalji && userInput && (
          <>
            <div>
              <div className='d-flex justify-content-between align-items-center'>
                <h2 className="mb-4" style={{ color: "#51285f" }}>Detalji rezervacije</h2>
                <span className={`btn btn-outline-${tipBoja} fs-6 mb-4`}>{rezervacijaDetalji.status}</span>
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
              <h5><strong>Ukupna cena:</strong> {rezervacijaDetalji.ukupnoCena.toFixed(2)} RSD</h5>
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
                    <h5><strong>Cena:</strong> {info.cena.toFixed(2)} RSD</h5>
                  </div>
                ));
              })()}
            </div>
            </div>
            <div className='d-flex justify-content-between align-items-center mt-3'>
              <button className='btn btn-secondary'
                style={{
                  color:"white",
                  fontWeight:"bold",
                  fontSize:"18px",
                  padding:"12px"
                }}
                onClick={() => navigate(-1)}>Nazad
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
                className='btn mt-3'
                onClick={handleCancelRezervacija}
              >
                Otkaži rezervaciju
              </button>
            </div>
          </>
        )}
      </div>
    );
}

export default RezervacijaDetailsPage
