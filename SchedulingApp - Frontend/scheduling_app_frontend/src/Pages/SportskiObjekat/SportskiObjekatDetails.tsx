import React, { useState } from 'react'
import { NavLink, useNavigate, useParams } from 'react-router-dom';
import { useGetSportskiObjekatByIdQuery } from '../../apis/sportskiObjekatApi';
import { useSelector } from 'react-redux';
import { RootState } from '../../Storage/Redux/store';
import { apiResponse, stavkaKorpeModel, terminModel, userModel } from '../../Interfaces';
import { MainLoader, MiniLoader } from '../../Components/Page/Common';
import { useGetTerminByIdQuery } from '../../apis/terminApi';
import { useUpdateShoppingCartMutation } from '../../apis/shoppingCartApi';
import { toastNotify } from '../../Helper';
import { SD_Status_Termina } from '../../Utility/SD';

function SportskiObjekatDetails() {

    const { sportskiObjekatId } = useParams();
    const { data, isLoading } = useGetSportskiObjekatByIdQuery(sportskiObjekatId);
    const {data: terminiData, isLoading: terminiLoading} = useGetTerminByIdQuery(sportskiObjekatId);
    const [showTermini, setShowTermini] = useState<boolean>(false);
    const [isAddingToCart, setIsAddingToCart] = useState<boolean>(false);
    const userData: userModel = useSelector((state: RootState) => state.userAuthStore);
    const navigate = useNavigate();
    const [updateKorpa] = useUpdateShoppingCartMutation();
    
    const handleAddToCart = async(sportskiObjekatId: number) => { 
      if (!userData.id) {
        navigate("/login");
        return;
      }

      setIsAddingToCart(true);

      const response: apiResponse = await updateKorpa({
        sportskiObjekatId: sportskiObjekatId,
        brojUcesnika: 1,
        userId: userData.id
      });

      console.log("Logujem dodat sportski objekat: ", response.data);

      if (response.data && response.data.isSuccess) {
        toastNotify("Odabrali ste sportski objekat: " + data.result.naziv)
      }

      setIsAddingToCart(true);
    }

    const openGoogleMaps = (lokacija: string) => {
      const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(lokacija)}`;
      window.open(googleMapsUrl, "_blank");
    }

    const handleShowTermini = () => {
      setShowTermini(!showTermini);
    };

    console.log(sportskiObjekatId);
    console.log("Logujem termine:", terminiData)
    
  return (
    <div className="container pt-4 pt-md-5">
      {!isLoading ? (
      <div className="row">
      <div className="col-7">
        <h2 style={{color:"#51285f"}}>{data.result.naziv}</h2>
        <span>
          <span
            className="badge text-bg-dark pt-2"
            style={{ height: "40px", fontSize: "20px" }}
          >
            {data.result?.vrstaSporta}
          </span>
        </span>
        <hr />
        <span>
          <span
            className="badge text-bg-light pt-2"
            style={{ height: "40px", fontSize: "20px", cursor: "pointer"}}
            onClick={() => openGoogleMaps(data.result.lokacija)}
          >
          Lokacija: {data.result.lokacija}
          </span>
        </span>
        <p style={{ fontSize: "20px" }} className="pt-2">
        {data.result?.opis}
        </p>
        <span className="h3">Cena po satu: {data.result.cenaPoSatu} RSD</span> &nbsp;&nbsp;&nbsp;
        <div className="row pt-4">
          <div className='col-5'>
            <button 
              className='btn btn-success form-control' 
              onClick={handleShowTermini}
              >
              Proveri Dostupnost Termina
            </button>
          </div>
          <div className="col-5">
          <button className='btn form-control' style={{ backgroundColor: "#51285f", color:"white" }}
            onClick={() => handleAddToCart(data.result.sportskiObjekatId)}
          >
              Odaberi Objekat
            </button>
          </div>
          <div className="col-7 mt-4">
            <NavLink className="nav-link" aria-current="page" to="/">
              <button className="btn btn-secondary form-control">
                Nazad
                </button>
            </NavLink>
          </div>
        </div>
        {showTermini && (
          <div className='mt-3'>
            <h4>Dostupni Termini: </h4>
            {terminiLoading ? (
              <MainLoader />
            ) : (
              <div className='d-flex flex-wrap'>
                {terminiData.length > 0 ? (
                  terminiData.map((termin: terminModel) => {

                    let cardColor = "bg-success";
                    let statusText = "Slobodan";
                    let isClickable = true;

                    if (termin.status === SD_Status_Termina.Zauzet) {
                      cardColor = "bg-danger";
                      statusText = "Zauzet";
                      isClickable = false;
                    } else if (termin.status === SD_Status_Termina.Istekao) {
                      cardColor = "bg-warning";
                      statusText = "Termin je istekao!";
                      isClickable = false;
                    } else if (termin.status === SD_Status_Termina.Rezervisan) {
                      cardColor = "bg-primary";
                      statusText = "Rezervisan";
                      isClickable = false;
                    }

                    return (
                      <div
                        key={termin.terminId}
                        className={`termin-card m-2 p-3 rounded ${cardColor}`}
                        style={{
                          width: "250px",
                          color: "#fff",
                        }}
                      >
                        <h6>Datum: {termin.datumTermina ? new Date(termin.datumTermina).toLocaleDateString("sr-RS") : "Nepoznat datum"}</h6>
                        <h6>Vreme: {termin.vremePocetka} - {termin.vremeZavrsetka}</h6>
                        <p>Status: {termin.status}</p>
                      </div>
                    );
                  })
                ) : (
                  <p>Nema dostupnih Termina</p>
                )}
              </div>
            )}
          </div>
        )}
      </div>
      <div className="col-5">
        <img
          src={data.result.image}
          width="100%"
          style={{ borderRadius: "30%" }}
          alt="No content"
        ></img>
      </div>
        </div>) :
        (
          <div className = 'd-flex justify-content-center' style={{width: "100%"}}> 
            <MainLoader />
          </div>
        )}
  </div>
  )
}

export default SportskiObjekatDetails
