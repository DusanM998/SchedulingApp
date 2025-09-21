import React from "react";
import { useTranslation } from "react-i18next";
import { stavkaKorpeModel, terminModel } from "../../Interfaces";
import ParticipantCounter from "./ParticipantCounter";
import ReservationCalendar from "./RezervacijaCalendar";

interface CartItemProps {
  stavkaKorpe: stavkaKorpeModel;
  index: number;
  expandedCard: number | null;
  selectedTermini: Record<number, terminModel[]>;
  termini: terminModel[] | undefined;
  isLoading: boolean;
  isError: boolean;
  isAdmin: boolean;
  onParticipantChange: (
    delta: number,
    stavkaKorpe: stavkaKorpeModel,
    ukloni?: boolean
  ) => void;
  onRemove: (stavkaKorpe: stavkaKorpeModel) => void;
  onExpand: (sportskiObjekatId: number) => void;
  onTerminSelect: (sportskiObjekatId: number, termin: terminModel) => void;
  onConfirm: (sportskiObjekatId: number, stavkaKorpe: stavkaKorpeModel) => void;
  racunajCenuZaObjekat: (
    stavkaKorpe: stavkaKorpeModel,
    termini?: terminModel[]
  ) => number;
}

const CartItem: React.FC<CartItemProps> = ({
  stavkaKorpe,
  index,
  expandedCard,
  selectedTermini,
  termini,
  isLoading,
  isError,
  isAdmin,
  onParticipantChange,
  onRemove,
  onExpand,
  onTerminSelect,
  onConfirm,
  racunajCenuZaObjekat,
}) => {
  const { t } = useTranslation();
  const sportskiObjekatId = stavkaKorpe.sportskiObjekat?.sportskiObjekatId;
  if (!sportskiObjekatId) return null;

  const totalPrice =
    stavkaKorpe.cenaZaObjekat !== undefined
      ? stavkaKorpe.cenaZaObjekat.toFixed(2)
      : stavkaKorpe.sportskiObjekat?.cenaPoSatu?.toFixed(2) ?? "0";

  return (
    <div
      key={index}
      className={`d-flex flex-sm-column align-items-center custom-card-shadow rounded m-3 p-3 ${
        expandedCard === sportskiObjekatId ? "expanded-card" : ""
      }`}
      style={{ background: "ghostwhite" }}
    >
      <div className="d-flex flex-sm-row flex-column align-items-center">
        <div className="p-3">
          <img
            src={stavkaKorpe.sportskiObjekat?.image}
            alt=""
            width="120px"
            className="rounded-circle"
          />
        </div>
        <div className="p-2 mx-3" style={{ width: "100%" }}>
          <div className="d-flex justify-content-between align-items-center">
            <h4 style={{ fontWeight: 300, marginRight: "5px" }}>
              {stavkaKorpe.sportskiObjekat?.naziv}
            </h4>
            <h4 style={{ marginLeft: "8px" }}>
              {t("rezervacijaSummary.totalPrice")}: {totalPrice} RSD
            </h4>
          </div>
          <div className="flex-fill">
            <h4 className="text-danger">
              {t("rezervacijaSummary.pricePerHour")}:{" "}
              {stavkaKorpe.sportskiObjekat?.cenaPoSatu} RSD
            </h4>
            <h5>
              {t("rezervacijaSummary.capacity")}:{" "}
              {stavkaKorpe.sportskiObjekat?.kapacitet}
            </h5>
          </div>
          <div className="d-flex align-items-center justify-content-between mt-2">
            <ParticipantCounter
              stavkaKorpe={stavkaKorpe}
              onChange={(delta) => onParticipantChange(delta, stavkaKorpe)}
            />
            <button
              className="btn btn-danger mx-1"
              onClick={() => onRemove(stavkaKorpe)}
            >
              {t("rezervacijaSummary.remove")}
            </button>
          </div>
          <div className="d-flex align-items-center justify-content-center mt-2">
            <button
              className="btn"
              style={{ backgroundColor: "#51285f", color: "white" }}
              onClick={() => onExpand(sportskiObjekatId)}
            >
              {expandedCard === sportskiObjekatId
                ? t("rezervacijaSummary.hideTermin")
                : t("rezervacijaSummary.chooseTermin")}
            </button>
          </div>
        </div>
      </div>
      {expandedCard === sportskiObjekatId && (
        <div className="termini-container mt-3 text-center">
          <h5>{t("rezervacijaSummary.chooseTermin")}</h5>
          <ReservationCalendar
            termini={termini ?? []}
            isAdmin={isAdmin}
            selectedTermini={selectedTermini[sportskiObjekatId] ?? []}
            isLoading={isLoading}
            isError={isError}
            stavkaKorpe={stavkaKorpe}
            onTerminSelect={(termin) => onTerminSelect(sportskiObjekatId, termin)}
            onConfirm={() => onConfirm(sportskiObjekatId, stavkaKorpe)}
          />
        </div>
      )}
    </div>
  );
};

export default React.memo(CartItem);