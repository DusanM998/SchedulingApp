import React from 'react'
import RezervacijaListaProps from '../../Interfaces/rezervacijaLista'
import { useNavigate } from 'react-router-dom'
import { MainLoader } from '../../Components/Page/Common';
import rezervacijaHeaderModel from '../../Interfaces/rezervacijaHeaderModel';
import getStatusColor from '../../Helper/getStatusColor';

function RezervacijaLista({ isLoading, rezervacijaData }: RezervacijaListaProps) {
    
    const navigate = useNavigate();

  return (
    <>
        {isLoading && <MainLoader />}
        {!isLoading && (
            <div className='table px-5'>
                <div className='p-2'>
                    <div className='row border'>
                        <div className='col-1 border'>ID</div>
                        <div className='col-2 border'>Ime</div>
                        <div className='col-2 border'>Broj Telefona</div>
                        <div className='col-1 border'>Ukupna Cena</div>
                        <div className='col-1 border'>Ukupno Rezervacija</div>
                        <div className='col-2 border'>Datum Kreiranja Rezervacije</div>
                        <div className='col-2 border'>Status</div>
                        <div className='col-1 border'>Detalji</div>
                    </div>
                      {rezervacijaData.map((rezervacija: rezervacijaHeaderModel) => {
                          const badgeColor = getStatusColor(rezervacija.status!);
                          return (
                            <div className='row border' key={rezervacija.rezervacijaHeaderId}>
                                <div className='col-1 border'>{rezervacija.rezervacijaHeaderId}</div>
                                <div className='col-2 border'>{rezervacija.imeKorisnika}</div>
                                <div className='col-2 border'>{rezervacija.brojKorisnika}</div>
                                <div className='col-1 border'>{rezervacija.ukupnoCena?.toFixed(2)}</div>
                                <div className='col-1 border'>{rezervacija.ukupnoRezervacija}</div>
                                <div className='col-2 border'>{new Date(rezervacija.datumRezervacije!).toLocaleDateString("sr-RS")}</div>
                                <div className='col-2 border'>
                                      <span className={`badge bg-${badgeColor}`}>{rezervacija.status}</span>
                                </div>
                                <div className='col-1 border'>
                                    <button
                                        className='btn'
                                        style={{backgroundColor:"#51285f", color:"white"}}
                                        onClick={()=> navigate("/rezervacija/rezervacijaDetaljiPage/" + rezervacija.rezervacijaHeaderId)}
                                    >
                                        Detalji
                                    </button>
                                </div>
                            </div>
                          )
                    })}
                </div>
            </div>
        )}
    </>
  )
}

export default RezervacijaLista
