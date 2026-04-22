import type { Ticket } from "../types/Booking";

/**
 * Returns the effective display status for a ticket.
 *
 * If the journey's departure date+time is in the past, we show "EXPIRED"
 * regardless of what the backend status says. This is a frontend-only display
 * concern — the backend never sends "EXPIRED" for this reason.
 *
 * Examples:
 *   - CONFIRMED ticket whose train departed yesterday → "EXPIRED"
 *   - WAITLISTED ticket for a train that left 2 hours ago → "EXPIRED"
 *   - CONFIRMED ticket for tomorrow → "CONFIRMED"
 *   - SEAT_HELD ticket for today's train (hold not expired) → "SEAT_HELD"
 */
export function getDisplayStatus(ticket: Ticket): Ticket["status"] {
  // Parse "YYYY-MM-DD" + "HH:MM" into a comparable Date object.
  const departureDateTime = new Date(`${ticket.date}T${ticket.departure}:00`);

  if (departureDateTime < new Date()) {
    return "EXPIRED";
  }

  return ticket.status;
}

/**
 * Returns true if the ticket's journey departure time has already passed.
 * Use this for conditional rendering (e.g., hiding the "Cancel" button).
 */
export function isJourneyExpired(ticket: Ticket): boolean {
  return getDisplayStatus(ticket) === "EXPIRED";
}
