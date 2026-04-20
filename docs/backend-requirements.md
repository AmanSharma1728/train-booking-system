# Backend Requirements and Delivery Guide

## 1. Purpose

This document defines what the backend engineer must know, learn, design, document, and deliver for the Train Ticket Booking System. It focuses on service behavior, persistence, Redis usage, APIs, and backend ownership expected by the manager.

This document is aligned to the manager instruction:

- analyze requirement (both FE and BE)
- prepare contract docs
- FE to define pages, define contracts and share to BE
- BE to define DB calls, cache calls and microservices break up
- final output

## 2. Backend Objective

The backend must provide a correct, concurrency-safe, observable, and contract-driven service layer for:

- authentication
- train search
- availability read
- seat hold and booking
- payment handling
- cancellation
- RAC and waitlist management
- booking history
- admin train, schedule, and inventory management

The backend must prioritize correctness over apparent speed, especially in hold, payment, and confirmation flows.

## 3. What the Backend Person Must Know or Learn

## 3.1 Domain Understanding

The backend engineer must understand:

- train booking lifecycle and state transitions
- inventory correctness and oversell prevention
- seat hold versus confirmed booking
- payment success, failure, pending, and duplicate callbacks
- RAC and waitlist promotion rules
- cancellation effects on inventory and queue movement

## 3.2 Technical Understanding

The backend engineer must know or learn:

- API design and versioning
- relational schema design
- transaction handling
- idempotency
- Redis caching patterns
- Redis locking patterns
- Lua or atomic Redis operation strategy where required
- TTL-based hold expiration
- background jobs or workers
- service decomposition and integration boundaries
- monitoring, logging, and audit design
- failure recovery for Redis and database inconsistencies

## 3.3 Collaboration Understanding

The backend engineer must be comfortable with:

- accepting FE contract requirements and reconciling them
- documenting final request and response payloads
- exposing stable integration contracts
- defining DB calls, cache calls, and microservice split explicitly
- documenting assumptions instead of hiding them in code

## 4. Backend Ownership

The backend engineer owns:

- API definitions and server-side validation
- auth/session logic
- relational database schema
- booking workflow correctness
- payment state handling
- Redis cache and locking design
- waitlist and RAC logic
- background job definitions
- service decomposition and internal call boundaries
- error code strategy
- observability and operational correctness

The backend engineer does not own:

- page layouts
- route design in frontend
- frontend component structure
- frontend-only validation or UI copy

## 5. Mandatory Backend Deliverables

The backend engineer must produce:

- API contract response to FE contract pack
- endpoint specification with payload examples
- database entity and relation design
- DB call mapping per feature
- Redis key and cache call mapping per feature
- microservice or module break-up document
- booking state machine definition
- failure handling rules
- background job definitions
- backend test checklist

## 6. Backend Functional Modules

Backend work should be broken into the following modules.

## 6.1 Auth Module

Responsibilities:

- register user
- login user
- logout user
- validate session or token

Primary data:

- users
- auth credentials
- sessions

## 6.2 Train Search Module

Responsibilities:

- search train schedules by source, destination, and date
- return class-wise availability summary
- support caching for repeated queries

Primary data:

- trains
- schedules
- inventory summaries

## 6.3 Availability Module

Responsibilities:

- fetch train-level and class-level availability
- return current status: available, RAC, waitlist, full
- reconcile cache with durable data when needed

## 6.4 Booking Module

Responsibilities:

- create hold
- validate inventory atomically
- create booking attempt
- confirm booking after payment
- create PNR or booking ID

## 6.5 Payment Module

Responsibilities:

- create payment attempt
- process callback or webhook
- support idempotent success and failure handling
- update booking state safely

## 6.6 Cancellation Module

Responsibilities:

- cancel valid booking
- release inventory
- trigger RAC or waitlist promotion

## 6.7 User Booking Module

Responsibilities:

- booking history
- booking status lookup
- booking detail retrieval

## 6.8 Admin Module

Responsibilities:

- create or update trains
- create or update schedules
- update inventory and class capacity

## 6.9 Background Jobs Module

Responsibilities:

- expire stale holds
- reconcile payment and booking states
- promote RAC or waitlist
- rebuild cache if required
- send notifications if implemented

## 7. Database Calls the Backend Must Define

The manager explicitly asked BE to define DB calls. The backend engineer must document DB access per feature before implementation or during contract finalization.

## 7.1 Core Entities

Minimum entities:

- User
- Train
- TrainSchedule
- Booking
- Passenger
- Payment
- SeatInventory or equivalent inventory table
- WaitlistEntry or RAC queue structure if stored durably

## 7.2 Feature-Wise DB Calls

1. User Registration
   - insert user
   - check duplicate email or phone

2. Login
   - fetch user by credential identifier
   - validate password hash
   - create or update session record if persistent session storage is used

3. Train Search
   - query train schedules for route and date
   - join train metadata and fare/class information

4. Availability
   - fetch durable inventory snapshot
   - optionally reconcile with booking and cancellation state

5. Booking Hold
   - create booking attempt or provisional record if design requires it
   - validate current durable booking state if Redis fallback is needed

6. Payment Initiation
   - insert payment attempt
   - associate payment with booking attempt

7. Booking Confirmation
   - create confirmed booking
   - insert passenger records
   - update inventory
   - update payment state
   - create audit entry if applicable

8. Cancellation
   - update booking status to cancelled
   - update inventory
   - update RAC or waitlist state

