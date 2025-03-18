import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { userModel } from '../../Interfaces';
import { RootState } from '../../Storage/Redux/store';
import Calendar from 'react-calendar';
import './calendar.css';

function RezervacijaSummary() {

  const dispatch = useDispatch();
  const userData: userModel = useSelector((state: RootState) => state.userAuthStore);
  const [date, setDate] = useState(new Date());

  const handleDateChange = (newDate: Date | Date[] | null) => {
    if (newDate && newDate instanceof Date && newDate.getMonth() === date.getMonth()) {
      setDate(newDate);
    }
  };
  

  return (
    <div className='container p-4 m-2'>
      <h4 className="text-center" style={{ color: "#51285f" }}>Rezime rezervacije</h4>
      
      <div
        className='d-flex flex-sm-row flex-column align-items-center custom-card-shadow rounded m-3'
        style={{ background: "ghostwhite" }}
      >
        <div className='p-3'>
          <img
            src=''
            alt=''
            width={"120px"}
            className='rounded-circle'
          />
        </div>
        <div className='p-2 mx-3' style={{ width: "100%" }}>
          <div className='d-flex justify-content-between align-items-center'>
            <h4 style={{ fontWeight: 300 }}>Ime sportskog objekta</h4>
            <h4>CENA</h4>
          </div>
          <div className='flex-fill'>
            <h4 className='text-danger'>Cena</h4>
          </div>
          <div className='d-flex justify-content-between'>
            <div
              className='d-flex justify-content-between p-2 mt-2 rounded-pill custom-card-shadow'
              style={{width: "100px", height:"43px"}}
            >
              <span style={{ color: "rgba(22,22,22,.7)" }} role="button">
                <i className='bi bi-dash-circle-fill' />
              </span>
              <span style={{ color: "rgba(22,22,22,.7)" }} role="button">
                <i className='bi bi-plus-circle-fill' />
              </span>
            </div>
            <button className='btn btn-danger mx-1'>
              Ukloni
            </button>
          </div>
        </div>
      </div>

      <div className='calendar-container mt-4 text-center'>
        <h5 className='text-center' style={{ color: "#51285f" }}>Odaberite datum</h5>
        <div className='d-flex justify-content-center'>
          <Calendar onChange={(value) => handleDateChange(value as Date | null)} className="custom-calendar" value={date} />
        </div>
      </div>
    </div>
  )
}

export default RezervacijaSummary
