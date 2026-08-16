# Setup Guide

This guide is based strictly on the repository’s existing implementation and scripts.

## Prerequisites

### Required
- Node.js 20.18+ or newer
- npm 10+
- PostgreSQL instance
- Redis instance
- Docker and Docker Compose for container-based local development

The frontend package declares Node >= 20.18.0 and npm >= 10.0.0 in `Frontend/package.json`.

## Backend setup

From the `Backend` folder:

```bash
npm install
cp .env.example .env
npx prisma generate
npx prisma migrate deploy
npm run dev
```

The server starts with `Backend/src/server.js` and listens on the configured `PORT` value.

## Worker setup

Run the background worker in a second terminal:

```bash
cd Backend
npm run worker
```

This starts the BullMQ worker defined in `Backend/src/queue/email.worker.js`.

## Database setup

The project uses Prisma with PostgreSQL.

Required connection string:

```env
DATABASE_URL=postgresql://taskflow:taskflow@localhost:5432/taskflow
```

The project includes Prisma migration scripts in `Backend/package.json`:

```bash
npm run prisma:migrate
npm run prisma:migrate:deploy
npm run prisma:generate
npm run prisma:studio
npm run prisma:seed
```

## Redis setup

Redis is required for BullMQ and the task-assignment queue.

Default connection string in the code:

```env
REDIS_URL=redis://localhost:6379
```

## Environment file

The repository contains `Backend/.env.example` and the app loads variables from `Backend/.env` via `dotenv`.

## Local development run order

For a working local setup:

1. Start PostgreSQL
2. Start Redis
3. Create `Backend/.env` from `.env.example`
4. Run Prisma generate and migrate
5. Start backend API
6. Start BullMQ worker

## Docker setup

From the `Backend` directory:

```bash
docker compose up --build
```

This compose file configures:
- API container
- worker container
- PostgreSQL container
- Redis container

## Validation commands

From the `Backend` folder:

```bash
npm test
```

The tests validate auth flows, cross-tenant behavior, status checks, tasks, and validation logic.

## Frontend setup

From the `Frontend` folder:

```bash
npm install
npm run dev
```

The frontend is a Vite app and uses React Router + Axios for the UI and API requests.

## Notes

- The backend app default port is `5000`.
- Swagger is available at `/api-docs` when the backend is running.
- Health check endpoint is `/health`.
- The app expects a configured PostgreSQL and Redis service before the worker and API can function correctly.
