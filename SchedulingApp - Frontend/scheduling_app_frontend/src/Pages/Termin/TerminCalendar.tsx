import React, { useMemo } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import terminModel from "../../Interfaces/terminModel";
import { EventInput } from "@fullcalendar/core";

interface Props {
  termini: terminModel[];
  onTerminClick?: (termin: terminModel) => void;
}

const TerminiCalendar: React.FC<Props> = ({ termini, onTerminClick }) => {
  // konverzija terminModel -> EventInput[]
  const events: EventInput[] = useMemo(
    () =>
      termini.map((termin) => {
        let color = "#28a745";
        let statusText = "Slobodan";

        if (termin.status === "Zauzet") {
          color = "#dc3545";
          statusText = "Zauzet";
        } else if (termin.status === "Rezervisan") {
          color = "#007bff";
          statusText = "Rezervisan";
        }

        return {
          id: termin.terminId.toString(), // FullCalendar očekuje string
          title: `${termin.vremePocetka} - ${termin.vremeZavrsetka} (${statusText})`,
          start: `${termin.datumTermina}T${termin.vremePocetka}`,
          end: `${termin.datumTermina}T${termin.vremeZavrsetka}`,
          backgroundColor: color,
          borderColor: color,
          editable: false,
          extendedProps: { termin }, // tu ostaje ceo model
        };
      }),
    [termini]
  );

  return (
    <FullCalendar
      plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
      initialView="dayGridMonth"
      headerToolbar={{
        left: "prev,next today",
        center: "title",
        right: "dayGridMonth,timeGridWeek,timeGridDay",
      }}
      events={events}
      eventClick={(info) => {
        const termin = (info.event.extendedProps as { termin: terminModel })
          .termin;
        if (onTerminClick) {
          onTerminClick(termin);
        }
      }}
    />
  );
};

export default TerminiCalendar;
