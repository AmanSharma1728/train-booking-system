# Train Ticket Booking System with Redis

## Detailed Software Requirements Specification

## 1. Purpose

This document expands the existing high-level SRS into a more practical, implementation-ready specification for a Train Ticket Booking System that supports real-time seat availability, high concurrency, and safe booking workflows.

The system is designed for cases where many users may try to view or book the same train and the same seats at nearly the same time. The main challenge is not only storing booking data, but making sure the system behaves correctly under concurrent access.

## 2. Project Goal

Build a train ticket booking platform where users can:

- search trains between two stations for a given date
- see near real-time seat availability
- select a class and book a ticket
- make payment within a limited time window
- receive booking confirmation or waitlist / RAC placement
- cancel tickets and release seats back into inventory

The system must remain fast and accurate even when thousands of users are active at the same time.

## 3. Problem Context

In a normal CRUD application, records are created and updated one request at a time. A ticket booking system is harder because:

- many users may compete for the same limited inventory
- the inventory changes every second
- a seat may be selected but not yet paid for
- failed payments must release the held seat safely
- search results must be fast even when backend systems are busy

Without a concurrency-safe design, the system can oversell seats, show stale availability, or create duplicate bookings.

## 4. Scope

### In Scope

- user registration and login
- train search by source, destination, and date
- train listing with classes and quotas
- seat inventory display
- seat hold / temporary lock before payment
- ticket booking and confirmation
- payment status handling
- RAC and waitlist support
- ticket cancellation
- booking history
- admin train schedule and inventory management
- Redis-backed caching and concurrency control

### Out of Scope

- dynamic pricing engine
- route optimization engine
- real railway network integration APIs
- refund settlement with external banking systems
- SMS / email gateway implementation details
- mobile app-specific requirements

## 5. Stakeholders

- passengers / customers
- booking operators
- system administrators
- finance / payment team
- support team
- engineering and DevOps teams

## 6. Assumptions

- each train runs on a known schedule
- seat capacity per coach and class is preconfigured
- payment gateway returns success, pending, or failure
- Redis is available as a low-latency in-memory store
- a relational database is available as the source of truth for confirmed records

## 7. High-Level Architecture

### Main Components

1. Client Application
   - web or mobile frontend used by passengers

2. API Layer
   - handles authentication, search, booking, payment callbacks, cancellation, and admin operations

3. Redis Layer
   - stores hot data used for low-latency access and concurrency control

4. Primary Database
   - stores durable train schedules, bookings, passengers, payments, and audit data

5. Payment Gateway
   - external service used to collect payment

### Logical Flow

Client -> API -> Redis -> Database

For confirmed transactions:

Client -> API -> Redis lock / validation -> Payment -> Database commit -> Redis sync

## 8. Why Redis Is Important Here

Redis is not replacing the database. Redis is being used because this type of project has a "real-time inventory" problem.

Redis helps with:

- very fast seat availability reads
- temporary seat locks with expiration
- atomic seat reservation logic
- waitlist queues
- caching repeated train search results
- storing short-lived user sessions
- rate limiting abusive traffic

If we tried to do all of this directly in the main database under heavy traffic, lock contention and response time would become a bigger issue.

## 9. User Roles

### Passenger

- register and log in
- search trains
- view seat status
- book tickets
- cancel tickets
- view booking history

### Admin

- add or update train schedule
- configure classes and seat inventory
- monitor availability and booking load
- manage exceptional cases

## 10. Functional Requirements

## 10.1 User Authentication

The system shall:

- allow users to register with name, phone, email, and password
- allow login using secure credentials
- create and validate a session token
- store short-lived session data in Redis
- allow logout and session invalidation

### Redis Use

- `session:{userId}` or token-based session key

## 10.2 Train Search

The system shall:

- allow users to search by source station, destination station, and journey date
- return trains matching the route and schedule
- include class-level availability summary
- reuse cached results for repeated popular searches

### Redis Use

- `search:{source}:{destination}:{date}`

### Notes

Search should be cacheable because many users repeat the same query, especially for common routes.

## 10.3 Train Details and Availability

The system shall:

- display train number, name, timings, class types, fares, and availability
- show status such as Available, RAC, Waitlist, or Full
- refresh seat counts from Redis-backed inventory data

### Redis Use

- `train:{trainId}:date:{date}:seats`

This key may store per-class counters or per-seat maps depending on the design.

## 10.4 Seat Selection

The system shall:

- allow the user to select a class and optionally a seat preference
- check whether the seat or class inventory is still available
- place a temporary lock before payment starts

### Redis Use

- `lock:train:{trainId}:seat:{seatNo}`

### Lock Rules

- lock must be atomic
- lock must include user reference and expiry time
- lock must expire automatically if payment is not completed

## 10.5 Booking Workflow

The system shall support this booking flow:

