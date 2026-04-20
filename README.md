# Train Ticket Booking System

## Overview

Train Ticket Booking System is a full-stack web application for booking train tickets with real-time seat availability, high concurrency, and robust booking workflows. It uses **MongoDB** as the main database and **Redis** for caching, session management, seat holding, and concurrency control. The project is designed for reliability, correctness, and a clear separation of frontend and backend responsibilities.

---

## Features

- User registration and login
- Train search by route and date
- Real-time seat availability
- Seat hold (temporary lock) before payment
- Booking and payment flow (with confirmation, RAC, or waitlist)
- Ticket cancellation and queue promotion
- Booking history
- Admin management for trains, schedules, and inventory
- Concurrency-safe inventory and booking logic

---

## Architecture

- **Frontend:** React-based SPA for all user and admin flows
- **Backend:** Node.js API server (see backend/)
- **MongoDB:** Main database for all persistent data (users, trains, bookings, payments, etc.)
- **Redis:** Fast cache for seat availability, session, and temporary locks

---

## Main Components

- **Frontend:** Web app for passengers and admins
- **Backend API:** Handles authentication, search, booking, payment, cancellation, and admin operations
- **MongoDB:** Stores all persistent data
- **Redis:** Manages hot data and concurrency control
- **Payment Gateway:** External service for payment processing

---

## User Roles

- **Passenger:** Register, search, book, cancel, and view booking history
- **Admin:** Manage trains, schedules, inventory, and monitor system

---

## Project Workflow

1. **Requirement Analysis:** Review SRS and define user journeys
2. **Contract Definition:** Frontend defines API contracts and shares with backend
3. **Architecture Definition:** Backend plans service split, DB schema, and Redis design
4. **UI & API Implementation:** Frontend and backend develop features in business priority order
5. **Testing & Sign-off:** Ensure correctness, concurrency safety, and user experience

---

## Documentation

- [Project Overview and Execution Plan](docs/project-overview-and-execution-plan.md)
- [Detailed SRS](docs/train-ticket-booking-srs-detailed.md)
- [Frontend Requirements](docs/frontend-requirements.md)
- [Backend Requirements](docs/backend-requirements.md)
- [API Contracts](backend/docs/api-contracts.md)
- [Database Calls](backend/docs/database-calls.md)
- [Cache Calls](backend/docs/cache-calls.md)
- [Service Architecture](backend/docs/service-architecture.md)
- [State Machine](backend/docs/state-machine.md)

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (LTS recommended)
- [MongoDB](https://www.mongodb.com/try/download/community) (local or Atlas)
- [Redis](https://redis.io/download)
- [Git](https://git-scm.com/)

### 1. Clone the Repository

```
git clone https://github.com/your-org/train-booking-project.git
cd train-booking-project
```

### 2. Setup Backend

```
cd backend
npm install
```

- Copy `.env.example` to `.env` and fill in your MongoDB and Redis connection details.
- Example `.env` variables:
  - `MONGO_URI=mongodb://localhost:27017/trainbooking`
  - `REDIS_URL=redis://localhost:6379`
  - `PORT=5000`
- Start MongoDB and Redis servers locally if not using cloud services.
- Start the backend server:

```
npm start
```

### 3. Setup Frontend

Open a new terminal:

```
cd frontend
npm install
npm run dev
```

- The frontend will run on [http://localhost:5173](http://localhost:5173) by default.
- Make sure the backend is running and accessible.

### 4. Test the Application

- Register a new user, search for trains, and try booking a ticket.
- Admin features require an admin account (see backend docs for seeding or promoting a user).

---

## Contributing

1. Read the SRS and requirements documents
2. Follow the contract-driven development process
3. Ensure all API changes are documented and versioned
4. Write tests for all major features
5. Use feature branches and pull requests for all changes

---

## License

This project is for educational and demonstration purposes. See individual files for license details.
