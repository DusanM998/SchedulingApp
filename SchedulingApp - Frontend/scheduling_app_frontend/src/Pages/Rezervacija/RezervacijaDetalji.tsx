import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux';
import { RootState } from '../../Storage/Redux/store';
import { useNavigate } from 'react-router-dom';
import { inputHelper } from '../../Helper';

function RezervacijaDetalji() {

  const [loading, setLoading] = useState(false);

  const userData = useSelector((state: RootState) => state.userAuthStore);

  const initialUserData = {
    name: userData.name,
    email: userData.email,
    brojTelefona: "",
  };

  const navigate = useNavigate();
  
  const [userInput, setUserInput] = useState(initialUserData);

  const handleUserInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const tempData = inputHelper(e, userInput);
    setUserInput(tempData);
  }

  useEffect(() => {
    setUserInput({
      name: userData.name,
      email: userData.email,
      brojTelefona: ""
    });
  }, [userData]);

  return (
    <div className='border rounded pb-5 pt-3'>
      <h1 style={{ fontWeight: "300", color: "#4da172" }} className="text-center">Podaci o korisniku</h1>
      <hr />
      <form className='col-10 mx-auto'>
        <div className='form-group mt-3'>
          Ime
          <input
            type='text'
            value=""
            className='form-control'
            placeholder='Ime...'
            name='name'
            required
            
          />
        </div>
        <div className='form-group mt-3'>
          E-mail
          <input
            type='email'
            value=""
            className='form-control'
            placeholder='E-mail'
            name='email'
            required

          />
        </div>
        <div className='form-group mt-3'>
          Broj Telefona
          <input
            type='text'
            value=""
            className='form-control'
            placeholder='Broj Telefona'
            name='brojTelefona'
            required

          />
        </div>
        <div className='form-group mt-3'>
          <div className='card p-3' style={{background:"ghostwhite"}}>
            <h5>Ukupno za plaćanje :  RSD</h5>
            <h5>Količina : </h5>
          </div>
        </div>
        <button
          type='submit'
          className='btn btn-lg form-control mt-3'
          style={{backgroundColor:"#51285f", color: "white"}}
        >
          Nastavi na placanje
        </button>
      </form>
    </div>
  )
}

export default RezervacijaDetalji
