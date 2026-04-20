# API Contracts

This document standardizes the API expectations between Frontend and Backend, covering authentication, search, booking, user features, and admin endpoints.

## 1. Authentication

### 1.1 Register
- **Endpoint:** `POST /api/auth/register`
- **Request Body:** `{ name, email, phone, password }`
- **Expected Success (201):** `{ message: "Registration successful", user: { id, email, role } }`
- **Expected Error (400/409):** `{ error_code: "USER_EXISTS", message: "Email already registered" }`

### 1.2 Login
- **Endpoint:** `POST /api/auth/login`
- **Request Body:** `{ email, password }`
- **Expected Success (200):** `{ token: "jwt...", user: { id, email, role } }`
- **Expected Error (401):** `{ error_code: "INVALID_CREDENTIALS", message: "Invalid email or password" }`

## 2. Search & Availability

### 2.1 Search Trains
- **Endpoint:** `GET /api/trains/search`
- **Query Params:** `source, destination, date`
- **Expected Success (200):** 
```json
{
  "trains": [
    {
      "train_id": "T123",
      "train_name": "Express",
      "train_number": "12345",
      "departure": "10:00 AM",
      "arrival": "14:00 PM"
    }
  ]
}
```

### 2.2 Train Availability
- **Endpoint:** `GET /api/trains/:id/availability`
- **Query Params:** `date`
- **Expected Success (200):**
```json
{
  "classes": [
    {
      "class_code": "1A",
      "fare": 1500,
      "status": "AVAILABLE",
      "count": 12
    },
    {
      "class_code": "SL",
      "fare": 500,
      "status": "RAC",
      "count": 5
    }
  ]
}
```

## 3. Booking Contracts

### 3.1 Hold Seat
- **Endpoint:** `POST /api/bookings/hold`
- **Request Body:** `{ train_id, date, class_code, passengers: [{name, age, gender}] }`
- **Expected Success (200):** `{ hold_id: "H123", expires_at: "ISO_TIMESTAMP", total_fare: 1500 }`
- **Expected Error (409):** `{ error_code: "SEAT_UNAVAILABLE", message: "Seats filled during process." }`

### 3.2 Initiate Payment / Confirm
- **Endpoint:** `POST /api/bookings/:hold_id/confirm`
- **Request Body:** `{ payment_details... }`
- **Expected Success (200):** `{ booking_id: "B123", pnr: "PNR999", status: "CONFIRMED" }`

### 3.3 Cancel Booking
- **Endpoint:** `POST /api/bookings/:booking_id/cancel`
- **Expected Success (200):** `{ message: "Cancelled successfully", refund_amount: 1200 }`

## 4. Admin Contracts
- **Create Train:** `POST /api/admin/trains` - `{ train_number, name... }` -> 201 Created
- **Update Inventory:** `PUT /api/admin/inventory/:train_id` - `{ date, increments... }` -> 200 OK
