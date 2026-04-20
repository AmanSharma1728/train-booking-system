# Frontend Page Inventory

This document defines the list of pages, their purpose, routing URLs, and the required UI states.

## Passenger Pages

| Page Name | Purpose | Route URL | Entry Condition | Required States |
| --- | --- | --- | --- | --- |
| **Landing/Home** | Search trains, entry to login/register | `/` | Public | Form Validation, Loading |
| **Register** | Account creation | `/register` | Public (Unauthenticated) | Form Validation, Loading, Error |
| **Login** | User authentication | `/login` | Public (Unauthenticated) | Form Validation, Error (Invalid Auth) |
| **Search Results** | List matching trains and basic availability | `/search` | Public | Loading, Empty (No trains), Error |
| **Train Details & Availability** | Detailed seat availability status, class selection | `/train/:id` | Public | Loading, Auto-refresh State |
| **Passenger Details (Booking)** | Collect passenger info and confirm class | `/booking` | Authenticated | Form Validation |
| **Booking Review (Hold)** | Review seat hold, check timer, proceed to pay | `/booking/:id/review` | Authenticated, Active Hold | Timer/Expiry State, Fare Summary |
| **Payment Status** | Handle payment redirect and callback | `/payment` | Authenticated, Payment Initiated | Pending, Success, Failure, Timeout |
| **Booking Confirmation** | Show PNR, booking ID, final status | `/booking/confirmation` | Authenticated, Post-Payment | Confirmed, RAC, Waitlist States |
| **RAC/Waitlist Result** | Show queue status and next steps | `/booking/rac` | Authenticated | Expected clearance text |
| **Booking History** | List all past and active bookings | `/history` | Authenticated | Loading, Empty, Status Filters |
| **Cancellation Flow** | Cancellation confirmation and post-cancel status | `/cancel` | Authenticated, Active Booking | Cancellation feedback |

## Admin Pages

| Page Name | Purpose | Route URL | Entry Condition | Required States |
| --- | --- | --- | --- | --- |
| **Admin Login** | Secure access for administrators | `/admin/login` | Public (Unauthenticated) | Form Validation |
| **Admin Dashboard** | High-level metrics | `/admin/dashboard` | Authenticated (Admin only) | Loading |
| **Train Management** | Create/Update trains | `/admin/trains` | Authenticated (Admin only) | Validation, Success feedback |
| **Schedule Management** | Manage routes and times | `/admin/schedules` | Authenticated (Admin only) | Validation, Error |
| **Inventory Management** | Manage seats and availability | `/admin/inventory` | Authenticated (Admin only) | Load/Booking monitoring, Success |
