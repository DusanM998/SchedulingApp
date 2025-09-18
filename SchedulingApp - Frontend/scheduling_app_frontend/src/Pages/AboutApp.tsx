import React from "react";
import appImg1 from "../Assets/Images/app1.jpg";
import appImg2 from "../Assets/Images/app2.webp";
import appImg3 from "../Assets/Images/app3.jpg";
import { Footer } from "../Components/Layout";
import { useTranslation } from "react-i18next";

function AboutApp() {
  const { t } = useTranslation();

  return (
    <div>
      {/* Sekcija 1 */}
      <div className="container-fluid py-5">
        <div className="row align-items-center">
          <div className="col-md-6 p-5">
            <h2 className="fw-bold" style={{ color: "#51285f" }}>
              {t("aboutApp.section1Title")}
            </h2>
            <p className="fs-5 mt-3"
              dangerouslySetInnerHTML={{ __html: t("aboutApp.section1Text") }}
            >
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
              {t("aboutApp.section2Title")}
            </h2>
            <p className="fs-5 mt-3">
              {t("aboutApp.section2Text")}
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
              {t("aboutApp.section3Title")}
            </h2>
            <p className="fs-5 mt-3">
              {t("aboutApp.section3Text")}
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
