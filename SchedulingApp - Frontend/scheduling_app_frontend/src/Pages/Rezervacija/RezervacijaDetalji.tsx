import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux';
import { RootState } from '../../Storage/Redux/store';
import { useNavigate } from 'react-router-dom';
import { inputHelper } from '../../Helper';
import { MiniLoader } from '../../Components/Page/Common';
import {apiResponse, stavkaKorpeModel, terminModel} from '../../Interfaces';
import { useInicirajPlacanjeMutation } from '../../apis/placanjeApi';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';

function RezervacijaDetalji() {

  const [loading, setLoading] = useState(false);
  const [inicirajPlacanje] = useInicirajPlacanjeMutation();
  const { t } = useTranslation();

  const shoppingCartStore: stavkaKorpeModel[] = useSelector(
    (state: RootState) => state.shoppingCartFromStore.stavkaKorpe ?? []
  );

  const userData = useSelector((state: RootState) => state.userAuthStore);

  const navigate = useNavigate();

  const initialUserData = {
    name: userData.name,
    email: userData.email,
    phoneNumber: userData.phoneNumber,
  };

  const [userInput, setUserInput] = useState(initialUserData);

  const handleUserInput = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | string
  ) => {
    if (typeof e === "string") {
      // Ako je string, znamo da je broj telefona
      setUserInput(prev => ({
        ...prev,
        phoneNumber: e
      }));
    } else {
      // Inace radi za obicne inpute
        const tempData = inputHelper(e, userInput);
          setUserInput(tempData);
        }
  };

  const [selectedTermini, setSelectedTermini] = useState<Record<number, terminModel[]>>({});

  const racunajUkupnuCenu = () => {
    return shoppingCartStore.reduce((acc, stavka) => {
      return acc + (stavka.cenaZaObjekat ?? 0); 
    }, 0);
  };
  
  const ukupnoCena = racunajUkupnuCenu();
  let ukuponoStavki = shoppingCartStore.length;

  useEffect(() => {
    console.log("Logujem userData: ", userData);
    setUserInput({
      name: userData.name,
      email: userData.email,
      phoneNumber: userData.phoneNumber,
    });
  }, [userData]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const imaTermina = shoppingCartStore.some(stavka =>
      stavka.odabraniTermini && stavka.odabraniTermini.length > 0
    );

    if (!imaTermina) {
      toast.error(t("rezervacijaDetalji.errors.noTermin"), {
        position: "top-center",
        autoClose: 3000,
      });
      return;
    }

    setLoading(true);

    const { data }: apiResponse = await inicirajPlacanje(userData.id);
    

    navigate("/placanje", {
      state: { apiResult: data?.result, userInput },
    });
  };

  return (
    <div className='border rounded pb-5 pt-3'>
      <h1 style={{ fontWeight: "300", color: "#4da172" }} className="text-center">{t("rezervacijaDetalji.title")}</h1>
      <hr />
      <form onSubmit={handleSubmit} className='col-10 mx-auto'>
        <div className='form-group mt-3'>
          {t("rezervacijaDetalji.form.name")}
          <input
            type='text'
            value={userInput.name}
            className='form-control'
            placeholder={t("rezervacijaDetalji.form.name...")}
            name='name'
            required
            onChange={handleUserInput}
          />
        </div>
        <div className='form-group mt-3'>
          {t("rezervacijaDetalji.form.email")}
          <input
            type='email'
            value={userInput.email}
            className='form-control'
            placeholder={t("rezervacijaDetalji.form.email...")}
            name='email'
            required
            onChange={handleUserInput}
          />
        </div>
        <div className='form-group mt-3'>
          {t("rezervacijaDetalji.form.phone")}
          <PhoneInput
            inputProps={{
              name:"phoneNumber"
            }}
            value={userInput.phoneNumber}
            onChange={handleUserInput}
          />
        </div>
        <div className='form-group mt-3'>
          <div className='card p-3' style={{background:"ghostwhite"}}>
            <h5>{t("rezervacijaDetalji.summary.totalPrice")}: {ukupnoCena.toFixed(2)}  RSD</h5>
            <h5>{t("rezervacijaDetalji.summary.totalReservations")}: {ukuponoStavki}</h5>
          </div>
        </div>
        <button
          type='submit'
          className='btn btn-lg form-control mt-3'
          style={{backgroundColor:"#51285f", color: "white"}}
        >
          {loading ? <MiniLoader /> : "" + t("rezervacijaDetalji.buttons.continue")}
        </button>
        <button
          type='button'
          className='btn btn-secondary form-control mt-3'
          onClick={() => navigate("/")}
        >
          {t("rezervacijaDetalji.buttons.back")}
        </button>
      </form>
    </div>
  )
}

export default RezervacijaDetalji
