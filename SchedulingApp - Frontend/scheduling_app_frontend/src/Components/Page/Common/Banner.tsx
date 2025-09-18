import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { RootState } from "../../../Storage/Redux/store";
import { toastNotify } from "../../../Helper";
import "./banner.css";

import background from "../../../Assets/Images/sports-tools.jpg";
import back1 from "../../../Assets/Images/back1.jpg";
import { useTranslation } from "react-i18next";

function Banner() {
  const [value, setValue] = useState("");
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const userData = useSelector((state: RootState) => state.userAuthStore);

  const handleReservationClick = () => {
    const sportskiObjektiSection = document.getElementById("containerObjekti");
    if (sportskiObjektiSection) {
      sportskiObjektiSection.scrollIntoView({ behavior: "smooth" });
    }
    toast.info("Odaberite sportski objekat.", {
      position: "top-center",
      autoClose: 3000,
    });
  };

  const handleIzaberiObjekat = () => {
    if (!userData.id) {
      navigate("/login");
      toastNotify("Prijavite se da biste mogli da nastavite.", "info");
      return;
    } else {
      navigate("/filter/odabirObjekata");
    }
  };

  return (
    <section
      className="banner d-flex align-items-center text-white"
      style={{
        backgroundImage: `url(${background})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        minHeight: "100vh",
        position: "relative",
        borderBottom: "8px solid transparent",
        borderImage: "linear-gradient(to right, #51285f, #4da172) 1",
      }}
    >
      {/* Overlay preko slike */}
      <div
        className="overlay position-absolute top-0 start-0 w-100 h-100"
        style={{ backgroundColor: "rgba(0,0,0,0.55)" }}
      ></div>

      <div className="container position-relative z-2">
        <div className="row align-items-center">
          {/* Tekstualni deo */}
          <div className="col-md-6 text-start">
            <h1 className="display-4 fw-bold mb-3">
              {t("bannerTitle")}
            </h1>
            <h2 className="fw-bold mb-4"><strong>{t("bannerSubtitle")}</strong></h2>
            <p className="lead mb-4">
              {t("bannerDescription")}
            </p>

            <div className="d-flex flex-column flex-sm-row gap-3">
              <button
                className="btn btn-light btn-lg shadow"
                onClick={handleReservationClick}
              >
                {t("bannerBtn1")}
              </button>
              <button
                className="btn btn-lg text-white shadow"
                style={{ backgroundColor: "#51285f" }}
                onClick={handleIzaberiObjekat}
              >
                {t("bannerBtn2")}
              </button>
              <button
                className="btn btn-lg text-white shadow"
                style={{ backgroundColor: "#4da172" }}
                onClick={() => navigate("/filter")}
              >
                {t("bannerBtn3")}
              </button>
            </div>
          </div>

          {/* Slika sa desne strane */}
          <div className="col-md-6 mt-5 mt-md-0 text-center">
            <div className="card border-0 shadow-lg rounded-4 overflow-hidden">
              <img
                src={back1}
                alt="Sports facility"
                className="img-fluid"
                style={{ maxHeight: "450px", objectFit: "cover" }}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Banner;
