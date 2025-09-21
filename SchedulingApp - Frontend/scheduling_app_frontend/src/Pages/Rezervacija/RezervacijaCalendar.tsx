import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import { terminModel, stavkaKorpeModel } from "../../Interfaces";

interface ReservationCalendarProps {
  termini: terminModel[];
  isAdmin: boolean;
  selectedTermini: terminModel[];
  isLoading: boolean;
  isError: boolean;
  stavkaKorpe: stavkaKorpeModel;
  onTerminSelect: (termin: terminModel) => void;
  onConfirm: () => void;
}

function isTerminExpired(termin: terminModel): boolean {
  if (!termin.datumTermina || !termin.vremeZavrsetka) return false;

  const [hours, minutes] = termin.vremeZavrsetka.split(":").map(Number);
  const datum = new Date(termin.datumTermina);
  const datumZavrsetka = new Date(
    datum.getFullYear(),
    datum.getMonth(),
    datum.getDate(),
    hours,
    minutes,
    0,
    0
  );

  const sada = new Date();
  return sada > datumZavrsetka;
}

const ReservationCalendar: React.FC<ReservationCalendarProps> = ({
  termini,
  isAdmin,
  selectedTermini,
  isLoading,
  isError,
  stavkaKorpe,
  onTerminSelect,
  onConfirm,
}) => {
  const { t } = useTranslation();

  const calendarEvents = useMemo(
    () =>
      termini
        .filter((termin) =>
          isAdmin
            ? true
            : (termin.status === "Slobodan" || termin.status === "Rezervisan") &&
              !isTerminExpired(termin)
        )
        .map((termin) => {
          const isExpired = isTerminExpired(termin);
          const isSelected = selectedTermini.some(
            (t) => t.terminId === termin.terminId
          );

          let backgroundColor = "#28a745"; // Slobodan = zeleno
          let isClickable = true;

          if (termin.status === "Zauzet") {
            backgroundColor = "#dc3545";
            isClickable = false;
          } else if (isExpired) {
            backgroundColor = "#ffc107";
            isClickable = false;
          } else if (termin.status === "Rezervisan") {
            backgroundColor = "#007bff";
            isClickable = false;
          }

          return {
            id: termin.terminId.toString(),
            title: "",
            start: termin.datumTermina,
            backgroundColor,
            borderColor: backgroundColor,
            extendedProps: {
              termin,
              isClickable,
              isSelected,
            },
          };
        }),
    [termini, isAdmin, selectedTermini]
  );

  if (isLoading) {
    return <p>{t("rezervacijaSummary.loading")}</p>;
  }

  if (isError) {
    return <p>{t("rezervacijaSummary.error")}</p>;
  }

  if (!termini || termini.length === 0) {
    return <p>{t("rezervacijaSummary.noTermin")}</p>;
  }

  return (
    <div
      className="calendar-wrapper"
      style={{
        padding: "20px",
        backgroundColor: "#f8f9fa",
        borderRadius: "8px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
      }}
    >
      <FullCalendar
        plugins={[dayGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        height="650px"
        contentHeight="auto"
        aspectRatio={1.7}
        events={calendarEvents}
        eventClassNames={(arg) => {
          const { isClickable, isSelected } = arg.event.extendedProps;
          return [
            isClickable ? "" : "fc-event-unclickable",
            isSelected ? "fc-event-selected" : "",
          ];
        }}
        eventContent={(arg) => {
          const { termin, isClickable } = arg.event.extendedProps;
          return (
            <div>
              <button
                style={{
                  backgroundColor: arg.event.backgroundColor,
                  border: "none",
                  borderRadius: "6px",
                  color: "#fff",
                  padding: "6px 12px",
                  cursor: isClickable ? "pointer" : "not-allowed",
                  width: "100%",
                }}
                aria-disabled={!isClickable}
                title={`${termin.vremePocetka} - ${termin.vremeZavrsetka}`}
              ></button>
              <div className="event-dropdown">
                <strong>{t("rezervacijaSummary.details")}</strong>
                <br />
                {termin.vremePocetka} - {termin.vremeZavrsetka}
                <br />
                Status: {termin.status}
              </div>
            </div>
          );
        }}
        eventClick={(info) => {
          const { termin, isClickable } = info.event.extendedProps;
          if (!isClickable) return;
          onTerminSelect(termin);
        }}
        locale="en"
        firstDay={1}
        headerToolbar={{
          left: "prev,next",
          center: "title",
          right: "",
        }}
        dayMaxEvents={4}
        moreLinkText="more"
        eventDisplay="block"
      />
      <button
        className="btn btn-success mt-3"
        style={{ padding: "8px 20px", fontSize: "1em" }}
        onClick={onConfirm}
      >
        {t("rezervacijaSummary.confirm")}
      </button>
    </div>
  );
};

export default React.memo(ReservationCalendar);