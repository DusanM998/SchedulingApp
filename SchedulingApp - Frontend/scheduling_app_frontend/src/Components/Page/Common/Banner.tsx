import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import 'bootstrap/dist/css/bootstrap.min.css';
import background from "../../../Assets/Images/background.jpg";
import "./banner.css";
import { toast } from 'react-toastify';

function Banner() {
  const [value, setValue] = useState("");
  const dispatch = useDispatch();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value);
  };

  const handleReservationClick = () => {
    const sportskiObjektiSection = document.getElementById("containerObjekti");
    if (sportskiObjektiSection) {
      sportskiObjektiSection.scrollIntoView({ behavior: "smooth" });
    }

    // Prikazivanje toast notifikacije
    toast.info("Molimo Vas da prvo odaberete sportski objekat.", {
      position: "top-center",
      autoClose: 3000, // Automatsko zatvaranje nakon 3 sekunde
    });
  };

  return (
    <div className="container-fluid min-vh-100 d-flex flex-column flex-md-row align-items-center justify-content-between bg-light p-5"
      style={{borderBottom: "5px solid #4da172"}}>
      <div className="col-md-6 text-start">
        <h1 className="text-primary fw-bold">Rezerviši sportske termine online.</h1>
        <h2 className="text-success fw-bold mt-2">Besplatno!</h2>
        <p className="mt-4 text-secondary fs-5">
          Proveri dostupnost i rezerviši salu za fudbal, teren za tenis ili salu za košarku.
        </p>
        <button className="btn btn-dark btn-lg mt-3" onClick={handleReservationClick}>Rezerviši Termin</button>
      </div>
      <div className='custom-banner'>
        <div className='gradient-overlay'>
          <img src={background} alt="Scheduling App" className="banner-image" />
        </div>
          
      </div>
      
    </div>
  );
}

export default Banner;
