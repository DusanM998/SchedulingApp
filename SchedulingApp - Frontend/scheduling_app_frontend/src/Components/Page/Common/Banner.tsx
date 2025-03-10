import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import 'bootstrap/dist/css/bootstrap.min.css';
import background from "../../../Assets/Images/background.jpg";
import "./banner.css";

function Banner() {
  const [value, setValue] = useState("");
  const dispatch = useDispatch();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value);
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
        <button className="btn btn-dark btn-lg mt-3">Rezerviši Termin</button>
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
