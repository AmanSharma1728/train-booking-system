// Supported train class codes — used as keys in Train.inventory and throughout the booking flow.
export type ClassCode = "SL" | "3A" | "2A" | "1A" | "CC" | "EC";

export interface Train {
  id: string;
  number: string;
  name: string;
  src: string;          // Full station name (e.g., "New Delhi")
  dest: string;         // Full station name (e.g., "Mumbai Central")
  date: string;         // Travel date for this instance (YYYY-MM-DD)
  departure: string;    // "16:00"
  arrival: string;      // "08:15"
  duration: string;     // e.g., "16h 15m"
  inventory: Partial<Record<ClassCode, {
    available: number;
    price: number;
  }>>;
}

export interface Passenger {
  name: string;
  age: number;
  gender: "male" | "female" | "other";
}

// Unified type for both seat holds and confirmed bookings.
// status values marked with [FE] are derived on the frontend and never sent by the backend.
export interface Ticket {
  id: string;                   // Booking / hold ID
  trainId: string;
  trainName: string;
  seatId: string;               // Specific seat or berth identifier assigned by backend
  date: string;                 // Travel date (YYYY-MM-DD)
  departure: string;            // Departure time ("HH:MM") — used to compute whether the journey has passed
  classCode: ClassCode;
  passengers: Passenger[];
  totalFare: number;
  // Backend sends: SEAT_HELD | PAYMENT_PENDING | CONFIRMED | RAC | WAITLISTED | CANCELLED
  // [FE] EXPIRED — derived: journey date+time is in the past. Use getDisplayStatus() to resolve.
  status: "SEAT_HELD" | "PAYMENT_PENDING" | "CONFIRMED" | "RAC" | "WAITLISTED" | "CANCELLED" | "EXPIRED";
  pnr?: string;                 // Allocated after confirmation
  ttl?: string;                 // ISO timestamp — seat hold expiry countdown. Only present when status is "SEAT_HELD".
}
