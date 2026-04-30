import type { User } from "../types/Auth";
import type { Train, ClassCode, Passenger, Ticket } from "../types/Booking";
import type { HoldResponse, RazorpayInitResponse, VerifyResponse } from "../types/ApiResponse";

const BASE_URL = "http://localhost:3000/api/v1";

const fetchAuth = async (
  endpoint: string,
  options: RequestInit = {},
): Promise<unknown> => {
  const token = localStorage.getItem("token");
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  };

  const res = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers: { ...headers, ...(options.headers as Record<string, string>) },
  });

  if (!res.ok) {
    const errorData = (await res
      .json()
      .catch(() => ({ error: res.statusText }))) as { error: string };
    throw new Error(errorData.error || res.statusText);
  }

  return res.json();
};

export const api = {
  login: async (email: string, password: string): Promise<User> => {
    const data = (await fetchAuth("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    })) as { token: string; user: User };
    localStorage.setItem("token", data.token);
    return data.user;
  },

  register: async (
    name: string,
    email: string,
    password: string,
    age: number,
    gender: User["gender"],
  ): Promise<User> => {
    const data = (await fetchAuth("/auth/register", {
      method: "POST",
      body: JSON.stringify({ name, email, password, age, gender }),
    })) as { token: string; user: User };
    localStorage.setItem("token", data.token);
    return data.user;
  },

  getMe: async (): Promise<User> => {
    const data = (await fetchAuth("/auth/me")) as { user: User };
    return data.user;
  },

  searchTrains: async (
    src?: string,
    dest?: string,
    date?: string,
  ): Promise<Train[]> => {
    const query = new URLSearchParams();
    if (src) query.append("src", src);
    if (dest) query.append("dest", dest);
    if (date) query.append("date", date);
    return fetchAuth(`/trains?${query.toString()}`) as Promise<Train[]>;
  },

  holdSeat: async (payload: {
    trainId: string;
    classCode: ClassCode;
    passengers: Passenger[];
    bookingDate: string;
    requestedSeats: number;
  }): Promise<HoldResponse> => {
    return fetchAuth("/bookings/hold", {
      method: "POST",
      body: JSON.stringify({
        trainId: payload.trainId,
        classCode: payload.classCode,
        date: payload.bookingDate,
        passengers: payload.passengers,
        requestedSeats: payload.requestedSeats,
      }),
    }) as Promise<HoldResponse>;
  },

  initiatePayment: async (holdId: string): Promise<RazorpayInitResponse> => {
    const data = (await fetchAuth(`/bookings/${holdId}/confirm`, {
      method: "POST",
    })) as RazorpayInitResponse;

    // Remote redirect disabled for now as the URL is placeholder
    console.log(
      "Payment confirmed on backend. Mocking internal success...",
      data,
    );
    return data;
  },

  verifyPayment: async (payload: {
    razorpay_payment_id: string;
    razorpay_order_id: string;
    razorpay_signature: string;
    holdId: string;
  }): Promise<VerifyResponse> => {
    return fetchAuth("/bookings/verify", {
      method: "POST",
      body: JSON.stringify(payload),
    }) as Promise<VerifyResponse>;
  },

  getBooking: async (bookingId: string): Promise<Ticket> => {
    return fetchAuth(`/bookings/${bookingId}`) as Promise<Ticket>;
  },

  getHistory: async (): Promise<Ticket[]> => {
    return fetchAuth("/bookings/history") as Promise<Ticket[]>;
  },

  cancelBooking: async (
    bookingId: string,
  ): Promise<{ success: boolean; message: string }> => {
    return fetchAuth(`/bookings/${bookingId}/cancel`, {
      method: "POST",
    }) as Promise<{ success: boolean; message: string }>;
  },
};
