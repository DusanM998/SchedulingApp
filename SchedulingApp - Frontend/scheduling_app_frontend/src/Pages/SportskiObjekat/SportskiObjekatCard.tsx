import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import sportskiObjekatModel from "../../Interfaces/sportskiObjekatModel";
import { useSelector } from "react-redux";
import { RootState } from "../../Storage/Redux/store";
import { apiResponse, userModel } from "../../Interfaces";
import { useUpdateShoppingCartMutation } from "../../apis/shoppingCartApi";
import { toastNotify } from "../../Helper";
import { MiniLoader } from "../../Components/Page/Common";
import "../../index.css";

interface Props {
  sportskiObjekat: sportskiObjekatModel;
}

function SportskiObjekatCard({ sportskiObjekat }: Props) {
  const navigate = useNavigate();
  const userData: userModel = useSelector(
    (state: RootState) => state.userAuthStore
  );
  const [isAddingToCart, setIsAddingToCart] = useState<boolean>(false);
  const [updateKorpa] = useUpdateShoppingCartMutation();

  const handleAddToCart = async (sportskiObjekatId: number) => {
    if (!userData.id) {
      navigate("/login");
      return;
    }

    setIsAddingToCart(true);

    const response: apiResponse = await updateKorpa({
      sportskiObjekatId: sportskiObjekatId,
      brojUcesnika: 1,
      userId: userData.id,
    });

    if (response.data && response.data.isSuccess) {
      toastNotify("Odabrali ste sportski objekat: " + sportskiObjekat.naziv);
    }

    setIsAddingToCart(false);
  };

  const openGoogleMaps = (lokacija: string) => {
    const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
      lokacija
    )}`;
    window.open(googleMapsUrl, "_blank");
  };

  const getSportIcon = (vrsta: string) => {
    switch (vrsta) {
      case "Fudbal":
        return "⚽";
      case "Košarka":
        return "🏀";
      case "Tenis":
        return "🎾";
      case "Padel":
        return "🎾"
      case "Odbojka":
        return "🏐";
      case "Rukomet":
        return "🤾";
      case "Plivanje":
        return "🏊"
      default:
        return "🏆"; // fallback ikonica
    }
  };

  return (
    <div className="card h-100 border-0 shadow-sm sport-card">
      <Link to={`/sportskiObjekatDetails/${sportskiObjekat.sportskiObjekatId}`}>
        <img
          src={sportskiObjekat.image}
          alt={sportskiObjekat.naziv}
          className="card-img-top sport-card-img"
        />
      </Link>
      <div className="card-body text-center">
        <h5 className="card-title fw-bold mb-1" style={{ color: "#51285f" }}>
          {sportskiObjekat.naziv}
        </h5>
        <p className="text-muted small mb-1">
          <span className="me-1">
            {getSportIcon(sportskiObjekat.vrstaSporta)}
          </span>
          {sportskiObjekat.vrstaSporta}
        </p>
        <p className="text-dark fw-semibold mb-2">
          {sportskiObjekat.cenaPoSatu} RSD/h
        </p>
        <p
          className="badge bg-secondary w-100 text-wrap"
          style={{ cursor: "pointer" }}
          onClick={() => openGoogleMaps(sportskiObjekat.lokacija)}
        >
          <i className="bi bi-geo-alt-fill me-1"></i>
          {sportskiObjekat.lokacija}
        </p>

        {isAddingToCart ? (
          <MiniLoader />
        ) : (
          <button
            className="btn btn-primary w-100 mt-2"
            style={{ backgroundColor: "#51285f", border: "none" }}
            onClick={() => handleAddToCart(sportskiObjekat.sportskiObjekatId)}
          >
            Izaberi objekat
          </button>
        )}
      </div>
    </div>
  );
}

export default SportskiObjekatCard;
