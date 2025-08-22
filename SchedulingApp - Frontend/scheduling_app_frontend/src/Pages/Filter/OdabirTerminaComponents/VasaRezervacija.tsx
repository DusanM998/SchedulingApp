import React from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../../Storage/Redux/store";
import { Placanje } from "../../Placanje";

export default function VasaRezervacija() {
  const { apiResult, userInput } = useSelector(
    (state: RootState) => state.rezervacijaStore
  );

  return (
    <div className="p-4 border rounded shadow slide-in-bottom">
      <h4 style={{ color: "#51285f" }}>Vaša rezervacija</h4>
      <p className="fw-semibold">Rezime rezervacije i plaćanje:</p>

      <div className="mt-4">
        {apiResult && userInput ? (
          <Placanje />
        ) : (
          <div className="text-center p-5">
            <h5 style={{ color: "#51285f" }}>Nema podataka o rezervaciji</h5>
            <p>Molimo vas da izaberete termine pre nego što nastavite.</p>
          </div>
        )}
      </div>
    </div>
  );
}
