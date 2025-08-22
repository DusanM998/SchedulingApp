import React from "react";
import { useDeleteTerminMutation, useGetTerminiQuery } from "../../apis/terminApi";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { MainLoader } from "../../Components/Page/Common";
import { terminModel } from "../../Interfaces";
import { FaEdit, FaTrash } from "react-icons/fa";

function TerminiList() {
  const { data, isLoading } = useGetTerminiQuery(null);
  const navigate = useNavigate();
  const [deleteTermin] = useDeleteTerminMutation();

  const handleTerminDelete = async (terminId: number) => {
    toast.promise(deleteTermin(terminId), {
      pending: "Vaš zahtev se obrađuje...",
      success: "Termin obrisan uspešno",
      error: "Došlo je do greške!",
    });
  };

  return (
    <>
      {isLoading && <MainLoader />}
      {!isLoading && (
        <div className="container-fluid px-5 mt-4">
          {/* Header i Dugme */}
          <div className="d-flex align-items-center justify-content-between mb-3 flex-wrap">
            <h2 style={{ color: "#51285f" }}>
              <i className="fa fa-calendar-alt me-2"></i> Termini
            </h2>
            <button
              className="btn"
              style={{ backgroundColor: "#51285f", color: "white" }}
              onClick={() => navigate("/termin/terminKreirajAzuriraj")}
            >
              <i className="bi bi-plus-circle me-2"></i> Kreiraj Termin
            </button>
          </div>

          {/* Tabela */}
          <div className="table-responsive">
            <table className="table table-striped table-hover table-bordered align-middle text-center">
              <thead className="table-dark">
                <tr>
                  <th>ID</th>
                  <th>Sportski Objekat ID</th>
                  <th>Datum</th>
                  <th>Vreme Početka</th>
                  <th>Vreme Završetka</th>
                  <th>Status</th>
                  <th>Akcije</th>
                </tr>
              </thead>
              <tbody>
                {data && data.length > 0 ? (
                  data.map((termin: terminModel) => (
                    <tr key={termin.terminId}>
                      <td>{termin.terminId}</td>
                      <td>{termin.sportskiObjekatId}</td>
                      <td>
                        {termin.datumTermina
                          ? new Date(termin.datumTermina).toLocaleDateString()
                          : "Nepoznat datum"}
                      </td>
                      <td>{termin.vremePocetka}</td>
                      <td>{termin.vremeZavrsetka}</td>
                      <td>{termin.status}</td>
                      <td>
                        <div className="d-flex justify-content-center">
                          <button
                            className="btn btn-sm me-2"
                            style={{ backgroundColor: "#51285f", color: "white" }}
                            onClick={() =>
                              navigate("/termin/terminKreirajAzuriraj/" + termin.terminId)
                            }
                          >
                            <FaEdit />
                          </button>
                          <button
                            className="btn btn-sm btn-danger"
                            onClick={() => handleTerminDelete(termin.terminId)}
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7}>Nema termina</td>
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

export default TerminiList;