1. user selects train, date, class, and passenger details
2. system checks inventory
3. system creates a temporary seat hold in Redis
4. user is redirected to payment
5. on payment success, booking is confirmed in the database
6. seat inventory is updated in Redis and database
7. ticket / PNR is generated

### Important Rule

Confirmed booking must happen only after successful payment and successful final inventory validation.

## 10.6 Payment Handling

The system shall:

- create a payment attempt record
- handle payment success callback
- handle payment failure callback
- handle pending or timeout cases

### Failure Behavior

- if payment fails, the Redis lock expires or is explicitly released
- the seat becomes available again
- if another user is waiting, availability is recalculated immediately

## 10.7 Cancellation

The system shall:

- allow confirmed ticket cancellation
- update booking status
- release inventory
- promote RAC or waitlist users where applicable

### Redis Use

- update seat counts
- pop eligible waitlist / RAC entries in order

## 10.8 RAC and Waitlist

The system shall:

- place users into RAC if confirmed berths are not available but partial travel allocation is possible
- place users into waitlist if RAC is also full
- maintain queue order fairly
- promote users automatically when seats become available

### Redis Use

- `waitlist:train:{trainId}`
- optional `rac:train:{trainId}`

### Queue Behavior

- first eligible entry must be promoted first
- promotions must be atomic to avoid duplicate assignment

## 10.9 Booking History

The system shall:

- show current and past bookings
- show status such as Confirmed, Cancelled, RAC, Waitlisted, Payment Pending

## 10.10 Admin Operations

The system shall:

- create and update train definitions
- configure route, timing, classes, seat counts, and fares
- trigger cache refresh when schedules change
- view metrics such as booking rate and occupancy

## 11. Non-Functional Requirements

## 11.1 Performance

- support at least 10,000 concurrent users
- average read response under 200 ms for cached endpoints
- booking lock acquisition should be near real time

## 11.2 Scalability

- API should scale horizontally
- Redis should support clustering or replication based on traffic needs
- database should support indexing, partitioning, and read optimization

## 11.3 Availability

- system should remain operational during partial service degradation
- Redis outages should have a fallback strategy
- user-facing impact should be minimized

## 11.4 Reliability

- confirmed bookings must never be duplicated
- seat counts must remain consistent
- payment state and booking state must be reconcilable

## 11.5 Security

- secure password storage
- authenticated booking operations
- input validation and authorization checks
- session expiry and revocation
- rate limiting for login, search, and booking APIs

## 11.6 Auditability

- all booking and cancellation operations should be traceable
- payment and seat allocation decisions should be logged

## 12. Data Design

## 12.1 Core Database Entities

- User
- Train
- Station
- Route
- TrainSchedule
- Coach
- Seat
- Booking
- Passenger
- Payment
- WaitlistEntry
- Cancellation

## 12.2 Example Relational Tables

### User

- id
- name
- email
- phone
- password_hash
- created_at

### Train

- id
- train_number
- train_name
- source_station
- destination_station

### TrainSchedule

- id
- train_id
- run_date
- departure_time
- arrival_time
- status

### Booking

- id
- pnr
- user_id
- train_id
- run_date
- class_type
- booking_status
- payment_status
- total_amount
- created_at

### Passenger

- id
- booking_id
- passenger_name
- age
- gender
- seat_number
- berth_preference
- allocation_status

### Payment

- id
- booking_id
- payment_reference
- payment_status
- amount
- created_at

## 13. Redis Key Design

These keys are examples. Exact structure can vary.

### Seat Inventory

- `train:{trainId}:date:{date}:seats`

Possible contents:

- per-class available count
- per-seat occupancy map
- coach-wise metadata

### Seat Lock

- `lock:train:{trainId}:seat:{seatNo}`

Value may contain:

- userId
- bookingAttemptId
- expiry timestamp

### Waitlist Queue

- `waitlist:train:{trainId}:{date}:{class}`

### Search Cache

- `search:{source}:{destination}:{date}`

### Session

- `session:{token}`

### Rate Limiting

- `rate:user:{userId}:booking`
- `rate:ip:{ip}:search`

## 14. Real-Time Booking Logic

This is the heart of the project.

### Basic Idea

The moment a user clicks "Book", the system should not immediately write a confirmed booking. It should first create a temporary hold so no other user can take the same seat while payment is in progress.

### Why This Matters

Imagine 100 users try to book the last seat at the same second.

If your code does:

1. read available seats
2. see seat is free
3. send user to payment
4. later write booking

then many users can reach payment based on the same old "seat available" result. That leads to overselling.

### Correct Pattern

1. user requests booking
2. system atomically locks the seat or decrements the class inventory
3. lock gets a short TTL such as 5 minutes
4. only the lock owner can complete payment successfully
5. after payment success, booking is finalized
6. if payment fails or times out, lock expires and inventory returns

This is why Redis is used. It gives fast atomic operations and TTL-based cleanup.

