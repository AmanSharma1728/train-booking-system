# Backend Service Architecture (Modular Monolith)

This document breaks down the backend into bounded contexts. It is implemented as a Modular Monolith in Node.js (Express) with clear isolation boundaries to allow potential future extraction into microservices.

## 1. Architecture Overview
- **Framework:** Express / Node.js
- **Database:** MongoDB (via Mongoose)
- **Cache:** Redis
- **Style:** Clean Architecture / Controller-Service-Repository layers per domain.

## 2. Functional Modules

### 2.1 Authentication Module (`/src/modules/auth`)
- **Domain:** Users, Roles, Passwords, JWT.
- **External Dependencies:** Email/SMS (Mocked), DB (User Collection).

### 2.2 Search & Availability Module (`/src/modules/search`)
- **Domain:** Fast querying of routes, read-only aggregations.
- **Responsibilities:** Returns schedules, interacts heavily with Redis to return cached seat mappings.

### 2.3 Booking & Hold Module (`/src/modules/booking`)
- **Domain:** PNR Generation, Hold Locks, Concurrency.
- **Responsibilities:**
  1. Generating locks using Redis Lua Scripts.
  2. Orchestrating the creation of pending bookings.
  3. Finalizing bookings (Calling Inventory + DB Transactions).

### 2.4 Inventory & Queue Module (`/src/modules/inventory`)
- **Domain:** Seat limits, RAC thresholds, Waitlist limits.
- **Responsibilities:** 
  - Exclusively handles the mutation of seat capacities. 
  - Manages automatic RAC/Waitlist promotion when cancellations occur.

### 2.5 Payment Module (`/src/modules/payment`)
- **Domain:** Payment Intents, Webhooks.
- **Responsibilities:** Existent for simulated payment successes. Manages idempotent callbacks to prevent double-charging or double-ticketing.

### 2.6 Admin Module (`/src/modules/admin`)
- **Domain:** Train configuration.
- **Responsibilities:** CRUD on trains, managing station codes, unlocking full inventory configurations.

## 3. Background Jobs (Worker Processes)
Using `bullmq` or standard intervals:
- **Hold Expiration Job:** Sweeps expired DB holds if Redis keys expire without a webhook.
- **Queue Promotion Job:** Triggers when a confirmed booking is cancelled. Shifts RAC -> Confirmed, Waitlist -> RAC.
