import React from 'react'
import { useParams } from 'react-router-dom'

function RezervacijaPotvrdjena() {

    const { id } = useParams();

  return (
    <div className='w-100 text-center d-flex justify-content-center align-items-center'>
      <div>
        <i
            style={{fontSize:"7rem"}}
            className='bi bi-ckeck2-circle text-success'
        ></i>
        <div className='m-4'>
            <h2 style={{color:"#4da172"}}>Vaša rezervacija je prihvaćena uspešno!</h2>
            <h5 className='mt-4'>ID Vaše rezervacije je: <strong>{id}</strong></h5>
            <p className='mt-2 text-secondary fs-5'></p>
        </div>
      </div>
    </div>
  )
}

export default RezervacijaPotvrdjena