## 15. Concurrency Control

The system shall prevent double booking using atomic operations.

### Techniques

- Redis `SET NX EX` for seat lock creation
- Redis transactions where appropriate
- Lua scripts for multi-step atomic updates
- idempotent payment callbacks

### Example Need for Lua

If booking requires:

- check availability
- create lock
- reduce count

then these must happen as one atomic operation. Otherwise two users can pass the check before the count changes.

## 16. Suggested Booking State Machine

Recommended states:

- INITIATED
- SEAT_HELD
- PAYMENT_PENDING
- PAYMENT_SUCCESS
- CONFIRMED
- PAYMENT_FAILED
- EXPIRED
- CANCELLED
- RAC
- WAITLISTED

Each state transition should be validated to avoid illegal jumps.

## 17. API Requirements

## 17.1 Search APIs

- `GET /trains/search?source=&destination=&date=`
- `GET /trains/{id}/availability?date=&class=`

## 17.2 Booking APIs

- `POST /bookings/hold`
- `POST /payments/initiate`
- `POST /payments/callback`
- `POST /bookings/confirm`
- `POST /bookings/{id}/cancel`

## 17.3 User APIs

- `POST /auth/register`
- `POST /auth/login`
- `POST /auth/logout`
- `GET /users/me/bookings`

## 17.4 Admin APIs

- `POST /admin/trains`
- `PUT /admin/trains/{id}`
- `POST /admin/schedules`
- `PUT /admin/inventory/{trainId}`

## 18. Failure and Edge Cases

The system must handle:

- two users selecting the same seat simultaneously
- payment success callback arriving twice
- payment success arriving after lock expiry
- Redis restart or temporary outage
- booking cancel and payment reconciliation mismatch
- stale cached search results
- user closing browser during payment

### Expected Behavior

- duplicate callbacks must not create duplicate bookings
- expired holds must not be confirmable
- cancellation should trigger RAC / waitlist promotion if eligible
- fallback behavior must preserve consistency over speed

## 19. Redis Failure Strategy

Redis is fast, but it should not be treated as infallible.

Possible fallback behavior:

- database remains source of truth for confirmed bookings
- if Redis is unavailable, search can degrade gracefully
- booking may be temporarily slowed or restricted rather than risking oversell
- background jobs can rebuild cache from database

This is important because in real systems, correctness matters more than speed when the two conflict.

## 20. Rate Limiting

The system shall limit:

- login attempts per user / IP
- search request bursts
- repeated booking attempts
- abuse of payment initiation endpoints

Redis is suitable because counters with expiration are cheap and fast.

## 21. Background Jobs

Recommended asynchronous jobs:

- expire stale seat holds
- reconcile payment and booking status
- refresh search cache
- promote waitlist and RAC entries
- rebuild Redis cache after restart
- send notifications

## 22. Monitoring and Logging

Important metrics:

- seat hold creation rate
- hold expiry rate
- booking success rate
- payment failure rate
- search latency
- Redis latency
- DB write latency
- waitlist promotion count

Important logs:

- booking state transitions
- payment callback events
- inventory update failures
- concurrency conflict events

## 23. Testing Requirements

## 23.1 Functional Testing

- registration and login
- train search
- booking success
- payment failure handling
- cancellation
- waitlist promotion

## 23.2 Concurrency Testing

- many users try to book the last seat
- same payment callback sent multiple times
- simultaneous cancellation and booking

## 23.3 Performance Testing

- 10,000 concurrent search users
- heavy booking traffic for one train
- Redis cache hit and miss behavior

## 23.4 Failure Testing

- Redis unavailable
- payment callback delayed
- DB transaction failure during confirmation

## 24. Suggested Technology Split

This is one practical implementation model:

- frontend: React or Angular
- backend: Node.js / Java / Spring Boot / .NET
- database: PostgreSQL or MySQL
- cache / concurrency: Redis
- background jobs: worker service with queue

The most important design choice is not the language. It is the correctness of the booking flow.

## 25. Beginner-Friendly Implementation Plan

If you are new to this level of project, do not start with full real-time complexity on day one. Build in layers.

### Phase 1

- build user login
- build train search
- build DB schema
- show availability from database only

### Phase 2

- add Redis cache for search and availability
- store sessions in Redis

### Phase 3

- add seat hold with TTL
- add payment flow simulation
- finalize confirmed booking after success

### Phase 4

- add waitlist and RAC
- add cancellation and promotion logic
- add rate limiting and admin dashboard

This staged approach is much easier than trying to build everything at once.

## 26. Final Outcome

If implemented correctly, this system will provide:

- fast search and availability reads
- safe seat locking during payment
- reduced risk of double booking
- fair waitlist handling
- scalable support for heavy traffic

The core lesson of this project is that real-time systems are less about screens and forms, and more about state management, concurrency control, and failure handling.
