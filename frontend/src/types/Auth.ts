import type { Ticket } from "./Booking";

export type User = {
  id: number;
  name: string;
  email: string;
  age: number;
  gender: "male" | "female" | "other";
  bookings?: Ticket[];
};

export type AuthContextType = {
  user: User | null;
  login: (e: string, p: string) => Promise<void>;
  register: (n: string, e: string, p: string, age: number, gender: User["gender"]) => Promise<void>;
  logout: () => void;
  loading: boolean;
};
