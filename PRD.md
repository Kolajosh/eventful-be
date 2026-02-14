# Eventful – Product Requirements Document (PRD)

## 1. Product Overview

### 1.1 Product Name

**Eventful**

### 1.2 Vision

Eventful is more than just a ticketing platform; it’s a passport to unforgettable moments. From concerts and theater performances to sports events and cultural gatherings, Eventful enables seamless event discovery, ticket purchasing, and secure event access through QR validation.

### 1.3 Goals

- Enable creators to create and manage events.
- Enable users (eventees) to discover and attend events.
- Provide secure ticketing with QR verification.
- Deliver actionable analytics to creators.
- Ensure seamless payments via :contentReference[oaicite:0]{index=0}.
- Maintain performance, security, and scalability best practices.

---

# 2. User Roles

## 2.1 Event Creator

- Create, edit, delete events.
- View events they created.
- View eventees who applied or bought tickets.
- Access analytics (global + per event).
- View payment records.

## 2.2 Eventee (User)

- Browse available events.
- Purchase tickets.
- Receive QR code for access.
- Set reminders.
- Share events.
- View events they are attending.

---

# 3. Functional Requirements

## 3.1 Authentication & Authorization

### Requirements

- Users must register and login.
- JWT-based authentication.
- Role-based access control (RBAC): `CREATOR`, `EVENTEE`.
- Password hashing using bcrypt.
- Token expiration and refresh token flow.

### Creator Capabilities

- View only events they created.
- View attendees for their events.
- View payment details of their events.

### Eventee Capabilities

- View all public events.
- View purchased tickets.
- Access their QR codes.
- Set reminders.

---

## 3.2 Event Management

### Event Creation Fields

- Event ID
- Title
- Description
- Category
- Location (Physical/Virtual)
- Event Date & Time
- Ticket Price
- Ticket Limit
- Reminder Options (creator-defined)
- Cover Image
- Status (Draft, Published, Cancelled)

### Event Visibility

- Public events visible to all users.
- Drafts visible only to creators.

---

## 3.3 Ticket Purchase & QR Code Generation

### Purchase Flow

1. Eventee selects event.
2. Initiates payment.
3. Payment verified via webhook.
4. Ticket record created.
5. Unique QR code generated.

### QR Code Requirements

- Unique per ticket.
- Encodes ticket ID + user ID.
- Stored securely.
- Used at event entrance for validation.
- One-time scan validation system.

### QR Scan Validation

- Verify ticket validity.
- Confirm event match.
- Confirm not previously scanned.
- Mark ticket as “used” after scan.

---

## 3.4 Payment Integration

### Payment Provider

- Integrate with Paystack.

### Requirements

- Initialize transaction.
- Redirect to payment gateway.
- Handle webhook verification.
- Store transaction reference.
- Store payment status (`pending`, `successful`, `failed`).
- Optional refund logic (Post-MVP).

### Creator Payment View

- Total revenue (global).
- Revenue per event.
- Payment breakdown.
- Transaction references.

---

## 3.5 Notifications & Reminders

### Creator-Defined Reminder

- 1 day before
- 3 days before
- 1 week before
- Custom offset

### Eventee Custom Reminder

- Email reminder
- In-app reminder
- Optional SMS (future scope)

### Notification Types

- Event reminder
- Payment confirmation
- Ticket confirmation
- Event cancellation notice

### Scheduling

- Background job processor (e.g., queue system).
- Store reminder schedule in DB.
- Trigger notification engine.

---

## 3.6 Shareability

- Generate shareable event link.
- Open Graph metadata support.
- Share buttons:
  - Twitter/X
  - Facebook
  - WhatsApp
  - LinkedIn
  - Copy Link

---

## 3.7 Analytics

### Global Creator Analytics

- Total events created.
- Total tickets sold (all time).
- Total revenue.
- Total attendees (QR validated).

### Per Event Analytics

- Tickets sold.
- Tickets scanned.
- Revenue generated.
- Attendance rate (% scanned vs sold).

### Dashboard Metrics

- Sales over time (line graph).
- Attendance per event (bar chart).
- Conversion rate (views → purchases).

---

# 4. Non-Functional Requirements

## 4.1 Performance

- Use caching layer (Redis recommended).
- Cache:
  - Event listings
  - Event details
  - Analytics summary
- Reduce frequent DB hits.

## 4.2 Security

- JWT authentication.
- Rate limiting per IP.
- Input validation (Zod / Joi).
- Prevent double ticket purchase race conditions.
- Secure webhook verification.
- Encrypted secrets storage.

## 4.3 Scalability

- Modular architecture.
- Service separation:
  - Auth service
  - Event service
  - Payment service
  - Notification service
- Stateless API.

## 4.4 Testing

- Unit tests:
  - Auth logic
  - Payment verification
  - QR validation
- Integration tests:
  - Ticket purchase flow
  - Payment webhook
  - Reminder scheduler
- Minimum 70% coverage target.

## 4.5 Rate Limiting

Apply to:

- Auth endpoints
- Payment initialization
- QR validation endpoint
- Public event listing

---

# 5. Technical Requirements

## Backend Stack

- Node.js
- TypeScript
- Express
- PostgreSQL
- Redis (caching)
- Background Job Processor (BullMQ or similar)

## API Documentation

- OpenAPI (Swagger)
- Postman collection
- Versioned API (`/api/v1`)
- Clearly defined request/response schemas

---

# 6. Database Schema (High-Level)

## Users

- id
- name
- email
- password_hash
- role
- created_at

## Events

- id
- creator_id
- title
- description
- date
- location
- ticket_price
- ticket_limit
- status

## Tickets

- id
- event_id
- user_id
- qr_code
- is_scanned
- purchased_at

## Payments

- id
- user_id
- event_id
- amount
- status
- transaction_reference
- created_at

## Reminders

- id
- event_id
- user_id
- scheduled_time
- reminder_type

---

# 7. API Endpoints (High-Level)

## Auth

- POST `/auth/register`
- POST `/auth/login`

## Events

- POST `/events`
- GET `/events`
- GET `/events/:id`
- PUT `/events/:id`
- DELETE `/events/:id`

## Tickets

- POST `/tickets/purchase`
- GET `/tickets/my`
- POST `/tickets/validate`

## Payments

- POST `/payments/initialize`
- POST `/payments/webhook`

## Analytics

- GET `/analytics/global`
- GET `/analytics/event/:id`

---

# 8. Success Metrics

- % of successful ticket purchases.
- QR validation success rate.
- Creator retention rate.
- Event attendance rate.
- Average tickets sold per event.

---

# 9. Future Enhancements (Post-MVP)

- Multi-ticket purchase bundles.
- Discount codes.
- Refund processing.
- SMS reminders.
- Event waitlists.
- Multi-organizer support.
- Mobile app.
