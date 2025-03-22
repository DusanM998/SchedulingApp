import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { stavkaKorpeModel, terminModel, userModel } from '../../Interfaces';
import { RootState } from '../../Storage/Redux/store';
import { useGetTerminByIdQuery, useGetTerminiQuery } from '../../apis/terminApi';
import { useUpdateShoppingCartMutation } from '../../apis/shoppingCartApi';
import { removeFromCart, setTerminForObjekat } from '../../Storage/Redux/shoppingCartSlice';

function RezervacijaSummary() {

  const dispatch = useDispatch();
  const userData: userModel = useSelector((state: RootState) => state.userAuthStore);
  const [date, setDate] = useState(new Date());
  const [selectedTermini, setSelectedTermini] = useState<Record<number, number | null>>({});
  const [expandedCard, setExpandedCard] = useState<number | null>(null);
  const [selectedSportskiObjekatId, setSelectedSportskiObjekatId] = useState<number | null>(null);
  const shoppingCartStore: stavkaKorpeModel[] = useSelector(
    (state: RootState) => state.shoppingCartFromStore.stavkaKorpe ?? []
  );
  const [azurirajKorpu] = useUpdateShoppingCartMutation();

  //console.log("Stavke u korpi", shoppingCartStore);
  //const sportskiObjekatIds = shoppingCartStore.map(item => item.sportskiObjekat?.sportskiObjekatId);
  //console.log("Id stavki: ", sportskiObjekatIds);

  const { data: termini, isLoading, isError } = useGetTerminByIdQuery(selectedSportskiObjekatId);
  //console.log("Termini: ", termini);
  
  const handleTerminSelection = (sportskiObjekatId: number, termin: terminModel) => {
    setSelectedTermini(prev => ({
      ...prev,
      [sportskiObjekatId]: termin.terminId, // Postavlja termin samo za dati sportski objekat
    }));

    dispatch(setTerminForObjekat({sportskiObjekatId, terminId: termin.terminId, termin}))
    console.log(`Odabran termin ${termin.terminId} za objekat ${sportskiObjekatId}`);
  };

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
    //console.log("Kliknuto na sportskiObjekatId:", sportskiObjekatId);
    setExpandedCard(expandedCard === sportskiObjekatId ? null : sportskiObjekatId);
    setSelectedSportskiObjekatId(sportskiObjekatId);
  };

  const racunajUkupnuCenu = (stavkaKorpe: stavkaKorpeModel) => {
    if (!stavkaKorpe.sportskiObjekat) {
      return 0;
    }

    const sportskiObjekatId = stavkaKorpe.sportskiObjekat.sportskiObjekatId;
    const selectedTerminId = selectedTermini[sportskiObjekatId]; // Pravi termin samo za dati objekat
  
    const termin = termini?.find((t: terminModel) => t.terminId === selectedTerminId);
    if (!termin || !termin.datumTermina || !termin.vremePocetka || !termin.vremeZavrsetka) {
      return 0;
    }
  
    // Parsiranje vremena (08:00 -> 8h 0m)
    const [startHours, startMinutes] = termin.vremePocetka.split(":").map(Number);
    const [endHours, endMinutes] = termin.vremeZavrsetka.split(":").map(Number);
  
    // Kreiranje novih Date objekata
    const datum = new Date(termin.datumTermina);
    const startTime = new Date(datum);
    startTime.setHours(startHours, startMinutes, 0); // Postavljamo sate i minute
  
    const endTime = new Date(datum);
    endTime.setHours(endHours, endMinutes, 0);
  
    if (isNaN(startTime.getTime()) || isNaN(endTime.getTime())) {
      return 0;
    }
  
    // Izračunavanje trajanja u satima
    const durationInHours = (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60);
    const cenaPoSatu = stavkaKorpe.sportskiObjekat.cenaPoSatu ?? 0;
  
    return stavkaKorpe.kolicina! * cenaPoSatu * durationInHours;
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
              <h4 style={{ fontWeight: 300, marginRight: "5px"}}>{stavkaKorpe.sportskiObjekat?.naziv}</h4>
              <h4 style={{ marginLeft: "8px"}}>
                Ukupna cena: {racunajUkupnuCenu(stavkaKorpe)?.toFixed(2)} RSD
              </h4>
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
                <button
                  className='btn'
                  style={{backgroundColor:"#51285f", color: "white"}}
                  onClick={() => handleExpandCard(stavkaKorpe.sportskiObjekat!.sportskiObjekatId)}>
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
              ) : termini && termini.length > 0 ? (
                <div className="d-flex flex-wrap justify-content-center">
                  {termini.map((termin: terminModel) => {
                    const isSelected = selectedTermini[stavkaKorpe.sportskiObjekat!.sportskiObjekatId] === termin.terminId;
                    return (
                      <div
                        key={termin.terminId}
                        className={`termin-card m-2 p-3 rounded ${termin.status === "Zauzet" ? "bg-danger" : "bg-success"} 
                          ${isSelected ? "border border-dark" : ""}`}
                        onClick={() => handleTerminSelection(stavkaKorpe.sportskiObjekat!.sportskiObjekatId, termin)}
                        style={{
                          width: "250px",
                          cursor: termin.status === "Slobodan" ? "pointer" : "not-allowed",
                          color: "#fff",
                          transition: "all 0.3s ease-in-out",
                          transform: isSelected ? "scale(1.05)" : "scale(1)",
                        }}
                      >
                        <h6>Datum: {termin.datumTermina ? new Date(termin.datumTermina).toLocaleDateString("sr-RS") : "Nepoznat datum"}</h6>
                        <h6>Vreme: {termin.vremePocetka} - {termin.vremeZavrsetka}</h6>
                        <p>Status: {termin.status === "Zauzet" ? "Zauzet" : "Slobodan"}</p>
                      </div>
                    );
                    })}
                </div>
              ) : (
                <p>Jos uvek nema termina</p>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

export default RezervacijaSummary