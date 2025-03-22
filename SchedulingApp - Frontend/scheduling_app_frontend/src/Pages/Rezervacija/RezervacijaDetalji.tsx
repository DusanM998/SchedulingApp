import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux';
import { RootState } from '../../Storage/Redux/store';
import { useNavigate } from 'react-router-dom';
import { inputHelper } from '../../Helper';
import { MiniLoader } from '../../Components/Page/Common';
import {apiResponse, stavkaKorpeModel} from '../../Interfaces';

function RezervacijaDetalji() {

  const [loading, setLoading] = useState(false);

  const shoppingCartStore: stavkaKorpeModel[] = useSelector(
    (state: RootState) => state.shoppingCartFromStore.stavkaKorpe ?? []
  );

  const userData = useSelector((state: RootState) => state.userAuthStore);

  const initialUserData = {
    name: userData.name,
    email: userData.email,
    brojTelefona: "",
  };

  let ukupnoCena = 0;
  let ukuponoStavki = 0;

  shoppingCartStore?.map((stavkaKorpe: stavkaKorpeModel) => {
    if (!stavkaKorpe.sportskiObjekat) return;

    const termin = stavkaKorpe.sportskiObjekat.selectedTermin;
    const cenaPoSatu = stavkaKorpe.sportskiObjekat.cenaPoSatu ?? 0;

    let trajanjeUSatima = 1; // Defaultno ako nema termina

    if (termin && termin.vremePocetka && termin.vremeZavrsetka) {
        const [startHours, startMinutes] = termin.vremePocetka.split(":").map(Number);
        const [endHours, endMinutes] = termin.vremeZavrsetka.split(":").map(Number);

        const startTime = new Date();
        startTime.setHours(startHours, startMinutes, 0);

        const endTime = new Date();
        endTime.setHours(endHours, endMinutes, 0);

        trajanjeUSatima = (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60);
    }

    ukupnoCena += (cenaPoSatu * trajanjeUSatima) * (stavkaKorpe.kolicina ?? 1);
  })

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
            value={userInput.name}
            className='form-control'
            placeholder='Ime...'
            name='name'
            required
            onChange={handleUserInput}
          />
        </div>
        <div className='form-group mt-3'>
          E-mail
          <input
            type='email'
            value={userInput.email}
            className='form-control'
            placeholder='E-mail'
            name='email'
            required
            onChange={handleUserInput}
          />
        </div>
        <div className='form-group mt-3'>
          Broj Telefona
          <input
            type='text'
            value={userInput.brojTelefona}
            className='form-control'
            placeholder='Broj Telefona'
            name='brojTelefona'
            required
            onChange={handleUserInput}
          />
        </div>
        <div className='form-group mt-3'>
          <div className='card p-3' style={{background:"ghostwhite"}}>
            <h5>Ukupno za plaćanje : {ukupnoCena.toFixed(2)}  RSD</h5>
            <h5>Broj rezervacija : {ukuponoStavki}</h5>
          </div>
        </div>
        <button
          type='submit'
          className='btn btn-lg form-control mt-3'
          style={{backgroundColor:"#51285f", color: "white"}}
        >
          {loading ? <MiniLoader /> : "Nastavi na plaćanje"}
        </button>
        <button
          type='button'
          className='btn btn-secondary form-control mt-3'
          onClick={() => navigate("/")}
        >
          Nazad
        </button>
      </form>
    </div>
  )
}

export default RezervacijaDetalji
