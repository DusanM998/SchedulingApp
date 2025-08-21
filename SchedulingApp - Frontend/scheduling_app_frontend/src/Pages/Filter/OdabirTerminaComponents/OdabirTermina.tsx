import { FaCheckCircle } from "react-icons/fa";
import { stavkaKorpeModel, terminModel } from "../../../Interfaces";
import sportskiObjekatModel from "../../../Interfaces/sportskiObjekatModel";
import { MainLoader } from "../../../Components/Page/Common";

interface OdabirTerminaProps {
  selectedObjekat: sportskiObjekatModel;
  termini: terminModel[] | undefined;
  loadingTermini: boolean;
  error: any;
  selectedTermini: number[];
  stavkaKorpe: stavkaKorpeModel | undefined;
  onTerminSelection: (sportskiObjekatId: number, termin: terminModel) => void;
  onConfirmSelection: (
    sportskiObjekatId: number,
    stavkaKorpe: stavkaKorpeModel
  ) => void;
  onOtkaziTermine: () => void;
  onKontaktPodaci: () => void;
}

export default function OdabirTermina({
  selectedObjekat,
  termini,
  loadingTermini,
  error,
  selectedTermini,
  stavkaKorpe,
  onTerminSelection,
  onConfirmSelection,
  onOtkaziTermine,
  onKontaktPodaci,
}: OdabirTerminaProps) {
  return (
    <div className="p-4 mt-3 border rounded shadow slide-in-bottom">
      <h4>Termini za izabrani objekat</h4>
      {loadingTermini && <MainLoader />}
      {error && <p>Greška pri učitavanju termina!</p>}
      {termini?.length === 0 && <p>Nema dostupnih termina.</p>}

      {termini && termini.length > 0 && (
        <div>
          {termini.map((termin: terminModel) => {
            const isSelected = selectedTermini.includes(termin.terminId);
            const isRezervisan = termin.status === "Rezervisan";
            const isZauzet = termin.status === "Zauzet";
            const isIstekao = termin.status === "Istekao";

            let borderClass = "border";
            if (isRezervisan) borderClass += " border-primary";
            else if (isZauzet) borderClass += " border-danger";
            else if (isIstekao) borderClass += " border-secondary";
            else if (isSelected) borderClass += " border-success";

            const isDisabled = isRezervisan || isZauzet || isIstekao;

            return (
              <div
                key={termin.terminId}
                className={`d-flex justify-content-between align-items-center
                    p-2 mb-2 rounded shadow-sm ${borderClass}`}
                onClick={() => {
                  if (!isDisabled)
                    onTerminSelection(
                      selectedObjekat.sportskiObjekatId,
                      termin
                    );
                }}
                style={{
                  cursor: isDisabled ? "not-allowed" : "pointer",
                  opacity: isDisabled ? 0.6 : 1,
                  pointerEvents: isDisabled ? "none" : "auto",
                  backgroundColor: isIstekao ? "#f8f9fa" : "white",
                  fontSize: "0.9rem",
                }}
              >
                <div>
                  <strong>
                    {termin.datumTermina
                      ? new Date(termin.datumTermina).toLocaleDateString(
                          "sr-RS"
                        )
                      : "Nepoznat datum"}
                  </strong>{" "}
                  | {termin.vremePocetka} - {termin.vremeZavrsetka}
                </div>
                <div>
                  {isIstekao
                    ? "Istekao"
                    : isRezervisan
                    ? "Rezervisan"
                    : isZauzet
                    ? "Zauzet"
                    : "Slobodan"}
                  {isSelected && (
                    <FaCheckCircle className="text-success ms-2" />
                  )}
                </div>
              </div>
            );
          })}

          {stavkaKorpe && (
            <div className="d-flex justify-content-center align-items-center w-100 my-3">
              <button
                className="btn mx-2"
                style={{
                  backgroundColor: "#26a172",
                  color: "white",
                }}
                onClick={() =>
                  onConfirmSelection(
                    selectedObjekat.sportskiObjekatId,
                    stavkaKorpe
                  )
                }
              >
                Potvrdi Odabir
              </button>
            </div>
          )}

          <hr />
          <div className="d-flex justify-content-end align-items-center">
            <button
              className="btn btn-outline-secondary mx-2"
              onClick={onOtkaziTermine}
            >
              Otkaži
            </button>
            <button
              className="btn mx-2"
              style={{ backgroundColor: "#26a172", color: "white" }}
              onClick={onKontaktPodaci}
            >
              Nastavi
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
