import React from 'react'
import { useDeleteSportskiObjekatMutation, useGetSportskiObjektiQuery } from '../../apis/sportskiObjekatApi'
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { MainLoader } from '../../Components/Page/Common';
import sportskiObjekatModel from '../../Interfaces/sportskiObjekatModel';

function SportskiObjektiTabela() {

    const { data, isLoading } = useGetSportskiObjektiQuery(null);
    const navigate = useNavigate();
    const [deleteSportskiObjekat] = useDeleteSportskiObjekatMutation();

  //console.log(data);
  
  const handleSportskiObjekatDelete = async (id: number) => {
    toast.promise(
      deleteSportskiObjekat(id),
      {
        pending: 'Vaš zahtev se obrađuje...',
        success: 'Sportski Objekat obrisan uspešno',
        error: 'Došlo je do greške!'
      }
    )
  };

  return (
    <>
      {isLoading && <MainLoader />}
      {!isLoading && (
        <div className='table p-5'>
          <div className='d-flex align-items-center justify-content-between'>
            <h1 style={{ color: "##51285f" }}>Sportski Objekti</h1>
              <button
                className='btn'
                style={{ backgroundColor: "#51285f", color: "white" }}
                onClick={() => navigate("/sportskiObjekat/sportskiObjekatKreirajAzuriraj")}
              >
                Kreiraj Sportski Objekat
              </button>
          </div>
          <div className='p-2'>
            <div className='row border'>
              <div className='col-2'>Slika</div>
              <div className='col-1'>ID</div>
              <div className='col-2'>Naziv</div>
              <div className='col-2'>Lokacija</div>
              <div className='col-1'>Vrsta Sporta</div>
              <div className='col-1'>Radno Vreme</div>
              <div className='col-1'>Cena po satu</div>
              <div className='col-1'>Kapacitet</div>
              <div className='col-1'>Akcije</div>
            </div>
            {data.map((sportskiObjekat: sportskiObjekatModel) => {
              return(
                <div className='row border' key={sportskiObjekat.sportskiObjekatId}>
                  <div className='col-2'>
                    <img
                      src={sportskiObjekat.image}
                      alt=""
                      style={{ width: "100%", maxWidth: "120px" }}
                      className='rounded'
                    />
                  </div>
                  <div className='col-1'>{sportskiObjekat.sportskiObjekatId}</div>
                  <div className='col-2'>{sportskiObjekat.naziv }</div>
                  <div className='col-2'>{sportskiObjekat.lokacija}</div>
                  <div className='col-1'>{sportskiObjekat.vrstaSporta}</div>
                  <div className='col-1'>{sportskiObjekat.radnoVreme}</div>
                  <div className='col-1'>{sportskiObjekat.cenaPoSatu}</div>
                  <div className='col-1'>{sportskiObjekat.kapacitet}</div>
                  <div className='col-1'>
                    <button className="btn"
                      style={{ backgroundColor: "#51285f", color: "white" }} >
                      <i className="bi bi-pencil-fill"
                      onClick={()=> navigate("/sportskiObjekat/sportskiObjekatKreirajAzuriraj/" + sportskiObjekat.sportskiObjekatId)}></i>
                    </button>
                    <button className="btn btn-danger mx-2">
                      <i className="bi bi-trash-fill"
                        onClick={()=> handleSportskiObjekatDelete(sportskiObjekat.sportskiObjekatId)}></i>
                    </button>
                  </div>
                </div>
              )
            })

            }
          </div>
        </div>
      )}
    </>
  )
}

export default SportskiObjektiTabela
