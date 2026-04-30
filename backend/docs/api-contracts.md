# Backend API Contracts

This document defines the exact contract between the Frontend and Backend. All developers must follow these specifications exactly, including the error response formats.

## Base URL
`http://localhost:3000/api/v1`

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
- **Request Body:** `{ "trainId", "date", "classCode", "requestedSeats", "passengers": [{ "name", "age", "gender" }] }`
- **Behaviour:** Acquires an atomic lock in Redis for 120 seconds. Does NOT decrement MongoDB inventory yet.
- **Response (201 Created):** `{ "holdId", "totalFare", "expiry_timestamp" }`
- **Error Scenarios:**
  - `409 Conflict`: `{ "error": "Not enough seats available" }`
  - `503 Service Unavailable`: `{ "error": "Service temporarily unavailable. Please try again later." }`

### 3.2 `POST /bookings/:holdId/confirm` (Protected)
**Payment Initiation: Razorpay SDK**
- **Middleware**: `AuthMiddleware`
- **Request Body:** _(empty)_
- **Behaviour:** Backend creates a real Razorpay Order using the SDK and transitions booking status to `PAYMENT_PENDING`.
- **Response (200 OK):** 
```json
{ 
  "razorpay_order_id": "order_LWp5zX3z...", 
  "totalFare": 1250, 
  "holdId": "69f19...", 
  "key_id": "rzp_test_..." 
}
```
- **Error Scenarios:**
  - `410 Gone`: `{ "error": "Seat hold has expired" }`

### 3.3 `POST /bookings/verify` (Protected)
**Finalization: Payment Signature Verification**
- **Middleware**: `AuthMiddleware`
- **Request Body:** `{ "razorpay_payment_id", "razorpay_order_id", "razorpay_signature", "holdId" }`
- **Behaviour:** 
  1. Verifies HMAC-SHA256 signature.
  2. Checks if Redis hold is still valid.
  3. **Decrements MongoDB Inventory** (Finalized).
  4. Assigns Real PNR and Seat Info.
- **Response (200 OK):**
```json
{
  "status": "CONFIRMED",
  "pnr": "432-8761234",
  "seatInfo": "B2-42",
  "bookingId": "69f19..."
}
```

### 3.4 `GET /bookings/:id` (Protected)
- **Middleware**: `AuthMiddleware`
- **Response (200 OK):**
```json
{
  "id": "b001",
  "pnr": "432-8761234",
  "trainId": "t101",
  "trainName": "Rajdhani Exp",
  "seatInfo": "B2-42",
  "date": "2026-05-10",
  "src": "New Delhi",
  "dest": "Mumbai Central",
  "departure": "16:00",
  "arrival": "08:15",
  "classCode": "3A",
  "passengers": [{ "name": "Ravi Kumar", "age": 28, "gender": "male" }],
  "totalFare": 1250,
  "status": "CONFIRMED",
  "razorpayOrderId": "order_...",
  "razorpayPaymentId": "pay_..."
}
```
- **Valid `status` values:** `"SEAT_HELD" | "PAYMENT_PENDING" | "CONFIRMED" | "RAC" | "WAITLISTED" | "CANCELLED"`
  - *Note: "EXPIRED" is a frontend-derived status and is not sent by the backend.*
- **Error Scenarios:**
  - `404 Not Found`: `{ "error": "Booking not found" }`

### 3.5 `GET /bookings/history` (Protected)
- **Middleware**: `AuthMiddleware`
- **Behaviour:** Retrieves all bookings (Confirmed, Cancelled, and Pending) for the user, sorted by journey date descending.
- **Response (200 OK):** Array of Ticket objects (same shape as 3.4 response).

### 3.6 `POST /bookings/:id/cancel` (Protected)
- **Middleware**: `AuthMiddleware`
- **Behaviour:** 
  1. Verifies ownership.
  2. Transitions status to `CANCELLED`.
  3. Triggers **Queue Promotion** (RAC ➡️ Confirmed, WL ➡️ RAC).
  4. Increments inventory if no queue exists.
- **Response (200 OK):** `{ "success": true, "message": "Booking cancelled successfully" }`
- **Error Scenarios:**
  - `400 Bad Request`: `{ "error": "Booking cannot be cancelled at this time" }`

---

## 4. System Logic & State Machine

### 4.1 Queue Promotion (Phase 4)
When a `CONFIRMED` booking is cancelled, the system performs a cascading promotion to ensure seats are always filled:
1. **RAC to Confirmed**: The earliest `RAC` booking for that train/date/class is promoted to `CONFIRMED` and receives the freed `seatInfo`.
2. **Waitlist to RAC**: The earliest `WAITLISTED` booking is then promoted to `RAC` to fill the newly opened spot in the RAC queue.
3. **Waitlist to Confirmed (Short-circuit)**: If the RAC queue is empty but there are people on the Waitlist, the first `WAITLISTED` person is promoted directly to `CONFIRMED`.
4. **Inventory Recovery**: If no passengers are in the RAC or Waitlist queues, the seat is returned to the train's `available` inventory count.
