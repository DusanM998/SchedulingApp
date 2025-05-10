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
        {isLoading && (
            <div className='table px-5'>
                <div className='p-2'>
                    <div className='row border'>
                        <div className='col-1'>ID</div>
                        <div className='col-2'>Ime</div>
                        <div className='col-2'>Broj Telefona</div>
                        <div className='col-1'>Ukupna Cena</div>
                        <div className='col-1'>Ukupno Rezervacija</div>
                        <div className='col-2'>Datum</div>
                        <div className='col-2'>Status</div>
                        <div className='col-1'>Detalji</div>
                    </div>
                      {rezervacijaData.map((rezervacija: rezervacijaHeaderModel) => {
                          const badgeColor = getStatusColor(rezervacija.status!);
                          return (
                            <div className='row border' key={rezervacija.rezervacijaHeaderId}>
                                <div className='col-1'>{rezervacija.rezervacijaHeaderId}</div>
                                <div className='col-2'>{rezervacija.imeKorisnika}</div>
                                <div className='col-2'>{rezervacija.brojKorisnika}</div>
                                <div className='col-1'>{rezervacija.ukupnoCena?.toFixed(2)}</div>
                                <div className='col-1'>{rezervacija.ukupnoRezervacija}</div>
                                <div className='col-2'>{rezervacija.rezervacijaHeaderId}</div>
                                <div className='col-2'>{new Date(rezervacija.datumRezervacije!).toLocaleDateString("sr-RS")}</div>
                                <div className='col-1'>
                                      <span className={`badge bg-${badgeColor}`}>{rezervacija.status}</span>
                                </div>
                                <div className='col-1'>
                                    <button
                                        className='btn'
                                        style={{backgroundColor:"#51285f", color:"white"}}
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
