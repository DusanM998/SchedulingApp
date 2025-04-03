import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { stavkaKorpeModel, terminModel, userModel } from '../../Interfaces';
import { RootState } from '../../Storage/Redux/store';
import { useGetTerminByIdQuery, useGetTerminiQuery } from '../../apis/terminApi';
import { useRemoveShoppingCartItemMutation, useUpdateShoppingCartMutation, useUpdateShoppingCartWithTerminiMutation } from '../../apis/shoppingCartApi';
import { azurirajCenu, azurirajKolicinu, azurirajStatusTermina, removeFromCart, setTerminForObjekat } from '../../Storage/Redux/shoppingCartSlice';
import { toast } from 'react-toastify';

function RezervacijaSummary() {

  const dispatch = useDispatch();
  const userData: userModel = useSelector((state: RootState) => state.userAuthStore);
  const [selectedTermini, setSelectedTermini] = useState<Record<number, terminModel[]>>({});
  const [expandedCard, setExpandedCard] = useState<number | null>(null);
  const [selectedSportskiObjekatId, setSelectedSportskiObjekatId] = useState<number | null>(null);
  const shoppingCartStore: stavkaKorpeModel[] = useSelector(
    (state: RootState) => state.shoppingCartFromStore.stavkaKorpe ?? []
  );
  const [azurirajKorpu] = useUpdateShoppingCartMutation();

  const [removeShoppingCartItem] = useRemoveShoppingCartItemMutation();

  const [azurirajKorpuSaTerminima] = useUpdateShoppingCartWithTerminiMutation();

  //console.log("Stavke u korpi", shoppingCartStore);
  //const sportskiObjekatIds = shoppingCartStore.map(item => item.sportskiObjekat?.sportskiObjekatId);
  //console.log("Id stavki: ", sportskiObjekatIds);

  const { data: termini, isLoading, isError } = useGetTerminByIdQuery(selectedSportskiObjekatId);
  //console.log("Termini: ", termini);
  
  const handleTerminSelection = (sportskiObjekatId: number, termin: terminModel) => {
    setSelectedTermini((prev) => {
      const trenutniTermini = prev[sportskiObjekatId] || [];

      // Proveravamo da li je termin vec odabran
      const postoji = trenutniTermini.some(t => t.terminId === termin.terminId);
      const noviTermini = postoji
        ? trenutniTermini.filter(t => t.terminId !== termin.terminId) // Uklanja ako već postoji
        : [...trenutniTermini, termin]; // Dodaje ako ne postoji

      //Azuriranje cene odmah nakon promene termina
      const novaCena = racunajCenuZaObjekat({
        ...shoppingCartStore.find(s => s.sportskiObjekat?.sportskiObjekatId === sportskiObjekatId)!,
        kolicina: shoppingCartStore.find(s => s.sportskiObjekat?.sportskiObjekatId === sportskiObjekatId)?.kolicina || 0,
      });
    
      dispatch(azurirajCenu({ sportskiObjekatId, cenaZaSportskiObjekat: novaCena }));

      return { ...prev, [sportskiObjekatId]: noviTermini };
    });

    dispatch(setTerminForObjekat({sportskiObjekatId, terminId: termin.terminId, termin}))
    console.log(`Odabran termin ${termin.terminId} za objekat ${sportskiObjekatId}`);
  };

  const handleBrojUcesnika = (brojUcesnika: number, stavkaKorpe: stavkaKorpeModel, ukloni?: boolean) => {
    if (ukloni) {
      // Ako korisnik klikne "Ukloni", brisemo stavku iz korpe
      removeShoppingCartItem({
        sportskiObjekatId: stavkaKorpe.sportskiObjekat?.sportskiObjekatId,
        userId: userData.id,
      });
      dispatch(removeFromCart({ stavkaKorpe }));
      toast.info(`Uklonjen sportski objekat: ${stavkaKorpe.sportskiObjekat?.naziv}`, {
        position: "top-center",
        autoClose: 3000,
      });
      return;
    }
  
    const trenutnaKolicina = stavkaKorpe.kolicina || 0;
    const novaKolicina = trenutnaKolicina + brojUcesnika;
  
    if (novaKolicina > stavkaKorpe.sportskiObjekat?.kapacitet!) {
      toast.error(`Prekoračen kapacitet! Maksimalno: ${stavkaKorpe.sportskiObjekat?.kapacitet} učesnika`, {
        position: "top-center",
        autoClose: 3000,
      });
      return;
    }
  
    if (novaKolicina < 1) {
      
      toast.error("Minimalni broj učesnika! je 1!", {
        position: "top-center",
        autoClose: 3000,
      });
      return;
    }
  
    azurirajKorpu({
      sportskiObjekatId: stavkaKorpe.sportskiObjekat?.sportskiObjekatId,
      brojUcesnika: brojUcesnika,
      userId: userData.id,
    });
    console.log("Slanje podataka za azuriranje:", { stavkaKorpe, novaKolicina });
    dispatch(azurirajKolicinu({ stavkaKorpe: {...stavkaKorpe} , kolicina: novaKolicina }));
    
    console.log("Logujem novu kolicinu", novaKolicina);
  };

  const handleExpandCard = (sportskiObjekatId: number) => {
    //console.log("Kliknuto na sportskiObjekatId:", sportskiObjekatId);
    setExpandedCard(expandedCard === sportskiObjekatId ? null : sportskiObjekatId);
    setSelectedSportskiObjekatId(sportskiObjekatId);
  };

  const handleConfirmSelection = (sportskiObjekatId: number, stavkaKorpe: stavkaKorpeModel) => {
    if (!selectedTermini[sportskiObjekatId] || selectedTermini[sportskiObjekatId].length === 0) {
      toast.error("Morate odabrati bar jedan termin!", { position: "top-center", autoClose: 3000 });
      return;
    }

    const terminiIds = selectedTermini[sportskiObjekatId].map(t => Number(t.terminId));
    console.log("Tip podataka terminIds:", Array.isArray(terminiIds), typeof terminiIds[0]);

    azurirajKorpuSaTerminima({
      sportskiObjekatId,
      userId: userData.id,
      kolicina: stavkaKorpe.kolicina,
      terminIds: terminiIds
    }).then((response) => {
      console.log('Odgovor servera:', response);
        if ("data" in response) {
          dispatch(setTerminForObjekat({ sportskiObjekatId, terminId: terminiIds, termin: selectedTermini[sportskiObjekatId] }));

          const novaCena = racunajCenuZaObjekat({ ...stavkaKorpe, kolicina: stavkaKorpe.kolicina });
          dispatch(azurirajCenu({ sportskiObjekatId, cenaZaSportskiObjekat: novaCena }));

          dispatch(azurirajStatusTermina({ sportskiObjekatId }));

          toast.success("Termini uspešno ažurirani!", { position: "top-center", autoClose: 3000 });
        } else {
          toast.error("Došlo je do greške pri ažuriranju termina!", { position: "top-center", autoClose: 3000 });
        }
    }).catch((error) => {
        console.error('Greška prilikom ažuriranja termina:', error);
        toast.error("Došlo je do greške prilikom ažuriranja!", { position: "top-center", autoClose: 3000 });
    });

    //toast.success("Termini uspešno ažurirani!", { position: "top-center", autoClose: 3000 });

    console.log("Azuriranje termina u korpi", { sportskiObjekatId, terminiIds });
  }

  const racunajCenuZaObjekat = (stavkaKorpe: stavkaKorpeModel) => {
    if (!stavkaKorpe.sportskiObjekat) return 0;
  
    const sportskiObjekatId = stavkaKorpe.sportskiObjekat.sportskiObjekatId;
    const terminiZaObjekat = selectedTermini[sportskiObjekatId] || [];
    const cenaPoSatu = stavkaKorpe.sportskiObjekat.cenaPoSatu ?? 0;
  
    return terminiZaObjekat.reduce((ukupno, termin) => {
      if (!termin.vremePocetka || !termin.vremeZavrsetka) return ukupno;
  
      const [startHours, startMinutes] = termin.vremePocetka.split(":").map(Number);
      const [endHours, endMinutes] = termin.vremeZavrsetka.split(":").map(Number);
  
      const startTime = new Date();
      startTime.setHours(startHours, startMinutes, 0);
  
      const endTime = new Date();
      endTime.setHours(endHours, endMinutes, 0);
  
      const trajanjeUSatima = (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60);
      return ukupno + (cenaPoSatu * trajanjeUSatima);
    }, 0);
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
              Ukupna cena: {stavkaKorpe.cenaZaSportskiObjekat !== undefined ? stavkaKorpe.cenaZaSportskiObjekat.toFixed(2) : "Računa se..."} RSD
              </h4>
            </div>
              <div className='flex-fill'>
                <h4 className='text-danger'>Cena po Satu: {stavkaKorpe.sportskiObjekat!.cenaPoSatu} RSD</h4>
                <h5>Kapacitet: {stavkaKorpe.sportskiObjekat?.kapacitet}</h5>
              </div>
              <div className='d-flex align-items-center justify-content-between mt-2"'>
                <div
                  className='d-flex align-items-center p-2 mt-2 rounded-pill custom-card-shadow'
                  style={{width: "100px", height:"45px"}}
                >
                  <span className='me-2'>
                    <p>Broj učesnika</p>
                  </span>
                  <span style={{ color: "rgba(22,22,22,.7)" }} role="button">
                    <i className='bi bi-dash-circle-fill' onClick={() => handleBrojUcesnika(-1, stavkaKorpe)}/>
                  </span>
                  <span className='m-1'>
                    <b>{stavkaKorpe.kolicina}</b>
                  </span>
                  <span style={{ color: "rgba(22,22,22,.7)" }} role="button">
                    <i className='bi bi-plus-circle-fill' onClick={() => handleBrojUcesnika(1, stavkaKorpe)}/>
                  </span>
                </div>
                <button className='btn btn-danger mx-1' onClick={() => handleBrojUcesnika(0, stavkaKorpe, true)}>
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
                <div>
                  <div className="d-flex flex-wrap justify-content-center">
                    {termini.map((termin: terminModel) => {
                      const isSelected = selectedTermini[stavkaKorpe.sportskiObjekat!.sportskiObjekatId]?.some(t => t.terminId === termin.terminId);
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
                  <button
                    className='btn btn-success mt-3'
                    onClick={() => handleConfirmSelection(stavkaKorpe.sportskiObjekat!.sportskiObjekatId, stavkaKorpe)}
                  >Potvrdi odabir</button>
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