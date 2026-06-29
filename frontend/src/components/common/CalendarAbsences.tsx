import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import frLocale from "@fullcalendar/core/locales/fr";

export interface LeaveEvent {
  id: string;
  title: string;
  start: string; // ISO date
  end: string;   // ISO date (exclusive in FullCalendar)
  color?: string;
  status?: "pending" | "approved" | "refused";
  type?: "leave" | "absence";
}

interface Props {
  events: LeaveEvent[];
  height?: number | string;
}

/**
 * Absence calendar fed by leaves + absence records.
 * Color-coded by status: approved (green), pending (amber), refused (red).
 */
export function CalendarAbsences({ events, height = 600 }: Props) {
  const colored = events.map((e) => ({
    ...e,
    color:
      e.color ||
      (e.status === "approved" ? "#16a34a" : e.status === "refused" ? "#dc2626" : "#d97706"),
  }));
  return (
    <FullCalendar
      plugins={[dayGridPlugin]}
      locale={frLocale}
      initialView="dayGridMonth"
      events={colored}
      height={height}
      firstDay={1}
      headerToolbar={{
        left: "prev,next today",
        center: "title",
        right: "dayGridMonth,dayGridWeek",
      }}
    />
  );
}