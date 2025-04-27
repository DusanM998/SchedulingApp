import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux';
import { RootState } from '../../Storage/Redux/store';
import { useNavigate } from 'react-router-dom';
import { inputHelper } from '../../Helper';
import { MiniLoader } from '../../Components/Page/Common';
import {apiResponse, stavkaKorpeModel, terminModel} from '../../Interfaces';
import { useInicirajPlacanjeMutation } from '../../apis/placanjeApi';

function RezervacijaDetalji() {

  const [loading, setLoading] = useState(false);
  const [inicirajPlacanje] = useInicirajPlacanjeMutation();

  const shoppingCartStore: stavkaKorpeModel[] = useSelector(
    (state: RootState) => state.shoppingCartFromStore.stavkaKorpe ?? []
  );

  const userData = useSelector((state: RootState) => state.userAuthStore);

  const navigate = useNavigate();

  const initialUserData = {
    name: userData.name,
    email: userData.email,
    brojTelefona: "",
  };

  const [userInput, setUserInput] = useState(initialUserData);

  const handleUserInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const tempData = inputHelper(e, userInput);
    setUserInput(tempData);
  }

  const [selectedTermini, setSelectedTermini] = useState<Record<number, terminModel[]>>({});

  

  const racunajUkupnuCenu = () => {
    return shoppingCartStore.reduce((acc, stavka) => {
      if (!stavka.sportskiObjekat) return acc;

      const termini = selectedTermini[stavka.sportskiObjekat.sportskiObjekatId] || [];
      const cenaPoSatu = stavka.sportskiObjekat.cenaPoSatu ?? 0;

      const ukupnaCenaZaObjekat = termini.reduce((sum, termin) => {
        if (!termin.vremePocetka || !termin.vremeZavrsetka) return sum;

        const [startHours, startMinutes] = termin.vremePocetka.split(":").map(Number);
        const [endHours, endMinutes] = termin.vremeZavrsetka.split(":").map(Number);

        const startTime = new Date();
        startTime.setHours(startHours, startMinutes, 0);

        const endTime = new Date();
        endTime.setHours(endHours, endMinutes, 0);

        const trajanjeUSatima = (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60);

        return sum +  (cenaPoSatu * trajanjeUSatima);
      }, 0);

      return acc + ukupnaCenaZaObjekat;
    }, 0);
  };
  

  const ukupnoCena = racunajUkupnuCenu();
  let ukuponoStavki = shoppingCartStore.length;

  useEffect(() => {
    setUserInput({
      name: userData.name,
      email: userData.email,
      brojTelefona: ""
    });
  }, [userData]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const { data }: apiResponse = await inicirajPlacanje(userData.id);
    

    navigate("/placanje", {
      state: { apiResult: data?.result, userInput, ukupnoCena },
    });
  };

  return (
    <div className='border rounded pb-5 pt-3'>
      <h1 style={{ fontWeight: "300", color: "#4da172" }} className="text-center">Podaci o korisniku</h1>
      <hr />
      <form onSubmit={handleSubmit} className='col-10 mx-auto'>
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
