import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import sportskiObjekatModel from '../../Interfaces/sportskiObjekatModel';
import { useSelector } from 'react-redux';
import { RootState } from '../../Storage/Redux/store';
import { apiResponse, userModel } from '../../Interfaces';
import { useUpdateShoppingCartMutation } from '../../apis/shoppingCartApi';
import { toastNotify } from '../../Helper';

interface Props {
  sportskiObjekat: sportskiObjekatModel;
}

function SportskiObjekatCard(props: Props) {

  const navigate = useNavigate();
  const userData: userModel = useSelector((state: RootState) => state.userAuthStore);
  const [isAddingToCart, setIsAddingToCart] = useState<boolean>(false);
  const updateKorpa = useUpdateShoppingCartMutation();

  const handleAddToCart = async (sportskiObjekatId: number) => {
    if (!userData.id) {
      navigate("/login");
      return;
    }

    setIsAddingToCart(true);

    const response: apiResponse = await updateKorpa({
      sportskiObjekatId: sportskiObjekatId,
      kolicina: 1,
      userId: userData.id
    });

    if (response.data && response.data.isSuccess) {
      toastNotify("Odabrali ste sportski objekat: " + props.sportskiObjekat.naziv)
    }

    setIsAddingToCart(true);
  }

  return (
    <div className='col-md-12 p-4'>
      <div
        className="card"
        style={{ boxShadow: "0 1px 7px 0 rgb(0 0 0 / 30%)" }}
      >
        <div className='card-body pt-2'>
          <div className='row col-10 offset-1 p-1'>
            <Link to={`/sportskiObjekatDetails/${props.sportskiObjekat.sportskiObjekatId}`}>
              <img
                src={props.sportskiObjekat.image}
                style={{ borderRadius: "30%" }}
                alt=''
                className='w-100 mt-2 image-box'
              />
            </Link>
          </div>

          <div className='text-center'>
            <p className='card-title m-0' style={{ color: "#4da172" }}>
              <Link to={`/sportskiObjekatDetails/${props.sportskiObjekat.sportskiObjekatId}`}
                  style={{ textDecoration:"none", color:"#4da172" }}
                >
                {props.sportskiObjekat.naziv}
              </Link>
            </p>
            <hr />
            <p className='badge bg-secondary' >
              <i className="bi bi-geo-alt-fill">&nbsp;</i>
              {props.sportskiObjekat.lokacija}
            </p>
            <div className="d-flex justify-content-center mt-3">
              <button className="btn w-75" style={{ backgroundColor: "#51285f", color:"white" }}>Izaberi objekat</button>
          </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SportskiObjekatCard
