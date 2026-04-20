# Frontend User Flow

This document outlines the main user journeys for the Train Ticket Booking System.

## Passenger Flow

```mermaid
graph TD
    A[Home / Landing Page] --> B{Search Trains}
    B --> C[Search Results Page]
    C -->|Select Train| D[Train Details & Availability]
    
    D -->|Select Class / Seat| E{Logged In?}
    E -->|No| F[Login / Register]
    F --> G[Redirect back to Booking]
    E -->|Yes| G[Passenger Details / Booking Form]
    
    G --> H[Booking Review / Seat Hold]
    H -->|Confirm| I[Payment Pending]
    H -->|Hold Expired| J[Hold Expired State - Redirect to Search]
    
    I -->|Payment Success| K[Booking Confirmation / RAC / Waitlist Result]
    I -->|Payment Failed| L[Payment Failure State - Retry Payment]
    
    K --> M[Booking History]
```

## Admin Navigation Flow

```mermaid
graph TD
    A[Admin Login] -->|Success| B[Admin Dashboard]
    B --> C[Train Management]
    B --> D[Schedule Management]
    B --> E[Inventory Management]
```

## Special Edge Case Flows

- **Cancellation:**
  - `Booking History` -> Select Active Booking -> `Cancel Action` -> Confirm -> `Cancellation Result Page`.
- **Availability Change:**
  - `Search Results` -> `Train Details` -> if stale, show real-time change -> Update UI to reflect Waitlist/RAC.
- **Seat Hold Timeout:**
  - Timer active on `Booking Review`. If reaches 0: user is prompted to restart search.
