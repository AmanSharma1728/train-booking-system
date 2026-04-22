# Backend API Contracts

This document defines the exact contract between the Frontend and Backend. All developers must follow these specifications exactly, including the error response formats.

## Base URL
`http://localhost:3000/api`

## Security Layer
All routes marked as **(Protected)** must use an `AuthMiddleware` to verify the JWT Bearer token in the `Authorization` header.

## Generic Error Format (JSON)
All non-2xx responses MUST return this format:
```json
{ "error": "Human readable error message" }
```

---

## 1. Authentication

### 1.1 `POST /auth/register`
- **Request Body:** `{ "name", "email", "password", "age", "gender" }`
  - `age`: integer (years)
  - `gender`: `"male"` | `"female"` | `"other"`
- **Response (200 OK):** `{ "token", "user": { "id", "name", "email", "age", "gender" } }`
- **Error Scenarios:**
  - `400 Bad Request`: `{ "error": "All fields are required" }`
  - `409 Conflict`: `{ "error": "Email already registered" }`

### 1.2 `POST /auth/login`
- **Request Body:** `{ "email", "password" }`
- **Response (200 OK):** `{ "token", "user": { "id", "name", "email", "age", "gender" } }`
- **Error Scenarios:**
  - `401 Unauthorized`: `{ "error": "Invalid email or password" }`

### 1.3 `GET /auth/me` (Protected)
Used by Frontend to verify token on page refresh.
- **Middleware**: `AuthMiddleware` (Required)
- **Headers:** `Authorization: Bearer <token>`
- **Response (200 OK):** `{ "user": { "id", "name", "email", "age", "gender" } }`
- **Error Scenarios:**
  - `401 Unauthorized`: `{ "error": "Session expired or invalid token" }`

---

## 2. Trains & Search

### 2.1 `GET /trains`
Searches for trains between two stations on a specific date.
- **Query Params:** `source`, `destination`, `date`
- **Response (200 OK):**
```json
[
  {
    "id": "t101",
    "number": "12432",
    "name": "Rajdhani Exp",
    "src": "New Delhi",
    "dest": "Mumbai Central",
    "date": "2026-05-10",
    "departure": "16:00",
    "arrival": "08:15",
    "duration": "16h 15m",
    "inventory": {
      "SL": { "available": 45, "price": 550 },
      "3A": { "available": 12, "price": 1250 },
      "2A": { "available": 2, "price": 1800 }
    }
  }
]
```
- **Valid `classCode` values:** `"SL" | "3A" | "2A" | "1A" | "CC" | "EC"`
- **Error Scenarios:**
  - `400 Bad Request`: `{ "error": "Source and destination are required" }`

---

## 3. Bookings

### 3.1 `POST /bookings/hold` (Protected)
- **Middleware**: `AuthMiddleware`
- **Request Body:** `{ "trainId", "date", "classCode", "passengers": [{ "name", "age", "gender" }] }`
- **Response (201 Created):** `{ "holdId", "totalFare" }`
- **Error Scenarios:**
  - `409 Conflict`: `{ "error": "Seats are no longer available in this class" }`

### 3.2 `POST /bookings/:holdId/confirm` (Protected)
**Payment Gateway: Razorpay Hosted Page**
- **Middleware**: `AuthMiddleware`
- **Request Body:** _(empty — no card details collected by frontend)_
- **Behaviour:** Backend creates a Razorpay order and returns a hosted payment URL. Frontend immediately redirects the user to this URL.
- **Response (200 OK):** `{ "paymentUrl": "https://rzp.io/l/xyz123" }`
- **Error Scenarios:**
  - `410 Gone`: `{ "error": "Seat hold has expired" }`

### 3.2a `GET /bookings/:id` (Protected)
Called by the frontend **after Razorpay redirects the user back** to `/booking/result?bookingId=:id`.
- **Middleware**: `AuthMiddleware`
- **Response (200 OK):**
```json
{
  "id": "b001",
  "pnr": "PNR1234567",
  "trainId": "t101",
  "trainName": "Rajdhani Exp",
  "seatId": "S1-42",
  "date": "2026-05-10",
  "departure": "16:00",
  "classCode": "3A",
  "passengers": [{ "name": "Ravi Kumar", "age": 28, "gender": "male" }],
  "totalFare": 1250,
  "status": "CONFIRMED"
}
```
- **Valid `status` values:** `"SEAT_HELD" | "PAYMENT_PENDING" | "CONFIRMED" | "RAC" | "WAITLISTED" | "CANCELLED"`
  - *Note: "EXPIRED" is a frontend-derived status and is not sent by the backend.*
- **Error Scenarios:**
  - `404 Not Found`: `{ "error": "Booking not found" }`

### 3.3 `GET /bookings/history` (Protected)
- **Middleware**: `AuthMiddleware`
- **Response (200 OK):** Array of Ticket objects (same shape as 3.2a response, with all statuses).

### 3.4 `POST /bookings/:id/cancel` (Protected)
- **Middleware**: `AuthMiddleware`
- **Response (200 OK):** `{ "success": true, "message": "Booking cancelled successfully" }`
- **Error Scenarios:**
  - `400 Bad Request`: `{ "error": "Booking cannot be cancelled at this time" }`
