# EventEase

EventEase is a full-stack event booking platform with role-based experiences for attendees and organizers.

- Attendees can browse upcoming events, purchase tickets, and view their booked tickets.
- Organizers can create events and monitor sales analytics.
- The backend supports Stripe checkout, PostgreSQL persistence, Redis-backed background jobs, and email ticket receipts.

## Tech Stack

Frontend
- React (Vite)
- React Router
- Axios
- Tailwind CSS

Backend
- Node.js + Express
- PostgreSQL (pg)
- Redis + BullMQ
- JWT authentication with HTTP-only cookies
- Stripe
- Nodemailer

Infrastructure
- Docker Compose for PostgreSQL and Redis

## Project Structure

- backend: Express API, database logic, authentication, booking/payment logic, queue worker
- frontend: React app with attendee and organizer dashboards
- docker-compose.yml: local PostgreSQL and Redis services

## Prerequisites

- Node.js 18+
- npm
- Docker Desktop (for PostgreSQL + Redis)
- Stripe account and secret key (for checkout)
- Gmail account app password (for email receipts)

## Quick Start

1. Start PostgreSQL and Redis

   From the project root:

   docker compose up -d

2. Install backend dependencies

   cd backend
   npm install

3. Create backend environment file

   Create backend/.env with values similar to:

   PORT=8000
   CORS_ORIGIN=http://localhost:5173
   DATABASE_URL=postgresql://postgres:YOUR_DB_PASSWORD@localhost:5433/eventease
   ACCESS_TOKEN_SECRET=replace_with_long_random_secret
   ACCESS_TOKEN_EXPIRY=1d
   REFRESH_TOKEN_SECRET=replace_with_long_random_secret
   REFRESH_TOKEN_EXPIRY=7d
   REDIS_HOST=127.0.0.1
   REDIS_PORT=6379
   STRIPE_SECRET_KEY=sk_test_xxx
   SMTP_USER=youremail@gmail.com
   SMTP_PASS=your_gmail_app_password

4. Initialize database tables

   From backend:

   node src/db/init.js

5. Start backend server

   From backend:

   npm run dev

6. Install frontend dependencies

   Open a new terminal:

   cd frontend
   npm install

7. Start frontend

   From frontend:

   npm run dev

8. Open the app

   Frontend: http://localhost:5173
   Backend API base: http://localhost:8000/api/v1

## Environment Variables

Backend variables used by the API:

- PORT: API port (default 8000)
- CORS_ORIGIN: allowed frontend origin
- DATABASE_URL: PostgreSQL connection string
- ACCESS_TOKEN_SECRET: JWT secret for access tokens
- ACCESS_TOKEN_EXPIRY: access token lifetime (for example 1d)
- REFRESH_TOKEN_SECRET: JWT secret for refresh tokens
- REFRESH_TOKEN_EXPIRY: refresh token lifetime (for example 7d)
- REDIS_HOST: Redis host for BullMQ
- REDIS_PORT: Redis port for BullMQ
- STRIPE_SECRET_KEY: Stripe secret key for checkout sessions
- SMTP_USER: sender email for receipt emails
- SMTP_PASS: sender app password for SMTP

Docker compose reads POSTGRES_PASSWORD from root .env for the database container.

## API Endpoints

Base URL: /api/v1

User
- POST /users/register
- POST /users/login
- POST /users/logout (auth)
- POST /users/refresh-token

Events
- POST /events/create (auth)
- GET /events/all
- GET /events/analytics (auth, organizer view)

Bookings
- POST /bookings/create-checkout-session (auth)
- POST /bookings/book (auth)
- GET /bookings/my-tickets (auth)

## Authentication Notes

- Login sets accessToken and refreshToken cookies.
- Protected routes require a valid access token.
- In local development, if secure cookies cause auth issues over http, adjust cookie options in backend controller logic to fit your environment.

## Common Commands

Backend
- npm run dev

Frontend
- npm run dev
- npm run build
- npm run preview
- npm run lint

Docker
- docker compose up -d
- docker compose down

## Typical Flow

Attendee
1. Register or log in.
2. Browse upcoming events.
3. Start Stripe checkout.
4. Complete booking.
5. View purchased tickets in dashboard.

Organizer
1. Register as organizer and log in.
2. Create events.
3. Track ticket sales and revenue in analytics.

## Troubleshooting

- Database connection errors: verify DATABASE_URL and that PostgreSQL is running on port 5433.
- Queue or email errors: verify Redis is running and SMTP_USER/SMTP_PASS are valid.
- Stripe checkout errors: verify STRIPE_SECRET_KEY.
- CORS/auth problems: verify CORS_ORIGIN matches frontend URL and check cookie security settings for local HTTP.

