# Eventful Backend

Eventful is a robust event management and ticketing system backend built with Node.js, Express, and TypeScript. It features secure authentication, role-based access control, payment integration with Paystack, and background job processing for notifications.

## 🚀 Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Caching/Queues**: Redis
- **Background Jobs**: BullMQ
- **Payments**: Paystack
- **Validation**: Zod
- **Authentication**: JWT & Bcrypt

## 🛠️ Prerequisites

Ensure you have the following installed:

- [Node.js](https://nodejs.org/) (v16+)
- [PostgreSQL](https://www.postgresql.org/)
- [Redis](https://redis.io/)

## 📦 Setup & Installation

1.  **Clone the repository:**

    ```bash
    git clone <repository-url>
    cd eventful
    ```

2.  **Install dependencies:**

    ```bash
    npm install
    ```

3.  **Configure Environment Variables:**
    Create a `.env` file in the root directory and add:

    ```env
    PORT=3000
    DATABASE_URL="postgresql://user:password@localhost:5432/eventful_db"
    JWT_SECRET="your_super_secret_jwt_key"
    PAYSTACK_SECRET_KEY="your_paystack_secret_key"
    REDIS_HOST="localhost"
    REDIS_PORT=6379
    ```

4.  **Run Database Migrations:**

    ```bash
    npx prisma migrate dev --name init
    ```

5.  **Start the Server:**
    ```bash
    npm run dev
    ```

## 📡 API Endpoints

### Authentication

- `POST /api/v1/auth/register` - Register a new user (`EVENTEE` or `CREATOR`).
- `POST /api/v1/auth/login` - Login and receive JWT.
- `GET /api/v1/auth/me` - Get current user profile (Protected).

### Events

- `GET /api/v1/events` - List all public events (Pagination: `?page=1&limit=10`).
- `GET /api/v1/events/:id` - Get details of a specific event.
- `POST /api/v1/events` - Create a new event (**Creator Only**).
- `GET /api/v1/events/creator/my-events` - List events created by the logged-in user (**Creator Only**).
- `PUT /api/v1/events/:id` - Update an event (**Owner Only**).
- `DELETE /api/v1/events/:id` - Delete an event (**Owner Only**).

### Tickets & QR Codes

- `GET /api/v1/tickets/my-tickets` - List purchased tickets for the logged-in user.
- `POST /api/v1/tickets/validate` - Validate a ticket QR code (**Creator Only**). Use this endpoint to scan user tickets at the venue.

### Payments (Paystack)

- `POST /api/v1/payments/initialize` - Initialize a ticket purchase. Returns Paystack authorization URL.
  - Body: `{ "eventId": "uuid" }`
- `POST /api/v1/payments/webhook` - Endpoint for Paystack to confirm payments. Simultaneously creates the ticket and queues an email notification.

### Notifications

- **Email Worker**: Contains a background worker (BullMQ) that listens for `send-email` jobs triggered by successful payments.
- **Console Mock**: Currently logs emails to the console for development.

## 🧪 Testing

Run unit and integration tests:

```bash
npm test
```

## 📄 License

MIT
