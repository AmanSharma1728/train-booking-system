# Backend Database Calls & Schema (MongoDB)

This document defines the data models and database access patterns for the Train Ticket Booking System using MongoDB (Mongoose).

## 1. Core Collections

- `users`: Passenger and Admin accounts.
- `trains`: Train metadata (number, name, standard class layout).
- `schedules`: Stop-by-stop routes, arrival/departure timings.
- `inventories`: Date-specific train capacity, available seats per class, and current bookings/waitlist numbers.
- `bookings`: Durable truth of all bookings (Confirmed, waitlisted, RAC, cancelled).
- `payments`: Secure record of all transactions associated with bookings.

## 2. Feature-Wise DB Calls

### 2.1 Authentication
- **Register:** `User.create()` - Adds new user to DB. Includes unique index on `email`.
- **Login:** `User.findOne({ email })` - Verify credentials.

### 2.2 Train Search
- **Search:** `Schedule.aggregate()` or `Schedule.find()` with `$lookup` to join `Train` metadata based on source/destination station codes and journey date.

### 2.3 Availability Tracking
- **Fetch:** `Inventory.findOne({ train_id, date })` to return exact seat availability.

### 2.4 Seat Holding
- *Uses Redis for initial hold lock.*
- **Durable Logging (Optional):** Creating a `Booking` document with status `INITIATED` to track drop-off metrics.

### 2.5 Payment & Confirmation
- **Payment Creation:** `Payment.create()` marking attempt.
- **Confirmation Transaction (MongoDB Session):**
  1. Verify lock/hold is valid.
  2. `Payment.updateOne()` to `SUCCESS`.
  3. `Inventory.findOneAndUpdate()` to decrement seat count atomically (e.g., `$inc: { available_seats: -passengers.length }`).
  4. `Booking.create()` storing PNR, passenger details, and marking status `CONFIRMED` or `RAC/WAITLIST`.

### 2.6 Cancellation
- **Cancellation Event (MongoDB Session):**
  1. `Booking.updateOne()` to `CANCELLED`.
  2. `Inventory.findOneAndUpdate()` to restore seat count (`$inc: { available_seats: +count }`).
  3. Trigger async promotion logic for RAC/Waitlist queries.

### 2.7 Booking History (User)
- **History:** `Booking.find({ user_id: req.user._id }).sort({ createdAt: -1 })`

### 2.8 Admin Operations
- **Train Creation:** `Train.create()`
- **Inventory Mgt:** `Inventory.updateOne()` to adjust limits.

## 3. DB Design Rules
- All confirmation, cancellation logic requires **MongoDB Transactions** to avoid split-brain consistency bugs.
- Confirmed bookings must be completely durable in MongoDB. Redis is strictly for read-caching and short-lived locks.
