# Backend Cache Calls (Redis)

This document maps the exact caching mechanisms and distributed lock patterns using Redis to support the train booking system's concurrency requirements.

## 1. Redis Responsibilities
- Session storage (optional, or JWT blacklist).
- Caching search results (to offload DB).
- Caching availability summary (read-heavy).
- Seat hold locks (preventing double booking).
- Rate Limiting (preventing DDOS on search/payment endpoints).

## 2. Key Structures and TTLs

### 2.1 Session & Rate Limiting
- **Key:** `rate_limit:{ip_or_user_id}:{endpoint}`
- **Type:** String (Integer increment)
- **TTL:** 1 minute.
- **Usage:** Increment request counter, reject if threshold crossed.

### 2.2 Search Cache
- **Key:** `search:{src}:{dest}:{date}`
- **Type:** JSON String / Hash
- **TTL:** 5 - 15 minutes.
- **Usage:** Reused across multiple passenger queries seeking the same route. Invalidation is generally TTL-driven since train schedules rarely change intro-day.

### 2.3 Availability Cache
- **Key:** `inventory:{train_id}:{date}`
- **Type:** Hash (Class code mapping to available counts)
- **TTL:** 1-5 minutes, manually invalidated on booking confirmation.
- **Usage:** Fast path for train capacity queries.

### 2.4 Seat Hold Locks (Crucial)
- **Key:** `hold:{train_id}:{date}:{class_code}:{user_id}`
- **Type:** Hash or String with passenger count.
- **TTL:** Exactly 10 minutes (Expiry matches business requirement).
- **Usage:** 
  1. Before allowing passenger details entry, frontend requests a "Hold".
  2. Backend runs a Redis Lua Script to atomically check if `requested_seats <= (total_seats_capacity - currently_locked_seats)`.
  3. If true, issue lock, block capacity from other searchers.
  4. Wait for payment. If TTL expires, the hold auto-releases, restoring available capacity functionally.

## 3. Cache Fallback and rules
- Redis must never act as the sole source of truth for completed payments or confirmed tickets.
- If Redis crashes, the application falls back to DB availability checks. Temporary suspension of "Hold" flow may be applied, switching to "First Payment Wins" optimistic concurrency as a degraded state.
