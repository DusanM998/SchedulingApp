import React, { useState } from 'react'
import { useDeleteTerminMutation, useGetTerminiQuery } from '../../apis/terminApi'
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { MainLoader } from '../../Components/Page/Common';
import { terminModel } from '../../Interfaces';

function TerminiList() {

    const { data, isLoading } = useGetTerminiQuery(null);
    const navigate = useNavigate();
    const [deleteTermin] = useDeleteTerminMutation();

    console.log(data);

    const handleTerminDelete = async (terminId: number) => {
        toast.promise(
            deleteTermin(terminId),
            {
                pending: 'Vaš zahtev se obrađuje...',
                success: 'Termin obrisan uspešno',
                error: 'Došlo je do greške!'
            }
        )
    }

  return (
    <>
          {isLoading && <MainLoader />}
          {!isLoading && (
            <div className='table p-5'>
              <div className='d-flex align-items-center justify-content-between'>
                <h1 style={{ color: "##51285f" }}>Termini</h1>
                  <button
                    className='btn'
                    style={{ backgroundColor: "#51285f", color: "white" }}
                    onClick={() => navigate("/termin/terminKreirajAzuriraj")}
                  >
                    Kreiraj Termin
                  </button>
              </div>
              <div className='p-2'>
                <div className='row border'>
                  <div className='col-1 border'>ID</div>
                  <div className='col-1 border'>ID Sportskog Objekta</div>
                  <div className='col-3 border'>Datum Termina</div>
                  <div className='col-2 border'>Vreme Pocetka</div>
                  <div className='col-2 border'>Vreme Završetka</div>
                  <div className='col-1 border'>Status</div>
                  <div className='col-2 border'>Akcije</div>
                </div>
                {data.map((termin: terminModel) => {
                  return(
                    <div className='row border' key={termin.terminId}>
                        <div className='col-1 border'>{termin.terminId}</div>
                        <div className='col-1 border'>{termin.sportskiObjekatId}</div>
                        <div className='col-3 border'>{termin.datumTermina ? new Date(termin.datumTermina).toLocaleDateString() : "Nepoznat datum"}</div>
                        <div className='col-2 border'>{termin.vremePocetka}</div>
                        <div className='col-2 border'>{termin.vremeZavrsetka}</div>
                        <div className='col-1 border'>{termin.status}</div>
                        <div className='col-2 border'>
                            <button className="btn"
                            style={{ backgroundColor: "#51285f", color: "white" }} >
                            <i className="bi bi-pencil-fill"
                            onClick={()=> navigate("/sportskiObjekat/sportskiObjekatKreirajAzuriraj/" + termin.terminId)}></i>
                            </button>
                            <button className="btn btn-danger mx-2">
                            <i className="bi bi-trash-fill"
                                onClick={()=> handleTerminDelete(termin.terminId)}></i>
                            </button>
                        </div>
                    </div>
                  )
                })
    
                }
              </div>
            </div>
          )}
        </>
  )
}

export default TerminiList
