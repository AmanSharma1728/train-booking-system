# Frontend Requirements and Delivery Guide

## 1. Purpose

This document defines what the frontend engineer must know, learn, prepare, and deliver for the Train Ticket Booking System. It is written to support implementation planning, review discussions, and frontend-backend coordination.

This document is derived from the system SRS and from the manager instruction:

- analyze requirement (both FE and BE)
- prepare contract docs
- FE to define pages, define contracts and share to BE
- BE to define DB calls, cache calls and microservices break up
- final output

## 2. Frontend Objective

The frontend must provide a clear, responsive, and reliable user interface for:

- user authentication
- train search
- train listing and availability viewing
- seat/class selection
- booking creation and payment initiation
- booking confirmation, RAC, or waitlist result display
- cancellation and booking history
- admin train and inventory management

The frontend must not treat this project as a simple form-based CRUD app. It must handle real-time or near real-time state changes, loading states, retries, error states, and contract-driven integration with the backend.

## 3. What the Frontend Person Must Know or Learn

## 3.1 Domain Understanding

The frontend engineer must understand:

- booking lifecycle: search -> availability -> hold -> payment -> confirm
- difference between available, RAC, waitlist, and full
- temporary seat hold behavior and expiry
- why availability can change between search and booking
- cancellation impact on availability and waitlist promotion
- admin use cases versus passenger use cases

## 3.2 Technical Understanding

The frontend engineer must know or learn:

- chosen frontend framework and routing model
- component-driven UI design
- form validation and error handling
- API integration patterns
- authentication token handling
- protected routes
- state management for search, booking, auth, and admin workflows
- polling, refresh, or revalidation strategies for availability data
- payment redirect or callback handling from frontend perspective
- loading, optimistic, and failure states
- environment configuration and API base URL handling

## 3.3 Collaboration Understanding

The frontend engineer must be comfortable with:

- preparing page-wise requirements before coding
- defining API contracts before backend completion
- documenting request and response expectations
- identifying fields required from backend rather than assuming them
- raising blocking questions early
- versioning contract changes instead of changing payload assumptions silently

## 4. Frontend Ownership

The frontend engineer owns:

- information architecture for user-facing and admin-facing pages
- UI page definitions and navigation flow
- component structure
- frontend validation rules
- API consumption layer
- request and response contract proposal from frontend consumption perspective
- loading, empty, error, success, and concurrency-related user states
- frontend test scenarios for main user journeys

The frontend engineer does not own:

- database schema design
- Redis key strategy
- concurrency implementation internals
- payment gateway backend processing
- booking correctness logic on server side

## 5. Mandatory Frontend Deliverables

The frontend engineer must produce the following before or during implementation:

- page inventory document
- user flow document
- API contract expectation sheet shared to backend
- list of required fields for each page
- UI validation rules for all input forms
- error-state matrix
- reusable component plan
- frontend environment setup instructions
- test checklist for each page and flow

## 6. Pages the Frontend Must Define

The frontend engineer must define at minimum the following pages or screens.

## 6.1 Passenger Pages

1. Landing or Home Page
   - route search form
   - login or register entry points
   - featured instructions or FAQs if required

2. Register Page
   - name, phone, email, password
   - validation and duplicate user handling

3. Login Page
   - secure login form
   - invalid credentials handling

4. Search Results Page
   - list of matching trains for source, destination, and date
   - class-wise availability summary
   - fare summary
   - no-result handling

5. Train Details and Availability Page
   - train details
   - class selection
   - seat availability status
   - refresh or last-updated indicator

6. Booking / Passenger Details Page
   - passenger detail form
   - class confirmation
   - selected train and date summary
   - seat preference if supported

7. Seat Hold / Booking Review Page
   - hold confirmation
   - timer if seat hold TTL is exposed
   - fare summary
   - proceed-to-payment action

8. Payment Redirect / Payment Status Page
   - payment initiation
   - pending, success, failure, or expired state

9. Booking Confirmation Page
   - PNR or booking ID
   - booking status
   - seat/class details
   - passenger summary

10. RAC / Waitlist Result Page
    - current queue status
    - explanation of next state

11. Booking History Page
    - all past and active bookings
    - status filters

12. Cancellation Flow
    - cancellation confirmation
    - post-cancellation status

## 6.2 Admin Pages

1. Admin Login Page
2. Admin Dashboard
3. Train Management Page
4. Schedule Management Page
5. Inventory Management Page
6. Load / booking monitoring page if included in project scope

