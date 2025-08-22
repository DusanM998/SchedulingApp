import React from "react";
import {
  useDeleteSportskiObjekatMutation,
  useGetSportskiObjektiQuery,
} from "../../apis/sportskiObjekatApi";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { MainLoader } from "../../Components/Page/Common";
import sportskiObjekatModel from "../../Interfaces/sportskiObjekatModel";

function SportskiObjektiTabela() {
  const { data, isLoading } = useGetSportskiObjektiQuery(null);
  const navigate = useNavigate();
  const [deleteSportskiObjekat] = useDeleteSportskiObjekatMutation();

  const handleSportskiObjekatDelete = async (id: number) => {
    toast.promise(deleteSportskiObjekat(id), {
      pending: "Vaš zahtev se obrađuje...",
      success: "Sportski objekat obrisan uspešno",
      error: "Došlo je do greške!",
    });
  };

  return (
    <>
      {isLoading && <MainLoader />}
      {!isLoading && (
        <div className="container-fluid px-5 mt-4">
          {/* Header + Dugme */}
          <div className="d-flex align-items-center justify-content-between mb-3 flex-wrap">
            <h2 style={{ color: "#51285f" }}>Sportski Objekti</h2>
            <button
              className="btn"
              style={{ backgroundColor: "#51285f", color: "white" }}
              onClick={() =>
                navigate("/sportskiObjekat/sportskiObjekatKreirajAzuriraj")
              }
            >
              <i className="bi bi-plus-circle me-2"></i> Kreiraj Objekat
            </button>
          </div>

          {/* Tabela */}
          <div className="table-responsive">
            <table className="table table-striped table-hover table-bordered align-middle text-center">
              <thead className="table-dark">
                <tr>
                  <th>Slika</th>
                  <th>ID</th>
                  <th>Naziv</th>
                  <th>Lokacija</th>
                  <th>Vrsta Sporta</th>
                  <th>Radno Vreme</th>
                  <th>Cena (RSD/h)</th>
                  <th>Kapacitet</th>
                  <th>Akcije</th>
                </tr>
              </thead>
              <tbody>
                {data && data.length > 0 ? (
                  data.map((sportskiObjekat: sportskiObjekatModel) => (
                    <tr key={sportskiObjekat.sportskiObjekatId}>
                      <td>
                        <img
                          src={sportskiObjekat.image}
                          alt={sportskiObjekat.naziv}
                          style={{
                            width: "100%",
                            maxWidth: "120px",
                            height: "auto",
                          }}
                          className="rounded"
                        />
                      </td>
                      <td>{sportskiObjekat.sportskiObjekatId}</td>
                      <td>{sportskiObjekat.naziv}</td>
                      <td>{sportskiObjekat.lokacija}</td>
                      <td>{sportskiObjekat.vrstaSporta}</td>
                      <td>{sportskiObjekat.radnoVreme}</td>
                      <td>{sportskiObjekat.cenaPoSatu}</td>
                      <td>{sportskiObjekat.kapacitet}</td>
                      <td>
                        <div className="d-flex justify-content-center">
                          <button
                            className="btn btn-sm me-2"
                            style={{
                              backgroundColor: "#51285f",
                              color: "white",
                            }}
                            onClick={() =>
                              navigate(
                                "/sportskiObjekat/sportskiObjekatKreirajAzuriraj/" +
                                  sportskiObjekat.sportskiObjekatId
                              )
                            }
                          >
                            <i className="bi bi-pencil-fill"></i>
                          </button>
                          <button
                            className="btn btn-sm btn-danger"
                            onClick={() =>
                              handleSportskiObjekatDelete(
                                sportskiObjekat.sportskiObjekatId
                              )
                            }
                          >
                            <i className="bi bi-trash-fill"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={9}>Nema podataka</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </>
  );
}

export default SportskiObjektiTabela;
