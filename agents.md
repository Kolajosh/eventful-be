# Eventful Backend -- Code Architecture & Agent Guidelines (Full Version)

This document defines how AI agents and developers must structure,
implement, and extend the Eventful backend system.

It includes detailed architecture rules, module boundaries, security
requirements, caching strategy, database design principles, and
development workflow.

---

# 1. System Overview

Eventful backend powers:

- Authentication & Authorization (JWT + RBAC)
- Event creation & discovery
- Ticket purchasing
- QR generation & validation
- Payment processing (Paystack)
- Reminder scheduling
- Notifications
- Analytics dashboards
- Caching & performance optimization
- Rate limiting & abuse prevention

Architecture style: **Modular Monolith**

---

# 2. Tech Stack

## Core

- Runtime: Node.js
- Language: TypeScript (Strict Mode)
- Framework: Express
- Database: PostgreSQL
- ORM: Prisma
- Cache: Redis
- Background Jobs: BullMQ
- Auth: JWT (Access + Refresh Tokens)
- Validation: Zod
- API Docs: OpenAPI (Swagger)
- Testing: Jest or Vitest + Supertest

---

# 3. Folder Structure

/ ├── src/ │ ├── app.ts │ ├── server.ts │ ├── config/ │ ├── modules/ │ │
├── auth/ │ │ ├── users/ │ │ ├── events/ │ │ ├── tickets/ │ │ ├──
payments/ │ │ ├── notifications/ │ │ ├── analytics/ │ │ └── qr/ │ ├──
middleware/ │ ├── utils/ │ ├── jobs/ │ ├── docs/ │ └── types/ ├──
prisma/ ├── tests/ │ ├── unit/ │ └── integration/ ├── .env ├──
package.json └── tsconfig.json

---

# 4. Architecture Principles

## 4.1 Layered Pattern

Controller → Service → Database

Controllers: - Validate input - Handle HTTP - Return formatted response

Services: - Contain business logic - Manage DB operations - Handle cache
logic - Call external APIs

Never place business logic inside controllers.

---

## 4.2 Caching Strategy

Use Redis for:

- Event listing
- Event details
- Analytics summaries

Pattern: - Read-through cache - Invalidate cache after: - Event update -
Ticket purchase - Payment confirmation

---

## 4.3 Rate Limiting

Apply to:

- Auth endpoints
- Payment initialization
- Ticket purchase
- QR validation
- Public event listing

Redis-backed limiter required.

---

## 4.4 Background Jobs

Use BullMQ for:

- Event reminders
- Email notifications
- Delayed tasks

Flow: 1. Save reminder rule 2. Add job to queue 3. Worker executes at
scheduled time 4. Notification sent

---

# 5. Domain Modules

## 5.1 Auth Module

Responsibilities:

- Register user (CREATOR or EVENTEE)
- Login
- Refresh token
- Enforce RBAC

Security:

- Hash passwords (bcrypt)
- Short-lived access tokens
- Validate JWT on protected routes

---

## 5.2 Events Module

Creators:

- Create event
- Edit event
- Delete event
- View own events

Eventees:

- View public events
- View event details

Use cache for public listings.

---

## 5.3 Tickets Module

Purchase Flow:

1.  Initialize payment
2.  Await webhook confirmation
3.  Create ticket
4.  Generate QR
5.  Update analytics

Rules:

- One ticket per purchase
- Prevent overselling using transactions
- QR valid once only

---

## 5.4 QR Module

Requirements:

- Unique QR per ticket
- Encode:
  - ticketId
  - eventId
  - signature

Validation:

- Confirm ticket exists
- Confirm not already scanned
- Confirm correct event
- Mark scanned

---

## 5.5 Payments Module

Responsibilities:

- Initialize Paystack transaction
- Verify webhook signature
- Store payment record
- Update ticket status

Never trust frontend payment confirmation.

---

## 5.6 Notifications Module

Types:

- Event reminder
- Ticket confirmation
- Event cancellation

Queue-based scheduling required.

---

## 5.7 Analytics Module

Global:

- Total events
- Tickets sold
- Revenue
- Total QR scans

Per Event:

- Tickets sold
- Tickets scanned
- Attendance rate
- Revenue

Heavy queries must be cached.

---

# 6. Database Design Rules

- Use proper indexing:
  - event_id
  - user_id
  - payment_reference
- Use transactions for:
  - Ticket purchase
  - Payment confirmation
- Prevent race conditions using row-level locking

---

# 7. API Standards

Base URL:

/api/v1

Success Response:

{ "success": true, "message": "Request successful", "data": {} }

Error Response:

{ "success": false, "message": "Error message", "error": {} }

---

# 8. Coding Standards

- Strict TypeScript
- No any
- Explicit return types
- kebab-case files
- PascalCase classes
- camelCase variables

---

# 9. Testing Requirements

Unit Tests:

- Auth logic
- Payment verification
- QR validation
- Ticket purchase

Integration Tests:

- Full purchase flow
- Webhook handling
- Event creation flow

Minimum 70% coverage.

---

# 10. Development Workflow

1.  Understand requirement
2.  Plan DTOs, validation, services, tests
3.  Implement route → controller → service
4.  Add caching and rate limiting
5.  Write tests
6.  Update OpenAPI documentation
7.  Validate edge cases

---

# 11. Non-Negotiables

- Always verify payment webhook
- Always validate inputs
- Always enforce RBAC
- Always use transactions for payment + ticket flow
- Never expose internal errors
