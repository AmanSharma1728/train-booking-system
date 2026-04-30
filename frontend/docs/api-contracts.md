# Backend API Contracts (Frontend Reference Copy)

> **Note:** The canonical version of this document is `backend/docs/api-contracts.md`. This copy is kept here for quick frontend reference. Always keep both in sync when contracts are updated.

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
- **Response (200 OK):** `{ "token", "user": { "id", "name", "email", "age", "gender" } }`

### 1.2 `POST /auth/login`
- **Request Body:** `{ "email", "password" }`
- **Response (200 OK):** `{ "token", "user": { "id", "name", "email", "age", "gender" } }`

---

## 2. Trains & Search

### 2.1 `GET /trains`
- **Query Params:** `src`, `dest`, `date`
- **Response (200 OK):** Array of Train objects with inventory.

---

## 3. Bookings & Lifecycle

### 3.1 `POST /bookings/hold` (Protected)
- **Request Body:** `{ "trainId", "date", "classCode", "requestedSeats", "passengers" }`
- **Response (201 Created):** `{ "holdId", "totalFare", "expiry_timestamp" }`

### 3.2 `POST /bookings/:holdId/confirm` (Protected)
- **Response (200 OK):** `{ "razorpay_order_id", "totalFare", "holdId", "key_id" }`

### 3.3 `POST /bookings/verify` (Protected)
- **Request Body:** `{ "razorpay_payment_id", "razorpay_order_id", "razorpay_signature", "holdId" }`
- **Response (200 OK):** `{ "status": "CONFIRMED", "pnr", "seatInfo", "bookingId" }`

### 3.4 `GET /bookings/history` (Protected)
- **Response (200 OK):** Array of Ticket objects.

### 3.5 `POST /bookings/:id/cancel` (Protected)
- **Response (200 OK):** `{ "success": true, "message": "Booking cancelled successfully" }`
