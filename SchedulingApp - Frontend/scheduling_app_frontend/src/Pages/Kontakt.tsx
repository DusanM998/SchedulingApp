import React from 'react'
import background from "../Assets/Images/back.jpg";
import { Footer } from '../Components/Layout';
import { useTranslation } from 'react-i18next';

function Kontakt() {
  const { t } = useTranslation();

  return (
    <div>
      <div className='container fluid vh-100 d-flex align-items-center'>
        <div className='row w-100'>
          <div className='col-md-6 d-flex flex-column justify-content-center p-5'>
              <h1 style={{ color: "#51285f", fontSize:"3rem" }} className="fw-bold">{t('kontakt.title')}</h1>
              <p className='fs-3 mt-4'>
                  <strong>{t('kontakt.phone')}:</strong>
                  <a href="tel:+381637203725" className='text-success'>+381 63-720-3725</a>
              </p>
              <p className='fs-3'>
                  <strong>{t('kontakt.email')}:</strong>
                  <a href="mailto:milojkovic.dusan98@gmail.com" className='text-success'>milojkovic.dusan98@gmail.com</a>
              </p>
          </div>
          <div className='col-md-6 d-flex justify-content-center align-items-center'>
              <img 
                  src={background}
                  alt=''
                  className='img-fluid rounded'
                  style={{maxWidth: "100%"}}
              />
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}

export default Kontakt
