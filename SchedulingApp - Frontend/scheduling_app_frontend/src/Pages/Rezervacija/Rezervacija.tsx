import React from 'react'
import RezervacijaSummary from './RezervacijaSummary'
import RezervacijaDetalji from './RezervacijaDetalji'

function Rezervacija() {
  return (
    <div className='row w-100' style={{marginTop:"10px"}}>
      <div className='col-lg-6 col-12' style={{ fontWeight:300}}>
        <RezervacijaSummary />
      </div>
      <div className='col-lg-6 col-12 p-4'>
        <RezervacijaDetalji />
      </div>
    </div>
  )
}

export default Rezervacija
