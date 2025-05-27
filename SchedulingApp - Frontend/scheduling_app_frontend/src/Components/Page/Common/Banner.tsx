import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import 'bootstrap/dist/css/bootstrap.min.css';
import background from "../../../Assets/Images/background.jpg";
import "./banner.css";
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { RootState } from '../../../Storage/Redux/store';
import { toastNotify } from '../../../Helper';

function Banner() {
  const [value, setValue] = useState("");
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const userData = useSelector((state: RootState) => state.userAuthStore);

  console.log("User data banner:", userData);

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

  const handleIzaberiObjekat = () => {
    if (!userData.id) {
      navigate("/login");
      toastNotify("Prijavite se da biste mogli da nastavite.", "info");
      return;
    } else {
      navigate("/filter/odabirObjekata")
    }
  }

  return (
    <div className="container-fluid min-vh-100 d-flex flex-column flex-md-row align-items-center justify-content-between bg-light p-5"
      style={{borderBottom: "5px solid #4da172"}}>
      <div className="col-md-6 text-start">
        <h1 style={{ color: "#51285f", fontSize:"3rem" }} className="fw-bold">Rezerviši sportske termine online.</h1>
        <h2 className="text-success fw-bold mt-2">Besplatno!</h2>
        <p className="mt-4 text-secondary fs-5">
          Proveri dostupnost i rezerviši salu za fudbal, teren za tenis ili salu za košarku.
        </p>
        <button className="btn btn-dark btn-lg mt-3" onClick={handleReservationClick}>Rezerviši Termin</button> <br />
        <button className="btn btn-lg mt-2" style={{backgroundColor:"#51285f", color:"white"}} onClick={handleIzaberiObjekat}>Izaberi Objekat</button> <br />
        <button className="btn btn-lg mt-2" style={{ backgroundColor: "#4da172", color: "white" }} onClick={() => navigate("/filter")}>Pretraga Termina i Objekata</button>
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
