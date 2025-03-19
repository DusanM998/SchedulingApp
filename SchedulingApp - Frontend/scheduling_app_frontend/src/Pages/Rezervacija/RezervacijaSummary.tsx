import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { stavkaKorpeModel, terminModel, userModel } from '../../Interfaces';
import { RootState } from '../../Storage/Redux/store';
import Calendar from 'react-calendar';
import './calendar.css';
import { useGetTerminiQuery } from '../../apis/terminApi';
import { useUpdateShoppingCartMutation } from '../../apis/shoppingCartApi';
import { removeFromCart } from '../../Storage/Redux/shoppingCartSlice';

function RezervacijaSummary() {

  const dispatch = useDispatch();
  const userData: userModel = useSelector((state: RootState) => state.userAuthStore);
  const [date, setDate] = useState(new Date());
  const [selectedTermin, setSelectedTermin] = useState<number | null>(null);
  const [expandedCard, setExpandedCard] = useState<number | null>(null);
  const shoppingCartStore: stavkaKorpeModel[] = useSelector(
    (state: RootState) => state.shoppingCartFromStore.stavkaKorpe ?? []
  );
  const [azurirajKorpu] = useUpdateShoppingCartMutation();

  //console.log("Stavke u korpi", shoppingCartStore);

  const { data: termini, isLoading, isError } = useGetTerminiQuery(null);
  console.log("Termini: ", termini);

  const formatDate = (date: Date) => date.toISOString().split("T")[0];

  const handleDateChange = (newDate: Date | Date[] | null) => {
    if (newDate && newDate instanceof Date && newDate.getMonth() === date.getMonth()) {
      setDate(newDate);
    }
  };
  
  const handleTerminSelection = (terminId: number) => {
    const termin = termini?.find((t: terminModel) => t.terminId === terminId);
    if (termin && termin.status === "Slobodan") {
      setSelectedTermin(terminId);
    }
  }

  const handleKolicina = (kolicina: number, stavkaKorpe: stavkaKorpeModel) => {
    if ((kolicina == -1 && stavkaKorpe.kolicina == 1) || kolicina == 0) {
      //brise stavku iz korpe
      azurirajKorpu({
        sportskiObjekatId: stavkaKorpe.sportskiObjekat?.sportskiObjekatId,
        kolicina: 0,
        userId: userData.id,
      });
      dispatch(removeFromCart({ stavkaKorpe, kolicina: 0 }));
    }
    else {
      //Azurira novu kolicinu
      azurirajKorpu({
        sportskiObjekatId: stavkaKorpe.sportskiObjekat?.sportskiObjekatId,
        kolicina: kolicina,
        userId: userData.id,
      });
      dispatch(removeFromCart({ stavkaKorpe, kolicina: stavkaKorpe.kolicina! + kolicina }));
    }
  }

  const handleExpandCard = (sportskiObjekatId: number) => {
    console.log("Kliknuto na sportskiObjekatId:", sportskiObjekatId);
    setExpandedCard(expandedCard === sportskiObjekatId ? null : sportskiObjekatId);
  };

  if (!shoppingCartStore) {
    return <div>Prazna Korpa!</div>
  }

  return (
    <div className='container p-4 m-2'>
      <h4 className="text-center" style={{ color: "#51285f" }}>Rezime rezervacije</h4>
      {shoppingCartStore.map((stavkaKorpe: stavkaKorpeModel, index: number) => (
        <div
          key={index}
          className={`d-flex flex-sm-column align-items-center custom-card-shadow rounded m-3 p-3
             ${expandedCard === stavkaKorpe.sportskiObjekat?.sportskiObjekatId ? "expanded-card" : ""}`}
          style={{ background: "ghostwhite" }}
        >
        <div className='d-flex flex-sm-row flex-column align-items-center'>
          <div className='p-3'>
            <img
              src={stavkaKorpe.sportskiObjekat?.image}
              alt=''
              width={"120px"}
              className='rounded-circle'
            />
          </div>
          <div className='p-2 mx-3' style={{ width: "100%" }}>
            <div className='d-flex justify-content-between align-items-center'>
              <h4 style={{ fontWeight: 300, marginRight: "3px"}}>{stavkaKorpe.sportskiObjekat?.naziv}</h4>
              <h4 style={{ marginLeft: "3px"}}>Ukupna cena: {(stavkaKorpe.kolicina! * stavkaKorpe.sportskiObjekat!.cenaPoSatu)} RSD</h4>
            </div>
              <div className='flex-fill'>
                <h4 className='text-danger'>Cena po Satu: {stavkaKorpe.sportskiObjekat!.cenaPoSatu} RSD</h4>
              </div>
              <div className='d-flex align-items-center justify-content-between mt-2"'>
                <div
                  className='d-flex align-items-center p-2 mt-2 rounded-pill custom-card-shadow'
                  style={{width: "100px", height:"45px"}}
                >
                  <span className='me-2'>
                    <p>Broj rezervacija</p>
                  </span>
                  <span style={{ color: "rgba(22,22,22,.7)" }} role="button">
                    <i className='bi bi-dash-circle-fill' onClick={() => handleKolicina(-1, stavkaKorpe)}/>
                  </span>
                  <span className='m-1'>
                    <b>{stavkaKorpe.kolicina}</b>
                  </span>
                  <span style={{ color: "rgba(22,22,22,.7)" }} role="button">
                    <i className='bi bi-plus-circle-fill' onClick={() => handleKolicina(1, stavkaKorpe)}/>
                  </span>
                </div>
                <button className='btn btn-danger mx-1' onClick={() => handleKolicina(0, stavkaKorpe)}>
                  Ukloni
                </button>
              </div>
              <div className='d-flex align-items-center justify-content-center mt-2'>
                <button className='btn btn-success' onClick={() => handleExpandCard(stavkaKorpe.sportskiObjekat!.sportskiObjekatId)}>
                  {expandedCard === stavkaKorpe.sportskiObjekat?.sportskiObjekatId ? "Sakrij termine" : "Odaberi termin"}
                </button>
              </div>
            </div>
          </div>
          {/* Prikaz termina samo ako je kartica proširena */}
          {expandedCard === stavkaKorpe.sportskiObjekat?.sportskiObjekatId && (
            <div className="termini-container mt-3 text-center">
              <h5>Odaberite termin</h5>
              {isLoading ? (
                <p>Učitavanje termina...</p>
              ) : isError ? (
                <p>Greška prilikom učitavanja termina.</p>
              ) : (
                <div className="d-flex flex-wrap justify-content-center">
                  {termini
                    ?.filter((t: terminModel) => formatDate(new Date(t.datumTermina!)) === formatDate(date))
                    .map((termin: terminModel) => (
                      <div
                        key={termin.terminId}
                        className={`termin-card m-2 p-3 rounded ${termin.status === "Zauzet" ? "bg-danger" : "bg-success"} 
                          ${selectedTermin === termin.terminId ? "border border-dark" : ""}`}
                        onClick={() => handleTerminSelection(termin.terminId!)}
                        style={{
                          width: "150px",
                          cursor: termin.status === "Slobodan" ? "pointer" : "not-allowed",
                          color: "#fff"
                        }}
                      >
                        <h6>{termin.vremePocetka} - {termin.vremeZavrsetka}</h6>
                        <p>{termin.status === "Zauzet" ? "Zauzet" : "Slobodan"}</p>
                      </div>
                    ))}
                </div>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

export default RezervacijaSummary