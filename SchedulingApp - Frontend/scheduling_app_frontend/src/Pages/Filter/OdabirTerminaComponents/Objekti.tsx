import { FaCheckCircle, FaShoppingCart } from "react-icons/fa";
import { stavkaKorpeModel } from "../../../Interfaces";
import sportskiObjekatModel from "../../../Interfaces/sportskiObjekatModel";

interface ObjektiProps {
  objekti: sportskiObjekatModel[];
  selectedObjekatId: number | null;
  selectedObjekat: sportskiObjekatModel | undefined;
  shoppingCartStore: stavkaKorpeModel[];
  onSelect: (id: number) => void;
  onAddToCart: (id: number) => void;
  onOtkaziTeren: () => void;
  onNastavi: (sportskiObjekatId: number) => void;
  onBrojUcesnika: (brojUcesnika: number, stavkaKorpe: stavkaKorpeModel) => void;
}

export default function Objekti({
  objekti,
  selectedObjekatId,
  selectedObjekat,
  shoppingCartStore,
  onSelect,
  onAddToCart,
  onOtkaziTeren,
  onNastavi,
  onBrojUcesnika,
}: ObjektiProps) {
  return (
    <>
      <h4 className="fw-bold">Odaberi teren</h4>
      <div className="row mx-1">
        {objekti?.map((objekat: sportskiObjekatModel) => (
          <div
            key={objekat.sportskiObjekatId}
            className={`col-md-5 mb-4 mx-3 p-3 rounded border objekat-card ${
              selectedObjekatId === objekat.sportskiObjekatId ? "selected" : ""
            }`}
            onClick={() => onSelect(objekat.sportskiObjekatId)}
          >
            <div className="d-flex align-items-center justify-content-between">
              <div className="d-flex align-items-center">
                <img
                  src={objekat.image}
                  alt={objekat.naziv}
                  className="rounded-circle me-3 objekat-image"
                />
                <span>{objekat.naziv}</span>
              </div>
              {selectedObjekatId === objekat.sportskiObjekatId && (
                <FaCheckCircle className="text-success fs-4" />
              )}
            </div>
            {selectedObjekatId === objekat.sportskiObjekatId && (
              <div className="fade-in d-flex justify-content-center mt-3">
                <button
                  className="btn custom-cart-objekat-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    onAddToCart(objekat.sportskiObjekatId);
                  }}
                >
                  <FaShoppingCart size={24} />
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {selectedObjekat && (
        <div className="p-4 mt-3 border rounded shadow slide-in-bottom">
          <h5>{selectedObjekat.naziv}</h5>
          <p>
            <strong>Lokacija:</strong> {selectedObjekat.lokacija}
          </p>
          <p>
            <strong>Vrsta sporta:</strong> {selectedObjekat.vrstaSporta}
          </p>
          <p>
            <strong>Radno vreme:</strong> {selectedObjekat.radnoVreme}
          </p>
          <p>
            <strong>Cena po satu:</strong> {selectedObjekat.cenaPoSatu} RSD
          </p>
          <p>
            <strong>Kapacitet:</strong> {selectedObjekat.kapacitet}
          </p>
          <p>{selectedObjekat.opis}</p>

          {shoppingCartStore.length > 0 &&
            shoppingCartStore
              .filter(
                (stavkaKorpe: stavkaKorpeModel) =>
                  stavkaKorpe.sportskiObjekatId === selectedObjekatId
              )
              .map((stavkaKorpe: stavkaKorpeModel, index: number) => (
                <div key={index}>
                  <span className="me-2">
                    <p>Broj učesnika: </p>
                  </span>
                  <span style={{ color: "rgba(22,22,22,.7)" }} role="button">
                    <i
                      className="bi bi-dash-circle-fill"
                      onClick={() => onBrojUcesnika(-1, stavkaKorpe)}
                    />
                  </span>
                  <span className="m-1">
                    <b>{stavkaKorpe.kolicina}</b>
                  </span>
                  <span style={{ color: "rgba(22,22,22,.7)" }} role="button">
                    <i
                      className="bi bi-plus-circle-fill"
                      onClick={() => onBrojUcesnika(1, stavkaKorpe)}
                    />
                  </span>
                </div>
              ))}

          <hr />
          <div className="d-flex justify-content-end align-items-center">
            <button
              className="btn btn-outline-secondary mx-2"
              onClick={onOtkaziTeren}
            >
              Otkaži
            </button>
            <button
              className="btn mx-2"
              style={{ backgroundColor: "#26a172", color: "white" }}
              onClick={() => onNastavi(selectedObjekat.sportskiObjekatId)}
            >
              Nastavi na odabir termina
            </button>
          </div>
        </div>
      )}
    </>
  );
}
