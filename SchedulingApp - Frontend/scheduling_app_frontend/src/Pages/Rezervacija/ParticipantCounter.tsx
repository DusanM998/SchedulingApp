import React from "react";
import { useTranslation } from "react-i18next";
import { stavkaKorpeModel } from "../../Interfaces";

interface ParticipantCounterProps {
  stavkaKorpe: stavkaKorpeModel;
  onChange: (delta: number) => void;
}

const ParticipantCounter: React.FC<ParticipantCounterProps> = ({
  stavkaKorpe,
  onChange,
}) => {
  const { t } = useTranslation();

  return (
    <div
      className="d-flex align-items-center p-2 mt-2 rounded-pill custom-card-shadow"
      style={{ width: "100px", height: "45px" }}
    >
      <span className="me-2">
        <p>{t("rezervacijaSummary.participants")}</p>
      </span>
      <span style={{ color: "rgba(22,22,22,.7)" }} role="button">
        <i className="bi bi-dash-circle-fill" onClick={() => onChange(-1)} />
      </span>
      <span className="m-1">
        <b>{stavkaKorpe.kolicina}</b>
      </span>
      <span style={{ color: "rgba(22,22,22,.7)" }} role="button">
        <i className="bi bi-plus-circle-fill" onClick={() => onChange(1)} />
      </span>
    </div>
  );
};

export default React.memo(ParticipantCounter);