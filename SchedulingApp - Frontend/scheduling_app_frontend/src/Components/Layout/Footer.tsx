import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import logo2 from "../../Assets/Images/logo2.png"
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';

function Footer() {

  const { t } = useTranslation();

  const handleReservationClick = () => {
      const sportskiObjektiSection = document.getElementById("containerObjekti");
      if (sportskiObjektiSection) {
        sportskiObjektiSection.scrollIntoView({ behavior: "smooth" });
      }
  
      // Prikazivanje toast notifikacije
      toast.info("Odaberite sportski objekat.", {
        position: "top-center",
        autoClose: 3000, // Automatsko zatvaranje nakon 3 sekunde
      });
  };
  
  
  return (
    <footer className="bg-dark text-white py-5 px-4">
      <div className="container">
        <div className="row justify-content-between">
          <div className="col-md-4 mb-4">
            <div className="d-flex align-items-center mb-3">
              <img src={logo2} alt="SchedulingApp Logo" className="me-2" style={{ width: '40px', height: '40px' }} />
              <span className="fs-5 fw-bold">SchedulingApp</span>
            </div>
            <p className="text-secondary">
              {t("footerText1")}
            </p>
            <button className="btn btn-light mt-3" onClick={handleReservationClick}>{t("footerBtn1")}</button>
          </div>
          
          <div className="col-md-4 d-flex justify-content-between">
            <div>
              <h5 className="text-white">{t("footerH5")}</h5>
              <ul className="list-unstyled text-secondary">
                <li><a href="/sportskiObjektiPage" className="text-decoration-none text-secondary">{t("footerLi1")}</a></li>
                <li><a href="/aboutApp" className="text-decoration-none text-secondary">{t("footerLi2")}</a></li>
              </ul>
            </div>
            <div>
              <h5 className="text-white">{t("footerH5_2")}</h5>
              <ul className="list-unstyled text-secondary">
                <li><a href="/kontakt" className="text-decoration-none text-secondary">{t("footerLi3")}</a></li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      <div className="border-top border-secondary mt-4 pt-3 text-center text-secondary">
        <p>© 2025 Dusan Milojkovic</p>
        <p>Website developed by <span className="text-white fw-bold">Dusan Milojkovic</span></p>
      </div>
    </footer>
  );
}

export default Footer;