## 7. Frontend Contract Definition Responsibilities

The manager specifically asked that FE define pages and define contracts to share with BE. Therefore the frontend engineer must prepare a contract pack containing the following.

## 7.1 Contract Pack Structure

For each page or user action, FE must specify:

- page name
- purpose
- route URL
- entry condition
- API endpoint needed
- request method
- query params, path params, and request body
- expected success response shape
- expected error response shape
- required loading states
- required empty states
- required permission or auth behavior

## 7.2 Contracts FE Must Send to BE

The frontend engineer must send backend a structured document for these flows:

1. Authentication contracts
   - register
   - login
   - logout
   - current user session

2. Search contracts
   - search trains
   - fetch availability for train, class, and date

3. Booking contracts
   - hold seat or hold inventory
   - initiate payment
   - confirm booking
   - fetch booking details
   - cancel booking

4. User contracts
   - booking history
   - booking status lookup

5. Admin contracts
   - create train
   - update train
   - create schedule
   - update inventory

## 7.3 Minimum Payload Fields FE Must Clarify

The frontend engineer must explicitly request these fields instead of leaving them ambiguous:

- train ID
- train number
- train name
- source and destination station names/codes
- departure and arrival time
- journey date
- class code and class label
- fare
- availability count
- availability status
- booking ID
- PNR
- payment status
- booking state
- RAC number or waitlist number if applicable
- hold expiry timestamp if applicable
- cancellation eligibility
- error code
- error message suitable for display

## 8. Frontend Functional Expectations by Flow

## 8.1 Authentication

Frontend must:

- validate inputs before API call
- store auth session securely according to project approach
- redirect authenticated users correctly
- protect user and admin routes

## 8.2 Search

Frontend must:

- allow source, destination, and date input
- validate invalid route combinations
- show loading state for search
- show repeated searches correctly even when availability changes

## 8.3 Availability

Frontend must:

- clearly distinguish between exact seat selection and class-level availability
- show status values consistently
- avoid misleading users by presenting stale data as guaranteed

## 8.4 Booking

Frontend must:

- collect passenger details
- show booking summary before payment
- handle hold expiration gracefully
- guide user if price, status, or availability changes before confirmation

## 8.5 Payment

Frontend must:

- redirect or initiate payment cleanly
- handle pending callback state
- handle failure or timeout state
- not show booking confirmed until backend confirms it

## 8.6 Booking Result

Frontend must:

- show confirmed, RAC, waitlist, expired, failed, and cancelled states clearly
- show booking identifiers only after backend response

## 8.7 Admin

Frontend must:

- separate admin navigation from passenger navigation
- validate inventory and schedule forms carefully
- provide safe feedback for create and update operations

## 9. Error and Edge Case Handling the Frontend Must Support

The frontend engineer must plan UI behavior for:

- no trains found
- availability changed after search
- seat hold expired before payment
- duplicate submit click
- payment success but confirmation pending
- payment failure
- server timeout
- unauthorized access
- stale session
- booking cancelled after prior successful state
- RAC or waitlist promotion reflected later

## 10. Frontend Acceptance Criteria

The frontend part should be considered ready only when:

- all required pages are defined and mapped to user flows
- FE contract pack has been shared to BE
- every page clearly lists required fields and API dependencies
- all major states are covered: loading, success, empty, error, expired
- protected routes are working
- admin and passenger flows are separated
- API layer is ready for backend integration
- test checklist exists for all critical flows

## 11. Frontend Recommended Work Sequence

The frontend engineer should work in this order:

1. Study project SRS and booking lifecycle
2. Prepare page inventory
3. Define route map
4. Define page-wise field requirements
5. Create API contract document and send it to BE
6. Create layout, routing, auth shell, and shared UI foundation
7. Implement authentication flow
8. Implement search and train listing
9. Implement train details and availability screens
10. Implement booking and payment flow screens
11. Implement booking history and cancellation flow
12. Implement admin module
13. Integrate edge cases and final validation

## 12. Key Frontend Risks

- assuming backend payloads without written contract approval
- showing stale availability as final truth
- confirming booking in UI before server confirmation
- missing expired hold handling
- under-documenting admin requirements
- not distinguishing confirmed, RAC, waitlist, and payment-pending states

## 13. Final Frontend Output Expected by Manager

The frontend engineer must be able to show:

- defined page list
- route flow and user journey
- page-wise data requirements
- contract document shared to backend
- implementation status by page
- known dependencies on backend APIs
- unresolved assumptions and risks
