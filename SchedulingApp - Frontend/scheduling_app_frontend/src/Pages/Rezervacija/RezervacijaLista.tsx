import React from "react";
import RezervacijaListaProps from "../../Interfaces/rezervacijaLista";
import { useNavigate } from "react-router-dom";
import { MainLoader } from "../../Components/Page/Common";
import rezervacijaHeaderModel from "../../Interfaces/rezervacijaHeaderModel";
import getStatusColor from "../../Helper/getStatusColor";

function RezervacijaLista({
  isLoading,
  rezervacijaData,
}: RezervacijaListaProps) {
  const navigate = useNavigate();

  return (
    <>
      {isLoading && <MainLoader />}
      {!isLoading && (
        <div className="table-responsive px-5 mt-4">
          <table className="table table-striped table-hover table-bordered align-middle text-center">
            <thead className="table-dark">
              <tr>
                <th>ID</th>
                <th>Ime</th>
                <th>Broj Telefona</th>
                <th>Ukupna Cena</th>
                <th>Ukupno Rezervacija</th>
                <th>Datum Kreiranja</th>
                <th>Status</th>
                <th>Detalji</th>
              </tr>
            </thead>
            <tbody>
              {rezervacijaData && rezervacijaData.length > 0 ? (
                rezervacijaData.map((rezervacija: rezervacijaHeaderModel) => {
                  const badgeColor = getStatusColor(rezervacija.status!);
                  return (
                    <tr key={rezervacija.rezervacijaHeaderId}>
                      <td>{rezervacija.rezervacijaHeaderId}</td>
                      <td>{rezervacija.imeKorisnika}</td>
                      <td>{rezervacija.brojKorisnika}</td>
                      <td>{rezervacija.ukupnoCena?.toFixed(2)} RSD</td>
                      <td>{rezervacija.ukupnoRezervacija}</td>
                      <td>
                        {new Date(
                          rezervacija.datumRezervacije!
                        ).toLocaleDateString("sr-RS")}
                      </td>
                      <td>
                        <span className={`badge bg-${badgeColor}`}>
                          {rezervacija.status}
                        </span>
                      </td>
                      <td>
                        <button
                          className="btn btn-sm"
                          style={{ backgroundColor: "#51285f", color: "white" }}
                          onClick={() =>
                            navigate(
                              "/rezervacija/rezervacijaDetaljiPage/" +
                                rezervacija.rezervacijaHeaderId
                            )
                          }
                        >
                          Detalji
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={8}>Nema podataka</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}

export default RezervacijaLista;
