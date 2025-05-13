import React from 'react'
import { useSelector } from 'react-redux';
import { RootState } from '../../Storage/Redux/store';
import { useGetSveRezervacijeQuery } from '../../apis/rezervacijaApi';
import { MainLoader } from '../../Components/Page/Common';
import RezervacijaLista from './RezervacijaLista';

function MojeRezervacije() {

    const userId = useSelector((state: RootState) => state.userAuthStore.id);
    const { data, isLoading } = useGetSveRezervacijeQuery({ userId });

    console.log("Logujem data za korisnicku rezervaciju");

    

  return (
    <>
        {isLoading && <MainLoader />}
        {!isLoading && (
            <>
                <div className='d-flex align-items-center justify-content-between mx-5 mt-5'>
                    <h1 className='text' style={{ color: "#51285f" }}>Moje Rezervacije: </h1>
                </div>
                  {data?.apiResponse.result.length > 0 && (
                      <RezervacijaLista
                        isLoading = {isLoading}
                        rezervacijaData = {data?.apiResponse.result}
                      />
                  )}
                  {!(data?.apiResponse.result.length > 0) && (
                      <div className='px-5 py-3'>
                        <h5 className="text-muted">Još uvek nemate rezervaciju.</h5>
                      </div>
                  )}
            </>
        )}
    </>
  )
}

export default MojeRezervacije
