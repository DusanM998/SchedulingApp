import React, { useState } from 'react'
import { NavLink, useNavigate, useParams } from 'react-router-dom';
import { useGetSportskiObjekatByIdQuery } from '../../apis/sportskiObjekatApi';
import { useSelector } from 'react-redux';
import { RootState } from '../../Storage/Redux/store';
import { userModel } from '../../Interfaces';
import { MainLoader, MiniLoader } from '../../Components/Page/Common';

function SportskiObjekatDetails() {

    const { sportskiObjekatId } = useParams();
    const { data, isLoading } = useGetSportskiObjekatByIdQuery(sportskiObjekatId);
    const [isAddingToCart, setIsAddingToCart] = useState<boolean>(false);
    const userData: userModel = useSelector((state: RootState) => state.userAuthStore);
    const navigate = useNavigate();
    
    const handleAddToCart = async(sportskiObjekatId: number) => { 
      if (!userData.id) {
        navigate("/login");
        return;
      }

      setIsAddingToCart(true);
    }

    const openGoogleMaps = (lokacija: string) => {
      const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(lokacija)}`;
      window.open(googleMapsUrl, "_blank");
    }

    console.log(sportskiObjekatId);
    
  return (
    <div className="container pt-4 pt-md-5">
      {!isLoading ? (
      <div className="row">
      <div className="col-7">
        <h2 style={{color:"#51285f"}}>{data.result.naziv}</h2>
        <span>
          <span
            className="badge text-bg-dark pt-2"
            style={{ height: "40px", fontSize: "20px" }}
          >
            {data.result?.vrstaSporta}
          </span>
        </span>
        <hr />
        <span>
          <span
            className="badge text-bg-light pt-2"
            style={{ height: "40px", fontSize: "20px", cursor: "pointer"}}
            onClick={() => openGoogleMaps(data.result.lokacija)}
          >
          Lokacija: {data.result.lokacija}
          </span>
        </span>
        <p style={{ fontSize: "20px" }} className="pt-2">
        {data.result?.opis}
        </p>
        <span className="h3">Cena po satu: {data.result.cenaPoSatu} RSD</span> &nbsp;&nbsp;&nbsp;
        <div className="row pt-4">
          <div className="col-5">
            
            
          </div>

          <div className="col-5 ">
            <NavLink className="nav-link" aria-current="page" to="/">
              <button className="btn btn-secondary form-control">
                Nazad
                </button>
            </NavLink>
          </div>
        </div>
      </div>
      <div className="col-5">
        <img
          src={data.result.image}
          width="100%"
          style={{ borderRadius: "30%" }}
          alt="No content"
        ></img>
      </div>
        </div>) :
        (
          <div className = 'd-flex justify-content-center' style={{width: "100%"}}> 
            <MainLoader />
          </div>
        )}
  </div>
  )
}

export default SportskiObjekatDetails
