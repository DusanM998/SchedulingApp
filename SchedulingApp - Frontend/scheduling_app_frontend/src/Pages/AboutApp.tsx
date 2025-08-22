import React from "react";
import appImg1 from "../Assets/Images/app1.jpg";
import appImg2 from "../Assets/Images/app2.webp";
import appImg3 from "../Assets/Images/app3.jpg";
import { Footer } from "../Components/Layout";

function AboutApp() {
  return (
    <div>
      {/* Sekcija 1 */}
      <div className="container-fluid py-5">
        <div className="row align-items-center">
          <div className="col-md-6 p-5">
            <h2 className="fw-bold" style={{ color: "#51285f" }}>
              O aplikaciji
            </h2>
            <p className="fs-5 mt-3">
              Naša aplikacija za <strong>rezervaciju termina</strong> omogućava
              jednostavno i brzo pronalaženje sportskih objekata širom Srbije.
              Bilo da želite da rezervišete teren za fudbal, košarku, tenis ili
              fitnes salu – sve možete da obavite iz par klikova.
            </p>
          </div>
          <div className="col-md-6 text-center">
            <img
              src={appImg1}
              alt="Sportska aplikacija"
              className="img-fluid rounded shadow"
              style={{ maxWidth: "80%" }}
            />
          </div>
        </div>
      </div>

      {/* Sekcija 2 */}
      <div className="container-fluid py-5 bg-light">
        <div className="row align-items-center flex-md-row-reverse">
          <div className="col-md-6 p-5">
            <h2 className="fw-bold" style={{ color: "#51285f" }}>
              Kako funkcioniše?
            </h2>
            <p className="fs-5 mt-3">
              Ulogujte se u aplikaciju, odaberite željeni sportski objekat i
              datum, i pogledajte dostupne termine. Rezervaciju možete završiti
              odmah i dobiti potvrdu u realnom vremenu. Takođe možete pratiti
              svoje ranije i buduće rezervacije.
            </p>
          </div>
          <div className="col-md-6 text-center">
            <img
              src={appImg2}
              alt="Proces rezervacije"
              className="img-fluid rounded shadow"
              style={{ maxWidth: "80%" }}
            />
          </div>
        </div>
      </div>

      {/* Sekcija 3 */}
      <div className="container-fluid py-5">
        <div className="row align-items-center">
          <div className="col-md-6 p-5">
            <h2 className="fw-bold" style={{ color: "#51285f" }}>
              Zašto baš naša aplikacija?
            </h2>
            <p className="fs-5 mt-3">
              Naša misija je da sport i rekreacija budu dostupni svima. Aplikacija
              povezuje korisnike i sportske centre, štedi vreme i eliminiše
              nepotrebne pozive i nesigurnost da li je termin slobodan. Sve
              informacije imate odmah pri ruci.
            </p>
          </div>
          <div className="col-md-6 text-center">
            <img
              src={appImg3}
              alt="Prednosti aplikacije"
              className="img-fluid rounded shadow"
              style={{ maxWidth: "80%" }}
            />
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default AboutApp;
