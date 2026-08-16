# TaskFlow Backend

TaskFlow is a multi-tenant project and task management backend built with Node.js, Express, Prisma, PostgreSQL, Redis, and BullMQ.

## Features

- Multi-tenant organization model with org member roles
- User registration, login, refresh, and logout flows
- JWT access and refresh tokens with DB revocation
- Project CRUD scoped by organization
- Task CRUD, filtering, pagination, assignment, and dashboard summary
- Redis + BullMQ background job processing for assignment notifications
- Swagger UI documentation
- Docker Compose setup for API, worker, PostgreSQL, and Redis

## Tech stack

- Node.js + Express
- PostgreSQL + Prisma
- Redis + BullMQ
- Zod validation
- Swagger UI

## Environment variables

Copy the example file and configure the values for your environment:

```bash
cp .env.example .env
```

## Run locally

```bash
npm install
npx prisma generate
npx prisma migrate deploy
npm run dev
```

## Run the worker

```bash
npm run worker
```

## Run tests

```bash
npm test
```

## Seed data

```bash
npm run prisma:seed
```

## Docker

```bash
docker compose up --build
```

This brings up the API, worker, Postgres, and Redis containers.
