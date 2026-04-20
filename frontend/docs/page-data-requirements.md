# Page Data Requirements

This document outlines the strictly required frontend data fields that must be provided directly by the backend to prevent frontend assumption errors or misalignment with backend core logic.

## 1. Train Entity
*Used in Search Results and History pages.*
- `train_id`: String UUID or unique string identifier.
- `train_number`: Formatted train code (e.g. "12615").
- `train_name`: Full display name (e.g. "Grand Trunk Express").
- `source_station_name` / `source_station_code`: E.g. "New Delhi (NDLS)".
- `destination_station_name` / `destination_station_code`: E.g. "Chennai Central (MAS)".
- `departure_time`: Formatted or ISO string.
- `arrival_time`: Formatted or ISO string.
- `journey_date`: Original requested date.

## 2. Seat Availability Details
*Used in Train Details page.*
- `class_code`: "1A", "2A", "3A", "SL".
- `class_label`: Human-readable class name.
- `fare`: Numeric value.
- `availability_status`: Must be one of `["AVAILABLE", "RAC", "WAITLIST", "FULL"]`.
- `availability_count`: Number of seats or ranking in waitlist/RAC.

## 3. Booking / Ticket State
*Used in Bookings Review, Confirmation, cancellation and History.*
- `booking_id`: Unique system ID.
- `pnr`: Generated 10 digit number for confirmed/RAC tickets.
- `booking_state`: Must be one of `["PENDING", "CONFIRMED", "RAC", "WAITLIST", "CANCELLED", "EXPIRED"]`.
- `payment_status`: Must be one of `["PENDING", "SUCCESS", "FAILED"]`.
- `hold_expiry_timestamp`: Absolute timestamp from backend defining when seat hold expires.
- `cancellation_eligibility`: Boolean indicating if a "Cancel" button is allowed.
- `error_code` / `error_message`: Displayable error context securely forwarded from BE validation.