9. Booking History
   - fetch bookings by user
   - join payment and passenger summary

10. Admin Operations
    - insert or update train
    - insert or update schedule
    - insert or update inventory configuration

## 7.3 DB Design Rules

The backend engineer must ensure:

- confirmed bookings are stored durably in relational DB
- transactions protect multi-table booking confirmation changes
- indexes support route search and booking lookups
- booking state transitions are explicit
- duplicate payment callback handling is idempotent

## 8. Cache Calls and Redis Responsibilities the Backend Must Define

The manager also explicitly asked BE to define cache calls. The backend engineer must document which Redis operation supports which business case.

## 8.1 Redis Usage Areas

Redis is expected for:

- session storage
- search caching
- availability caching
- seat hold locks
- waitlist or RAC queue support
- rate limiting

## 8.2 Required Redis Key Categories

Suggested keys:

- `session:{userId}` or token session key
- `search:{source}:{destination}:{date}`
- `train:{trainId}:date:{date}:seats`
- `lock:train:{trainId}:seat:{seatNo}`
- `waitlist:train:{trainId}:date:{date}:class:{class}`
- rate-limit keys by IP or user

## 8.3 Feature-Wise Cache Calls

1. Login and Session
   - create session entry with TTL
   - validate session key
   - delete or expire session on logout

2. Search
   - cache search result
   - read search result
   - invalidate or refresh stale search cache

3. Availability
   - read class-level seat state
   - update availability counters on booking or cancellation

4. Seat Hold
   - create lock atomically with TTL
   - verify lock owner
   - release lock on failure or timeout

5. Waitlist / RAC
   - push user into queue
   - pop next eligible user
   - inspect queue order

6. Rate Limiting
   - increment request counter
   - set or respect expiry window

## 8.4 Cache Design Rules

The backend engineer must ensure:

- Redis never becomes the only source of truth for confirmed bookings
- lock operations are atomic
- TTL expiry behavior is defined clearly
- cache invalidation points are documented
- fallback behavior exists for Redis outage

## 9. Microservices or Service Break-Up the Backend Must Define

The manager explicitly asked for microservices break up. Even if the implementation starts as a modular monolith, backend documentation must present a clear service decomposition.

## 9.1 Recommended Service Breakdown

1. Auth Service
   - registration
   - login
   - session validation

2. Search Service
   - route search
   - cached train listing
   - availability summary reads

3. Booking Service
   - hold creation
   - booking attempt management
   - confirmation logic

4. Payment Service
   - payment initiation
   - callback processing
   - payment state management

5. Inventory Service
   - seat counters
   - class capacity
   - inventory adjustment

6. Queue Service
   - RAC and waitlist management
   - promotion logic

7. Admin Service
   - train, schedule, and inventory administration

8. Notification or Worker Service
   - async jobs and eventual tasks

## 9.2 If Built as a Modular Monolith

If full microservices are not implemented, backend must still separate code by modules with:

- clear ownership boundaries
- separate interfaces
- isolated data access methods
- well-defined internal APIs

This allows future service extraction without rewriting the whole system.

## 10. API Contract Responsibilities of Backend

Backend must receive FE contract definitions and respond with finalized contracts for:

- endpoint paths
- methods
- auth requirements
- request payload rules
- response field names
- error codes
- retry-safe behavior
- state-specific responses

The backend engineer must not change payload structure informally after FE integration starts.

## 11. Booking State and Correctness Rules

Backend must document and enforce state transitions such as:

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

Rules that must be explicit:

- no confirmation without successful final validation
- duplicate callback must not create duplicate booking
- expired hold must not be confirmable
- cancellation must trigger inventory release
- RAC and waitlist promotion must preserve ordering rules

## 12. Failure and Edge Cases Backend Must Handle

The backend engineer must define behavior for:

- two users competing for last inventory
- duplicate payment callbacks
- payment callback after hold expiry
- Redis outage
- DB transaction failure after payment success
- cancellation versus promotion race conditions
- stale cache during heavy booking traffic
- partial failure in background jobs

## 13. Backend Acceptance Criteria

The backend part should be considered ready only when:

- API contracts are finalized with FE
- DB calls are documented feature-wise
- Redis calls are documented feature-wise
- service or microservice split is documented
- booking correctness rules are explicit
- failure handling rules are defined
- idempotency strategy exists for payment flow
- test checklist includes concurrency and failure cases

## 14. Backend Recommended Work Sequence

The backend engineer should work in this order:

1. Study SRS and booking lifecycle
2. Finalize module or microservice split
3. Design entities and DB schema
4. Define DB call map
5. Define Redis key and cache call map
6. Review FE contract pack and finalize API contracts
7. Implement auth and search services
8. Implement availability and inventory logic
9. Implement booking hold and payment flow
10. Implement cancellation and queue promotion
11. Add background jobs and monitoring
12. Run concurrency and failure testing

## 15. Key Backend Risks

- treating Redis as durable truth for confirmed booking
- missing atomicity in hold and inventory updates
- not documenting cache invalidation
- weak idempotency in payment callbacks
- coupling service responsibilities too early
- failing to communicate final field names and states to FE

## 16. Final Backend Output Expected by Manager

The backend engineer must be able to show:

- API contract response to FE document
- database design and feature-wise DB calls
- Redis design and feature-wise cache calls
- microservice or module break-up
- booking state machine
- error and failure behavior
- implementation status by module
