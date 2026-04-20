# Backend API Contracts

This document represents the finalized Backend contract in response to the Frontend requirements. It defines the exact endpoints, request/response models, and error structures that the Backend will expose.

## Base URL
All endpoints are prefixed with `/api/v1`

## Common Response Format
```json
{
  "success": true,
  "data": { ... },
  "error": null,
  "meta": {
    "timestamp": "2024-03-20T10:00:00Z"
  }
}
```

## Error Response Format
```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "ERROR_CODE_STRING",
    "message": "Human readable message",
    "details": ["Optional array of validation errors"]
  }
}
```

## 1. Authentication
### 1.1 Register User
- **POST** `/auth/register`
- **Request:** `{ name, email, phone, password }`
- **Response (201):** `{ message, user: { id, name, email, role } }`
- **Errors:** 
  - `400 BAD_REQUEST`: Invalid input
  - `409 CONFLICT`: `EMAIL_EXISTS` or `PHONE_EXISTS`

### 1.2 Login User
- **POST** `/auth/login`
- **Request:** `{ email, password }`
- **Response (200):** `{ token, user: { id, name, email, role } }`
- **Errors:** `401 UNAUTHORIZED` - `INVALID_CREDENTIALS`

## 2. Search & Availability (Public)
### 2.1 Search Trains
- **GET** `/trains/search?source={code}&destination={code}&date={YYYY-MM-DD}`
- **Response (200):**
  - Returns array of trains matching criteria with departure and arrival times.
  - Cached via Redis.

### 2.2 Get Train Availability
- **GET** `/trains/:id/availability?date={YYYY-MM-DD}`
- **Response (200):**
  - Returns an array of classes with current availability statuses (AVAILABLE, RAC, WAITLIST, FULL), counts, and fares.
  - Cache reconciled with durable inventory.

## 3. Booking & Payment (Protected)
### 3.1 Hold Seat
- **POST** `/bookings/hold`
- **Request:** `{ train_id, date, class_code, passengers: [{ name, age, gender }] }`
- **Response (201):** `{ hold_id, expires_at: "ISO_8601", total_fare }`
- **Errors:** `409 CONFLICT` - `SEATS_UNAVAILABLE`

### 3.2 Initialize Payment / Confirm
- **POST** `/bookings/:hold_id/confirm`
- **Request:** `{ payment_method, transaction_id }`
- **Response (200):** `{ booking_id, pnr, status: "CONFIRMED" | "RAC" | "WAITLISTED" }`
- **Errors:** 
  - `400 BAD_REQUEST` - `HOLD_EXPIRED`
  - `400 BAD_REQUEST` - `PAYMENT_FAILED`

### 3.3 Cancel Booking
- **POST** `/bookings/:booking_id/cancel`
- **Response (200):** `{ message, refund_amount, status: "CANCELLED" }`

## 4. User Journeys (Protected)
### 4.1 Get Booking History
- **GET** `/user/bookings`
- **Response (200):** Returns user's active and historical bookings.

## 5. Admin Console (Protected: Admin)
- **POST** `/admin/trains` - Create new train schedule
- **PUT** `/admin/trains/:id/inventory` - Update seat availability or capacity
