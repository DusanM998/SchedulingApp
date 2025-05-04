import React, { useState } from 'react'
import { rezervacijaRezimeProps } from '../../Interfaces/rezervacijaRezimeProps'
import getStatusColor from '../../Helper/getStatusColor'
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../../Storage/Redux/store';
import { useUpdateRezervacijaHeaderMutation } from '../../apis/rezervacijaApi';
import { SD_Status } from '../../Utility/SD';
import { MainLoader } from '../../Components/Page/Common';
import { stavkaKorpeModel } from '../../Interfaces';

function RezervacijaRezime({ data, userInput }: rezervacijaRezimeProps) {
  
  const tipBoja = getStatusColor(data.status!);
  const navigate = useNavigate();
  const userData = useSelector((state: RootState) => state.userAuthStore);
  const [loading, setIsLoading] = useState(false);
  const [updateRezervacijaHeader] = useUpdateRezervacijaHeaderMutation();

  const nextStatus: any = data.status! === SD_Status.Potvrdjena ?
    { color: "info", value: SD_Status.U_Toku }
    : data.status! === SD_Status.U_Toku &&
    { color: "success", value: SD_Status.Zavrsena };
  
  const handleNextStatus = async () => {
    setIsLoading(true);

    await updateRezervacijaHeader({
      rezervacijaHeaderId: data.rezervacijaHeaderId,
      status: nextStatus.value,
    });

    setIsLoading(false);
  }

  const handleCancelRezervacija = async () => {
    setIsLoading(true);

    await updateRezervacijaHeader({
      rezervacijaHeaderId: data.rezervacijaHeaderId,
      status: SD_Status.Otkazana,
    });

    setIsLoading(false);
  }

  return (
    <div>
      {loading && <MainLoader />}
      {!loading && 
        <>
         <div className='d-flex justify-content-between align-items-center'>
          <h3 style={{ color: "#51285f" }}>Rezime Rezervacije</h3>
          <span className={`btn btn-outline-${tipBoja} fs-6`}>{data.status }</span>
         </div>
         
         <div className='mt-3'>
          <div className='border py-3 px-2'>Ime: {userInput.name}</div>
          <div className='border py-3 px-2'>Email: {userInput.email}</div>
          <div className='border py-3 px-2'>Broj Telefona: {userInput.phoneNumber}</div>
          <div className='border py-3 px-2'>
            <h4 style={{ color: "#51285f" }}>Rezervacije Termina i Objekata</h4>
            <div className='p-3'>
              {data.stavkeKorpe?.map((stavkeKorpe: stavkaKorpeModel, index: number) => {
                return (
                  <div className="d-flex" key={index}>
                    <div className="d-flex w-100 justify-content-between"> 
                      <p>{ stavkeKorpe.sportskiObjekat?.naziv}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
         </div>
        </>}
    </div>
  )
}

export default RezervacijaRezime
