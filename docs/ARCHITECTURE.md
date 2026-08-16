# Architecture

## Overview

TaskFlow is a multi-tenant project and task management application. The backend is built with Node.js and Express, uses Prisma with PostgreSQL for persistence, Redis for queue transport, and a separate BullMQ worker for background processing.

The frontend is a React + Vite application for the user interface, but the authoritative business logic and authorization rules live in the backend.

## Runtime components

### 1. API server
The application entry point is `Backend/src/server.js`.

It:
- loads environment variables with `dotenv`
- connects Prisma to PostgreSQL
- starts the Express app on the configured port

The Express app is created in `Backend/src/app.js` and registers all API routes.

### 2. Prisma data layer
The Prisma schema is defined in `Backend/prisma/schema.prisma`.

The main data model includes:
- `User`
- `Organization`
- `OrgMember`
- `RefreshToken`
- `Project`
- `Task`
- `TaskAssignment`
- `Comment`

The schema includes tenant isolation via `organizationId` and uses enums for status, priority, and roles.

### 3. Authentication and tenancy
Authentication is centered around JWTs generated in `Backend/src/utils/jwt.js`.

The access flow is:
1. User registers or logs in through the auth service.
2. A signed access token and refresh token are returned.
3. Requests include the access token in the `Authorization: Bearer ...` header.
4. `auth.middleware.js` verifies the token and loads the user.
5. The middleware resolves an organization context for non-platform-admin users.

The admin model is:
- `platform_admin` — platform-level administrator
- `org_admin` — organization administrator
- `member` — standard organization user

### 4. Authorization rules
The app validates role-based access in `Backend/src/middleware/rbac.middleware.js` and `Backend/src/middleware/authz.middleware.js`.

Some actual examples from the code:
- project creation and update require `org_admin`
- task creation and updates allow `org_admin` and `member`
- delete task requires `org_admin`
- member management requires `org_admin`
- platform routes require `platform_admin`

### 5. Business services
The backend separates controllers and business logic into service modules. The main service files are:
- `auth.service.js`
- `project.service.js`
- `task.service.js`
- `member.service.js`

Responsibilities include:
- user registration / login / refresh / logout
- project CRUD
- task CRUD and assignment
- member listing and role changes
- dashboard aggregation

### 6. Background job processing
`Backend/src/queue/email.queue.js` configures a BullMQ queue named `email-notifications`.

The worker is defined in `Backend/src/queue/email.worker.js` and uses:
- Redis connection from `Backend/src/config/redis.js`
- job attempts and exponential backoff
- dead-letter queue `email-dead-letter`

Jobs are created when a task is assigned, and the worker sends assignment emails via the email service.

### 7. HTTP API layer
The API layer is organized by route modules:
- auth routes
- project routes
- task routes
- member routes
- dashboard routes
- job routes
- platform routes

These are mounted in `Backend/src/app.js`.

### 8. Validation layer
Request validation is enforced with Zod in the `Backend/src/validators/` directory:
- `auth.validator.js`
- `project.validator.js`
- `task.validator.js`

Examples of actual validation rules in the code include:
- email validation
- UUID validation for assignee and task IDs
- status and priority enum enforcement
- date-only or ISO date support for due dates

## Request flow

A typical authenticated request follows this path:

1. Client sends request to API route
2. Express route handler receives request
3. Middleware validates auth and/or role
4. Controller parses request data
5. Service queries Prisma and applies business rules
6. Response is returned to client
7. Background jobs are enqueued when needed

## Data isolation model

Regular users are associated with one or more organizations through `OrgMember` records. The auth middleware selects the organization context from the user’s memberships.

This creates a multi-tenant design where operations are scoped by `organizationId` and user membership checks are enforced before reading or mutating data.

## Deployment topology

The Docker setup in `Backend/docker-compose.yml` defines:
- `api` service
- `worker` service
- `postgres` service
- `redis` service

This is a local development container layout, not a production deployment manifest.

## Observed strengths

- Clear separation between routes, controllers, services, and persistence
- Multi-tenant scoping enforced in the backend
- Role-based access controls implemented at the router level
- Background work isolated in a worker process
- Prisma schema supports tenant-safe task workflows

## Observed gaps

The codebase is functional but the repo currently emphasizes implementation over documentation. The missing documentation items are mostly in the docs directory rather than a missing platform capability.
